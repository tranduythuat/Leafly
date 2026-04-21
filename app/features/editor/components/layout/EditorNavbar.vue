<template>
  <header class="editor-navbar">
    <div class="editor-navbar__brand">
      <div class="editor-navbar__mark">L</div>
      <div>
        <div class="editor-navbar__name">Leafly</div>
        <div class="editor-navbar__meta">Wedding Editor</div>
      </div>
    </div>

    <div class="editor-navbar__history">
      <button class="editor-navbar__icon-btn" type="button" @click="undo">
        Undo
      </button>
      <button class="editor-navbar__icon-btn" type="button" @click="redo">
        Redo
      </button>
    </div>

    <div class="editor-navbar__actions">
      <button class="editor-navbar__ghost-btn" type="button">
        Preview
      </button>
      <button class="editor-navbar__ghost-btn" type="button" @click="onSave">
        Save
      </button>
      <button class="editor-navbar__primary-btn" type="button" @click="onExportHTML">
        Publish
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useEditorStore } from "../../store/editorStore";
import { exportTemplate, generateHTML } from "../../utils/template";

const store = useEditorStore();

const undo = () => store.undo();
const redo = () => store.redo();

const onSave = () => {
  const json = exportTemplate(store);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "template.json";
  a.click();
};

const onExportHTML = () => {
  const html = generateHTML(store);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "template.html";
  a.click();
};
</script>

<style scoped lang="scss">
.editor-navbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e7e2d7;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 248, 241, 0.96));
  backdrop-filter: blur(12px);

  &__brand,
  &__history,
  &__actions {
    display: flex;
    align-items: center;
  }

  &__history {
    justify-content: center;
    gap: 0.5rem;
  }

  &__actions {
    justify-content: flex-end;
    gap: 0.75rem;
  }

  &__brand {
    gap: 0.75rem;
  }

  &__mark {
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 999px;
    background: #6f8560;
    color: #fff;
    font-weight: 700;
  }

  &__name {
    font-size: 1.05rem;
    font-weight: 600;
    color: #36402d;
    line-height: 1.1;
  }

  &__meta {
    font-size: 0.75rem;
    color: #8d947b;
  }

  &__icon-btn,
  &__ghost-btn,
  &__primary-btn {
    border-radius: 12px;
    border: 1px solid #d9d5ca;
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
    transition: 0.2s ease;
  }

  &__icon-btn,
  &__ghost-btn {
    background: #fffdfa;
    color: #4b5840;

    &:hover {
      background: #f5f1e8;
    }
  }

  &__primary-btn {
    background: #7b8f62;
    border-color: #7b8f62;
    color: #fff;

    &:hover {
      background: #6b7e54;
      border-color: #6b7e54;
    }
  }
}
</style>
