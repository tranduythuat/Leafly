<template>
  <InsSection title="Typography">
    <InsField
      type="textarea"
      label="Content"
      :model-value="local.content"
      @update:model-value="
        local.content = $event;
        debouncedApply();
      "
    />

    <!-- Font family -->
    <div class="tp-field">
      <span class="tp-label">Font family</span>
      <div class="tp-font-wrap">
        <select
          :value="local.fontFamily"
          class="tp-font-select"
          :style="{ fontFamily: local.fontFamily }"
          @change="local.fontFamily = ($event.target as HTMLSelectElement).value; debouncedApply()"
        >
          <optgroup v-for="group in fontGroups" :key="group.label" :label="group.label">
            <option
              v-for="font in group.fonts"
              :key="font.value"
              :value="font.value"
              :style="{ fontFamily: font.value }"
            >{{ font.label }}</option>
          </optgroup>
        </select>
        <div class="tp-font-preview" :style="{ fontFamily: local.fontFamily }">
          Aa — The quick brown fox
        </div>
      </div>
    </div>

    <div class="tp-row2">
      <InsField
        type="number"
        label="Font size"
        :model-value="local.fontSize"
        unit="px"
        :min="6"
        :max="300"
        @update:model-value="
          local.fontSize = $event;
          debouncedApply();
        "
      />
      <InsField
        type="color"
        label="Color"
        :model-value="local.color"
        @update:model-value="
          local.color = $event;
          debouncedApply();
        "
      />
    </div>

    <!-- Alignment -->
    <div class="tp-field">
      <span class="tp-label">Alignment</span>
      <div class="tp-align-row">
        <button
          v-for="a in alignments"
          :key="a.value"
          class="tp-align-btn"
          :class="{ 'tp-align-btn--active': local.alignment === a.value }"
          :title="a.label"
          @click="
            local.alignment = a.value;
            debouncedApply();
          "
        >
          <component :is="a.icon" />
        </button>
      </div>
    </div>

    <!-- <button class="tp-apply-btn" @click="applyNow">Apply</button> -->
  </InsSection>
</template>

<script setup lang="ts">
import { reactive, watch, defineComponent, h } from "vue";
import InsSection from "../shared/InsSection.vue";
import InsField from "../shared/InsField.vue";
import { useEditorStore } from "../../store/editorStore";
import { createUpdateStyleCommand } from "../../core/commands/updateStyle";
import { debounce } from "../../utils/debounce";
import type { TextElement } from "../../types";

const props = defineProps<{ element: TextElement }>();
const store = useEditorStore();

// ── Font groups (Google Fonts — đã có sẵn trong _typography.scss) ──
const fontGroups = [
  {
    label: 'Display / Serif',
    fonts: [
      { label: 'Playfair Display', value: "'Playfair Display', serif" },
      { label: 'Cormorant Garamond', value: "'Cormorant Garamond', serif" },
      { label: 'Georgia', value: 'Georgia, serif' },
      { label: 'Times New Roman', value: "'Times New Roman', serif" },
    ],
  },
  {
    label: 'Sans-serif',
    fonts: [
      { label: 'Jost', value: "'Jost', sans-serif" },
      { label: 'Inter', value: "'Inter', sans-serif" },
      { label: 'Helvetica Neue', value: "'Helvetica Neue', sans-serif" },
      { label: 'Arial', value: 'Arial, sans-serif' },
    ],
  },
  {
    label: 'Script / Handwriting',
    fonts: [
      { label: 'Dancing Script', value: "'Dancing Script', cursive" },
      { label: 'Great Vibes', value: "'Great Vibes', cursive" },
      { label: 'Pacifico', value: "'Pacifico', cursive" },
      { label: 'Sacramento', value: "'Sacramento', cursive" },
    ],
  },
  {
    label: 'Monospace',
    fonts: [
      { label: 'Courier New', value: "'Courier New', monospace" },
      { label: 'Roboto Mono', value: "'Roboto Mono', monospace" },
    ],
  },
]

// ── Inline SVG icon components ──
const mkIcon = (d: string) =>
  defineComponent({
    render: () =>
      h(
        "svg",
        {
          width: 13,
          height: 13,
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2",
        },
        d
          .split("|")
          .map((path) => h("line", ...([] as any)) ?? h("path", { d: path }))
      ),
  });

