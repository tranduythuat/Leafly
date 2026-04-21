import type { EditorStore } from "../../store/editorStore";
import type { UpdateStylePayload } from "../../types";

export function createUpdateStyleCommand(
  store: EditorStore,
  payload: UpdateStylePayload
) {
  return {
    execute() {
      const el = store.findElementById(payload.id)
      if (!el) return;

      Object.assign(el, payload.newData);
    },

    undo() {
      const el = store.findElementById(payload.id)
      if (!el) return;

      Object.assign(el, payload.oldData);
    },
  };
}
