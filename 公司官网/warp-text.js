/* WarpText adapted from the React Bits JavaScript + CSS component source. */

import { Mesh, Program, Renderer, Texture, Triangle } from "./vendor/ogl.bundle.mjs";

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = `#version 300 es
precision highp float;

uniform sampler2D uTextTexture;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uWarpStrength;
uniform float uWarpScale;
uniform float uSpeed;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uRefraction;
uniform float uRipple;
uniform float uMotion;

in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

vec4 sampleText(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  return texture(uTextTexture, uv);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float time = uTime * uSpeed;
  float scale = max(uWarpScale, 0.001);
  vec2 drift = vec2(time * 0.055, -time * 0.045);
  float n1 = fbm(uv * scale * 3.1 + drift);
  float n2 = fbm((uv + 19.17) * scale * 3.4 - drift.yx);
  vec2 ambient = (vec2(n1, n2) - 0.5) * uWarpStrength * 0.045 * uMotion;

  vec2 pointerDelta = uv - uPointer;
  vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
  float dist = length(aspectDelta);
  float radius = max(uPointerInfluence, 0.001);
  float t = clamp(dist / radius, 0.0, 1.0);
  float lens = smoothstep(radius, 0.0, dist) * uPointerActive;
  float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;
  vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);
  float rippleWave = sin(dist * 28.0 - time * 4.2) * 0.5 + 0.5;
  vec2 pointerWarp = -dir * bulge * uPointerStrength * 0.045;
  pointerWarp += dir * (rippleWave - 0.5) * uRipple * bulge * uPointerStrength * 0.016;

  vec2 displaced = uv + ambient + pointerWarp;
  vec2 splitDir = ambient + pointerWarp;
  float splitLength = length(splitDir);
  splitDir = splitLength > 0.00001 ? splitDir / splitLength : vec2(0.7071, 0.7071);
  vec2 split = splitDir * uRefraction * 0.16 * (0.35 + lens * 1.65);
  vec4 base = sampleText(displaced);
  float r = sampleText(displaced + split).r;
  float g = base.g;
  float b = sampleText(displaced - split).b;
  float a = max(max(sampleText(displaced + split).a, base.a), sampleText(displaced - split).a);
  fragColor = vec4(vec3(r, g, b) + lens * base.a * 0.055, a);
}`;

const getFontValue = (value) => (typeof value === "number" ? `${value}px` : value);

const measureLine = (context, line, letterSpacing) => {
  const chars = Array.from(line);
  return chars.reduce((width, char) => width + context.measureText(char).width, 0) + Math.max(0, chars.length - 1) * letterSpacing;
};

const drawLine = (context, line, x, y, letterSpacing) => {
  const chars = Array.from(line);
  let cursor = x - measureLine(context, line, letterSpacing) / 2;
  chars.forEach((char, index) => {
    context.fillText(char, cursor, y);
    cursor += context.measureText(char).width + (index === chars.length - 1 ? 0 : letterSpacing);
  });
};

const buildTextCanvas = ({ container, width, height, dpr, props }) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const probe = document.createElement("span");
  probe.textContent = props.text;
  Object.assign(probe.style, {
    position: "absolute",
    visibility: "hidden",
    pointerEvents: "none",
    whiteSpace: "pre",
    inset: "0 auto auto 0",
    fontFamily: props.fontFamily,
    fontSize: getFontValue(props.fontSize),
    fontWeight: String(props.fontWeight),
    letterSpacing: getFontValue(props.letterSpacing),
    lineHeight: String(props.lineHeight)
  });
  container.appendChild(probe);
  const computed = window.getComputedStyle(probe);
  let fontSize = parseFloat(computed.fontSize) || 96;
  const fontFamily = computed.fontFamily || "sans-serif";
  const fontWeight = computed.fontWeight || String(props.fontWeight);
  let letterSpacing = computed.letterSpacing === "normal" ? 0 : parseFloat(computed.letterSpacing) || 0;
  let lineHeight = parseFloat(computed.lineHeight) || fontSize * props.lineHeight;
  probe.remove();

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillStyle = props.color;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  const lines = String(props.text || "").split("\n");
  const applyFont = () => { context.font = `${fontWeight} ${fontSize}px ${fontFamily}`; };
  applyFont();

  const widest = Math.max(...lines.map((line) => measureLine(context, line, letterSpacing)), 1);
  const fit = Math.min(1, (width * 0.94) / widest, (height * 0.92) / Math.max(lineHeight * lines.length, 1));
  if (fit < 1) {
    fontSize *= fit;
    letterSpacing *= fit;
    lineHeight *= fit;
    applyFont();
  }

  const startY = height / 2 - (lineHeight * (lines.length - 1)) / 2;
  lines.forEach((line, index) => drawLine(context, line, width / 2, startY + index * lineHeight, letterSpacing));
  return canvas;
};

