import type { EditorStore } from '../../store/editorStore'
import type { Command } from '../../types/command'

export function createRotateCommand(
  store: EditorStore,
  payload: {
    id: string
    oldRotation: number
    newRotation: number
  }
): Command {
  const el = store.findElementById(payload.id)

  if (!el) {
    throw new Error('Element not found')
  }

  console.log('📌 CREATE ROTATE COMMAND', {
    oldRotation: payload.oldRotation,
    newRotation: payload.newRotation,
  })

  return {
    execute() {
      console.log('▶️ ROTATE execute', payload)
      ;(el as any).rotation = payload.newRotation
    },

    undo() {
      console.log('⏪ ROTATE undo', payload.oldRotation)
      ;(el as any).rotation = payload.oldRotation
    },
  }
}