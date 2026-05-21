<template>
  <Teleport to="body">
    <Transition name="picker">
      <div
        v-if="visible"
        ref="menuRef"
        class="lp-menu"
        :style="menuStyle"
        @keydown="onKeyDown"
        @mousedown.stop
        @click.stop
      >
        <div class="lp-header">
          <i class="ti ti-layers-intersect" aria-hidden="true"></i>
          <span>{{ items.length }} layers</span>
        </div>

        <ul class="lp-list" role="listbox" aria-label="Select a layer">
          <li
            v-for="(item, index) in items"
            :key="item.id"
            class="lp-item"
            :class="{
              'lp-item--active': item.id === selectedId,
              'lp-item--focused': index === focusedIndex,
            }"
            role="option"
            :aria-selected="item.id === selectedId"
            @mouseenter="onHover(item.id, index)"
            @mouseleave="onHoverEnd"
            @click.stop="onSelect(item.id)"
          >
            <!-- Icon thumbnail -->
            <div class="lp-thumb" :style="thumbStyle(item)">
              <i :class="thumbIcon(item)" aria-hidden="true"></i>
            </div>

            <!-- Info -->
            <div class="lp-info">
              <div class="lp-name">{{ item.label }}</div>
              <div class="lp-meta">{{ item.type }} · z:{{ item.zIndex }}</div>
            </div>

            <!-- Check -->
            <i
              v-if="item.id === selectedId"
              class="ti ti-check lp-check"
              aria-hidden="true"
            ></i>
          </li>
        </ul>
      </div>
    </Transition>

    <!-- Backdrop: click ngoài để đóng -->
    <div
      v-if="visible"
      class="lp-backdrop"
      @mousedown.stop="close"
      @contextmenu.prevent.stop="close"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from "vue";
import type { EditorElement } from "../../types";

export interface LayerPickerItem {
  id: string;
  type: string;
  label: string;
  zIndex: number;
  color?: string;
  src?: string;
}

const props = defineProps<{
  visible: boolean;
  x: number;
  y: number;
  items: LayerPickerItem[];
  selectedId: string | null;
  hoveredId: string | null;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "hover", id: string | null): void;
  (e: "close"): void;
}>();

const menuRef = ref<HTMLElement | null>(null);
const focusedIndex = ref(0);

// ── Reset focused index khi menu mở ──
watch(
  () => props.visible,
  (val) => {
    if (!val) return;
    focusedIndex.value = props.items.findIndex(
      (i) => i.id === props.selectedId
    );
    if (focusedIndex.value < 0) focusedIndex.value = props.items.length - 1;

    nextTick(() => menuRef.value?.focus());
  }
);

// ── Vị trí menu: clamp trong viewport ──
const MENU_W = 224;
const MENU_ITEM_H = 40;
const MENU_HEADER_H = 36;

const menuStyle = computed(() => {
  const menuH = MENU_HEADER_H + props.items.length * MENU_ITEM_H;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let x = props.x;
  let y = props.y;

  if (x + MENU_W > vw - 8) x = vw - MENU_W - 8;
  if (y + menuH > vh - 8) y = Math.max(8, vh - menuH - 8);
  if (x < 8) x = 8;

  return {
    left: `${x}px`,
    top: `${y}px`,
    width: `${MENU_W}px`,
  };
});

// ── Keyboard navigation ──
const onKeyDown = (e: KeyboardEvent) => {
  if (!props.visible) return;

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      focusedIndex.value = (focusedIndex.value + 1) % props.items.length;
      emit("hover", props.items[focusedIndex.value]?.id ?? null);
      break;
    case "ArrowUp":
      e.preventDefault();
      focusedIndex.value =
        (focusedIndex.value - 1 + props.items.length) % props.items.length;
      emit("hover", props.items[focusedIndex.value]?.id ?? null);
      break;
    case "Enter":
      e.preventDefault();
      if (props.items[focusedIndex.value]) {
        onSelect(props.items[focusedIndex.value].id);
      }
      break;
    case "Escape":
      e.preventDefault();
      close();
      break;
  }
};

// ── Actions ──
const onHover = (id: string, index: number) => {
  focusedIndex.value = index;
  emit("hover", id);
};

const onHoverEnd = () => {
  emit("hover", null);
};

const onSelect = (id: string) => {
  emit("select", id);
  close();
};

const close = () => {
  emit("hover", null);
  emit("close");
};

// ── Thumbnail style theo type / color ──
const thumbStyle = (item: LayerPickerItem) => {
  if (item.type === "image") {
    return {
      background: item.src ? `url(${item.src}) center/cover` : "#c8d4b0",
    };
  }
  return {
    background: item.color
      ? hexToRgba(item.color, 0.15)
      : "rgba(107, 140, 110, 0.15)",
  };
};

const thumbIcon = (item: LayerPickerItem) => {
  if (item.type === "image") return "ti ti-photo";
  if (item.type === "text") return "ti ti-typography";
  return "ti ti-square";
};

// ── Utility ──
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};
</script>

<style scoped>
.lp-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
  cursor: default;
}

.lp-menu {
  position: fixed;
  z-index: 9999;
  background: var(--color-background-primary, #fff);
  border: 0.5px solid var(--color-border-secondary, rgba(0, 0, 0, 0.2));
  border-radius: 10px;
  overflow: hidden;
  outline: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06);
}

.lp-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 0.5px solid var(--color-border-tertiary, rgba(0, 0, 0, 0.1));
  font-size: 11px;
  color: var(--color-text-secondary, #666);
  letter-spacing: 0.03em;
}

.lp-header i {
  font-size: 13px;
}

.lp-list {
  list-style: none;
}

.lp-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 0.5px solid var(--color-border-tertiary, rgba(0, 0, 0, 0.07));
  transition: background 0.1s;
  min-height: 40px;
}

.lp-item:last-child {
  border-bottom: none;
}

.lp-item:hover,
.lp-item--focused {
  background: var(--color-background-secondary, rgba(0, 0, 0, 0.04));
}

.lp-item--active {
  background: #eef3e8;
}

/* dark mode active */
@media (prefers-color-scheme: dark) {
  .lp-item--active {
    background: rgba(95, 140, 95, 0.18);
  }
}

.lp-thumb {
  width: 32px;
  height: 24px;
  border-radius: 4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #4a6b4d;
}

.lp-info {
  flex: 1;
  min-width: 0;
}

.lp-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-primary, #1a1a1a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lp-meta {
  font-size: 10px;
  color: var(--color-text-secondary, #888);
  margin-top: 1px;
}

.lp-check {
  font-size: 14px;
  color: #4a6b4d;
  flex-shrink: 0;
}

/* Transition */
.picker-enter-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.picker-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.picker-enter-from,
.picker-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
</style>