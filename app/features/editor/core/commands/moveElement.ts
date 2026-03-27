import type { EditorStore } from '../../store/editorStore'
import type { Command } from '../../types/command'

export function createMoveCommand(
  store: EditorStore, 
  payload: {
    id: string; 
    oldX: number, 
    oldY: number, 
    newX: number,  
    newY: number
  }): Command {

  const el = store.elements.find((e) => e.id === payload.id);

  if (!el) {
    throw new Error('Element not found')
  }
  console.log('📌 CREATE MOVE COMMAND', {
    oldX: payload.oldX,
    oldY: payload.oldY,
    newX: payload.newX,
    newY: payload.newY
  })

  return {
    execute() {
      console.log('▶️ MOVE execute', payload)
      el.x = payload.newX
      el.y = payload.newY
    },

    undo() {
      console.log('⏪ MOVE undo', payload.oldX, payload.oldY)
      el.x = payload.oldX
      el.y = payload.oldY
    },
  };
}
