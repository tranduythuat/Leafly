<template>
  <InsSection title="Style">
    <div class="dp-variant-grid">
      <button
        v-for="v in variants"
        :key="v.value"
        class="dp-variant-btn"
        :class="{ 'dp-variant-btn--active': local.variant === v.value }"
        @click="
          local.variant = v.value;
          sync();
        "
      >
        {{ v.label }}
      </button>
    </div>
  </InsSection>

  <InsSection title="Appearance">
    <InsField
      type="color"
      label="Color"
      :model-value="local.color"
      @update:model-value="
        local.color = $event;
        sync();
      "
    />
    <InsField
      v-if="local.variant !== 'ornament'"
      type="range"
      label="Thickness"
      :model-value="local.thickness"
      :min="1"
      :max="8"
      suffix="px"
      @update:model-value="
        local.thickness = $event;
        sync();
      "
    />
    <InsField
      v-else
      type="range"
      label="Line thickness"
      :model-value="local.thickness"
      :min="1"
      :max="4"
      suffix="px"
      @update:model-value="
        local.thickness = $event;
        sync();
      "
    />
    <InsField
      type="range"
      label="Opacity"
      :model-value="local.opacity"
      :min="10"
      :max="100"
      suffix="%"
      @update:model-value="
        local.opacity = $event;
        sync();
      "
    />
  </InsSection>

  <InsSection v-if="local.variant === 'ornament'" title="Ornament">
    <div class="dp-icon-grid">
      <button
        v-for="icon in ornamentIcons"
        :key="icon"
        class="dp-icon-btn"
        :class="{ 'dp-icon-btn--active': local.ornamentIcon === icon }"
        @click="
          local.ornamentIcon = icon;
          sync();
        "
      >
        {{ icon }}
      </button>
    </div>
    <InsField
      type="text"
      label="Custom icon / emoji"
      :model-value="local.ornamentIcon"
      placeholder="🌿"
      @update:model-value="
        local.ornamentIcon = $event;
        debouncedSync();
      "
    />
    <InsField
      type="range"
      label="Icon size"
      :model-value="local.ornamentSize"
      :min="10"
      :max="40"
      suffix="px"
      @update:model-value="
        local.ornamentSize = $event;
        sync();
      "
    />
  </InsSection>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import InsSection from "../shared/InsSection.vue";
import InsField from "../shared/InsField.vue";
import { useEditorStore } from "../../store/editorStore";
import { createUpdateStyleCommand } from "../../core/commands/updateStyle";
import { debounce } from "../../utils/debounce";
import type { CanvasElement, DividerVariant } from "../../types";

const props = defineProps<{ element: CanvasElement & { [k: string]: any } }>();
const store = useEditorStore();

const variants: { value: DividerVariant; label: string }[] = [
  { value: "line", label: "Line" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
  { value: "wave", label: "Wave" },
  { value: "ornament", label: "Ornament" },
];

const ornamentIcons = ["❖", "✦", "🌿", "🌸", "💐", "🕊️", "♥", "⚜"];

const local = reactive({
  variant: "ornament" as DividerVariant,
  color: "#B5694A",
  thickness: 1,
  ornamentIcon: "❖",
  ornamentSize: 16,
  opacity: 100,
});

let isSyncing = false;

watch(
  () => props.element,
  (el) => {
    if (!el) return;
    isSyncing = true;
    local.variant = el.variant ?? "ornament";
    local.color = el.color ?? "#B5694A";
    local.thickness = el.thickness ?? 1;
    local.ornamentIcon = el.ornamentIcon ?? "❖";
    local.ornamentSize = el.ornamentSize ?? 16;
    local.opacity = el.opacity ?? 100;
    isSyncing = false;
  },
  { immediate: true, deep: true }
);

// oldData lấy từ props.element hiện tại để undo/redo khôi phục đúng giá trị.
const sync = () => {
  if (isSyncing) return;
  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: props.element.id,
      oldData: {
        variant: props.element.variant,
        color: props.element.color,
        thickness: props.element.thickness,
        ornamentIcon: props.element.ornamentIcon,
        ornamentSize: props.element.ornamentSize,
        opacity: props.element.opacity,
      },
      newData: { ...local },
    })
  );
};

const debouncedSync = debounce(sync, 280);
</script>

<style scoped lang="scss">
.dp-variant-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
}

.dp-variant-btn {
  padding: 6px 8px;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  background: $cream;
  color: $text-mid;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    background: $cream-dark;
  }

  &--active {
    border-color: $sage;
    background: #eef3e8;
    color: $sage-dark;
    font-weight: 600;
  }
}

.dp-icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  margin-bottom: 6px;
}

.dp-icon-btn {
  padding: 6px;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  background: $white;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    background: $cream;
  }

  &--active {
    border-color: $sage;
    background: #eef3e8;
  }
}
</style>