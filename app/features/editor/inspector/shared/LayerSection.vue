<template>
  <InsSection title="Layer" :default-open="defaultOpen">
    <div class="layer-row">
      <div class="layer-z-badge" title="Current z-index">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="7" width="16" height="14" rx="2"/><rect x="6" y="3" width="16" height="14" rx="2"/>
        </svg>
        z: {{ (element as any).zIndex ?? 1 }}
      </div>
      <div class="layer-btns">
        <button class="layer-btn" title="Bring to front" @click="bringToFront">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/>
          </svg>
          Front
        </button>
        <button class="layer-btn" title="Bring forward" @click="bringForward">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
          Forward
        </button>
        <button class="layer-btn" title="Send backward" @click="sendBackward">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          Backward
        </button>
        <button class="layer-btn" title="Send to back" @click="sendToBack">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="17 6 12 11 7 6"/><polyline points="17 13 12 18 7 13"/>
          </svg>
          Back
        </button>
      </div>
    </div>
  </InsSection>
</template>

<script setup lang="ts">
import InsSection from './InsSection.vue'
import { useEditorStore } from '../../store/editorStore'
import { createBringToFrontCommand, createSendToBackCommand } from '../../core/commands/layer'
import { createUpdateStyleCommand } from '../../core/commands/updateStyle'
import type { CanvasElement } from '../../types'

const props = defineProps<{ 
  element: CanvasElement, 
  defaultOpen?: boolean 
}>()

const store = useEditorStore()

const bringToFront = () =>
  store.executeCommand(createBringToFrontCommand(store, props.element.id))

const sendToBack = () =>
  store.executeCommand(createSendToBackCommand(store, props.element.id))

const bringForward = () => {
  const el = props.element
  store.executeCommand(createUpdateStyleCommand(store, {
    id: el.id,
    oldData: { zIndex: el.zIndex },
    newData: { zIndex: el.zIndex + 1 },
  }))
}

const sendBackward = () => {
  const el = props.element
  const newZ = Math.max(0, el.zIndex - 1)
  store.executeCommand(createUpdateStyleCommand(store, {
    id: el.id,
    oldData: { zIndex: el.zIndex },
    newData: { zIndex: newZ },
  }))
}
</script>

<style scoped lang="scss">
.layer-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-z-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  background: $cream;
  border: 1px solid $cream-dark;
  border-radius: 999px;
  font-size: 10px;
  color: $text-mid;
  font-weight: 600;
  width: fit-content;
}

.layer-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.layer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
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
    color: $text-dark;
  }
}
</style>