<!-- app/features/editor/components/canvas/GuideLines.vue -->
<template>
  <svg class="guide-overlay" :style="svgStyle">
    <line
      v-for="(line, i) in lines"
      :key="i"
      v-bind="lineAttrs(line)"
      stroke="#E040FB"
      stroke-width="1"
      stroke-dasharray="4 3"
    />
  </svg>
</template>

<script setup lang="ts">
import type { SnapLine } from "../../core/snapEngine";

defineProps<{
  lines: SnapLine[];
}>();

const svgStyle = {
  position: "absolute",
  inset: "0",
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  zIndex: "50",
  overflow: "visible",
};

const lineAttrs = (line: SnapLine) =>
  line.type === "vertical"
    ? { x1: line.position, y1: line.from, x2: line.position, y2: line.to }
    : { x1: line.from, y1: line.position, x2: line.to, y2: line.position };
</script>