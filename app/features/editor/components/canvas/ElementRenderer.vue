<template>
  <div class="section-canvas" :style="sectionStyle">
    <div class="section-canvas__header">
      <div>
        <div class="section-canvas__eyebrow">{{ section.type }}</div>
        <div class="section-canvas__title">{{ section.name }}</div>
      </div>
      <div class="section-canvas__badge">{{ sortedElements.length }} blocks</div>
    </div>

    <div v-if="!sortedElements.length" class="section-canvas__empty">
      <strong>Empty section</strong>
      <p>Add a text or image block from the left panel to start composing this section.</p>
    </div>

    <component
      v-for="el in sortedElements"
      :key="el.id"
      :is="resolveComponent(el)"
      :element="el"
    />

    <BoundingBox v-if="isActiveSection" :section-id="section.id" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { EditorElement, Section } from "../../types"
import { useEditorStore } from "../../store/editorStore"

import TextElement from '../elements/TextElement.vue'
import ImageElement from '../elements/ImageElement.vue'
import BoundingBox from "./BoundingBox.vue"

const props = defineProps<{
  section: Section
}>()

const store = useEditorStore()

const sortedElements = computed(() =>
  [...props.section.elements].sort((a, b) => a.zIndex - b.zIndex)
)

const isActiveSection = computed(() => store.activeSectionId === props.section.id)

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
  /* border-radius: 24px; */
  box-shadow: 0 12px 40px rgba(54, 64, 45, 0.08);
  /* overflow: hidden; */
}

.section-canvas__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid rgba(123, 143, 98, 0.18);
}

.section-canvas__eyebrow {
  color: #92a07d;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-canvas__title {
  color: #36402d;
  font-size: 1rem;
  font-weight: 600;
}

.section-canvas__badge {
  border: 1px solid #d7d2c7;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  color: #7d846d;
  font-size: 0.76rem;
}

.section-canvas__empty {
  display: grid;
  place-items: center;
  gap: 0.35rem;
  min-height: 220px;
  border: 1px dashed #cfd7c0;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.48);
  color: #728062;
  text-align: center;

  strong {
    color: #4b5840;
    font-size: 1rem;
  }

  p {
    max-width: 360px;
    margin: 0;
    line-height: 1.6;
    font-size: 0.88rem;
  }
}
</style>
