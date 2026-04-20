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

    <img
      :src="element.src"
      :style="{
        width: '100%',
        height: '100%',
        objectFit: element.style?.objectFit || 'cover'
      }"
      draggable="false"
    />

    <div
      v-if="isSelected && (!isResizing || activeResizeHandle === 'tl')"
      class="resize-handle tl"
      @click.stop
      @mousedown.stop="startResize($event, 'tl')"
    />
    <div
      v-if="isSelected && (!isResizing || activeResizeHandle === 'tr')"
      class="resize-handle tr"
      @click.stop
      @mousedown.stop="startResize($event, 'tr')"
    />
    <div
      v-if="isSelected && (!isResizing || activeResizeHandle === 'bl')"
      class="resize-handle bl"
      @click.stop
      @mousedown.stop="startResize($event, 'bl')"
    />
    <div
      v-if="isSelected && (!isResizing || activeResizeHandle === 'br')"
      class="resize-handle br"
      @click.stop
      @mousedown.stop="startResize($event, 'br')"
    />
  </div>

  <Teleport to="body">
    <div
      v-if="isRotating"
      class="ie-rotation-tooltip"
      :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
    >
      {{ displayAngle }}°
    </div>

    <div
      class="ie-handles-pill"
      v-if="isSelected && store.selectedIds.length === 1 && !isRotating && !isResizing"
      :style="pillStyle"
      @click.stop
      @mousedown.stop
    >
      <div class="ie-handle" title="Rotate" @mousedown.stop="startRotate">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21.5 2v6h-6" />
          <path d="M21.34 15.57a10 10 0 1 1-.57-8.38" />
        </svg>
      </div>
      <div
        class="ie-handle ie-handle--drag"
        title="Move"
        @mousedown.stop="startDrag"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="5 9 2 12 5 15" />
          <polyline points="9 5 12 2 15 5" />
          <polyline points="15 19 12 22 9 19" />
          <polyline points="19 9 22 12 19 15" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="12" y1="2" x2="12" y2="22" />
        </svg>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import { useEditorStore } from "../../store/editorStore";
import { createResizeCommand } from "../../core/commands/resizeImage";
import { createRotateCommand } from "../../core/commands/rotateElement";
import type { ImageElement as ImageElementType } from "../../types";
import ElementToolbar from "./ElementToolbar.vue";

const props = defineProps<{
  element: ImageElementType;
}>();

const store = useEditorStore();

const isSelected = computed(() => store.selectedIds.includes(props.element.id));
const elRef = ref<HTMLElement | null>(null);
const isResizing = ref(false);
const activeResizeHandle = ref<"tl" | "tr" | "bl" | "br" | null>(null);

const style = computed(() => ({
  position: "absolute",
  left: props.element.x + "px",
  top: props.element.y + "px",
  width: props.element.width + "px",
  height: props.element.height + "px",
  border: isSelected.value ? "1px solid #6f8560" : "none",
  cursor: isSelected.value ? "move" : "default",
  transformOrigin: "center center",
  transform: `rotate(${props.element.rotation || 0}deg)`,
}));

// ===== drag =====
let startX = 0;
let startY = 0;
let initialX = 0;
let initialY = 0;

const onMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return;

  const isMulti = e.shiftKey;
  store.select(props.element.id, isMulti);
  startDrag(e);
};

const startDrag = (e: MouseEvent) => {
  e.preventDefault();

  initialX = props.element.x;
  initialY = props.element.y;
  startX = e.clientX;
  startY = e.clientY;

  document.body.style.userSelect = "none";
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", stopDrag);
};

const onDrag = (e: MouseEvent) => {
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  store.move(props.element.id, initialX + dx, initialY + dy);
};

const stopDrag = () => {
  document.body.style.userSelect = "";
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDrag);
};

// ===== resize =====
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartW = 0;
let resizeStartH = 0;
let resizeStartLeft = 0;
let resizeStartTop = 0;
let resizeDir: "tl" | "tr" | "bl" | "br" = "br";

const startResize = (e: MouseEvent, dir: "tl" | "tr" | "bl" | "br") => {
  e.preventDefault();

  resizeDir = dir;
  activeResizeHandle.value = dir;
  isResizing.value = true;

  resizeStartX = e.clientX;
  resizeStartY = e.clientY;
  resizeStartW = props.element.width;
  resizeStartH = props.element.height;
  resizeStartLeft = props.element.x;
  resizeStartTop = props.element.y;

  document.body.style.userSelect = "none";
  document.body.style.cursor = "nwse-resize";

  window.addEventListener("mousemove", onResize);
  window.addEventListener("mouseup", stopResize);
};

const onResize = (e: MouseEvent) => {
  const dx = e.clientX - resizeStartX;
  const dy = e.clientY - resizeStartY;

  let newW = resizeStartW;
  let newH = resizeStartH;
  let newX = resizeStartLeft;
  let newY = resizeStartTop;

  if (resizeDir.includes("r")) {
    newW = resizeStartW + dx;
  }
  if (resizeDir.includes("l")) {
    newW = resizeStartW - dx;
    newX = resizeStartLeft + dx;
  }
  if (resizeDir.includes("b")) {
    newH = resizeStartH + dy;
  }
  if (resizeDir.includes("t")) {
    newH = resizeStartH - dy;
    newY = resizeStartTop + dy;
  }

  newW = Math.max(50, Math.round(newW));
  newH = Math.max(50, Math.round(newH));

  if (resizeDir.includes("l")) {
    newX = resizeStartLeft + (resizeStartW - newW);
  }
  if (resizeDir.includes("t")) {
    newY = resizeStartTop + (resizeStartH - newH);
  }

  store.move(props.element.id, newX, newY);
  store.resize(props.element.id, newW, newH);
};

