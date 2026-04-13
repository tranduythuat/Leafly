<template>
  <div class="element-toolbar" @click.stop @mousedown.stop>
    <button type="button" @click="duplicate">Duplicate</button>
    <button type="button" @click="bringToFront">Front</button>
    <button type="button" @click="sendToBack">Back</button>
    <template v-if="showAlignment">
      <button type="button" @click="setAlignment('left')">Left</button>
      <button type="button" @click="setAlignment('center')">Center</button>
      <button type="button" @click="setAlignment('right')">Right</button>
    </template>
    <button type="button" class="element-toolbar__danger" @click="remove">
      Delete
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { createBringToFrontCommand, createSendToBackCommand } from "../../core/commands/layer";
import { createUpdateStyleCommand } from "../../core/commands/updateStyle";
import { useEditorStore } from "../../store/editorStore";
import type { Alignment, EditorElement } from "../../types";

const props = defineProps<{
  element: EditorElement
}>()

const store = useEditorStore()

const showAlignment = computed(() => props.element.type === "text")

const duplicate = () => {
  store.duplicateElement(props.element.id)
}

const remove = () => {
  store.removeElement(props.element.id)
}

const bringToFront = () => {
  store.executeCommand(createBringToFrontCommand(store, props.element.id))
}

const sendToBack = () => {
  store.executeCommand(createSendToBackCommand(store, props.element.id))
}

const setAlignment = (alignment: Alignment) => {
  if (props.element.type !== "text" || props.element.alignment === alignment) return

  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: props.element.id,
      oldData: {
        alignment: props.element.alignment,
      },
      newData: {
        alignment,
      },
    })
  )
}
</script>

<style scoped lang="scss">
.element-toolbar {
  position: absolute;
  left: 50%;
  top: -5rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem;
  border: 1px solid #dbd5ca;
  border-radius: 16px;
  background: rgba(255, 253, 248, 0.95);
  box-shadow: 0 10px 24px rgba(54, 64, 45, 0.14);
  transform: translateX(-50%);
  z-index: 30;

  button {
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: #4f5c43;
    padding: 0.45rem 0.65rem;
    font-size: 0.78rem;
    white-space: nowrap;

    &:hover {
      background: #edf2e7;
    }
  }

  &__danger {
    color: #c26457;

    &:hover {
      background: #fdf1ef;
    }
  }
}
</style>
