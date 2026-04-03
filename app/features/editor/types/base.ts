export type ID = string

export type Alignment = "left" | "center" | "right" | "justify"

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface BaseElement extends Position, Size {
  id: ID
  zIndex: number
}

export interface TextElement extends BaseElement {
  type: 'text'
  content: string
  fontSize?: number
  color?: string
  alignment?: Alignment
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
}

export type CanvasElement = TextElement | ImageElement
