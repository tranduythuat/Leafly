<template>
  <div class="canvas-body" @click.self="store.clearSelection()">
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
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from "../../store/editorStore";
import ElementRenderer from "./ElementRenderer.vue";

const store = useEditorStore();
</script>

<style scoped>
.canvas-body {
  flex: 1;
  position: relative;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.85), transparent 30%),
    linear-gradient(180deg, #f7f3eb, #f1ede3);
  overflow: auto;
  padding: .5rem;
}

.canvas-stack {
  display: flex;
  flex-direction: column;
  /* gap: 2rem; */
  max-width: 980px;
  margin: 0 auto;
}

.canvas-section {
  position: relative;
  /* border: 1px solid rgba(120, 138, 101, 0.08); */
  /* border-radius: 24px; */
  /* padding: 1rem; */
  transition: border-color 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.canvas-section--active {
  border-color: #95a87d;
  transform: translateY(-1px);
}
</style>
