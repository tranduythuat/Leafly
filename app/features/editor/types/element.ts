import type { Alignment, ID, Position, Size } from "./base"

export interface EditorElement extends Position, Size {
  id: ID
  type: "text"
  content: string
  fontSize?: number
  color?: string
  alignment?: Alignment
}

export type EditorElementPatch = Partial<EditorElement>
