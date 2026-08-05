import { defineStore } from "pinia";
import { createHistory } from "../core/history";
import type {
  Command,
  EditorDocument,
  EditorElement,
  EditorUIState,
  Section,
  SectionStylePatch,
  SectionStyle,
} from "../types";
import { sectionPresets } from "../data/sectionPresets";
import { createInsertGenericCommand } from "../core/commands/insertGenericBlock";
import { createInsertTextCommand } from "../core/commands/inserttextblock";
import { createInsertImageCommand } from "../core/commands/insertImageBlock";
import { createDuplicateElementCommand } from "../core/commands/duplicateElement";
import { createRemoveElementCommand } from "../core/commands/removeElement";
import { createUpdateSectionStyleCommand } from "../core/commands/updateSectionStyle";
import { createUpdateStyleCommand } from "../core/commands/updateStyle";
import { createAlignCommand, computeAlignment } from "../core/commands/align";
import { createGroupCommand } from "../core/commands/group";
import type { AlignType } from "../types";

let history = createHistory();

interface EditorState {
  document: EditorDocument;
  ui: EditorUIState;
}

const defaultBackground = {
  type: "color" as const,
  value: "#ffffff",
};

const defaultSectionStyle = (): SectionStyle => ({
  background: { ...defaultBackground },
  padding: 48,
  minHeight: 620,
  align: "center",
});

const createSectionId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Date.now().toString();

const createElementId = () => createSectionId();

const cloneSection = (section: Section): Section =>
  JSON.parse(JSON.stringify(section));

const cloneElement = (element: EditorElement): EditorElement =>
  JSON.parse(JSON.stringify(element));

const cloneSectionStyle = (style: SectionStyle): SectionStyle =>
  JSON.parse(JSON.stringify(style));

const initialSectionId = createSectionId();

const getNextZIndex = (section: Section) =>
  Math.max(0, ...section.elements.map((element) => element.zIndex || 0)) + 1;

