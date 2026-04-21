<template>
  <div class="flex-1 p-4 overflow-y-auto">
    <div class="grid grid-cols-2 gap-4">
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
    { id: "img-1", label: "Photo 1", src: "/img/1.jpg" },
    { id: "img-2", label: "Photo 2", src: "/img/2.jpg" },
    { id: "img-upload", label: "Upload", upload: true },
  ],
};

const items = computed(() => itemsMap[props.type] || []);
</script>
