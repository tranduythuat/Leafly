<template>
  <InsSection title="Form Fields">
    <div class="fp-fields">
      <div
        v-for="(field, i) in local.fields"
        :key="field.id"
        class="fp-field-block"
      >
        <div class="fp-field-row">
          <select
            :value="field.type"
            class="fp-field-type"
            @change="
              onTypeChange(field, ($event.target as HTMLSelectElement).value)
            "
          >
            <option v-for="ft in fieldTypes" :key="ft.value" :value="ft.value">
              {{ ft.label }}
            </option>
          </select>

          <input
            :value="field.label"
            class="fp-field-label"
            placeholder="Label..."
            @input="
              field.label = ($event.target as HTMLInputElement).value;
              sync();
            "
          />

          <div class="fp-field-actions">
            <button
              class="fp-icon-btn"
              :class="{ 'fp-icon-btn--active': field.required }"
              title="Required"
              @click="
                field.required = !field.required;
                sync();
              "
            >
              *
            </button>
            <button
              class="fp-icon-btn fp-icon-btn--danger"
              title="Remove"
              @click="removeField(i)"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div class="fp-field-border">
          <span class="fp-style-label">Border color</span>
          <div class="fp-color-picker">
            <input
              type="color"
              class="fp-color-input"
              :value="field.borderColor ?? local.borderColor ?? '#4A6B4D'"
              @input="onFieldBorderColorInput(field, $event)"
            />
            <span class="fp-color-value">{{
              field.borderColor ?? local.borderColor ?? "#4A6B4D"
            }}</span>
          </div>
        </div>

        <!-- Display style switch: chỉ cho radio / checkbox -->
        <div
          v-if="field.type === 'radio' || field.type === 'checkbox'"
          class="fp-style-row"
        >
          <span class="fp-style-label">Display as</span>
          <div class="fp-style-btns">
            <button
              class="fp-style-btn"
              :class="{
                'fp-style-btn--active':
                  (field.displayStyle ?? 'default') === 'default',
              }"
              @click="
                field.displayStyle = 'default';
                sync();
              "
            >
              List
            </button>
            <button
              class="fp-style-btn"
              :class="{ 'fp-style-btn--active': field.displayStyle === 'pill' }"
              @click="
                field.displayStyle = 'pill';
                sync();
              "
            >
              Pill buttons
            </button>
          </div>
        </div>

        <!-- Pill customization: radius + layout -->
        <div v-if="field.displayStyle === 'pill'" class="fp-pill-config">
          <!-- Question label -->
          <div class="fp-pill-question">
            <span class="fp-style-label">Title</span>
            <input
              :value="field.pillQuestion"
              class="fp-option-input"
              placeholder="Quý khách có yêu cầu đặc biệt về thức ăn không?"
              @input="
                field.pillQuestion = ($event.target as HTMLInputElement).value;
                sync();
              "
            />
            <div class="fp-style-btns">
              <button
                class="fp-style-btn fp-style-btn--sm"
                :class="{
                  'fp-style-btn--active':
                    (field.pillQuestionAlign ?? 'center') === 'left',
                }"
                @click="
                  field.pillQuestionAlign = 'left';
                  sync();
                "
              >
                Left
              </button>
              <button
                class="fp-style-btn fp-style-btn--sm"
                :class="{
                  'fp-style-btn--active':
                    (field.pillQuestionAlign ?? 'center') === 'center',
                }"
                @click="
                  field.pillQuestionAlign = 'center';
                  sync();
                "
              >
                Center
              </button>
              <button
                class="fp-style-btn fp-style-btn--sm"
                :class="{
                  'fp-style-btn--active': field.pillQuestionAlign === 'right',
                }"
                @click="
                  field.pillQuestionAlign = 'right';
                  sync();
                "
              >
                Right
              </button>
            </div>
          </div>
          <div class="fp-pill-radius">
            <span class="fp-style-label">Radius</span>
            <input
              type="range"
              min="0"
              max="40"
              :value="field.pillRadius ?? 999"
              class="fp-pill-radius-slider"
              @input="onPillRadiusInput(field, $event)"
            />
            <span class="fp-pill-radius-val">{{
              (field.pillRadius ?? 999) >= 40
                ? "Full"
                : (field.pillRadius ?? 999) + "px"
            }}</span>
          </div>

          <!-- Width / Height -->
          <div class="fp-pill-size-row">
            <div class="fp-pill-size-field">
              <span class="fp-style-label">Width</span>
              <div class="fp-pill-width-toggle">
                <button
                  class="fp-style-btn fp-style-btn--sm"
                  :class="{
                    'fp-style-btn--active':
                      (field.pillWidth ?? 'auto') === 'auto',
                  }"
                  @click="
                    field.pillWidth = 'auto';
                    sync();
                  "
                >
                  Auto
                </button>
                <input
                  type="number"
                  min="40"
                  class="fp-pill-num-input"
                  :value="
                    typeof field.pillWidth === 'number' ? field.pillWidth : ''
                  "
                  placeholder="px"
                  @input="onPillWidthInput(field, $event)"
                />
              </div>
            </div>

            <div class="fp-pill-size-field">
              <span class="fp-style-label">Height</span>
              <input
                type="number"
                min="24"
                class="fp-pill-num-input"
                :value="field.pillHeight ?? ''"
                placeholder="auto"
                @input="
                  field.pillHeight = ($event.target as HTMLInputElement).value
                    ? +($event.target as HTMLInputElement).value
                    : undefined;
                  sync();
                "
              />
            </div>
          </div>

          <div class="fp-style-row">
            <span class="fp-style-label">Layout</span>
            <div class="fp-style-btns">
              <button
                class="fp-style-btn"
                :class="{
                  'fp-style-btn--active': (field.pillLayout ?? 'row') === 'row',
                }"
                @click="
                  field.pillLayout = 'row';
                  sync();
                "
                title="Horizontal"
              >
                Row
              </button>
              <button
                class="fp-style-btn"
                :class="{
                  'fp-style-btn--active': field.pillLayout === 'column',
                }"
                @click="
                  field.pillLayout = 'column';
                  sync();
                "
                title="Vertical"
              >
                Column
              </button>
              <button
                class="fp-style-btn"
                :class="{
                  'fp-style-btn--active': field.pillLayout === 'grid2',
                }"
                @click="
                  field.pillLayout = 'grid2';
                  sync();
                "
                title="2-column grid"
              >
                Grid 2
              </button>
            </div>
          </div>

          <!-- Align: chỉ có ý nghĩa với row / column -->
          <div
            v-if="(field.pillLayout ?? 'row') !== 'grid2'"
            class="fp-style-row"
          >
            <span class="fp-style-label">Align</span>
            <div class="fp-style-btns fp-style-btns--wrap">
              <button
                class="fp-style-btn fp-style-btn--sm"
                :class="{
                  'fp-style-btn--active':
                    (field.pillAlign ?? 'left') === 'left',
                }"
                @click="
                  field.pillAlign = 'left';
                  sync();
                "
              >
                Left
              </button>
              <button
                class="fp-style-btn fp-style-btn--sm"
                :class="{
                  'fp-style-btn--active': field.pillAlign === 'center',
                }"
                @click="
                  field.pillAlign = 'center';
                  sync();
                "
              >
                Center
              </button>
              <button
                class="fp-style-btn fp-style-btn--sm"
                :class="{ 'fp-style-btn--active': field.pillAlign === 'right' }"
                @click="
                  field.pillAlign = 'right';
                  sync();
                "
              >
                Right
              </button>
              <button
                class="fp-style-btn fp-style-btn--sm"
                :class="{
                  'fp-style-btn--active': field.pillAlign === 'between',
                }"
                @click="
                  field.pillAlign = 'between';
                  sync();
                "
              >
                Space between
              </button>
            </div>
          </div>
        </div>

        <!-- Options editor -->
        <div v-if="hasOptions(field.type)" class="fp-options">
          <div
            v-for="(opt, oi) in field.options"
            :key="opt.id"
            class="fp-option-row"
          >
            <span class="fp-option-bullet">{{ optionBullet(field.type) }}</span>
            <input
              :value="opt.label"
              class="fp-option-input"
              :placeholder="`Label ${oi + 1}`"
              @input="
                opt.label = ($event.target as HTMLInputElement).value;
                sync();
              "
            />
            <button
              v-if="field.type === 'checkbox' || field.type === 'radio'"
              class="fp-icon-btn"
              :class="{ 'fp-icon-btn--active': opt.defaultChecked }"
              title="Set as default"
              @click="
                opt.defaultChecked = !opt.defaultChecked;
                sync();
              "
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <input
              v-if="field.displayStyle === 'pill'"
              :value="opt.subLabel"
              class="fp-option-input fp-option-input--sub"
              placeholder="Sub label"
              @input="
                opt.subLabel = ($event.target as HTMLInputElement).value;
                sync();
              "
            />
            <button
              class="fp-option-del"
              title="Remove option"
              @click="removeOption(field, oi)"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <button class="fp-option-add" @click="addOption(field)">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add option
          </button>
        </div>
      </div>

      <button class="fp-add-btn" @click="addField">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add field
      </button>
    </div>
  </InsSection>

  <InsSection title="Submit Button">
    <InsField
      type="text"
      label="Button label"
      :model-value="local.submitLabel"
      placeholder="Send RSVP"
      @update:model-value="
        local.submitLabel = $event;
        sync();
      "
    />
    <InsField
      type="color"
      label="Button color"
      :model-value="local.submitColor"
      @update:model-value="
        local.submitColor = $event;
        sync();
      "
    />
  </InsSection>

  <InsSection title="On Submit" :default-open="false">
    <InsField
      type="select"
      label="Action"
      :model-value="local.action"
      :options="actionOptions"
      @update:model-value="
        local.action = $event;
        sync();
      "
    />
    <InsField
      v-if="local.action === 'email'"
      type="text"
      label="Send to email"
      :model-value="local.actionEmail"
      placeholder="you@example.com"
      @update:model-value="
        local.actionEmail = $event;
        sync();
      "
    />
    <InsField
      v-if="local.action === 'redirect'"
      type="text"
      label="Redirect URL"
      :model-value="local.actionUrl"
      placeholder="https://..."
      @update:model-value="
        local.actionUrl = $event;
        sync();
      "
    />
  </InsSection>

  <InsSection title="Appearance" :default-open="false">
    <InsField
      type="color"
      label="Background"
      :model-value="local.bgColor"
      @update:model-value="
        local.bgColor = $event;
        sync();
      "
    />
    <InsField
      type="color"
      label="Border color"
      :model-value="local.borderColor"
      @update:model-value="
        local.borderColor = $event;
        sync();
      "
    />
    <InsField
      type="range"
      label="Border radius"
      :model-value="local.borderRadius"
      :min="0"
      :max="32"
      :step="1"
      suffix="px"
      @update:model-value="
        local.borderRadius = $event;
        sync();
      "
    />
    <InsField
      type="range"
      label="Field spacing"
      :model-value="local.fieldGap"
      :min="4"
      :max="48"
      :step="2"
      suffix="px"
      @update:model-value="
        local.fieldGap = $event;
        sync();
      "
    />
    <InsField
      type="toggle"
      label="Show field labels"
      :model-value="local.showLabels"
      @update:model-value="
        local.showLabels = $event;
        sync();
      "
    />
  </InsSection>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import InsSection from "../shared/InsSection.vue";
