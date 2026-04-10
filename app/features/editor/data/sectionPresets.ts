import type { Section } from "../types/section"

export const sectionPresets: Record<string, Partial<Section>> = {
  hero: {
    type: "hero",
    style: {
      background: {
        type: "color",
        value: "#ffffff",
      },
      padding: 48,
      minHeight: 320,
      align: "center",
    },
    elements: [
      {
        id: "el-title",
        type: "text",
        content: "Wedding Invitation",
        x: 50,
        y: 80,
        width: 320,
        height: 60,
        zIndex: 1,
        color: "#36402d",
        fontSize: 40,
        alignment: "center",
      }
    ]
  },

  gallery: {
    type: "gallery",
    style: {
      background: {
        type: "color",
        value: "#f6f7f4",
      },
      padding: 40,
      minHeight: 360,
      align: "center",
    },
    elements: [
      {
        id: "img-1",
        type: "image",
        src: "/img/1.jpg",
        x: 20,
        y: 20,
        width: 240,
        height: 240,
        zIndex: 1,
      }
    ]
  }
}