const stopResize = () => {
  document.body.style.userSelect = "";
  document.body.style.cursor = "";

  const el = store.findElementById(props.element.id);
  if (el) {
    const hasChanged =
      el.x !== resizeStartLeft ||
      el.y !== resizeStartTop ||
      el.width !== resizeStartW ||
      el.height !== resizeStartH;

    if (hasChanged) {
      store.executeCommand(
        createResizeCommand(store, {
          id: props.element.id,
          oldX: resizeStartLeft,
          oldY: resizeStartTop,
          oldWidth: resizeStartW,
          oldHeight: resizeStartH,
          newX: el.x,
          newY: el.y,
          newWidth: el.width,
          newHeight: el.height,
        })
      );
    }
  }

  isResizing.value = false;
  activeResizeHandle.value = null;

  window.removeEventListener("mousemove", onResize);
  window.removeEventListener("mouseup", stopResize);
};

// ===== rotate =====
const isRotating = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);

let rotateCenterX = 0;
let rotateCenterY = 0;
let rotateStartAngle = 0;
let rotateInitial = 0;
let lastRotation = 0;

const displayAngle = computed(() =>
  Math.round((((props.element.rotation || 0) % 360) + 360) % 360)
);

const startRotate = (e: MouseEvent) => {
  e.preventDefault();

  if (elRef.value) {
    const rect = elRef.value.getBoundingClientRect();
    rotateCenterX = rect.left + rect.width / 2;
    rotateCenterY = rect.top + rect.height / 2;
  } else {
    rotateCenterX = props.element.x + props.element.width / 2;
    rotateCenterY = props.element.y + props.element.height / 2;
  }

  rotateInitial = props.element.rotation || 0;
  lastRotation = rotateInitial;

  rotateStartAngle =
    Math.atan2(e.clientY - rotateCenterY, e.clientX - rotateCenterX) *
    (180 / Math.PI);

  tooltipX.value = e.clientX + 14;
  tooltipY.value = e.clientY - 32;

  isRotating.value = true;
  document.body.style.cursor = "crosshair";
  window.addEventListener("mousemove", onRotate);
  window.addEventListener("mouseup", stopRotate);
};

const onRotate = (e: MouseEvent) => {
  const angle =
    Math.atan2(e.clientY - rotateCenterY, e.clientX - rotateCenterX) *
    (180 / Math.PI);

  const newRotation = rotateInitial + (angle - rotateStartAngle);
  lastRotation = newRotation;

  store.rotate(props.element.id, newRotation);

  tooltipX.value = e.clientX + 14;
  tooltipY.value = e.clientY - 32;
};

const stopRotate = () => {
  isRotating.value = false;
  document.body.style.cursor = "";

  if (lastRotation !== rotateInitial) {
    store.executeCommand(
      createRotateCommand(store, {
        id: props.element.id,
        oldRotation: rotateInitial,
        newRotation: lastRotation,
      })
    );
  }

  window.removeEventListener("mousemove", onRotate);
  window.removeEventListener("mouseup", stopRotate);
};

// ===== pill position =====
const pillPos = ref({ x: 0, y: 0 });
const PILL_GAP = 22;

const updatePillPos = () => {
  if (!elRef.value) return;

  const rect = elRef.value.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const rad = -((props.element.rotation || 0) * Math.PI) / 180;
  const radius = props.element.height / 2 + PILL_GAP;

  pillPos.value = {
    x: cx + Math.sin(rad) * radius * 1.5,
    y: cy + Math.cos(rad) * radius,
  };
};

let rafId = 0;
const trackLoop = () => {
  updatePillPos();
  if (isSelected.value) rafId = requestAnimationFrame(trackLoop);
};

onMounted(() => {
  watch(
    isSelected,
    (val) => {
      cancelAnimationFrame(rafId);
      if (val) rafId = requestAnimationFrame(trackLoop);
    },
    { immediate: true }
  );
});

onUnmounted(() => {
  if (typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(rafId);
});

const pillStyle = computed(() => ({
  position: "fixed" as const,
  left: pillPos.value.x + "px",
  top: pillPos.value.y + "px",
  transform: "translate(-50%, -50%)",
  zIndex: "9999",
}));
</script>

<style scoped lang="scss">
img {
  display: block;
  pointer-events: none;
}

.resize-handle {
  width: 10px;
  height: 10px;
  background: blue;
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

<style lang="scss">
.ie-rotation-tooltip {
  position: fixed;
  background: rgba(30, 30, 30, 0.88);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  letter-spacing: 0.03em;
  z-index: 10000;
}

.ie-handles-pill {
  display: flex;
  gap: 4px;
  background: transparent;
  padding: 4px 6px;
  pointer-events: auto;
}

.ie-handle {
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #bbc1b5;
  color: #4f5c43;
  cursor: grab;
  transition: background 0.15s;

  &:hover {
    background: #edf2e7;
  }

  &:active {
    cursor: grabbing;
  }

  &--drag {
    cursor: move;
  }
}
</style>
