<template>
  <div
    ref="elRef"
    :data-id="element.id"
    :style="style"
    @click.stop
    @mousedown.stop="onMouseDown"
  >
    <ElementToolbar
      v-if="isSelected && store.selectedIds.length === 1"
      :element="element"
      :isSelected="isSelected"
    />

    <div class="form-el" :style="formStyle">
      <div
        v-for="field in element.fields"
        :key="field.id"
        class="form-el__field"
      >
        <label v-if="element.showLabels" class="form-el__label">
          {{ field.label }}<span v-if="field.required"> *</span>
        </label>
        <textarea
          v-if="field.type === 'textarea'"
          class="form-el__input form-el__input--area"
          disabled
        />
        <select
          v-else-if="field.type === 'select'"
          class="form-el__input"
          disabled
        >
          <option>{{ field.label }}</option>
        </select>
        <input
          v-else
          class="form-el__input"
          :type="field.type === 'phone' ? 'tel' : field.type"
          disabled
          :placeholder="field.label"
        />
      </div>
      <button
        class="form-el__submit"
        :style="{ background: element.submitColor }"
        disabled
      >
        {{ element.submitLabel }}
      </button>
    </div>

    <div
      v-if="isSelected"
      class="resize-handle tl"
      @mousedown.stop="startResize($event, 'tl')"
    />
    <div
      v-if="isSelected"
      class="resize-handle tr"
      @mousedown.stop="startResize($event, 'tr')"
    />
    <div
      v-if="isSelected"
      class="resize-handle bl"
      @mousedown.stop="startResize($event, 'bl')"
    />
    <div
      v-if="isSelected"
      class="resize-handle br"
      @mousedown.stop="startResize($event, 'br')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject } from "vue";
import { useEditorStore } from "../../store/editorStore";
import { useDragResize } from "../../composables/useDragResize";
import type { ContainerRect, SnapLine } from "../../core/snapEngine";
import type { FormElement as FormElementType } from "../../types";
import ElementToolbar from "./ElementToolbar.vue";

const props = defineProps<{ element: FormElementType }>();
const store = useEditorStore();
const elRef = ref<HTMLElement | null>(null);

const setSnapLines = inject<(lines: SnapLine[]) => void>("setSnapLines");
const getContainerRect = inject<() => ContainerRect>("getContainerRect");

const isSelected = computed(() => store.selectedIds.includes(props.element.id));
const { startDrag, startResize } = useDragResize(
  props.element,
  setSnapLines,
  getContainerRect
);

const onMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return;
  store.select(props.element.id, e.shiftKey);
  startDrag(e);
};

const style = computed(() => ({
  position: "absolute",
  left: props.element.x + "px",
  top: props.element.y + "px",
  width: props.element.width + "px",
  height: props.element.height + "px",
  border: isSelected.value ? "1px solid #6f8560" : "1px solid transparent",
  cursor: isSelected.value ? "move" : "default",
  boxSizing: "border-box",
  overflow: "hidden",
}));

const formStyle = computed(() => ({
  width: "100%",
  height: "100%",
  overflow: "auto",
  background: props.element.bgColor,
  borderRadius: `${props.element.borderRadius}px`,
  padding: "16px",
  boxSizing: "border-box",
  pointerEvents: "none", // canvas: preview-only, không nhập liệu được khi đang edit
}));
</script>

<style scoped lang="scss">
.form-el {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  &__label {
    font-size: 12px;
    color: $text-mid;
  }
  &__input {
    border: 1px solid $cream-dark;
    border-radius: 6px;
    padding: 8px;
    font-size: 13px;
    background: $white;
    &--area {
      min-height: 60px;
    }
  }
  &__submit {
    margin-top: 4px;
    border: none;
    border-radius: 6px;
    padding: 10px;
    color: #fff;
    font-weight: 600;
    font-size: 13px;
  }
}

.resize-handle {
  width: 10px;
  height: 10px;
  background: #4a6b4d;
  position: absolute;
  border-radius: 50%;
  z-index: 3;
}
.resize-handle.tl {
  left: -5px;
  top: -5px;
  cursor: nwse-resize;
}
.resize-handle.tr {
  right: -5px;
  top: -5px;
  cursor: nesw-resize;
}
.resize-handle.bl {
  left: -5px;
  bottom: -5px;
  cursor: nesw-resize;
}
.resize-handle.br {
  right: -5px;
  bottom: -5px;
  cursor: nwse-resize;
}
</style>
