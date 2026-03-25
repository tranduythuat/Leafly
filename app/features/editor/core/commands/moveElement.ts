import type { EditorStore } from '../../store/editorStore'
import type { Command } from '../../types/command'

export function createMoveCommand(store: EditorStore, payload: {id: string; x: number, y: number}): Command {
  const el = store.elements.find((e) => e.id === payload.id);

  if (!el) {
    throw new Error('Element not found')
  }
  
  const oldX = el.x;
  const oldY = el.y;

  return {
    execute() {
      el.x = payload.x;
      el.y = payload.y;
    },

    undo() {
      el.x = oldX;
      el.y = oldY;
    },
  };
}
