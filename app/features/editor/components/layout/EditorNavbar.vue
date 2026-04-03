<template>
  <div class="navbar">
    <button @click="undo">Undo</button>
    <button @click="redo">Redo</button>
    <button @click="onSave">Save</button>
    <button @click="onExportHTML">Export HTML</button>
  </div>
</template>

<script setup>
import { useEditorStore } from "../../store/editorStore";
import { exportTemplate, generateHTML } from "../../utils/template";

const store = useEditorStore();

const undo = () => store.undo();
const redo = () => store.redo();

const onSave = () => {
  const json = exportTemplate(store);

  console.log("TEMPLATE JSON:", json);

  // 👉 tạm: download file
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "template.json";
  a.click();
};

const onExportHTML = () => {
  const html = generateHTML(store);

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "template.html";
  a.click();
};
</script>

<style lang="scss">
.navbar {
  display: flex;
  gap: 10px;
  button {
    background: red;
    display: block;
    padding: 10px;
  }
}
</style>