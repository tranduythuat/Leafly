<template>
  <div class="editor-layout">
    <EditorNavbar />
    <div class="editor-body">
      <EditorSidebar />
      <main class="editor-stage">
        <slot />
      </main>
      <EditorInspector />
    </div>
  </div>
</template>

<script setup lang="ts">
import EditorNavbar from '~/features/editor/components/layout/EditorNavbar.vue'
import EditorSidebar from '~/features/editor/components/layout/EditorSidebar.vue'
import EditorInspector from '~/features/editor/components/layout/EditorInspector.vue'
</script>

<style scoped>
.editor-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f6f2e9;
}

.editor-body {
  display: flex;
  min-height: 0;
  flex: 1;
}

.editor-stage {
  min-width: 0;
  flex: 1;
}
</style>
