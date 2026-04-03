<template>
  <div class="canvas" :style="canvasStyle">
    <component
      v-for="el in sortedElements"
      :key="el.id"
      :is="resolveComponent(el)"
      :element="el"
    />
  </div>
</template>

<script setup lang="ts">

import { computed } from "vue";
import { useEditorStore } from '../../store/editorStore'

import TextElement from '../elements/TextElement.vue'
import ImageElement from '../elements/ImageElement.vue'

const store = useEditorStore()

const sortedElements = computed(() => {
  return [...store.elements].sort((a, b) => a.zIndex - b.zIndex)
})

const canvasStyle = computed(() => {
  if (!store.background) return {}

  if (store.background.type === 'color') {
    return {
      backgroundColor: store.background.value
    }
  }

  return {
    backgroundImage: `url(${store.background.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

const resolveComponent = (el) => {
  if (el.type === 'text') return TextElement
  if (el.type === 'image') return ImageElement
}
</script>

<style scoped>
.canvas {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
