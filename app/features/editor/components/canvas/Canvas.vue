<template>
  <div
    ref="canvasBodyRef"
    class="canvas-body"
    @click.self="store.clearSelection()"
  >
    <div class="canvas-stack">
      <section
        v-for="section in store.sections"
        :key="section.id"
        class="canvas-section"
        :class="{
          'canvas-section--active': store.activeSectionId === section.id,
        }"
        :style="{ minHeight: section.style.minHeight + 'px' }"
        @click="store.selectSection(section.id)"
      >
        <ElementRenderer
          :section="section"
          @marquee-start="onMarqueeStart"
          @marquee-move="onMarqueeMove"
          @marquee-end="onMarqueeEnd"
        />

        <div
          v-if="store.activeSectionId === section.id"
          class="section-resize-handle"
          @mousedown.stop="
            startResize($event, section.id, section.style.minHeight)
          "
        >
          <div class="section-resize-handle__bar" />
        </div>

        <MultiSelectToolbar
          v-if="
            store.activeSectionId === section.id &&
            store.selectedIds.length >= 2
          "
          :section-id="section.id"
        />
      </section>
    </div>

    <div v-if="marquee.visible" class="canvas-marquee" :style="marqueeStyle" />
  </div>
  <BackgroundMusicPlayer />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive } from "vue";
import { useEditorStore } from "../../store/editorStore";
import ElementRenderer from "./ElementRenderer.vue";
import { createResizeSectionCommand } from "../../core/commands/resizeSectionHeight";
import BackgroundMusicPlayer from "./BackgroundMusicPlayer.vue"; // 🎵 NEW
import MultiSelectToolbar from "./MultiSelectToolbar.vue";

const store = useEditorStore();
const canvasBodyRef = ref<HTMLElement | null>(null);

// ─── Tuning ──────────────────────────────────────────────
const MIN_HEIGHT = 80;
const SCROLL_ZONE = 80;
const SCROLL_SPEED_MIN = 8;
const SCROLL_SPEED_MAX = 28;

// ─── Resize state ────────────────────────────────────────
let resizeSectionId = "";
let resizeStartY = 0;
let resizeInitialH = 0;
let resizeLastH = 0;
let initialScrollTop = 0;
let lastMouseY = 0;
let scrollRafId = 0;

// ─── Marquee state ───────────────────────────────────────
const marquee = reactive({
  visible: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  sectionId: "",
});

const marqueeStyle = reactive({
  left: "0px",
  top: "0px",
  width: "0px",
  height: "0px",
});

let marqueeRafId = 0;

// ─── Resize handlers ─────────────────────────────────────
const startResize = (
  e: MouseEvent,
  sectionId: string,
  currentMinHeight: number
) => {
  e.preventDefault();

  resizeSectionId = sectionId;
  resizeStartY = e.clientY;
  resizeInitialH = currentMinHeight;
  resizeLastH = currentMinHeight;
  lastMouseY = e.clientY;
  initialScrollTop = canvasBodyRef.value?.scrollTop ?? 0;

  document.body.style.userSelect = "none";
  document.body.style.cursor = "ns-resize";

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
};

const onMouseMove = (e: MouseEvent) => {
  lastMouseY = e.clientY;

  const scrollDelta = (canvasBodyRef.value?.scrollTop ?? 0) - initialScrollTop;
  const dy = e.clientY - resizeStartY + scrollDelta;
  setHeight(Math.max(MIN_HEIGHT, Math.round(resizeInitialH + dy)));

  const distToBottom = window.innerHeight - e.clientY;
  if (distToBottom > 0 && distToBottom < SCROLL_ZONE) {
    if (!scrollRafId) startScrollLoop();
  } else {
    stopScrollLoop();
  }
};

const setHeight = (h: number) => {
  resizeLastH = h;
  const section = store.findSectionById(resizeSectionId);
  if (section) section.style.minHeight = h;
};

const startScrollLoop = () => {
  const loop = () => {
    const container = canvasBodyRef.value;
    if (!container) {
      scrollRafId = 0;
      return;
    }

    const distToBottom = window.innerHeight - lastMouseY;
    const ratio = Math.max(0, 1 - distToBottom / SCROLL_ZONE);
    const speed = Math.round(
      SCROLL_SPEED_MIN + ratio * (SCROLL_SPEED_MAX - SCROLL_SPEED_MIN)
    );

    const before = container.scrollTop;
    container.scrollTop += speed;
    const scrolled = container.scrollTop - before;

    if (scrolled > 0) setHeight(resizeLastH + scrolled);

    scrollRafId = requestAnimationFrame(loop);
  };
  scrollRafId = requestAnimationFrame(loop);
};

const stopScrollLoop = () => {
  if (scrollRafId) {
    cancelAnimationFrame(scrollRafId);
    scrollRafId = 0;
  }
};

const onMouseUp = () => {
  stopScrollLoop();

  document.body.style.userSelect = "";
  document.body.style.cursor = "";

  if (resizeLastH !== resizeInitialH) {
    store.executeCommand(
      createResizeSectionCommand(store, {
        sectionId: resizeSectionId,
        oldMinHeight: resizeInitialH,
        newMinHeight: resizeLastH,
      })
    );
  }

  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
};

const updateMarqueeStyle = () => {
  const x = Math.min(marquee.startX, marquee.currentX);
  const y = Math.min(marquee.startY, marquee.currentY);
  const w = Math.abs(marquee.currentX - marquee.startX);
  const h = Math.abs(marquee.currentY - marquee.startY);

  marqueeStyle.left = x + "px";
  marqueeStyle.top = y + "px";
  marqueeStyle.width = w + "px";
  marqueeStyle.height = h + "px";
};

