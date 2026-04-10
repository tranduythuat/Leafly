<template>
  <div class="sidebar">
    <input type="file" accept="image/*" @change="onUpload" />
    <input type="file" accept="image/*" @change="onUploadBg" />
    <div class="group-btn">
      <button @click="store.addSection()">Add Section</button>
      <button @click="add('hero', 'Hero')">Hero</button>
      <button @click="add('gallery', 'Gallery')">Gallery</button>
    </div>

    <draggable v-model="sections" item-key="id" class="sections">
      <template #item="{ element }">
        <div
          class="section-item"
          :class="{ 'section-item--active': store.activeSectionId === element.id }"
          @click="store.selectSection(element.id)"
        >
          {{ element.name }}
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";
import { useEditorStore } from "../../store/editorStore";

const store = useEditorStore();
const sections = computed({
  get: () => store.sections,
  set: (value) => store.replaceSections(value)
})

const add = (type: string, name: string) => {
  store.addSectionFromPreset(type, name)
}

const onUpload = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  console.log("url onUpload", url);

  store.addImage(url);
  input.value = "";
};

const onUploadBg = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  console.log("url", url);

  store.setBackground("image", url);
  input.value = "";
};
</script>

<style lang="scss">
.sidebar {
  display: flex;
  flex-direction: column;
  max-width: 200px;
}

.group-btn {
  display: flex;
  gap: 10px;

  button {
    background: green;
    color: white;
    border-radius: 5px;
  }
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.section-item {
  padding: 10px 12px;
  border: 1px solid #d5dbca;
  border-radius: 10px;
  background: #fff;
  cursor: grab;
}

.section-item--active {
  border-color: #95a87d;
  background: #f6f7f4;
}
</style>
