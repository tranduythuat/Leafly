<template>
  <aside class="editor-inspector">

    <!-- Header -->
    <div class="editor-inspector__header">
      <div>
        <div class="editor-inspector__eyebrow">Inspector</div>
        <h2 class="editor-inspector__title">
          {{ title }}
        </h2>
      </div>
      <button
        v-if="selected"
        class="editor-inspector__clear-btn"
        type="button"
        @click="store.clearSelection()"
        title="Deselect"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Unified panel (handles all element types) -->
    <UnifiedInspector v-if="selected || !activeSection" />

    <!-- Section active, no element selected -->
    <div v-else class="editor-inspector__section-hint">
      <div class="editor-inspector__section-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
      </div>
      <div>
        <div class="editor-inspector__section-name">{{ activeSection?.name }}</div>
        <p class="editor-inspector__section-msg">Click an element on the canvas to edit its properties.</p>
      </div>
    </div>

  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '../store/editorStore'
import UnifiedInspector from '../inspector/UnifiedInspector.vue'
import { getInspector } from '../inspector/registry'

const store = useEditorStore()

const selected      = computed(() => store.selectedElement)
const activeSection = computed(() => store.activeSection)

const title = computed(() => {
  if (selected.value) {
    return getInspector(selected.value.type)?.label ?? selected.value.type
  }
  if (activeSection.value) return activeSection.value.name
  return 'Inspector'
})
</script>

<style scoped lang="scss">
.editor-inspector {
  width: 380px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid $cream-dark;
  background: linear-gradient(180deg, rgba(253,252,249,.98), rgba(250,248,241,.98));
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 11px 14px 10px;
    border-bottom: 1px solid $cream-dark;
    flex-shrink: 0;
  }

  &__eyebrow {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: $text-light;
    margin-bottom: 2px;
  }

  &__title {
    margin: 0;
    font-size: 0.92rem;
    font-weight: 600;
    color: $text-dark;
  }

  &__clear-btn {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid $cream-dark;
    border-radius: $radius-sm;
    background: $white;
    color: $text-light;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s;

    &:hover {
      background: $cream;
      color: $text-dark;
      border-color: $sage-light;
    }
  }

  /* Section hint */
  &__section-hint {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 14px;
    padding: 12px;
    border: 1px solid $cream-dark;
    border-radius: $radius-md;
    background: rgba($white, 0.75);
  }

  &__section-icon {
    width: 36px;
    height: 36px;
    border-radius: $radius-sm;
    background: $cream;
    border: 1px solid $cream-dark;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-light;
    flex-shrink: 0;
  }

  &__section-name {
    font-size: 0.88rem;
    font-weight: 600;
    color: $text-dark;
    margin-bottom: 3px;
  }

  &__section-msg {
    font-size: 0.77rem;
    color: $text-light;
    line-height: 1.5;
    margin: 0;
  }
}
</style>