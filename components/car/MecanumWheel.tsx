"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { C, Cylinder, Box } from "./primitives";
export function MecanumWheel({
  handedness = 1,
  spin = 0,
}: {
  handedness?: number;
  spin?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const speed = useRef(spin);
  useFrame((_, dt) => {
    const frameTime = Math.min(dt, 0.04);
    speed.current = THREE.MathUtils.damp(speed.current, spin, 7, frameTime);
    if (ref.current) ref.current.rotation.x += speed.current * frameTime * 1.8;
  });
  return (
    <group ref={ref}>
      <Cylinder
        radius={0.475}
        height={0.37}
        rotation={[0, 0, Math.PI / 2]}
        color="#373f41"
        segments={48}
      />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Cylinder
            radius={0.433}
            height={0.035}
            rotation={[0, 0, Math.PI / 2]}
            position={[side * 0.212, 0, 0]}
            color="#6b7271"
            segments={48}
          />
          <Cylinder
            radius={0.32}
            height={0.025}
            rotation={[0, 0, Math.PI / 2]}
            position={[side * 0.236, 0, 0]}
            color="#242d30"
            segments={48}
          />
          <Cylinder
            radius={0.134}
            height={0.031}
            rotation={[0, 0, Math.PI / 2]}
            position={[side * 0.255, 0, 0]}
            color="#111b20"
          />
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <Cylinder
                key={i}
                radius={0.026}
                height={0.036}
                rotation={[0, 0, Math.PI / 2]}
                position={[
                  side * 0.262,
                  Math.cos(a) * 0.225,
                  Math.sin(a) * 0.225,
                ]}
                color="#8e9697"
              />
            );
          })}
        </group>
      ))}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i * Math.PI) / 5;
        return (
          <group key={i} rotation={[a, 0, 0]}>
            <group
              position={[0, 0.514, 0]}
              rotation={[0, (handedness * Math.PI) / 4, Math.PI / 2]}
            >
              <mesh castShadow>
                <capsuleGeometry args={[0.115, 0.35, 4, 12]} />
                <meshStandardMaterial color={C.rubber} roughness={0.78} />
              </mesh>
              {[-1, 1].map((s) => (
                <Cylinder
                  key={s}
                  radius={0.074}
                  height={0.08}
                  position={[0, s * 0.275, 0]}
                  color="#c6cecd"
                />
              ))}
            </group>
            <Box
              size={[0.46, 0.095, 0.14]}
              position={[0, 0.432, 0]}
              color="#78807e"
              metalness={0.75}
            />
          </group>
        );
      })}
    </group>
  );
}
