<template>
  <!-- Source -->
  <InsSection title="Video Source">
    <div class="vp-url-row">
      <input
        v-model="urlDraft"
        class="vp-url-input"
        placeholder="Paste a YouTube / Vimeo link..."
        @keydown.enter="applyUrl"
      />
      <button class="vp-url-btn" @click="applyUrl" :disabled="!urlDraft.trim()">
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

    <label class="vp-upload-btn">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      Or upload a video file
      <input
        type="file"
        accept="video/*"
        class="vp-hidden"
        @change="onUploadFile"
      />
    </label>

    <div v-if="local.src" class="vp-source-badge">
      Source: <strong>{{ local.sourceType }}</strong>
    </div>
  </InsSection>

  <!-- Playback -->
  <InsSection title="Playback">
    <InsField
      type="toggle"
      label="Autoplay"
      :model-value="local.autoplay"
      @update:model-value="
        local.autoplay = $event;
        sync();
      "
    />
    <InsField
      type="toggle"
      label="Loop"
      :model-value="local.loop"
      @update:model-value="
        local.loop = $event;
        sync();
      "
    />
    <InsField
      type="toggle"
      label="Muted"
      :model-value="local.muted"
      @update:model-value="
        local.muted = $event;
        sync();
      "
    />
    <InsField
      type="toggle"
      label="Show controls"
      :model-value="local.controls"
      @update:model-value="
        local.controls = $event;
        sync();
      "
    />
  </InsSection>

  <!-- Appearance -->
  <InsSection title="Appearance" :default-open="false">
    <InsField
      type="range"
      label="Border radius"
      :model-value="local.borderRadius"
      :min="0"
      :max="32"
      suffix="px"
      @update:model-value="
        local.borderRadius = $event;
        sync();
      "
    />
    <InsField
      type="range"
      label="Opacity"
      :model-value="local.opacity"
      :min="0"
      :max="100"
      suffix="%"
      @update:model-value="
        local.opacity = $event;
        sync();
      "
    />
  </InsSection>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import InsSection from "../shared/InsSection.vue";
import InsField from "../shared/InsField.vue";
import { useEditorStore } from "../../store/editorStore";
import { createUpdateStyleCommand } from "../../core/commands/updateStyle";
import { detectVideoSource } from "../../utils/videoUtils";
import type { CanvasElement } from "../../types";

const props = defineProps<{ element: CanvasElement & { [k: string]: any } }>();
const store = useEditorStore();

const urlDraft = ref("");

const local = reactive({
  src: "",
  sourceType: "youtube" as "youtube" | "vimeo" | "upload",
  autoplay: false,
  loop: false,
  muted: false,
  controls: true,
  borderRadius: 8,
  opacity: 100,
});

watch(
  () => props.element,
  (el) => {
    if (!el) return;
    local.src = el.src ?? "";
    local.sourceType = el.sourceType ?? "youtube";
    local.autoplay = el.autoplay ?? false;
    local.loop = el.loop ?? false;
    local.muted = el.muted ?? false;
    local.controls = el.controls ?? true;
    local.borderRadius = el.borderRadius ?? 8;
    local.opacity = el.opacity ?? 100;
    urlDraft.value = local.sourceType === "upload" ? "" : local.src;
  },
  { immediate: true }
);

const applyUrl = () => {
  if (!urlDraft.value.trim()) return;
  local.src = urlDraft.value.trim();
  local.sourceType = detectVideoSource(local.src);
  sync();
};

const onUploadFile = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  local.src = URL.createObjectURL(file);
  local.sourceType = "upload";
  urlDraft.value = "";
  sync();
  input.value = "";
};

const sync = () => {
  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: props.element.id,
      oldData: {},
      newData: { ...local },
    })
  );
};
</script>

<style scoped lang="scss">
.vp-url-row {
  display: flex;
  gap: 5px;
}

.vp-url-input {
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

.vp-url-btn {
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
  transition: background 0.15s;

  &:hover {
    background: $sage-dark;
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}

.vp-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px;
  border: 1px dashed $cream-dark;
  border-radius: $radius-md;
  font-size: 11px;
  color: $text-mid;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: $cream;
    border-color: $sage-light;
    color: $sage-dark;
  }
}

.vp-hidden {
  display: none;
}

.vp-source-badge {
  font-size: 10px;
  color: $text-light;

  strong {
    color: $text-mid;
    text-transform: capitalize;
  }
}
</style>