const onMarqueeStart = (payload: {
  sectionId: string;
  x: number;
  y: number;
}) => {
  marquee.visible = true;
  marquee.sectionId = payload.sectionId;
  marquee.startX = payload.x;
  marquee.startY = payload.y;
  marquee.currentX = payload.x;
  marquee.currentY = payload.y;

  updateMarqueeStyle();

  window.addEventListener("mousemove", onGlobalMouseMove);
  window.addEventListener("mouseup", onGlobalMouseUp);
};

const onMarqueeMove = (payload: { x: number; y: number }) => {
  marquee.currentX = payload.x;
  marquee.currentY = payload.y;

  if (!marqueeRafId) {
    marqueeRafId = requestAnimationFrame(() => {
      updateMarqueeStyle();
      marqueeRafId = 0;
    });
  }
};

const onGlobalMouseMove = (e: MouseEvent) => {
  onMarqueeMove({ x: e.clientX, y: e.clientY });
};

const onGlobalMouseUp = (e: MouseEvent) => {
  window.removeEventListener("mousemove", onGlobalMouseMove);
  window.removeEventListener("mouseup", onGlobalMouseUp);

  if (marqueeRafId) {
    cancelAnimationFrame(marqueeRafId);
    marqueeRafId = 0;
  }

  marquee.visible = false;

  const section = store.findSectionById(marquee.sectionId);
  if (!section) return;

  const canvasBody = canvasBodyRef.value;
  if (!canvasBody) return;

  const sectionEl = canvasBody.querySelector(
    `[data-section-id="${marquee.sectionId}"]`
  ) as HTMLElement | null;
  if (!sectionEl) return;

  const sectionRect = sectionEl.getBoundingClientRect();

  const marqueeLeft = Math.min(marquee.startX, marquee.currentX);
  const marqueeTop = Math.min(marquee.startY, marquee.currentY);
  const marqueeRight = Math.max(marquee.startX, marquee.currentX);
  const marqueeBottom = Math.max(marquee.startY, marquee.currentY);

  const hitIds: string[] = [];

  section.elements.forEach((el) => {
    const elRight = sectionRect.left + el.x + el.width;
    const elBottom = sectionRect.top + el.y + el.height;

    const intersects =
      marqueeLeft < elRight &&
      marqueeRight > sectionRect.left + el.x &&
      marqueeTop < elBottom &&
      marqueeBottom > sectionRect.top + el.y;

    if (intersects) {
      hitIds.push(el.id);
    }
  });

  if (hitIds.length > 0) {
    store.ui.selectedIds = hitIds;
    store.ui.activeSectionId = marquee.sectionId;
  } else {
    store.ui.selectedIds = [];
  }
};

const onMarqueeEnd = () => {
  // noop - handled by global mouseup
};

// ─── Keyboard shortcuts ──────────────────────────────────
const onKeyDown = (e: KeyboardEvent) => {
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement ||
    (e.target as HTMLElement).isContentEditable
  ) {
    return;
  }

  const selected = store.selectedIds;

  if (e.key === "Escape") {
    store.clearSelection();
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
    e.preventDefault();
    if (e.shiftKey) {
      store.redo();
    } else {
      store.undo();
    }
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
    e.preventDefault();
    store.redo();
    return;
  }

  if ((e.key === "Delete" || e.key === "Backspace") && selected.length > 0) {
    e.preventDefault();
    store.removeElements(selected);
    return;
  }

  if (e.key === "g" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
    e.preventDefault();
    store.ungroupSelected();
    return;
  }

  if (e.key === "g" && (e.ctrlKey || e.metaKey) && selected.length >= 2) {
    e.preventDefault();
    store.groupSelected();
    return;
  }

  const nudge = e.shiftKey ? 10 : 1;

  if (e.key === "ArrowLeft" && selected.length > 0) {
    e.preventDefault();
    selected.forEach((id) => {
      const el = store.findElementById(id);
      if (el) {
        el.x = Math.round(el.x - nudge);
      }
    });
    return;
  }

  if (e.key === "ArrowRight" && selected.length > 0) {
    e.preventDefault();
    selected.forEach((id) => {
      const el = store.findElementById(id);
      if (el) {
        el.x = Math.round(el.x + nudge);
      }
    });
    return;
  }

  if (e.key === "ArrowUp" && selected.length > 0) {
    e.preventDefault();
    selected.forEach((id) => {
      const el = store.findElementById(id);
      if (el) {
        el.y = Math.round(el.y - nudge);
      }
    });
    return;
  }

  if (e.key === "ArrowDown" && selected.length > 0) {
    e.preventDefault();
    selected.forEach((id) => {
      const el = store.findElementById(id);
      if (el) {
        el.y = Math.round(el.y + nudge);
      }
    });
    return;
  }
};

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
  if (marqueeRafId) cancelAnimationFrame(marqueeRafId);
});
</script>

<style scoped lang="scss">
.canvas-body {
  flex: 1;
  position: relative;
  background: radial-gradient(
      circle at top,
      rgba(255, 255, 255, 0.85),
      transparent 30%
    ),
    linear-gradient(180deg, #f7f3eb, #f1ede3);
  overflow: auto;
  padding: 0.5rem;
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
    content: "";
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

.canvas-marquee {
  position: fixed;
  border: 1px solid #6f8560;
  background: rgba(111, 133, 96, 0.12);
  pointer-events: none;
  z-index: 8888;
  border-radius: 4px;
}
</style>
