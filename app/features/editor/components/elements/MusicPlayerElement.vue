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

    <audio
      ref="audioRef"
      :src="element.src"
      :loop="element.loop"
      preload="metadata"
      @ended="onEnded"
      @play="isPlaying = true"
      @pause="isPlaying = false"
    />

    <!-- BAR variant -->
    <div
      v-if="element.variant === 'bar'"
      class="mp-el mp-el--bar"
      :style="cardStyle"
    >
      <button
        class="mp-el__play"
        :style="playBtnStyle"
        @mousedown.stop
        @click.stop="toggle"
      >
        <svg
          v-if="isPlaying"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
        <svg
          v-else
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      <div class="mp-el__info" v-if="element.showTitle">
        <span class="mp-el__title" :style="{ color: element.textColor }">
          {{ element.title || "Untitled track" }}
        </span>
        <span
          v-if="element.artist"
          class="mp-el__artist"
          :style="{ color: element.textColor }"
        >
          {{ element.artist }}
        </span>
      </div>

      <div class="mp-el__bars" v-if="isPlaying">
        <span :style="{ background: element.accentColor }" />
        <span :style="{ background: element.accentColor }" />
        <span :style="{ background: element.accentColor }" />
      </div>

      <div v-if="!element.src" class="mp-el__empty">No track selected</div>
    </div>

    <!-- CARD variant -->
    <div v-else class="mp-el mp-el--card" :style="cardStyle">
      <button
        class="mp-el__play mp-el__play--lg"
        :style="playBtnStyle"
        @mousedown.stop
        @click.stop="toggle"
      >
        <svg
          v-if="isPlaying"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
        <svg
          v-else
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      <div class="mp-el__bars mp-el__bars--lg" v-if="isPlaying">
        <span :style="{ background: element.accentColor }" />
        <span :style="{ background: element.accentColor }" />
        <span :style="{ background: element.accentColor }" />
        <span :style="{ background: element.accentColor }" />
      </div>

      <div class="mp-el__info mp-el__info--center" v-if="element.showTitle">
        <span class="mp-el__title" :style="{ color: element.textColor }">
          {{ element.title || "Untitled track" }}
        </span>
        <span
          v-if="element.artist"
          class="mp-el__artist"
          :style="{ color: element.textColor }"
        >
          {{ element.artist }}
        </span>
      </div>

      <div v-if="!element.src" class="mp-el__empty">No track selected</div>
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
import { computed, ref, inject, watch, onMounted, onUnmounted } from "vue";
import { useEditorStore } from "../../store/editorStore";
import { useDragResize } from "../../composables/useDragResize";
import type { ContainerRect, SnapLine } from "../../core/snapEngine";
import type { MusicPlayerElement as MusicPlayerElementType } from "../../types";
import ElementToolbar from "./ElementToolbar.vue";

const props = defineProps<{ element: MusicPlayerElementType }>();
const store = useEditorStore();
const elRef = ref<HTMLElement | null>(null);
const audioRef = ref<HTMLAudioElement | null>(null);

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

// ── Playback (chỉ preview trong editor, độc lập với backgroundMusic) ──
const isPlaying = ref(false);

const toggle = async () => {
  if (!audioRef.value || !props.element.src) return;
  if (isPlaying.value) {
    audioRef.value.pause();
  } else {
    try {
      await audioRef.value.play();
    } catch {
      // Trình duyệt chặn autoplay ngoài user-gesture — bỏ qua, người dùng có thể bấm lại
    }
  }
};

const onEnded = () => {
  if (!props.element.loop) isPlaying.value = false;
};

// Khi đổi track (src thay đổi) trong lúc đang phát -> dừng lại để tránh phát nhầm file cũ
watch(
  () => props.element.src,
  () => {
    audioRef.value?.pause();
    isPlaying.value = false;
  }
);

onUnmounted(() => {
  audioRef.value?.pause();
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
}));

const cardStyle = computed(() => ({
  width: "100%",
  height: "100%",
  background: props.element.bgColor,
  borderRadius: `${props.element.borderRadius}px`,
  boxSizing: "border-box",
  position: "relative" as const,
}));

const playBtnStyle = computed(() => ({
  background: props.element.accentColor,
}));
</script>

<style scoped lang="scss">
.mp-el {
  display: flex;
  align-items: center;
  overflow: hidden;

  &--bar {
    flex-direction: row;
    gap: 10px;
    padding: 10px 14px;
  }

  &--card {
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    padding: 16px;
    text-align: center;
  }

  &__play {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: none;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: transform 0.15s;

    &:hover {
      transform: scale(1.06);
    }
    &:active {
      transform: scale(0.96);
    }

    &--lg {
      width: 52px;
      height: 52px;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;

    &--center {
      align-items: center;
    }
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__artist {
    font-size: 11px;
    opacity: 0.75;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__bars {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 16px;
    flex-shrink: 0;

    span {
      width: 3px;
      border-radius: 2px;
      animation: mp-el-bounce 0.9s ease-in-out infinite;

      &:nth-child(2) {
        animation-delay: 0.15s;
      }
      &:nth-child(3) {
        animation-delay: 0.3s;
      }
      &:nth-child(4) {
        animation-delay: 0.45s;
      }
    }

    &--lg span {
      width: 4px;
    }
  }

  &__empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: $text-light;
    background: rgba($cream, 0.9);
  }
}

@keyframes mp-el-bounce {
  0%,
  100% {
    height: 4px;
  }
  50% {
    height: 16px;
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