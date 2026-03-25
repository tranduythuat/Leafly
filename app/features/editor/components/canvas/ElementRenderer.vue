<template>
  <component :is="componentType" :element="element" />
</template>

<script setup>
import { computed } from "vue";
import TextElement from "../elements/TextElement.vue";

const props = defineProps(["element"]);

const componentType = computed(() => {
  switch (props.element.type) {
    case "text":
      return TextElement;
  }
});
</script>