<template>
  <aside class="editor-inspector">
    <div class="editor-inspector__header">
      <div>
        <div class="editor-inspector__eyebrow">Properties</div>
        <h2 class="editor-inspector__title">
          {{ selected ? "Element Settings" : activeSection ? "Section Settings" : "Inspector" }}
        </h2>
      </div>
      <button class="editor-inspector__clear-btn" type="button" @click="store.clearSelection()">
        Clear
      </button>
    </div>

    <template v-if="selected">
      <div class="editor-inspector__summary">
        <span class="editor-inspector__pill">{{ selected.type }}</span>
        <span class="editor-inspector__meta">ID {{ selected.id }}</span>
      </div>

      <TextInspector v-if="selected.type === 'text'" :element="selected" />
      <ImageInspector v-if="selected.type === 'image'" :element="selected" />
    </template>

    <template v-else-if="activeSection">
      <div class="editor-inspector__summary">
        <span class="editor-inspector__pill">section</span>
        <span class="editor-inspector__meta">{{ activeSection.name }}</span>
      </div>

      <div class="editor-inspector__empty-card">
        <h3>Section selected</h3>
        <p>Choose a block on the canvas to edit typography, colors, and spacing.</p>
      </div>
    </template>

    <div v-else class="editor-inspector__empty-card">
      <h3>Nothing selected</h3>
      <p>Select a section or an element to open its properties.</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useEditorStore } from "../../store/editorStore";
import TextInspector from "../../inspector/TextInspector.vue";
import ImageInspector from "../../inspector/ImageInspector.vue";

const store = useEditorStore();

const selected = computed(() => store.selectedElement);
const activeSection = computed(() => store.activeSection);
</script>

<style scoped lang="scss">
.editor-inspector {
  width: 320px;
  padding: 1rem 1.1rem;
  border-left: 1px solid #ebe5da;
  background:
    linear-gradient(180deg, rgba(253, 252, 249, 0.98), rgba(250, 248, 241, 0.98));
  overflow: auto;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  &__eyebrow {
    color: #8e967e;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__title {
    margin: 0.2rem 0 0;
    color: #36402d;
    font-size: 1.1rem;
    font-weight: 600;
  }

  &__clear-btn {
    border: 1px solid #d8d2c6;
    border-radius: 12px;
    background: #fff;
    color: #546148;
    padding: 0.65rem 0.9rem;
  }

  &__summary {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1rem;
  }

  &__pill {
    border-radius: 999px;
    background: #eef3e8;
    color: #6c8055;
    padding: 0.3rem 0.55rem;
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  &__meta {
    color: #99a089;
    font-size: 0.82rem;
  }

  &__empty-card {
    border: 1px solid #e6dfd3;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.75);
    padding: 1rem;

    h3 {
      margin: 0 0 0.5rem;
      color: #36402d;
      font-size: 1rem;
    }

    p {
      margin: 0;
      color: #87907a;
      line-height: 1.6;
      font-size: 0.9rem;
    }
  }
}
</style>
