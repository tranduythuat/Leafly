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

    <div class="div-el" :style="innerStyle">
      <!-- LINE / DASHED / DOTTED -->
      <div
        v-if="['line', 'dashed', 'dotted'].includes(element.variant)"
        class="div-el__rule"
        :style="ruleStyle"
      />

      <!-- WAVE -->
      <svg
        v-else-if="element.variant === 'wave'"
        class="div-el__wave"
        :viewBox="`0 0 120 ${Math.max(element.thickness * 3, 12)}`"
        preserveAspectRatio="none"
      >
        <path
          :d="wavePath"
          fill="none"
          :stroke="element.color"
          :stroke-width="element.thickness"
          stroke-linecap="round"
        />
      </svg>

      <!-- ORNAMENT: line - icon - line -->
      <div v-else class="div-el__ornament">
        <div class="div-el__ornament-line" :style="ruleStyle" />
        <span
          class="div-el__ornament-icon"
          :style="{
            color: element.color,
            fontSize: element.ornamentSize + 'px',
          }"
          >{{ element.ornamentIcon }}</span
        >
        <div class="div-el__ornament-line" :style="ruleStyle" />
      </div>
    </div>

    <!-- chỉ resize theo chiều ngang (trái/phải) — divider luôn mảnh theo chiều dọc -->
    <div
      v-if="isSelected"
      class="resize-handle left"
      @mousedown.stop="startResize($event, 'left')"
    />
    <div
      v-if="isSelected"
      class="resize-handle right"
      @mousedown.stop="startResize($event, 'right')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject } from "vue";
import { useEditorStore } from "../../store/editorStore";
import { useDragResize } from "../../composables/useDragResize";
import type { ContainerRect, SnapLine } from "../../core/snapEngine";
import type { DividerElement as DividerElementType } from "../../types";
import ElementToolbar from "./ElementToolbar.vue";

const props = defineProps<{ element: DividerElementType }>();
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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: props.element.opacity / 100,
}));

const ruleStyle = computed(() => {
  const base: Record<string, string> = {
    width: "100%",
    borderTop: `${props.element.thickness}px solid ${props.element.color}`,
  };
  if (props.element.variant === "dashed") base.borderTopStyle = "dashed";
  if (props.element.variant === "dotted") base.borderTopStyle = "dotted";
  return base;
});

const wavePath = computed(() => {
  const h = Math.max(props.element.thickness * 3, 12);
  const mid = h / 2;
  return `M0,${mid} Q15,${
    mid - h / 2
  } 30,${mid} T60,${mid} T90,${mid} T120,${mid}`;
});
</script>

<style scoped lang="scss">
.div-el {
  &__rule {
    box-sizing: border-box;
  }

  &__wave {
    width: 100%;
    height: 100%;
  }

  &__ornament {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;

    &-line {
      flex: 1;
    }

    &-icon {
      flex-shrink: 0;
      line-height: 1;
    }
  }
}

.resize-handle {
  width: 6px;
  height: 18px;
  background: $sage-dark;
  position: absolute;
  z-index: 3;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 4px;

  &:hover {
    background: $sage-light;
  }
}
.resize-handle.left {
  left: -3px;
  cursor: ew-resize;
}
.resize-handle.right {
  right: -3px;
  cursor: ew-resize;
}
</style>