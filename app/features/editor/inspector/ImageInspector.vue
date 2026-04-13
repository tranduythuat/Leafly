<template>
  <div v-if="element" class="inspector-form">
    <div class="inspector-form__section">
      <div class="inspector-form__section-title">Image Size</div>

      <div class="field field--row">
        <div>
          <label>Width</label>
          <input type="number" v-model.number="local.width" />
        </div>

        <div>
          <label>Height</label>
          <input type="number" v-model.number="local.height" />
        </div>
      </div>
    </div>

    <div class="inspector-form__section">
      <div class="inspector-form__section-title">Layer</div>

      <div class="field field--actions">
        <button class="ghost-btn" @click="bringToFront">Bring to front</button>
        <button class="ghost-btn" @click="sendToBack">Send to back</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import { useEditorStore } from "../store/editorStore";
import { createResizeCommand } from "../core/commands/resizeImage";
import { debounce } from "../utils/debounce";
import type { ImageElement } from "../types";
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
  element?: ImageElement;
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
  () => {
    const el = props.element
    if (!el) return null

    return {
      id: el.id,
      width: el.width,
      height: el.height,
    }
  },
  (snapshot) => {
    if (!snapshot) return;

    isSyncing = true;

    local.width = snapshot.width;
    local.height = snapshot.height;

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

<style scoped lang="scss">
.inspector-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__section {
    padding: 1rem;
    border: 1px solid #e5dfd3;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.8);
  }

  &__section-title {
    margin-bottom: 0.85rem;
    color: #7e876d;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

.field {
  margin-bottom: 12px;
}

.field--row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.field--actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0;
}

label {
  display: block;
  font-size: 12px;
  margin-bottom: 6px;
  color: #6f7960;
}

input {
  width: 100%;
  border: 1px solid #d8d2c6;
  border-radius: 12px;
  padding: 0.7rem 0.8rem;
  background: #fffdfa;
  color: #36402d;
  box-sizing: border-box;
}

.ghost-btn {
  border: 1px solid #d8d2c6;
  border-radius: 14px;
  background: #fff;
  color: #4d5942;
  padding: 0.8rem 0.9rem;
}
</style>
