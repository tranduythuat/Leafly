<template>
  <div class="sidebar">
    <input type="file" @change="onUpload" />
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from "../../store/editorStore";

const store = useEditorStore();

const onUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  store.addImage(url);
};
</script>