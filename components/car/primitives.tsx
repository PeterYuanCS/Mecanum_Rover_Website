"use client";
import { useMemo, useEffect } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
export type Vec3 = [number, number, number];
export const C = {
  metal: "#aab1b1",
  edge: "#cdd2ce",
  rubber: "#20262a",
  black: "#1c2526",
  gold: "#bd9a4a",
  yellow: "#e8b52d",
  red: "#a22e25",
  blue: "#26748a",
  green: "#6e9762",
};
export function Box({
  size,
  position = [0, 0, 0],
  color = C.black,
  metalness = 0.1,
  radius = 0,
  ...props
}: {
  size: Vec3;
  position?: Vec3;
  color?: string;
  metalness?: number;
  radius?: number;
  rotation?: Vec3;
}) {
  const material = (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={metalness > 0.4 ? 0.33 : 0.6}
    />
  );
  return radius ? (
    <RoundedBox
      args={size}
      radius={radius}
      smoothness={2}
      position={position}
      castShadow
      receiveShadow
      {...props}
    >
      {material}
    </RoundedBox>
  ) : (
    <mesh position={position} castShadow receiveShadow {...props}>
      <boxGeometry args={size} />
      {material}
    </mesh>
  );
}
export function Cylinder({
  radius,
  height,
  position = [0, 0, 0],
  color = C.metal,
  rotation = [0, 0, 0],
  segments = 24,
}: {
  radius: number;
  height: number;
  position?: Vec3;
  color?: string;
  rotation?: Vec3;
  segments?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, segments]} />
      <meshStandardMaterial color={color} metalness={0.65} roughness={0.32} />
    </mesh>
  );
}
export function Screw({ position = [0, 0, 0] }: { position?: Vec3 }) {
  return (
    <group position={position}>
      <Cylinder radius={0.049} height={0.032} />
      <Box
        size={[0.06, 0.007, 0.011]}
        position={[0, 0.018, 0]}
        color="#4f5555"
      />
    </group>
  );
}
export function Label({
  text,
  position = [0, 0, 0],
  width = 0.7,
  height = 0.18,
  color = "#eceee7",
  size = 48,
}: {
  text: string;
  position?: Vec3;
  width?: number;
  height?: number;
  color?: string;
  size?: number;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.font = `500 ${size}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 64);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, color, size]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </mesh>
  );
}
export function Wire({
  points,
  color,
  radius = 0.018,
}: {
  points: Vec3[];
  color: string;
  radius?: number;
}) {
  const signature = JSON.stringify(points);
  const geometry = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
        32,
        radius,
        6,
        false,
      ),
    [signature, radius],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color={color} roughness={0.45} />
    </mesh>
  );
}
