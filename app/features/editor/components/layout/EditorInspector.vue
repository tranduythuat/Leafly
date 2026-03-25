<template>
  <div class="inspector" v-if="selected">
    <input v-model="text" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEditorStore } from '../../store/editorStore'

const store = useEditorStore()

const selected = computed(() =>
  store.elements.find(e => e.id === store.selectedId)
)

const text = computed({
  get: () => selected.value?.content,
  set: (val) => {
    if (!selected.value) return
    store.updateText(selected.value.id, val)
  }
})
</script>