"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Box, Label } from "./primitives";
import { useRangeScan } from "./RangeScanContext";
import { scanObstacles, scanOrigin, scanRadius } from "./rangeScan";

export function RangeScanEnvironment() {
  const scan = useRangeScan();
  const beam = useRef<THREE.Group>(null);
  const ray = useRef<THREE.Mesh>(null);
  const outgoing = useRef<THREE.Mesh>(null);
  const incoming = useRef<THREE.Mesh>(null);
  const echo = useRef<THREE.Mesh>(null);
  const mapPoints = useRef<THREE.Points>(null);
  const surfaces = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const { grid, cone, points } = useMemo(() => {
    const vertices: number[] = [];
    for (const radius of [2.1, 4.2, scanRadius]) {
      for (let i = 0; i < 90; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 90, b = a + Math.PI / 90;
        vertices.push(Math.sin(a) * radius, 0, Math.cos(a) * radius, Math.sin(b) * radius, 0, Math.cos(b) * radius);
      }
    }
    for (let degree = -90; degree <= 90; degree += 15) {
      const a = degree * Math.PI / 180;
      const inner = degree % 45 === 0 ? 0.9 : scanRadius - 0.16;
      vertices.push(Math.sin(a) * inner, 0, Math.cos(a) * inner, Math.sin(a) * scanRadius, 0, Math.cos(a) * scanRadius);
    }
    const grid = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    const cone = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0.33, -0.32, -0.1, 1, 0.32, -0.1, 1], 3));
    cone.computeVertexNormals();
    const points = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(61 * 3), 3));
    points.setDrawRange(0, 0);
    return { grid, cone, points };
  }, []);
  useEffect(() => () => { grid.dispose(); cone.dispose(); points.dispose(); }, [grid, cone, points]);

  useFrame(() => {
    const state = scan.current;
    const distance = state.distance;
    if (beam.current) beam.current.rotation.y = state.angle;
    if (ray.current) { ray.current.position.z = (distance + 0.32) / 2; ray.current.scale.y = distance - 0.32; }
    if (outgoing.current) outgoing.current.position.z = 0.32 + ((state.time * 1.3) % 1) * (distance - 0.32);
    if (incoming.current) { incoming.current.visible = state.hit !== null; incoming.current.position.z = distance - ((state.time * 1.3) % 1) * (distance - 0.32); }
    if (echo.current) { echo.current.visible = state.hit !== null; echo.current.position.z = distance; }
    surfaces.current.forEach((material, i) => { if (material) material.emissiveIntensity = state.hit === scanObstacles[i].id ? 0.22 : 0; });
    const positions = points.attributes.position as THREE.BufferAttribute;
    let index = 0;
    for (const sample of state.samples.values()) positions.setXYZ(index++, Math.sin(sample.angle) * sample.distance, 0.035, Math.cos(sample.angle) * sample.distance);
    positions.needsUpdate = true;
    points.setDrawRange(0, index);
    points.computeBoundingSphere();
  });

  return <group name="180 degree distance survey">
    <mesh position={[0, -0.09, 2.8]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[7.5, 80]} /><meshStandardMaterial color="#f4f6f0" transparent opacity={0.75} roughness={1} /></mesh>
    <group position={[0, -0.06, scanOrigin[2]]}>
      <lineSegments geometry={grid}><lineBasicMaterial color="#abbc91" transparent opacity={0.42} /></lineSegments>
      <points ref={mapPoints} geometry={points}><pointsMaterial color="#719743" size={0.065} sizeAttenuation /></points>
      {[-90, -45, 0, 45, 90].map((degrees) => {
        const angle = degrees * Math.PI / 180;
        return <Label key={degrees} text={`${degrees > 0 ? "+" : ""}${degrees}°`} position={[Math.sin(angle) * (scanRadius + 0.3), 0.015, Math.cos(angle) * (scanRadius + 0.3)]} width={0.6} height={0.2} color="#849472" />;
      })}
    </group>
    {scanObstacles.map((obstacle, i) => <group key={obstacle.id} position={obstacle.position}>
      <mesh position={[0, obstacle.size[1] / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={obstacle.size} />
        <meshStandardMaterial ref={(material) => { surfaces.current[i] = material; }} color={obstacle.colour} roughness={0.85} emissive="#b4da79" emissiveIntensity={0} />
      </mesh>
      {[0.94, 1.89].map((y) => <Box key={y} size={[obstacle.size[0] + 0.02, 0.018, obstacle.size[2] + 0.02]} position={[0, y, 0]} color="#87917b" />)}
      <Html position={[0, obstacle.size[1] + 0.26, 0]} center zIndexRange={[7, 0]} style={{ pointerEvents: "none" }}><span className="scan-object-label">{obstacle.id}</span></Html>
    </group>)}
    <group ref={beam} position={scanOrigin}>
      <mesh ref={ray} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 1, 6]} /><meshBasicMaterial color="#8cba52" transparent opacity={0.75} />
      </mesh>
      <mesh ref={outgoing} position={[0, 0, 0.33]}><sphereGeometry args={[0.057, 12, 8]} /><meshBasicMaterial color="#a7d870" /></mesh>
      <mesh ref={incoming} position={[0.03, 0.025, 1]}><sphereGeometry args={[0.039, 12, 8]} /><meshBasicMaterial color="#e3b367" /></mesh>
      <mesh ref={echo}><sphereGeometry args={[0.08, 16, 12]} /><meshBasicMaterial color="#dfb065" /></mesh>
      <mesh geometry={cone} scale={[1, 1, 1.7]}><meshBasicMaterial color="#9dbc6f" side={THREE.DoubleSide} transparent opacity={0.11} depthWrite={false} /></mesh>
    </group>
  </group>;
}
