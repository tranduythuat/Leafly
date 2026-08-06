<template>
  <div class="panel">
    <!-- ── UPLOAD ZONE ── -->
    <div
      class="upload-zone"
      :class="{ 'upload-zone--drag': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="fileInputRef?.click()"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="audio/*"
        class="hidden-input"
        @change="onFileChange"
      />
      <IconMusic :size="20" stroke="1.5" />
      <p class="upload-primary">Drop an audio file here</p>
      <p class="upload-sub">
        or <span class="upload-link">click to browse</span>
      </p>
    </div>

    <!-- ── URL INSERT ── -->
    <div class="quick-row">
      <button class="quick-btn" @click="showUrlInput = !showUrlInput">
        <IconLink :size="14" />URL
      </button>
    </div>

    <div v-if="showUrlInput" class="url-row">
      <input
        v-model="urlValue"
        type="text"
        placeholder="https://…mp3"
        class="url-input"
        @keydown.enter="insertFromUrl"
        @keydown.esc="showUrlInput = false"
        autofocus
      />
      <button
        class="url-go"
        @click="insertFromUrl"
        :disabled="!urlValue.trim()"
      >
        <IconArrowRight :size="16" stroke="2" color="#fff" />
      </button>
    </div>

    <!-- ── CURRENT TRACK / SETTINGS ── -->
    <div v-if="current" class="section-label">Now playing</div>
    <div v-if="current" class="current-track">
      <button class="preview-btn" @click="togglePreview">
        <IconPlayerPauseFilled v-if="isPreviewing" :size="14" />
        <IconPlayerPlayFilled v-else :size="14" />
      </button>

      <div class="current-track__info">
        <span class="current-track__name">{{
          current.name || "Background music"
        }}</span>
        <span class="current-track__meta">
          {{ current.autoplay ? "Autoplay on" : "Autoplay off" }} ·
          {{ current.loop ? "Loop" : "Once" }}
        </span>
      </div>

      <button
        class="preview-del"
        @click="removeMusic"
        aria-label="Remove background music"
      >
        <IconX :size="14" />
      </button>
    </div>

    <div v-if="current" class="settings-block">
      <label class="toggle-row">
        <input
          type="checkbox"
          :checked="current.autoplay"
          @change="onToggle('autoplay', $event)"
        />
        <span>Autoplay when guests open the invitation</span>
      </label>

      <label class="toggle-row">
        <input
          type="checkbox"
          :checked="current.loop"
          @change="onToggle('loop', $event)"
        />
        <span>Loop</span>
      </label>

      <div class="volume-row">
        <IconVolume :size="14" />
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="Math.round(current.volume * 100)"
          @input="onVolume($event)"
        />
        <span class="volume-val">{{ Math.round(current.volume * 100) }}%</span>
      </div>
    </div>

    <!-- ── LIBRARY ── -->
    <div class="section-label">
      Library
      <span class="count">{{ assets.length }}</span>
    </div>

    <div v-if="assets.length === 0" class="empty-library">
      <IconMusicOff :size="18" />
      <span>No audio yet</span>
    </div>

    <div v-else class="track-list">
      <div
        v-for="asset in assets"
        :key="asset.id"
        class="track-item"
        :class="{ 'track-item--active': current?.src === asset.src }"
        @click="applyAsset(asset)"
      >
        <IconMusic :size="16" />
        <div class="track-item__info">
          <span class="track-item__name">{{ asset.name }}</span>
          <span class="track-item__dur">{{
            formatDuration(asset.duration)
          }}</span>
        </div>
        <button class="track-item__del" @click.stop="removeAsset(asset.id)">
          <IconX :size="13" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IconArrowRight,
  IconLink,
  IconMusic,
  IconMusicOff,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconVolume,
  IconX,
} from "@tabler/icons-vue";
import { ref, computed, onBeforeUnmount } from "vue";
import {
  useAudioLibrary,
  type AudioAsset,
} from "../../../composables/useAudioLibrary";
import { useEditorStore } from "../../../store/editorStore";

const store = useEditorStore();
const { assets, addFromFile, addFromUrl, remove } = useAudioLibrary();

const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const showUrlInput = ref(false);
const urlValue = ref("");

const current = computed(() => store.backgroundMusic);

// ── UPLOAD / URL ──
const processFile = async (file: File) => {
  if (!file.type.startsWith("audio/")) return;
  const asset = await addFromFile(file);
  applyAsset(asset);
};

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) processFile(file);
  input.value = "";
};

const onDrop = (e: DragEvent) => {
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) processFile(file);
};

const insertFromUrl = async () => {
  if (!urlValue.value.trim()) return;
  const asset = await addFromUrl(urlValue.value.trim());
  if (asset) applyAsset(asset);
  urlValue.value = "";
  showUrlInput.value = false;
};

// ── APPLY / REMOVE ──
const applyAsset = (asset: AudioAsset) => {
  stopPreview();
  store.setBackgroundMusic(asset.src, asset.name);
};

const removeMusic = () => {
  stopPreview();
  store.removeBackgroundMusic();
};

const removeAsset = (id: string) => remove(id);

// ── SETTINGS ──
const onToggle = (key: "autoplay" | "loop", e: Event) => {
  const checked = (e.target as HTMLInputElement).checked;
  store.updateMusicSettings({ [key]: checked });
};

const onVolume = (e: Event) => {
  const pct = +(e.target as HTMLInputElement).value;
  store.updateMusicSettings({ volume: pct / 100 });
};

// ── PREVIEW (chỉ để nghe thử trong panel, không ảnh hưởng floating player) ──
const previewAudio = ref<HTMLAudioElement | null>(null);
const isPreviewing = ref(false);

const togglePreview = () => {
  if (!current.value) return;

  if (isPreviewing.value) {
    stopPreview();
    return;
  }

  previewAudio.value = new Audio(current.value.src);
  previewAudio.value.volume = current.value.volume;
  previewAudio.value.addEventListener("ended", stopPreview);
  previewAudio.value.play().catch(() => {});
  isPreviewing.value = true;
};

const stopPreview = () => {
  previewAudio.value?.pause();
  previewAudio.value = null;
  isPreviewing.value = false;
};

onBeforeUnmount(stopPreview);

// ── UTIL ──
const formatDuration = (sec: number) => {
  if (!sec) return "--:--";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};
</script>

<style scoped lang="scss">
.panel {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
}

.hidden-input {
  display: none;
}

.upload-zone {
  margin: 10px;
  border: 1px dashed var(--color-border-secondary, rgba(0, 0, 0, 0.2));
  border-radius: $radius-md;
  padding: 16px 10px;
  text-align: center;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  color: $text-light;

  &:hover,
  &--drag {
    background: rgba(107, 140, 110, 0.07);
    border-color: $sage;
  }
}

.upload-primary {
  font-size: 12px;
  font-weight: 500;
  color: $text-dark;
  margin: 6px 0 2px;
}

.upload-sub {
  font-size: 11px;
  color: $text-light;
}

.upload-link {
  color: $sage;
  text-decoration: underline;
  cursor: pointer;
}

.quick-row {
  display: flex;
  gap: 6px;
  padding: 0 10px 8px;
}

.quick-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 0.5px solid $cream-dark;
  border-radius: $radius-md;
  padding: 6px;
  font-size: 11px;
  color: $text-mid;
  background: $cream;
  cursor: pointer;

  &:hover {
    background: $cream-dark;
    color: $text-dark;
  }
}

.url-row {
  display: flex;
  gap: 4px;
  padding: 0 10px 8px;
}

.url-input {
  flex: 1;
  border: 0.5px solid $cream-dark;
  border-radius: $radius-md;
  padding: 6px 8px;
  font-size: 11px;
  background: $white;
  color: $text-dark;
  outline: none;

  &:focus {
    border-color: $sage;
  }
}

.url-go {
  width: 30px;
  height: 30px;
  border: 0.5px solid $sage;
  border-radius: $radius-md;
  background: $sage;
  color: $white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
}

.section-label {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 10px 6px;
  font-size: 10px;
  font-weight: 500;
  color: $text-light;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-top: 0.5px solid $cream-dark;
}

.count {
  background: $cream-dark;
  color: $text-mid;
  border-radius: 20px;
  padding: 0 5px;
  font-size: 9px;
}

// ── Current track ──
.current-track {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 10px 8px;
  padding: 8px;
  border-radius: $radius-md;
  background: #eef3e8;
  border: 1px solid rgba($sage, 0.3);
}

.preview-btn {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  border: none;
  background: $sage;
  color: $white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.current-track__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.current-track__name {
  font-size: 11px;
  font-weight: 500;
  color: $text-dark;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.current-track__meta {
  font-size: 10px;
  color: $text-light;
}

.preview-del {
  border: none;
  background: transparent;
  color: $text-light;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    color: #c26457;
  }
}

// ── Settings ──
.settings-block {
  margin: 0 10px 8px;
  padding: 8px 2px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: $text-mid;
  cursor: pointer;

  input {
    cursor: pointer;
  }
}

.volume-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: $text-light;

  input[type="range"] {
    flex: 1;
  }
}

.volume-val {
  font-size: 10px;
  min-width: 30px;
  text-align: right;
  color: $text-mid;
}

// ── Empty ──
.empty-library {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 0;
  color: $text-light;
  font-size: 11px;
}

// ── Library list ──
.track-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 10px 12px;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: $radius-md;
  border: 1px solid transparent;
  cursor: pointer;
  color: $text-mid;

  &:hover {
    background: $cream;
  }

  &--active {
    border-color: $sage;
    background: #eef3e8;
    color: $sage-dark;
  }
}

.track-item__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.track-item__name {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-item__dur {
  font-size: 10px;
  color: $text-light;
}

.track-item__del {
  border: none;
  background: transparent;
  color: $text-light;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    color: #c26457;
  }
}
</style>