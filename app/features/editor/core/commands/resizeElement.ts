import type { EditorStore } from '../../store/editorStore'
import type { Command } from '../../types'

export function createResizeCommand(
  store: EditorStore, 
  payload: {
    id: string
    oldWidth: number
    oldHeight: number
    newWidth: number
    newHeight: number
  }): Command {
  const el = store.findElementById(payload.id)

  if (!el) {
    throw new Error('Element not found')
  }

  return {
    execute() {
      el.width = payload.newWidth
      el.height = payload.newHeight
    },

    undo() {
      el.width = payload.oldWidth
      el.height = payload.oldHeight
    },
  };
}
