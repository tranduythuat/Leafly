<template>
  <InsSection title="Track">
    <div
      class="mpp-upload"
      :class="{ 'mpp-upload--drag': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="fileRef?.click()"
    >
      <input
        ref="fileRef"
        type="file"
        accept="audio/*"
        class="mpp-hidden"
        @change="onFileChange"
      />
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
      <span>Drop an audio file or click to upload</span>
    </div>

    <div class="mpp-url-row">
      <input
        v-model="urlDraft"
        class="mpp-url-input"
        placeholder="Or paste an audio URL..."
        @keydown.enter="applyUrl"
      />
      <button
        class="mpp-url-btn"
        @click="applyUrl"
        :disabled="!urlDraft.trim()"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>

    <div v-if="assets.length" class="mpp-library">
      <div class="mpp-library__label">From library</div>
      <div
        v-for="asset in assets"
        :key="asset.id"
        class="mpp-track"
        :class="{ 'mpp-track--active': local.src === asset.src }"
        @click="applyAsset(asset)"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span>{{ asset.name }}</span>
      </div>
    </div>

    <p v-if="local.src" class="mpp-current">
      Current: <strong>{{ local.title || "Untitled" }}</strong>
    </p>
  </InsSection>

  <InsSection title="Caption">
    <InsField
      type="toggle"
      label="Show title / artist"
      :model-value="local.showTitle"
      @update:model-value="
        local.showTitle = $event;
        sync();
      "
    />
    <template v-if="local.showTitle">
      <InsField
        type="text"
        label="Title"
        :model-value="local.title"
        placeholder="Perfect"
        @update:model-value="
          local.title = $event;
          debouncedSync();
        "
      />
      <InsField
        type="text"
        label="Artist"
        :model-value="local.artist"
        placeholder="Ed Sheeran"
        @update:model-value="
          local.artist = $event;
          debouncedSync();
        "
      />
    </template>
  </InsSection>

  <InsSection title="Appearance" :default-open="false">
    <div class="mpp-variant-row">
      <button
        class="mpp-variant-btn"
        :class="{ 'mpp-variant-btn--active': local.variant === 'bar' }"
        @click="
          local.variant = 'bar';
          sync();
        "
      >
        Bar
      </button>
      <button
        class="mpp-variant-btn"
        :class="{ 'mpp-variant-btn--active': local.variant === 'card' }"
        @click="
          local.variant = 'card';
          sync();
        "
      >
        Card
      </button>
    </div>

    <div class="mpp-row2">
      <InsField
        type="color"
        label="Accent (play button)"
        :model-value="local.accentColor"
        @update:model-value="
          local.accentColor = $event;
          sync();
        "
      />
      <InsField
        type="color"
        label="Background"
        :model-value="local.bgColor"
        @update:model-value="
          local.bgColor = $event;
          sync();
        "
      />
    </div>
    <InsField
      type="color"
      label="Text color"
      :model-value="local.textColor"
      @update:model-value="
        local.textColor = $event;
        sync();
      "
    />
    <InsField
      type="range"
      label="Border radius"
      :model-value="local.borderRadius"
      :min="0"
      :max="999"
      suffix="px"
      @update:model-value="
        local.borderRadius = $event;
        sync();
      "
    />
  </InsSection>

  <InsSection title="Playback" :default-open="false">
    <InsField
      type="toggle"
      label="Loop"
      :model-value="local.loop"
      @update:model-value="
        local.loop = $event;
        sync();
      "
    />
    <p class="mpp-hint">
      Autoplay không áp dụng cho widget này trong lúc chỉnh sửa vì trình duyệt
      chặn tự phát — khách sẽ nghe khi họ bấm nút play trên thiệp đã publish.
    </p>
  </InsSection>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import InsSection from "../shared/InsSection.vue";
import InsField from "../shared/InsField.vue";
import { useEditorStore } from "../../store/editorStore";
import { createUpdateStyleCommand } from "../../core/commands/updateStyle";
import { debounce } from "../../utils/debounce";
import {
  useAudioLibrary,
  type AudioAsset,
} from "../../composables/useAudioLibrary";
import type { CanvasElement } from "../../types";

