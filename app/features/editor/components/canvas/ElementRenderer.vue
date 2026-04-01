<template>
  <div class="canvas">
    <component
      v-for="el in store.elements"
      :key="el.id"
      :is="resolveComponent(el)"
      :element="el"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '../../store/editorStore'

import TextElement from '../elements/TextElement.vue'
import ImageElement from '../elements/ImageElement.vue'

const store = useEditorStore()

const resolveComponent = (el) => {
  if (el.type === 'text') return TextElement
  if (el.type === 'image') return ImageElement
}
</script>