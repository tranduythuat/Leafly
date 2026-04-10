import { defineStore } from "pinia";
import { createHistory } from '../core/history'
import type {
  Command,
  EditorDocument,
  EditorElement,
  EditorUIState,
  Section,
  SectionStyle,
} from '../types'
import { sectionPresets } from "../data/sectionPresets"

let history = createHistory() 

interface EditorState {
  document: EditorDocument
  ui: EditorUIState
}

const defaultBackground = {
  type: 'color' as const,
  value: '#ffffff'
}

const defaultSectionStyle = (): SectionStyle => ({
  background: { ...defaultBackground },
  padding: 48,
  minHeight: 320,
  align: 'center',
})

const createSectionId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Date.now().toString()

const cloneSection = (section: Section): Section =>
  JSON.parse(JSON.stringify(section))

const cloneElement = (element: EditorElement): EditorElement =>
  JSON.parse(JSON.stringify(element))

const initialSectionId = createSectionId()

export const useEditorStore = defineStore("editor", {
  state: (): EditorState => ({
    document: {
      background: { ...defaultBackground },
      sections: [
        {
          id: initialSectionId,
          name: 'Hero',
          type: 'hero',
          style: defaultSectionStyle(),
          elements: [
            {
              id: "1",
              type: "text",
              x: 100,
              y: 100,
              width: 320,
              height: 48,
              zIndex: 1,
              content: "Hello Leafly",
              color: '#36402d',
              alignment: 'center',
              fontSize: 32,
            },
            {
              id: "2",
              type: "text",
              x: 100,
              y: 180,
              width: 420,
              height: 80,
              zIndex: 2,
              content: "Elegant online invitation builder",
              color: '#62744d',
              alignment: 'center',
              fontSize: 18,
            },
          ],
        },
      ],
    },
    ui: {
      selectedIds: [],
      activeSectionId: initialSectionId,
    },
  }),

  getters: {
    background: (state) => state.document.background,
    sections: (state) => state.document.sections,
    selectedIds: (state) => state.ui.selectedIds,
    activeSectionId: (state) => state.ui.activeSectionId,
    activeSection: (state) =>
      state.document.sections.find(
        (section) => section.id === state.ui.activeSectionId
      ),
    allElements: (state) =>
      state.document.sections.flatMap((section) => section.elements),
    selectedElements(): EditorElement[] {
      return this.allElements.filter((element) =>
        this.selectedIds.includes(element.id)
      )
    },
  },

  actions: {
    findSectionById(id: string) {
      return this.document.sections.find((section) => section.id === id)
    },

    findSectionByElementId(id: string) {
      return this.document.sections.find((section) =>
        section.elements.some((element) => element.id === id)
      )
    },

    findElementById(id: string) {
      return this.findSectionByElementId(id)?.elements.find(
        (element) => element.id === id
      )
    },

    replaceSections(sections: Section[]) {
      this.document.sections = sections
    },

    addSection(name = 'New section', type = 'custom') {
      const section = {
        id: createSectionId(),
        name,
        type,
        style: defaultSectionStyle(),
        elements: [],
      }

      this.document.sections.push(section)

      if (!this.ui.activeSectionId) {
        this.ui.activeSectionId = section.id
      }
    },

    selectSection(id: string | null) {
      this.ui.activeSectionId = id
      this.ui.selectedIds = []
    },

    selectedSection(id: string | null) {
      this.selectSection(id)
    },

    removeSection(id: string) {
      this.document.sections = this.document.sections.filter((section) => section.id !== id)

      if (this.ui.activeSectionId === id) {
        this.ui.activeSectionId = this.document.sections[0]?.id ?? null
      }

      this.ui.selectedIds = []
    },

    duplicateSection(id: string) {
      const section = this.findSectionById(id)
      if (!section) return
    
      const clone = cloneSection(section)
      clone.id = createSectionId()
    
      this.document.sections.push(clone)
    },

    moveSection(from: number, to: number) {
      const item = this.document.sections.splice(from, 1)[0]
      if (!item) return

      this.document.sections.splice(to, 0, item)
    },
    
    addSectionFromPreset(type: string, name: string) {
      const preset = sectionPresets[type]
      if (!preset) return

      const section: Section = {
        id: createSectionId(),
        name,
        type: preset.type || "custom",
        style: preset.style ? JSON.parse(JSON.stringify(preset.style)) : defaultSectionStyle(),
        elements: (preset.elements || []).map((element) => cloneElement(element)),
      }

      this.document.sections.push(section)
      this.ui.activeSectionId = section.id
    },

    addElement(el: EditorElement) {
      const section = this.activeSection
      if (!section) return
    
      section.elements.push(el)
    },

    select(id: string, isMulti = false) {
      const section = this.findSectionByElementId(id)
      if (section) {
        this.ui.activeSectionId = section.id
      }

      if (isMulti) {
        if (this.ui.selectedIds.includes(id)) {
          this.ui.selectedIds = this.ui.selectedIds.filter((item) => item !== id)
        } else {
          this.ui.selectedIds.push(id)
        }
      } else {
        this.ui.selectedIds = [id]
      }
    },

    move(id: string, x: number, y: number) {
      const el = this.findElementById(id)
      if (!el) return
    
      el.x = x
      el.y = y
    },

    updateText(id: string, content: string) {
      const el = this.findElementById(id)
      if (!el || el.type !== "text") return;
      el.content = content;
    },

    resize(id: string, width: number, height: number) {
      const el = this.findElementById(id)
      if (!el) return
      el.width = width
      el.height = height
    },

    executeCommand(command: Command) {
      console.log('🔥 Store executeCommand')
      history.execute(command)
    },

    undo() {
      console.log('🔥 Store undo')
      history.undo()
    },

    redo() {
      console.log('🔥 Store redo')
      history.redo()
    },

    addImage(src: string) {
      const section = this.activeSection
      if (!section) return

      const maxZ = Math.max(0, ...section.elements.map((element) => element.zIndex || 0))
      section.elements.push({
        id: createSectionId(),
        type: "image",
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        zIndex: maxZ + 1,
        src
      })
    },
    setBackground(type: 'color' | 'image', value: string) {
      this.document.background = { type, value }
    }
  },
});

export type EditorStore = ReturnType<typeof useEditorStore>
