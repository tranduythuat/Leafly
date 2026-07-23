import type { ID } from "./base"
import type { EditorElementPatch } from "./element"

export interface Command {
  execute: () => void
  undo: () => void
}

export interface UpdateStylePayload {
  id: ID
  oldData: EditorElementPatch
  newData: EditorElementPatch
}

export interface MoveItem {
  id: ID
  oldX: number
  oldY: number
  newX: number
  newY: number
}

export interface GroupMovePayload {
  items: MoveItem[]
}

export type AlignType = 'left' | 'right' | 'top' | 'center' | 'centerVertical' | 'distributeHorizontal' | 'distributeVertical'

export interface AlignItem {
  id: ID
  oldX: number
  oldY: number
  newX: number
  newY: number
}

export interface GroupItem {
  id: ID
  oldGroupId?: string
  newGroupId?: string
}

export interface GroupPayload {
  items: GroupItem[]
}
