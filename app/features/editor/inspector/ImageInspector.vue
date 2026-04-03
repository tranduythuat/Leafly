<template>
  <div v-if="element">
    <h3>Image</h3>

    <div class="field">
      <label>Width</label>
      <input type="number" v-model.number="local.width" />
    </div>

    <div class="field">
      <label>Height</label>
      <input type="number" v-model.number="local.height" />
    </div>

    <div class="field">
      <button @click="bringToFront">Bring to front</button>
      <button @click="sendToBack">Send to back</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import { useEditorStore } from "../store/editorStore";
import { createResizeCommand } from "../core/commands/resizeImage";
import { debounce } from "../utils/debounce";
import {
  createBringToFrontCommand,
  createSendToBackCommand
} from '../core/commands/layer'

const bringToFront = () => {
  if (!props.element) return

  const cmd = createBringToFrontCommand(store, props.element.id)
  store.executeCommand(cmd)
}

const sendToBack = () => {
  if (!props.element) return

  const cmd = createSendToBackCommand(store, props.element.id)
  store.executeCommand(cmd)
}

const props = defineProps<{
  element?: any;
}>();

const store = useEditorStore();

// 👉 local state
const local = reactive({
  width: 0,
  height: 0,
});

// 👉 tránh loop
let isSyncing = false;

// 👉 sync từ store → local
watch(
  () => props.element,
  (el) => {
    if (!el) return;

    isSyncing = true;

    local.width = el.width;
    local.height = el.height;

    isSyncing = false;
  },
  { immediate: true }
);

// 👉 apply command
const apply = () => {
  const el = props.element;
  if (!el) return;

  // ❗ tránh command rác
  if (el.width === local.width && el.height === local.height) {
    return;
  }

  const command = createResizeCommand(store, {
    id: el.id,
    oldWidth: el.width,
    oldHeight: el.height,
    newWidth: local.width,
    newHeight: local.height,
  });

  store.executeCommand(command);
};

// 👉 debounce để UX mượt
const debouncedApply = debounce(apply, 300);

// 👉 local → store
watch(
  local,
  () => {
    if (isSyncing) return;
    debouncedApply();
  },
  { deep: true }
);
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