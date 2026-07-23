import type { EditorStore } from "../../store/editorStore";
import type { Command, AlignItem, AlignType } from "../../types";

export function createAlignCommand(
  store: EditorStore,
  payload: {
    items: AlignItem[]
  }
): Command {
  return {
    execute() {
      payload.items.forEach((item) => {
        const el = store.findElementById(item.id);
        if (!el) return;
        el.x = item.newX;
        el.y = item.newY;
      });
    },

    undo() {
      payload.items.forEach((item) => {
        const el = store.findElementById(item.id);
        if (!el) return;
        el.x = item.oldX;
        el.y = item.oldY;
      });
    },
  };
}

export function computeAlignment(
  elements: { id: string; x: number; y: number; width: number; height: number }[],
  type: AlignType
): { id: string; oldX: number; oldY: number; newX: number; newY: number }[] {
  if (elements.length === 0) return [];

  const results = elements.map((el) => ({
    id: el.id,
    oldX: el.x,
    oldY: el.y,
    newX: el.x,
    newY: el.y,
  }));

  const minX = Math.min(...elements.map((e) => e.x));
  const maxX = Math.max(...elements.map((e) => e.x + e.width));
  const minY = Math.min(...elements.map((e) => e.y));
  const maxY = Math.max(...elements.map((e) => e.y + e.height));

  switch (type) {
    case 'left':
      results.forEach((r) => {
        r.newX = minX;
      });
      break;

    case 'right': {
      results.forEach((r) => {
        const el = elements.find((e) => e.id === r.id);
        if (!el) return;
        r.newX = maxX - el.width;
      });
      break;
    }

    case 'top':
      results.forEach((r) => {
        r.newY = minY;
      });
      break;

    case 'center': {
      const centerX = minX + (maxX - minX) / 2;
      results.forEach((r) => {
        const el = elements.find((e) => e.id === r.id);
        if (!el) return;
        r.newX = Math.round(centerX - el.width / 2);
      });
      break;
    }

    case 'centerVertical': {
      const centerY = minY + (maxY - minY) / 2;
      results.forEach((r) => {
        const el = elements.find((e) => e.id === r.id);
        if (!el) return;
        r.newY = Math.round(centerY - el.height / 2);
      });
      break;
    }

    case 'distributeHorizontal': {
      const sorted = [...elements].sort((a, b) => a.x - b.x);
      const totalWidth = sorted.reduce((sum, e) => sum + e.width, 0);
      const gap = sorted.length > 1 ? (maxX - minX - totalWidth) / (sorted.length - 1) : 0;

      let currentX = minX;
      sorted.forEach((el) => {
        const r = results.find((item) => item.id === el.id);
        if (!r) return;
        r.newX = Math.round(currentX);
        currentX += el.width + gap;
      });
      break;
    }

    case 'distributeVertical': {
      const sorted = [...elements].sort((a, b) => a.y - b.y);
      const totalHeight = sorted.reduce((sum, e) => sum + e.height, 0);
      const gap = sorted.length > 1 ? (maxY - minY - totalHeight) / (sorted.length - 1) : 0;

      let currentY = minY;
      sorted.forEach((el) => {
        const r = results.find((item) => item.id === el.id);
        if (!r) return;
        r.newY = Math.round(currentY);
        currentY += el.height + gap;
      });
      break;
    }
  }

  return results;
}
