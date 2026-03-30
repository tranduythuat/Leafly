<template>
  <div class="canvas">
    <ElementRenderer v-for="el in elements" :key="el.id" :element="el" />
    <BoundingBox/>
  </div>
</template>

<script setup>
import { useEditorStore } from "../../store/editorStore";
import ElementRenderer from "./ElementRenderer.vue";
import BoundingBox from './BoundingBox.vue'

const store = useEditorStore();
const elements = store.elements;
</script>

<style scoped>
.canvas {
  flex: 1;
  position: relative;
  background: #f5f5f5;
}
</style>