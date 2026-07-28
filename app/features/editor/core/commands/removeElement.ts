import type { EditorStore } from "../../store/editorStore";
import type { EditorElement } from "../../types";

const cloneElement = (element: EditorElement): EditorElement =>
  JSON.parse(JSON.stringify(element));

export function createRemoveElementCommand(
  store: EditorStore,
  payload: {
    sectionId: string;
    elementId: string;
    prevSelectedIds: string[];
    prevActiveSectionId: string | null;
  }
) {
  let removedElement: EditorElement | undefined;
  let removedIndex: number | undefined;

  return {
    execute() {
      const section = store.findSectionById(payload.sectionId);
      if (!section) return;

      const index = section.elements.findIndex(
        (el) => el.id === payload.elementId
      );
      if (index === -1) return;

      const [element] = section.elements.splice(index, 1);
      if (!element) return;

      removedElement = cloneElement(element);
      removedIndex = index;

      store.ui.selectedIds = store.ui.selectedIds.filter(
        (selectedId) => selectedId !== payload.elementId
      );
      store.ui.activeSectionId = payload.sectionId;
    },

    undo() {
      const section = store.findSectionById(payload.sectionId);
      if (!section || !removedElement) return;

      const insertIndex =
        removedIndex !== undefined
          ? Math.min(removedIndex, section.elements.length)
          : section.elements.length;

      section.elements.splice(insertIndex, 0, cloneElement(removedElement));
      store.ui.selectedIds = [...payload.prevSelectedIds];
      store.ui.activeSectionId = payload.prevActiveSectionId;
    },
  };
}
