<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
    </div>
    <p class="empty-state__text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ text?: string }>(), {
  text: 'Select an element to edit its properties',
})
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100%;
  min-height: 180px;
  padding: 2rem;
  text-align: center;
}

.empty-state__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: $cream;
  border: 1px solid $cream-dark;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-light;
}

.empty-state__text {
  font-size: 0.82rem;
  color: $text-light;
  line-height: 1.6;
  margin: 0;
  max-width: 180px;
}
</style>