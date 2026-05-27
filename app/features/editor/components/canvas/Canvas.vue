<template>
  <div ref="canvasBodyRef" class="canvas-body" @click.self="store.clearSelection()">
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
import { ref } from 'vue'
import { useEditorStore } from '../../store/editorStore'
import ElementRenderer from './ElementRenderer.vue'
import { createResizeSectionCommand } from '../../core/commands/resizeSectionHeight'

const store         = useEditorStore()
const canvasBodyRef = ref<HTMLElement | null>(null)

// ─── Tuning ──────────────────────────────────────────────
const MIN_HEIGHT       = 80   // chiều cao tối thiểu mỗi section (px)
const SCROLL_ZONE      = 80   // khoảng cách chuột → đáy viewport để trigger auto-scroll (px)
const SCROLL_SPEED_MIN = 8    // px/frame khi chuột vừa vào vùng trigger
const SCROLL_SPEED_MAX = 28   // px/frame khi chuột sát đáy nhất

// ─── Resize state ────────────────────────────────────────
let resizeSectionId  = ''
let resizeStartY     = 0
let resizeInitialH   = 0
let resizeLastH      = 0
let initialScrollTop = 0
let lastMouseY       = 0   // cập nhật liên tục bởi onMouseMove
let scrollRafId      = 0

// ─── Start ───────────────────────────────────────────────
const startResize = (e: MouseEvent, sectionId: string, currentMinHeight: number) => {
  e.preventDefault()

  resizeSectionId  = sectionId
  resizeStartY     = e.clientY
  resizeInitialH   = currentMinHeight
  resizeLastH      = currentMinHeight
  lastMouseY       = e.clientY
  initialScrollTop = canvasBodyRef.value?.scrollTop ?? 0

  document.body.style.userSelect = 'none'
  document.body.style.cursor     = 'ns-resize'

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup',   onMouseUp)
}

// ─── Mouse move ──────────────────────────────────────────
const onMouseMove = (e: MouseEvent) => {
  lastMouseY = e.clientY

  // dy = khoảng di chuyển của chuột + lượng canvas đã scroll thêm kể từ mousedown
  // → section tiếp tục mở rộng đúng khi canvas scroll
  const scrollDelta = (canvasBodyRef.value?.scrollTop ?? 0) - initialScrollTop
  const dy          = (e.clientY - resizeStartY) + scrollDelta
  setHeight(Math.max(MIN_HEIGHT, Math.round(resizeInitialH + dy)))

  // Bật/tắt auto-scroll dựa vào vị trí chuột
  const distToBottom = window.innerHeight - e.clientY
  if (distToBottom > 0 && distToBottom < SCROLL_ZONE) {
    if (!scrollRafId) startScrollLoop()
  } else {
    stopScrollLoop()
  }
}

// ─── Set height (realtime, không push history) ───────────
const setHeight = (h: number) => {
  resizeLastH = h
  const section = store.findSectionById(resizeSectionId)
  if (section) section.style.minHeight = h
}

// ─── Auto-scroll loop ────────────────────────────────────
const startScrollLoop = () => {
  const loop = () => {
    const container = canvasBodyRef.value
    if (!container) { scrollRafId = 0; return }

    // Speed tỉ lệ thuận với mức độ "gần đáy"
    const distToBottom = window.innerHeight - lastMouseY
    const ratio        = Math.max(0, 1 - distToBottom / SCROLL_ZONE)
    const speed        = Math.round(SCROLL_SPEED_MIN + ratio * (SCROLL_SPEED_MAX - SCROLL_SPEED_MIN))

    const before   = container.scrollTop
    container.scrollTop += speed
    const scrolled = container.scrollTop - before   // 0 nếu đã hết chỗ scroll

    // Mở rộng section tương ứng lượng canvas đã scroll
    if (scrolled > 0) setHeight(resizeLastH + scrolled)

    scrollRafId = requestAnimationFrame(loop)
  }
  scrollRafId = requestAnimationFrame(loop)
}

const stopScrollLoop = () => {
  if (scrollRafId) {
    cancelAnimationFrame(scrollRafId)
    scrollRafId = 0
  }
}

// ─── Stop ────────────────────────────────────────────────
const onMouseUp = () => {
  stopScrollLoop()

  document.body.style.userSelect = ''
  document.body.style.cursor     = ''

  if (resizeLastH !== resizeInitialH) {
    store.executeCommand(
      createResizeSectionCommand(store, {
        sectionId:    resizeSectionId,
        oldMinHeight: resizeInitialH,
        newMinHeight: resizeLastH,
      })
    )
  }

  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup',   onMouseUp)
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
  scroll-behavior: auto;
}

.canvas-stack {
  display: flex;
  flex-direction: column;
  max-width: 500px;
  margin: 0 auto;
  min-height: 100%;
  // Padding dưới để còn chỗ scroll khi kéo tới section cuối
  padding-bottom: 120px;
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