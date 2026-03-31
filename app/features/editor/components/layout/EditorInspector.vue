<template>
  <div class="inspector">
    <template v-if="selected">
      <!-- 👇 render theo type -->
      <TextInspector
        v-if="selected.type === 'text'"
        :element="selected"
      />
    </template>

    <div v-else class="empty">
      No element selected
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEditorStore } from '../../store/editorStore'

// 👇 import inspector theo type
import TextInspector from '../../inspector/TextInspector.vue'

const store = useEditorStore()

const selected = computed(() => {
  if (store.selectedIds.length !== 1) return null

  return store.elements.find(
    e => e.id === store.selectedIds[0]
  )
})
</script>