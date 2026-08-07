<template>
  <InsSection title="Milestones">
    <div class="lp-milestones">
      <div
        v-for="(m, i) in local.milestones"
        :key="m.id"
        class="lp-block"
        draggable="true"
        @dragstart="dragIdx = i"
        @dragover.prevent
        @drop.prevent="reorder(i)"
      >
        <div class="lp-block__head">
          <span class="lp-block__idx">{{ i + 1 }}</span>
          <input
            v-model="m.date"
            class="lp-input lp-input--date"
            placeholder="Ngày (vd: Tháng 3, 2022)"
            @input="sync"
          />
          <button class="lp-del" @click="removeMilestone(i)">
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

        <input
          v-model="m.title"
          class="lp-input"
          placeholder="Tiêu đề"
          @input="sync"
        />
        <textarea
          v-model="m.description"
          class="lp-textarea"
          rows="2"
          placeholder="Mô tả..."
          @input="sync"
        />

        <!-- Image -->
        <div class="lp-img-row">
          <div
            class="lp-img-thumb"
            :style="m.image ? { backgroundImage: `url(${m.image})` } : {}"
          >
            <span v-if="!m.image">No image</span>
          </div>
          <div class="lp-img-actions">
            <label class="lp-img-upload">
              Upload
              <input
                type="file"
                accept="image/*"
                class="lp-hidden"
                @change="onImageUpload(m, $event)"
              />
            </label>
            <button
              v-if="m.image"
              class="lp-img-remove"
              @click="
                m.image = '';
                sync();
              "
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <button class="lp-add-btn" @click="addMilestone">
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
        Add milestone
      </button>
    </div>
  </InsSection>

  <InsSection title="Layout" :default-open="false">
    <div class="lp-style-btns">
      <button
        class="lp-style-btn"
        :class="{ 'lp-style-btn--active': local.layout === 'vertical' }"
        @click="
          local.layout = 'vertical';
          sync();
        "
      >
        Vertical
      </button>
      <button
        class="lp-style-btn"
        :class="{ 'lp-style-btn--active': local.layout === 'alternating' }"
        @click="
          local.layout = 'alternating';
          sync();
        "
      >
        Alternating
      </button>
    </div>
    <InsField
      type="select"
      label="Image ratio"
      :model-value="local.imageRatio"
      :options="[
        { value: 'square', label: 'Square' },
        { value: 'landscape', label: 'Landscape' },
        { value: 'portrait', label: 'Portrait' },
      ]"
      @update:model-value="
        local.imageRatio = $event;
        sync();
      "
    />
    <InsField
      type="range"
      label="Gap between items"
      :model-value="local.itemGap"
      :min="8"
      :max="60"
      suffix="px"
      @update:model-value="
        local.itemGap = $event;
        sync();
      "
    />
  </InsSection>

  <InsSection title="Colors" :default-open="false">
    <div class="lp-row2">
      <InsField
        type="color"
        label="Line"
        :model-value="local.lineColor"
        @update:model-value="
          local.lineColor = $event;
          sync();
        "
      />
      <InsField
        type="color"
        label="Dot"
        :model-value="local.dotColor"
        @update:model-value="
          local.dotColor = $event;
          sync();
        "
      />
    </div>
    <div class="lp-row2">
      <InsField
        type="color"
        label="Date"
        :model-value="local.dateColor"
        @update:model-value="
          local.dateColor = $event;
          sync();
        "
      />
      <InsField
        type="color"
        label="Title"
        :model-value="local.titleColor"
        @update:model-value="
          local.titleColor = $event;
          sync();
        "
      />
    </div>
    <InsField
      type="color"
      label="Description text"
      :model-value="local.textColor"
      @update:model-value="
        local.textColor = $event;
        sync();
      "
    />
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
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import InsSection from "../shared/InsSection.vue";
import InsField from "../shared/InsField.vue";
import { useEditorStore } from "../../store/editorStore";
import { createUpdateStyleCommand } from "../../core/commands/updateStyle";
import type { CanvasElement, StoryMilestone } from "../../types";

const props = defineProps<{ element: CanvasElement & { [k: string]: any } }>();
const store = useEditorStore();
const dragIdx = ref<number | null>(null);

