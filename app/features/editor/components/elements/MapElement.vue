<template>
  <div
    ref="elRef"
    :data-id="element.id"
    :style="style"
    @click.stop
    @mousedown.stop="onMouseDown"
  >
    <ElementToolbar
      v-if="isSelected && store.selectedIds.length === 1"
      :element="element"
      :isSelected="isSelected"
    />

    <div class="map-el" :style="mapStyle">
      <div class="map-el__bg" :style="{ background: styleBg }" />
      <div v-if="element.showMarker" class="map-el__marker">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="#c26457"
          stroke="#fff"
          stroke-width="1"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        </svg>
      </div>
      <div v-if="element.markerTitle" class="map-el__label">
        <strong>{{ element.markerTitle }}</strong>
        <span v-if="element.markerDesc">{{ element.markerDesc }}</span>
      </div>
    </div>

    <div
      v-if="isSelected"
      class="resize-handle tl"
      @mousedown.stop="startResize($event, 'tl')"
    />
    <div
      v-if="isSelected"
      class="resize-handle tr"
      @mousedown.stop="startResize($event, 'tr')"
    />
    <div
      v-if="isSelected"
      class="resize-handle bl"
      @mousedown.stop="startResize($event, 'bl')"
    />
    <div
      v-if="isSelected"
      class="resize-handle br"
      @mousedown.stop="startResize($event, 'br')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject } from "vue";
import { useEditorStore } from "../../store/editorStore";
import { useDragResize } from "../../composables/useDragResize";
import type { ContainerRect, SnapLine } from "../../core/snapEngine";
import type { MapElement as MapElementType } from "../../types";
import ElementToolbar from "./ElementToolbar.vue";

const props = defineProps<{ element: MapElementType }>();
const store = useEditorStore();
const elRef = ref<HTMLElement | null>(null);

const setSnapLines = inject<(lines: SnapLine[]) => void>("setSnapLines");
const getContainerRect = inject<() => ContainerRect>("getContainerRect");

const isSelected = computed(() => store.selectedIds.includes(props.element.id));
const { startDrag, startResize } = useDragResize(
  props.element,
  setSnapLines,
  getContainerRect
);

const onMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return;
  store.select(props.element.id, e.shiftKey);
  startDrag(e);
};

const stylePreviews: Record<string, string> = {
  streets: "linear-gradient(135deg, #e8dcc8, #c8b89a)",
  satellite: "linear-gradient(135deg, #2c4a2c, #4a7a4a)",
  light: "linear-gradient(135deg, #f5f5f5, #e0e0e0)",
  dark: "linear-gradient(135deg, #1a1a2e, #2d2d44)",
  outdoors: "linear-gradient(135deg, #d4e8c2, #b0cc8c)",
  watercolor: "linear-gradient(135deg, #c8d8e8, #a8c0d8)",
};
const styleBg = computed(
  () => stylePreviews[props.element.mapStyle] ?? stylePreviews.streets
);

const style = computed(() => ({
  position: "absolute",
  left: props.element.x + "px",
  top: props.element.y + "px",
  width: props.element.width + "px",
  height: props.element.height + "px",
  border: isSelected.value ? "1px solid #6f8560" : "1px solid transparent",
  cursor: isSelected.value ? "move" : "default",
  boxSizing: "border-box",
}));

const mapStyle = computed(() => ({
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  borderRadius: `${props.element.borderRadius}px`,
  opacity: props.element.opacity / 100,
}));
</script>

<style scoped lang="scss">
.map-el {
  &__bg {
    position: absolute;
    inset: 0;
  }
  &__marker {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%);
  }
  &__label {
    position: absolute;
    bottom: 10px;
    left: 10px;
    right: 10px;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 8px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 12px;
    strong {
      color: $text-dark;
    }
    span {
      color: $text-light;
      font-size: 11px;
    }
  }
}

.resize-handle {
  width: 10px;
  height: 10px;
  background: #4a6b4d;
  position: absolute;
  border-radius: 50%;
  z-index: 3;
}
.resize-handle.tl {
  left: -5px;
  top: -5px;
  cursor: nwse-resize;
}
.resize-handle.tr {
  right: -5px;
  top: -5px;
  cursor: nesw-resize;
}
.resize-handle.bl {
  left: -5px;
  bottom: -5px;
  cursor: nesw-resize;
}
.resize-handle.br {
  right: -5px;
  bottom: -5px;
  cursor: nwse-resize;
}
</style>
