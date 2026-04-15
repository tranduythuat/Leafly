import type { EditorStore } from "../../store/editorStore";
import type { SectionStyle } from "../../types";

const cloneStyle = (style: SectionStyle): SectionStyle =>
  JSON.parse(JSON.stringify(style));

export function createUpdateSectionStyleCommand(
  store: EditorStore,
  payload: {
    sectionId: string;
    oldStyle: SectionStyle;
    newStyle: SectionStyle;
  }
) {
  const oldStyle = cloneStyle(payload.oldStyle);
  const newStyle = cloneStyle(payload.newStyle);

  return {
    execute() {
      const section = store.findSectionById(payload.sectionId);
      if (!section) return;

      section.style = cloneStyle(newStyle);
    },

    undo() {
      const section = store.findSectionById(payload.sectionId);
      if (!section) return;

      section.style = cloneStyle(oldStyle);
    },
  };
}
