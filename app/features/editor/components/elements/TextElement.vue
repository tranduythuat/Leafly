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
    {{ element.content }}

    <div
      v-if="isSelected && (!isResizing || activeResizeHandle === 'tl')"
      class="resize-handle tl"
      :style="{ cursor: getResizeCursor('tl') }"
      @click.stop
      @mousedown.stop="startResize($event, 'tl')"
    />
    <div
      v-if="isSelected && (!isResizing || activeResizeHandle === 'tr')"
      class="resize-handle tr"
      :style="{ cursor: getResizeCursor('tr') }"
      @click.stop
      @mousedown.stop="startResize($event, 'tr')"
    />
    <div
      v-if="isSelected && (!isResizing || activeResizeHandle === 'bl')"
      class="resize-handle bl"
      :style="{ cursor: getResizeCursor('bl') }"
      @click.stop
      @mousedown.stop="startResize($event, 'bl')"
    />
    <div
      v-if="isSelected && (!isResizing || activeResizeHandle === 'br')"
      class="resize-handle br"
      :style="{ cursor: getResizeCursor('br') }"
      @click.stop
      @mousedown.stop="startResize($event, 'br')"
    />
    <div
      v-if="isSelected && (!isResizing || activeResizeHandle === 'left')"
      class="resize-handle left"
      :style="{ cursor: getResizeCursor('left') }"
      @click.stop
      @mousedown.stop="startResize($event, 'left')"
    />
    <div
      v-if="isSelected && (!isResizing || activeResizeHandle === 'right')"
      class="resize-handle right"
      :style="{ cursor: getResizeCursor('right') }"
      @click.stop
      @mousedown.stop="startResize($event, 'right')"
    />
  </div>

  <!-- Pill buttons: luôn đứng thẳng, gắn dưới element thực -->
  <Teleport to="body">
    <!-- Tooltip góc xoay: follow chuột -->
    <div
      v-if="isRotating"
      class="te-rotation-tooltip"
      :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
    >
      {{ displayAngle }}°
    </div>
    <div
      class="te-handles-pill"
      v-if="
        isSelected &&
        store.selectedIds.length === 1 &&
        !isRotating &&
        !isResizing
      "
      :style="pillStyle"
      @click.stop
      @mousedown.stop
    >
      <div class="te-handle" title="Rotate" @mousedown.stop="startRotate">
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
        class="te-handle te-handle--drag"
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
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { useEditorStore } from "../../store/editorStore";
import { createResizeCommand } from "../../core/commands/resizeElement";
import { createGroupMoveCommand } from "../../core/commands/moveGroupElement";
import { createRotateCommand } from "../../core/commands/rotateElement";
import ElementToolbar from "./ElementToolbar.vue";
import type { TextElement as TextElementType } from "../../types";

const props = defineProps<{
  element: TextElementType;
}>();

const store = useEditorStore();

// =====================
// STATE
// =====================

const isSelected = computed(() => store.selectedIds.includes(props.element.id));
const elRef = ref<HTMLElement | null>(null);

const pillPos = ref({ x: 0, y: 0 });
const PILL_GAP = 22;

function updatePillPos() {
  if (!elRef.value) return;
  const rect = elRef.value.getBoundingClientRect();

  // Tâm thực của element
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const rad = -((props.element.rotation || 0) * Math.PI) / 180;

  // Bán kính cố định = nửa chiều cao gốc + gap
  // → quỹ đạo tròn hoàn hảo, button sát cạnh dưới lúc 0°
  const radius = props.element.height / 2 + PILL_GAP;

  pillPos.value = {
    x: cx + Math.sin(rad) * radius * 1.5,
    y: cy + Math.cos(rad) * radius,
  };
}

let rafId = 0;
function trackLoop() {
  updatePillPos();
  if (isSelected.value) rafId = requestAnimationFrame(trackLoop);
}

// Chỉ chạy ở browser — tránh lỗi SSR/Nuxt
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

// =====================
// ELEMENT STYLE
// =====================

const style = computed(() => ({
  position: "absolute",
  left: props.element.x + "px",
  top: props.element.y + "px",
  width: props.element.width + "px",
  height:
    props.element.heightMode === "auto" ? "auto" : props.element.height + "px",
  border: isSelected.value ? "1px solid blue" : "none",
  cursor: isSelected.value ? "move" : "default",
  userSelect: "none",
  color: props.element.color,
  fontSize: (props.element.fontSize || 16) + "px",
  textAlign: props.element.alignment || "left",
  zIndex: 2,
  whiteSpace: "pre-line",
  transformOrigin: "center center",
  transform: `rotate(${props.element.rotation || 0}deg)`,
  lineHeight: 1.2,
}));

const onMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return;

  const isMulti = e.shiftKey;
  const isAlreadySelected = store.selectedIds.includes(props.element.id);
  const hasGroupSelection = store.selectedIds.length > 1;

  if (isMulti) {
    store.select(props.element.id, true);
  } else if (!isAlreadySelected || !hasGroupSelection) {
    store.select(props.element.id, false);
  }

  startDrag(e);
};

// =====================
// DRAG
// =====================

let startX = 0;
let startY = 0;
let initialPositions: Record<string, { x: number; y: number }> = {};

const startDrag = (e: MouseEvent) => {
  e.preventDefault();

  initialPositions = {};
  store.selectedIds.forEach((id) => {
    const el = store.findElementById(id);
    if (el) initialPositions[id] = { x: el.x, y: el.y };
  });

  startX = e.clientX;
  startY = e.clientY;

  document.body.style.userSelect = "none";
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", stopDrag);
};

const onDrag = (e: MouseEvent) => {
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  store.selectedIds.forEach((id) => {
    const init = initialPositions[id];
    if (!init) return;
    store.move(id, init.x + dx, init.y + dy);
  });
};

const stopDrag = () => {
  const items = store.selectedIds
    .map((id) => {
      const el = store.findElementById(id);
      const init = initialPositions[id];
      if (!el || !init) return null;
      return { id, oldX: init.x, oldY: init.y, newX: el.x, newY: el.y };
    })
    .filter(
      (
        item
      ): item is {
        id: string;
        oldX: number;
        oldY: number;
        newX: number;
        newY: number;
      } => item !== null
    );

  const hasChange = items.some((i) => i.oldX !== i.newX || i.oldY !== i.newY);
  if (hasChange && items.length) {
    store.executeCommand(createGroupMoveCommand(store, { items }));
  }

  document.body.style.userSelect = "";
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDrag);
};

// =====================
// RESIZE (proportional, horizontal only)
// =====================
let resizeDir = "br";
const activeResizeHandle = ref<
  string | "tl" | "tr" | "bl" | "br" | "left" | "right"
>(null);
let isResizing = ref(false);

let startWidth = 0;
let startHeight = 0;
let startCenterX = 0;
let startCenterY = 0;
let startRotationRad = 0;

let initialFontSize = 0;
let startPointerLocal = { x: 0, y: 0 };
let initialRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  fontSize: 0,
};

const MIN_WIDTH = 50;
const MIN_HEIGHT = 20;

type ResizeHandle = "tl" | "tr" | "bl" | "br" | "left" | "right";

const HANDLE_BASE_ANGLE: Record<ResizeHandle, number> = {
  right: 0,
  left: 180,
  tl: -135,
  tr: -45,
  bl: 135,
  br: 45,
};

const normalize180 = (angle: number) => ((angle % 180) + 180) % 180;

// Đổi góc handle hiện tại (đã cộng rotation) thành 1 trong 4 loại cursor chuẩn.
// Ví dụ: handle nằm gần trục ngang => ew-resize, gần trục dọc => ns-resize.
const getResizeCursor = (handle: ResizeHandle) => {
  const rotation = props.element.rotation || 0;
  const angle = normalize180(HANDLE_BASE_ANGLE[handle] + rotation);

  if (angle < 22.5 || angle >= 157.5) return "ew-resize";
  if (angle < 67.5) return "nwse-resize";
  if (angle < 112.5) return "ns-resize";
  return "nesw-resize";
};

const getHandleSigns = (dir: string): { sx: -1 | 0 | 1; sy: -1 | 0 | 1 } => {
  const handle = dir as ResizeHandle;
  switch (handle) {
    case "tl":
      return { sx: -1, sy: -1 };
    case "tr":
      return { sx: 1, sy: -1 };
    case "bl":
      return { sx: -1, sy: 1 };
    case "br":
      return { sx: 1, sy: 1 };
    case "left":
      return { sx: -1, sy: 0 };
    case "right":
      return { sx: 1, sy: 0 };
    default:
      return { sx: 1, sy: 1 };
  }
};

// Chuyển toạ độ chuột từ hệ trục màn hình sang hệ trục local của element
// (xoay ngược theo rotation). Nhờ vậy resize luôn đúng hướng sau khi rotate.
const toLocal = (clientX: number, clientY: number) => {
  const dx = clientX - startCenterX;
  const dy = clientY - startCenterY;
  const cos = Math.cos(startRotationRad);
  const sin = Math.sin(startRotationRad);

  return {
    x: dx * cos + dy * sin,
    y: -dx * sin + dy * cos,
  };
};

