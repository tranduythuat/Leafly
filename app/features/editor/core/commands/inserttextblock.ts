import type { EditorStore } from '../../store/editorStore'
import type { Command } from '../../types'

export function createInsertTextCommand(
    store: EditorStore,
    payload: {
      sectionId: string
      element: Parameters<EditorStore['addElement']>[0]
    }
  ): Command {

    // 🔥 clone để tránh mutation ngoài
    const element = structuredClone(payload.element)

    // 🔥 snapshot UI trước khi execute
    let prevSelectedIds: string[] = []
    let prevActiveSectionId: string | null = null

    return {
      execute() {
        const section = store.findSectionById(payload.sectionId)
        if (!section) return
   
        section.elements.push(payload.element)
        store.ui.selectedIds = [payload.element.id]
        store.ui.activeSectionId = payload.sectionId
      },
   
      undo() {
        const section = store.findSectionById(payload.sectionId)
        if (!section) return
   
        section.elements = section.elements.filter(
          (el) => el.id !== payload.element.id
        )
        
        store.ui.selectedIds = prevSelectedIds
        store.ui.activeSectionId = prevActiveSectionId
      },
    }
  }
   