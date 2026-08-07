<template>
  <InsSection title="Content">
    <InsField
      type="text"
      label="Label"
      :model-value="local.label"
      placeholder="Click me"
      @update:model-value="
        local.label = $event;
        sync();
      "
    />

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
      v-if="local.action === 'link'"
      type="text"
      label="URL"
      :model-value="local.url"
      placeholder="https://..."
      @update:model-value="
        local.url = $event;
        sync();
      "
    />
    <InsField
      v-if="local.action === 'link'"
      type="toggle"
      label="Open in new tab"
      :model-value="local.openInNewTab"
      @update:model-value="
        local.openInNewTab = $event;
        sync();
      "
    />

    <div v-if="local.action === 'scroll'" class="ins-field">
      <label>Scroll to section</label>
      <select
        class="bp-select"
        :value="local.sectionTarget"
        @change="local.sectionTarget = ($event.target as HTMLSelectElement).value; sync();"
      >
        <option value="">Select a section...</option>
        <option v-for="s in store.sections" :key="s.id" :value="s.id">
          {{ s.name }}
        </option>
      </select>
    </div>

    <InsField
      v-if="local.action === 'mailto'"
      type="text"
      label="Email"
      :model-value="local.email"
      placeholder="you@example.com"
      @update:model-value="
        local.email = $event;
        sync();
      "
    />

    <InsField
      v-if="local.action === 'tel'"
      type="text"
      label="Phone"
      :model-value="local.phone"
      placeholder="+84..."
      @update:model-value="
        local.phone = $event;
        sync();
      "
    />
  </InsSection>

  <InsSection title="Style" :default-open="false">
    <div class="bp-row2">
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
        label="Text color"
        :model-value="local.textColor"
        @update:model-value="
          local.textColor = $event;
          sync();
        "
      />
    </div>
    <InsField
      type="range"
      label="Border radius"
      :model-value="local.borderRadius"
      :min="0"
      :max="60"
      suffix="px"
      @update:model-value="
        local.borderRadius = $event;
        sync();
      "
    />
    <InsField
      type="number"
      label="Font size"
      :model-value="local.fontSize"
      unit="px"
      @update:model-value="
        local.fontSize = $event;
        sync();
      "
    />
    <InsField
      type="select"
      label="Font weight"
      :model-value="String(local.fontWeight)"
      :options="[
        { value: '400', label: 'Regular' },
        { value: '500', label: 'Medium' },
        { value: '600', label: 'Semibold' },
        { value: '700', label: 'Bold' },
      ]"
      @update:model-value="
        local.fontWeight = +$event;
        sync();
      "
    />
    <InsField
      type="toggle"
      label="Full width"
      :model-value="local.fullWidth"
      @update:model-value="
        local.fullWidth = $event;
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

const actionOptions = [
  { value: "link", label: "Open link" },
  { value: "scroll", label: "Scroll to section" },
  { value: "mailto", label: "Send email" },
  { value: "tel", label: "Call phone" },
];

const local = reactive({
  label: "",
  action: "link",
  url: "",
  sectionTarget: "",
  email: "",
  phone: "",
  openInNewTab: true,
  bgColor: "#B5694A",
  textColor: "#ffffff",
  borderRadius: 999,
  fontSize: 15,
  fontWeight: 600,
  fullWidth: false,
});

watch(
  () => props.element,
  (el) => {
    if (!el) return;
    Object.assign(local, {
      label: el.label ?? "Click me",
      action: el.action ?? "link",
      url: el.url ?? "",
      sectionTarget: el.sectionTarget ?? "",
      email: el.email ?? "",
      phone: el.phone ?? "",
      openInNewTab: el.openInNewTab ?? true,
      bgColor: el.bgColor ?? "#B5694A",
      textColor: el.textColor ?? "#ffffff",
      borderRadius: el.borderRadius ?? 999,
      fontSize: el.fontSize ?? 15,
      fontWeight: el.fontWeight ?? 600,
      fullWidth: el.fullWidth ?? false,
    });
  },
  { immediate: true }
);

const sync = () => {
  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: props.element.id,
      oldData: {
        label: props.element.label,
        action: props.element.action,
        url: props.element.url,
        sectionTarget: props.element.sectionTarget,
        email: props.element.email,
        phone: props.element.phone,
        openInNewTab: props.element.openInNewTab,
        bgColor: props.element.bgColor,
        textColor: props.element.textColor,
        borderRadius: props.element.borderRadius,
        fontSize: props.element.fontSize,
        fontWeight: props.element.fontWeight,
        fullWidth: props.element.fullWidth,
      },
      newData: { ...local },
    })
  );
};
</script>

<style scoped lang="scss">
.bp-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.bp-select {
  width: 100%;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  padding: 5px 8px;
  font-size: 12px;
  background: $white;
  color: $text-dark;
}
</style>