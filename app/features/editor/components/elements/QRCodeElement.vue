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

    <div class="qr-el" :style="cardStyle">
      <div class="qr-el__canvas-wrap">
        <canvas ref="canvasRef" class="qr-el__canvas" />
        <div v-if="!element.data" class="qr-el__placeholder">
          Nhập nội dung QR ở panel bên phải
        </div>
      </div>

      <p
        v-if="element.showLabel && element.label"
        class="qr-el__label"
        :style="{ color: element.labelColor }"
      >
        {{ element.label }}
      </p>
    </div>

    <div
      v-if="isSelected"
      class="resize-handle tl"
      @mousedown.stop="startResize($event, 'tl')"
    />
    <div
      v-if="isSelected"
      class="resize-handle tr"
      @mousedown.stop="startResize($event, 'tr')"
    />
    <div
      v-if="isSelected"
      class="resize-handle bl"
      @mousedown.stop="startResize($event, 'bl')"
    />
    <div
      v-if="isSelected"
      class="resize-handle br"
      @mousedown.stop="startResize($event, 'br')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject, watch, onMounted } from "vue";
import { useEditorStore } from "../../store/editorStore";
import { useDragResize } from "../../composables/useDragResize";
import type { ContainerRect, SnapLine } from "../../core/snapEngine";
import type { QRCodeElement as QRCodeElementType } from "../../types";
import ElementToolbar from "./ElementToolbar.vue";

const props = defineProps<{ element: QRCodeElementType }>();
const store = useEditorStore();
const elRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const setSnapLines = inject<(lines: SnapLine[]) => void>("setSnapLines");
const getContainerRect = inject<() => ContainerRect>("getContainerRect");

const isSelected = computed(() => store.selectedIds.includes(props.element.id));
const { startDrag, startResize } = useDragResize(
  props.element,
  setSnapLines,
  getContainerRect
);

const onMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return;
  store.select(props.element.id, e.shiftKey);
  startDrag(e);
};

// ── QR rendering ──
// Import động vì thư viện thao tác trực tiếp với canvas DOM.
const renderQR = async () => {
  if (!canvasRef.value || !props.element.data) {
    // clear canvas nếu không có data
    const ctx = canvasRef.value?.getContext("2d");
    if (ctx && canvasRef.value) {
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    }
    return;
  }

  const QRCode = (await import("qrcode")).default;

  try {
    await QRCode.toCanvas(canvasRef.value, props.element.data, {
      errorCorrectionLevel: props.element.errorCorrection,
      margin: props.element.margin,
      color: {
        dark: props.element.fgColor,
        light: props.element.bgColor,
      },
      width: canvasSize.value,
    });
  } catch (err) {
    console.error("QR generation failed", err);
  }
};

// Kích thước canvas thực tế = min(width, height trừ chỗ cho label) để giữ QR vuông
const canvasSize = computed(() => {
  const labelSpace = props.element.showLabel && props.element.label ? 28 : 0;
  const availableH = props.element.height - labelSpace - 24; // padding card
  const availableW = props.element.width - 24;
  return Math.max(60, Math.round(Math.min(availableW, availableH)));
});

onMounted(renderQR);

watch(
  () => [
    props.element.data,
    props.element.fgColor,
    props.element.bgColor,
    props.element.errorCorrection,
    props.element.margin,
    canvasSize.value,
  ],
  renderQR
);

const style = computed(() => ({
  position: "absolute",
  left: props.element.x + "px",
  top: props.element.y + "px",
  width: props.element.width + "px",
  height: props.element.height + "px",
  border: isSelected.value ? "1px solid #6f8560" : "1px solid transparent",
  cursor: isSelected.value ? "move" : "default",
  boxSizing: "border-box",
}));

const cardStyle = computed(() => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  background: props.element.cardBg,
  borderRadius: `${props.element.cardRadius}px`,
  boxSizing: "border-box",
  padding: "12px",
  overflow: "hidden",
}));
</script>

<style scoped lang="scss">
.qr-el {
  &__canvas-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__canvas {
    display: block;
  }

  &__placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 11px;
    color: $text-light;
    padding: 8px;
    background: $cream;
    border: 1px dashed $cream-dark;
    border-radius: 8px;
    width: 140px;
    height: 140px;
  }

  &__label {
    font-size: 12px;
    text-align: center;
    line-height: 1.4;
    margin: 0;
  }
}

.resize-handle {
  width: 10px;
  height: 10px;
  background: #4a6b4d;
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