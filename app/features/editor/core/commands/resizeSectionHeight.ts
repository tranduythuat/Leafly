import type { EditorStore } from '../../store/editorStore'
import type { Command } from '../../types'

export function createResizeSectionCommand(
  store: EditorStore,
  payload: {
    sectionId: string
    oldMinHeight: number
    newMinHeight: number
  }
): Command {
  return {
    execute() {
      const section = store.findSectionById(payload.sectionId)
      if (!section) return
      section.style.minHeight = payload.newMinHeight
    },
    undo() {
      const section = store.findSectionById(payload.sectionId)
      if (!section) return
      section.style.minHeight = payload.oldMinHeight
    },
  }
}
