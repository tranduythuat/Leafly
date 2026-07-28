<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="toolbarRef"
      class="ms-toolbar"
      :style="toolbarStyle"
      @click.stop
      @mousedown.stop
    >
      <div class="ms-toolbar__group">
        <button
          type="button"
          @pointerdown.stop
          @click.prevent.stop="align('left')"
          title="Align left"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="12" y2="12" />
            <line x1="3" y1="18" x2="18" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          @pointerdown.stop
          @click.prevent.stop="align('center')"
          title="Align center"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="6" y1="6" x2="18" y2="6" />
            <line x1="12" y1="6" x2="12" y2="18" />
            <line x1="6" y1="18" x2="18" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          @pointerdown.stop
          @click.prevent.stop="align('right')"
          title="Align right"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="12" y1="12" x2="21" y2="12" />
            <line x1="6" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          @pointerdown.stop
          @click.prevent.stop="align('top')"
          title="Align top"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="6" y1="3" x2="6" y2="21" />
            <line x1="12" y1="3" x2="12" y2="12" />
            <line x1="18" y1="3" x2="18" y2="15" />
          </svg>
        </button>
        <button
          type="button"
          @pointerdown.stop
          @click.prevent.stop="align('distributeHorizontal')"
          title="Distribute horizontal spacing"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="4" y1="4" x2="4" y2="20" />
            <line x1="20" y1="4" x2="20" y2="20" />
            <rect x="6" y="9" width="3" height="6" rx="0.5" />
            <rect x="11" y="9" width="3" height="6" rx="0.5" />
            <rect x="16" y="9" width="3" height="6" rx="0.5" />
          </svg>
        </button>
        <button
          type="button"
          @pointerdown.stop
          @click.prevent.stop="align('distributeVertical')"
          title="Distribute vertical spacing"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="4" y1="4" x2="20" y2="4" />
            <line x1="4" y1="20" x2="20" y2="20" />
            <rect x="9" y="6" width="6" height="3" rx="0.5" />
            <rect x="9" y="11" width="6" height="3" rx="0.5" />
            <rect x="9" y="16" width="6" height="3" rx="0.5" />
          </svg>
        </button>
      </div>

      <div class="ms-toolbar__divider" />

      <div class="ms-toolbar__group">
        <button
          type="button"
          @pointerdown.stop
          @click.prevent.stop="group"
          title="Group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
        <button
          type="button"
          @pointerdown.stop
          @click.prevent.stop="ungroup"
          title="Ungroup"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect
              x="3"
              y="3"
              width="7"
              height="7"
              rx="1"
              stroke-dasharray="3 2"
            />
            <rect
              x="14"
              y="14"
              width="7"
              height="7"
              rx="1"
              stroke-dasharray="3 2"
            />
            <line x1="14" y1="6" x2="21" y2="6" />
            <line x1="6" y1="14" x2="6" y2="21" />
          </svg>
        </button>
      </div>

      <div class="ms-toolbar__divider" />

      <div class="ms-toolbar__group">
        <button
          type="button"
          @pointerdown.stop
          @click.prevent.stop="duplicateSelected"
          title="Duplicate"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path
              d="M5 15H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"
            />
          </svg>
        </button>
        <button
          type="button"
          class="ms-toolbar__danger"
          @pointerdown.stop
          @click.prevent.stop="deleteSelected"
          title="Delete"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="3 6 5 6 21 6" />
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { nextTick } from "vue";
import { useEditorStore } from "../../store/editorStore";

const props = defineProps<{
  sectionId: string;
}>();

const store = useEditorStore();

const visible = computed(() => {
  return (
    store.activeSectionId === props.sectionId && store.selectedIds.length >= 2
  );
});

const toolbarPos = ref({ x: 0, y: 0 });
const toolbarRef = ref<HTMLElement | null>(null);
const hasMeasured = ref(false);

const schedulePositionUpdate = async () => {
  await nextTick();
  requestAnimationFrame(() => {
    updatePosition();
    requestAnimationFrame(updatePosition);
  });
};

