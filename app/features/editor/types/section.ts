import type { Alignment } from "./base"
import type { EditorElement } from "./element"

export interface BackgroundStyle {
  type: "color" | "image"
  value: string
}

export interface SectionStyle {
  background: BackgroundStyle
  padding: number
  minHeight: number
  align: Alignment
}

export interface Section {
  id: string
  name: string
  type: string
  elements: EditorElement[]
  style: SectionStyle
}

export interface EditorDocument {
  background: BackgroundStyle
  sections: Section[]
}

export interface EditorUIState {
  activeSectionId: string | null
  selectedIds: string[]
}