// Simple SVG align icons via render functions
const AlignLeft = defineComponent({
  render: () =>
    h(
      "svg",
      {
        width: 13,
        height: 13,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
      },
      [
        h("line", { x1: "21", y1: "10", x2: "3", y2: "10" }),
        h("line", { x1: "15", y1: "6", x2: "3", y2: "6" }),
        h("line", { x1: "17", y1: "14", x2: "3", y2: "14" }),
        h("line", { x1: "13", y1: "18", x2: "3", y2: "18" }),
      ]
    ),
});
const AlignCenter = defineComponent({
  render: () =>
    h(
      "svg",
      {
        width: 13,
        height: 13,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
      },
      [
        h("line", { x1: "21", y1: "10", x2: "3", y2: "10" }),
        h("line", { x1: "17", y1: "6", x2: "7", y2: "6" }),
        h("line", { x1: "19", y1: "14", x2: "5", y2: "14" }),
        h("line", { x1: "15", y1: "18", x2: "9", y2: "18" }),
      ]
    ),
});
const AlignRight = defineComponent({
  render: () =>
    h(
      "svg",
      {
        width: 13,
        height: 13,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
      },
      [
        h("line", { x1: "21", y1: "10", x2: "3", y2: "10" }),
        h("line", { x1: "21", y1: "6", x2: "9", y2: "6" }),
        h("line", { x1: "21", y1: "14", x2: "7", y2: "14" }),
        h("line", { x1: "21", y1: "18", x2: "11", y2: "18" }),
      ]
    ),
});
const AlignJustify = defineComponent({
  render: () =>
    h(
      "svg",
      {
        width: 13,
        height: 13,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
      },
      [
        h("line", { x1: "21", y1: "10", x2: "3", y2: "10" }),
        h("line", { x1: "21", y1: "6", x2: "3", y2: "6" }),
        h("line", { x1: "21", y1: "14", x2: "3", y2: "14" }),
        h("line", { x1: "21", y1: "18", x2: "3", y2: "18" }),
      ]
    ),
});

const alignments = [
  { value: "left", label: "Left", icon: AlignLeft },
  { value: "center", label: "Center", icon: AlignCenter },
  { value: "right", label: "Right", icon: AlignRight },
  { value: "justify", label: "Justify", icon: AlignJustify },
];

const DEFAULT_FONT = "'Playfair Display', serif";
// ── Local reactive state ──
let isSyncing = false;

const local = reactive({
  content: "",
  fontSize: 16,
  fontFamily: DEFAULT_FONT,
  color: "#000000",
  alignment: "left" as "left" | "center" | "right" | "justify",
});

const syncFromElement = (el: TextElement) => {
  isSyncing = true;
  local.content = el.content;
  local.fontSize = el.fontSize ?? 16;
  local.fontFamily = (el as any).fontFamily ?? DEFAULT_FONT
  local.color = el.color ?? "#000000";
  local.alignment = (el.alignment ?? "left") as any;
  isSyncing = false;
};

watch(
  () => props.element,
  (el) => {
    if (el) syncFromElement(el);
  },
  { immediate: true, deep: true }
);

// ── Apply ──
const applyNow = () => {
  const el = props.element;
  const noChange =
    el.content === local.content &&
    ((el as any).fontFamily ?? DEFAULT_FONT) === local.fontFamily &&
    (el.fontSize ?? 16) === local.fontSize &&
    (el.color ?? "#000000") === local.color &&
    (el.alignment ?? "left") === local.alignment;
  if (noChange) return;

  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: el.id,
      oldData: {
        content: el.content,
        fontFamily: (el as any).fontFamily,
        fontSize: el.fontSize,
        color: el.color,
        alignment: el.alignment,
      },
      newData: {
        content: local.content,
        fontFamily: local.fontFamily,
        fontSize: local.fontSize,
        color: local.color,
        alignment: local.alignment,
      },
    })
  );
};

const debouncedApply = debounce(applyNow, 280);
</script>

<style scoped lang="scss">
.tp-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.tp-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tp-label {
  font-size: 10px;
  font-weight: 500;
  color: $text-light;
}

/* Font family */
.tp-font-wrap {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
 
.tp-font-select {
  width: 100%;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  padding: 5px 26px 5px 8px;
  font-size: 12px;
  background: $white;
  color: $text-dark;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%238B7355' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  transition: border-color 0.15s;
 
  &:focus { border-color: $sage; }
}
 
.tp-font-preview {
  padding: 7px 10px;
  background: $cream;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  font-size: 13px;
  color: $text-mid;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


/* Alignment */
.tp-align-row {
  display: flex;
  gap: 4px;
}

.tp-align-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  background: $white;
  color: $text-light;
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    background: $cream;
    color: $text-dark;
  }

  &--active {
    background: #eef3e8;
    border-color: $sage;
    color: $sage-dark;
  }
}

.tp-apply-btn {
  width: 100%;
  padding: 7px;
  background: $sage;
  border: none;
  border-radius: $radius-sm;
  color: $white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: $sage-dark;
  }
}
</style>