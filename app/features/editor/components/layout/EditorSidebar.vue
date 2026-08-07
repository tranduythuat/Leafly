<template>
  <div class="flex h-full w-xs">
    <!-- LEFT ICON BAR -->
    <div class="w-16 border-r flex flex-col py-4 gap-4">
      <button
        v-for="item in tabs"
        :key="item.key"
        @click="active = item.key"
        :class="[
          'flex flex-col justify-center items-center border-black transition-colors',
          active === item.key
            ? 'active-icon-bar'
            : 'text-gray-400 hover:text-gray-600',
        ]"
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
import { ref } from "vue";
import EditorSidebarPanel from "./EditorSidebarPanel.vue";
import { Type, Image, LayoutGrid, Music } from "@lucide/vue";

const active = ref("text");

const tabs = [
  {
    key: "text",
    label: "Text",
    icon: Type,
  },
  { key: "image", label: "Images", icon: Image },
  { key: "blocks", label: "Blocks", icon: LayoutGrid },
  { key: "music", label: "Music", icon: Music },
];
</script>

<style lang="scss" scoped>
.h-full {
  width: 380px;
}
.active-icon-bar {
  color: $sage;
  border-right: 2px solid $sage;
  // border-radius: $radius-sm;
  padding: 2px;
}
</style>
