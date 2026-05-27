<template>
  <!-- Upload zone -->
  <div
    class="ap-upload"
    :class="{ 'ap-upload--drag': isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
    @click="fileRef?.click()"
  >
    <input ref="fileRef" type="file" accept="image/*" multiple class="ap-hidden" @change="onFiles" />
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
    <span>Drop photos or click to upload</span>
    <span class="ap-upload__count" v-if="local.images.length">{{ local.images.length }} photo{{ local.images.length !== 1 ? 's' : '' }}</span>
  </div>

  <!-- Thumbnail grid with reorder -->
  <div v-if="local.images.length" class="ap-grid">
    <div
      v-for="(img, i) in local.images"
      :key="img.id"
      class="ap-thumb"
      draggable="true"
      @dragstart="dragIdx = i"
      @dragover.prevent
      @drop.prevent="reorder(i)"
    >
      <img :src="img.src" :alt="`Photo ${i+1}`" />
      <div class="ap-thumb__overlay">
        <button class="ap-thumb__del" @click.stop="removeImage(i)">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <span class="ap-thumb__idx">{{ i + 1 }}</span>
      </div>
    </div>
  </div>

  <!-- Layout -->
  <InsSection title="Layout">
    <div class="ap-layout-grid">
      <button
        v-for="layout in layouts"
        :key="layout.value"
        class="ap-layout-btn"
        :class="{ 'ap-layout-btn--active': local.layout === layout.value }"
        @click="local.layout = layout.value; sync()"
      >
        <component :is="layout.icon" class="ap-layout-icon" />
        <span>{{ layout.label }}</span>
      </button>
    </div>

    <div v-if="local.layout !== 'carousel'" class="ap-cols-row">
      <span class="ap-cols-label">Columns</span>
      <div class="ap-cols-btns">
        <button
          v-for="n in [1,2,3,4]"
          :key="n"
          class="ap-col-btn"
          :class="{ 'ap-col-btn--active': local.columns === n }"
          @click="local.columns = n; sync()"
        >{{ n }}</button>
      </div>
    </div>
  </InsSection>

  <!-- Spacing & style -->
  <InsSection title="Style" :default-open="false">
    <InsField
      type="range"
      label="Gap between photos"
      :model-value="local.gap"
      :min="0" :max="32"
      suffix="px"
      @update:model-value="local.gap = $event; sync()"
    />
    <InsField
      type="range"
      label="Photo border radius"
      :model-value="local.itemRadius"
      :min="0" :max="32"
      suffix="px"
      @update:model-value="local.itemRadius = $event; sync()"
    />
    <InsField
      type="select"
      label="Fit"
      :model-value="local.objectFit"
      :options="[{ value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }]"
      @update:model-value="local.objectFit = $event; sync()"
    />
    <InsField
      type="number"
      label="Fixed height per row"
      :model-value="local.rowHeight"
      :min="60"
      unit="px"
      @update:model-value="local.rowHeight = $event; sync()"
    />
  </InsSection>

  <!-- Lightbox -->
  <InsSection title="Interaction" :default-open="false">
    <InsField
      type="toggle"
      label="Open lightbox on click"
      :model-value="local.lightbox"
      @update:model-value="local.lightbox = $event; sync()"
    />
    <InsField
      v-if="local.layout === 'carousel'"
      type="toggle"
      label="Auto-play"
      :model-value="local.autoplay"
      @update:model-value="local.autoplay = $event; sync()"
    />
    <InsField
      v-if="local.layout === 'carousel' && local.autoplay"
      type="number"
      label="Interval"
      :model-value="local.autoplayMs"
      :min="1000"
      :step="500"
      unit="ms"
      @update:model-value="local.autoplayMs = $event; sync()"
    />
  </InsSection>
</template>

<script setup lang="ts">
import { reactive, ref, watch, defineComponent, h } from 'vue'
import InsSection from '../shared/InsSection.vue'
import InsField from '../shared/InsField.vue'
import { useEditorStore } from '../../store/editorStore'
import { createUpdateStyleCommand } from '../../core/commands/updateStyle'
import type { CanvasElement } from '../../types'

const props = defineProps<{ element: CanvasElement & { [k: string]: any } }>()
const store = useEditorStore()
const fileRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const dragIdx = ref<number | null>(null)

// Layout icon components
const GridIcon = defineComponent({ render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('rect', { x: '3', y: '3', width: '7', height: '7' }), h('rect', { x: '14', y: '3', width: '7', height: '7' }), h('rect', { x: '3', y: '14', width: '7', height: '7' }), h('rect', { x: '14', y: '14', width: '7', height: '7' })]) })
const MasonryIcon = defineComponent({ render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('rect', { x: '3', y: '3', width: '7', height: '10' }), h('rect', { x: '14', y: '3', width: '7', height: '6' }), h('rect', { x: '14', y: '12', width: '7', height: '9' }), h('rect', { x: '3', y: '16', width: '7', height: '5' })]) })
const CarouselIcon = defineComponent({ render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('rect', { x: '5', y: '5', width: '14', height: '14', rx: '1' }), h('line', { x1: '1', y1: '12', x2: '3', y2: '12' }), h('line', { x1: '21', y1: '12', x2: '23', y2: '12' })]) })
const StripIcon = defineComponent({ render: () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('rect', { x: '3', y: '6', width: '18', height: '5', rx: '1' }), h('rect', { x: '3', y: '13', width: '18', height: '5', rx: '1' })]) })

