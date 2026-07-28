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
        <label
          v-if="
            element.showLabels &&
            !(field.displayStyle === 'pill' && field.pillQuestion)
          "
          class="form-el__label"
        >
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
          <option v-if="!field.options?.length">{{ field.label }}</option>
          <option v-for="opt in field.options" :key="opt.id">
            {{ opt.label }}
          </option>
        </select>

        <!-- Radio: pill style -->
        <template
          v-else-if="field.type === 'radio' && field.displayStyle === 'pill'"
        >
          <p
            v-if="field.pillQuestion"
            class="form-el__pill-question"
            :style="{ textAlign: field.pillQuestionAlign ?? 'center' }"
          >
            {{ field.pillQuestion }}
          </p>
          <div
            class="form-el__pill-group"
            :class="`form-el__pill-group--${field.pillLayout ?? 'row'}`"
            :style="pillGroupJustify(field)"
          >
            <div
              v-for="(opt, i) in field.options"
              :key="opt.id"
              class="form-el__pill"
              :class="{ 'form-el__pill--active': i === 0 }"
              :style="pillItemStyle(field)"
            >
              <span class="form-el__pill-main">{{ opt.label }}</span>
              <span v-if="opt.subLabel" class="form-el__pill-sub">{{
                opt.subLabel
              }}</span>
            </div>
          </div>
        </template>

        <!-- Radio: default list style -->
        <div v-else-if="field.type === 'radio'" class="form-el__options">
          <label
            v-for="opt in field.options"
            :key="opt.id"
            class="form-el__option"
          >
            <input type="radio" :name="field.id" disabled />
            <span>{{ opt.label }}</span>
          </label>
        </div>

        <!-- Checkbox: pill style -->
        <template
          v-else-if="field.type === 'checkbox' && field.displayStyle === 'pill'"
        >
          <p
            v-if="field.pillQuestion"
            class="form-el__pill-question"
            :style="{ textAlign: field.pillQuestionAlign ?? 'center' }"
          >
            {{ field.pillQuestion }}
          </p>
          <div
            class="form-el__pill-group"
            :class="`form-el__pill-group--${field.pillLayout ?? 'row'}`"
            :style="pillGroupJustify(field)"
          >
            <div
              v-for="opt in field.options"
              :key="opt.id"
              class="form-el__pill"
              :style="pillItemStyle(field)"
            >
              <span class="form-el__pill-main">{{ opt.label }}</span>
              <span v-if="opt.subLabel" class="form-el__pill-sub">{{
                opt.subLabel
              }}</span>
            </div>
          </div>
        </template>

        <!-- Checkbox: default list style -->
        <div v-else-if="field.type === 'checkbox'" class="form-el__options">
          <label
            v-for="opt in field.options"
            :key="opt.id"
            class="form-el__option"
          >
            <input type="checkbox" disabled />
            <span>{{ opt.label }}</span>
          </label>
        </div>

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
import type { FormElement as FormElementType, FormField } from "../../types";
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
  gap: `${props.element.fieldGap ?? 10}px`,
}));

const pillGroupJustify = (field: FormField) => {
  if ((field.pillLayout ?? "row") === "grid2") return {};

  const align = field.pillAlign ?? "left";
  const map: Record<string, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
    between: "space-between",
  };

  return { justifyContent: map[align] ?? "flex-start" };
};

const pillItemStyle = (field: FormField) => {
  const width = field.pillWidth ?? "auto";
  return {
    borderRadius: (field.pillRadius ?? 999) + "px",
    width: width === "auto" ? undefined : width + "px",
    minWidth: width === "auto" ? undefined : width + "px",
    height: field.pillHeight ? field.pillHeight + "px" : undefined,
  };
};
</script>

<style scoped lang="scss">
.form-el {
  display: flex;
  flex-direction: column;

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

  &__options {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: $text-mid;

    input {
      pointer-events: none;
    }
  }

  &__pill-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: $white;
    color: $terracotta;
    min-width: 90px; // fallback khi pillWidth = 'auto', style động sẽ override nếu có width cố định
    text-align: center;
    box-sizing: border-box;
    flex-shrink: 0;

    &--row {
      flex-direction: row;
      flex-wrap: wrap;
    }

    &--column {
      flex-direction: column;
      align-items: stretch;

      .form-el__pill {
        width: 100%;
      }
    }

    &--grid2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      .form-el__pill {
        width: 100%;
        min-width: 0;
      }
    }

    &--active {
      background: $terracotta;
      border-color: $terracotta;
      color: $white;
    }
  }

  &__pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    padding: 10px 22px;
    border: 1.5px solid $olive;
    background: $white;
    color: $olive;
    min-width: 90px;
    text-align: center;
    box-sizing: border-box;

    &--active {
      background: $sage-dark;
      border-color: $sage-dark;
      color: $white;
    }
  }

  &__pill-question {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: $text-dark;
    margin: 0 0 10px;
  }

  &__pill-main {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    // text-transform: uppercase;
  }

  &__pill-sub {
    font-size: 9px;
    opacity: 0.85;
    font-style: italic;
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
