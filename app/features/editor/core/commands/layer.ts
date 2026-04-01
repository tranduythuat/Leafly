import type { EditorStore } from "../../store/editorStore";

export function createBringToFrontCommand(store: EditorStore, id: string) {
  return {
    execute() {
      const maxZ = Math.max(...store.elements.map((e) => e.zIndex));

      const el = store.elements.find((e) => e.id === id);
      if (!el) return;

      el.zIndex = maxZ + 1;
    },

    undo() {
      // ❗ đơn giản: bạn có thể lưu oldZ nếu muốn chuẩn hơn
    },
  };
}

export function createSendToBackCommand(store: EditorStore, id: string) {
  return {
    execute() {
      const minZ = Math.min(...store.elements.map((e) => e.zIndex));

      const el = store.elements.find((e) => e.id === id);
      if (!el) return;

      el.zIndex = minZ - 1;
    },

    undo() {},
  };
}
