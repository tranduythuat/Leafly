<template>
  <div class="del-zone">
    <button
      class="del-btn"
      @click="confirm ? removeElement() : (confirm = true)"
      @blur="confirm = false"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
      </svg>
      {{ confirm ? "Click again to confirm" : "Remove element" }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useEditorStore } from "../../store/editorStore";
import type { CanvasElement } from "../../types";

const props = defineProps<{ element: CanvasElement }>();
const store = useEditorStore();
const confirm = ref(false);

const removeElement = () => {
  store.removeElement(props.element.id);
  confirm.value = false;
};
</script>

<style scoped lang="scss">
.del-zone {
  padding: 10px 14px 14px;
}

.del-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px;
  border: 1px solid rgba(194, 100, 87, 0.3);
  border-radius: $radius-sm;
  background: transparent;
  color: #c26457;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #fdf1ef;
    border-color: #c26457;
  }
}
</style>