const startResize = (e: MouseEvent, dir: string) => {
  e.preventDefault();

  resizeDir = dir;
  isResizing.value = true;
  activeResizeHandle.value = dir;

  startX = e.clientX;
  startY = e.clientY;

  startWidth = props.element.width;
  initialFontSize = props.element.fontSize || 16;

  // Đọc height thực từ DOM vì text có thể đang heightMode = auto.
  // Nếu lấy props.element.height trực tiếp thì có thể lệch với khung hiển thị.
  const domEl = document.querySelector(
    `[data-id="${props.element.id}"]`
  ) as HTMLElement | null;
  const actualHeight = domEl
    ? domEl.clientHeight
    : typeof props.element.height === "number"
    ? props.element.height
    : 40;
  startHeight = actualHeight;
  startCenterX = props.element.x + startWidth / 2;
  startCenterY = props.element.y + startHeight / 2;
  startRotationRad = ((props.element.rotation || 0) * Math.PI) / 180;
  startPointerLocal = toLocal(e.clientX, e.clientY);

  // Snapshot để tạo history (undo/redo) khi thả chuột.
  initialRect = {
    x: props.element.x,
    y: props.element.y,
    width: props.element.width,
    height: props.element.height,
    fontSize: props.element.fontSize || 16,
  };

  if (dir === "left" || dir === "right") {
    store.setHeightMode(props.element.id, "auto");
    store.resize(
      props.element.id,
      props.element.width,
      actualHeight,
      props.element.fontSize
    );
  }

  document.body.style.userSelect = "none";
  document.body.style.cursor = getResizeCursor(dir as ResizeHandle);

  window.addEventListener("mousemove", onResize);
  window.addEventListener("mouseup", stopResize);
};

const onResize = (e: MouseEvent) => {
  const { sx, sy } = getHandleSigns(resizeDir);
  const pointer = toLocal(e.clientX, e.clientY);
  // Resize dựa trên delta từ lúc mousedown để tránh hiện tượng nhảy kích thước ở frame đầu.
  const deltaLocal = {
    x: pointer.x - startPointerLocal.x,
    y: pointer.y - startPointerLocal.y,
  };

  const hx0 = startWidth / 2;
  const hy0 = startHeight / 2;
  const anchorOld = {
    x: sx === 0 ? 0 : -sx * hx0,
    y: sy === 0 ? 0 : -sy * hy0,
  };

  let newWidth = startWidth;
  let newHeight = startHeight;
  let newFontSize = props.element.fontSize ?? 16;

  // Corner handles: scale đồng đều theo đường chéo.
  // Anchor cố định tại góc đối diện nên resize nhìn "neo" đúng một điểm.
  if (sx !== 0 && sy !== 0) {
    const diagonal = { x: 2 * sx * hx0, y: 2 * sy * hy0 };
    const diagonalLength = Math.hypot(diagonal.x, diagonal.y) || 1;
    const diagonalUnit = {
      x: diagonal.x / diagonalLength,
      y: diagonal.y / diagonalLength,
    };
    const projectedDelta =
      deltaLocal.x * diagonalUnit.x + deltaLocal.y * diagonalUnit.y;
    const projected = Math.max(
      Math.max(MIN_WIDTH / startWidth, MIN_HEIGHT / startHeight),
      1 + projectedDelta / diagonalLength
    );

    newWidth = Math.max(MIN_WIDTH, Math.round(startWidth * projected));
    newHeight = Math.max(MIN_HEIGHT, Math.round(startHeight * projected));
    newFontSize = Math.max(6, Math.round(initialFontSize * projected));
  } else if (sx !== 0) {
    // Edge trái/phải: chỉ scale theo trục X local, giữ cạnh đối diện làm anchor.
    const span = Math.max(MIN_WIDTH, startWidth + sx * deltaLocal.x);
    newWidth = Math.round(span);
    newHeight = startHeight;
    newFontSize = props.element.fontSize ?? 16;
  }

  const hx = newWidth / 2;
  const hy = newHeight / 2;
  const anchorNew = {
    x: sx === 0 ? 0 : -sx * hx,
    y: sy === 0 ? 0 : -sy * hy,
  };

  const cos = Math.cos(startRotationRad);
  const sin = Math.sin(startRotationRad);
  const anchorWorldX = startCenterX + anchorOld.x * cos - anchorOld.y * sin;
  const anchorWorldY = startCenterY + anchorOld.x * sin + anchorOld.y * cos;

  // Tính tâm mới sao cho anchor cũ và anchor mới trùng nhau trong world space.
  const newCenterX = anchorWorldX - (anchorNew.x * cos - anchorNew.y * sin);
  const newCenterY = anchorWorldY - (anchorNew.x * sin + anchorNew.y * cos);

  const newX = newCenterX - newWidth / 2;
  const newY = newCenterY - newHeight / 2;

  store.move(props.element.id, newX, newY);

  if (resizeDir === "left" || resizeDir === "right") {
    store.resize(props.element.id, newWidth, undefined, newFontSize);
    return;
  }

  store.resize(props.element.id, newWidth, newHeight, newFontSize);
};

