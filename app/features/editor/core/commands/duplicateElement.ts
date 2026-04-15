import type { EditorStore } from "../../store/editorStore";
import type { EditorElement } from "../../types";

const cloneElement = (element: EditorElement): EditorElement =>
  JSON.parse(JSON.stringify(element));

export function createDuplicateElementCommand(
  store: EditorStore,
  payload: {
    sectionId: string;
    element: EditorElement;
    prevSelectedIds: string[];
    prevActiveSectionId: string | null;
  }
) {
  const duplicated = cloneElement(payload.element);

  return {
    execute() {
      const section = store.findSectionById(payload.sectionId);
      if (!section) return;

      const exists = section.elements.some((el) => el.id === duplicated.id);
      if (exists) return;

      section.elements.push(cloneElement(duplicated));
      store.ui.selectedIds = [duplicated.id];
      store.ui.activeSectionId = payload.sectionId;
    },

    undo() {
      const section = store.findSectionById(payload.sectionId);
      if (!section) return;

      section.elements = section.elements.filter((el) => el.id !== duplicated.id);
      store.ui.selectedIds = [...payload.prevSelectedIds];
      store.ui.activeSectionId = payload.prevActiveSectionId;
    },
  };
}
