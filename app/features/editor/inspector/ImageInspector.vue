<template>
  <div v-if="element" class="img-inspector">
    <!-- ── HEADER: filename + dimensions ── -->
    <div class="ii-meta">
      <i class="ti ti-photo" aria-hidden="true"></i>
      <div class="ii-meta-info">
        <div class="ii-filename">{{ displayName }}</div>
        <div class="ii-dims" v-if="naturalSize">
          {{ naturalSize.w }}×{{ naturalSize.h }}px
        </div>
      </div>
    </div>

    <!-- ── REPLACE ── -->
    <div class="ii-block">
      <label class="ii-replace-btn">
        <IconZoomReplace stroke={2} />
        Replace image
        <input
          type="file"
          accept="image/*"
          class="hidden"
          @change="onReplaceFile"
        />
      </label>
    </div>

    <!-- ── POSITION & SIZE ── -->
    <div class="ii-block">
      <div class="ii-block-title">Position &amp; size</div>
      <div class="row2">
        <div class="field">
          <label>X</label>
          <input
            type="number"
            :value="Math.round(element.x)"
            @change="patch('x', +($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="field">
          <label>Y</label>
          <input
            type="number"
            :value="Math.round(element.y)"
            @change="patch('y', +($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
      <div class="row2">
        <div class="field">
          <label>W</label>
          <input
            type="number"
            :value="Math.round(element.width)"
            @change="patchSize('width', +($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="field">
          <label>H</label>
          <input
            type="number"
            :value="Math.round(element.height)"
            @change="patchSize('height', +($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <!-- Lock ratio -->
      <label class="lock-row">
        <input type="checkbox" v-model="lockRatio" />
        <span>Lock aspect ratio</span>
      </label>
    </div>

    <!-- ── OBJECT FIT ── -->
    <div class="ii-block">
      <div class="ii-block-title">Object fit</div>
      <div class="fit-row">
        <button
          v-for="fit in fits"
          :key="fit.value"
          class="fit-btn"
          :class="{ 'fit-btn--active': currentFit === fit.value }"
          @click="setFit(fit.value)"
        >
          <component :is="fit.icon" :size="18" />
          <!-- <i :class="`ti ti-${fit.icon}`" aria-hidden="true"></i> -->
          {{ fit.label }}
        </button>
      </div>
    </div>

    <!-- ── OPACITY ── -->
    <div class="ii-block">
      <div class="ii-block-title">Opacity</div>
      <div class="opacity-row">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="opacityPct"
          @input="setOpacity(+($event.target as HTMLInputElement).value)"
        />
        <span class="opacity-val">{{ opacityPct }}%</span>
      </div>
    </div>

    <!-- ── TRANSFORM: Flip ── -->
    <div class="ii-block">
      <div class="ii-block-title">Transform</div>
      <div class="row2">
        <button
          class="action-btn"
          :class="{ 'action-btn--active': flipH }"
          @click="toggleFlipH"
        >
          <IconFlipVertical stroke={2} />
        </button>
        <button
          class="action-btn"
          :class="{ 'action-btn--active': flipV }"
          @click="toggleFlipV"
        >
          <IconFlipHorizontal stroke={2} />
        </button>
      </div>
      <div class="field" style="margin-top: 8px">
        <label>Rotation</label>
        <div class="rotation-row">
          <input
            type="number"
            :value="Math.round(element.rotation ?? 0)"
            @change="patchRotation(+($event.target as HTMLInputElement).value)"
          />
          <span class="rotation-deg">°</span>
        </div>
      </div>
    </div>

    <!-- ── CROP MODE ── -->
    <div class="ii-block">
      <div class="ii-block-title">Crop</div>
      <button
        class="crop-btn"
        :class="{ 'crop-btn--active': isCropping }"
        @click="toggleCrop"
      >
        <i class="ti ti-crop" aria-hidden="true"></i>
        {{ isCropping ? "Exit crop mode" : "Enter crop mode" }}
      </button>
      <p class="crop-hint" v-if="isCropping">
        Drag handles to crop · <strong>Enter</strong> to apply ·
        <strong>Esc</strong> to cancel
      </p>
    </div>

    <!-- ── LAYER ── -->
    <div class="ii-block">
      <div class="ii-block-title">Layer order</div>
      <div class="row2">
        <button class="action-btn" @click="bringToFront">
          <IconSquareChevronsUp stroke={2} />Front
        </button>
        <button class="action-btn" @click="sendToBack">
          <IconSquareChevronsDown stroke={2} />Back
        </button>
      </div>
    </div>

    <!-- ── DELETE ── -->
    <div class="ii-block" style="border-bottom: none">
      <button class="del-btn" @click="removeElement">
        <IconTrashX stroke={2} />
        Remove element
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconFlipVertical, IconFlipHorizontal, IconArrowsMaximize, IconArrowsMinimize, IconAspectRatio, IconZoomReplace, IconSquareChevronsUp, IconSquareChevronsDown, IconTrashX } from '@tabler/icons-vue';
import { computed, ref, watch, onMounted } from "vue";
import { useEditorStore } from "../store/editorStore";
import { createUpdateStyleCommand } from "../core/commands/updateStyle";
import { createResizeCommand } from "../core/commands/resizeImage";
import {
  createBringToFrontCommand,
  createSendToBackCommand,
} from "../core/commands/layer";
import type { ImageElement } from "../types";

