import type { EditorStore } from '../../store/editorStore'
import type { Command } from '../../types'

export function createMoveCommand(
  store: EditorStore, 
  payload: {
    id: string; 
    oldX: number, 
    oldY: number, 
    newX: number,  
    newY: number
  }): Command {
  return {
    execute() {
      const el = store.findElementById(payload.id)
      if (!el) return

      el.x = payload.newX
      el.y = payload.newY
    },

    undo() {
      const el = store.findElementById(payload.id)
      if (!el) return

      el.x = payload.oldX
      el.y = payload.oldY
    }
  }
}
