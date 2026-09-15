/** Measured against https://jesperlandberg.com/ (September 2026).
 * Units stay in pixels for input and in camera space for the ribbon surface.
 */
export const RIBBON_CAMERA = { fov: 53.4, distance: 41.18 } as const;

export function wrapStage(value: number, count: number) {
  return ((value % count) + count) % count;
}

export function nearestStage(index: number, position: number, count: number) {
  return index + Math.round((position - index) / count) * count;
}

export function ribbonLayout(width: number, height: number) {
  const compact = width < 700;
  const cardHeight = compact
    ? Math.min(height * .43, width * .88)
    : Math.min(height * .435, width * 550 / 1500);
  const cardWidth = compact ? width * .82 : cardHeight * 1.7;
  const gap = compact ? 12 : width * 10 / 1500;
  const halfHeight = Math.tan(RIBBON_CAMERA.fov * Math.PI / 360) * RIBBON_CAMERA.distance;
  return {
    width, height, compact, cardWidth, cardHeight, pitch: cardWidth + gap,
    radius: compact ? 15 : width * 20 / 1500,
    centreY: height * (compact ? .54 : .5),
    halfHeight, halfWidth: halfHeight * width / height, unitsPerPixel: halfHeight * 2 / height,
  };
}

export type RibbonLayout = ReturnType<typeof ribbonLayout>;

export function pushRibbon(target: number, current: number, pixels: number, layout: RibbonLayout) {
  const limit = layout.width / layout.pitch;
  return current + Math.tanh((target + pixels / layout.pitch - current) / limit) * limit;
}

export function advanceRibbon(current: number, target: number, dt: number) {
  const next = current + (target - current) * Math.min(.1 * dt * 60, .2);
  return Math.abs(next - target) < .00001 ? target : next;
}

export function ribbonEnergy(current: number, target: number, layout: RibbonLayout) {
  // The reference drives deformation from the distance still being eased, in pixels.
  const lag = (target - current) * layout.pitch;
  return Math.tanh(lag / (layout.compact ? 245 : 550)) ** 2;
}

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

export function ribbonLean(x: number, halfWidth: number) {
  const s = Math.max(-1, Math.min(1, x / halfWidth));
  return -.12 * halfWidth * s * (1.5 - .5 * s * s);
}

/** One continuous surface, shared by every photograph, caption and hit boundary. */
export function ribbonSurface(x: number, y: number, layout: RibbonLayout, energy: number) {
  const across = x / layout.halfWidth;
  const q = across * 1.15 - .2;
  const envelope = Math.exp(-q * q);
  const shape = Math.sin(Math.PI * q) * envelope;
  const slope = (Math.PI * Math.cos(Math.PI * q) - 2 * q * Math.sin(Math.PI * q)) * envelope;
  const strength = layout.compact ? .45 : 1;
  const roll = (-.16 * slope / Math.PI
    + 1.8 * energy * smoothstep(.3, .9, Math.abs(across)) * Math.sign(across)) * strength;
  const lift = energy * (1 - smoothstep(-1, .3, across)) * strength;
  const depth = layout.halfWidth * .2 * (1 + 1.1 * energy) * strength;
  return {
    x,
    y: y * Math.cos(roll) + .03 * x * strength + .1 * layout.halfWidth * lift,
    z: y * Math.sin(roll) - depth * shape + .2 * layout.halfWidth * lift
      + ribbonLean(x, layout.halfWidth) * strength,
  };
}

export function projectRibbonPoint(point: { x: number; y: number; z: number }, layout: RibbonLayout) {
  const perspective = RIBBON_CAMERA.distance / (RIBBON_CAMERA.distance - point.z);
  return {
    x: layout.width / 2 + point.x * perspective / layout.unitsPerPixel,
    y: layout.height / 2 - point.y * perspective / layout.unitsPerPixel,
  };
}
