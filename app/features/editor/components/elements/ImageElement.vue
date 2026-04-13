<template>
  <div :style="style" @click.stop @mousedown.stop="onMouseDown">
    <ElementToolbar v-if="isSelected && store.selectedIds.length === 1" :element="element" />
    <img 
      :src="element.src" 
      :style="{
        width: element.width + 'px',
        height: element.height + 'px',
        objectFit: element.style?.objectFit || 'cover'
      }" draggable="false" 
      />

    <div
      v-if="isSelected"
      class="resize-handle"
      @click.stop
      @mousedown.stop="startResize"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useEditorStore } from "../../store/editorStore";
import type { ImageElement as ImageElementType } from "../../types";
import ElementToolbar from "./ElementToolbar.vue";

const props = defineProps<{
  element: ImageElementType;
}>();

const store = useEditorStore();

const isSelected = computed(() => store.selectedIds.includes(props.element.id));

const style = computed(() => ({
  position: "absolute",
  left: props.element.x + "px",
  top: props.element.y + "px",
  width: props.element.width + "px",
  height: props.element.height + "px",
  border: isSelected.value ? "1px solid #6f8560" : "none",
  cursor: "move",
}));

const onMouseDown = (e: MouseEvent) => {
  const isMulti = e.shiftKey;
  store.select(props.element.id, isMulti);

  if (store.selectedIds.length === 1) {
    startDrag(e);
  }
};

// 👉 reuse drag logic giống TextElement
let startX = 0;
let startY = 0;

const startDrag = (e: MouseEvent) => {
  startX = e.clientX - props.element.x;
  startY = e.clientY - props.element.y;

  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", stopDrag);
};

const onDrag = (e: MouseEvent) => {
  const newX = e.clientX - startX;
  const newY = e.clientY - startY;

  store.move(props.element.id, newX, newY);
};

const stopDrag = () => {
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDrag);
};

// 👉 resize (reuse logic cũ)
let startWidth = 0;
let startHeight = 0;
let startMouseX = 0;
let startMouseY = 0;

const startResize = (e: MouseEvent) => {
  startWidth = props.element.width;
  startHeight = props.element.height;
  startMouseX = e.clientX;
  startMouseY = e.clientY;

  window.addEventListener("mousemove", onResize);
  window.addEventListener("mouseup", stopResize);
};

const onResize = (e: MouseEvent) => {
  const dx = e.clientX - startMouseX;
  const dy = e.clientY - startMouseY;

  const newWidth = Math.max(50, startWidth + dx);
  const newHeight = Math.max(50, startHeight + dy);

  store.resize(props.element.id, newWidth, newHeight);
};

const stopResize = () => {
  window.removeEventListener("mousemove", onResize);
  window.removeEventListener("mouseup", stopResize);
};
</script>

<style scoped>
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.resize-handle {
  width: 10px;
  height: 10px;
  background: blue;
  position: absolute;
  right: -5px;
  bottom: -5px;
  cursor: se-resize;
}
</style>
