import type { EditorStore } from "../../store/editorStore";
import type { GroupMovePayload } from "../../types";

export function createGroupMoveCommand(
  store: EditorStore,
  payload: GroupMovePayload
) {
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
