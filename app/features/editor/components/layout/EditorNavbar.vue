<template>
  <div class="navbar">
    <button @click="undo">Undo</button>
    <button @click="redo">Redo</button>
  </div>
</template>

<script setup>
import { useEditorStore } from '../../store/editorStore'
const store = useEditorStore()

const undo = () => store.undo()
const redo = () => store.redo()
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