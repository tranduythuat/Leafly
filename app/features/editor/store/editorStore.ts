import { defineStore } from "pinia";
import { createHistory } from '../core/history'
import type { Command, EditorElement } from '../types'

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
        color: '#000000',
        alignment: 'left',
      },
      {
        id: "2",
        type: "text",
        x: 400,
        y: 100,
        width: 150,
        height: 40,
        content: "Hello Thuat",
        color: 'red',
        alignment: 'left',
      },
      {
        id: "3",
        type: "text",
        x: 100,
        y: 400,
        width: 150,
        height: 40,
        content: "Hello Uyen",
        color: '#000000',
        alignment: 'left',
      },
    ] as EditorElement[],
    selectedIds: [] as string[]
  }),

  actions: {
    select(id: string, isMulti = false) {
      console.log('isMulti', isMulti);
      
      if (isMulti) {
        if (this.selectedIds.includes(id)) {
          this.selectedIds = this.selectedIds.filter(i => i !== id)
        } else {
          this.selectedIds.push(id)
        }
      } else {
        this.selectedIds = [id]
      }
      console.log('selectedIds', this.selectedIds);
      
    },

    move(id: string, x: number, y: number) {
      const el = this.elements.find((e) => e.id === id);
      if (!el) return;
      el.x = x;
      el.y = y;
    },

    updateText(id: string, content: string) {
      const el = this.elements.find((e) => e.id === id);
      if (!el || el.type !== "text") return;
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
    },

    addImage(src: string) {
      this.elements.push({
        id: Date.now().toString(),
        type: "image",
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        src
      })
    }
  },
});

export type EditorStore = ReturnType<typeof useEditorStore>