const layouts = [
  { value: 'grid',     label: 'Grid',     icon: GridIcon    },
  { value: 'masonry',  label: 'Masonry',  icon: MasonryIcon },
  { value: 'carousel', label: 'Slide',    icon: CarouselIcon },
  { value: 'strip',    label: 'Strip',    icon: StripIcon   },
]

const local = reactive({
  images:     [] as { id: string; src: string }[],
  layout:     'grid',
  columns:    3,
  gap:        6,
  itemRadius: 4,
  objectFit:  'cover',
  rowHeight:  180,
  lightbox:   true,
  autoplay:   false,
  autoplayMs: 3000,
})

watch(() => props.element, (el) => {
  if (!el) return
  local.images     = el.images     ?? []
  local.layout     = el.layout     ?? 'grid'
  local.columns    = el.columns    ?? 3
  local.gap        = el.gap        ?? 6
  local.itemRadius = el.itemRadius ?? 4
  local.objectFit  = el.objectFit  ?? 'cover'
  local.rowHeight  = el.rowHeight  ?? 180
  local.lightbox   = el.lightbox   ?? true
  local.autoplay   = el.autoplay   ?? false
  local.autoplayMs = el.autoplayMs ?? 3000
}, { immediate: true })

const uid = () => Math.random().toString(36).slice(2, 8)

const processFiles = (files: FileList | File[]) => {
  Array.from(files)
    .filter(f => f.type.startsWith('image/'))
    .forEach(file => {
      const src = URL.createObjectURL(file)
      local.images.push({ id: uid(), src })
    })
  sync()
}

const onFiles = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) processFiles(input.files)
  input.value = ''
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files) processFiles(e.dataTransfer.files)
}

const removeImage = (i: number) => {
  local.images.splice(i, 1)
  sync()
}

const reorder = (toIdx: number) => {
  if (dragIdx.value === null || dragIdx.value === toIdx) return
  const [item] = local.images.splice(dragIdx.value, 1)
  local.images.splice(toIdx, 0, item)
  dragIdx.value = null
  sync()
}

const sync = () => {
  store.executeCommand(createUpdateStyleCommand(store, {
    id: props.element.id,
    oldData: {},
    newData: { ...local, images: local.images.map(i => ({ ...i })) },
  }))
}
</script>

<style scoped lang="scss">
/* Upload */
.ap-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 10px 14px;
  padding: 14px;
  border: 1px dashed $cream-dark;
  border-radius: $radius-md;
  cursor: pointer;
  font-size: 11px;
  color: $text-light;
  text-align: center;
  transition: all 0.15s;

  &:hover, &--drag {
    background: rgba($sage, 0.04);
    border-color: $sage;
    color: $sage-dark;
  }

  svg { color: $text-light; }
}

.ap-upload__count {
  font-size: 10px;
  font-weight: 600;
  color: $sage;
  background: #eef3e8;
  padding: 1px 7px;
  border-radius: 999px;
  margin-top: 2px;
}

.ap-hidden { display: none; }

/* Thumbnail grid */
.ap-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 0 14px 8px;
}

.ap-thumb {
  aspect-ratio: 1;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
  cursor: grab;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
  }

  &:hover .ap-thumb__overlay { opacity: 1; }
}

.ap-thumb__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  opacity: 0;
  transition: opacity 0.15s;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 3px;
}

.ap-thumb__del {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: rgba(0,0,0,0.5);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;

  &:hover { background: rgba(194, 100, 87, 0.85); }
}

.ap-thumb__idx {
  font-size: 9px;
  color: rgba(255,255,255,0.8);
  font-weight: 600;
  line-height: 1;
  padding: 2px;
}

/* Layout picker */
.ap-layout-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}

.ap-layout-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  background: $cream;
  color: $text-light;
  cursor: pointer;
  font-size: 9px;
  transition: all 0.12s;

  &:hover { border-color: $sage-light; color: $text-dark; }

  &--active {
    border-color: $sage;
    background: #eef3e8;
    color: $sage-dark;
    font-weight: 600;
  }
}

.ap-layout-icon { color: currentColor; }

/* Columns */
.ap-cols-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ap-cols-label {
  font-size: 10px;
  color: $text-light;
}

.ap-cols-btns {
  display: flex;
  gap: 4px;
}

.ap-col-btn {
  width: 24px;
  height: 24px;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  background: $cream;
  color: $text-mid;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s;

  &:hover { background: $cream-dark; }

  &--active {
    border-color: $sage;
    background: #eef3e8;
    color: $sage-dark;
  }
}
</style>