import InsField from "../shared/InsField.vue";
import { useEditorStore } from "../../store/editorStore";
import { createUpdateStyleCommand } from "../../core/commands/updateStyle";
import type { CanvasElement } from "../../types";

const props = defineProps<{ element: CanvasElement & { [k: string]: any } }>();
const store = useEditorStore();

const fieldTypes = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
  { value: "number", label: "Number" },
];

const actionOptions = [
  { value: "rsvp", label: "Save as RSVP" },
  { value: "email", label: "Send to email" },
  { value: "redirect", label: "Redirect to URL" },
  { value: "none", label: "Do nothing" },
];

type FieldOption = { id: string; label: string; subLabel?: string };
type Field = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  borderColor?: string;
  options?: FieldOption[];
  displayStyle?: "default" | "pill";
  pillRadius?: number;
  pillLayout?: "row" | "column" | "grid2";
  pillWidth?: number | "auto";
  pillHeight?: number;
  pillAlign?: "left" | "center" | "right" | "between";
  pillQuestion?: string;
  pillQuestionAlign?: "left" | "center" | "right";
};

const OPTION_TYPES = ["select", "radio", "checkbox"];
const hasOptions = (type: string) => OPTION_TYPES.includes(type);

const optionBullet = (type: string) => {
  if (type === "radio") return "○";
  if (type === "checkbox") return "☐";
  return "≡";
};

