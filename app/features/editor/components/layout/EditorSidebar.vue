<template>
  <div class="flex h-full w-xs">
    <!-- LEFT ICON BAR -->
    <div class="w-16 border-r flex flex-col py-4 gap-4">
      <button
        v-for="item in tabs"
        :key="item.key"
        @click="active = item.key"
        class="flex flex-col justify-center items-center border-black"
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.label }}
      </button>
    </div>

    <!-- RIGHT PANEL -->
    <EditorSidebarPanel :type="active" />
  </div>
</template>

<script setup>
import { ref } from "vue"
import EditorSidebarPanel from "./EditorSidebarPanel.vue"
import { Type, Image, Music } from '@lucide/vue';

const active = ref("text")

const tabs = [
  { 
    key: "text", 
    label: "Text", 
    icon: Type
  },
  { key: "image", label: "Images", icon: Image },
  { key: "music", label: "Music", icon: Music }
]
</script>

<style lang="scss" scoped>
  .h-full {
    width: 380px;
  }
</style>