const stopResize = () => {
  document.body.style.userSelect = "";
  document.body.style.cursor = "";

  const el = store.findElementById(props.element.id);
  if (!el) return;

  // Edge handles: lấy height thực từ DOM (do height: auto)
  const isEdge = resizeDir === "left" || resizeDir === "right";

  if (isEdge) {
    const domEl = elRef.value;
    const actualHeight = domEl?.clientHeight ?? el.height;

    store.resize(props.element.id, el.width, actualHeight, el.fontSize ?? 16);
  }

  const hasChanged =
    el.x !== initialRect.x ||
    el.y !== initialRect.y ||
    el.width !== initialRect.width ||
    el.height !== initialRect.height;

  if (hasChanged) {
    store.setHeightMode(props.element.id, "fixed");
    store.executeCommand(
      createResizeCommand(store, {
        id: props.element.id,

        oldX: initialRect.x,
        oldY: initialRect.y,
        oldWidth: initialRect.width,
        oldHeight: initialRect.height,
        oldFontSize: initialRect.fontSize,

        newX: el.x,
        newY: el.y,
        newWidth: el.width,
        newHeight: el.height,
        newFontSize: el.fontSize || 16,
      })
    );
  }

  isResizing.value = false;
  activeResizeHandle.value = null;

  window.removeEventListener("mousemove", onResize);
  window.removeEventListener("mouseup", stopResize);
};

// =====================
// ROTATE
// =====================

let rotateCenterX = 0;
let rotateCenterY = 0;
let rotateStartAngle = 0;

let rotateInitial = 0;
let lastRotation = 0;

const isRotating = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);

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

  // Tooltip theo sát chuột
  tooltipX.value = e.clientX + 14;
  tooltipY.value = e.clientY - 32;
};

const stopRotate = () => {
  isRotating.value = false;
  document.body.style.cursor = "";

  if (lastRotation !== rotateInitial) {
    const command = createRotateCommand(store, {
      id: props.element.id,
      oldRotation: rotateInitial,
      newRotation: lastRotation,
    });
    store.executeCommand(command);
  }

  window.removeEventListener("mousemove", onRotate);
  window.removeEventListener("mouseup", stopRotate);
};
</script>

<style scoped lang="scss">
.resize-handle {
  width: 12px;
  height: 12px;
  background: blue;
  position: absolute;
  z-index: 3;
  border-radius: 50%;
}
.resize-handle.tl {
  left: -6px;
  top: -6px;
  cursor: nwse-resize;
}
.resize-handle.tr {
  right: -6px;
  top: -6px;
  cursor: nesw-resize;
}

.resize-handle.bl {
  left: -6px;
  bottom: -6px;
  cursor: nesw-resize;
}

.resize-handle.br {
  right: -6px;
  bottom: -6px;
  cursor: nwse-resize;
}

.resize-handle.left {
  width: 8px;
  height: 18px;
  background: blue;
  position: absolute;
  z-index: 3;
  cursor: ew-resize;
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 4px;
  &.is-active,
  &:hover {
    background: #3b82f6;
  }
}

.resize-handle.right {
  width: 8px;
  height: 18px;
  background: blue;
  position: absolute;
  z-index: 3;
  cursor: ew-resize;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 4px;
  &.is-active,
  &:hover {
    background: #3b82f6;
  }
}
</style>

<!-- Global — scoped hash không reach được DOM teleported ra body -->
<style lang="scss">
.te-rotation-tooltip {
  position: fixed;
  background: rgb(30, 30, 30);
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

.te-handles-pill {
  display: flex;
  gap: 4px;
  background: transparent;
  // border: 1px solid #dbd5ca;
  // border-radius: 20px;
  padding: 4px 6px;
  // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  pointer-events: auto;
}

.te-handle {
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
