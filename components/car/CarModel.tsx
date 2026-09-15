"use client";
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { ChassisPlate, Motor, Standoffs } from "./Chassis";
import { MecanumWheel } from "./MecanumWheel";
import { UltrasonicSensor } from "./UltrasonicSensor";
import { VisionCamera } from "./VisionCamera";
import { RotatingDistanceSensor } from "./RotatingDistanceSensor";
import { ChimeModules, LightModules } from "./ExpansionModules";
import {
  ESP32Board,
  MotorDriver,
  BatteryPack,
  BatteryCells,
  Wiring,
} from "./Electronics";
import type { Vec3 } from "./primitives";
import type { Motion } from "@/components/experience/StoryPanel";
const Explosion = createContext({ current: 0 });
const FutureStack = createContext(false);
const topDeckStack = { lift: 2, separation: 2.4 };
const AnnotationFocus = createContext({ progress: 0, labels: false });
function FrontSensor({ enabled, reduced }: { enabled: boolean; reduced: boolean }) {
  const { progress } = useContext(AnnotationFocus);
  const focus = enabled
    ? THREE.MathUtils.smoothstep(progress, 0.695, 0.725) * (1 - THREE.MathUtils.smoothstep(progress, 0.775, 0.805))
    : 0;
  return <>
    <UltrasonicSensor focus={focus} reduced={reduced} />
    <Annotation text="HC-SR04 · obstacle distance" position={[0.4, 1.05, 0]} range={enabled ? [0.695, 0.795] : [2, 3]} />
  </>;
}
function Annotation({
  text,
  position = [0, 0, 0],
  range,
}: {
  text: string;
  position?: Vec3;
  range: [number, number];
}) {
  const { progress, labels } = useContext(AnnotationFocus);
  const feather = 0.018;
  const enter = THREE.MathUtils.smoothstep(progress, range[0] - feather, range[0] + feather);
  const leave = 1 - THREE.MathUtils.smoothstep(progress, range[1] - feather, range[1] + feather);
  const visibility = labels ? 1 : enter * leave;
  return (
    <Html
      position={position}
      center
      zIndexRange={[5, 0]}
      style={{ pointerEvents: "none" }}
    >
      <div
        className="part-label"
        aria-hidden={visibility < 0.01}
        style={{
          opacity: visibility,
          transform: `translateY(${(1 - visibility) * 6}px) scale(${0.96 + visibility * 0.04})`,
        }}
      >
        {text}
      </div>
    </Html>
  );
}
function Part({
  at = [0, 0, 0],
  offset = [0, 0, 0],
  children,
  name,
  stack,
}: {
  at?: Vec3;
  offset?: Vec3;
  children: ReactNode;
  name: string;
  stack?: { lift: number; separation: number };
}) {
  const ref = useRef<THREE.Group>(null);
  const e = useContext(Explosion);
  const futureStack = useContext(FutureStack);
  useFrame(() => {
    if (ref.current)
      ref.current.position.set(
        at[0] + (futureStack ? 0 : offset[0]) * e.current,
        at[1] + (futureStack ? stack?.lift ?? 0 : 0) + (futureStack ? stack?.separation ?? 0 : offset[1]) * e.current,
        at[2] + (futureStack ? 0 : offset[2]) * e.current,
      );
  });
  return (
    <group ref={ref} position={at} name={name}>
      {children}
    </group>
  );
}
export function CarModel({
  explode = 0,
  motion = "stopped",
  reduced = false,
  labels = false,
  progress = 0,
  sensorFocus = true,
  futureStack = false,
  vision = false,
  scanner = false,
}: {
  explode?: number;
  motion?: Motion;
  reduced?: boolean;
  labels?: boolean;
  progress?: number;
  sensorFocus?: boolean;
  futureStack?: boolean;
  vision?: boolean;
  scanner?: boolean;
}) {
  const explosion = useRef(explode);
  const layout = useRef(futureStack);
  const root = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    // A new layout starts in its own assembly state. Do not damp from the
    // previous chapter's exploded stack after the camera has already moved.
    const layoutChanged = layout.current !== futureStack;
    layout.current = futureStack;
    explosion.current = reduced || layoutChanged
      ? explode
      : THREE.MathUtils.damp(explosion.current, explode, 5, Math.min(dt, 0.05));
    if (root.current) root.current.position.y = -explosion.current * (futureStack ? 1.2 : 0.5);
  }, -1);
  const hardware = useMemo(
    () => (
      <>
        <Part
          name="Lower metal chassis"
          at={[0, 0.19, 0]}
          offset={[0, -0.3, 0]}
        >
          <ChassisPlate />
          {futureStack && <Annotation text="01 · Drive base" position={[1.9, 0.1, -1.7]} range={[0, 1]} />}
        </Part>
        <Part name="Upper metal chassis" at={[0, 1.19, 0]} offset={[0, 1.2, 0]} stack={topDeckStack}>
          <ChassisPlate upper />
          {futureStack && <Annotation text="04 · Control + power" position={[1.9, 0.1, -1.7]} range={[0, 1]} />}
          <Annotation
            text="Perforated metal deck"
            position={[-1.6, 0.3, 1.7]}
            range={[0.295, 0.395]}
          />
        </Part>
        <Part name="Brass standoffs" offset={[0, 0.35, 0]} stack={{ lift: 0, separation: 0.4 }}>
          <Standoffs />
        </Part>
        {futureStack && <>
          <Part name="Signal lights expansion deck" at={[0, 1.19, 0]} stack={{ lift: 0, separation: 0.8 }}>
            <ChassisPlate upper label="02 / LIGHTS" />
            <LightModules />
            <Annotation text="02 · Lights + light sensor" position={[1.9, 0.1, -1.7]} range={[0, 1]} />
          </Part>
          <Part name="Chime expansion deck" at={[0, 2.19, 0]} stack={{ lift: 0, separation: 1.6 }}>
            <ChassisPlate upper label="03 / CHIME" />
            <ChimeModules />
            <Annotation text="03 · Buzzer + button" position={[1.9, 0.1, -1.7]} range={[0, 1]} />
          </Part>
          {[1, 2].map((level) => <Part key={level} name={`Expansion deck standoffs ${level}`} at={[0, level, 0]} stack={{ lift: 0, separation: level * 0.8 + 0.4 }}><Standoffs /></Part>)}
        </>}
        <Part name="Front HC-SR04 ultrasonic sensor and acrylic bracket" at={[0, 1.252, 2.72]} offset={[0, 1.2, 0]} stack={topDeckStack}>
          {scanner ? <><RotatingDistanceSensor /><Annotation text="180° servo + distance sensor" position={[0.6, 1.65, 0]} range={[2, 3]} /></> : <FrontSensor enabled={sensorFocus} reduced={reduced} />}
        </Part>
        {vision && <Part name="Raised DJI O4 vision camera" at={[0, 1.252, 2.72]} offset={[0, 1.8, 0]}>
          <VisionCamera />
          <Annotation text="DJI O4 · vision camera" position={[0.6, 1.8, 0]} range={[2, 3]} />
        </Part>}
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((z) => (
            <group key={`${x}-${z}`}>
              <Part
                name={`TT gear motor ${x},${z}`}
                at={[x * 1.09, 0.72, z * 1.58]}
                offset={[x * 0.66, 0.05, z * 0.34]}
              >
                <group rotation={[0, x < 0 ? Math.PI : 0, 0]}>
                  <Motor />
                </group>
              </Part>
              <Part
                name={`Mecanum wheel ${x},${z}`}
                at={[x * 1.88, 0.72, z * 1.6]}
                offset={[x * 1.17, -0.12, z * 0.46]}
              >
                <MecanumWheel
                  handedness={x * z}
                  spin={
                    motion === "stopped"
                      ? 0
                      : motion === "strafe"
                        ? x * z
                        : motion === "rotate"
                          ? -x
                          : 1
                  }
                />
                {x === 1 && z === 1 && (
                  <Annotation
                    text="45° mecanum rollers"
                    position={[0.56, -0.64, 0.12]}
                    range={[0.195, 0.295]}
                  />
                )}
              </Part>
            </group>
          )),
        )}
        <Part
          name="ESP32 and expansion board"
          at={[0, 1.49, 0]}
          offset={[0, 2.46, 0]}
          stack={topDeckStack}
        >
          <ESP32Board />
          <Annotation
            text="ESP32 + expansion board"
            position={[0, 0.65, 0]}
            range={[0.395, 0.595]}
          />
        </Part>
        {[-1, 1].map((z) => (
          <Part
            key={z}
            name={`L298N driver ${z}`}
            at={[0, 1.49, z * 1.48]}
            offset={[0, 1.81, z * 0.93]}
            stack={topDeckStack}
          >
            <group rotation={[0, z < 0 ? Math.PI : 0, 0]}>
              <MotorDriver />
            </group>
            <Annotation
              text={z === 1 ? "Front L298N motor driver" : "Rear L298N motor driver"}
              position={[z === 1 ? 0.45 : -0.45, 0.75, 0.05]}
              range={[0.395, 0.595]}
            />
          </Part>
        ))}
        <Part
          name="18650 battery holder"
          at={[0, 1.46, -2.34]}
          offset={[0, 1.38, -1.67]}
          stack={topDeckStack}
        >
          <BatteryPack />
        </Part>
        <Part
          name="Rechargeable cells"
          at={[0, 1.44, -2.34]}
          offset={[0, 2.13, -1.67]}
          stack={topDeckStack}
        >
          <BatteryCells />
          <Annotation
            text="2 × 18650 cells"
            position={[0, 0.58, 0]}
            range={[0.595, 0.695]}
          />
        </Part>
        <Part name="Signal and power wiring" offset={[0, 1.22, 0]} stack={topDeckStack}>
          <Wiring motorLeads={!futureStack} sensorLeads={!scanner} />
        </Part>
      </>
    ),
    [motion, sensorFocus, reduced, futureStack, vision, scanner],
  );
  return (
    <Explosion.Provider value={explosion}>
      <FutureStack.Provider value={futureStack}>
      <AnnotationFocus.Provider value={{ progress, labels }}>
        <group ref={root}>{hardware}</group>
      </AnnotationFocus.Provider>
      </FutureStack.Provider>
    </Explosion.Provider>
  );
}
