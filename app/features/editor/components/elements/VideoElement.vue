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

    <div class="video-el" :style="innerStyle">
      <!-- YouTube / Vimeo -->
      <iframe
        v-if="embedUrl"
        :src="embedUrl"
        class="video-el__iframe"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />

      <!-- Upload file -->
      <video
        v-else-if="element.sourceType === 'upload' && element.src"
        :src="element.src"
        class="video-el__native"
        :controls="element.controls"
        :autoplay="element.autoplay"
        :loop="element.loop"
        :muted="element.muted"
        playsinline
      />

      <!-- Chưa có nguồn / link không hợp lệ -->
      <div v-else class="video-el__empty">
        <i class="ti ti-video-off" aria-hidden="true"></i>
        <span>No video source</span>
      </div>
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
import { computed, ref, inject } from "vue";
import { useEditorStore } from "../../store/editorStore";
import { useDragResize } from "../../composables/useDragResize";
import type { ContainerRect, SnapLine } from "../../core/snapEngine";
import type { VideoElement as VideoElementType } from "../../types";
import { toEmbedUrl } from "../../utils/videoUtils";
import ElementToolbar from "./ElementToolbar.vue";

const props = defineProps<{ element: VideoElementType }>();
const store = useEditorStore();
const elRef = ref<HTMLElement | null>(null);

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

const embedUrl = computed(() => {
  if (props.element.sourceType === "upload" || !props.element.src) return null;
  return toEmbedUrl(props.element.src, props.element.sourceType, {
    autoplay: props.element.autoplay,
    loop: props.element.loop,
    muted: props.element.muted,
    controls: props.element.controls,
  });
});

const style = computed(() => ({
  position: "absolute",
  left: props.element.x + "px",
  top: props.element.y + "px",
  width: props.element.width + "px",
  height: props.element.height + "px",
  border: isSelected.value ? "1px solid #6f8560" : "1px solid transparent",
  cursor: isSelected.value ? "move" : "default",
  boxSizing: "border-box",
  transformOrigin: "center center",
  transform: `rotate(${props.element.rotation || 0}deg)`,
}));

const innerStyle = computed(() => ({
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  borderRadius: `${props.element.borderRadius}px`,
  opacity: props.element.opacity / 100,
  background: "#111",
}));
</script>

<style scoped lang="scss">
.video-el {
  &__iframe,
  &__native {
    width: 100%;
    height: 100%;
    display: block;
    border: none;
    pointer-events: none; // tránh iframe nuốt sự kiện kéo/resize
  }

  &__empty {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: $text-light;
    font-size: 11px;
    background: $cream;
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