window.createWarpText = function createWarpText(container, settings = {}) {
  if (!container || container.dataset.warpTextReady) return null;
  const props = {
    text: container.textContent.trim(),
    color: "#ec3d38",
    warpStrength: 0.13,
    warpScale: 1.7,
    speed: 0.68,
    pointerInfluence: 0.5,
    pointerStrength: 0.64,
    refraction: 0.034,
    ripple: true,
    fontSize: "inherit",
    fontWeight: 800,
    fontFamily: "inherit",
    letterSpacing: 0,
    lineHeight: 0.9,
    ...settings
  };

  let renderer;
  try {
    renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: false, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
  } catch {
    return null;
  }

  const gl = renderer.gl;
  const canvas = gl.canvas;
  const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
  const program = new Program(gl, {
    vertex,
    fragment,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTextTexture: { value: texture },
      uResolution: { value: new Float32Array([1, 1]) },
      uPointer: { value: new Float32Array([0.5, 0.5]) },
      uPointerActive: { value: 0 },
      uTime: { value: 0 },
      uWarpStrength: { value: props.warpStrength },
      uWarpScale: { value: props.warpScale },
      uSpeed: { value: props.speed },
      uPointerInfluence: { value: props.pointerInfluence },
      uPointerStrength: { value: props.pointerStrength },
      uRefraction: { value: props.refraction },
      uRipple: { value: props.ripple ? 1 : 0 },
      uMotion: { value: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1 }
    }
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, active: 0, activeTarget: 0 };
  const startedAt = performance.now();
  let animationFrame = 0;
  let visible = true;
  let pageVisible = !document.hidden;
  let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let disposed = false;
  let rasterVersion = 0;

  Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block" });
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);
  container.dataset.warpTextReady = "true";

  const renderOnce = () => renderer.render({ scene: mesh });
  const rasterize = async () => {
    const version = ++rasterVersion;
    try { await document.fonts?.ready; } catch { /* use fallback font */ }
    if (disposed || version !== rasterVersion) return;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    texture.image = buildTextCanvas({ container, width: rect.width, height: rect.height, dpr, props });
    texture.needsUpdate = true;
    container.classList.add("is-ready");
    renderOnce();
  };
  const resize = () => {
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setSize(rect.width, rect.height);
    program.uniforms.uResolution.value[0] = gl.drawingBufferWidth;
    program.uniforms.uResolution.value[1] = gl.drawingBufferHeight;
    rasterize();
  };
  const loop = (now) => {
    if (disposed) return;
    const elapsed = (now - startedAt) * 0.001;
    const idleX = 0.5 + Math.sin(elapsed * 0.33) * 0.12;
    const idleY = 0.5 + Math.cos(elapsed * 0.27) * 0.1;
    const damping = pointer.activeTarget ? 0.12 : 0.035;
    pointer.x += ((pointer.activeTarget ? pointer.targetX : idleX) - pointer.x) * damping;
    pointer.y += ((pointer.activeTarget ? pointer.targetY : idleY) - pointer.y) * damping;
    pointer.active += ((pointer.activeTarget ? 1 : 0.18) - pointer.active) * 0.06;
    program.uniforms.uPointer.value[0] = pointer.x;
    program.uniforms.uPointer.value[1] = pointer.y;
    program.uniforms.uPointerActive.value = reducedMotion ? pointer.active * 0.35 : pointer.active;
    program.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
    renderOnce();
    animationFrame = window.requestAnimationFrame(loop);
  };
  const onPointerMove = (event) => {
    if (event.pointerType === "touch") return;
    const rect = canvas.getBoundingClientRect();
    pointer.targetX = (event.clientX - rect.left) / rect.width;
    pointer.targetY = 1 - (event.clientY - rect.top) / rect.height;
    pointer.activeTarget = 1;
  };
  const onPointerLeave = () => { pointer.activeTarget = 0; };
  const onVisibility = () => {
    pageVisible = !document.hidden;
    if (pageVisible && visible && !animationFrame) animationFrame = requestAnimationFrame(loop);
    if (!pageVisible && animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  };
  const onReducedMotion = (event) => { reducedMotion = event.matches; program.uniforms.uMotion.value = reducedMotion ? 0 : 1; };

  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && pageVisible && !animationFrame) animationFrame = requestAnimationFrame(loop);
    if (!visible && animationFrame) { cancelAnimationFrame(animationFrame); animationFrame = 0; }
  }, { threshold: 0 });
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  resizeObserver.observe(container);
  intersectionObserver.observe(container);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);
  document.addEventListener("visibilitychange", onVisibility);
  motionQuery.addEventListener("change", onReducedMotion);
  resize();
  animationFrame = requestAnimationFrame(loop);

  return () => {
    disposed = true;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    motionQuery.removeEventListener("change", onReducedMotion);
    if (canvas.parentNode === container) canvas.remove();
  };
};

window.dispatchEvent(new Event("warptextready"));
