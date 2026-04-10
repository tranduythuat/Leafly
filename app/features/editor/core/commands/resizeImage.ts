import type { EditorStore } from "../../store/editorStore";

export function createResizeCommand(
  store: EditorStore,
  payload: {
    id: string;
    oldWidth: number;
    oldHeight: number;
    newWidth: number;
    newHeight: number;
  }
) {
  return {
    execute() {
      const el = store.findElementById(payload.id)
      if (!el) return;

      el.width = payload.newWidth;
      el.height = payload.newHeight;
    },

    undo() {
      const el = store.findElementById(payload.id)
      if (!el) return;

      el.width = payload.oldWidth;
      el.height = payload.oldHeight;
    },
  };
}