const local = reactive({
  milestones: [] as StoryMilestone[],
  layout: "vertical",
  lineColor: "#DBA98A",
  dotColor: "#B5694A",
  dateColor: "#8B7355",
  titleColor: "#2C2416",
  textColor: "#5C4A32",
  cardBg: "#FFFDF8",
  cardRadius: 12,
  itemGap: 20,
  imageRatio: "landscape",
});

watch(
  () => props.element,
  (el) => {
    if (!el) return;
    local.milestones = el.milestones ?? [];
    local.layout = el.layout ?? "vertical";
    local.lineColor = el.lineColor ?? "#DBA98A";
    local.dotColor = el.dotColor ?? "#B5694A";
    local.dateColor = el.dateColor ?? "#8B7355";
    local.titleColor = el.titleColor ?? "#2C2416";
    local.textColor = el.textColor ?? "#5C4A32";
    local.cardBg = el.cardBg ?? "#FFFDF8";
    local.cardRadius = el.cardRadius ?? 12;
    local.itemGap = el.itemGap ?? 20;
    local.imageRatio = el.imageRatio ?? "landscape";
  },
  { immediate: true }
);

const uid = () => Math.random().toString(36).slice(2, 8);

const addMilestone = () => {
  local.milestones.push({
    id: uid(),
    date: "",
    title: "New milestone",
    description: "",
    image: "",
  });
  sync();
};

const removeMilestone = (i: number) => {
  local.milestones.splice(i, 1);
  sync();
};

const reorder = (toIdx: number) => {
  if (dragIdx.value === null || dragIdx.value === toIdx) return;
  const [item] = local.milestones.splice(dragIdx.value, 1);
  local.milestones.splice(toIdx, 0, item);
  dragIdx.value = null;
  sync();
};

const onImageUpload = (m: StoryMilestone, e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  m.image = URL.createObjectURL(file);
  input.value = "";
  sync();
};

const sync = () => {
  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: props.element.id,
      oldData: {
        milestones: props.element.milestones,
        layout: props.element.layout,
        lineColor: props.element.lineColor,
        dotColor: props.element.dotColor,
        dateColor: props.element.dateColor,
        titleColor: props.element.titleColor,
        textColor: props.element.textColor,
        cardBg: props.element.cardBg,
        cardRadius: props.element.cardRadius,
        itemGap: props.element.itemGap,
        imageRatio: props.element.imageRatio,
      },
      newData: {
        ...local,
        milestones: local.milestones.map((m) => ({ ...m })),
      },
    })
  );
};
</script>

<style scoped lang="scss">
.lp-milestones {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lp-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: $cream;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  padding: 8px;
  cursor: grab;
}

.lp-block__head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.lp-block__idx {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: $sage;
  color: $white;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lp-input,
.lp-input--date {
  flex: 1;
  font-size: 12px;
  border: 1px solid $cream-dark;
  border-radius: 4px;
  padding: 5px 8px;
  background: $white;
  color: $text-dark;
  outline: none;
  min-width: 0;

  &:focus {
    border-color: $sage;
  }
}

.lp-textarea {
  font-size: 12px;
  border: 1px solid $cream-dark;
  border-radius: 4px;
  padding: 6px 8px;
  background: $white;
  color: $text-dark;
  outline: none;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: $sage;
  }
}

.lp-del {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: $text-light;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: #fdf1ef;
    color: #c26457;
  }
}

.lp-img-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lp-img-thumb {
  width: 48px;
  height: 36px;
  border-radius: 4px;
  background: $white center/cover;
  border: 1px solid $cream-dark;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: $text-light;
  flex-shrink: 0;
}

.lp-img-actions {
  display: flex;
  gap: 6px;
}

.lp-img-upload,
.lp-img-remove {
  font-size: 10px;
  padding: 4px 8px;
  border: 1px solid $cream-dark;
  border-radius: 4px;
  background: $white;
  color: $text-mid;
  cursor: pointer;

  &:hover {
    background: $cream-dark;
  }
}

.lp-hidden {
  display: none;
}

.lp-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px;
  border: 1px dashed $sage-light;
  border-radius: $radius-sm;
  background: transparent;
  color: $sage;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: #eef3e8;
    border-color: $sage;
  }
}

.lp-style-btns {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}

.lp-style-btn {
  flex: 1;
  padding: 6px;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  background: $cream;
  color: $text-mid;
  font-size: 11px;
  cursor: pointer;

  &--active {
    border-color: $sage;
    background: #eef3e8;
    color: $sage-dark;
    font-weight: 600;
  }
}

.lp-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
</style>