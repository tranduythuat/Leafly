export interface Command {
  execute: () => void
  undo: () => void
}
export interface MoveItem {
  id: string
  oldX: number
  oldY: number
  newX: number
  newY: number
}

export interface GroupMovePayload {
  items: MoveItem[]
}