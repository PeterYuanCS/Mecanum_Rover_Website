"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Box, Cylinder, type Vec3 } from "./primitives";

export const visionSubjects = [
  { name: "Tree", kind: "Vegetation", meaning: "A tree borders the route. Keep a clear margin around its trunk.", action: "Keep to the open path", position: [-3.6, 0, 5.7] as Vec3, size: [1.8, 3.2, 1.7] as Vec3, colour: "#729845" },
  { name: "Person", kind: "Pedestrian", meaning: "A person is crossing ahead. Give them space before continuing.", action: "Slow down and yield", position: [-0.1, 0, 7.2] as Vec3, size: [1.05, 2.55, 0.8] as Vec3, colour: "#438e97" },
  { name: "Obstacle", kind: "Blocked route", meaning: "A crate and a cone occupy the route. Look for a clear way around them.", action: "Plan a route around", position: [3.3, 0, 5.5] as Vec3, size: [1.8, 1.5, 1.45] as Vec3, colour: "#b27a39" },
] as const;

function Tree({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return <group position={position} scale={scale}>
    <Cylinder radius={0.115} height={1.65} position={[0, 0.82, 0]} color="#847257" segments={9} />
    <Cylinder radius={0.068} height={0.9} position={[0.19, 1.2, 0]} rotation={[0, 0, -0.52]} color="#847257" segments={7} />
    {[[0, 2.3, 0, 0.82], [-0.42, 1.87, 0.12, 0.6], [0.43, 2.02, -0.04, 0.62]].map(([x, y, z, radius], i) => <mesh key={i} position={[x, y, z]} scale={[1, 1.1, 0.95]} castShadow>
      <icosahedronGeometry args={[radius, 1]} />
      <meshStandardMaterial color={["#95ad78", "#7d9864", "#aec190"][i]} roughness={0.95} />
    </mesh>)}
  </group>;
}

function Person({ phase = 0, moving = false, reduced = false }: { phase?: number; moving?: boolean; reduced?: boolean }) {
  const legs = useRef<THREE.Group>(null);
  const arms = useRef<THREE.Group>(null);
  const time = useRef(phase);
  useFrame((_, dt) => {
    if (!moving || reduced) return;
    time.current += Math.min(dt, 0.05) * 2;
    legs.current?.children.forEach((leg, i) => { leg.rotation.x = Math.sin(time.current) * (i ? -0.22 : 0.22); });
    arms.current?.children.forEach((arm, i) => { arm.rotation.x = Math.sin(time.current) * (i ? 0.16 : -0.16); });
  });
  return <group>
    <mesh position={[0, 2.16, 0]} castShadow><sphereGeometry args={[0.2, 20, 16]} /><meshStandardMaterial color="#bba38a" roughness={0.8} /></mesh>
    <Box size={[0.52, 0.78, 0.31]} position={[0, 1.57, 0]} radius={0.14} color="#597f84" />
    <group ref={arms} position={[0, 1.88, 0]}>
      {[-1, 1].map((side) => <group key={side} position={[side * 0.34, 0, 0]} rotation={[0, 0, side * 0.08]}><Box size={[0.14, 0.75, 0.16]} position={[0, -0.34, 0]} radius={0.065} color="#698d90" /><mesh position={[0, -0.75, 0]}><sphereGeometry args={[0.086, 12, 8]} /><meshStandardMaterial color="#bba38a" /></mesh></group>)}
    </group>
    <group ref={legs} position={[0, 1.23, 0]}>
      {[-1, 1].map((side) => <group key={side} position={[side * 0.145, 0, 0]}><Box size={[0.21, 1.04, 0.23]} position={[0, -0.5, 0]} radius={0.055} color="#424b4e" /><Box size={[0.24, 0.14, 0.4]} position={[0, -1.08, 0.065]} radius={0.05} color="#e5e6dd" /></group>)}
    </group>
  </group>;
}

function Obstacles() {
  return <group>
    <Box size={[1.07, 0.95, 1.03]} position={[-0.27, 0.48, 0]} radius={0.035} color="#c2ab80" />
    {[-0.6, 0.08].map((x) => <Box key={x} size={[0.12, 0.99, 1.07]} position={[x, 0.5, 0]} color="#af966c" />)}
    {[0.24, 0.55, 0.84].map((y) => <Box key={y} size={[1.07, 0.018, 0.01]} position={[-0.27, y, 0.524]} color="#9c845e" />)}
    <group position={[0.62, 0, 0.25]}>
      <Box size={[0.52, 0.09, 0.52]} position={[0, 0.045, 0]} radius={0.035} color="#3c4341" />
      <mesh position={[0, 0.43, 0]} castShadow><coneGeometry args={[0.23, 0.75, 24]} /><meshStandardMaterial color="#cb834f" /></mesh>
      <mesh position={[0, 0.46, 0]}><cylinderGeometry args={[0.1, 0.147, 0.16, 24]} /><meshStandardMaterial color="#edece0" /></mesh>
    </group>
  </group>;
}

function TrackingBox({ size, colour, name, active }: { size: Vec3; colour: string; name: string; active: boolean }) {
  const geometry = useMemo(() => {
    const points: number[] = [];
    const [w, h, d] = size;
    for (const x of [-w / 2, w / 2]) for (const y of [0.05, h]) for (const z of [-d / 2, d / 2]) {
      const dx = x > 0 ? -0.26 : 0.26, dy = y > 0.1 ? -0.26 : 0.26, dz = z > 0 ? -0.26 : 0.26;
      points.push(x, y, z, x + dx, y, z, x, y, z, x, y + dy, z, x, y, z, x, y, z + dz);
    }
    return new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  }, [size]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <group>
    <lineSegments geometry={geometry}><lineBasicMaterial color={colour} transparent opacity={active ? 0.9 : 0.2} depthWrite={false} /></lineSegments>
    <Html position={[0, size[1] + 0.2, 0]} center zIndexRange={[7, 0]} style={{ pointerEvents: "none" }}>
      <span className="vision-object-label" data-active={active} style={{ "--object-colour": colour } as React.CSSProperties}>{name}<span>{active ? "Analysing" : "Detected"}</span></span>
    </Html>
  </group>;
}

// Shared origin is the front surface of the camera lens in CarModel.
const lens = new THREE.Vector3(0, 2.512, 3.046);

export function VisionEnvironment({ playing, reduced, step: activeStep, onStep }: { playing: boolean; reduced: boolean; step: number; onStep: (step: number) => void }) {
  const time = useRef(0);
  const lastStep = useRef(-1);
  const subjects = useRef<(THREE.Group | null)[]>([]);
  const beams = useRef<(THREE.Line | null)[]>([]);
  const packets = useRef<(THREE.Mesh | null)[]>([]);
  const sweep = useRef<THREE.Mesh>(null);
  const beamGeometries = useMemo(() => visionSubjects.map(() => new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(6), 3))), []);
  const sweepGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([lens.x, lens.y, lens.z, -4.9, 0.03, 8.1, 4.9, 0.03, 8.1], 3));
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => { beamGeometries.forEach((g) => g.dispose()); sweepGeometry.dispose(); }, [beamGeometries, sweepGeometry]);
  useFrame((_, dt) => {
    if (playing && !reduced) time.current += Math.min(dt, 0.05);
    const step = reduced ? 3 : Math.floor(time.current / 3.5) % 4;
    if (step !== lastStep.current) { lastStep.current = step; onStep(step); }
    visionSubjects.forEach((subject, i) => {
      const group = subjects.current[i];
      const beam = beams.current[i];
      if (!group || !beam) return;
      if (i === 1) group.position.x = subject.position[0] + (reduced ? 0 : Math.sin(time.current * 0.5) * 0.4);
      const active = step === i || step === 3;
      const positions = beamGeometries[i].attributes.position as THREE.BufferAttribute;
      positions.setXYZ(0, lens.x, lens.y, lens.z);
      positions.setXYZ(1, group.position.x, subject.size[1] * 0.52, group.position.z);
      positions.needsUpdate = true;
      beamGeometries[i].computeBoundingSphere();
      (beam.material as THREE.LineBasicMaterial).opacity = active ? 0.55 : 0.08;
      const packet = packets.current[i];
      if (packet) {
        const phase = reduced ? 0.6 : (time.current * 0.65 + i / 3) % 1;
        packet.position.set(THREE.MathUtils.lerp(lens.x, group.position.x, phase), THREE.MathUtils.lerp(lens.y, subject.size[1] * 0.52, phase), THREE.MathUtils.lerp(lens.z, group.position.z, phase));
        packet.visible = active;
      }
    });
    if (sweep.current) (sweep.current.material as THREE.MeshBasicMaterial).opacity = reduced ? 0.035 : 0.025 + Math.sin(time.current * 1.8) * 0.012;
  });
  // The HTML labels update at phase boundaries, not on every animation frame.
  return <group name="Illustrative vision analysis environment">
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.105, 2]} receiveShadow><circleGeometry args={[8, 64]} /><meshStandardMaterial color="#f5f6f1" roughness={1} transparent opacity={0.62} /></mesh>
    {[-1, 1].map((x) => <group key={x}>
      {Array.from({ length: 7 }, (_, i) => <Box key={i} size={[0.035, 0.012, 0.3]} position={[x * 1.6, -0.083, 1.5 + i * 0.95]} color="#dce2d1" />)}
    </group>)}
    <Tree position={[-4.5, 0, 2.2]} scale={0.6} />
    <group position={[1.75, 0, 7.3]} scale={0.63} rotation={[0, -0.7, 0]}><Person /></group>
    {visionSubjects.map((subject, i) => <group key={subject.name}>
      <group ref={(node) => { subjects.current[i] = node; }} position={subject.position}>
        {i === 0 ? <Tree position={[0, 0, 0]} /> : i === 1 ? <Person moving={playing} reduced={reduced} /> : <Obstacles />}
        <TrackingBox size={subject.size} colour={subject.colour} name={subject.name} active={activeStep === i || activeStep === 3} />
      </group>
      <lineSegments ref={(node: THREE.Line | null) => { beams.current[i] = node; }} geometry={beamGeometries[i]}>
        <lineBasicMaterial color={subject.colour} transparent opacity={0.2} depthWrite={false} />
      </lineSegments>
      <mesh ref={(node) => { packets.current[i] = node; }}><sphereGeometry args={[0.047, 12, 8]} /><meshBasicMaterial color={subject.colour} /></mesh>
    </group>)}
    <mesh ref={sweep} geometry={sweepGeometry}><meshBasicMaterial color="#9dbb65" transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} /></mesh>
  </group>;
}
