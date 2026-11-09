"use client";

/* Three.js owns the animated DOM hit boundaries, which are deliberately updated through refs. */
/* eslint-disable react-hooks/immutability */

import { useEffect, useRef, type RefObject } from 'react';
import { buildSteps, photoPath } from './buildSteps';
import {
  advanceRibbon, nearestStage, projectRibbonPoint, RIBBON_CAMERA,
  ribbonEnergy, ribbonLayout, ribbonLean, ribbonSurface, wrapStage,
  type RibbonLayout,
} from './ribbonMotion';

type Props = {
  stage: RefObject<HTMLDivElement | null>;
  rail: RefObject<HTMLDivElement | null>;
  target: RefObject<number>;
  current: RefObject<number>;
  paused: RefObject<boolean>;
  onActive: (index: number) => void;
  onReady: (ready: boolean) => void;
};

const vertexShader = `
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    vDepth = position.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying float vDepth;
  uniform sampler2D uImage;
  uniform sampler2D uLabels;
  uniform vec2 uSize;
  uniform float uAspect;
  uniform float uRadius;
  uniform float uWidth;
  void main() {
    vec2 p = abs((vUv - .5) * uSize) - uSize * .5 + uRadius;
    float corner = length(max(p, 0.0)) + min(max(p.x, p.y), 0.0) - uRadius;
    if (corner > 0.0) discard;
    float aspect = uSize.x / uSize.y;
    vec2 crop = vec2(min(aspect / uAspect, 1.0), min(uAspect / aspect, 1.0));
    vec3 photo = texture2D(uImage, (vUv - .5) * crop + .5).rgb;
    photo *= mix(.7, 1.0, smoothstep(-uWidth * .3, uWidth * .2, vDepth));
    photo *= mix(.38, 1.0, smoothstep(0.0, .32, vUv.y));
    vec4 label = texture2D(uLabels, vUv);
    gl_FragColor = vec4(mix(photo, label.rgb, label.a), 1.0 - smoothstep(-1.0, 0.0, corner));
    #include <colorspace_fragment>
  }
`;

const floorShader = `
  varying vec3 vWorld;
  uniform float uCell;
  uniform float uHalfWidth;
  uniform float uRun;
  void main() {
    vec2 tiles = vWorld.xz / uCell;
    vec2 grid = abs(fract(tiles - .5) - .5) / max(fwidth(tiles), vec2(.001));
    float line = 1.0 - min(min(grid.x, grid.y), 1.0);
    float checker = mod(floor(tiles.x) + floor(tiles.y), 2.0);
    float distanceFade = 1.0 - smoothstep(0.0, uRun, -vWorld.z);
    float sideFade = 1.0 - smoothstep(uHalfWidth, uHalfWidth * 4.0, abs(vWorld.x));
    gl_FragColor = vec4(vec3(.014 + checker * .012 + line * .065), distanceFade * sideFade * .9);
  }
`;