const updatePosition = () => {
  if (!visible.value) {
    hasMeasured.value = false;
    return;
  }

  const selected = store.activeSectionSelectedElements;
  if (!selected.length) {
    hasMeasured.value = false;
    return;
  }

  const minX = Math.min(...selected.map((e) => e.x));
  const minY = Math.min(...selected.map((e) => e.y));
  const maxX = Math.max(...selected.map((e) => e.x + e.width));
  const maxY = Math.max(...selected.map((e) => e.y + e.height));

  const rect = {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };

  const toolbarEl = toolbarRef.value;
  if (!toolbarEl) {
    hasMeasured.value = false;
    return;
  }

  const toolbarRect = toolbarEl.getBoundingClientRect();
  const sectionEl = document.querySelector(
    `[data-section-id="${props.sectionId}"]`
  ) as HTMLElement | null;
  const sectionRect = sectionEl?.getBoundingClientRect() ?? { left: 0, top: 0 };

  const centerX = sectionRect.left + rect.x + rect.width / 2;
  const topY = sectionRect.top + rect.y - 12;

  const minXPos = toolbarRect.width / 2 + 8;
  const maxXPos = window.innerWidth - toolbarRect.width / 2 - 8;
  const x = Math.max(minXPos, Math.min(centerX, maxXPos));
  const y = Math.max(8, topY);

  toolbarPos.value = { x, y };
  hasMeasured.value = true;
};

const toolbarStyle = computed(() => ({
  position: "fixed" as const,
  left: toolbarPos.value.x + "px",
  top: toolbarPos.value.y + "px",
  transform: "translate(-50%, -100%)",
  visibility: hasMeasured.value ? ("visible" as const) : ("hidden" as const),
}));

watch(
  () => [
    store.selectedIds.join(","),
    store.activeSectionId,
    store.activeSectionSelectedElements
      .map((el) => `${el.id}:${el.x}:${el.y}:${el.width}:${el.height}`)
      .join("|"),
  ],
  () => {
    schedulePositionUpdate();
  },
  { flush: "post" }
);

onMounted(() => {
  window.addEventListener("scroll", updatePosition, true);
  window.addEventListener("resize", updatePosition);
});

onUnmounted(() => {
  window.removeEventListener("scroll", updatePosition, true);
  window.removeEventListener("resize", updatePosition);
});

watch(
  visible,
  (val) => {
    if (val) {
      schedulePositionUpdate();
    } else {
      hasMeasured.value = false;
    }
  },
  {
    immediate: true,
    flush: "post",
  }
);

const align = (type: Parameters<typeof store.alignSelected>[0]) => {
  store.alignSelected(type);
  requestAnimationFrame(updatePosition);
};

const group = () => {
  store.groupSelected();
  requestAnimationFrame(updatePosition);
};

const ungroup = () => {
  store.ungroupSelected();
  requestAnimationFrame(updatePosition);
};

const duplicateSelected = () => {
  const ids = store.selectedIds;
  ids.forEach((id) => {
    const section = store.findSectionByElementId(id);
    const element = store.findElementById(id);
    if (!section || !element) return;

    const clone = structuredClone(element);
    clone.id = crypto.randomUUID();
    clone.x += 24;
    clone.y += 24;
    clone.zIndex += 1;

    section.elements.push(clone);
  });
};

const deleteSelected = () => {
  const ids = store.selectedIds;
  if (ids.length > 0) {
    store.removeElements(ids);
  }
};
</script>

<style scoped lang="scss">
.ms-toolbar {
  position: fixed;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem;
  border: 1px solid #dbd5ca;
  border-radius: 14px;
  background: rgba(255, 253, 248, 0.96);
  box-shadow: 0 10px 28px rgba(54, 64, 45, 0.14);
  z-index: 9999;
  white-space: nowrap;
  pointer-events: auto;

  button {
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #4f5c43;
    padding: 0.4rem 0.5rem;
    font-size: 0.78rem;
    white-space: nowrap;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #edf2e7;
    }
  }

  &__group {
    display: flex;
    align-items: center;
    gap: 0.15rem;
  }

  &__divider {
    width: 1px;
    height: 18px;
    background: #dbd5ca;
    margin: 0 0.2rem;
  }

  &__danger {
    color: #c26457;

    &:hover {
      background: #fdf1ef;
    }
  }
}
</style>
