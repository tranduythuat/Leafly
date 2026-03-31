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
  () => props.element,
  (el) => {
    if (!el) return;

    isSyncing = true
    local.content = el.content;
    local.fontSize = el.fontSize || 16;
    local.color = el.color || "#000000";
    local.x = el.x;
    local.y = el.y;
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