function paintLabels(canvas: HTMLCanvasElement, index: number, layout: RibbonLayout, button: HTMLButtonElement) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.ceil(layout.cardWidth * ratio);
  canvas.height = Math.ceil(layout.cardHeight * ratio);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas text is unavailable');
  ctx.scale(ratio, ratio);
  const step = buildSteps[index];
  const width = layout.cardWidth, height = layout.cardHeight;
  const padding = layout.compact ? 19 : 24;
  const caption = button.querySelector('strong')!;
  const titleStyle = getComputedStyle(caption);
  const fontSize = parseFloat(titleStyle.fontSize);
  ctx.font = `400 ${fontSize}px ${titleStyle.fontFamily}`;
  const lines: string[] = [];
  let line = '';
  for (const word of step.title.split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > width - padding * 2 - 46) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  lines.push(line);
  const baseline = height - 24;
  ctx.fillStyle = '#ffffff';
  lines.forEach((text, i) => ctx.fillText(text, padding, baseline - (lines.length - 1 - i) * fontSize));
  ctx.font = `${layout.compact ? 7 : 8}px ui-monospace, monospace`;
  ctx.fillStyle = '#dddcd6';
  ctx.fillText(step.category.toUpperCase(), padding, baseline - lines.length * fontSize - 7);

  ctx.fillStyle = '#00000065';
  ctx.beginPath(); ctx.roundRect(padding, 18, 58, 25, 13); ctx.fill();
  ctx.strokeStyle = '#ffffff45'; ctx.lineWidth = .7; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.font = '9px ui-monospace, monospace';
  ctx.fillText(`${String(step.id).padStart(2, '0')} / ${String(buildSteps.length).padStart(2, '0')}`, padding + 10, 34);

  const x = width - padding - 17, y = height - 38;
  const focused = button.matches(':hover, :focus-visible');
  ctx.fillStyle = focused ? '#cdff70' : '#0b0b0bd9';
  ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = focused ? '#111111' : '#ffffff'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x - 5, y + 5); ctx.lineTo(x + 5, y - 5);
  ctx.moveTo(x - 4, y - 5); ctx.lineTo(x + 5, y - 5); ctx.lineTo(x + 5, y + 4); ctx.stroke();
}

