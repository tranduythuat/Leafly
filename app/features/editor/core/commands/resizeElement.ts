import type { EditorStore } from '../../store/editorStore'
import type { Command } from '../../types/command'

export function createResizeCommand(store: EditorStore, payload: {id: string; width: number, height: number}) {
  const el = store.elements.find((e) => e.id === payload.id);

  if (!el) {
    throw new Error('Element not found')
  }

  const oldWidth = el.width;
  const oldHeight = el.height;

  return {
    execute() {
      el.width = payload.width;
      el.height = payload.height;
    },

    undo() {
      el.width = oldWidth;
      el.height = oldHeight;
    },
  };
}
