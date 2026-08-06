<template>
  <InsSection title="Content">
    <InsField
      type="textarea"
      label="QR data (URL / text)"
      :model-value="local.data"
      placeholder="https://leafly.app/rsvp/your-slug"
      :rows="2"
      @update:model-value="
        local.data = $event;
        debouncedSync();
      "
    />
    <InsField
      type="toggle"
      label="Show caption"
      :model-value="local.showLabel"
      @update:model-value="
        local.showLabel = $event;
        sync();
      "
    />
    <InsField
      v-if="local.showLabel"
      type="text"
      label="Caption"
      :model-value="local.label"
      placeholder="Quét để xác nhận tham dự"
      @update:model-value="
        local.label = $event;
        debouncedSync();
      "
    />
  </InsSection>

  <InsSection title="Appearance" :default-open="false">
    <div class="qp-row2">
      <InsField
        type="color"
        label="QR color"
        :model-value="local.fgColor"
        @update:model-value="
          local.fgColor = $event;
          sync();
        "
      />
      <InsField
        type="color"
        label="Background"
        :model-value="local.bgColor"
        @update:model-value="
          local.bgColor = $event;
          sync();
        "
      />
    </div>
    <InsField
      type="color"
      label="Card background"
      :model-value="local.cardBg"
      @update:model-value="
        local.cardBg = $event;
        sync();
      "
    />
    <InsField
      v-if="local.showLabel"
      type="color"
      label="Caption color"
      :model-value="local.labelColor"
      @update:model-value="
        local.labelColor = $event;
        sync();
      "
    />
    <InsField
      type="range"
      label="Card radius"
      :model-value="local.cardRadius"
      :min="0"
      :max="32"
      suffix="px"
      @update:model-value="
        local.cardRadius = $event;
        sync();
      "
    />
  </InsSection>

  <InsSection title="Scan reliability" :default-open="false">
    <InsField
      type="select"
      label="Error correction"
      :model-value="local.errorCorrection"
      :options="[
        { value: 'L', label: 'Low (7%)' },
        { value: 'M', label: 'Medium (15%)' },
        { value: 'Q', label: 'Quartile (25%)' },
        { value: 'H', label: 'High (30%)' },
      ]"
      @update:model-value="
        local.errorCorrection = $event;
        sync();
      "
    />
    <InsField
      type="number"
      label="Quiet margin"
      :model-value="local.margin"
      :min="0"
      :max="8"
      unit="modules"
      @update:model-value="
        local.margin = $event;
        sync();
      "
    />
    <p class="qp-hint">
      Mức lỗi cao hơn giúp QR vẫn quét được khi in nhỏ hoặc dán logo đè lên,
      nhưng làm mã dày đặc hơn.
    </p>
  </InsSection>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import InsSection from "../shared/InsSection.vue";
import InsField from "../shared/InsField.vue";
import { useEditorStore } from "../../store/editorStore";
import { createUpdateStyleCommand } from "../../core/commands/updateStyle";
import { debounce } from "../../utils/debounce";
import type { CanvasElement } from "../../types";

const props = defineProps<{ element: CanvasElement & { [k: string]: any } }>();
const store = useEditorStore();

const local = reactive({
  data: "",
  label: "",
  fgColor: "#36402d",
  bgColor: "#ffffff",
  errorCorrection: "M" as "L" | "M" | "Q" | "H",
  margin: 2,
  cardBg: "#ffffff",
  cardRadius: 12,
  labelColor: "#8B7355",
  showLabel: true,
});

let isSyncing = false;

watch(
  () => props.element,
  (el) => {
    if (!el) return;
    isSyncing = true;
    local.data = el.data ?? "";
    local.label = el.label ?? "";
    local.fgColor = el.fgColor ?? "#36402d";
    local.bgColor = el.bgColor ?? "#ffffff";
    local.errorCorrection = el.errorCorrection ?? "M";
    local.margin = el.margin ?? 2;
    local.cardBg = el.cardBg ?? "#ffffff";
    local.cardRadius = el.cardRadius ?? 12;
    local.labelColor = el.labelColor ?? "#8B7355";
    local.showLabel = el.showLabel ?? true;
    isSyncing = false;
  },
  { immediate: true, deep: true }
);

// sync() tạo 1 UpdateStyleCommand mỗi lần gọi -> mỗi lần gọi là 1 bước undo riêng biệt.
// Với các field gõ tự do (data, label) ta debounce để không tạo hàng chục bước undo/ký tự gõ.
const sync = () => {
  if (isSyncing) return;
  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: props.element.id,
      oldData: {
        data: props.element.data,
        label: props.element.label,
        fgColor: props.element.fgColor,
        bgColor: props.element.bgColor,
        errorCorrection: props.element.errorCorrection,
        margin: props.element.margin,
        cardBg: props.element.cardBg,
        cardRadius: props.element.cardRadius,
        labelColor: props.element.labelColor,
        showLabel: props.element.showLabel,
      },
      newData: { ...local },
    })
  );
};

const debouncedSync = debounce(sync, 280);
</script>

<style scoped lang="scss">
.qp-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.qp-hint {
  font-size: 10px;
  color: $text-light;
  line-height: 1.5;
  margin: 4px 0 0;
}
</style>