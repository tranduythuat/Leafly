<template>
  <Teleport to='body'>
    <div 
      ref="toolbarRef"
      v-if="isVisible"
      class="element-toolbar"
      :style="toolbarStyle"
      @click.stop @mousedown.stop
    >
      <button type="button" @click="duplicate">Duplicate</button>
      <button type="button" @click="bringToFront">Front</button>
      <button type="button" @click="sendToBack">Back</button>
      <template v-if="showAlignment">
        <button type="button" @click="setAlignment('left')">Left</button>
        <button type="button" @click="setAlignment('center')">Center</button>
        <button type="button" @click="setAlignment('right')">Right</button>
      </template>
      <button type="button" class="element-toolbar__danger" @click="remove">
        Delete
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from "vue"
import { createBringToFrontCommand, createSendToBackCommand } from "../../core/commands/layer"
import { createUpdateStyleCommand } from "../../core/commands/updateStyle"
import { useEditorStore } from "../../store/editorStore"
import type { Alignment, EditorElement } from "../../types"
 
const props = defineProps<{
  element: EditorElement
  isSelected: boolean
}>()
 
const store = useEditorStore()
 
const showAlignment = computed(() => props.element.type === "text")
const isVisible = computed(() => props.isSelected && store.selectedIds.length === 1)
 
// =====================
// POSITION: đọc từ DOM, không phụ thuộc vào transform của parent
// =====================
 
const toolbarPos = ref({ x: 0, y: 0 })
const toolbarRef = ref<HTMLElement | null>(null)
 
const updatePosition = () => {
  if (!isVisible.value) return

  const domEl = document.querySelector(`[data-id="${props.element.id}"]`) as HTMLElement | null
  const toolbarEl = toolbarRef.value

  if (!domEl || !toolbarEl) return

  const rect = domEl.getBoundingClientRect()
  const toolbarRect = toolbarEl.getBoundingClientRect()

  const margin = 8

  let x = rect.left + rect.width / 2
  let y = rect.top

  // 👉 CLAMP X (trái/phải)
  const minX = toolbarRect.width / 2 + margin
  const maxX = window.innerWidth - toolbarRect.width / 2 - margin
  x = Math.max(minX, Math.min(x, maxX))

  // 👉 CLAMP Y (chỉ chặn top, KHÔNG flip)
  const toolbarTop = y - toolbarRect.height - 10

  if (toolbarTop < margin) {
    // ép sát viền trên
    y = toolbarRect.height + margin + 10
  }

  toolbarPos.value = { x, y }
}
 
const toolbarStyle = computed(() => ({
  position: 'fixed' as const,
  left: toolbarPos.value.x + 'px',
  top: toolbarPos.value.y + 'px',
  transform: 'translateX(-50%) translateY(calc(-100% - 10px))',
  // Không có rotate — toolbar luôn nằm ngang
}))
 
// Cập nhật vị trí mỗi khi element thay đổi (x, y, width, rotation...)
watch(
  () => [
    props.element.x,
    props.element.y,
    props.element.width,
    props.element.height,
    props.element.rotation,
    isVisible.value,
  ],
  () => {
    requestAnimationFrame(updatePosition)
  },
  { immediate: true }
)
 
// Cập nhật khi scroll hoặc resize viewport
onMounted(() => {
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
})
 
onUnmounted(() => {
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
})
 
// =====================
// ACTIONS
// =====================
 
const duplicate = () => store.duplicateElement(props.element.id)
const remove = () => store.removeElement(props.element.id)
 
const bringToFront = () => {
  store.executeCommand(createBringToFrontCommand(store, props.element.id))
}
 
const sendToBack = () => {
  store.executeCommand(createSendToBackCommand(store, props.element.id))
}
 
const setAlignment = (alignment: Alignment) => {
  if (props.element.type !== "text" || props.element.alignment === alignment) return
  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: props.element.id,
      oldData: { alignment: props.element.alignment },
      newData: { alignment },
    })
  )
}
</script>
 
<style scoped lang="scss">
.element-toolbar {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem;
  border: 1px solid #dbd5ca;
  border-radius: 16px;
  background: rgba(255, 253, 248, 0.95);
  box-shadow: 0 10px 24px rgba(54, 64, 45, 0.14);
  z-index: 9999;
  white-space: nowrap;
  // Không có transform rotate — luôn nằm ngang
  pointer-events: auto;
 
  button {
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: #4f5c43;
    padding: 0.45rem 0.65rem;
    font-size: 0.78rem;
    white-space: nowrap;
    cursor: pointer;
 
    &:hover {
      background: #edf2e7;
    }
  }
 
  &__danger {
    color: #c26457;
    &:hover {
      background: #fdf1ef;
    }
  }
}
</style>