<template>
  <div
    ref="canvasRef"
    class="section-canvas"
    :style="sectionStyle"
    :data-section-id="section.id"
    @click.stop
    @contextmenu.prevent="onContextMenu"
    @mousedown.self="onCanvasMouseDown"
  >
    <div v-if="!sortedElements.length" class="section-canvas__empty">
      <strong>Empty section</strong>
      <p>
        Add a text or image block from the left panel to start composing this
        section.
      </p>
    </div>

    <component
      v-for="el in sortedElements"
      :key="el.id"
      :is="resolveComponent(el)"
      :element="el"
      :class="{
        'el--picker-hover':
          el.id === pickerHoveredId && pickerHoveredId !== null,
      }"
    />

    <BoundingBox v-if="isActiveSection" :section-id="section.id" />
    <GuideLines v-if="isActiveSection" :lines="snapLines" />
  </div>

  <!-- Layer Picker -->
  <LayerPicker
    :visible="pickerVisible"
    :x="pickerX"
    :y="pickerY"
    :items="pickerItems"
    :selected-id="store.selectedIds[0] ?? null"
    :hovered-id="pickerHoveredId"
    @select="onPickerSelect"
    @hover="onPickerHover"
    @close="closePicker"
  />
</template>

<script setup lang="ts">
import { computed, provide, ref } from "vue";
import type { EditorElement, Section } from "../../types";
import { useEditorStore } from "../../store/editorStore";
import type { SnapLine } from "../../core/snapEngine";
import type { ContainerRect } from "../../core/snapEngine";
import GuideLines from "./GuideLines.vue";
import TextElement from "../elements/TextElement.vue";
import ImageElement from "../elements/ImageElement.vue";
import FormElement from "../elements/FormElement.vue";
import MapElement from "../elements/MapElement.vue";
import AlbumElement from "../elements/AlbumElement.vue";
import CountdownElement from "../elements/CountdownElement.vue";
import LoveStoryElement from "../elements/LoveStoryElement.vue";
import VideoElement from "../elements/VideoElement.vue"; //
import BoundingBox from "./BoundingBox.vue";
import LayerPicker from "./LayerPicker.vue";
import type { LayerPickerItem } from "./LayerPicker.vue";

const emit = defineEmits<{
  "marquee-start": [payload: { sectionId: string; x: number; y: number }];
  "marquee-move": [payload: { x: number; y: number }];
  "marquee-end": [];
}>();

const props = defineProps<{
  section: Section;
}>();

const store = useEditorStore();

const emitMarquee = (
  type: "start" | "move" | "end",
  payload?: { x: number; y: number }
) => {
  if (type === "start" && payload) {
    emit("marquee-start", {
      sectionId: props.section.id,
      x: payload.x,
      y: payload.y,
    });
  } else if (type === "move" && payload) {
    emit("marquee-move", { x: payload.x, y: payload.y });
  } else if (type === "end") {
    emit("marquee-end");
  }
};

let isMarqueeDragging = false;
let marqueeStartX = 0;
let marqueeStartY = 0;

const onCanvasMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return;
  if ((e.target as HTMLElement).closest(".section-canvas__empty")) return;

  store.selectSection(props.section.id);

  isMarqueeDragging = true;
  marqueeStartX = e.clientX;
  marqueeStartY = e.clientY;

  emitMarquee("start", { x: e.clientX, y: e.clientY });

  window.addEventListener("mousemove", onCanvasMouseMove);
  window.addEventListener("mouseup", onCanvasMouseUp);
};

const onCanvasMouseMove = (e: MouseEvent) => {
  if (!isMarqueeDragging) return;
  emitMarquee("move", { x: e.clientX, y: e.clientY });
};

const onCanvasMouseUp = (e: MouseEvent) => {
  if (!isMarqueeDragging) return;
  isMarqueeDragging = false;

  window.removeEventListener("mousemove", onCanvasMouseMove);
  window.removeEventListener("mouseup", onCanvasMouseUp);

  emitMarquee("end");
};

const canvasRef = ref<HTMLElement | null>(null);
const snapLines = ref<SnapLine[]>([]);

provide("setSnapLines", (lines: SnapLine[]) => {
  snapLines.value = lines;
});

const getContainerRect = (): ContainerRect => {
  const el = canvasRef.value;
  if (!el) {
    return {
      x: 0,
      y: 0,
      width: props.section.style.minHeight,
      height: props.section.style.minHeight,
      paddingX: props.section.style.padding,
      paddingY: props.section.style.padding,
    };
  }

  return {
    x: 0,
    y: 0,
    width: el.clientWidth,
    height: el.clientHeight,
    paddingX: props.section.style.padding,
    paddingY: props.section.style.padding,
  };
};

provide("getContainerRect", getContainerRect);

const sortedElements = computed(() =>
  [...props.section.elements].sort((a, b) => a.zIndex - b.zIndex)
);

const isActiveSection = computed(
  () => store.activeSectionId === props.section.id
);

