import type { EditorStore } from "../../store/editorStore";

export function createResizeCommand(
  store: EditorStore,
  payload: {
    id: string;
    oldX?: number;
    oldY?: number;
    oldWidth: number;
    oldHeight: number;
    newX?: number;
    newY?: number;
    newWidth: number;
    newHeight: number;
  }
) {
  return {
    execute() {
      const el = store.findElementById(payload.id)
      if (!el) return;

      if (payload.newX !== undefined) el.x = payload.newX;
      if (payload.newY !== undefined) el.y = payload.newY;
      el.width = payload.newWidth;
      el.height = payload.newHeight;
    },

    undo() {
      const el = store.findElementById(payload.id)
      if (!el) return;

      if (payload.oldX !== undefined) el.x = payload.oldX;
      if (payload.oldY !== undefined) el.y = payload.oldY;
      el.width = payload.oldWidth;
      el.height = payload.oldHeight;
    },
  };
}