const local = reactive({
  fields: [] as Field[],
  submitLabel: "Send RSVP",
  submitColor: "#B5694A",
  action: "rsvp",
  actionEmail: "",
  actionUrl: "",
  bgColor: "#ffffff",
  borderColor: "#EDE6D8",
  borderRadius: 8,
  showLabels: true,
  fieldGap: 10,
});

watch(
  () => props.element,
  (el) => {
    if (!el) return;
    local.fields = el.fields ?? [
      { id: uid(), type: "text", label: "Full name", required: true },
      { id: uid(), type: "email", label: "Email", required: true },
    ];
    local.submitLabel = el.submitLabel ?? "Send RSVP";
    local.submitColor = el.submitColor ?? "#B5694A";
    local.action = el.action ?? "rsvp";
    local.actionEmail = el.actionEmail ?? "";
    local.actionUrl = el.actionUrl ?? "";
    local.bgColor = el.bgColor ?? "#ffffff";
    local.borderColor = el.borderColor ?? "#EDE6D8";
    local.borderRadius = el.borderRadius ?? 8;
    local.showLabels = el.showLabels ?? true;
    local.fieldGap = el.fieldGap ?? 10;
  },
  { immediate: true }
);

const uid = () => Math.random().toString(36).slice(2, 8);
const onPillRadiusInput = (field: Field, e: Event) => {
  const val = +(e.target as HTMLInputElement).value;
  field.pillRadius = val >= 40 ? 999 : val;
  sync();
};

