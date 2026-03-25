<template>
  <div
    :style="style"
    @click.stop="select"
    @mousedown="startDrag"
  >
    {{ element.content }}

    <div
      v-if="isSelected"
      class="resize-handle"
      @mousedown.stop="startResize"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useEditorStore } from "../../store/editorStore";

const props = defineProps(['element']);
const store = useEditorStore();

const isSelected = computed(() =>
  store.selectedId === props.element.id
)
// console.log('--- props ---', props.element);

const style = computed(() => ({
  position: "absolute",
  left: props.element.x + "px",
  top: props.element.y + "px",
  width: props.element.width + 'px',
  height: props.element.height + 'px',
  border: isSelected.value ? '1px solid blue' : 'none',
  cursor: "move",
}));

const select = () => {
  store.select(props.element.id);
};

let startX = 0;
let startY = 0;
let startWidth = 0
let startHeight = 0

let startMouseX = 0
let startMouseY = 0

const startDrag = (e) => {
  startX = e.clientX - props.element.x;
  startY = e.clientY - props.element.y;

  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", stopDrag);
};

const onDrag = (e) => {
  store.move(props.element.id, e.clientX - startX, e.clientY - startY);
};

const stopDrag = () => {
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDrag);
};

const startResize = (e) => {
  startWidth = props.element.width
  startHeight = props.element.height
  startMouseX = e.clientX
  startMouseY = e.clientY

  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'se-resize'

  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
}

const onResize = (e) => {
  const dx = e.clientX - startMouseX
  const dy = e.clientY - startMouseY

  const newWidth = Math.max(50, startWidth + dx)
  const newHeight = Math.max(20, startHeight + dy)

  store.resize(props.element.id, newWidth, newHeight)
}

const stopResize = () => {
  document.body.style.userSelect = ''
  document.body.style.cursor = ''

  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
}
</script>

<style lang="scss">
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