export const useEditorStore = defineStore("editor", {
  state: (): EditorState => ({
    document: {
      background: { ...defaultBackground },
      sections: [
        {
          id: initialSectionId,
          name: "Hero",
          type: "hero",
          style: defaultSectionStyle(),
          elements: [
            {
              id: "1",
              type: "text",
              x: 100,
              y: 100,
              width: 320,
              height: 40,
              heightMode: "auto",
              zIndex: 1,
              content: "Hello Leafly",
              color: "#36402d",
              alignment: "center",
              fontSize: 32,
              rotation: 0,
              scale: 1,
            },
            {
              id: "2",
              type: "text",
              x: 100,
              y: 180,
              width: 420,
              height: 40,
              heightMode: "auto",
              zIndex: 2,
              content: "Elegant online invitation builder",
              color: "#62744d",
              alignment: "center",
              fontSize: 18,
              rotation: 0,
              scale: 1,
            },
          ],
        },
      ],
    },
    ui: {
      selectedIds: [],
      activeSectionId: initialSectionId,
    },
  }),

  getters: {
    background: (state) => state.document.background,
    sections: (state) => state.document.sections,
    selectedIds: (state) => state.ui.selectedIds,
    activeSectionId: (state) => state.ui.activeSectionId,
    activeSection: (state) =>
      state.document.sections.find(
        (section) => section.id === state.ui.activeSectionId
      ),
    allElements: (state) =>
      state.document.sections.flatMap((section) => section.elements),
    selectedElements(): EditorElement[] {
      return this.allElements.filter((element) =>
        this.selectedIds.includes(element.id)
      );
    },
    activeSectionElements(): EditorElement[] {
      return this.activeSection?.elements ?? [];
    },
    activeSectionSelectedElements(): EditorElement[] {
      return this.activeSectionElements.filter((element) =>
        this.selectedIds.includes(element.id)
      );
    },
    selectedElement(): EditorElement | null {
      return this.selectedIds.length === 1
        ? this.findElementById(this.selectedIds[0]) ?? null
        : null;
    },
  },

  actions: {
    findSectionById(id: string) {
      return this.document.sections.find((section) => section.id === id);
    },

    findSectionByElementId(id: string) {
      return this.document.sections.find((section) =>
        section.elements.some((element) => element.id === id)
      );
    },

    findElementById(id: string) {
      for (const section of this.document.sections) {
        const element = section.elements.find((el) => el.id === id);
        if (element) return element;
      }
      return null; // Return null if no element is found
    },

    replaceSections(sections: Section[]) {
      this.document.sections = sections;
    },

    addSection(name = "New section", type = "custom") {
      const section = {
        id: createSectionId(),
        name,
        type,
        style: defaultSectionStyle(),
        elements: [],
      };

      this.document.sections.push(section);

      if (!this.ui.activeSectionId) {
        this.ui.activeSectionId = section.id;
      }
    },

    selectSection(id: string | null) {
      this.ui.activeSectionId = id;
      this.ui.selectedIds = [];
    },

    clearSelection() {
      this.ui.selectedIds = [];
    },

    selectedSection(id: string | null) {
      this.selectSection(id);
    },

    removeSection(id: string) {
      this.document.sections = this.document.sections.filter(
        (section) => section.id !== id
      );

      if (this.ui.activeSectionId === id) {
        this.ui.activeSectionId = this.document.sections[0]?.id ?? null;
      }

      this.ui.selectedIds = [];
    },

    duplicateSection(id: string) {
      const section = this.findSectionById(id);
      if (!section) return;

      const clone = cloneSection(section);
      clone.id = createSectionId();

      this.document.sections.push(clone);
    },

    moveSection(from: number, to: number) {
      const item = this.document.sections.splice(from, 1)[0];
      if (!item) return;

      this.document.sections.splice(to, 0, item);
    },

    addSectionFromPreset(type: string, name: string) {
      const preset = sectionPresets[type];
      if (!preset) return;

      const section: Section = {
        id: createSectionId(),
        name,
        type: preset.type || "custom",
        style: preset.style
          ? JSON.parse(JSON.stringify(preset.style))
          : defaultSectionStyle(),
        elements: (preset.elements || []).map((element) =>
          cloneElement(element)
        ),
      };

      this.document.sections.push(section);
      this.ui.activeSectionId = section.id;
    },

    addElement(el: EditorElement) {
      const section = this.activeSection;
      if (!section) return;

      section.elements.push(el);
      this.ui.selectedIds = [el.id];
    },

    rotate(id: string, rotation: number) {
      const el = this.findElementById(id);
      if (!el) return;
      (el as any).rotation = rotation;
    },

    insertTextBlock(
      variant: "heading" | "paragraph" | "quote" = "paragraph",
      sectionDOMWidth?: number,
      sectionDOMHeight?: number
    ) {
      const section = this.activeSection;
      if (!section) return;

      const presets = {
        heading: { content: "Heading", fontSize: 32, width: 320 },
        paragraph: { content: "Paragraph", fontSize: 16, width: 320 },
        quote: { content: "Quote", fontSize: 12, width: 320 },
      };

      const preset = presets[variant];

      const estimatedHeight = Math.round(preset.fontSize * 1.4);
      const sectionWidth = sectionDOMWidth ?? 800;
      const sectionHeight = sectionDOMHeight ?? section.style?.minHeight ?? 320;

      const x = Math.round((sectionWidth - preset.width) / 2);
      const y = Math.round((sectionHeight - estimatedHeight) / 2);

      const element: EditorElement = {
        id: createElementId(),
        type: "text",
        x: x,
        y: y,
        width: preset.width,
        height: 40,
        heightMode: "auto",
        zIndex: getNextZIndex(section),
        content: preset.content,
        fontSize: preset.fontSize,
        color: "#36402d",
        alignment: "center",
        rotation: 0,
        scale: 1,
      };

      const command = createInsertTextCommand(this, {
        sectionId: section.id,
        element,
      });

      this.executeCommand(command);
    },

    insertImageBlock(
      src = "/img/1.jpg",
      sectionDOMWidth?: number,
      sectionDOMHeight?: number
    ) {
      const section = this.activeSection;
      if (!section) return;

      const imageWidth = 260;
      const imageHeight = 180;
      const sectionWidth = sectionDOMWidth ?? 800;
      const sectionHeight = sectionDOMHeight ?? section.style?.minHeight ?? 320;

      const image: EditorElement = {
        id: createElementId(),
        type: "image",
        x: Math.round((sectionWidth - imageWidth) / 2),
        y: Math.round((sectionHeight - imageHeight) / 2),
        width: imageWidth,
        height: imageHeight,
        zIndex: getNextZIndex(section),
        rotation: 0,
        src,
        style: {
          objectFit: "cover",
        },
      };

      const command = createInsertImageCommand(this, {
        sectionId: section.id,
        element: image,
      });

      this.executeCommand(command);
    },

    insertFormBlock(sectionDOMWidth?: number, sectionDOMHeight?: number) {
      const section = this.activeSection;
      if (!section) return;

      const width = 320,
        height = 260;
      const sectionWidth = sectionDOMWidth ?? 800;
      const sectionHeight = sectionDOMHeight ?? section.style?.minHeight ?? 320;

      const element: EditorElement = {
        id: createElementId(),
        type: "form",
        x: Math.round((sectionWidth - width) / 2),
        y: Math.round((sectionHeight - height) / 2),
        width,
        height,
        zIndex: getNextZIndex(section),
        fields: [
          {
            id: createElementId(),
            type: "text",
            label: "Full name",
            required: true,
          },
          {
            id: createElementId(),
            type: "email",
            label: "Email",
            required: true,
          },
        ],
        submitLabel: "Send RSVP",
        submitColor: "#B5694A",
        action: "rsvp",
        bgColor: "#ffffff",
        borderColor: "#EDE6D8",
        borderRadius: 8,
        showLabels: true,
      };

      const command = createInsertGenericCommand(this, {
        sectionId: section.id,
        element,
      });
      this.executeCommand(command);
    },

    insertMapBlock(sectionDOMWidth?: number, sectionDOMHeight?: number) {
      const section = this.activeSection;
      if (!section) return;

      const width = 320,
        height = 220;
      const sectionWidth = sectionDOMWidth ?? 800;
      const sectionHeight = sectionDOMHeight ?? section.style?.minHeight ?? 320;

      const element: EditorElement = {
        id: createElementId(),
        type: "map",
        x: Math.round((sectionWidth - width) / 2),
        y: Math.round((sectionHeight - height) / 2),
        width,
        height,
        zIndex: getNextZIndex(section),
        address: "",
        lat: 21.0285,
        lng: 105.8542,
        zoom: 14,
        mapStyle: "streets",
        showControls: true,
        showMarker: true,
        scrollZoom: false,
        markerTitle: "",
        markerDesc: "",
        borderRadius: 8,
        opacity: 100,
      };

      const command = createInsertGenericCommand(this, {
        sectionId: section.id,
        element,
      });
      this.executeCommand(command);
    },

    insertAlbumBlock(sectionDOMWidth?: number, sectionDOMHeight?: number) {
      const section = this.activeSection;
      if (!section) return;

      const width = 320,
        height = 240;
      const sectionWidth = sectionDOMWidth ?? 800;
      const sectionHeight = sectionDOMHeight ?? section.style?.minHeight ?? 320;

      const element: EditorElement = {
        id: createElementId(),
        type: "album",
        x: Math.round((sectionWidth - width) / 2),
        y: Math.round((sectionHeight - height) / 2),
        width,
        height,
        zIndex: getNextZIndex(section),
        rotation: 0,
        images: [],
        layout: "grid",
        columns: 3,
        gap: 6,
        itemRadius: 4,
        objectFit: "cover",
        rowHeight: 180,
        lightbox: true,
        autoplay: false,
        autoplayMs: 3000,
      };

      const command = createInsertGenericCommand(this, {
        sectionId: section.id,
        element,
      });
      this.executeCommand(command);
    },

    insertCountdownBlock(sectionDOMWidth?: number, sectionDOMHeight?: number) {
      const section = this.activeSection;
      if (!section) return;

      const width = 320, height = 140;
      const sectionWidth = sectionDOMWidth ?? 800;
      const sectionHeight = sectionDOMHeight ?? section.style?.minHeight ?? 320;

      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      const element: EditorElement = {
        id: createElementId(),
        type: "countdown",
        x: Math.round((sectionWidth - width) / 2),
        y: Math.round((sectionHeight - height) / 2),
        width,
        height,
        zIndex: getNextZIndex(section),
        targetDate: oneMonthLater.toISOString().slice(0, 16),
        label: "Đếm ngược đến ngày trọng đại",
        showDays: true,
        showHours: true,
        showMinutes: true,
        showSeconds: true,
        numberColor: "#36402d",
        labelColor: "#8B7355",
        accentColor: "#eef3e8",
        layout: "boxes",
        borderRadius: 10,
        bgColor: "transparent",
        onComplete: "message",
        completeMessage: "🎉 Đã đến ngày!",
      };

      const command = createInsertGenericCommand(this, {
        sectionId: section.id,
        element,
      });
      this.executeCommand(command);
    },

    select(id: string, isMulti = false) {
      const section = this.findSectionByElementId(id);
      if (!section) return;

      const sameSectionSelectedIds = this.ui.selectedIds.filter(
        (selectedId) =>
          this.findSectionByElementId(selectedId)?.id === section.id
      );
      const element = section.elements.find((el) => el.id === id);
      const groupIds = element?.groupId
        ? section.elements
          .filter((el) => el.groupId === element.groupId)
          .map((el) => el.id)
        : [id];

      this.ui.activeSectionId = section.id;

      if (isMulti) {
        const isSelected = groupIds.every((groupId) =>
          sameSectionSelectedIds.includes(groupId)
        );

        if (isSelected) {
          this.ui.selectedIds = sameSectionSelectedIds.filter(
            (item) => !groupIds.includes(item)
          );
        } else {
          this.ui.selectedIds = Array.from(
            new Set([...sameSectionSelectedIds, ...groupIds])
          );
        }
      } else {
        this.ui.selectedIds = groupIds;
      }
    },

    move(id: string, x: number, y: number) {
      const el = this.findElementById(id);
      if (!el) return;

      el.x = x;
      el.y = y;
    },

    updateText(id: string, content: string) {
      const el = this.findElementById(id);
      if (!el || el.type !== "text") return;
      el.content = content;
    },

    updateImageSource(id: string, src: string) {
      const el = this.findElementById(id);
      if (!el || el.type !== "image") return;
      if (el.src === src) return;

      const command = createUpdateStyleCommand(this, {
        id,
        oldData: { src: el.src },
        newData: { src },
      });

      this.executeCommand(command);
    },

    resize(id: string, width?: number, height?: number, fontSize?: number) {
      const el = this.findElementById(id);
      if (!el) return;
      if (width !== undefined) el.width = width;
      if (height !== undefined) el.height = height;
      if (fontSize !== undefined) el.fontSize = fontSize;
    },

    removeElements(ids: string[]) {
      const items = ids
        .map((id) => {
          const section = this.findSectionByElementId(id);
          return section ? { sectionId: section.id, elementId: id } : null;
        })
        .filter(
          (item): item is { sectionId: string; elementId: string } =>
            item !== null
        );

      if (items.length === 0) return;

      const command = createRemoveElementCommand(this, {
        items,
        prevSelectedIds: [...this.ui.selectedIds],
        prevActiveSectionId: this.ui.activeSectionId,
      });

      this.executeCommand(command);
    },

    removeElement(id: string) {
      this.removeElements([id]);
    },

    duplicateElement(id: string) {
      const section = this.findSectionByElementId(id);
      const element = this.findElementById(id);
      if (!section || !element) return;

      const clone = cloneElement(element);
      clone.id = createElementId();
      clone.x += 24;
      clone.y += 24;
      clone.zIndex += 1;

      const command = createDuplicateElementCommand(this, {
        sectionId: section.id,
        element: clone,
        prevSelectedIds: [...this.ui.selectedIds],
        prevActiveSectionId: this.ui.activeSectionId,
      });
      this.executeCommand(command);
    },

    updateSectionStyle(id: string, patch: SectionStylePatch) {
      const section = this.findSectionById(id);
      if (!section) return;

      const oldStyle = cloneSectionStyle(section.style);
      const newStyle: SectionStyle = {
        ...section.style,
        ...patch,
        background: patch.background
          ? {
            ...section.style.background,
            ...patch.background,
          }
          : section.style.background,
      };

      if (JSON.stringify(oldStyle) === JSON.stringify(newStyle)) return;

      const command = createUpdateSectionStyleCommand(this, {
        sectionId: id,
        oldStyle,
        newStyle,
      });
      this.executeCommand(command);
    },

    setHeightMode(id: string, mode: "auto" | "fixed") {
      const el = this.findElementById(id);
      if (!el || el.type !== "text") return;

      (el as any).heightMode = mode;
    },

    executeCommand(command: Command) {
      console.log("🔥 Store executeCommand");
      history.execute(command);
    },

    undo() {
      console.log("🔥 Store undo");
      history.undo();
    },

    redo() {
      console.log("🔥 Store redo");
      history.redo();
    },

    addImage(src: string) {
      this.insertImageBlock(src);
    },
    setBackground(type: "color" | "image", value: string) {
      this.document.background = { type, value };
    },

    alignSelected(type: AlignType) {
      const section = this.activeSection;
      if (!section) return;

      const selected = this.activeSectionSelectedElements;
      if (selected.length < 2) return;

      const items = selected.map((el) => ({
        id: el.id,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
      }));

      const aligned = computeAlignment(items, type);

      if (!aligned.length) return;
      if (
        aligned.every(
          (item) => item.oldX === item.newX && item.oldY === item.newY
        )
      )
        return;

      const command = createAlignCommand(this, { items: aligned });
      this.executeCommand(command);
    },

    groupSelected() {
      const section = this.activeSection;
      if (!section) return;

      const selected = this.activeSectionSelectedElements;
      if (selected.length < 2) return;

      const groupId = createSectionId();
      const items = selected.map((el) => ({
        id: el.id,
        oldGroupId: el.groupId,
        newGroupId: groupId,
      }));

      this.executeCommand(createGroupCommand(this, { items }));
    },

    ungroupSelected() {
      const selected = this.activeSectionSelectedElements;
      if (selected.length === 0) return;

      const groupIds = new Set(
        selected.map((el) => el.groupId).filter(Boolean)
      );

      if (groupIds.size === 0) return;

      const items = this.allElements
        .filter((el) => el.groupId && groupIds.has(el.groupId))
        .map((el) => ({
          id: el.id,
          oldGroupId: el.groupId,
          newGroupId: undefined,
        }));

      this.executeCommand(createGroupCommand(this, { items }));
    },
  },
});

export type EditorStore = ReturnType<typeof useEditorStore>;
