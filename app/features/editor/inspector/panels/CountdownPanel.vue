<template>
  <InsSection title="Target">
    <InsField
      type="text"
      label="Target date & time"
      :model-value="local.targetDate"
      placeholder="2025-12-24T18:00"
      @update:model-value="
        local.targetDate = $event;
        sync();
      "
    />
    <InsField
      type="text"
      label="Label"
      :model-value="local.label"
      @update:model-value="
        local.label = $event;
        sync();
      "
    />
  </InsSection>

  <InsSection title="Units shown">
    <InsField
      type="toggle"
      label="Days"
      :model-value="local.showDays"
      @update:model-value="
        local.showDays = $event;
        sync();
      "
    />
    <InsField
      type="toggle"
      label="Hours"
      :model-value="local.showHours"
      @update:model-value="
        local.showHours = $event;
        sync();
      "
    />
    <InsField
      type="toggle"
      label="Minutes"
      :model-value="local.showMinutes"
      @update:model-value="
        local.showMinutes = $event;
        sync();
      "
    />
    <InsField
      type="toggle"
      label="Seconds"
      :model-value="local.showSeconds"
      @update:model-value="
        local.showSeconds = $event;
        sync();
      "
    />
  </InsSection>

  <InsSection title="Style" :default-open="false">
    <div class="cp-row2">
      <InsField
        type="color"
        label="Number color"
        :model-value="local.numberColor"
        @update:model-value="
          local.numberColor = $event;
          sync();
        "
      />
      <InsField
        type="color"
        label="Label color"
        :model-value="local.labelColor"
        @update:model-value="
          local.labelColor = $event;
          sync();
        "
      />
    </div>
    <InsField
      type="color"
      label="Box color"
      :model-value="local.accentColor"
      @update:model-value="
        local.accentColor = $event;
        sync();
      "
    />
    <InsField
      type="select"
      label="Layout"
      :model-value="local.layout"
      :options="[
        { value: 'boxes', label: 'Boxes' },
        { value: 'inline', label: 'Inline' },
        { value: 'circles', label: 'Circles' },
      ]"
      @update:model-value="
        local.layout = $event;
        sync();
      "
    />
    <InsField
      type="range"
      label="Border radius"
      :model-value="local.borderRadius"
      :min="0"
      :max="32"
      suffix="px"
      @update:model-value="
        local.borderRadius = $event;
        sync();
      "
    />
  </InsSection>

  <InsSection title="When finished" :default-open="false">
    <InsField
      type="select"
      label="Behavior"
      :model-value="local.onComplete"
      :options="[
        { value: 'message', label: 'Show message' },
        { value: 'hide', label: 'Hide block' },
      ]"
      @update:model-value="
        local.onComplete = $event;
        sync();
      "
    />
    <InsField
      v-if="local.onComplete === 'message'"
      type="text"
      label="Message"
      :model-value="local.completeMessage"
      @update:model-value="
        local.completeMessage = $event;
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

const local = reactive({
  targetDate: "",
  label: "",
  showDays: true,
  showHours: true,
  showMinutes: true,
  showSeconds: true,
  numberColor: "#36402d",
  labelColor: "#8B7355",
  accentColor: "#eef3e8",
  layout: "boxes",
  borderRadius: 10,
  bgColor: "transparent",
  onComplete: "message",
  completeMessage: "",
});

watch(
  () => props.element,
  (el) => {
    if (!el) return;
    Object.assign(local, {
      targetDate: el.targetDate ?? "",
      label: el.label ?? "",
      showDays: el.showDays ?? true,
      showHours: el.showHours ?? true,
      showMinutes: el.showMinutes ?? true,
      showSeconds: el.showSeconds ?? true,
      numberColor: el.numberColor ?? "#36402d",
      labelColor: el.labelColor ?? "#8B7355",
      accentColor: el.accentColor ?? "#eef3e8",
      layout: el.layout ?? "boxes",
      borderRadius: el.borderRadius ?? 10,
      bgColor: el.bgColor ?? "transparent",
      onComplete: el.onComplete ?? "message",
      completeMessage: el.completeMessage ?? "",
    });
  },
  { immediate: true }
);

const sync = () => {
  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: props.element.id,
      oldData: {
        targetDate: props.element.targetDate,
        label: props.element.label,
        showDays: props.element.showDays,
        showHours: props.element.showHours,
        showMinutes: props.element.showMinutes,
        showSeconds: props.element.showSeconds,
        numberColor: props.element.numberColor,
        labelColor: props.element.labelColor,
        accentColor: props.element.accentColor,
        layout: props.element.layout,
        borderRadius: props.element.borderRadius,
        bgColor: props.element.bgColor,
        onComplete: props.element.onComplete,
        completeMessage: props.element.completeMessage,
      },
      newData: { ...local },
    })
  );
};
</script>

<style scoped lang="scss">
.cp-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
</style>