import { defineStore } from "pinia";
import { createHistory } from '../core/history'
import type { Command } from '../types/command'

let history = createHistory() 

export const useEditorStore = defineStore("editor", {
  state: () => ({
    elements: [
      {
        id: "1",
        type: "text",
        x: 100,
        y: 100,
        width: 150,
        height: 40,
        content: "Hello Leafly",
      },
    ],
    selectedId: null as string | null,
  }),

  actions: {
    select(id: string) {
      this.selectedId = id;
    },

    move(id: string, x: number, y: number) {
      const el = this.elements.find((e) => e.id === id);
      if (!el) return;
      el.x = x;
      el.y = y;
    },

    updateText(id: string, content: string) {
      const el = this.elements.find((e) => e.id === id);
      if (!el) return;
      el.content = content;
    },

    resize(id: string, width: number, height: number) {
      const el = this.elements.find(e => e.id === id)
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
    }
  },
});

export type EditorStore = ReturnType<typeof useEditorStore>
