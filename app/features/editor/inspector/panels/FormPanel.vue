<template>
  <!-- Fields builder -->
  <InsSection title="Form Fields">
    <div class="fp-fields">
      <div
        v-for="(field, i) in local.fields"
        :key="field.id"
        class="fp-field-row"
      >
        <select
          :value="field.type"
          class="fp-field-type"
          @change="field.type = ($event.target as HTMLSelectElement).value; sync()"
        >
          <option v-for="ft in fieldTypes" :key="ft.value" :value="ft.value">
            {{ ft.label }}
          </option>
        </select>

        <input
          :value="field.label"
          class="fp-field-label"
          placeholder="Label..."
          @input="field.label = ($event.target as HTMLInputElement).value; sync()"
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

  <!-- Submit button -->
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

  <!-- Delivery -->
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

  <!-- Style -->
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

const local = reactive({
  fields: [] as {
    id: string;
    type: string;
    label: string;
    required: boolean;
  }[],
  submitLabel: "Send RSVP",
  submitColor: "#6B8C6E",
  action: "rsvp",
  actionEmail: "",
  actionUrl: "",
  bgColor: "#ffffff",
  borderRadius: 8,
  showLabels: true,
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
    local.submitColor = el.submitColor ?? "#6B8C6E";
    local.action = el.action ?? "rsvp";
    local.actionEmail = el.actionEmail ?? "";
    local.actionUrl = el.actionUrl ?? "";
    local.bgColor = el.bgColor ?? "#ffffff";
    local.borderRadius = el.borderRadius ?? 8;
    local.showLabels = el.showLabels ?? true;
  },
  { immediate: true }
);

const uid = () => Math.random().toString(36).slice(2, 8);

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

const sync = () => {
  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: props.element.id,
      oldData: {},
      newData: { ...local, fields: local.fields.map((f) => ({ ...f })) },
    })
  );
};
</script>

<style scoped lang="scss">
.fp-fields {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fp-field-row {
  display: flex;
  align-items: center;
  gap: 5px;
  background: $cream;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  padding: 5px 6px;
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
</style>