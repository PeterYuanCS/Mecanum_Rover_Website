"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, C, Cylinder, Label, Screw } from "./primitives";

// Local +Z points forwards; the bracket foot sits on the upper chassis deck.
export function UltrasonicSensor({ focus = 0, reduced = false }: { focus?: number; reduced?: boolean }) {
  const { board, bracket, foot, grille } = useMemo(() => {
    const pcb = new THREE.Shape();
    pcb.moveTo(-0.65, 0.2);
    pcb.lineTo(0.65, 0.2);
    pcb.lineTo(0.65, 0.8);
    pcb.lineTo(-0.65, 0.8);
    pcb.closePath();
    for (const x of [-0.59, 0.59]) {
      for (const y of [0.26, 0.74]) {
        const hole = new THREE.Path();
        hole.absarc(x, y, 0.028, 0, Math.PI * 2, true);
        pcb.holes.push(hole);
      }
    }

    const mount = new THREE.Shape();
    mount.moveTo(-0.72, 0);
    mount.lineTo(0.72, 0);
    mount.lineTo(0.72, 0.5);
    mount.absarc(0.36, 0.5, 0.36, 0, Math.PI, false);
    mount.absarc(-0.36, 0.5, 0.36, 0, Math.PI, false);
    mount.lineTo(-0.72, 0);
    for (const x of [-0.36, 0.36]) {
      const hole = new THREE.Path();
      hole.absarc(x, 0.5, 0.244, 0, Math.PI * 2, true);
      mount.holes.push(hole);
    }

    const base = new THREE.Shape();
    base.moveTo(-0.74, -0.38);
    base.lineTo(0.74, -0.38);
    base.lineTo(0.74, 0.16);
    base.lineTo(-0.74, 0.16);
    base.closePath();
    for (const x of [-0.48, 0.48]) {
      const slot = new THREE.Path();
      slot.absarc(x + 0.065, -0.22, 0.038, -Math.PI / 2, Math.PI / 2, false);
      slot.absarc(x - 0.065, -0.22, 0.038, Math.PI / 2, Math.PI * 1.5, false);
      slot.closePath();
      base.holes.push(slot);
    }

    const vertices: number[] = [];
    for (let i = -11; i <= 11; i++) {
      const d = i * 0.016;
      const edge = Math.sqrt(0.187 ** 2 - d ** 2);
      vertices.push(d, -edge, 0, d, edge, 0, -edge, d, 0, edge, d, 0);
    }
    const mesh = new THREE.BufferGeometry();
    mesh.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    const extrude = (shape: THREE.Shape, depth: number) => new THREE.ExtrudeGeometry(shape, {
      depth, bevelEnabled: false, curveSegments: 32,
    });
    return { board: extrude(pcb, 0.035), bracket: extrude(mount, 0.055), foot: extrude(base, 0.055), grille: mesh };
  }, []);

  useEffect(() => () => {
    board.dispose();
    bracket.dispose();
    foot.dispose();
    grille.dispose();
  }, [board, bracket, foot, grille]);

  return (
    <group>
      <mesh geometry={foot} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.055, 0]}>
        <meshStandardMaterial color="#bad8df" transparent opacity={0.5} roughness={0.2} metalness={0.15} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={bracket} position={[0, 0, 0.105]}>
        <meshStandardMaterial color="#bad8df" transparent opacity={0.36} roughness={0.18} metalness={0.15} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {[-0.48, 0.48].map((x) => (
        <group key={x}>
          <Screw position={[x, 0.073, -0.22]} />
          <Cylinder radius={0.027} height={0.14} position={[x, 0, -0.22]} />
          <Cylinder radius={0.054} height={0.035} position={[x, -0.085, -0.22]} segments={6} />
        </group>
      ))}

      <mesh geometry={board} castShadow receiveShadow>
        <meshStandardMaterial color="#123f77" metalness={0.15} roughness={0.45} />
      </mesh>
      {[-0.59, 0.59].flatMap((x) => [0.26, 0.74].map((y) => (
        <mesh key={`${x}-${y}`} position={[x, y, 0.036]}>
          <ringGeometry args={[0.028, 0.043, 20]} />
          <meshStandardMaterial color={C.edge} metalness={0.7} roughness={0.3} />
        </mesh>
      )))}
      {[-0.36, 0.36].map((x) => (
        <group key={x} position={[x, 0.5, 0.035]}>
          <Cylinder radius={0.228} height={0.29} position={[0, 0, 0.145]} rotation={[Math.PI / 2, 0, 0]} color="#b8c3c7" segments={48} />
          <mesh position={[0, 0, 0.293]}>
            <circleGeometry args={[0.199, 48]} />
            <meshStandardMaterial color="#151d24" roughness={0.85} />
          </mesh>
          <lineSegments geometry={grille} position={[0, 0, 0.296]} rotation={[0, 0, Math.PI / 4]}>
            <lineBasicMaterial color="#79858b" />
          </lineSegments>
          <mesh position={[0, 0, 0.298]}>
            <torusGeometry args={[0.211, 0.018, 8, 48]} />
            <meshStandardMaterial color="#e1e8e8" metalness={0.8} roughness={0.24} />
          </mesh>
        </group>
      ))}
      <Box size={[0.19, 0.105, 0.06]} position={[0, 0.49, 0.071]} color="#b7bcb7" radius={0.025} metalness={0.7} />
      <group position={[0, 0.73, 0.037]} rotation={[Math.PI / 2, 0, 0]}>
        <Label text="HC-SR04" width={0.46} height={0.073} />
      </group>

      {/* Four right-angle header pins and the small ICs on the back of the PCB. */}
      <Box size={[0.3, 0.075, 0.09]} position={[0, 0.235, -0.042]} />
      {['VCC', 'TRIG', 'ECHO', 'GND'].map((pin, i) => (
        <group key={pin} position={[(i - 1.5) * 0.075, 0.235, 0]}>
          <Box size={[0.018, 0.018, 0.2]} position={[0, 0, -0.11]} color={C.gold} metalness={0.7} />
          <Box size={[0.05, 0.06, 0.105]} position={[0, 0, -0.22]} />
          <group position={[0, 0.07, -0.004]} rotation={[-Math.PI / 2, 0, 0]}>
            <Label text={pin} width={0.075} height={0.055} size={38} />
          </group>
        </group>
      ))}
      {[-0.43, 0, 0.43].map((x) => (
        <group key={x} position={[x, 0.53, -0.035]}>
          <Box size={[0.2, 0.12, 0.06]} color="#192326" />
          {[-1, 1].flatMap((side) => Array.from({ length: 4 }, (_, i) => (
            <Box key={`${side}-${i}`} size={[0.021, 0.045, 0.019]} position={[(i - 1.5) * 0.046, side * 0.078, 0]} color={C.edge} metalness={0.6} />
          )))}
        </group>
      ))}
      <EchoWaves focus={focus} reduced={reduced} />
    </group>
  );
}

function EchoWaves({ focus, reduced }: { focus: number; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const time = useRef(0);
  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.visible = focus > 0.01;
    if (focus <= 0.01) return;
    if (!reduced) time.current += Math.min(dt, 0.05) * 0.5;
    group.current.children.forEach((child, i) => {
      const phase = reduced ? (i + 0.5) / 3 : (time.current + i / 3) % 1;
      child.position.z = 0.42 + phase * 1.1;
      child.scale.setScalar(0.45 + phase * 0.7);
      ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = focus * (1 - phase) * 0.55;
    });
  });
  return (
    <group ref={group} position={[0, 0.5, 0]} visible={false}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, Math.PI / 6]}>
          <torusGeometry args={[0.55, 0.011, 6, 32, Math.PI * 2 / 3]} />
          <meshBasicMaterial color="#85b342" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
