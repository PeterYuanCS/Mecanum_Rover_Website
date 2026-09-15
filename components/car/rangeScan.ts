import type { Vec3 } from "./primitives";

// Distances describe this illustrative scene, with one scene unit shown as 20 cm.
export const scanOrigin: Vec3 = [0, 2.482, 2.72];
export const scanRadius = 6.3;
export const scanObstacles = [
  { id: "01", position: [-4.3, 0, 4.15] as Vec3, size: [1.1, 2.85, 1.15] as Vec3, colour: "#a8b593" },
  { id: "02", position: [0.45, 0, 7.4] as Vec3, size: [1.5, 2.85, 1.2] as Vec3, colour: "#c5b48f" },
  { id: "03", position: [4.35, 0, 4.85] as Vec3, size: [1.1, 2.85, 1.5] as Vec3, colour: "#b0b9b9" },
];

export type ScanSample = { angle: number; distance: number };
export type ScanReading = { angle: number; distance: number | null; hit: string | null; samples: ScanSample[] };

export function scanAngleAt(time: number) {
  return Math.sin(time * Math.PI / 7) * Math.PI / 2;
}

// Intersect a horizontal ray with the same boxes drawn in RangeScanEnvironment.
// The first 0.32 units are inside the transducer face, so the visible pulse starts there.
export function traceScan(angle: number) {
  const direction = [Math.sin(angle), Math.cos(angle)];
  let distance = scanRadius;
  let hit: string | null = null;
  for (const obstacle of scanObstacles) {
    let near = 0.32;
    let far = scanRadius;
    for (let axis = 0; axis < 2; axis++) {
      const coordinate = axis === 0 ? 0 : 2;
      const min = obstacle.position[coordinate] - obstacle.size[coordinate] / 2 - scanOrigin[coordinate];
      const max = obstacle.position[coordinate] + obstacle.size[coordinate] / 2 - scanOrigin[coordinate];
      if (Math.abs(direction[axis]) < 1e-8) {
        if (min > 0 || max < 0) { far = -1; break; }
      } else {
        const a = min / direction[axis], b = max / direction[axis];
        near = Math.max(near, Math.min(a, b));
        far = Math.min(far, Math.max(a, b));
      }
    }
    if (near <= far && near < distance) { distance = near; hit = obstacle.id; }
  }
  return { distance, hit };
}

export const initialScanReading: ScanReading = { angle: 0, distance: null, hit: null, samples: [] };
