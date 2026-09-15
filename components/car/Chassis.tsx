"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { Box, C, Cylinder, Screw, Label } from "./primitives";
function roundRect(
  path: THREE.Shape | THREE.Path,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + h - r);
  path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  path.lineTo(x + r, y + h);
  path.quadraticCurveTo(x, y + h, x, y + h - r);
  path.lineTo(x, y + r);
  path.quadraticCurveTo(x, y, x + r, y);
}
export function ChassisPlate({ upper = false, label = "MECANUM / 01" }: { upper?: boolean; label?: string }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    roundRect(shape, -1.59, -2.83, 3.18, 5.66, 0.5);
    for (const x of [-1.39, 1.39])
      for (let z = -2.3; z <= 2.3; z += 0.34) {
        const hole = new THREE.Path();
        hole.absarc(x, z, 0.041, 0, Math.PI * 2, true);
        shape.holes.push(hole);
      }
    for (const z of [-2.5, 2.5]) {
      const slot = new THREE.Path();
      roundRect(slot, -0.95, z - 0.04, 1.9, 0.09, 0.04);
      shape.holes.push(slot);
      const hole = new THREE.Path();
      hole.absarc(0, z * 0.77, 0.22, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
    for (const x of [-1.13, 1.13])
      for (const z of [-1.58, 1.58]) {
        const slot = new THREE.Path();
        roundRect(slot, x - 0.065, z - 0.46, 0.13, 0.92, 0.05);
        shape.holes.push(slot);
      }
    for (let x = -0.9; x < 1; x += 0.3)
      for (let z = -0.8; z < 0.9; z += 0.3) {
        const h = new THREE.Path();
        h.absarc(x, z, 0.04, 0, Math.PI * 2, true);
        shape.holes.push(h);
      }
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.047,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.012,
      bevelThickness: 0.009,
      curveSegments: 8,
    });
  }, []);
  return (
    <group>
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={upper ? "#b4bab7" : "#9ca5a4"}
          metalness={0.78}
          roughness={0.3}
        />
      </mesh>
      {[-1.12, 1.12].flatMap((x) =>
        [-2.33, 2.33].map((z) => (
          <Screw key={`${x},${z}`} position={[x, 0.075, z]} />
        )),
      )}
      {upper && (
        <Label
          text={label}
          position={[0, 0.062, 2.18]}
          color="#424c4b"
          width={1.1}
          height={0.18}
        />
      )}
    </group>
  );
}
export function Standoffs() {
  return (
    <group>
      {[-1.12, 1.12].flatMap((x) =>
        [-2.33, 2.33].map((z) => (
          <group key={`${x},${z}`} position={[x, 0.64, z]}>
            <Cylinder
              radius={0.059}
              height={0.94}
              color={C.gold}
              segments={6}
            />
            <Cylinder radius={0.083} height={0.03} position={[0, 0.47, 0]} />
            <Cylinder radius={0.083} height={0.03} position={[0, -0.47, 0]} />
          </group>
        )),
      )}
    </group>
  );
}
export function Motor() {
  return (
    <group>
      <Box size={[0.58, 0.43, 0.87]} color={C.yellow} radius={0.045} />
      <Cylinder
        radius={0.195}
        height={0.49}
        position={[0, 0, -0.48]}
        rotation={[Math.PI / 2, 0, 0]}
        color="#b6bcba"
      />
      <Box size={[0.32, 0.3, 0.07]} color={C.black} position={[0, 0, -0.74]} />
      <Cylinder
        radius={0.073}
        height={0.36}
        rotation={[0, 0, Math.PI / 2]}
        position={[0.36, 0, 0.17]}
        color="#e2dac0"
      />
      <Box
        size={[0.06, 0.48, 0.51]}
        position={[-0.32, 0, 0.05]}
        color={C.metal}
        metalness={0.7}
      />
      {[-0.15, 0.15].map((z) => (
        <Box
          key={z}
          size={[0.13, 0.05, 0.06]}
          position={[0, 0.23, z]}
          color={C.yellow}
        />
      ))}
    </group>
  );
}
