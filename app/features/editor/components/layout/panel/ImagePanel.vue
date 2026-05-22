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
        accept="image/*"
        multiple
        class="hidden-input"
        @change="onFileChange"
      />
      <IconCloudUpload stroke={2} />
      <p class="upload-primary">Drop images here</p>
      <p class="upload-sub">or <span class="upload-link">click to browse</span></p>
    </div>

    <!-- ── QUICK INSERT ── -->
    <div class="quick-row">
      <button class="quick-btn" @click="showUrlInput = !showUrlInput">
        <IconLink stroke={2} />URL
      </button>
      <button class="quick-btn" @click="pasteFromClipboard">
        <IconClipboardCheck stroke={2} />Paste
      </button>
    </div>

    <!-- URL input inline -->
    <div v-if="showUrlInput" class="url-row">
      <input
        v-model="urlValue"
        type="text"
        placeholder="https://…"
        class="url-input"
        @keydown.enter="insertFromUrl"
        @keydown.esc="showUrlInput = false"
        autofocus
      />
      <button class="url-go" @click="insertFromUrl" :disabled="!urlValue.trim()">
         <IconArrowRight  :size="16" stroke="2" color="#fff" />
      </button>
    </div>

    <!-- ── LIBRARY GRID ── -->
    <div class="section-label">
      Library
      <span class="count">{{ assets.length }}</span>
    </div>

    <div v-if="assets.length === 0" class="empty-library">
      <i class="ti ti-photo-off" aria-hidden="true"></i>
      <span>No images yet</span>
    </div>

    <div v-else class="img-grid">
      <div
        v-for="asset in assets"
        :key="asset.id"
        class="img-thumb"
        :class="{ 'img-thumb--active': activeAssetId === asset.id }"
        :title="asset.name"
        @click="insertAsset(asset)"
        @mouseenter="hoveredId = asset.id"
        @mouseleave="hoveredId = null"
      >
        <img :src="asset.src" :alt="asset.name" loading="lazy" />

        <!-- Overlay: kích thước + delete -->
        <div class="img-overlay" v-show="hoveredId === asset.id">
          <span class="img-size" v-if="asset.width">{{ asset.width }}×{{ asset.height }}</span>
          <button
            class="img-del"
            @click.stop="removeAsset(asset.id)"
            aria-label="Remove image"
          >
            <IconX stroke={2} :size="16" color="#ffffff"/>
          </button>
        </div>

        <!-- Active tick -->
        <div v-if="activeAssetId === asset.id" class="img-active-tick">
          <IconCheck stroke={2} />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { IconArrowRight, IconCheck, IconX, IconLink, IconClipboardCheck, IconCloudUpload} from '@tabler/icons-vue';
import { ref, computed } from 'vue'
import { useImageLibrary, type ImageAsset } from '../../../composables/useImageLibrary'
import { useEditorStore } from '../../../store/editorStore'

const store = useEditorStore()
const { assets, addFromFile, addFromUrl, remove } = useImageLibrary()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const showUrlInput = ref(false)
const urlValue = ref('')
const hoveredId = ref<string | null>(null)

// ID của asset đang hiển thị trên selected element (để đánh dấu active)
const activeAssetId = computed(() => {
  const el = store.selectedElement
  if (!el || el.type !== 'image') return null
  return assets.value.find(a => a.src === el.src)?.id ?? null
})

// ── UPLOAD ──
const processFiles = async (files: FileList | File[]) => {
  const list = Array.from(files).filter(f => f.type.startsWith('image/'))
  for (const file of list) {
    const asset = await addFromFile(file)
    insertAsset(asset)
  }
}

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) processFiles(input.files)
  input.value = ''
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files) processFiles(e.dataTransfer.files)
}

// ── URL / PASTE ──
const insertFromUrl = async () => {
  if (!urlValue.value.trim()) return
  const asset = await addFromUrl(urlValue.value.trim())
  if (asset) insertAsset(asset)
  urlValue.value = ''
  showUrlInput.value = false
}

const pasteFromClipboard = async () => {
  try {
    const items = await navigator.clipboard.read()
    for (const item of items) {
      const imageType = item.types.find(t => t.startsWith('image/'))
      if (imageType) {
        const blob = await item.getType(imageType)
        const file = new File([blob], 'pasted-image.png', { type: imageType })
        const asset = await addFromFile(file)
        insertAsset(asset)
        return
      }
    }
  } catch {
    // Clipboard API blocked → fallback: focus canvas để user paste manually
    showUrlInput.value = true
  }
}

// ── INSERT / REMOVE ──
const insertAsset = (asset: ImageAsset) => {
  const selected = store.selectedElement

  // Nếu đang select 1 image element → replace src luôn
  if (selected?.type === 'image') {
    store.updateImageSource(selected.id, asset.src)
    return
  }

  // Không có image selected → insert mới vào section
  const sectionEl = document.querySelector(
    `[data-section-id="${store.activeSectionId}"]`
  ) as HTMLElement | null
  store.insertImageBlock(asset.src, sectionEl?.clientWidth, sectionEl?.clientHeight)
}

const removeAsset = (id: string) => {
  remove(id)
}
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

// ── Upload zone ──
.upload-zone {
  margin: 10px;
  border: 1px dashed var(--color-border-secondary, rgba(0,0,0,.2));
  border-radius: $radius-md;
  padding: 16px 10px;
  text-align: center;
  cursor: pointer;
  transition: background .15s, border-color .15s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &:hover,
  &--drag {
    background: rgba(107, 140, 110, .07);
    border-color: $sage;
  }

  i {
    font-size: 22px;
    color: $text-light;
    display: block;
    margin-bottom: 6px;
  }
}

.upload-primary {
  font-size: 12px;
  font-weight: 500;
  color: $text-dark;
  margin-bottom: 2px;
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

// ── Quick row ──
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
  transition: background .15s;

  &:hover {
    background: $cream-dark;
    color: $text-dark;
  }

  i { font-size: 13px; }
}

// ── URL input ──
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
    opacity: .4;
    cursor: default;
  }

  i { font-size: 13px; }
}

// ── Section label ──
.section-label {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px 6px;
  font-size: 10px;
  font-weight: 500;
  color: $text-light;
  letter-spacing: .06em;
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

// ── Empty state ──
.empty-library {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 0;
  color: $text-light;
  font-size: 11px;

  i { font-size: 20px; }
}

// ── Image grid ──
.img-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  padding: 4px 10px 12px;
}

.img-thumb {
  aspect-ratio: 1;
  border-radius: $radius-sm;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 1.5px solid transparent;
  transition: border-color .12s;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
  }

  &:hover {
    border-color: $sage-light;
  }

  &--active {
    border-color: $sage !important;
  }
}

.img-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, .42);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 3px;
}

.img-size {
  font-size: 8px;
  color: rgba(255,255,255,.85);
  line-height: 1;
  margin-top: 1px;
}

.img-del {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: rgba(0,0,0,.5);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;

  i {
    font-size: 10px;
    color: #fff;
  }

  &:hover {
    background: rgba(194, 100, 87, .85);
  }
}

.img-active-tick {
  position: absolute;
  bottom: 3px;
  right: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: $sage;
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    font-size: 10px;
    color: #fff;
  }
}
</style>