const props = defineProps<{
  element: ImageElement;
}>();

const store = useEditorStore();

// ── Natural image size (load once per src) ──
const naturalSize = ref<{ w: number; h: number } | null>(null);
const aspectRatio = ref(1);

watch(
  () => props.element.src,
  async (src) => {
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      naturalSize.value = { w: img.naturalWidth, h: img.naturalHeight };
      aspectRatio.value = img.naturalWidth / img.naturalHeight;
    };
    img.src = src;
  },
  { immediate: true }
);

const displayName = computed(() => {
  const src = props.element.src ?? "";
  return src.startsWith("blob:")
    ? "Uploaded image"
    : src.split("/").pop()?.split("?")[0] ?? "Image";
});

// ── Lock ratio ──
const lockRatio = ref(true);

// ── Patch helpers ──
const patch = (key: string, value: unknown) => {
  const el = props.element;
  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: el.id,
      oldData: { [key]: (el as any)[key] },
      newData: { [key]: value },
    })
  );
};

const patchSize = (axis: "width" | "height", value: number) => {
  const el = props.element;
  const clampedW = Math.max(20, axis === "width" ? value : el.width);
  const clampedH = Math.max(20, axis === "height" ? value : el.height);

  let newW = clampedW;
  let newH = clampedH;

  const currentRatio = el.width / el.height;
  if (lockRatio.value && Number.isFinite(currentRatio) && currentRatio > 0) {
    if (axis === "width") newH = Math.round(newW / currentRatio);
    else newW = Math.round(newH * currentRatio);
  }

  store.executeCommand(
    createResizeCommand(store, {
      id: el.id,
      oldX: el.x,
      oldY: el.y,
      oldWidth: el.width,
      oldHeight: el.height,
      newX: el.x,
      newY: el.y,
      newWidth: newW,
      newHeight: newH,
    })
  );
};

const patchRotation = (deg: number) => {
  patch("rotation", deg);
};

// ── Replace ──
const onReplaceFile = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !props.element) return;

  const src = URL.createObjectURL(file);
  store.updateImageSource(props.element.id, src);
  input.value = "";
};

// ── Object fit ──
const fits = [
  { value: "cover", label: "Cover", icon: IconArrowsMaximize },
  { value: "contain", label: "Contain", icon: IconArrowsMinimize},
  { value: "fill", label: "Fill", icon: IconAspectRatio },
];

const currentFit = computed(
  () => (props.element.style as any)?.objectFit ?? "cover"
);

const setFit = (fit: string) => {
  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: props.element.id,
      oldData: { style: props.element.style },
      newData: { style: { ...props.element.style, objectFit: fit } },
    })
  );
};

// ── Opacity ──
const opacityPct = computed(() =>
  Math.round(((props.element as any).opacity ?? 1) * 100)
);

const setOpacity = (pct: number) => {
  patch("opacity", pct / 100);
};

// ── Flip ──
const flipH = computed(() => !!(props.element as any).flipH);
const flipV = computed(() => !!(props.element as any).flipV);

const toggleFlipH = () => patch("flipH", !flipH.value);
const toggleFlipV = () => patch("flipV", !flipV.value);

// ── Crop ──
const isCropping = ref(false);

const toggleCrop = () => {
  isCropping.value = !isCropping.value;
  // Emit event để ImageElement.vue bắt và hiện crop UI
  // Dùng custom event qua store hoặc provide/inject
  // Đơn giản nhất: lưu vào store.ui
  (store.ui as any).cropElementId = isCropping.value ? props.element.id : null;
};

// Theo dõi nếu user Esc crop từ canvas
watch(
  () => (store.ui as any).cropElementId,
  (id) => {
    if (id !== props.element.id) isCropping.value = false;
  }
);

