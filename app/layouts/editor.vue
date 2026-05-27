<template>
  <div class="editor-layout">
    <!-- Navbar: cố định trên cùng -->
    <EditorNavbar class="editor-layout__navbar" />

    <!-- Body: chiếm toàn bộ chiều cao còn lại, KHÔNG scroll -->
    <div class="editor-layout__body">
      <!-- Sidebar: cố định bên trái, tự scroll bên trong nếu nội dung dài -->
      <EditorSidebar class="editor-layout__sidebar" />

      <!-- Stage: chỉ phần này scroll -->
      <main class="editor-layout__stage">
        <slot />
      </main>

      <!-- Inspector: cố định bên phải -->
      <EditorInspector class="editor-layout__inspector" />
    </div>
  </div>
</template>

<script setup lang="ts">
import EditorNavbar from '~/features/editor/components/layout/EditorNavbar.vue'
import EditorSidebar from '~/features/editor/components/layout/EditorSidebar.vue'
// import EditorInspector from '~/features/editor/components/layout/EditorInspector.vue'
import EditorInspector from '~/features/editor/inspector/EditorInspector.vue'
</script>

<style scoped>
/*
  Toàn bộ editor chiếm đúng 100vh, KHÔNG overflow ra ngoài.
  Chỉ .editor-layout__stage (Canvas) mới được scroll.
*/
.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;        /* cố định theo viewport, không dài hơn */
  overflow: hidden;     /* ngăn toàn trang scroll */
  background: #f6f2e9;
}

.editor-layout__navbar {
  flex-shrink: 0;       /* không bị co lại */
}

.editor-layout__body {
  display: flex;
  flex: 1;              /* chiếm toàn bộ chiều cao còn lại sau navbar */
  min-height: 0;        /* quan trọng: cho phép flex children co lại đúng */
  overflow: hidden;
}

.editor-layout__sidebar {
  flex-shrink: 0;
  overflow-y: auto;     /* sidebar tự scroll nếu nội dung dài */
  overflow-x: hidden;
}

.editor-layout__stage {
  flex: 1;
  min-width: 0;
  overflow: auto;       /* CHỈ phần này scroll */
}

.editor-layout__inspector {
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>