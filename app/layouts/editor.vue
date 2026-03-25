<template>
  <div class="editor-layout">
    <EditorNavbar />

    <div class="editor-body">
      <EditorSidebar />

      <!-- Nội dung page -->
      <slot />

      <EditorInspector />
    </div>
  </div>
</template>

<script setup>
import EditorNavbar from '~/features/editor/components/layout/EditorNavbar.vue'
import EditorSidebar from '~/features/editor/components/layout/EditorSidebar.vue'
import EditorInspector from '~/features/editor/components/layout/EditorInspector.vue'
</script>

<style scoped>
.editor-body {
  display: flex;
  height: 100vh;
}
</style>