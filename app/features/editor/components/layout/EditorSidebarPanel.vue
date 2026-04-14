<template>
  <div class="flex-1 p-4 overflow-y-auto">
    <div class="grid grid-cols-2 gap-4">
      <SidebarItem v-for="item in items" :key="item.id" :item="item" />
    </div>
  </div>
</template>

<script setup>
import SidebarItem from "./EditorSidebarItem.vue";

const props = defineProps({
  type: String,
});

const itemsMap = {
  text: [
    { id: "heading", label: "Heading" },
    { id: "paragraph", label: "Paragraph" },
    { id: "quote", label: "Quote" },
  ],
  image: [
    { id: "gallery", label: "Album ảnh" },
    { id: "hero", label: "Hero image" },
  ],
};

const items = computed(() => itemsMap[props.type] || []);
</script>