import assert from 'node:assert/strict';
import {
  buildAssetId,
  classifyAssetType,
  flattenUploadName,
  isRuntimeAssetUrl,
  resolveRuntimeAssetPath,
} from './cos-migrate-assets.mjs';

assert.equal(isRuntimeAssetUrl('/assets/logo.png'), true);
assert.equal(isRuntimeAssetUrl('/home-assets/recon.glb'), true);
assert.equal(isRuntimeAssetUrl('/home-required-assets/案例.png'), true);
assert.equal(isRuntimeAssetUrl('/draco/draco_decoder.wasm'), true);
assert.equal(isRuntimeAssetUrl('/visual-previews/draft.png'), false);
assert.equal(isRuntimeAssetUrl('https://example.com/image.png'), false);
assert.equal(isRuntimeAssetUrl('/assets/partners-transparent/partner-${stem}.${PNG_PARTNERS.has(index'), false);

assert.equal(classifyAssetType('/assets/logo.png'), 'image');
assert.equal(classifyAssetType('/assets/logo-loop.mp4'), 'video');
assert.equal(classifyAssetType('/home-assets/recon-container.glb'), 'model');
assert.equal(classifyAssetType('/draco/draco_decoder.wasm'), 'support');

assert.equal(buildAssetId('partner-logo', 17), 'partner-logo-017');
assert.equal(flattenUploadName('asset-001', '/home-required-assets/案例-海南省博物馆一馆一码2.png'), 'asset-001__home-required-assets__案例-海南省博物馆一馆一码2.png');

const root = '/tmp/project';
assert.equal(
  resolveRuntimeAssetPath(root, '/assets/logo.png'),
  '/tmp/project/public/assets/logo.png',
);
