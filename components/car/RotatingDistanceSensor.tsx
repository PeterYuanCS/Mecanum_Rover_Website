"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, Cylinder, Label, Screw, Wire } from "./primitives";
import { UltrasonicSensor } from "./UltrasonicSensor";
import { useRangeScan } from "./RangeScanContext";

// Mount origin matches the original front sensor. The blue servo stays fixed;
// its output horn, cradle, and HC-SR04 turn together about the vertical axis.
export function RotatingDistanceSensor() {
  const head = useRef<THREE.Group>(null);
  const scan = useRangeScan();
  useFrame(() => { if (head.current) head.current.rotation.y = scan.current.angle; });
  return <group name="Servo-mounted 180 degree ultrasonic scanner">
    <Box size={[1.04, 0.085, 0.73]} position={[0, 0.04, -0.05]} radius={0.065} color="#333e42" metalness={0.6} />
    {[-0.42, 0.42].map((x) => <Screw key={x} position={[x, 0.101, -0.23]} />)}
    <Box size={[0.57, 0.55, 0.42]} position={[0, 0.36, -0.09]} radius={0.045} color="#2f66a1" metalness={0.2} />
    <Box size={[0.8, 0.09, 0.26]} position={[0, 0.43, -0.1]} color="#3e76b0" radius={0.025} />
    {[-0.34, 0.34].map((x) => <Screw key={x} position={[x, 0.49, -0.1]} />)}
    <Box size={[0.52, 0.1, 0.4]} position={[0, 0.66, -0.09]} radius={0.035} color="#295c92" />
    <Cylinder radius={0.115} height={0.12} position={[0, 0.72, 0]} color="#c6c8ba" />
    <group position={[0, 0.37, 0.125]} rotation={[Math.PI / 2, 0, 0]}>
      <Label text="MICRO SERVO" width={0.47} height={0.095} />
    </group>
    <group ref={head} position={[0, 0.73, 0]}>
      <Cylinder radius={0.31} height={0.06} color="#eceee0" />
      <Box size={[0.96, 0.045, 0.15]} position={[0, 0.025, 0]} radius={0.045} color="#e2e5d6" />
      <Screw position={[0, 0.06, 0]} />
      <group position={[0, 0, -0.035]}><UltrasonicSensor /></group>
      {["#b94c3b", "#d4b958", "#4d9785", "#30393c"].map((colour, i) => <Wire key={colour} radius={0.012} color={colour} points={[
        [(i - 1.5) * 0.075, 0.235, -0.305],
        [0.2 + i * 0.04, 0.28, -0.46],
        [0.19, -0.1, -0.24],
        [0, -0.23 - i * 0.018, 0],
      ]} />)}
    </group>
    {["#b44634", "#b99c50", "#343633"].map((colour, i) => <Wire key={colour} radius={0.015} color={colour} points={[
      [0.25, 0.16 + i * 0.04, -0.27], [0.47 + i * 0.055, 0.12, -0.45], [0.81, 0.15 + i * 0.03, -1.13], [0.68, 0.45, -1.7],
    ]} />)}
  </group>;
}
