<template>
  <div
    class="border rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow"
    @click="add"
  >
    <div class="w-10 h-10 bg-gray-100 rounded mb-2" />
    <span class="text-sm text-center">{{ item.label }}</span>
  </div>
</template>

<script setup>
import { useEditorStore } from "../../store/editorStore";

const props = defineProps({
  item: Object,
});

const store = useEditorStore();

const add = () => {
  store.addSectionFromPreset(props.item.id);
};
</script>