"use client";

import { Box, Cylinder, Label, Screw, Wire } from "./primitives";

// An illustrative O4 Air Unit Pro camera, modelled from the supplied photographs.
// The mount origin shares the front HC-SR04 bracket's deck position; +Z is forward.
export function VisionCamera() {
  return (
    <group name="DJI O4 Air Unit Pro camera and raised mount">
      {[-0.61, 0.61].map((x) => (
        <group key={x}>
          <Box size={[0.17, 0.075, 0.57]} position={[x, 0.055, -0.17]} color="#353d40" radius={0.025} metalness={0.65} />
          <Screw position={[x, 0.105, -0.35]} />
          <Box size={[0.085, 1.24, 0.15]} position={[x, 0.69, -0.28]} color="#333b3d" radius={0.025} metalness={0.65} />
          <Box size={[0.26, 0.12, 0.17]} position={[x * 0.82, 1.25, -0.23]} color="#333b3d" radius={0.025} metalness={0.65} />
        </group>
      ))}
      <group position={[0, 1.26, -0.12]}>
        <Box size={[0.76, 0.7, 0.65]} color="#25292b" radius={0.115} metalness={0.4} />
        <Box size={[0.68, 0.58, 0.17]} position={[0, -0.015, -0.31]} color="#1b2022" radius={0.065} />
        <Box size={[0.59, 0.1, 0.47]} position={[0, 0.326, -0.02]} color="#303537" radius={0.04} metalness={0.5} />
        <Screw position={[0, 0.388, -0.045]} />
        {[-1, 1].flatMap((side) => [-1, 1].map((height) => (
          <group key={`${side}-${height}`} position={[side * 0.406, height * 0.235, -0.22]} rotation={[0, 0, Math.PI / 2]}>
            <Cylinder radius={0.068} height={0.09} color="#292f31" segments={16} />
            <Cylinder radius={0.026} height={0.094} color="#111719" segments={6} />
          </group>
        )))}
        <Cylinder radius={0.315} height={0.115} position={[0, 0, 0.31]} rotation={[Math.PI / 2, 0, 0]} color="#14191c" segments={64} />
        <mesh position={[0, 0, 0.374]}>
          <torusGeometry args={[0.286, 0.016, 8, 64]} />
          <meshStandardMaterial color="#697474" metalness={0.85} roughness={0.24} />
        </mesh>
        <mesh position={[0, 0, 0.374]} scale={[1, 1, 0.27]}>
          <sphereGeometry args={[0.268, 48, 32]} />
          <meshPhysicalMaterial color="#102c2b" metalness={0.72} roughness={0.075} clearcoat={1} clearcoatRoughness={0.04} />
        </mesh>
        <Cylinder radius={0.112} height={0.008} position={[0, 0, 0.446]} rotation={[Math.PI / 2, 0, 0]} color="#081b20" segments={40} />
        <mesh position={[-0.067, 0.071, 0.443]} scale={[1, 0.48, 0.2]} rotation={[0, 0, -0.5]}>
          <sphereGeometry args={[0.073, 20, 12]} />
          <meshBasicMaterial color="#a8ddd0" transparent opacity={0.48} />
        </mesh>
        <group position={[0.385, 0, 0.02]} rotation={[Math.PI / 2, Math.PI / 2, 0]}>
          <Label text="1/1.3" width={0.3} height={0.085} />
          <Label text="F2.8" position={[0, 0.001, 0.09]} width={0.3} height={0.08} />
        </group>
        <group position={[0, -0.29, 0.334]} rotation={[Math.PI / 2, 0, 0]}>
          <Label text="DJI O4" width={0.34} height={0.065} color="#a7aeac" />
        </group>
      </group>
      <Wire color="#22282a" radius={0.025} points={[[0, 1.28, -0.49], [0.19, 1.2, -0.72], [0.37, 0.65, -0.68], [0.4, 0.24, -0.8], [0.3, 0.19, -1.02]]} />
      <Box size={[0.2, 0.06, 0.13]} position={[0.3, 0.19, -1.02]} color="#191f22" radius={0.013} />
    </group>
  );
}
