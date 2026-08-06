<template>
  <Teleport to="body">
    <div v-if="music" class="bg-music-fab">
      <audio
        ref="audioRef"
        :src="music.src"
        :loop="music.loop"
        preload="auto"
        @ended="onEnded"
      />

      <button
        class="bg-music-fab__btn"
        type="button"
        @click="togglePlay"
        :aria-label="isPlaying ? 'Pause music' : 'Play music'"
      >
        <IconPlayerPauseFilled v-if="isPlaying" :size="15" />
        <IconPlayerPlayFilled v-else :size="15" />
      </button>

      <button
        v-if="isPlaying"
        class="bg-music-fab__btn bg-music-fab__btn--ghost"
        type="button"
        @click="toggleMute"
        :aria-label="isMuted ? 'Unmute' : 'Mute'"
      >
        <IconVolumeOff v-if="isMuted" :size="14" />
        <IconVolume v-else :size="14" />
      </button>

      <div class="bg-music-fab__bars" v-if="isPlaying && !isMuted">
        <span /><span /><span />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-vue";
import { useEditorStore } from "../../store/editorStore";

const store = useEditorStore();
const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const isMuted = ref(false);

const music = computed(() => store.backgroundMusic);

const applyVolume = () => {
  if (audioRef.value && music.value) {
    audioRef.value.volume = music.value.volume ?? 0.6;
  }
};

const tryAutoplay = async () => {
  if (!audioRef.value || !music.value?.autoplay) return;
  try {
    await audioRef.value.play();
    isPlaying.value = true;
  } catch {
    // Browser chặn autoplay → chờ user bấm play
    isPlaying.value = false;
  }
};

const togglePlay = async () => {
  if (!audioRef.value) return;

  if (isPlaying.value) {
    audioRef.value.pause();
    isPlaying.value = false;
    return;
  }

  try {
    await audioRef.value.play();
    isPlaying.value = true;
  } catch {
    isPlaying.value = false;
  }
};

const toggleMute = () => {
  if (!audioRef.value) return;
  audioRef.value.muted = !audioRef.value.muted;
  isMuted.value = audioRef.value.muted;
};

const onEnded = () => {
  if (!music.value?.loop) isPlaying.value = false;
};

watch(
  () => music.value?.src,
  () => {
    isPlaying.value = false;
    isMuted.value = false;
    requestAnimationFrame(() => {
      applyVolume();
      tryAutoplay();
    });
  }
);

watch(() => music.value?.volume, applyVolume);

onMounted(() => {
  applyVolume();
  tryAutoplay();
});
</script>

<style scoped lang="scss">
.bg-music-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(54, 64, 45, 0.92);
  box-shadow: 0 10px 30px rgba(44, 36, 22, 0.25);

  &__btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: #fff;
    color: #36402d;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;

    &--ghost {
      width: 26px;
      height: 26px;
      background: rgba(255, 255, 255, 0.18);
      color: #fff;
    }
  }

  &__bars {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 14px;
    padding-right: 6px;

    span {
      width: 3px;
      background: #fff;
      border-radius: 2px;
      animation: bg-music-bounce 0.9s ease-in-out infinite;

      &:nth-child(2) {
        animation-delay: 0.15s;
      }
      &:nth-child(3) {
        animation-delay: 0.3s;
      }
    }
  }
}

@keyframes bg-music-bounce {
  0%,
  100% {
    height: 4px;
  }
  50% {
    height: 14px;
  }
}
</style>