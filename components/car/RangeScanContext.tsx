"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { scanAngleAt, traceScan, type ScanReading, type ScanSample } from "./rangeScan";

type Sweep = { time: number; angle: number; distance: number; hit: string | null; samples: Map<number, ScanSample> };
const RangeScan = createContext<{ current: Sweep } | null>(null);
export function useRangeScan() {
  const value = useContext(RangeScan);
  if (!value) throw new Error("Range scan components need RangeScanProvider");
  return value;
}

export function RangeScanProvider({ enabled, playing, reduced, onReading, children }: {
  enabled: boolean; playing: boolean; reduced: boolean; onReading?: (reading: ScanReading) => void; children: ReactNode;
}) {
  const sweep = useRef<Sweep>({ time: 0, angle: 0, ...traceScan(0), samples: new Map() });
  const lastReport = useRef(-1);
  const previousReduced = useRef(false);
  const previouslyEnabled = useRef(false);
  useFrame((_, dt) => {
    if (!enabled) { previouslyEnabled.current = false; return; }
    const entered = !previouslyEnabled.current;
    previouslyEnabled.current = true;
    const state = sweep.current;
    const reducedChanged = previousReduced.current !== reduced;
    if (reduced && !previousReduced.current) {
      // An immediately readable static survey when motion is reduced.
      for (let degrees = -90; degrees <= 90; degrees += 3) {
        const angle = degrees * Math.PI / 180;
        const echo = traceScan(angle);
        if (echo.hit) state.samples.set(degrees, { angle, distance: echo.distance });
      }
    }
    previousReduced.current = reduced;
    if (playing && !reduced) state.time += Math.min(dt, 0.05);
    state.angle = reduced ? 0 : scanAngleAt(state.time);
    Object.assign(state, traceScan(state.angle));
    const bin = Math.round(state.angle * 180 / Math.PI / 3) * 3;
    if (state.hit) state.samples.set(bin, { angle: state.angle, distance: state.distance });
    if (entered || reducedChanged || lastReport.current < 0 || Math.abs(state.time - lastReport.current) >= 0.1) {
      lastReport.current = state.time;
      onReading?.({ angle: state.angle, distance: state.hit ? state.distance : null, hit: state.hit, samples: [...state.samples.values()] });
    }
  }, -2);
  return <RangeScan.Provider value={sweep}>{children}</RangeScan.Provider>;
}
