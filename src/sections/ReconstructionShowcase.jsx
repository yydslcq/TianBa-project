import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { assetPath } from '../utils/assetPath.js';

const GLB_SRC = 'https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618504604352512.glb';
const DRACO_DECODER_SRC = 'https://img.shuziwenbo.cn/7/20260605/1JMrHO1QPF4UX/299618541389357056.js';
const MAX_RIPPLES = 16;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (from, to, amount) => from + (to - from) * amount;

const postVertexShader = `
attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const postFragmentShader = `
precision highp float;

uniform sampler2D tScene;
uniform sampler2D tTrail;
uniform vec2 uResolution;
uniform vec4 uRipples[16];
uniform float uTime;

varying vec2 vUv;

float luminance(vec4 color) {
  return max(max(color.r, color.g), color.b) * color.a;
}

void main() {
  vec2 uv = vUv;
  vec2 trailUv = vec2(uv.x, 1.0 - uv.y);
  vec2 texel = 1.0 / uResolution;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);

  float trail = texture2D(tTrail, trailUv).r;
  float left = texture2D(tTrail, trailUv - vec2(texel.x * 4.0, 0.0)).r;
  float right = texture2D(tTrail, trailUv + vec2(texel.x * 4.0, 0.0)).r;
  float down = texture2D(tTrail, trailUv - vec2(0.0, texel.y * 4.0)).r;
  float up = texture2D(tTrail, trailUv + vec2(0.0, texel.y * 4.0)).r;

  vec2 trailNormal = vec2(right - left, up - down);
  vec2 rippleNormal = vec2(0.0);
  float rippleLight = 0.0;

  for (int i = 0; i < 16; i++) {
    vec4 ripple = uRipples[i];
    float age = max(0.0, uTime - ripple.z);
    float active = step(0.001, ripple.w) * (1.0 - smoothstep(1.15, 2.75, age));
    vec2 delta = (trailUv - ripple.xy) * aspect;
    float dist = max(length(delta), 0.001);
    float radius = age * 0.34;
    float front = dist - radius;
    float wave = sin(front * 78.0) * exp(-abs(front) * 13.0) * exp(-age * 1.1) * ripple.w * active;
    rippleNormal += normalize(delta) * wave * 0.004;
    rippleLight += abs(wave) * 0.42;
  }

  float lens = smoothstep(0.08, 0.44, trail);
  float edge = smoothstep(0.10, 0.32, trail) - smoothstep(0.48, 0.78, trail);
  float wake = clamp(rippleLight + edge * 0.92 + lens * 0.032, 0.0, 1.0);
  vec2 refract = (trailNormal * vec2(0.072, -0.052) + rippleNormal * 1.45) * wake;

  vec4 base = texture2D(tScene, uv);
  vec4 shiftedA = texture2D(tScene, uv + refract);
  vec4 shiftedB = texture2D(tScene, uv + refract * vec2(-0.52, 0.62));
  vec4 shiftedC = texture2D(tScene, uv + refract * 1.44);

  vec4 refracted = vec4(shiftedC.r, shiftedA.g, shiftedB.b, max(max(shiftedA.a, shiftedB.a), shiftedC.a));
  float scenePresence = max(luminance(base), luminance(refracted));
  float shimmer = sin((uv.x * 9.2 + uv.y * 4.1 + uTime * 0.62) * 6.28318) * 0.5 + 0.5;
  float glassLine = smoothstep(0.50, 0.92, shimmer) * edge * 0.34;
  vec3 highlight = vec3(0.80, 1.0, 0.88) * (rippleLight * 0.24 + edge * 0.2 + glassLine);
  vec3 amber = vec3(1.0, 0.78, 0.36) * edge * 0.09;
  vec3 cyanVeil = vec3(0.24, 0.86, 0.72) * (edge * 0.12 + lens * 0.016 + rippleLight * 0.08);

  vec4 color = mix(base, refracted, clamp(lens * 0.82 + rippleLight * 0.28, 0.0, 0.92));
  color.rgb += highlight + amber + cyanVeil;
  color.rgb += vec3(0.03, 0.16, 0.13) * lens * 0.08;
  color.a = clamp(max(base.a, scenePresence * 0.92) + wake * 0.14 + edge * 0.12, 0.0, 1.0);

  gl_FragColor = color;
}
`;

function drawVisorPath(ctx, width, height) {
  const w = width / 2;
  const h = height / 2;
  ctx.beginPath();
  ctx.moveTo(-w, -h * 0.08);
  ctx.bezierCurveTo(-w * 0.84, -h * 0.76, -w * 0.1, -h * 1.02, w * 0.42, -h * 0.72);
  ctx.bezierCurveTo(w * 0.84, -h * 0.48, w * 1.08, -h * 0.08, w * 0.96, h * 0.16);
  ctx.bezierCurveTo(w * 0.75, h * 0.54, w * 0.08, h * 0.77, -w * 0.54, h * 0.5);
  ctx.bezierCurveTo(-w * 0.96, h * 0.32, -w * 1.08, h * 0.12, -w, -h * 0.08);
  ctx.closePath();
}

export default function ReconstructionShowcase({ children, variant = '' }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    const isContactVariant = root.classList.contains('reconstruction-showcase--contact');
    let cancelled = false;
    let raf = 0;
    let resizeObserver;
    let sceneTarget;
    const rippleUniforms = Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4(0, 0, -10, 0));
    const state = {
      width: 1,
      height: 1,
      dpr: 1,
      targetX: 0,
      targetY: 0,
      x: 0,
      y: 0,
      nx: 0,
      ny: 0,
      modelRotX: 0,
      modelRotY: 0,
      hasPointer: false,
      lastMove: 0,
      lastRippleX: 0,
      lastRippleY: 0,
      lastRippleTime: 0,
      ripples: Array.from({ length: MAX_RIPPLES }, () => [0, 0, -10, 0]),
    };

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 100);
    camera.position.set(0, 0.04, 5.8);

    const modelRoot = new THREE.Group();
    modelRoot.rotation.x = -0.07;
    scene.add(modelRoot);

    const ambient = new THREE.AmbientLight(0xc9d0c7, 1.25);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xfff0ce, 3.35);
    key.position.set(2.8, 4.6, 3.4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8eeed7, 1.75);
    rim.position.set(-3.8, 1.2, 2.4);
    scene.add(rim);
    const lower = new THREE.DirectionalLight(0x406d62, 0.78);
    lower.position.set(0, -3, 2);
    scene.add(lower);

    const trailCanvas = document.createElement('canvas');
    const trailCtx = trailCanvas.getContext('2d', { alpha: true });
    const trailTexture = new THREE.CanvasTexture(trailCanvas);
    trailTexture.colorSpace = THREE.NoColorSpace;
    trailTexture.wrapS = THREE.ClampToEdgeWrapping;
    trailTexture.wrapT = THREE.ClampToEdgeWrapping;
    trailTexture.minFilter = THREE.LinearFilter;
    trailTexture.magFilter = THREE.LinearFilter;
    trailTexture.generateMipmaps = false;
    trailTexture.flipY = false;

    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postMaterial = new THREE.RawShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        tScene: { value: null },
        tTrail: { value: trailTexture },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uRipples: { value: rippleUniforms },
        uTime: { value: 0 },
      },
      vertexShader: postVertexShader,
      fragmentShader: postFragmentShader,
    });
    postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMaterial));

    const resize = () => {
      const rect = root.getBoundingClientRect();
      state.width = Math.max(1, Math.round(rect.width));
      state.height = Math.max(1, Math.round(rect.height));
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(state.width * state.dpr);
      canvas.height = Math.round(state.height * state.dpr);
      canvas.style.width = `${state.width}px`;
      canvas.style.height = `${state.height}px`;
      trailCanvas.width = canvas.width;
      trailCanvas.height = canvas.height;
      renderer.setPixelRatio(state.dpr);
      renderer.setSize(state.width, state.height, false);
      sceneTarget?.dispose();
      sceneTarget = new THREE.WebGLRenderTarget(canvas.width, canvas.height, {
        depthBuffer: true,
        stencilBuffer: false,
      });
      sceneTarget.texture.colorSpace = THREE.SRGBColorSpace;
      postMaterial.uniforms.tScene.value = sceneTarget.texture;
      postMaterial.uniforms.uResolution.value.set(canvas.width, canvas.height);
      camera.position.z = state.width < 640 ? 7.5 : 5.85;
      camera.aspect = state.width / state.height;
      camera.updateProjectionMatrix();
      state.targetX = state.width * 0.5;
      state.targetY = state.height * 0.48;
      state.x = state.targetX;
      state.y = state.targetY;
      trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      trailTexture.needsUpdate = true;
    };

    const updatePointer = (clientX, clientY) => {
      const rect = root.getBoundingClientRect();
      state.targetX = clamp(clientX - rect.left, rect.width * 0.08, rect.width * 0.92);
      state.targetY = clamp(clientY - rect.top, rect.height * 0.12, rect.height * 0.88);
      state.nx = clamp((clientX - rect.left) / rect.width, 0, 1) - 0.5;
      state.ny = clamp((clientY - rect.top) / rect.height, 0, 1) - 0.5;
      state.hasPointer = true;
      state.lastMove = performance.now();
      const distance = Math.hypot(state.targetX - state.lastRippleX, state.targetY - state.lastRippleY);
      const now = performance.now();
      if (distance > 18 || now - state.lastRippleTime > 85) {
        state.ripples.push([
          state.targetX / Math.max(1, state.width),
          state.targetY / Math.max(1, state.height),
          now * 0.001,
          clamp(distance / 95, 0.22, 1),
        ]);
        state.ripples = state.ripples.slice(-MAX_RIPPLES);
        state.lastRippleX = state.targetX;
        state.lastRippleY = state.targetY;
        state.lastRippleTime = now;
      }
    };

    const drawTrail = (time) => {
      if (!state.hasPointer) {
        state.targetX = state.width * (0.5 + Math.sin(time * 0.00058) * 0.14);
        state.targetY = state.height * (0.48 + Math.cos(time * 0.00046) * 0.065);
      }
      state.x = lerp(state.x, state.targetX, 0.058);
      state.y = lerp(state.y, state.targetY, 0.058);

      const visorWidth = clamp(state.width * 0.22, 260, 450);
      const visorHeight = clamp(state.width * 0.066, 70, 118);
      const angle = state.hasPointer ? state.nx * 0.36 + state.ny * 0.12 : Math.sin(time * 0.00074) * 0.28;

      trailCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      trailCtx.save();
      trailCtx.globalCompositeOperation = 'destination-out';
      trailCtx.fillStyle = 'rgba(0, 0, 0, 0.215)';
      trailCtx.fillRect(0, 0, state.width, state.height);
      trailCtx.restore();

      trailCtx.save();
      trailCtx.translate(state.x, state.y);
      trailCtx.rotate(angle);
      trailCtx.globalCompositeOperation = 'source-over';
      trailCtx.filter = 'blur(0.25px)';
      trailCtx.globalAlpha = state.hasPointer ? 0.78 : 0.32;
      trailCtx.fillStyle = 'rgba(255,255,255,0.98)';
      drawVisorPath(trailCtx, visorWidth, visorHeight);
      trailCtx.fill();
      trailCtx.filter = 'blur(12px)';
      trailCtx.globalAlpha = state.hasPointer ? 0.16 : 0.08;
      trailCtx.scale(1.12, 1.22);
      drawVisorPath(trailCtx, visorWidth, visorHeight);
      trailCtx.fill();
      trailCtx.restore();
      trailTexture.needsUpdate = true;
    };

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoader._loadLibrary = (url, responseType) => {
      if (url !== 'draco_decoder.js') return DRACOLoader.prototype._loadLibrary.call(dracoLoader, url, responseType);
      const decoderLoader = new THREE.FileLoader(dracoLoader.manager);
      decoderLoader.setResponseType(responseType);
      return new Promise((resolve, reject) => {
        decoderLoader.load(DRACO_DECODER_SRC, resolve, undefined, reject);
      });
    };
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(assetPath(GLB_SRC), (gltf) => {
      if (cancelled) return;
      const model = gltf.scene;
      model.traverse((node) => {
        if (!node.isMesh) return;
        node.frustumCulled = false;
        if (node.material) {
          node.material.side = THREE.FrontSide;
          node.material.envMapIntensity = 0.7;
          if ('roughness' in node.material) node.material.roughness = Math.min(0.94, node.material.roughness ?? 0.76);
          if ('metalness' in node.material) node.material.metalness = Math.max(0.08, node.material.metalness ?? 0.08);
        }
      });
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      model.position.sub(center);
      const scale = 2.08 / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(scale);
      model.position.y -= 0.05;
      modelRoot.add(model);
    }, undefined, () => {});

    const animate = (time = 0) => {
      if (cancelled || !sceneTarget) return;
      drawTrail(time);
      state.modelRotY = lerp(state.modelRotY, state.nx * 0.18, 0.05);
      state.modelRotX = lerp(state.modelRotX, -0.07 + state.ny * 0.07, 0.05);
      modelRoot.position.x = lerp(modelRoot.position.x, isContactVariant && state.width >= 900 ? -0.82 : 0, 0.06);
      modelRoot.rotation.y = state.modelRotY + Math.sin(time * 0.00034) * 0.012;
      modelRoot.rotation.x = state.modelRotX;
      state.ripples.forEach((ripple, index) => {
        rippleUniforms[index].set(ripple[0], ripple[1], ripple[2], ripple[3]);
      });
      postMaterial.uniforms.uTime.value = time * 0.001;

      renderer.setRenderTarget(sceneTarget);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(postScene, postCamera);
      raf = window.requestAnimationFrame(animate);
    };

    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    raf = window.requestAnimationFrame(animate);

    const handlePointerMove = (event) => updatePointer(event.clientX, event.clientY);
    const handlePointerLeave = () => {
      state.hasPointer = false;
      state.targetX = state.width * 0.5;
      state.targetY = state.height * 0.48;
    };
    const handleTouchMove = (event) => {
      const touch = event.touches[0];
      if (touch) updatePointer(touch.clientX, touch.clientY);
    };
    root.addEventListener('pointermove', handlePointerMove);
    root.addEventListener('pointerleave', handlePointerLeave);
    root.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      root.removeEventListener('pointermove', handlePointerMove);
      root.removeEventListener('pointerleave', handlePointerLeave);
      root.removeEventListener('touchmove', handleTouchMove);
      sceneTarget?.dispose();
      postMaterial.dispose();
      trailTexture.dispose();
      renderer.dispose();
      dracoLoader.dispose();
    };
  }, []);

  return (
    <section
      className={`reconstruction-showcase${variant ? ` reconstruction-showcase--${variant}` : ''}`}
      ref={rootRef}
      aria-labelledby="reconstruction-title"
    >
      <h2 id="reconstruction-title" className="sr-only">青铜器采集重建水波交互</h2>
      <canvas
        ref={canvasRef}
        className="recon-canvas recon-model-canvas"
        aria-label="青铜器三维模型水波交互"
      />
      {children}
    </section>
  );
}
