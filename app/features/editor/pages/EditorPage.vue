<template>
  <div class="editor">
    <EditorNavbar />
    <!-- <div class="editor-body">
      <EditorSidebar />
      <Canvas />
      <EditorInspector />
    </div> -->
  </div>
</template>

<script setup>
import EditorNavbar from "../components/layout/EditorNavbar.vue"; 
// import EditorNavbar from "../components/layout/EditorNavbar.vue";
// console.log('EditorNavbar', EditorNavbar)
// import EditorSidebar from "../components/layout/EditorSidebar.vue";
// import EditorInspector from "../components/layout/EditorInspector.vue";
// import Canvas from "../components/canvas/Canvas.vue";
</script>

<style scope>
.editor-body {
  display: flex;
  height: 100vh;
}
</style>
