<template>
  <div class="section-canvas" :style="sectionStyle">
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
import type { EditorElement, Section } from "../../types"

import TextElement from '../elements/TextElement.vue'
import ImageElement from '../elements/ImageElement.vue'

const props = defineProps<{
  section: Section
}>()

const sortedElements = computed(() =>
  [...props.section.elements].sort((a, b) => a.zIndex - b.zIndex)
)

const sectionStyle = computed(() => ({
  position: "relative",
  minHeight: `${props.section.style.minHeight}px`,
  padding: `${props.section.style.padding}px`,
  backgroundColor:
    props.section.style.background.type === "color"
      ? props.section.style.background.value
      : undefined,
  backgroundImage:
    props.section.style.background.type === "image"
      ? `url(${props.section.style.background.value})`
      : undefined,
  backgroundSize: "cover",
  backgroundPosition: "center",
}))

const resolveComponent = (el: EditorElement) => {
  if (el.type === 'text') return TextElement
  if (el.type === 'image') return ImageElement

  return TextElement
}
</script>

<style scoped>
.section-canvas {
  width: min(100%, 720px);
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(54, 64, 45, 0.08);
}
</style>