const onFieldBorderColorInput = (field: Field, e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  field.borderColor = val;
  sync();
};

const onPillWidthInput = (field: Field, e: Event) => {
  const raw = (e.target as HTMLInputElement).value;
  field.pillWidth = raw ? +raw : "auto";
  sync();
};

const onPillEnabled = (field: Field) => {
  field.displayStyle = "pill";
  if (field.pillRadius === undefined) field.pillRadius = 999;
  if (field.pillLayout === undefined) field.pillLayout = "row";
  if (field.pillWidth === undefined) field.pillWidth = "auto";
  if (field.pillAlign === undefined) field.pillAlign = "left";
  if (!field.options || field.options.length === 0) {
    field.options = [
      { id: uid(), label: "Option 1" },
      { id: uid(), label: "Option 2" },
    ];
  }
  sync();
};

const addField = () => {
  local.fields.push({
    id: uid(),
    type: "text",
    label: "New field",
    required: false,
  });
  sync();
};

const removeField = (i: number) => {
  local.fields.splice(i, 1);
  sync();
};

const onTypeChange = (field: Field, newType: string) => {
  field.type = newType;
  if (hasOptions(newType) && (!field.options || field.options.length === 0)) {
    field.options = [
      { id: uid(), label: "Option 1" },
      { id: uid(), label: "Option 2" },
    ];
  }
  sync();
};

const addOption = (field: Field) => {
  if (!field.options) field.options = [];
  field.options.push({
    id: uid(),
    label: `Option ${field.options.length + 1}`,
  });
  sync();
};

const removeOption = (field: Field, oi: number) => {
  field.options?.splice(oi, 1);
  sync();
};

const sync = () => {
  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: props.element.id,
      oldData: {},
      newData: {
        ...local,
        fields: local.fields.map((f) => ({
          ...f,
          options: f.options ? f.options.map((o) => ({ ...o })) : undefined,
        })),
      },
    })
  );
};
</script>

