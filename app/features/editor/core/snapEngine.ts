// app/features/editor/core/snapEngine.ts
export interface ContainerRect extends Rect {
  paddingX?: number; // padding trái/phải của section
  paddingY?: number; // padding trên/dưới
}

export interface SnapLine {
  type: "vertical" | "horizontal";
  position: number;
  from: number;
  to: number;
}

export interface SnapResult {
  x: number;
  y: number;
  lines: SnapLine[];
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const THRESHOLD = 5;

function keyPoints(r: Rect) {
  return {
    left: r.x,
    centerX: r.x + r.width / 2,
    right: r.x + r.width,
    top: r.y,
    centerY: r.y + r.height / 2,
    bottom: r.y + r.height,
  };
}

export function calcSnapWithContainer(
  moving: Rect,
  targets: Rect[],
  container: ContainerRect,
  threshold = THRESHOLD
): SnapResult {
  // Build danh sách target bao gồm container edges + center
  const containerTargets: Rect[] = [
    // Snap vào padding box (inner edge)
    {
      x: container.paddingX ?? 0,
      y: container.paddingY ?? 0,
      width: container.width - 2 * (container.paddingX ?? 0),
      height: container.height - 2 * (container.paddingY ?? 0),
    },
    // Snap vào outer edge của container
    {
      x: container.x,
      y: container.y,
      width: container.width,
      height: container.height,
    },
  ];

  // Chạy snap bình thường, container targets có độ ưu tiên cao hơn
  // → đẩy vào đầu mảng
  return calcSnap(moving, [...containerTargets, ...targets], threshold);
}

export function calcSnap(
  moving: Rect,
  targets: Rect[],
  threshold = THRESHOLD
): SnapResult {
  let { x, y } = moving;
  const lines: SnapLine[] = [];
  let snappedX = false;
  let snappedY = false;

  const mp = keyPoints(moving);

  for (const target of targets) {
    const tp = keyPoints(target);

    // --- X axis ---
    if (!snappedX) {
      const xPairs: [number, number][] = [
        [mp.left, tp.left],
        [mp.left, tp.centerX],
        [mp.left, tp.right],
        [mp.centerX, tp.left],
        [mp.centerX, tp.centerX],
        [mp.centerX, tp.right],
        [mp.right, tp.left],
        [mp.right, tp.centerX],
        [mp.right, tp.right],
      ];

      for (const [mPoint, tPoint] of xPairs) {
        const delta = tPoint - mPoint;
        if (Math.abs(delta) <= threshold) {
          x += delta;
          snappedX = true;
          lines.push({
            type: "vertical",
            position: tPoint,
            from: Math.min(moving.y, target.y),
            to: Math.max(moving.y + moving.height, target.y + target.height),
          });
          break;
        }
      }
    }

    // --- Y axis ---
    if (!snappedY) {
      const yPairs: [number, number][] = [
        [mp.top, tp.top],
        [mp.top, tp.centerY],
        [mp.top, tp.bottom],
        [mp.centerY, tp.top],
        [mp.centerY, tp.centerY],
        [mp.centerY, tp.bottom],
        [mp.bottom, tp.top],
        [mp.bottom, tp.centerY],
        [mp.bottom, tp.bottom],
      ];

      for (const [mPoint, tPoint] of yPairs) {
        const delta = tPoint - mPoint;
        if (Math.abs(delta) <= threshold) {
          y += delta;
          snappedY = true;
          lines.push({
            type: "horizontal",
            position: tPoint,
            from: Math.min(moving.x, target.x),
            to: Math.max(moving.x + moving.width, target.x + target.width),
          });
          break;
        }
      }
    }

    if (snappedX && snappedY) break;
  }

  return { x, y, lines };
}
