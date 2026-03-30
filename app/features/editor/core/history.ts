import type { Command } from "../types/command";

export function createHistory() {
  const undoStack: any[] = [];
  const redoStack: any[] = [];

  return {
    execute(command: Command) {
      console.log('🟢 EXECUTE COMMAND', command)

      // command.execute();

      undoStack.push(command);
      redoStack.length = 0;

      console.log('📦 undoStack size:', undoStack.length)
      console.log('📦 redoStack size:', redoStack.length)
    },

    undo() {
      const cmd = undoStack.pop();
      console.log('📦 undoStack after pop:', undoStack)
      console.log('📦 CMD:', cmd)

      if (!cmd) return;

      console.log('↩️ UNDO', cmd)

      cmd.undo();
      redoStack.push(cmd);

      console.log('redoStack[0]', redoStack[0])



      console.log('📦 undoStack size:', undoStack.length)
      console.log('📦 redoStack size:', redoStack.length)
    },

    redo() {
      const cmd = redoStack.pop();
      if (!cmd) return;

      console.log('↪️ REDO', cmd)

      cmd.execute();
      undoStack.push(cmd);

      console.log('📦 undoStack size:', undoStack.length)
      console.log('📦 redoStack size:', redoStack.length)
    },
  };
}
