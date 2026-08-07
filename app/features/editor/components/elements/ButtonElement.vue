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

    <div class="btn-el" :style="innerStyle">
      {{ element.label || "Button" }}
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
import type { ButtonElement as ButtonElementType } from "../../types";
import ElementToolbar from "./ElementToolbar.vue";

const props = defineProps<{ element: ButtonElementType }>();
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

// Chỉ là preview trong editor — không điều hướng thật (điều hướng chỉ xảy ra ở HTML export)
const innerStyle = computed(() => ({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center" as const,
  background: props.element.bgColor,
  color: props.element.textColor,
  borderRadius: `${props.element.borderRadius}px`,
  border: `${props.element.borderWidth ?? 0}px solid ${
    props.element.borderColor ?? "transparent"
  }`,
  fontSize: `${props.element.fontSize}px`,
  fontWeight: props.element.fontWeight,
  pointerEvents: "none" as const,
  userSelect: "none" as const,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
}));
</script>

<style scoped lang="scss">
.btn-el {
  box-sizing: border-box;
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