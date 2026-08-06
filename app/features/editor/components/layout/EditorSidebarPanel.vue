<template>
  <div class="flex-1 p-3 overflow-y-auto">
    <ImagePanel v-if="type === 'image'" />
    <MusicPanel v-else-if="type === 'music'" />
    <BlocksPanel v-else-if="type === 'blocks'" />
    <div v-else class="grid grid-cols-2 gap-4">
      <SidebarItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :type="type"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SidebarItem from "./EditorSidebarItem.vue";
import ImagePanel from "./panel/ImagePanel.vue";
import BlocksPanel from "./panel/BlocksPanel.vue";
import MusicPanel from "./panel/MusicPanel.vue"; // 🎵 NEW

const props = defineProps({
  type: String,
});

const itemsMap = {
  text: [
    { id: "heading", label: "Heading" },
    { id: "paragraph", label: "Paragraph" },
    { id: "quote", label: "Quote" },
  ],
};

const items = computed(() => itemsMap[props.type] || []);
</script>