<template>
  <div
    :style="style"
    @mousedown.stop="onMouseDown"
  >
    {{ element.content }} ; {{element.id}} {{isSelected}}

    <!-- Resize handle -->
    <div
      v-if="isSelected"
      class="resize-handle"
      @mousedown.stop="startResize"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useEditorStore } from "../../store/editorStore";
import { createResizeCommand } from '../../core/commands/resizeElement'
import { createMoveCommand } from '../../core/commands/moveElement'
import { createGroupMoveCommand } from '../../core/commands/moveGroupElement'

const props = defineProps<{
  element: {
    id: string
    x: number
    y: number
    width: number
    height: number
    content: string
  }
}>()

const store = useEditorStore()

// =====================
// STATE
// =====================

const isSelected = computed(() =>
  store.selectedIds.includes(props.element.id)
)

const style = computed(() => ({
  position: "absolute",
  left: props.element.x + "px",
  top: props.element.y + "px",
  width: props.element.width + "px",
  height: props.element.height + "px",
  border: isSelected.value ? "1px solid blue" : "none",
  cursor: isSelected.value ? "move" : "default",
  userSelect: "none"
}))

const onMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return

  const isMulti = e.shiftKey
  const isAlreadySelected = store.selectedIds.includes(props.element.id)
  const hasGroupSelection = store.selectedIds.length > 1

  // Keep current multi-selection when dragging one selected item.
  if (isMulti) {
    store.select(props.element.id, true)
  } else if (!isAlreadySelected || !hasGroupSelection) {
    store.select(props.element.id, false)
  }

  startDrag(e)
}

// const select = (e: MouseEvent) => {
//   if (isDragging) return
//   const isMulti = e.shiftKey
//   store.select(props.element.id, isMulti)
// }

// =====================
// DRAG
// =====================

let initialX = 0
let initialY = 0

let startX = 0
let startY = 0

let lastX = 0
let lastY = 0

let isDragging = false
let initialPositions: Record<string, { x: number; y: number }> = {}

const startDrag = (e: MouseEvent) => {
  e.preventDefault()

  const selected = store.selectedIds
  isDragging = false

  // lưu toàn bộ vị trí ban đầu
  initialPositions = {}

  selected.forEach(id => {
    const el = store.elements.find(e => e.id === id)
    if (el) {
      initialPositions[id] = { x: el.x, y: el.y }
    }
  })

  startX = e.clientX
  startY = e.clientY

  // startX = e.clientX - props.element.x
  // startY = e.clientY - props.element.y

  // initialX = props.element.x
  // initialY = props.element.y

  // lastX = props.element.x
  // lastY = props.element.y

  document.body.style.userSelect = "none"

  window.addEventListener("mousemove", onDrag)
  window.addEventListener("mouseup", stopDrag)
}

const onDrag = (e: MouseEvent) => {
  setTimeout(() => {
    isDragging = false
  }, 0)
  
  const dx = e.clientX - startX
  const dy = e.clientY - startY

  store.selectedIds.forEach(id => {
    const init = initialPositions[id]
    if (!init) return

    store.move(id, init.x + dx, init.y + dy)
  })

  // const newX = e.clientX - startX
  // const newY = e.clientY - startY

  // lastX = newX
  // lastY = newY

  // // realtime update
  // store.move(props.element.id, newX, newY)
}

const stopDrag = () => {
  console.log('🛑 stopDrag', {
    lastX,
    lastY,
    currentX: props.element.x,
    currentY: props.element.y
  })

  const items = store.selectedIds
    .map(id => {
    const el = store.elements.find(e => e.id === id)
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
    window.removeEventListener("mousemove", onDrag)
    window.removeEventListener("mouseup", stopDrag)
    return
  }

  const hasPositionChange = items.some(
    item => item.oldX !== item.newX || item.oldY !== item.newY
  )

  if (!hasPositionChange) {
    document.body.style.userSelect = ""
    window.removeEventListener("mousemove", onDrag)
    window.removeEventListener("mouseup", stopDrag)
    return
  }

  const command = createGroupMoveCommand(store, { items })

  store.executeCommand(command)
  
  document.body.style.userSelect = ""
  window.removeEventListener("mousemove", onDrag)
  window.removeEventListener("mouseup", stopDrag)
}

// =====================
// RESIZE
// =====================
let initialWidth = 0
let initialHeight = 0

let startWidth = 0
let startHeight = 0

let startMouseX = 0
let startMouseY = 0

const startResize = (e: MouseEvent) => {
  e.preventDefault()

  startWidth = props.element.width
  startHeight = props.element.height

  initialWidth = props.element.width
  initialHeight = props.element.height

  startMouseX = e.clientX
  startMouseY = e.clientY

  document.body.style.userSelect = "none"
  document.body.style.cursor = "se-resize"

  window.addEventListener("mousemove", onResize)
  window.addEventListener("mouseup", stopResize)
}

const onResize = (e: MouseEvent) => {
  const dx = e.clientX - startMouseX
  const dy = e.clientY - startMouseY

  const newWidth = Math.max(50, startWidth + dx)
  const newHeight = Math.max(20, startHeight + dy)

  store.resize(props.element.id, newWidth, newHeight)
}

const stopResize = () => {
  document.body.style.userSelect = ""
  document.body.style.cursor = ""


  const currentWidth = props.element.width
  const currentHeight = props.element.height

  console.log('🛑 stopResize', {
    startWidth,
    startHeight,
    currentWidth: props.element.width,
    currentHeight: props.element.height
  })

  // chỉ tạo command nếu có thay đổi
  if (
    currentWidth !== initialWidth ||
    currentHeight !== initialHeight
  ) {
    const command = createResizeCommand(store, {
      id: props.element.id,
      oldWidth: initialWidth,
      oldHeight: initialHeight,
      newWidth: currentWidth,
      newHeight: currentHeight
    })

    store.executeCommand(command)
  }

  window.removeEventListener("mousemove", onResize)
  window.removeEventListener("mouseup", stopResize)
}
</script>

<style scoped lang="scss">
.resize-handle {
  width: 12px;
  height: 12px;
  background: blue;
  position: absolute;
  right: -6px;
  bottom: -6px;
  cursor: se-resize;
}
</style>