// ── Layer ──
const bringToFront = () =>
  store.executeCommand(createBringToFrontCommand(store, props.element.id));
const sendToBack = () =>
  store.executeCommand(createSendToBackCommand(store, props.element.id));

// ── Delete ──
const removeElement = () => store.removeElement(props.element.id);
</script>

<style scoped lang="scss">
.img-inspector {
  display: flex;
  flex-direction: column;
}

.hidden {
  display: none;
}

// ── Meta header ──
.ii-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid $cream-dark;
  background: $cream;

  i {
    font-size: 16px;
    color: $text-light;
    flex-shrink: 0;
  }
}

.ii-meta-info {
  min-width: 0;
}

.ii-filename {
  font-size: 12px;
  font-weight: 500;
  color: $text-dark;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ii-dims {
  font-size: 10px;
  color: $text-light;
  margin-top: 1px;
}

// ── Block ──
.ii-block {
  padding: 10px 12px;
  border-bottom: 1px solid $cream-dark;
}

.ii-block-title {
  font-size: 10px;
  font-weight: 500;
  color: $text-light;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

// ── Replace ──
.ii-replace-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  border: 0.5px solid $cream-dark;
  border-radius: $radius-md;
  padding: 8px;
  font-size: 11px;
  color: $text-mid;
  background: $cream;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: $cream-dark;
    color: $text-dark;
  }

  i {
    font-size: 13px;
  }
  input {
    display: none;
  }
}

// ── Grid 2 cols ──
.row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 3px;

  label {
    font-size: 10px;
    color: $text-light;
  }

  input[type="number"] {
    width: 100%;
    border: 0.5px solid $cream-dark;
    border-radius: $radius-md;
    padding: 5px 8px;
    font-size: 12px;
    background: $white;
    color: $text-dark;
    outline: none;

    &:focus {
      border-color: $sage;
    }
  }
}

.lock-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  font-size: 11px;
  color: $text-light;
  cursor: pointer;

  input {
    cursor: pointer;
  }
}

// ── Object fit ──
.fit-row {
  display: flex;
  gap: 4px;
}

.fit-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  border: 0.5px solid $cream-dark;
  border-radius: $radius-md;
  padding: 6px 4px;
  font-size: 10px;
  color: $text-mid;
  background: $cream;
  cursor: pointer;
  transition: all 0.12s;

  i {
    font-size: 14px;
  }

  &:hover {
    background: $cream-dark;
  }

  &--active {
    border-color: $sage;
    background: #eef3e8;
    color: $sage-dark;
    font-weight: 500;
  }
}

// ── Opacity ──
.opacity-row {
  display: flex;
  align-items: center;
  gap: 8px;

  input[type="range"] {
    flex: 1;
  }
}

.opacity-val {
  font-size: 11px;
  font-weight: 500;
  min-width: 32px;
  text-align: right;
  color: $text-dark;
}

// ── Action buttons ──
.action-btn {
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
  transition: all 0.12s;

  i {
    font-size: 13px;
  }

  &:hover {
    background: $cream-dark;
    color: $text-dark;
  }

  &--active {
    border-color: $sage;
    background: #eef3e8;
    color: $sage-dark;
  }
}

// ── Rotation ──
.rotation-row {
  display: flex;
  align-items: center;
  gap: 4px;

  input[type="number"] {
    flex: 1;
    border: 0.5px solid $cream-dark;
    border-radius: $radius-md;
    padding: 5px 8px;
    font-size: 12px;
    background: $white;
    color: $text-dark;
    outline: none;
    &:focus {
      border-color: $sage;
    }
  }
}

.rotation-deg {
  font-size: 11px;
  color: $text-light;
}

// ── Crop ──
.crop-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0.5px solid $sage;
  border-radius: $radius-md;
  padding: 8px;
  font-size: 11px;
  color: $sage-dark;
  background: #eef3e8;
  cursor: pointer;
  transition: all 0.15s;

  i {
    font-size: 13px;
  }

  &:hover {
    background: $sage;
    color: $white;
  }

  &--active {
    background: $sage;
    color: $white;
    border-color: $sage;
  }
}

.crop-hint {
  margin-top: 8px;
  font-size: 10px;
  color: $text-light;
  line-height: 1.5;

  strong {
    color: $text-mid;
    font-weight: 500;
  }
}

// ── Delete ──
.del-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0.5px solid rgba(194, 100, 87, 0.4);
  border-radius: $radius-md;
  padding: 8px;
  font-size: 11px;
  color: #c26457;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;

  i {
    font-size: 13px;
  }

  &:hover {
    background: #fdf1ef;
    border-color: #c26457;
  }
}
</style>
