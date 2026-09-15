"use client";
import { Box, C, Cylinder, Label, Screw, Wire } from "./primitives";
export function TerminalStrip({ count = 15 }: { count?: number }) {
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <group key={i} position={[0, 0, (i - (count - 1) / 2) * 0.126]}>
          <Box size={[0.22, 0.2, 0.122]} color={C.green} />
          <Cylinder
            radius={0.029}
            height={0.006}
            position={[0, 0.104, 0]}
            color="#c7d1bd"
          />
          <Box
            size={[0.008, 0.055, 0.066]}
            position={[0.113, -0.014, 0]}
            color="#203c30"
          />
        </group>
      ))}
    </group>
  );
}
export function ESP32Board() {
  return (
    <group>
      <Box size={[1.54, 0.048, 2.15]} color="#1a2625" radius={0.025} />
      {[-0.62, 0.62].map((x) => (
        <group key={x} position={[x, 0.13, 0]}>
          <TerminalStrip />
        </group>
      ))}
      {[-0.45, 0.45].flatMap((x) =>
        [-0.86, 0.86].map((z) => (
          <group key={`${x}-${z}`}>
            <Cylinder
              radius={0.045}
              height={0.17}
              position={[x, -0.11, z]}
              color={C.gold}
              segments={6}
            />
            <Screw position={[x, 0.041, z]} />
          </group>
        )),
      )}
      <Box size={[0.66, 0.048, 1.52]} position={[0, 0.23, 0]} color="#172020" />
      {[-0.36, 0.36].map((x) => (
        <group key={x}>
          {Array.from({ length: 15 }, (_, i) => (
            <group key={i} position={[x, 0.14, (i - 7) * 0.092]}>
              <Box size={[0.065, 0.16, 0.06]} color={C.gold} metalness={0.5} />
              <Box
                size={[0.09, 0.06, 0.088]}
                position={[0, 0.045, 0]}
                color="#181e1b"
              />
            </group>
          ))}
        </group>
      ))}
      <Box
        size={[0.49, 0.095, 0.65]}
        position={[0, 0.303, -0.13]}
        color="#aebdb9"
        metalness={0.8}
        radius={0.017}
      />
      <Label
        text="ESP32"
        position={[0, 0.354, -0.19]}
        width={0.38}
        height={0.12}
        color="#465451"
      />
      <Label
        text="WiFi + BT"
        position={[0, 0.355, -0.035]}
        width={0.38}
        height={0.08}
        color="#58635f"
      />
      <Box
        size={[0.25, 0.115, 0.16]}
        position={[0, 0.307, 0.726]}
        color="#bec9c9"
        metalness={0.8}
        radius={0.016}
      />
      <Box
        size={[0.17, 0.06, 0.016]}
        position={[0, 0.307, 0.813]}
        color="#1b2220"
      />
      {Array.from({ length: 5 }, (_, i) => (
        <Box
          key={i}
          size={[0.39, 0.005, 0.026]}
          position={[0, 0.26, -0.55 - i * 0.04]}
          color={C.gold}
          metalness={0.5}
        />
      ))}
      {[-0.17, 0.17].flatMap((x) =>
        [0.29, 0.41, 0.51].map((z) => (
          <Box
            key={`${x}-${z}`}
            size={[0.075, 0.035, 0.065]}
            position={[x, 0.27, z]}
            color="#404946"
          />
        )),
      )}
      <Box
        size={[0.04, 0.025, 0.04]}
        position={[0.25, 0.27, 0.6]}
        color="#e4472b"
      />
      <Label
        text="ESP32 EXPANSION"
        position={[0, 0.027, 0.97]}
        width={0.9}
        height={0.09}
      />
    </group>
  );
}
export function MotorDriver() {
  return (
    <group>
      <Box size={[1.08, 0.045, 0.84]} color={C.red} />
      <Box
        size={[0.61, 0.64, 0.12]}
        position={[0, 0.36, -0.19]}
        color="#202a2b"
        metalness={0.5}
      />
      {Array.from({ length: 7 }, (_, i) => (
        <Box
          key={i}
          size={[0.035, 0.61, 0.24]}
          position={[(i - 3) * 0.087, 0.355, -0.28]}
          color="#253034"
          metalness={0.5}
        />
      ))}
      <Box
        size={[0.38, 0.19, 0.06]}
        position={[0, 0.17, -0.08]}
        color="#131d21"
      />
      {[-0.36, 0.36].map((x) => (
        <group key={x}>
          <Box
            size={[0.29, 0.22, 0.25]}
            position={[x, 0.133, 0.26]}
            color={C.blue}
          />
          {[-0.067, 0.067].map((d) => (
            <Cylinder
              key={d}
              radius={0.04}
              height={0.008}
              position={[x + d, 0.248, 0.26]}
            />
          ))}
          <Cylinder
            radius={0.087}
            height={0.22}
            position={[x, 0.14, -0.04]}
            color="#a9bab8"
          />
          <Cylinder
            radius={0.082}
            height={0.015}
            position={[x, 0.252, -0.04]}
            color="#d3d9d4"
          />
        </group>
      ))}
      {[-0.46, 0.46].flatMap((x) =>
        [-0.34, 0.34].map((z) => (
          <group key={`${x}-${z}`}>
            <Screw position={[x, 0.034, z]} />
            <Cylinder
              radius={0.044}
              height={0.22}
              position={[x, -0.13, z]}
              color={C.black}
              segments={6}
            />
          </group>
        )),
      )}
      {Array.from({ length: 6 }, (_, i) => (
        <Box
          key={i}
          size={[0.04, 0.13, 0.04]}
          position={[(i - 2.5) * 0.073, 0.098, 0.03]}
          color={C.gold}
        />
      ))}
      <Label
        text="L298N"
        position={[0, 0.027, 0.32]}
        width={0.3}
        height={0.095}
      />
    </group>
  );
}
export function BatteryPack({ lid = true }: { lid?: boolean }) {
  return (
    <group>
      <Box size={[1.97, 0.41, 0.87]} radius={0.07} color="#242b2a" />
      <Box
        size={[1.84, 0.07, 0.75]}
        position={[0, 0.215, 0]}
        color="#151d1d"
        radius={0.035}
      />
      {lid && (
        <Label
          text="18650  /  POWER"
          position={[0, 0.253, 0]}
          width={1.26}
          height={0.16}
          color="#77817d"
        />
      )}
      <Box
        size={[0.26, 0.1, 0.015]}
        position={[0.63, 0.07, 0.44]}
        color="#0c1515"
      />
    </group>
  );
}
export function BatteryCells() {
  return (
    <group>
      {[-0.24, 0.24].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <Cylinder
            radius={0.205}
            height={1.48}
            rotation={[0, 0, Math.PI / 2]}
            color="#884867"
            segments={32}
          />
          <Cylinder
            radius={0.15}
            height={0.035}
            rotation={[0, 0, Math.PI / 2]}
            position={[0.75, 0, 0]}
          />
          <Label
            text="EFEST 18650"
            position={[0, 0.207, 0]}
            width={1.05}
            height={0.15}
          />
        </group>
      ))}
    </group>
  );
}
export function Wiring({ motorLeads = true, sensorLeads = true }: { motorLeads?: boolean; sensorLeads?: boolean }) {
  return (
    <group>
      {sensorLeads && ["#c33c2b", "#d5ad37", "#328c83", "#272e2e"].map((color, i) => (
        <Wire
          key={`ultrasonic-${color}`}
          color={color}
          radius={0.012}
          points={[
            [(i - 1.5) * 0.075, 1.487, 2.445],
            [0.24 + i * 0.055, 1.44, 2.26],
            [0.72 + i * 0.055, 1.52, 1.82],
            [0.87 + i * 0.045, 1.87, 1.03],
            [0.63, 1.72, 0.45 + i * 0.126],
          ]}
        />
      ))}
      {["#307c76", "#497386", "#815f86", "#eee5c8"].map((color, i) => (
        <Wire
          key={color}
          color={color}
          radius={0.018}
          points={[
            [0.31 + i * 0.07, 1.91, -0.5],
            [0.62 + i * 0.07, 2.57, -0.65],
            [0.86 + i * 0.05, 2.6, 0.24],
            [0.44 + i * 0.05, 1.69, 1.42],
          ]}
        />
      ))}
      {["#e3ac30", "#ab3a28"].map((color, i) => (
        <Wire
          key={color}
          color={color}
          points={[
            [-0.24 + i * 0.08, 1.95, -0.42],
            [-0.8 + i * 0.08, 2.37, -0.65],
            [-0.92 + i * 0.07, 2.33, -1.32],
            [-0.37 + i * 0.1, 1.65, -1.46],
          ]}
        />
      ))}
      {motorLeads && [-1, 1].flatMap((s) =>
        ["#a92e27", "#272e2e"].map((color, i) => (
          <Wire
            key={`${s}-${color}`}
            color={color}
            radius={0.02}
            points={[
              [s * 0.32, 1.65, 1.51],
              [s * 1.13, 1.49, 1.73 + i * 0.06],
              [s * 1.48, 1.29, 0.36],
              [s * 1.28, 0.74, -1.37],
            ]}
          />
        )),
      )}
      <Wire
        color="#c33c2b"
        points={[
          [0.65, 1.45, -2.26],
          [1.37, 1.52, -2.25],
          [1.52, 1.45, -1.5],
          [0.38, 1.61, -1.42],
        ]}
      />
    </group>
  );
}
