import type { EditorStore } from "../../store/editorStore";
import type { EditorElement } from "../../types";

const cloneElement = (element: EditorElement): EditorElement =>
  JSON.parse(JSON.stringify(element));

interface RemoveItemPayload {
  sectionId: string;
  elementId: string;
}

interface SectionSnapshot {
  sectionId: string;
  elements: EditorElement[];
}

export function createRemoveElementCommand(
  store: EditorStore,
  payload: {
    items: RemoveItemPayload[];
    prevSelectedIds: string[];
    prevActiveSectionId: string | null;
  }
) {
  let snapshots: SectionSnapshot[] = [];

  return {
    execute() {
      const groupedItems = new Map<string, Set<string>>();

      payload.items.forEach(({ sectionId, elementId }) => {
        if (!groupedItems.has(sectionId)) {
          groupedItems.set(sectionId, new Set());
        }
        groupedItems.get(sectionId)?.add(elementId);
      });

      snapshots = Array.from(groupedItems.entries()).flatMap(
        ([sectionId, elementIds]) => {
          const section = store.findSectionById(sectionId);
          if (!section) return [];

          const beforeElements = section.elements.map(cloneElement);
          section.elements = section.elements.filter(
            (element) => !elementIds.has(element.id)
          );

          return [{ sectionId, elements: beforeElements }];
        }
      );

      store.ui.selectedIds = store.ui.selectedIds.filter(
        (selectedId) =>
          !payload.items.some((item) => item.elementId === selectedId)
      );
      store.ui.activeSectionId = payload.prevActiveSectionId;
    },

    undo() {
      snapshots.forEach(({ sectionId, elements }) => {
        const section = store.findSectionById(sectionId);
        if (!section) return;

        section.elements = elements.map(cloneElement);
      });

      store.ui.selectedIds = [...payload.prevSelectedIds];
      store.ui.activeSectionId = payload.prevActiveSectionId;
    },
  };
}
