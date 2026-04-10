<template>
  <div class="canvas-body">
    <div class="canvas-stack">
      <section
        v-for="section in store.sections"
        :key="section.id"
        class="canvas-section"
        :class="{ 'canvas-section--active': store.activeSectionId === section.id }"
        @click="store.selectSection(section.id)"
      >
        <ElementRenderer :section="section" />
      </section>
    </div>
    <BoundingBox />
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from "../../store/editorStore";
import ElementRenderer from "./ElementRenderer.vue";
import BoundingBox from './BoundingBox.vue'

const store = useEditorStore();
</script>

<style scoped>
.canvas-body {
  flex: 1;
  position: relative;
  background: #f5f5f5;
  overflow: auto;
  padding: 24px;
}

.canvas-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.canvas-section {
  position: relative;
  border: 1px solid transparent;
  border-radius: 16px;
}

.canvas-section--active {
  border-color: #95a87d;
}
</style>
