import type { Command } from '../types/command'

export function createHistory() {
    const undoStack: any[] = []
    const redoStack: any[] = []
  
    return {
      execute(command: Command) {
        command.execute()
        undoStack.push(command)
        redoStack.length = 0
      },
  
      undo() {
        const cmd = undoStack.pop()
        if (!cmd) return
  
        cmd.undo()
        redoStack.push(cmd)
      },
  
      redo() {
        const cmd = redoStack.pop()
        if (!cmd) return
  
        cmd.execute()
        undoStack.push(cmd)
      }
    }
  }