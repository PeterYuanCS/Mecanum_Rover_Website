"use client";

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CarModel } from '@/components/car/CarModel';
import { RotatingDistanceSensor } from '@/components/car/RotatingDistanceSensor';
import { RangeScanProvider } from '@/components/car/RangeScanContext';
import { VisionCamera } from '@/components/car/VisionCamera';
import { UltrasonicSensor } from '@/components/car/UltrasonicSensor';

export type SketchKind = 'rover' | 'stack' | 'scan' | 'vision';

// The original geometry is rendered to a normal buffer. A second pass turns
// surface changes into contours and directional light into graphite hatching.
// No downloaded textures, fonts, models or post-processing dependencies.
function GraphitePass({ onImage, onLost }: { onImage: (data: string) => void; onLost: () => void }) {
  const { gl, scene, camera, size, invalidate } = useThree();
  const frames = useRef(0);
  const snapshotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pass = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(1, 1);
    const normal = new THREE.MeshNormalMaterial();
    const material = new THREE.ShaderMaterial({
      uniforms: { source: { value: target.texture }, resolution: { value: new THREE.Vector2(1, 1) } },
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D source;
        uniform vec2 resolution;
        float grain(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
        void main(){
          vec2 px=1./resolution;
          vec2 point=vUv*resolution;
          vec2 wobble=vec2(sin(point.y*.13),cos(point.x*.15))*.38*px;
          vec4 n=texture2D(source,vUv+wobble);
          float edge=0.;
          edge=max(edge,length(n-texture2D(source,vUv+wobble+vec2(px.x*1.1,0.))));
          edge=max(edge,length(n-texture2D(source,vUv+wobble+vec2(0.,px.y*1.1))));
          edge=max(edge,length(n-texture2D(source,vUv+wobble-vec2(px.x*1.1,0.))));
          edge=max(edge,length(n-texture2D(source,vUv+wobble-vec2(0.,px.y*1.1))));
          vec3 normal=normalize(n.rgb*2.-1.);
          float shade=1.-max(0.,dot(normal,normalize(vec3(-.5,.8,.9))));
          float stroke=1.-smoothstep(.08,.25,abs(sin((point.x+point.y*.85)*.8+sin(point.y*.045)*.7)));
          float cross=1.-smoothstep(.06,.18,abs(sin((point.x-point.y*.72)*.7)));
          float ink=n.a*(.025+shade*.06+stroke*shade*.25+cross*smoothstep(.6,1.,shade)*.18);
          ink+=min(edge*.7,.72);
          ink*=.76+grain(point)*.24;
          gl_FragColor=vec4(vec3(1.)-vec3(.90,.89,.86)*min(ink,.80),1.);
        }`,
      depthTest: false, depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    const screen = new THREE.Scene();
    screen.add(quad);
    return { target, normal, material, quad, screen, camera: new THREE.Camera() };
  }, []);
  useEffect(() => {
    const ratio = gl.getPixelRatio();
    pass.target.setSize(size.width * ratio, size.height * ratio);
    pass.material.uniforms.resolution.value.set(size.width * ratio, size.height * ratio);
    frames.current = 0;
    invalidate();
  }, [gl, size, pass, invalidate]);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onLost(); };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onLost]);
  useEffect(() => () => {
    if (snapshotTimer.current) clearTimeout(snapshotTimer.current);
    pass.target.dispose(); pass.normal.dispose(); pass.material.dispose(); pass.quad.geometry.dispose();
  }, [pass]);
  useFrame(() => {
    const old = scene.overrideMaterial;
    scene.overrideMaterial = pass.normal;
    gl.setClearColor(0xffffff, 0);
    gl.setRenderTarget(pass.target);
    gl.clear(); gl.render(scene, camera);
    scene.overrideMaterial = old;
    gl.setRenderTarget(null);
    gl.setClearColor(0xffffff, 1);
    gl.render(pass.screen, pass.camera);
    frames.current++;
    gl.domElement.dataset.sceneReady = 'true';
    // Capture the settled drawing, without encoding images during each drag frame.
    if (snapshotTimer.current) clearTimeout(snapshotTimer.current);
    snapshotTimer.current = setTimeout(() => onImage(gl.domElement.toDataURL('image/png')), 160);
    if (frames.current < 4) invalidate();
  }, 1);
  return null;
}

function Drawing({ kind, onImage, onLost, angle }: { kind: SketchKind; onImage: (data: string) => void; onLost: () => void; angle: number }) {
  const { camera, size, invalidate } = useThree();
  const detail = kind === 'scan' || kind === 'vision';
  const targetY = kind === 'stack' ? 2.9 : detail ? .7 : 1;
  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;
    const distance = detail ? 5 : 12;
    cam.position.set(Math.sin(angle) * distance, targetY + distance * .65, Math.cos(angle) * distance);
    cam.zoom = Math.min(size.width / (detail ? 4.8 : 9.7), size.height / (kind === 'stack' ? 10.5 : detail ? 3.3 : 6.3));
    cam.lookAt(0, targetY, 0);
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, size, targetY, detail, kind, angle, invalidate]);
  return <>
    <RangeScanProvider enabled={kind === 'scan'} playing={false} reduced>
      {kind === 'scan' ? <RotatingDistanceSensor /> : kind === 'vision' ? <><VisionCamera /><UltrasonicSensor reduced /></> :
        <CarModel reduced progress={-1} sensorFocus={false} futureStack={kind === 'stack'} explode={kind === 'stack' ? .85 : 0} />}
    </RangeScanProvider>
    <OrbitControls target={[0, targetY, 0]} enableZoom={false} enablePan={false} enableDamping={false} minPolarAngle={.15} maxPolarAngle={Math.PI / 2} />
    <GraphitePass onImage={onImage} onLost={onLost} />
  </>;
}

export default function PencilScene(props: { kind: SketchKind; onImage: (data: string) => void; onLost: () => void; angle: number }) {
  return <Canvas orthographic frameloop="demand" dpr={[1, 1.5]} camera={{ position: [9, 8, 10], near: .1, far: 100 }} gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'low-power' }}>
    <Drawing {...props} />
  </Canvas>;
}
