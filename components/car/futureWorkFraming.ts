// One full-stage WebGL viewport, with the original chapter compositions expressed
// as camera framing. Changing chapters never resizes the canvas.
export function futureWorkMix(progress: number) {
  const t = Math.max(0, Math.min(1, (progress - 0.21) / 0.18));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function futureCameraMix(progress: number) {
  const t = Math.max(0, Math.min(1, (progress - 0.61) / 0.18));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function futureWorkFraming(width: number, height: number, mix: number, explosion: number, detail = false, scannerWeight = 0) {
  let stack = { top: 120, bottom: 137, left: width * 0.08, right: width * 0.08 };
  let vision = { top: 160, bottom: 142, left: width * 0.04, right: width * 0.01 };
  if (width <= 1100) {
    stack = { ...stack, top: 125, bottom: 141 };
    vision = { top: 198, bottom: 141, left: 0, right: 0 };
  }
  if (width <= 760) {
    stack = { top: 285, bottom: 153, left: 0, right: 0 };
    vision = { top: detail ? 280 : 284, bottom: detail ? 205 : 202, left: -width * 0.03, right: -width * 0.03 };
  }
  if (width <= 440) {
    stack = { top: 265, bottom: 155, left: -width * 0.01, right: -width * 0.01 };
    vision = { ...vision, top: detail ? 263 : 267, bottom: detail ? 205 : 206 };
  }
  if (width <= 540 && height <= 730) {
    stack = { ...stack, top: 248, bottom: 143 };
    vision = { ...vision, top: 231, bottom: 187 };
  }
  const lerp = (a: number, b: number) => a + (b - a) * mix;
  const stackHeight = Math.max(1, height - stack.top - stack.bottom);
  const visionHeight = Math.max(1, height - vision.top - vision.bottom);
  const stackMobile = (width - stack.left - stack.right) / stackHeight < 0.95;
  const visionMobile = width - vision.left - vision.right < 700;
  const stackZoom = (stackMobile ? 0.66 : 1.04) - explosion * (stackMobile ? 0.06 : 0.17);
  const visionZoom = detail ? (visionMobile ? 0.88 : 1.12) : (visionMobile ? 0.83 : 1.05) * (1 - 0.1 * scannerWeight);

  return {
    zoom: lerp(stackZoom * stackHeight, visionZoom * visionHeight) / height,
    offsetX: lerp((stack.left - stack.right) / 2, (vision.left - vision.right) / 2),
    offsetY: lerp((stack.top - stack.bottom) / 2, (vision.top - vision.bottom) / 2),
    targetY: lerp(2.05, detail ? 2.15 : 0.9),
    targetZ: lerp(0, detail ? 2.7 : 3.3),
    radius: lerp(14.5, detail ? 5.8 : 18),
    theta: lerp(0.74, 0.73),
    phi: lerp(1.13, detail ? 1.2 : 0.88),
  };
}
