<template>
  <div v-if="box" class="bounding-box" :style="style" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useEditorStore } from "../../store/editorStore";

const store = useEditorStore();

const box = computed(() => {
  const selected = store.elements.filter((e) =>
    store.selectedIds.includes(e.id)
  );

  if (!selected.length) return null;

  const minX = Math.min(...selected.map((e) => e.x));
  const minY = Math.min(...selected.map((e) => e.y));
  const maxX = Math.max(...selected.map((e) => e.x + e.width));
  const maxY = Math.max(...selected.map((e) => e.y + e.height));

  const padding = 5;

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
});

const style = computed(() => ({
  position: "absolute",
  left: box.value?.x + "px",
  top: box.value?.y + "px",
  width: box.value?.width + "px",
  height: box.value?.height + "px",
  border: "1px dashed blue",
  pointerEvents: "none",
}));
</script>

<style scoped>
.bounding-box {
  box-sizing: border-box;
}
</style>