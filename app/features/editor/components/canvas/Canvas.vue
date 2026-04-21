<template>
  <div class="canvas-body" @click.self="store.clearSelection()">
    <div class="canvas-stack">
      <section
        v-for="section in store.sections"
        :key="section.id"
        class="canvas-section"
        :class="{ 'canvas-section--active': store.activeSectionId === section.id }"
        :style="{ minHeight: section.style.minHeight + 'px' }"
        @click="store.selectSection(section.id)"
      >
        <ElementRenderer :section="section" />

        <!-- Resize handle: chỉ hiện khi section active -->
        <div
          v-if="store.activeSectionId === section.id"
          class="section-resize-handle"
          @mousedown.stop="startResize($event, section.id, section.style.minHeight)"
        >
          <div class="section-resize-handle__bar" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from "../../store/editorStore";
import ElementRenderer from "./ElementRenderer.vue";
import { createResizeSectionCommand } from "../../core/commands/resizeSectionHeight";

const store = useEditorStore();

// =====================
// SECTION RESIZE (min-height)
// =====================

let resizeSectionId = ''
let resizeStartY = 0
let resizeInitialMinHeight = 0
let resizeLastMinHeight = 0

const startResize = (e: MouseEvent, sectionId: string, currentMinHeight: number) => {
  e.preventDefault()

  resizeSectionId = sectionId
  resizeStartY = e.clientY
  resizeInitialMinHeight = currentMinHeight
  resizeLastMinHeight = currentMinHeight

  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'ns-resize'

  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
}

const onResize = (e: MouseEvent) => {
  const dy = e.clientY - resizeStartY
  const newMinHeight = Math.max(80, Math.round(resizeInitialMinHeight + dy))

  resizeLastMinHeight = newMinHeight

  // Cập nhật realtime
  const section = store.findSectionById(resizeSectionId)
  if (section) section.style.minHeight = newMinHeight
}

const stopResize = () => {
  document.body.style.userSelect = ''
  document.body.style.cursor = ''

  if (resizeLastMinHeight !== resizeInitialMinHeight) {
    store.executeCommand(
      createResizeSectionCommand(store, {
        sectionId: resizeSectionId,
        oldMinHeight: resizeInitialMinHeight,
        newMinHeight: resizeLastMinHeight,
      })
    )
  }

  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
}
</script>

<style scoped lang="scss">
.canvas-body {
  flex: 1;
  position: relative;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.85), transparent 30%),
    linear-gradient(180deg, #f7f3eb, #f1ede3);
  overflow: auto;
  padding: .5rem;
}

.canvas-stack {
  display: flex;
  flex-direction: column;
  max-width: 720px;
  margin: 0 auto;
  min-height: 100%;
}

.canvas-section {
  position: relative;
  transition: border-color 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.canvas-section--active {
  border-color: #95a87d;
  transform: translateY(-1px);
}

/* ===== RESIZE HANDLE ===== */
.section-resize-handle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ns-resize;
  z-index: 10;

  /* Vùng click rộng hơn thanh hiển thị */
  &::before {
    content: '';
    position: absolute;
    inset: -4px 0;
  }

  &:hover .section-resize-handle__bar,
  &:active .section-resize-handle__bar {
    background: #95a87d;
    width: 64px;
  }
}

.section-resize-handle__bar {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: rgba(149, 168, 125, 0.4);
  transition: background 0.2s, width 0.2s;
}
</style>