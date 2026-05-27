<template>
  <div v-if="element && meta" class="uni-ins">
    <!-- Header badge -->
    <!-- <div class="uni-ins__type-row">
      <div class="uni-ins__pill" :style="{ background: meta.color }">
        {{ meta.label }}
      </div>
      <span class="uni-ins__id">{{ element.id }}</span>
    </div> -->

    <!-- Panel riêng của từng type -->
    <component :is="meta.component" :element="element" />

    <!-- Shared sections — bật/tắt theo registry -->
    <PositionSection v-if="meta.shared.position" :element="element" />
    <TransformSection v-if="meta.shared.transform" :element="element" />
    <LayerSection v-if="meta.shared.layer" :element="element" />
    <DeleteSection :element="element" />
  </div>
  <EmptyState v-else />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useEditorStore } from "../store/editorStore";
import { getInspector } from "./registry";
import PositionSection from "./shared/PositionSection.vue";
import TransformSection from "./shared/TransformSection.vue";
import LayerSection from "./shared/LayerSection.vue";
import DeleteSection from "./shared/DeleteSection.vue";
import EmptyState from "./shared/EmptyState.vue";

const store = useEditorStore();
const element = computed(() => store.selectedElement);
const meta = computed(() =>
  element.value ? getInspector(element.value.type) : null
);
</script>