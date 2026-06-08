import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

export const VERSION = 'v0.7.0-preview';
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UPLOAD_TOOL_ROOT = '/Users/liuchunqian/Desktop/codexwork/文物故事批量上传程序/cms-cos-upload/cms-cos-upload/assets/node-upload';
const UPLOAD_CONFIG_PATH = path.join(UPLOAD_TOOL_ROOT, 'config/default.json');
const WORK_ROOT = path.join(PROJECT_ROOT, '.asset-upload', VERSION);
const STAGING_DIR = path.join(WORK_ROOT, 'staging');
const RESULTS_DIR = path.join(WORK_ROOT, 'results');
const MANIFEST_PATH = path.join(WORK_ROOT, 'manifest.json');
const INVENTORY_DIR = path.join(PROJECT_ROOT, 'docs/asset-inventory');
const INVENTORY_XLSX_PATH = path.join(INVENTORY_DIR, `${VERSION}-assets.xlsx`);

const XLSX = require(path.join(UPLOAD_TOOL_ROOT, 'node_modules/xlsx'));
const imageSize = require(path.join(UPLOAD_TOOL_ROOT, 'node_modules/image-size'));

const SOURCE_FILES = [
  'src/data/siteContent.js',
  'src/components/Nav.jsx',
  'src/sections/Hero.jsx',
  'src/sections/Company.jsx',
  'src/sections/Solution.jsx',
  'src/sections/DeviceDashboard.jsx',
  'src/sections/PlatformCases.jsx',
  'src/sections/TailCasesCooperation.jsx',
  'src/sections/TailPartnersContact.jsx',
  'src/sections/ReconstructionShowcase.jsx',
  'src/styles/base.css',
];

