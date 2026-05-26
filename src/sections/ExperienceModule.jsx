import { useEffect, useRef, useState } from 'react';
import Modal from '../components/Modal.jsx';
import Reveal from '../components/Reveal.jsx';
import { ShanhaiImageTo3DAdapter } from '../adapters/imageTo3DAdapter.js';

const stages = [
  '正在上传图像并记录素材参数',
  '正在创建图生 3D 建模任务',
  '正在估算主体轮廓与材质区域',
  '正在生成模型网格与纹理',
  '正在打包预览文件与下载格式',
];

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

export default function ExperienceModule() {
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const [authorized, setAuthorized] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [view, setView] = useState('upload');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState(stages[0]);
  const [taskId, setTaskId] = useState('MG-3D-DEMO');
  const [error, setError] = useState(ShanhaiImageTo3DAdapter.mapError('DEMO_TIMEOUT'));

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function requestUpload() {
    if (!authorized) {
      setAuthOpen(true);
      return;
    }
    inputRef.current?.click();
  }

  function validateFile(nextFile) {
    const allowed = ['image/png', 'image/jpeg'];
    if (!allowed.includes(nextFile.type)) return ShanhaiImageTo3DAdapter.mapError('UNSUPPORTED_FORMAT');
    if (nextFile.size > 25 * 1024 * 1024) return ShanhaiImageTo3DAdapter.mapError('FILE_TOO_LARGE');
    return null;
  }

  function applyFile(nextFile) {
    const details = validateFile(nextFile);
    if (details) {
      setError(details);
      setView('error');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setView('selected');
  }

  async function startGenerate() {
    if (!file) return;
    window.clearInterval(timerRef.current);
    setView('generating');
    setProgress(0);
    setProgressStage(stages[0]);

    const upload = await ShanhaiImageTo3DAdapter.uploadImage(file);
    const task = await ShanhaiImageTo3DAdapter.createTask(upload.assetId);
    setTaskId(task.taskId);

    let current = 0;
    timerRef.current = window.setInterval(async () => {
      current += Math.floor(8 + Math.random() * 12);
      const bounded = Math.min(current, 100);
      setProgress(bounded);
      setProgressStage(stages[Math.min(Math.floor(bounded / 22), stages.length - 1)]);
      if (bounded >= 100) {
        window.clearInterval(timerRef.current);
        await ShanhaiImageTo3DAdapter.queryProgress(task.taskId);
        await ShanhaiImageTo3DAdapter.getResult(task.taskId);
        setView('result');
      }
    }, 460);
  }

  function resetFlow() {
    window.clearInterval(timerRef.current);
    setFile(null);
    setProgress(0);
    setProgressStage(stages[0]);
    setView('upload');
    if (inputRef.current) inputRef.current.value = '';
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
  }

  async function downloadModel(event) {
    event.preventDefault();
    const blob = await ShanhaiImageTo3DAdapter.downloadResult(taskId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${taskId || 'shanhai-demo-model'}.glb`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="experience-module" id="experience">
      <div className="site-shell experience-grid">
        <Reveal className="experience-copy">
          <p className="section-kicker">Image To 3D</p>
          <h2>山海超级智能体：把图像转成可预览、可下载的 3D 体验</h2>
          <p>体验区以视觉稿形式展示上传图像、生成建模、预览下载三个状态。真实生成服务接入方式后续确认。</p>
          <div className="experience-actions">
            <button className="btn dark" type="button" onClick={requestUpload}>上传图像体验</button>
            <a className="btn light" href="#cooperation">了解合作方式</a>
          </div>
        </Reveal>

        <Reveal className={`workbench view-${view}`} aria-label="图生 3D 内嵌工作台">
          <div className="workbench-head">
            <span>体验工作台</span>
            <b className={authorized ? 'is-ready' : ''}>{authorized ? '已授权，静态体验模式' : '未登录，体验前需授权'}</b>
          </div>
          <div className="state-tabs">
            {['上传图像', '生成建模', '预览下载', '失败重试'].map((label, index) => (
              <span key={label} className={(view === ['upload', 'generating', 'result', 'error'][index] || (view === 'selected' && index === 0)) ? 'is-active' : ''}>
                <i />{label}
              </span>
            ))}
          </div>

          {(view === 'upload' || view === 'selected') && (
            <div
              className="dropzone"
              role="button"
              tabIndex="0"
              onClick={requestUpload}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (!authorized) {
                  setAuthOpen(true);
                  return;
                }
                const [dropped] = event.dataTransfer.files;
                if (dropped) applyFile(dropped);
              }}
            >
              <input ref={inputRef} type="file" accept="image/png,image/jpeg" onChange={(event) => event.target.files[0] && applyFile(event.target.files[0])} />
              {previewUrl ? <img className="file-preview" src={previewUrl} alt="已选图像缩略图" /> : <strong>选择一张文物图像</strong>}
              <p>{file ? `${file.name} / ${formatBytes(file.size)}` : '支持 PNG / JPG，演示限制 25MB 以内。'}</p>
              <button className="btn dark" type="button" disabled={!file} onClick={(event) => { event.stopPropagation(); startGenerate(); }}>开始生成</button>
            </div>
          )}

          {view === 'generating' && (
            <div className="generating-view">
              <div className="orbit-preview"><span /></div>
              <div className="progress-line"><i style={{ width: `${progress}%` }} /></div>
              <p>{progressStage}</p>
              <b>{progress}%</b>
            </div>
          )}

          {view === 'result' && (
            <div className="result-view">
              <div className="model-preview"><span>3D</span></div>
              <p>任务编号 <b>{taskId}</b></p>
              <p>处理来源 <b>{file?.name || '已选图像'}</b></p>
              <div className="result-actions">
                <a className="btn dark" href="#" onClick={downloadModel}>下载模型</a>
                <button className="btn light" type="button" onClick={resetFlow}>重新上传</button>
              </div>
            </div>
          )}

          {view === 'error' && (
            <div className="error-view">
              <span>{error.code}</span>
              <p>{error.message}</p>
              <button className="btn dark" type="button" onClick={file ? startGenerate : resetFlow}>重试生成</button>
              <button className="btn light" type="button" onClick={resetFlow}>重新上传</button>
            </div>
          )}

          <button className="simulate-error" type="button" onClick={() => { setError(ShanhaiImageTo3DAdapter.mapError('DEMO_TIMEOUT')); setView('error'); }}>模拟失败</button>
        </Reveal>
      </div>

      <Modal open={authOpen} title="登录后体验图生 3D" onClose={() => setAuthOpen(false)} labelledBy="experience-auth-title">
        <p>首版为体验入口视觉稿。输入手机号和验证码后进入图生 3D 体验流程。</p>
        <label className="auth-field">
          <span>手机号</span>
          <input inputMode="tel" autoComplete="tel" placeholder="请输入手机号" />
        </label>
        <label className="auth-field">
          <span>验证码</span>
          <input inputMode="numeric" autoComplete="one-time-code" placeholder="请输入验证码" />
        </label>
        <button className="btn dark" type="button" onClick={() => { setAuthorized(true); setAuthOpen(false); window.setTimeout(() => inputRef.current?.click(), 50); }}>进入体验</button>
      </Modal>
    </section>
  );
}
