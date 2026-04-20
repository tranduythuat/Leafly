import type { EditorStore } from '../../store/editorStore'
import type { Command, EditorElement } from '../../types'

const cloneElement = (element: EditorElement): EditorElement =>
  JSON.parse(JSON.stringify(element))

export function createInsertImageCommand(
  store: EditorStore,
  payload: {
    sectionId: string
    element: EditorElement
  }
): Command {
  const element = cloneElement(payload.element)

  return {
    execute() {
      const section = store.findSectionById(payload.sectionId)
      if (!section) return

      const exists = section.elements.some((el) => el.id === element.id)
      if (exists) return

      section.elements.push(cloneElement(element))
      store.ui.selectedIds = [element.id]
      store.ui.activeSectionId = payload.sectionId
    },

    undo() {
      const section = store.findSectionById(payload.sectionId)
      if (!section) return

      section.elements = section.elements.filter((el) => el.id !== element.id)
      if (store.ui.selectedIds.includes(element.id)) {
        store.ui.selectedIds = []
      }
    },
  }
}