const sectionStyle = computed(() => ({
  position: "relative",
  minHeight: `${props.section.style.minHeight}px`,
  padding: `${props.section.style.padding}px`,
  backgroundColor:
    props.section.style.background.type === "color"
      ? props.section.style.background.value
      : undefined,
  backgroundImage:
    props.section.style.background.type === "image"
      ? `url(${props.section.style.background.value})`
      : undefined,
  backgroundSize: "cover",
  backgroundPosition: "center",
}));

const resolveComponent = (el: EditorElement) => {
  if (el.type === "text") return TextElement;
  if (el.type === "image") return ImageElement;
  if (el.type === "form") return FormElement;
  if (el.type === "map") return MapElement;
  if (el.type === "album") return AlbumElement;
  if (el.type === "countdown") return CountdownElement;
  if (el.type === "loveStory") return LoveStoryElement;
  if (el.type === "video") return VideoElement;

  return TextElement;
};

// =====================
// LAYER PICKER
// =====================

const pickerVisible = ref(false);
const pickerX = ref(0);
const pickerY = ref(0);
const pickerItems = ref<LayerPickerItem[]>([]);
const pickerHoveredId = ref<string | null>(null);

/**
 * Tìm tất cả elements chứa điểm (px, py) trong hệ toạ độ section.
 * Trả về đã sắp xếp theo zIndex cao → thấp (để menu hiện từ trên xuống).
 */
const getElementsAtPoint = (px: number, py: number): EditorElement[] => {
  return props.section.elements
    .filter((el) => {
      return (
        px >= el.x &&
        px <= el.x + el.width &&
        py >= el.y &&
        py <= el.y + el.height
      );
    })
    .sort((a, b) => b.zIndex - a.zIndex);
};

const buildPickerItems = (elements: EditorElement[]): LayerPickerItem[] => {
  return elements.map((el) => {
    if (el.type === "text") {
      const preview = el.content?.slice(0, 20) ?? "Text";
      return {
        id: el.id,
        type: "text",
        label: preview + (el.content?.length > 20 ? "…" : ""),
        zIndex: el.zIndex,
        color: el.color ?? "#36402d",
      };
    }

    if (el.type === "image") {
      return {
        id: el.id,
        type: "image",
        label: "Image",
        zIndex: el.zIndex,
        src: el.src,
      };
    }

    if (el.type === "form") {
      return {
        id: el.id,
        type: "form",
        label: "Form",
        zIndex: el.zIndex,
      };
    }

    if (el.type === "map") {
      return {
        id: el.id,
        type: "map",
        label: el.markerTitle || "Map",
        zIndex: el.zIndex,
      };
    }

    if (el.type === "album") {
      return {
        id: el.id,
        type: "album",
        label: `Album (${el.images.length})`,
        zIndex: el.zIndex,
      };
    }

    if (el.type === "countdown") {
      return {
        id: el.id,
        type: "countdown",
        label: "Countdown",
        zIndex: el.zIndex,
      };
    }

    if (el.type === "loveStory") {
      return {
        id: el.id,
        type: "loveStory",
        label: `Love Story (${el.milestones.length})`,
        zIndex: el.zIndex,
      };
    }

    if (el.type === "video") {
      return {
        id: el.id,
        type: "video",
        label:
          el.sourceType === "upload"
            ? "Video (upload)"
            : `Video (${el.sourceType})`,
        zIndex: el.zIndex,
      };
    }

    return {
      id: el.id,
      type: el.type,
      label: "Element",
      zIndex: el.zIndex,
    };
  });
};

const onContextMenu = (e: MouseEvent) => {
  // Chuyển toạ độ chuột sang hệ toạ độ section (relative)
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;

  const hits = getElementsAtPoint(px, py);

  // Không có element nào → để browser context menu mặc định (hoặc bỏ qua)
  if (hits.length === 0) return;

  // Chỉ 1 element → select thẳng, không cần menu
  if (hits.length === 1) {
    store.select(hits[0].id, false);
    return;
  }

  // Nhiều element → hiện picker
  store.selectSection(props.section.id);

  pickerItems.value = buildPickerItems(hits);
  pickerX.value = e.clientX;
  pickerY.value = e.clientY;
  pickerVisible.value = true;
};

const onPickerSelect = (id: string) => {
  store.select(id, false);
  pickerHoveredId.value = null;
};

const onPickerHover = (id: string | null) => {
  pickerHoveredId.value = id;
};

const closePicker = () => {
  pickerVisible.value = false;
  pickerHoveredId.value = null;
};
</script>

<style scoped lang="scss">
.section-canvas {
  width: min(100%, 720px);
  margin: 0 auto;
  box-shadow: 0 12px 40px rgba(54, 64, 45, 0.08);
}

.section-canvas__empty {
  display: grid;
  place-items: center;
  gap: 0.35rem;
  min-height: 220px;
  border: 1px dashed #cfd7c0;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.48);
  color: #728062;
  text-align: center;

  strong {
    color: #4b5840;
    font-size: 1rem;
  }

  p {
    max-width: 360px;
    margin: 0;
    line-height: 1.6;
    font-size: 0.88rem;
  }
}
</style>

<!-- Global: highlight khi hover từ picker -->
<style>
.el--picker-hover {
  outline: 2px solid #e040fb !important;
  outline-offset: 2px;
  border-radius: 4px;
  transition: outline 0.08s;
  z-index: 50 !important;
}
</style>