/** Photographs, captions and hit boundaries share the same deformed geometry. */
export function GalleryCanvas({ stage, rail, target, current, paused, onActive, onReady }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const surface = canvas.current, container = stage.current, track = rail.current;
    if (!surface || !container || !track) return;
    surface.dataset.sceneReady = 'false';
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let dispose = () => {};
    let cancelled = false;

    async function initialise() {
      if (!surface || !container || !track) return;
      if (motion.matches) { surface.dataset.sceneReady = 'true'; return; }
      const THREE = await import('three');
      if (cancelled) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: surface, antialias: true, alpha: true, powerPreference: 'low-power' });
      } catch { surface.dataset.sceneReady = 'true'; return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(RIBBON_CAMERA.fov, 1, .1, 2000);
      camera.position.z = RIBBON_CAMERA.distance;
      const buttons = Array.from(track.querySelectorAll<HTMLButtonElement>('.build-card'));
      const loader = new THREE.TextureLoader();
      const textures: InstanceType<typeof THREE.Texture>[] = [];
      const cards: {
        mesh: InstanceType<typeof THREE.Mesh<InstanceType<typeof THREE.PlaneGeometry>, InstanceType<typeof THREE.ShaderMaterial>>>;
        label: HTMLCanvasElement;
        texture: InstanceType<typeof THREE.CanvasTexture>;
        hover: boolean;
      }[] = [];
      let frame = 0, previousTime = 0, active = -1;
      let ended = false, dirty = true;
      let layout = ribbonLayout(container.clientWidth, container.clientHeight);
      const observers: ResizeObserver[] = [];
      const floorGeometry = new THREE.PlaneGeometry(1, 1, 48, 24);
      const floorMaterial = new THREE.ShaderMaterial({
        vertexShader: 'varying vec3 vWorld;void main(){vWorld=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader: floorShader,
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
        uniforms: { uCell: { value: 1 }, uHalfWidth: { value: 1 }, uRun: { value: 1 } },
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.renderOrder = -1;
      scene.add(floor);
      const invalidate = () => { dirty = true; };
      const loseContext = (event: Event) => { event.preventDefault(); dispose(); };
      dispose = () => {
        if (ended) return;
        ended = true;
        cancelAnimationFrame(frame);
        observers.forEach(observer => observer.disconnect());
        surface.removeEventListener('webglcontextlost', loseContext);
        for (const event of ['pointerover', 'pointerout', 'focusin', 'focusout']) track.removeEventListener(event, invalidate);
        track.removeAttribute('data-rendered');
        buttons.forEach(button => button.removeAttribute('style'));
        cards.forEach(card => { card.mesh.geometry.dispose(); card.mesh.material.dispose(); });
        textures.forEach(texture => texture.dispose());
        floorGeometry.dispose(); floorMaterial.dispose(); renderer.dispose();
        surface.dataset.sceneReady = 'true';
        onReady(false);
      };
      surface.addEventListener('webglcontextlost', loseContext);
      for (const event of ['pointerover', 'pointerout', 'focusin', 'focusout']) track.addEventListener(event, invalidate);
      try {
        const images = await Promise.all(buildSteps.map(async step => {
          const texture = await loader.loadAsync(photoPath(String(step.id), 'cover'));
          if (ended || cancelled) { texture.dispose(); return null; }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
          textures.push(texture);
          return texture;
        }));
        if (cancelled || ended) { dispose(); return; }
        images.forEach((image, index) => {
          if (!image) return;
          const label = document.createElement('canvas');
          paintLabels(label, index, layout, buttons[index]);
          const texture = new THREE.CanvasTexture(label);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
          textures.push(texture);
          const material = new THREE.ShaderMaterial({
            vertexShader, fragmentShader, transparent: true, side: THREE.DoubleSide,
            uniforms: {
              uImage: { value: image }, uLabels: { value: texture },
              uSize: { value: new THREE.Vector2() }, uAspect: { value: image.image.width / image.image.height },
              uRadius: { value: layout.radius }, uWidth: { value: layout.halfWidth },
            },
          });
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 64, 16), material);
          const positions = mesh.geometry.getAttribute('position');
          if (positions instanceof THREE.BufferAttribute) positions.setUsage(THREE.DynamicDrawUsage);
          mesh.frustumCulled = false;
          cards.push({ mesh, label, texture, hover: buttons[index].matches(':hover, :focus-visible') });
          scene.add(mesh);
        });
      } catch { dispose(); return; }

      const resize = () => {
        dirty = true;
        layout = ribbonLayout(container.clientWidth, container.clientHeight);
        renderer.setSize(layout.width, layout.height, false);
        camera.aspect = layout.width / layout.height;
        camera.updateProjectionMatrix();
        cards.forEach((card, index) => {
          const uniforms = card.mesh.material.uniforms;
          uniforms.uSize.value.set(layout.cardWidth, layout.cardHeight);
          uniforms.uRadius.value = layout.radius;
          uniforms.uWidth.value = layout.halfWidth;
          // WebGL texture storage has fixed dimensions; release it before resizing the canvas.
          card.texture.dispose();
          paintLabels(card.label, index, layout, buttons[index]);
          card.texture.needsUpdate = true;
        });
        // A stationary ground plane, leaning with the same perspective as the ribbon.
        const floorY = (layout.height / 2 - layout.centreY - layout.cardHeight / 2) * layout.unitsPerPixel - layout.halfHeight * .06;
        const back = layout.halfHeight * 6;
        const front = Math.min(RIBBON_CAMERA.distance * (1 - Math.abs(floorY) / layout.halfHeight) + layout.halfHeight * .2, RIBBON_CAMERA.distance * .8);
        const uv = floorGeometry.getAttribute('uv'), positions = floorGeometry.getAttribute('position');
        for (let i = 0; i < positions.count; i++) {
          const x = (uv.getX(i) - .5) * layout.halfWidth * 8;
          const z = front - uv.getY(i) * (front + back);
          positions.setXYZ(i, x, floorY, z + ribbonLean(x, layout.halfWidth));
        }
        positions.needsUpdate = true;
        floorGeometry.computeBoundingSphere();
        floorMaterial.uniforms.uCell.value = layout.halfHeight * .22;
        floorMaterial.uniforms.uHalfWidth.value = layout.halfWidth;
        floorMaterial.uniforms.uRun.value = back;
      };
      resize();
      const observer = new ResizeObserver(resize);
      observers.push(observer); observer.observe(container);
      track.dataset.rendered = 'true';
      track.scrollLeft = 0;
      onReady(true);

      const tick = (time: number) => {
        frame = requestAnimationFrame(tick);
        const dt = Math.min((time - previousTime) / 1000 || 1 / 60, 1 / 30);
        previousTime = time;
        if (document.hidden || paused.current) return;
        if (!dirty && current.current === target.current) return;
        dirty = false;
        current.current = advanceRibbon(current.current, target.current, dt);
        const energy = ribbonEnergy(current.current, target.current, layout);
        const nextActive = wrapStage(Math.round(current.current), buildSteps.length);
        if (nextActive !== active) { active = nextActive; onActive(active); }
        cards.forEach((card, index) => {
          const offset = nearestStage(index, current.current, buildSteps.length) - current.current;
          const x = offset * layout.pitch;
          card.mesh.visible = Math.abs(x) < layout.width + layout.cardWidth;
          const button = buttons[index];
          if (!card.mesh.visible) { button.style.transform = 'translate3d(-10000px,0,0)'; button.style.pointerEvents = 'none'; return; }
          button.style.pointerEvents = 'auto';
          const hover = button.matches(':hover, :focus-visible');
          if (hover !== card.hover) {
            card.hover = hover; paintLabels(card.label, index, layout, button); card.texture.needsUpdate = true;
          }
          const centreX = x * layout.unitsPerPixel;
          const centreY = (layout.height / 2 - layout.centreY) * layout.unitsPerPixel;
          const worldWidth = layout.cardWidth * layout.unitsPerPixel;
          const worldHeight = layout.cardHeight * layout.unitsPerPixel;
          const positions = card.mesh.geometry.getAttribute('position');
          const uv = card.mesh.geometry.getAttribute('uv');
          for (let i = 0; i < positions.count; i++) {
            const point = ribbonSurface(centreX + (uv.getX(i) - .5) * worldWidth, centreY + (uv.getY(i) - .5) * worldHeight, layout, energy);
            positions.setXYZ(i, point.x, point.y, point.z);
          }
          positions.needsUpdate = true;
          // Project the curved top/bottom edges for a matching DOM click boundary.
          const boundary: { x: number; y: number }[] = [];
          for (let i = 0; i <= 32; i++) boundary.push(projectRibbonPoint(ribbonSurface(centreX + (i / 32 - .5) * worldWidth, centreY + worldHeight / 2, layout, energy), layout));
          for (let i = 32; i >= 0; i--) boundary.push(projectRibbonPoint(ribbonSurface(centreX + (i / 32 - .5) * worldWidth, centreY - worldHeight / 2, layout, energy), layout));
          const left = Math.min(...boundary.map(p => p.x)), right = Math.max(...boundary.map(p => p.x));
          const top = Math.min(...boundary.map(p => p.y)), bottom = Math.max(...boundary.map(p => p.y));
          button.style.width = `${right - left}px`;
          button.style.height = `${bottom - top}px`;
          button.style.transform = `translate3d(${left}px,${top}px,0)`;
          button.style.clipPath = `polygon(${boundary.map(p => `${(p.x - left).toFixed(2)}px ${(p.y - top).toFixed(2)}px`).join(',')})`;
        });
        renderer.render(scene, camera);
        if (surface.dataset.sceneReady !== 'true') surface.dataset.sceneReady = 'true';
      };
      frame = requestAnimationFrame(tick);
    }
    const preferenceChange = () => { cancelled = true; dispose(); };
    motion.addEventListener('change', preferenceChange);
    void initialise().catch(() => { dispose(); surface.dataset.sceneReady = 'true'; });
    return () => { cancelled = true; motion.removeEventListener('change', preferenceChange); dispose(); };
  }, [stage, rail, target, current, paused, onActive, onReady]);

  return <canvas ref={canvas} className="build-canvas" aria-hidden="true" />;
}
