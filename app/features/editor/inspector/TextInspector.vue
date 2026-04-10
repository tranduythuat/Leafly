<template>
  <div>
    <h3>Text</h3>

    <!-- Content -->
    <div class="field">
      <label>Content</label>
      <input v-model="local.content" />
    </div>

    <!-- Font size -->
    <div class="field">
      <label>Font Size</label>
      <input type="number" v-model.number="local.fontSize" />
    </div>

    <!-- Color -->
    <div class="field">
      <label>Color</label>
      <input type="color" v-model="local.color" />
    </div>

    <!-- Position -->
    <div class="field">
      <label>X</label>
      <input type="number" v-model.number="local.x" />
    </div>

    <div class="field">
      <label>Y</label>
      <input type="number" v-model.number="local.y" />
    </div>

    <button @click="apply">Apply</button>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import { useEditorStore } from "../store/editorStore";
import { debounce } from '@/features/editor/utils/debounce'
import { createUpdateStyleCommand } from "../core/commands/updateStyle";

// props
const props = defineProps<{
  element: any;
}>();

let isSyncing = false
const store = useEditorStore();

const debouncedApply = debounce(() => {
  apply()
}, 300)

// local state
const local = reactive({
  content: "",
  fontSize: 16,
  color: "#000000",
  x: 0,
  y: 0,
});

// sync khi đổi selection
watch(
  () => {
    const el = props.element
    if (!el) return null

    return {
      id: el.id,
      content: el.content,
      fontSize: el.fontSize,
      color: el.color,
      x: el.x,
      y: el.y,
    }
  },
  (snapshot) => {
    if (!snapshot) return;

    isSyncing = true
    local.content = snapshot.content;
    local.fontSize = snapshot.fontSize || 16;
    local.color = snapshot.color || "#000000";
    local.x = snapshot.x;
    local.y = snapshot.y;
    isSyncing = false
  },
  { immediate: true }
);

watch(local, () => {
    if (isSyncing) return
    debouncedApply()
}, { deep: true })

// apply command
const apply = () => {
  const el = props.element;

  if (!el) return;

  if (
    el.content === local.content &&
    (el.fontSize || 16) === local.fontSize &&
    (el.color || "#000000") === local.color &&
    el.x === local.x &&
    el.y === local.y
  ) {
    return
  }

  const command = createUpdateStyleCommand(store, {
    id: el.id,

    oldData: {
      content: el.content,
      fontSize: el.fontSize,
      color: el.color,
      x: el.x,
      y: el.y,
    },

    newData: {
      content: local.content,
      fontSize: local.fontSize,
      color: local.color,
      x: local.x,
      y: local.y,
    },
  });

  store.executeCommand(command);
};
</script>

<style scoped>
.field {
  margin-bottom: 12px;
}

label {
  display: block;
  font-size: 12px;
  margin-bottom: 4px;
}
</style>
