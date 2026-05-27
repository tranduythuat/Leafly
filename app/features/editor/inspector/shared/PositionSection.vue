<template>
  <InsSection title="Position & Size">
    <div class="pos-row2">
      <InsField type="number" label="X" :model-value="Math.round(element.x)" unit="px"
        @update:model-value="patch('x', $event)" />
      <InsField type="number" label="Y" :model-value="Math.round(element.y)" unit="px"
        @update:model-value="patch('y', $event)" />
    </div>

    <div class="pos-row2">
      <InsField type="number" label="W" :model-value="Math.round(element.width)" unit="px"
        @update:model-value="patchSize('width', $event)" />
      <InsField type="number" label="H" :model-value="Math.round(element.height)" unit="px"
        @update:model-value="patchSize('height', $event)" />
    </div>

    <InsField
      v-if="showLockRatio"
      type="toggle"
      label="Lock aspect ratio"
      :model-value="lockRatio"
      @update:model-value="lockRatio = $event"
    />
  </InsSection>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InsSection from './InsSection.vue'
import InsField from './InsField.vue'
import { useEditorStore } from '../../store/editorStore'
import { createUpdateStyleCommand } from '../../core/commands/updateStyle'
import { createResizeCommand } from '../../core/commands/resizeImage'
import type { CanvasElement } from '../../types'

const props = defineProps<{
  element: CanvasElement
  showLockRatio?: boolean
}>()

const store = useEditorStore()
const lockRatio = ref(true)

const patch = (key: string, value: unknown) => {
  store.executeCommand(createUpdateStyleCommand(store, {
    id: props.element.id,
    oldData: { [key]: (props.element as any)[key] },
    newData: { [key]: value },
  }))
}

const patchSize = (axis: 'width' | 'height', value: number) => {
  const el = props.element
  const clamped = Math.max(20, value)

  if (props.showLockRatio && lockRatio.value) {
    const ratio = el.width / el.height
    const newW = axis === 'width' ? clamped : Math.round(clamped * ratio)
    const newH = axis === 'height' ? clamped : Math.round(clamped / ratio)

    store.executeCommand(createResizeCommand(store, {
      id: el.id,
      oldX: el.x, oldY: el.y, oldWidth: el.width, oldHeight: el.height,
      newX: el.x, newY: el.y, newWidth: newW, newHeight: newH,
    }))
  } else {
    patch(axis, clamped)
  }
}
</script>

<style scoped lang="scss">
.pos-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
</style>