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

    <div class="cd-el" :style="innerStyle">
      <p
        v-if="element.label"
        class="cd-el__label"
        :style="{ color: element.labelColor }"
      >
        {{ element.label }}
      </p>

      <div
        v-if="!isFinished || element.onComplete === 'hide'"
        class="cd-el__units"
        :class="`cd-el__units--${element.layout}`"
      >
        <div v-if="element.showDays" class="cd-el__unit" :style="unitStyle">
          <span class="cd-el__number" :style="{ color: element.numberColor }">{{
            pad(time.days)
          }}</span>
          <span class="cd-el__label-sm" :style="{ color: element.labelColor }"
            >Ngày</span
          >
        </div>
        <div v-if="element.showHours" class="cd-el__unit" :style="unitStyle">
          <span class="cd-el__number" :style="{ color: element.numberColor }">{{
            pad(time.hours)
          }}</span>
          <span class="cd-el__label-sm" :style="{ color: element.labelColor }"
            >Giờ</span
          >
        </div>
        <div v-if="element.showMinutes" class="cd-el__unit" :style="unitStyle">
          <span class="cd-el__number" :style="{ color: element.numberColor }">{{
            pad(time.minutes)
          }}</span>
          <span class="cd-el__label-sm" :style="{ color: element.labelColor }"
            >Phút</span
          >
        </div>
        <div v-if="element.showSeconds" class="cd-el__unit" :style="unitStyle">
          <span class="cd-el__number" :style="{ color: element.numberColor }">{{
            pad(time.seconds)
          }}</span>
          <span class="cd-el__label-sm" :style="{ color: element.labelColor }"
            >Giây</span
          >
        </div>
      </div>

      <p v-else class="cd-el__complete" :style="{ color: element.numberColor }">
        {{ element.completeMessage || "🎉 Đã đến ngày!" }}
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
import { computed, ref, inject, onMounted, onUnmounted } from "vue";
import { useEditorStore } from "../../store/editorStore";
import { useDragResize } from "../../composables/useDragResize";
import type { ContainerRect, SnapLine } from "../../core/snapEngine";
import type { CountdownElement as CountdownElementType } from "../../types";
import ElementToolbar from "./ElementToolbar.vue";

const props = defineProps<{ element: CountdownElementType }>();
const store = useEditorStore();
const elRef = ref<HTMLElement | null>(null);

const setSnapLines = inject<(lines: SnapLine[]) => void>("setSnapLines");
const getContainerRect = inject<() => ContainerRect>("getContainerRect");

const isSelected = computed(() => store.selectedIds.includes(props.element.id));
const { startDrag, startResize, isResizing, activeResizeHandle } =
  useDragResize(props.element, setSnapLines, getContainerRect);

const onMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return;
  store.select(props.element.id, e.shiftKey);
  startDrag(e);
};

// ── Live tick ──
const time = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });
const isFinished = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

const tick = () => {
  const target = new Date(props.element.targetDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    isFinished.value = true;
    time.value = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return;
  }

  isFinished.value = false;
  time.value = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
};

onMounted(() => {
  tick();
  timer = setInterval(tick, 1000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const pad = (n: number) => String(n).padStart(2, "0");

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
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  background: props.element.bgColor || "transparent",
  borderRadius: `${props.element.borderRadius}px`,
  overflow: "hidden",
}));

const unitStyle = computed(() => ({
  background: props.element.accentColor,
  borderRadius: `${Math.min(props.element.borderRadius, 12)}px`,
}));
</script>

<style scoped lang="scss">
.cd-el {
  &__label {
    font-size: 13px;
    font-style: italic;
    text-align: center;
  }

  &__units {
    display: flex;
    gap: 10px;

    &--circles .cd-el__unit {
      border-radius: 50%;
      aspect-ratio: 1;
      width: 64px;
    }
  }

  &__unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 14px;
    min-width: 56px;
  }

  &__number {
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 1;
  }

  &__label-sm {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 4px;
  }

  &__complete {
    font-size: 1.2rem;
    font-weight: 600;
    text-align: center;
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