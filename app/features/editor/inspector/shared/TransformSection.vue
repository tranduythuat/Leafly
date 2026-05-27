<template>
  <InsSection title="Transform" :default-open="defaultOpen">
    <!-- Rotation -->
    <div class="tf-rotation-row">
      <InsField
        type="number"
        label="Rotation"
        :model-value="Math.round((element as any).rotation ?? 0)"
        unit="°"
        :min="-360"
        :max="360"
        @update:model-value="patch('rotation', $event)"
      />
      <button class="tf-reset-btn" title="Reset rotation" @click="patch('rotation', 0)">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      </button>
    </div>

    <!-- Flip (only when showFlip = true) -->
    <div v-if="showFlip" class="tf-row2">
      <button
        class="tf-btn"
        :class="{ 'tf-btn--active': (element as any).flipH }"
        @click="patch('flipH', !(element as any).flipH)"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"/>
          <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/>
          <path d="M12 20v2M12 14v2M12 8v2M12 2v2"/>
        </svg>
        Flip H
      </button>
      <button
        class="tf-btn"
        :class="{ 'tf-btn--active': (element as any).flipV }"
        @click="patch('flipV', !(element as any).flipV)"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/>
          <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/>
          <path d="M4 12H2M10 12H8M16 12h-2M22 12h-2"/>
        </svg>
        Flip V
      </button>
    </div>

    <!-- Opacity -->
    <div v-if="showOpacity">
      <InsField
        type="range"
        label="Opacity"
        :model-value="opacityPct"
        :min="0" :max="100" :step="1"
        suffix="%"
        @update:model-value="setOpacity($event)"
      />
    </div>
  </InsSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InsSection from './InsSection.vue'
import InsField from './InsField.vue'
import { useEditorStore } from '../../store/editorStore'
import { createUpdateStyleCommand } from '../../core/commands/updateStyle'
import type { CanvasElement } from '../../types'

const props = defineProps<{
  element: CanvasElement
  showFlip?: boolean
  showOpacity?: boolean
  defaultOpen?: boolean
}>()

const store = useEditorStore()

const patch = (key: string, value: unknown) => {
  store.executeCommand(createUpdateStyleCommand(store, {
    id: props.element.id,
    oldData: { [key]: (props.element as any)[key] },
    newData: { [key]: value },
  }))
}

const opacityPct = computed(() =>
  Math.round(((props.element as any).opacity ?? 1) * 100)
)

const setOpacity = (pct: number) => patch('opacity', pct / 100)
</script>

<style scoped lang="scss">
.tf-rotation-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.tf-reset-btn {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  background: $white;
  color: $text-light;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 1px;

  &:hover {
    background: $cream;
    color: $text-dark;
    border-color: $sage-light;
  }
}

.tf-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.tf-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 8px;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  background: $cream;
  color: $text-mid;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.12s;

  &:hover { background: $cream-dark; color: $text-dark; }

  &--active {
    border-color: $sage;
    background: #eef3e8;
    color: $sage-dark;
    font-weight: 600;
  }
}
</style>
