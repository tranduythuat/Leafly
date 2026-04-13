import { defineStore } from "pinia";
import { createHistory } from '../core/history'
import type {
  Command,
  EditorDocument,
  EditorElement,
  EditorUIState,
  Section,
  SectionStylePatch,
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

const createElementId = () => createSectionId()

const cloneSection = (section: Section): Section =>
  JSON.parse(JSON.stringify(section))

const cloneElement = (element: EditorElement): EditorElement =>
  JSON.parse(JSON.stringify(element))

const initialSectionId = createSectionId()

const getNextZIndex = (section: Section) =>
  Math.max(0, ...section.elements.map((element) => element.zIndex || 0)) + 1

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
              height: 40,
              zIndex: 1,
              content: "Hello Leafly",
              color: '#36402d',
              alignment: 'center',
              fontSize: 32,
              rotation: 0,
              scale: 1,
            },
            {
              id: "2",
              type: "text",
              x: 100,
              y: 180,
              width: 420,
              height: 40,
              zIndex: 2,
              content: "Elegant online invitation builder",
              color: '#62744d',
              alignment: 'center',
              fontSize: 18,
              rotation: 0,
              scale: 1,
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
    activeSectionElements(): EditorElement[] {
      return this.activeSection?.elements ?? []
    },
    activeSectionSelectedElements(): EditorElement[] {
      return this.activeSectionElements.filter((element) =>
        this.selectedIds.includes(element.id)
      )
    },
    selectedElement(): EditorElement | null {
      return this.selectedIds.length === 1
        ? this.findElementById(this.selectedIds[0]) ?? null
        : null
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
      for (const section of this.document.sections) {
        const element = section.elements.find((el) => el.id === id);
        if (element) return element;
      }
      return null; // Return null if no element is found
    },

    // findElementById(id: string) {
    //   return this.findSectionByElementId(id)?.elements.find(
    //     (element) => element.id === id
    //   )
    // },

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

    clearSelection() {
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
      this.ui.selectedIds = [el.id]
    },

    rotate(id: string, rotation: number) {
      const el = this.findElementById(id)
      if (!el) return
      (el as any).rotation = rotation
    },

    insertTextBlock(
      variant: "heading" | "paragraph" | "quote" = "paragraph"
    ) {
      const section = this.activeSection
      if (!section) return

      const presets = {
        heading: {
          content: "Our Story",
          width: 360,
          height: 56,
          fontSize: 36,
          color: "#36402d",
          alignment: "center" as const,
        },
        paragraph: {
          content: "Share the details of your celebration here.",
          width: 420,
          height: 72,
          fontSize: 18,
          color: "#62744d",
          alignment: "center" as const,
        },
        quote: {
          content: "\"A little note of love and joy.\"",
          width: 400,
          height: 60,
          fontSize: 20,
          color: "#7e876d",
          alignment: "center" as const,
        },
      }

      const preset = presets[variant]
      const element: EditorElement = {
        id: createElementId(),
        type: "text",
        x: 100,
        y: 120 + section.elements.length * 28,
        width: preset.width,
        height: preset.height,
        zIndex: getNextZIndex(section),
        content: preset.content,
        fontSize: preset.fontSize,
        color: preset.color,
        alignment: preset.alignment,
      }

      this.addElement(element)
    },

    insertImageBlock() {
      this.addImage("/img/1.jpg")
    },

    select(id: string, isMulti = false) {
      const section = this.findSectionByElementId(id)
      if (!section) return

      const sameSectionSelectedIds = this.ui.selectedIds.filter(
        (selectedId) => this.findSectionByElementId(selectedId)?.id === section.id
      )

      this.ui.activeSectionId = section.id

      if (isMulti) {
        if (sameSectionSelectedIds.includes(id)) {
          this.ui.selectedIds = sameSectionSelectedIds.filter((item) => item !== id)
        } else {
          this.ui.selectedIds = [...sameSectionSelectedIds, id]
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

    resize(id: string, width: number, height: number, fontSize: number) {
      const el = this.findElementById(id)
      if (!el) return
      el.width = width
      el.height = height

      if (el.type === "text") {
        el.fontSize = fontSize;
      } 
    },

    removeElement(id: string) {
      const section = this.findSectionByElementId(id)
      if (!section) return

      section.elements = section.elements.filter((element) => element.id !== id)
      this.ui.selectedIds = this.ui.selectedIds.filter((selectedId) => selectedId !== id)
    },

    duplicateElement(id: string) {
      const section = this.findSectionByElementId(id)
      const element = this.findElementById(id)
      if (!section || !element) return

      const clone = cloneElement(element)
      clone.id = createElementId()
      clone.x += 24
      clone.y += 24
      clone.zIndex += 1

      section.elements.push(clone)
      this.ui.selectedIds = [clone.id]
      this.ui.activeSectionId = section.id
    },

    updateSectionStyle(id: string, patch: SectionStylePatch) {
      const section = this.findSectionById(id)
      if (!section) return

      section.style = {
        ...section.style,
        ...patch,
        background: patch.background
          ? {
              ...section.style.background,
              ...patch.background,
            }
          : section.style.background,
      }
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

      const image: EditorElement = {
        id: createElementId(),
        type: "image",
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        zIndex: getNextZIndex(section),
        src,
        style: {
          objectFit: "cover",
        }
      }

      section.elements.push(image)
      this.ui.selectedIds = [image.id]
    },
    setBackground(type: 'color' | 'image', value: string) {
      this.document.background = { type, value }
    }
  },
});

export type EditorStore = ReturnType<typeof useEditorStore>
