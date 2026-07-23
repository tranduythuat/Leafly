import type { EditorStore } from "../../store/editorStore";
import type { Command, GroupPayload } from "../../types";

export function createGroupCommand(
  store: EditorStore,
  payload: GroupPayload
): Command {
  return {
    execute() {
      payload.items.forEach((item) => {
        const el = store.findElementById(item.id);
        if (!el) return;
        el.groupId = item.newGroupId;
      });
    },

    undo() {
      payload.items.forEach((item) => {
        const el = store.findElementById(item.id);
        if (!el) return;
        el.groupId = item.oldGroupId;
      });
    },
  };
}