const RUNTIME_PREFIXES = ['/assets/', '/home-assets/', '/home-required-assets/', '/draco/'];
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.webm']);
const MODEL_EXTENSIONS = new Set(['.glb']);
const SUPPORT_EXTENSIONS = new Set(['.js', '.wasm']);
const DRACO_JS_DECODER_FILES = ['draco_decoder.js'];
const RUNTIME_ASSET_RE = /\/(?:assets|home-assets|home-required-assets|draco)\/[^'"`)\s]+/g;
const CSS_URL_RE = /url\((["']?)(\/(?:assets|home-assets|home-required-assets|draco)\/[^"')]+)\1\)/g;

export function isRuntimeAssetUrl(value) {
  if (!value || typeof value !== 'string') return false;
  if (/^https?:\/\//.test(value)) return false;
  const clean = stripQuery(value);
  if (clean.includes('${') || clean.includes('{') || clean.includes('}')) return false;
  if (clean.startsWith('/visual-previews/')) return false;
  return RUNTIME_PREFIXES.some((prefix) => clean.startsWith(prefix));
}

export function stripQuery(value) {
  return String(value).split('?')[0].split('#')[0];
}

export function classifyAssetType(assetUrl) {
  const ext = path.extname(stripQuery(assetUrl)).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (VIDEO_EXTENSIONS.has(ext)) return 'video';
  if (MODEL_EXTENSIONS.has(ext)) return 'model';
  if (SUPPORT_EXTENSIONS.has(ext)) return 'support';
  return 'other';
}

export function buildAssetId(prefix, index) {
  return `${prefix}-${String(index).padStart(3, '0')}`;
}

export function flattenUploadName(assetId, assetUrl) {
  const clean = stripQuery(assetUrl).replace(/^\//, '').replace(/\//g, '__');
  return `${assetId}__${clean}`;
}

export function resolveRuntimeAssetPath(projectRoot, assetUrl) {
  return path.join(projectRoot, 'public', stripQuery(assetUrl).replace(/^\//, ''));
}

function normalizeAssetUrl(assetUrl) {
  return stripQuery(assetUrl).replace(/\\'/g, "'");
}

function collectLiteralRuntimeUrls(text) {
  const found = new Set();
  for (const match of text.matchAll(RUNTIME_ASSET_RE)) {
    const clean = normalizeAssetUrl(match[0]);
    if (isRuntimeAssetUrl(clean) && path.extname(clean)) found.add(clean);
  }
  for (const match of text.matchAll(CSS_URL_RE)) {
    const clean = normalizeAssetUrl(match[2]);
    if (isRuntimeAssetUrl(clean) && path.extname(clean)) found.add(clean);
  }
  return found;
}

async function readText(filePath) {
  return fs.readFile(filePath, 'utf8');
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function formatMb(bytes) {
  return Number((bytes / 1024 / 1024).toFixed(3));
}

function getModuleForAsset(assetUrl) {
  if (assetUrl.includes('/partners-transparent/')) return '合作伙伴';
  if (assetUrl.includes('/company-artifacts/') || assetUrl.includes('company-')) return '公司介绍';
  if (assetUrl.includes('/cases/') || assetUrl.includes('案例-')) return '应用案例';
  if (assetUrl.includes('/platform-showcase') || assetUrl.includes('平台') || assetUrl.includes('流通') || assetUrl.includes('档案')) return '平台方案';
  if (assetUrl.includes('/device-') || assetUrl.includes('equipment-video')) return '采集设备';
  if (assetUrl.includes('/recon') || assetUrl.includes('/draco/')) return '3D重建';
  if (assetUrl.includes('shanhai-app-logo-loop') || assetUrl.includes('shanhai-logo')) return '首页/导航';
  return '通用';
}

function getUsage(assetUrl, assetType) {
  if (assetUrl.includes('/draco/')) return 'Three.js Draco 解码支持文件';
  if (assetUrl.endsWith('.glb')) return '3D 重建展示模型';
  if (assetUrl.includes('/partners-transparent/')) return '合作伙伴 logo 跑马灯';
  if (assetUrl.includes('/cases/')) return assetType === 'video' ? '案例区循环视频' : '案例区封面/拼图素材';
  if (assetUrl.includes('/company-artifacts/')) return '公司介绍文物浮层';
  if (assetUrl.includes('/home-required-assets/')) return '解决方案/平台/案例截图素材';
  if (assetUrl.includes('/home-assets/')) return '设备/平台/3D 模块素材';
  if (assetUrl.includes('/assets/')) return '页面基础视觉素材';
  return '运行时素材';
}

async function collectDynamicPartnerAssets(assetMap) {
  const partnerDir = path.join(PROJECT_ROOT, 'public/assets/partners-transparent');
  const files = (await fs.readdir(partnerDir)).filter((name) => /\.(png|webp)$/i.test(name)).sort();
  for (const fileName of files) {
    const assetUrl = `/assets/partners-transparent/${fileName}`;
    addAssetRef(assetMap, assetUrl, {
      sourceFile: 'src/sections/TailPartnersContact.jsx',
      sourceKind: 'dynamic-partner-logo',
    });
  }
}

async function collectDracoSupportAssets(assetMap) {
  const dracoDir = path.join(PROJECT_ROOT, 'public/draco');
  const existingFiles = new Set(await fs.readdir(dracoDir));
  for (const fileName of DRACO_JS_DECODER_FILES.filter((name) => existingFiles.has(name))) {
    const assetUrl = `/draco/${fileName}`;
    addAssetRef(assetMap, assetUrl, {
      sourceFile: 'src/sections/ReconstructionShowcase.jsx',
      sourceKind: 'draco-js-decoder-path',
    });
  }
}

function addAssetRef(assetMap, assetUrl, source) {
  const clean = normalizeAssetUrl(assetUrl);
  if (!isRuntimeAssetUrl(clean)) return;
  if (!assetMap.has(clean)) {
    assetMap.set(clean, {
      assetUrl: clean,
      sources: [],
    });
  }
  assetMap.get(clean).sources.push(source);
}

export async function collectRuntimeAssets() {
  const assetMap = new Map();

  for (const relativeFile of SOURCE_FILES) {
    const absoluteFile = path.join(PROJECT_ROOT, relativeFile);
    if (!(await fileExists(absoluteFile))) continue;
    const text = await readText(absoluteFile);
    const urls = collectLiteralRuntimeUrls(text);
    for (const assetUrl of urls) {
      addAssetRef(assetMap, assetUrl, {
        sourceFile: relativeFile,
        sourceKind: 'literal',
      });
    }
  }

  await collectDynamicPartnerAssets(assetMap);
  await collectDracoSupportAssets(assetMap);

  const assets = [];
  let index = 1;
  for (const entry of Array.from(assetMap.values()).sort((a, b) => a.assetUrl.localeCompare(b.assetUrl, 'zh-Hans-CN'))) {
    const assetType = classifyAssetType(entry.assetUrl);
    const prefix = assetType === 'model' ? 'model' : assetType === 'support' ? 'support' : entry.assetUrl.includes('/partners-transparent/') ? 'partner-logo' : 'asset';
    const assetId = buildAssetId(prefix, index);
    const localPath = resolveRuntimeAssetPath(PROJECT_ROOT, entry.assetUrl);
    const uploadName = flattenUploadName(assetId, entry.assetUrl);
    const exists = await fileExists(localPath);
    let stat = null;
    let width = '';
    let height = '';
    if (exists) {
      stat = await fs.stat(localPath);
      if (assetType === 'image') {
        try {
          const dimensions = imageSize(localPath);
          width = dimensions.width || '';
          height = dimensions.height || '';
        } catch {
          width = '';
          height = '';
        }
      }
    }

    assets.push({
      assetId,
      assetUrl: entry.assetUrl,
      localPath,
      uploadName,
      uploadPath: path.join(STAGING_DIR, uploadName),
      fileName: path.basename(entry.assetUrl),
      extension: path.extname(entry.assetUrl).replace('.', '').toLowerCase(),
      assetType,
      module: getModuleForAsset(entry.assetUrl),
      usage: getUsage(entry.assetUrl, assetType),
      sourceFiles: Array.from(new Set(entry.sources.map((source) => source.sourceFile))).join('; '),
      exists,
      sizeBytes: stat?.size || 0,
      sizeMb: stat ? formatMb(stat.size) : '',
      width,
      height,
      cosUrl: '',
      uploadStatus: exists ? 'pending' : 'missing',
      replaceStatus: '',
      note: exists ? '' : '本地文件缺失',
    });
    index += 1;
  }

  return assets;
}

async function resetDir(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
  await fs.mkdir(dirPath, { recursive: true });
}

async function copyAssetsToStaging(assets) {
  await resetDir(STAGING_DIR);
  for (const asset of assets.filter((item) => item.exists)) {
    await fs.copyFile(asset.localPath, asset.uploadPath);
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function readUploadToolConfig() {
  return JSON.parse(fsSync.readFileSync(UPLOAD_CONFIG_PATH, 'utf8'));
}

function writeUploadToolConfig(config) {
  fsSync.writeFileSync(UPLOAD_CONFIG_PATH, `${JSON.stringify(config, null, '\t')}\n`);
}

async function withUploadToolConfig(fn) {
  const original = readUploadToolConfig();
  const next = {
    ...original,
    UPLOAD_FILES_DIR: STAGING_DIR,
    OUTPUT_EXCEL_RESULT_DIR: RESULTS_DIR,
  };
  writeUploadToolConfig(next);
  try {
    return await fn();
  } finally {
    writeUploadToolConfig(original);
  }
}

function clearUploadToolRequireCache() {
  for (const modulePath of Object.keys(require.cache)) {
    if (modulePath.startsWith(UPLOAD_TOOL_ROOT) && !modulePath.includes(`${path.sep}node_modules${path.sep}`)) {
      delete require.cache[modulePath];
    }
  }
}

async function runUploadToolWithCurrentConfig() {
  return withUploadToolConfig(async () => {
    clearUploadToolRequireCache();
    const { uploadFiles } = require(path.join(UPLOAD_TOOL_ROOT, 'index.js'));
    try {
      return await uploadFiles();
    } finally {
      clearUploadToolRequireCache();
    }
  });
}

async function uploadPendingAssets(assets) {
  const pending = new Map(assets.filter((asset) => asset.exists).map((asset) => [asset.uploadName, asset]));
  const attempts = new Map();
  await fs.mkdir(RESULTS_DIR, { recursive: true });

  while (pending.size > 0) {
    await resetDir(STAGING_DIR);
    for (const asset of pending.values()) {
      await fs.copyFile(asset.localPath, asset.uploadPath);
    }

    const results = await runUploadToolWithCurrentConfig();

    for (const result of results) {
      const asset = pending.get(result.fileName);
      if (!asset) continue;
      if (result.fileUrl) {
        asset.cosUrl = result.fileUrl;
        asset.uploadStatus = 'uploaded';
        asset.note = '';
        pending.delete(result.fileName);
      } else {
        const nextAttempt = (attempts.get(result.fileName) || 0) + 1;
        attempts.set(result.fileName, nextAttempt);
        asset.uploadStatus = 'failed';
        asset.note = result.error?.message || result.error?.msg || String(result.error || '上传失败');
        if (nextAttempt >= 3) {
          throw new Error(`资源连续上传失败 3 次：${asset.assetUrl} (${asset.note})`);
        }
      }
    }

    const missed = Array.from(pending.keys()).filter((fileName) => !results.some((result) => result.fileName === fileName));
    for (const fileName of missed) {
      const asset = pending.get(fileName);
      const nextAttempt = (attempts.get(fileName) || 0) + 1;
      attempts.set(fileName, nextAttempt);
      asset.uploadStatus = 'failed';
      asset.note = '上传结果中未找到该文件';
      if (nextAttempt >= 3) {
        throw new Error(`资源连续上传失败 3 次：${asset.assetUrl} (${asset.note})`);
      }
    }
  }

  return assets;
}

function makeUrlMap(assets) {
  const map = {};
  for (const asset of assets) {
    if (asset.assetUrl.startsWith('/draco/')) continue;
    if (!asset.cosUrl) continue;
    map[asset.assetUrl] = asset.cosUrl;
  }
  return map;
}

async function replaceInFile(relativeFile, replacer) {
  const absoluteFile = path.join(PROJECT_ROOT, relativeFile);
  let text = await fs.readFile(absoluteFile, 'utf8');
  const next = replacer(text);
  if (next !== text) {
    await fs.writeFile(absoluteFile, next);
  }
}

function replaceLiteralAssetUrls(text, urlMap) {
  let next = text;
  const entries = Object.entries(urlMap).sort((a, b) => b[0].length - a[0].length);
  for (const [assetUrl, cosUrl] of entries) {
    next = next.replaceAll(assetUrl, cosUrl);
  }
  return next;
}

function buildPartnerLogoArray(assets) {
  return assets
    .filter((asset) => asset.assetUrl.includes('/assets/partners-transparent/') && asset.cosUrl)
    .sort((a, b) => a.assetUrl.localeCompare(b.assetUrl))
    .map((asset) => asset.cosUrl);
}

async function replaceRuntimeReferences(assets) {
  const urlMap = makeUrlMap(assets);
  const dracoAssets = assets.filter((asset) => asset.assetUrl.startsWith('/draco/') && asset.cosUrl);
  const dracoDecoder = dracoAssets.find((asset) => asset.assetUrl.endsWith('/draco_decoder.js')) || dracoAssets[0];
  const dracoDecoderUrl = dracoDecoder?.cosUrl || '';

  for (const relativeFile of SOURCE_FILES.filter((file) => file !== 'src/sections/TailPartnersContact.jsx' && file !== 'src/sections/ReconstructionShowcase.jsx')) {
    await replaceInFile(relativeFile, (text) => replaceLiteralAssetUrls(text, urlMap));
  }

  await replaceInFile('src/sections/TailCasesCooperation.jsx', (text) => replaceLiteralAssetUrls(text, urlMap));

  const partnerUrls = buildPartnerLogoArray(assets);
  await replaceInFile('src/sections/TailPartnersContact.jsx', (text) => {
    let next = replaceLiteralAssetUrls(text, urlMap);
    const logoArray = `const PARTNER_LOGOS = ${JSON.stringify(partnerUrls, null, 2)};\n`;
    next = next.replace(/const PNG_PARTNERS = new Set\(\[[\s\S]*?\]\);\n/, logoArray);
    next = next.replace(
      /function getPartnerLogo\(index\) \{[\s\S]*?\n\}/,
      "function getPartnerLogo(index) {\n  return PARTNER_LOGOS[index - 1] || '';\n}",
    );
    return next;
  });

  await replaceInFile('src/sections/ReconstructionShowcase.jsx', (text) => {
    let next = replaceLiteralAssetUrls(text, urlMap);
    if (dracoDecoderUrl) {
      next = next.replace(
        "dracoLoader.setDecoderPath(assetPath('/draco/'));",
        `dracoLoader.setDecoderConfig({ type: 'js' });\n    dracoLoader._loadLibrary = (url, responseType) => {\n      if (url !== 'draco_decoder.js') return DRACOLoader.prototype._loadLibrary.call(dracoLoader, url, responseType);\n      const loader = new THREE.FileLoader(dracoLoader.manager);\n      loader.setResponseType(responseType);\n      return new Promise((resolve, reject) => {\n        loader.load('${dracoDecoderUrl}', resolve, undefined, reject);\n      });\n    };`,
      );
    }
    return next;
  });

  for (const asset of assets) {
    asset.replaceStatus = asset.cosUrl ? 'replaced' : asset.uploadStatus;
  }
}

function sheetFromRows(rows, headers) {
  return XLSX.utils.json_to_sheet(rows, { header: headers });
}

async function writeInventoryWorkbook(assets) {
  await fs.mkdir(INVENTORY_DIR, { recursive: true });
  const wb = XLSX.utils.book_new();
  const mainHeaders = [
    '资产ID',
    '页面模块',
    '用途说明',
    '媒体类型',
    '文件名',
    '扩展名',
    '当前项目URL',
    '本地绝对路径',
    '上传临时文件名',
    '文件大小MB',
    '宽',
    '高',
    'COS URL',
    '上传状态',
    '代码替换状态',
    '引用文件',
    '备注',
  ];
  const toRow = (asset) => ({
    资产ID: asset.assetId,
    页面模块: asset.module,
    用途说明: asset.usage,
    媒体类型: asset.assetType,
    文件名: asset.fileName,
    扩展名: asset.extension,
    当前项目URL: asset.assetUrl,
    本地绝对路径: asset.localPath,
    上传临时文件名: asset.uploadName,
    文件大小MB: asset.sizeMb,
    宽: asset.width,
    高: asset.height,
    'COS URL': asset.cosUrl,
    上传状态: asset.uploadStatus,
    代码替换状态: asset.replaceStatus,
    引用文件: asset.sourceFiles,
    备注: asset.note,
  });

  const mainRows = assets.filter((asset) => !asset.assetUrl.includes('/partners-transparent/') && !asset.assetUrl.startsWith('/draco/')).map(toRow);
  const partnerRows = assets.filter((asset) => asset.assetUrl.includes('/partners-transparent/')).map(toRow);
  const supportRows = assets.filter((asset) => asset.assetType === 'model' || asset.assetType === 'support').map(toRow);
  const summaryRows = [
    { 项目: '版本', 内容: VERSION },
    { 项目: '盘点口径', 内容: 'src 中当前运行时实际引用资源；排除 dist、草稿素材、visual-previews、临时 QA 图。' },
    { 项目: '资源总数', 内容: assets.length },
    { 项目: '合作伙伴 logo 数', 内容: partnerRows.length },
    { 项目: '缺失文件数', 内容: assets.filter((asset) => !asset.exists).length },
    { 项目: '未上传数', 内容: assets.filter((asset) => asset.exists && !asset.cosUrl).length },
    { 项目: '本地素材策略', 内容: 'public 原素材保留，但运行时代码不再依赖。' },
  ];

  XLSX.utils.book_append_sheet(wb, sheetFromRows(mainRows, mainHeaders), '素材清单');
  XLSX.utils.book_append_sheet(wb, sheetFromRows(partnerRows, mainHeaders), '合作伙伴Logo');
  XLSX.utils.book_append_sheet(wb, sheetFromRows(supportRows, mainHeaders), '3D支持文件');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), '说明');

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    sheet['!cols'] = Array.from({ length: 17 }, (_, index) => ({ wch: [16, 16, 24, 12, 32, 10, 56, 72, 56, 12, 10, 10, 72, 14, 16, 34, 32][index] || 18 }));
    sheet['!freeze'] = { xSplit: 0, ySplit: 1 };
  }

  XLSX.writeFile(wb, INVENTORY_XLSX_PATH);
}

async function writeManifest(assets) {
  await writeJson(MANIFEST_PATH, {
    version: VERSION,
    generatedAt: new Date().toISOString(),
    inventoryXlsx: INVENTORY_XLSX_PATH,
    assets,
  });
}

async function ensureIgnored() {
  const gitignorePath = path.join(PROJECT_ROOT, '.gitignore');
  const current = await fs.readFile(gitignorePath, 'utf8').catch(() => '');
  const required = ['.asset-upload/', 'docs/asset-inventory/*.tmp.xlsx'];
  const missing = required.filter((line) => !current.split(/\r?\n/).includes(line));
  if (missing.length > 0) {
    const suffix = current.endsWith('\n') || !current ? '' : '\n';
    await fs.writeFile(gitignorePath, `${current}${suffix}${missing.join('\n')}\n`);
  }
}

async function runInventory() {
  const assets = await collectRuntimeAssets();
  await ensureIgnored();
  await copyAssetsToStaging(assets);
  await writeInventoryWorkbook(assets);
  await writeManifest(assets);
  return assets;
}

async function runUpload() {
  const assets = await collectRuntimeAssets();
  await ensureIgnored();
  const missing = assets.filter((asset) => !asset.exists);
  if (missing.length > 0) {
    throw new Error(`发现缺失素材，停止上传：${missing.map((asset) => asset.assetUrl).join(', ')}`);
  }
  await uploadPendingAssets(assets);
  await writeInventoryWorkbook(assets);
  await writeManifest(assets);
  return assets;
}

async function runReplace() {
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
  const assets = manifest.assets;
  const missingUrls = assets.filter((asset) => asset.exists && !asset.cosUrl);
  if (missingUrls.length > 0) {
    throw new Error(`仍有素材没有 COS URL，停止替换：${missingUrls.map((asset) => asset.assetUrl).join(', ')}`);
  }
  await replaceRuntimeReferences(assets);
  await writeInventoryWorkbook(assets);
  await writeManifest(assets);
  return assets;
}

async function runAll() {
  await runInventory();
  await runUpload();
  await runReplace();
}

async function main() {
  const command = process.argv[2] || 'all';
  if (command === 'inventory') {
    const assets = await runInventory();
    console.log(`盘点完成：${assets.length} 个资源`);
    console.log(INVENTORY_XLSX_PATH);
    return;
  }
  if (command === 'upload') {
    const assets = await runUpload();
    console.log(`上传完成：${assets.length} 个资源`);
    console.log(INVENTORY_XLSX_PATH);
    return;
  }
  if (command === 'replace') {
    await runReplace();
    console.log('代码替换完成');
    return;
  }
  if (command === 'all') {
    await runAll();
    console.log('COS 迁移完成');
    console.log(INVENTORY_XLSX_PATH);
    return;
  }
  throw new Error(`未知命令：${command}`);
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '')) {
  main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
  });
}
