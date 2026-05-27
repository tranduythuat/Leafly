<template>
  <div class="ins-sec">
    <button
      class="ins-sec__header"
      :class="{ 'ins-sec__header--collapsed': !open }"
      type="button"
      @click="open = !open"
    >
      <span class="ins-sec__title">{{ title }}</span>
      <svg
        class="ins-sec__chevron"
        :class="{ 'ins-sec__chevron--up': open }"
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <Transition name="ins-collapse">
      <div v-show="open" class="ins-sec__body">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = withDefaults(defineProps<{ title: string }>(), { defaultOpen: true })
const open = ref(props.defaultOpen !== false);
</script>

<style scoped lang="scss">
.ins-sec {
  border-bottom: 1px solid $cream-dark;
}

.ins-sec__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 14px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba($cream, 0.7);
  }
}

.ins-sec__title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $text-mid;
}

.ins-sec__chevron {
  color: $text-light;
  transition: transform 0.2s ease;
  flex-shrink: 0;

  &--up {
    transform: rotate(180deg);
  }
}

.ins-sec__body {
  padding: 4px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ins-collapse-enter-active,
.ins-collapse-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.ins-collapse-enter-from,
.ins-collapse-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>