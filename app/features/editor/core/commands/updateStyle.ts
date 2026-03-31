import type { EditorStore } from "../../store/editorStore";
import type { UpdateStylePayload } from "../../types";

export function createUpdateStyleCommand(
  store: EditorStore,
  payload: UpdateStylePayload
) {
  return {
    execute() {
      const el = store.elements.find((e) => e.id === payload.id);
      if (!el) return;

      Object.assign(el, payload.newData);
    },

    undo() {
      const el = store.elements.find((e) => e.id === payload.id);
      if (!el) return;

      Object.assign(el, payload.oldData);
    },
  };
}