const props = defineProps<{ element: CanvasElement & { [k: string]: any } }>();
const store = useEditorStore();
const { assets, addFromFile, addFromUrl } = useAudioLibrary();

const fileRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const urlDraft = ref("");

const local = reactive({
  src: "",
  title: "",
  artist: "",
  variant: "bar" as "bar" | "card",
  accentColor: "#6B8C6E",
  bgColor: "#ffffff",
  textColor: "#2C2416",
  borderRadius: 999,
  autoplay: false,
  loop: true,
  showTitle: true,
});

let isSyncing = false;

watch(
  () => props.element,
  (el) => {
    if (!el) return;
    isSyncing = true;
    local.src = el.src ?? "";
    local.title = el.title ?? "";
    local.artist = el.artist ?? "";
    local.variant = el.variant ?? "bar";
    local.accentColor = el.accentColor ?? "#6B8C6E";
    local.bgColor = el.bgColor ?? "#ffffff";
    local.textColor = el.textColor ?? "#2C2416";
    local.borderRadius = el.borderRadius ?? 999;
    local.autoplay = el.autoplay ?? false;
    local.loop = el.loop ?? true;
    local.showTitle = el.showTitle ?? true;
    isSyncing = false;
  },
  { immediate: true, deep: true }
);

// oldData luôn lấy từ props.element hiện tại (không để rỗng) để undo/redo khôi phục đúng giá trị.
const sync = () => {
  if (isSyncing) return;
  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: props.element.id,
      oldData: {
        src: props.element.src,
        title: props.element.title,
        artist: props.element.artist,
        variant: props.element.variant,
        accentColor: props.element.accentColor,
        bgColor: props.element.bgColor,
        textColor: props.element.textColor,
        borderRadius: props.element.borderRadius,
        autoplay: props.element.autoplay,
        loop: props.element.loop,
        showTitle: props.element.showTitle,
      },
      newData: { ...local },
    })
  );
};

const debouncedSync = debounce(sync, 280);

// ── Upload / URL / library ──
const guessTitleFromName = (name: string) =>
  name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

const applyAsset = (asset: AudioAsset) => {
  local.src = asset.src;
  if (!local.title) local.title = guessTitleFromName(asset.name);
  sync();
};

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

const applyUrl = async () => {
  if (!urlDraft.value.trim()) return;
  const asset = await addFromUrl(urlDraft.value.trim());
  if (asset) applyAsset(asset);
  urlDraft.value = "";
};
</script>

<style scoped lang="scss">
.mpp-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px;
  border: 1px dashed $cream-dark;
  border-radius: $radius-md;
  cursor: pointer;
  font-size: 11px;
  color: $text-light;
  text-align: center;
  transition: all 0.15s;
  margin-bottom: 8px;

  &:hover,
  &--drag {
    background: rgba($sage, 0.04);
    border-color: $sage;
    color: $sage-dark;
  }
}

.mpp-hidden {
  display: none;
}

.mpp-url-row {
  display: flex;
  gap: 5px;
  margin-bottom: 8px;
}

.mpp-url-input {
  flex: 1;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  padding: 5px 8px;
  font-size: 12px;
  background: $white;
  color: $text-dark;
  outline: none;

  &:focus {
    border-color: $sage;
  }
}

.mpp-url-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $sage;
  border: none;
  border-radius: $radius-sm;
  color: $white;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: $sage-dark;
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}

.mpp-library {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.mpp-library__label {
  font-size: 10px;
  color: $text-light;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.mpp-track {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: $radius-sm;
  border: 1px solid transparent;
  color: $text-mid;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: $cream;
  }

  &--active {
    border-color: $sage;
    background: #eef3e8;
    color: $sage-dark;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.mpp-current {
  font-size: 11px;
  color: $text-mid;
  margin: 0;

  strong {
    color: $text-dark;
  }
}

.mpp-variant-row {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}

.mpp-variant-btn {
  flex: 1;
  padding: 6px;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  background: $cream;
  color: $text-mid;
  font-size: 11px;
  cursor: pointer;

  &--active {
    border-color: $sage;
    background: #eef3e8;
    color: $sage-dark;
    font-weight: 600;
  }
}

.mpp-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.mpp-hint {
  font-size: 10px;
  color: $text-light;
  line-height: 1.5;
  margin: 4px 0 0;
}
</style>