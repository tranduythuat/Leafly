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

    <div class="ls-el" :style="innerStyle">
      <div v-if="!element.milestones.length" class="ls-el__empty">
        Add milestones from the panel →
      </div>

      <div
        v-else
        class="ls-el__list"
        :class="`ls-el__list--${element.layout}`"
        :style="{ gap: element.itemGap + 'px' }"
      >
        <div
          v-for="(m, i) in element.milestones"
          :key="m.id"
          class="ls-el__item"
          :class="{
            'ls-el__item--right':
              element.layout === 'alternating' && i % 2 === 1,
          }"
        >
          <!-- Line + dot -->
          <div class="ls-el__spine">
            <div class="ls-el__dot" :style="{ background: element.dotColor }" />
            <div
              v-if="i < element.milestones.length - 1"
              class="ls-el__line"
              :style="{ background: element.lineColor }"
            />
          </div>

          <!-- Card -->
          <div class="ls-el__card" :style="cardStyle">
            <img
              v-if="m.image"
              :src="m.image"
              class="ls-el__img"
              :style="{
                aspectRatio: imageAspect,
                borderRadius: element.cardRadius + 'px',
              }"
            />
            <span class="ls-el__date" :style="{ color: element.dateColor }">{{
              m.date
            }}</span>
            <h4 class="ls-el__title" :style="{ color: element.titleColor }">
              {{ m.title }}
            </h4>
            <p class="ls-el__desc" :style="{ color: element.textColor }">
              {{ m.description }}
            </p>
          </div>
        </div>
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
import type { LoveStoryElement as LoveStoryElementType } from "../../types";
import ElementToolbar from "./ElementToolbar.vue";

const props = defineProps<{ element: LoveStoryElementType }>();
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

const innerStyle = computed(() => ({
  width: "100%",
  height: "100%",
  overflow: "auto",
  background: props.element.bgColor || "transparent",
  padding: "16px",
  boxSizing: "border-box",
}));

const cardStyle = computed(() => ({
  background: props.element.cardBg,
  borderRadius: props.element.cardRadius + "px",
}));

const imageAspect = computed(() => {
  if (props.element.imageRatio === "landscape") return "16 / 9";
  if (props.element.imageRatio === "portrait") return "3 / 4";
  return "1 / 1";
});
</script>

<style scoped lang="scss">
.ls-el {
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: $text-light;
    font-size: 12px;
  }

  &__list {
    display: flex;
    flex-direction: column;

    &--alternating {
      .ls-el__item--right {
        flex-direction: row-reverse;
        text-align: right;

        .ls-el__spine {
          order: 0;
        }
      }
    }
  }

  &__item {
    display: flex;
    gap: 14px;
  }

  &__spine {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 14px;
  }

  &__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 4px;
  }

  &__line {
    width: 2px;
    flex: 1;
    margin-top: 4px;
  }

  &__card {
    flex: 1;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__img {
    width: 100%;
    object-fit: cover;
    margin-bottom: 6px;
    display: block;
  }

  &__date {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  &__title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }

  &__desc {
    font-size: 0.85rem;
    line-height: 1.5;
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