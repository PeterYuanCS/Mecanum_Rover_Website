"use client";

import { Box, C, Cylinder, Label, Screw, Wire } from "./primitives";

function ModuleBoard({ width = 0.8, depth = 0.65, color = "#22564c" }: { width?: number; depth?: number; color?: string }) {
  return <group>
    <Box size={[width, 0.035, depth]} color={color} radius={0.02} />
    {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
      <group key={`${x}-${z}`} position={[x * (width / 2 - 0.09), 0, z * (depth / 2 - 0.09)]}>
        <Cylinder radius={0.034} height={0.09} position={[0, -0.06, 0]} color={C.gold} segments={6} />
        <Screw position={[0, 0.035, 0]} />
      </group>
    )))}
    {[0, 1, 2].map((i) => <Box key={i} size={[0.035, 0.12, 0.035]} position={[(i - 1) * 0.08, 0.075, -depth / 2 + 0.06]} color={C.gold} metalness={0.6} />)}
  </group>;
}

export function LightModules() {
  return <group>
    <group position={[0, 0.2, 1.3]}>
      <ModuleBoard width={1.35} depth={0.62} />
      {["#e75437", "#efb64f", "#a8e25f"].map((color, i) => (
        <group key={color} position={[(i - 1) * 0.4, 0, 0.02]}>
          {[-0.04, 0.04].map((x) => <Cylinder key={x} radius={0.012} height={0.14} position={[x, 0.075, 0]} />)}
          <Cylinder radius={0.105} height={0.045} position={[0, 0.15, 0]} color="#34483d" />
          <mesh position={[0, 0.22, 0]} scale={[1, 1.2, 1]}>
            <sphereGeometry args={[0.093, 20, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
      <Label text="SIGNAL LIGHTS" position={[0, 0.02, 0.22]} width={0.9} height={0.08} />
    </group>
    <group position={[-0.48, 0.2, -0.65]}>
      <ModuleBoard width={0.62} depth={0.9} color="#244f73" />
      <Box size={[0.17, 0.15, 0.17]} position={[0.12, 0.09, -0.08]} color="#3585ac" />
      <Screw position={[0.12, 0.17, -0.08]} />
      <Cylinder radius={0.14} height={0.04} position={[-0.1, 0.16, 0.2]} color="#d4ad69" />
      {[-0.09, -0.03, 0.03, 0.09].map((z) => <Box key={z} size={[0.17, 0.007, 0.012]} position={[-0.1, 0.185, 0.2 + z]} color="#825831" />)}
      <Label text="LIGHT" position={[0, 0.021, -0.3]} width={0.4} height={0.085} />
    </group>
    {["#b44336", "#d4b54c", "#323e40"].map((color, i) => <Wire key={color} color={color} radius={0.012} points={[
      [-0.08 + i * 0.08, 0.3, 1.05], [0.33 + i * 0.08, 0.34, 0.55], [0.3, 0.3, -0.84 - i * 0.08], [-0.56 + i * 0.08, 0.3, -1.03],
    ]} />)}
  </group>;
}

export function ChimeModules() {
  return <group>
    <group position={[-0.45, 0.2, 0.85]}>
      <ModuleBoard width={0.85} depth={0.8} color="#244f73" />
      <Cylinder radius={0.24} height={0.3} position={[0, 0.18, 0]} color="#202b30" segments={40} />
      <Cylinder radius={0.06} height={0.007} position={[0, 0.334, 0]} color="#050a0c" />
      <Label text="CHIME" position={[0, 0.021, 0.32]} width={0.45} height={0.08} />
    </group>
    <group position={[0.48, 0.2, -0.55]}>
      <ModuleBoard width={0.63} depth={0.74} />
      <Box size={[0.33, 0.12, 0.33]} position={[0, 0.08, 0]} color="#cad2d0" />
      <Cylinder radius={0.135} height={0.14} position={[0, 0.18, 0]} color="#df9542" />
      <Label text="BUTTON" position={[0, 0.021, 0.29]} width={0.45} height={0.08} />
    </group>
    {["#bb5440", "#354446"].map((color, i) => <Wire key={color} color={color} radius={0.014} points={[
      [-0.49 + i * 0.08, 0.3, 0.5], [-0.7, 0.33, 0.12 - i * 0.1], [0.08, 0.31, -0.92 - i * 0.08], [0.44 + i * 0.08, 0.3, -0.84],
    ]} />)}
  </group>;
}