<style scoped lang="scss">
.fp-fields {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fp-field-block {
  background: $cream;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  padding: 5px 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fp-field-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.fp-field-type {
  font-size: 11px;
  border: none;
  background: $white;
  border-radius: 4px;
  padding: 3px 18px 3px 5px;
  color: $text-dark;
  cursor: pointer;
  outline: none;
  flex-shrink: 0;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238B7355' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 4px center;
  border: 1px solid $cream-dark;
}

.fp-field-label {
  flex: 1;
  font-size: 11px;
  border: none;
  background: transparent;
  color: $text-dark;
  outline: none;
  min-width: 0;

  &::placeholder {
    color: $text-light;
  }
}

.fp-field-actions {
  display: flex;
  gap: 3px;
}

.fp-field-border {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 0 0;
}

.fp-color-picker {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  padding: 3px 8px;
  background: $white;
  cursor: pointer;
  transition: border-color 0.15s;

  &:focus-within {
    border-color: $sage;
  }
}

.fp-color-input {
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  flex-shrink: 0;
}

.fp-color-value {
  font-size: 11px;
  color: $text-mid;
  font-family: "Courier New", monospace;
  letter-spacing: 0.04em;
}

.fp-icon-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid $cream-dark;
  background: $white;
  color: $text-light;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    background: $cream-dark;
    color: $text-dark;
  }
  &--active {
    background: #eef3e8;
    border-color: $sage;
    color: $sage-dark;
  }
  &--danger:hover {
    background: #fdf1ef;
    border-color: #c26457;
    color: #c26457;
  }
}

/* Display style switch */
.fp-style-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 4px;
}

.fp-style-label {
  font-size: 10px;
  color: $text-light;
}

.fp-style-btns {
  display: flex;
  gap: 4px;
}

.fp-style-btn {
  padding: 3px 8px;
  border: 1px solid $cream-dark;
  border-radius: 999px;
  background: $white;
  color: $text-mid;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    background: $cream-dark;
  }
  &--active {
    border-color: $sage;
    background: #eef3e8;
    color: $sage-dark;
    font-weight: 600;
  }
}

/* Options editor */
.fp-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 4px;
  border-left: 2px solid $cream-dark;
  margin-left: 2px;
}

.fp-option-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.fp-option-bullet {
  font-size: 11px;
  color: $text-light;
  width: 12px;
  text-align: center;
  flex-shrink: 0;
}

.fp-option-input {
  flex: 1;
  font-size: 11px;
  border: 1px solid $cream-dark;
  border-radius: 4px;
  padding: 4px 6px;
  background: $white;
  color: $text-dark;
  outline: none;
  min-width: 0;

  &:focus {
    border-color: $sage;
  }

  &--sub {
    color: $text-light;
    font-size: 10px;
  }
}

.fp-option-del {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: $text-light;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: #fdf1ef;
    color: #c26457;
  }
}

.fp-option-add {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border: 1px dashed $sage-light;
  border-radius: 4px;
  background: transparent;
  color: $sage;
  font-size: 10px;
  cursor: pointer;
  width: fit-content;
  transition: all 0.15s;

  &:hover {
    background: #eef3e8;
    border-color: $sage;
  }
}

.fp-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px;
  width: 100%;
  border: 1px dashed $sage-light;
  border-radius: $radius-sm;
  background: transparent;
  color: $sage;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #eef3e8;
    border-color: $sage;
  }
}

.fp-pill-config {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 4px 2px;
  border-top: 1px dashed $cream-dark;
}

.fp-pill-question {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 6px;
  border-bottom: 1px dashed $cream-dark;
}

.fp-pill-radius {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fp-pill-radius-slider {
  flex: 1;
  accent-color: $sage;
  cursor: pointer;
}

.fp-pill-radius-val {
  font-size: 10px;
  color: $text-mid;
  font-weight: 600;
  width: 32px;
  text-align: right;
  flex-shrink: 0;
}

.fp-pill-size-row {
  width: 100%;
  display: flex;
  gap: 8px;
}

.fp-pill-size-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.fp-pill-width-toggle {
  display: flex;
  gap: 4px;
}

.fp-pill-num-input {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  border: 1px solid $cream-dark;
  border-radius: 4px;
  padding: 4px 2px;
  background: $white;
  color: $text-dark;
  outline: none;

  &:focus {
    border-color: $sage;
  }
}

.fp-style-btn--sm {
  padding: 3px 6px;
  font-size: 9px;
}

.fp-style-btns--wrap {
  flex-wrap: wrap;
}
</style>
