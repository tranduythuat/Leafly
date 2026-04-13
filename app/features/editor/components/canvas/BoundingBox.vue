<template>
  <div
    v-if="box"
    class="bounding-box"
    :style="style"
    @mousedown.stop="startDrag"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useEditorStore } from "../../store/editorStore";
import { createGroupMoveCommand } from '../../core/commands/moveGroupElement'

const props = defineProps<{
  sectionId: string
}>()

const store = useEditorStore();

const box = computed(() => {
  if (store.activeSectionId !== props.sectionId) return null

  const selected = store.activeSectionSelectedElements

  // Only show draggable group box when multiple items are selected.
  if (selected.length < 2) return null;

  const minX = Math.min(...selected.map((e) => e.x));
  const minY = Math.min(...selected.map((e) => e.y));
  const maxX = Math.max(...selected.map((e) => e.x + e.width));
  const maxY = Math.max(...selected.map((e) => e.y + e.height));

  const padding = 5;

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
});

const style = computed(() => ({
  position: "absolute",
  left: box.value?.x + "px",
  top: box.value?.y + "px",
  width: box.value?.width + "px",
  height: box.value?.height + "px",
  border: "1px dashed #6f8560",
  pointerEvents: "auto",
  cursor: "move",
  zIndex: 20,
}));

// =====================
// DRAG GROUP
// =====================
let startX = 0
let startY = 0
let initialPositions: Record<string, { x: number; y: number }> = {}

const startDrag = (e: MouseEvent) => {
  if (e.button !== 0) return
  e.preventDefault()
  document.body.style.userSelect = "none"

  startX = e.clientX
  startY = e.clientY

  // lưu vị trí ban đầu của toàn bộ group
  initialPositions = {}

  store.selectedIds.forEach(id => {
    const el = store.findElementById(id)
    if (el) {
      initialPositions[id] = { x: el.x, y: el.y }
    }
  })

  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
  const dx = e.clientX - startX
  const dy = e.clientY - startY

  store.selectedIds.forEach(id => {
    const init = initialPositions[id]
    if (!init) return

    store.move(id, init.x + dx, init.y + dy)
  })
}

const stopDrag = () => {
  const items = store.selectedIds
    .map(id => {
    const el = store.findElementById(id)
    const init = initialPositions[id]
    if (!el || !init) return null

    return {
      id,
      oldX: init.x,
      oldY: init.y,
      newX: el.x,
      newY: el.y
    }
  })
    .filter((item): item is { id: string; oldX: number; oldY: number; newX: number; newY: number } => item !== null)

  if (!items.length) {
    document.body.style.userSelect = ""
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup', stopDrag)
    return
  }

  const hasPositionChange = items.some(
    item => item.oldX !== item.newX || item.oldY !== item.newY
  )

  if (!hasPositionChange) {
    document.body.style.userSelect = ""
    window.removeEventListener('mousemove', onDrag)
    window.removeEventListener('mouseup', stopDrag)
    return
  }

  const command = createGroupMoveCommand(store, { items })

  store.executeCommand(command)

  document.body.style.userSelect = ""
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}
</script>

<style scoped>
.bounding-box {
  box-sizing: border-box;
  border-radius: 14px;
  background: rgba(111, 133, 96, 0.04);
}
</style>
