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

    <div class="album-el" :style="innerStyle">
      <!-- Grid / Masonry / Strip: giữ nguyên CSS grid -->
      <div
        v-if="element.layout !== 'carousel' && element.images.length !== 0"
        class="album-el__grid"
        :style="{
          gridTemplateColumns: `repeat(${element.columns}, 1fr)`,
          gap: element.gap + 'px',
        }"
      >
        <img
          v-for="img in element.images.slice(0, 6)"
          :key="img.id"
          :src="img.src"
          :style="{
            borderRadius: element.itemRadius + 'px',
            objectFit: element.objectFit,
            aspectRatio: '1',
          }"
        />
      </div>

      <!-- Carousel: Swiper -->
      <ClientOnly v-else-if="element.images.length">
        <Swiper
          class="album-el__swiper"
          :modules="swiperModules"
          :slides-per-view="1"
          :loop="element.images.length > 1"
          :autoplay="
            element.autoplay
              ? { delay: element.autoplayMs, disableOnInteraction: false }
              : false
          "
          :pagination="{ clickable: true }"
          :allow-touch-move="false"
          :style="{ borderRadius: element.itemRadius + 'px' }"
        >
          <SwiperSlide v-for="img in element.images" :key="img.id">
            <img :src="img.src" :style="{ objectFit: element.objectFit }" />
          </SwiperSlide>
        </Swiper>
      </ClientOnly>

      <div v-else-if="!element.images.length" class="album-el__empty">
        No photos yet
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
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useEditorStore } from "../../store/editorStore";
import { useDragResize } from "../../composables/useDragResize";
import type { ContainerRect, SnapLine } from "../../core/snapEngine";
import type { AlbumElement as AlbumElementType } from "../../types";
import ElementToolbar from "./ElementToolbar.vue";

const props = defineProps<{ element: AlbumElementType }>();
const store = useEditorStore();
const elRef = ref<HTMLElement | null>(null);

const swiperModules = [Autoplay, Pagination];

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
  transform: `rotate(${props.element.rotation || 0}deg) scale(${
    props.element.flipH ? -1 : 1
  }, ${props.element.flipV ? -1 : 1})`,
}));

const innerStyle = computed(() => ({
  width: "100%",
  height: "100%",
  opacity: props.element.opacity ?? 1,
  overflow: "hidden",
}));
</script>

<style scoped lang="scss">
.album-el {
  &__grid {
    display: grid;
    width: 100%;
    height: 100%;
    img {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  &__swiper {
    width: 100%;
    height: 100%;

    :deep(.swiper-slide) {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    :deep(img) {
      width: 100%;
      height: 100%;
      display: block;
    }

    // Ẩn con trỏ move của canvas trên vùng pagination để không nhầm là kéo block
    :deep(.swiper-pagination-bullet) {
      pointer-events: none;
    }
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: $cream;
    color: $text-light;
    font-size: 12px;
    border-radius: 8px;
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
