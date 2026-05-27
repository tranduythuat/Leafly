<template>
  <!-- Meta bar -->
  <div class="ip-meta">
    <div class="ip-meta__thumb" :style="{ backgroundImage: `url(${element.src})` }" />
    <div class="ip-meta__info">
      <div class="ip-meta__name">{{ displayName }}</div>
      <div v-if="naturalSize" class="ip-meta__dims">{{ naturalSize.w }} × {{ naturalSize.h }}px</div>
    </div>
  </div>

  <!-- Replace -->
  <label class="ip-replace-btn">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
    Replace image
    <input type="file" accept="image/*" class="ip-hidden" @change="onReplaceFile" />
  </label>

  <!-- Object fit -->
  <InsSection title="Object Fit">
    <div class="ip-fit-row">
      <button
        v-for="fit in fits"
        :key="fit.value"
        class="ip-fit-btn"
        :class="{ 'ip-fit-btn--active': currentFit === fit.value }"
        @click="setFit(fit.value)"
      >
        {{ fit.label }}
      </button>
    </div>
  </InsSection>

  <!-- Adjustments -->
  <InsSection title="Adjustments">
    <InsField
      type="range"
      label="Opacity"
      :model-value="opacityPct"
      :min="0" :max="100" :step="1"
      suffix="%"
      @update:model-value="setOpacity($event)"
    />
    <InsField
      type="range"
      label="Border radius"
      :model-value="(element as any).borderRadius ?? 0"
      :min="0" :max="100" :step="1"
      suffix="px"
      @update:model-value="patch('borderRadius', $event)"
    />
  </InsSection>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import InsSection from '../shared/InsSection.vue'
import InsField from '../shared/InsField.vue'
import { useEditorStore } from '../../store/editorStore'
import { createUpdateStyleCommand } from '../../core/commands/updateStyle'
import type { ImageElement } from '../../types'

const props = defineProps<{ element: ImageElement }>()
const store = useEditorStore()

// ── Natural size ──
const naturalSize = ref<{ w: number; h: number } | null>(null)

watch(() => props.element.src, (src) => {
  if (!src) return
  const img = new Image()
  img.onload = () => { naturalSize.value = { w: img.naturalWidth, h: img.naturalHeight } }
  img.src = src
}, { immediate: true })

const displayName = computed(() => {
  const src = props.element.src ?? ''
  return src.startsWith('blob:') ? 'Uploaded image' : src.split('/').pop()?.split('?')[0] ?? 'Image'
})

// ── Patch ──
const patch = (key: string, value: unknown) => {
  store.executeCommand(createUpdateStyleCommand(store, {
    id: props.element.id,
    oldData: { [key]: (props.element as any)[key] },
    newData: { [key]: value },
  }))
}

// ── Replace ──
const onReplaceFile = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const src = URL.createObjectURL(file)
  store.updateImageSource(props.element.id, src)
  input.value = ''
}

// ── Object fit ──
const fits = [
  { value: 'cover',   label: 'Cover'   },
  { value: 'contain', label: 'Contain' },
  { value: 'fill',    label: 'Fill'    },
]

const currentFit = computed(() => (props.element.style as any)?.objectFit ?? 'cover')

const setFit = (fit: string) => {
  store.executeCommand(createUpdateStyleCommand(store, {
    id: props.element.id,
    oldData: { style: props.element.style },
    newData: { style: { ...props.element.style, objectFit: fit } },
  }))
}

// ── Opacity ──
const opacityPct = computed(() => Math.round(((props.element as any).opacity ?? 1) * 100))
const setOpacity = (pct: number) => patch('opacity', pct / 100)
</script>

<style scoped lang="scss">
/* Meta */
.ip-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid $cream-dark;
  background: $cream;
}

.ip-meta__thumb {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  border: 1px solid $cream-dark;
  flex-shrink: 0;
}

.ip-meta__name {
  font-size: 12px;
  font-weight: 500;
  color: $text-dark;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.ip-meta__dims {
  font-size: 10px;
  color: $text-light;
  margin-top: 2px;
}

/* Replace */
.ip-replace-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 8px 14px;
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

.ip-hidden { display: none; }

/* Fit */
.ip-fit-row {
  display: flex;
  gap: 4px;
}

.ip-fit-btn {
  flex: 1;
  padding: 6px 4px;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  background: $cream;
  color: $text-mid;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.12s;

  &:hover { background: $cream-dark; }

  &--active {
    border-color: $sage;
    background: #eef3e8;
    color: $sage-dark;
    font-weight: 600;
  }
}
</style>