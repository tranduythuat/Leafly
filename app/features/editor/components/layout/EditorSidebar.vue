<template>
  <div class="sidebar">
    <input type="file" accept="image/*" @change="onUpload" />
    <input type="file" accept="image/*" @change="onUploadBg" />
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from "../../store/editorStore";

const store = useEditorStore();

const onUpload = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  console.log('url onUpload', url);


  store.addImage(url);
  input.value = "";
};

const onUploadBg = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const url = URL.createObjectURL(file)

  console.log('url', url);
  

  store.setBackground('image', url)
  input.value = ""
}

</script>

<style lang="scss">
  .sidebar {
    display: flex;
    flex-direction: column;
    max-width: 200px;
  }
</style>
