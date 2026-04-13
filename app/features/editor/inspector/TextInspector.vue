<template>
  <div class="inspector-form">
    <div class="inspector-form__section">
      <div class="inspector-form__section-title">Typography</div>

      <div class="field">
        <label>Content</label>
        <input v-model="local.content" />
      </div>

      <div class="field">
        <label>Font Size</label>
        <input type="number" v-model.number="local.fontSize" />
      </div>

      <div class="field">
        <label>Color</label>
        <input type="color" v-model="local.color" />
      </div>
    </div>

    <div class="inspector-form__section">
      <div class="inspector-form__section-title">Layout</div>

      <div class="field field--row">
        <div>
          <label>X</label>
          <input type="number" v-model.number="local.x" />
        </div>
        <div>
          <label>Y</label>
          <input type="number" v-model.number="local.y" />
        </div>
      </div>
    </div>

    <button class="apply-btn" @click="apply">Apply</button>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import { useEditorStore } from "../store/editorStore";
import { debounce } from '@/features/editor/utils/debounce'
import { createUpdateStyleCommand } from "../core/commands/updateStyle";
import type { TextElement } from "../types";

// props
const props = defineProps<{
  element: TextElement;
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

.apply-btn {
  border: 1px solid #7b8f62;
  border-radius: 14px;
  background: #7b8f62;
  color: #fff;
  padding: 0.85rem 1rem;
}
</style>
