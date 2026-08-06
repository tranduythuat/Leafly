import type { Alignment } from "./base"
import type { EditorElement } from "./element"

export interface BackgroundStyle {
  type: "color" | "image"
  value: string
}

// 🎵 NEW
export interface BackgroundMusic {
  src: string
  name?: string
  autoplay: boolean
  loop: boolean
  volume: number // 0 - 1
}

export interface SectionStyle {
  background: BackgroundStyle
  padding: number
  minHeight: number
  align: Alignment
}

export type SectionStylePatch = Partial<SectionStyle> & {
  background?: Partial<BackgroundStyle>
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
  backgroundMusic: BackgroundMusic | null //
  sections: Section[]
}

export interface EditorUIState {
  activeSectionId: string | null
  selectedIds: string[]
}
