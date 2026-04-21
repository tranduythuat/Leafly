import type { EditorStore } from '../../store/editorStore'
import type { Command } from '../../types'

export function createResizeCommand(
  store: EditorStore, 
  payload: {
    id: string
    oldX: number,
    oldY: number,
    oldWidth: number,
    oldHeight: number,
    oldFontSize: number,
    newX: number,
    newY: number,
    newWidth: number,
    newHeight: number,
    newFontSize: number,
  }): Command {
  const el = store.findElementById(payload.id)

  if (!el) {
    throw new Error('Element not found')
  }

  return {
    execute() {
      el.x = payload.newX
      el.y = payload.newY
      el.width = payload.newWidth
      el.height = payload.newHeight
      el.fontSize = payload.newFontSize
    },

    undo() {
      el.x = payload.oldX
      el.y = payload.oldY
      el.width = payload.oldWidth
      el.height = payload.oldHeight
      el.fontSize = payload.oldFontSize
    },
  };
}
