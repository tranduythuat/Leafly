<template>
  <div class="canvas-body">
    <ElementRenderer :elements="elements" />
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
.canvas-body {
  flex: 1;
  position: relative;
  background: #f5f5f5;
}
</style>