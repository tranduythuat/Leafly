<template>
  <div class="blocks-panel">
    <button
      v-for="block in blocks"
      :key="block.key"
      class="blocks-panel__item"
      @click="insert(block.key)"
    >
      <component :is="block.icon" class="blocks-panel__icon" :size="20" />
      <span>{{ block.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import {
  ClipboardList,
  MapPin,
  Images,
  Timer,
  Heart,
  Video,
  QrCode,
  Music2,
} from "@lucide/vue";
import { useEditorStore } from "../../../store/editorStore";

const store = useEditorStore();

const blocks = [
  { key: "form", label: "RSVP Form", icon: ClipboardList },
  { key: "map", label: "Map", icon: MapPin },
  { key: "album", label: "Album", icon: Images },
  { key: "countdown", label: "Countdown", icon: Timer },
  { key: "loveStory", label: "Love Story", icon: Heart },
  { key: "video", label: "Video", icon: Video },
  { key: "qrcode", label: "QR Code", icon: QrCode },
  { key: "musicPlayer", label: "Music Player", icon: Music2 },
] as const;

const insert = (
  key:
    | "form"
    | "map"
    | "album"
    | "countdown"
    | "loveStory"
    | "video"
    | "qrcode"
    | "musicPlayer"
) => {
  const sectionEl = document.querySelector(
    `[data-section-id="${store.activeSectionId}"]`
  ) as HTMLElement | null;

  if (key === "form")
    store.insertFormBlock(sectionEl?.clientWidth, sectionEl?.clientHeight);
  if (key === "map")
    store.insertMapBlock(sectionEl?.clientWidth, sectionEl?.clientHeight);
  if (key === "album")
    store.insertAlbumBlock(sectionEl?.clientWidth, sectionEl?.clientHeight);
  if (key === "countdown")
    store.insertCountdownBlock(sectionEl?.clientWidth, sectionEl?.clientHeight);
  if (key === "loveStory")
    store.insertLoveStoryBlock(sectionEl?.clientWidth, sectionEl?.clientHeight);
  if (key === "video")
    store.insertVideoBlock("", sectionEl?.clientWidth, sectionEl?.clientHeight);
  if (key === "qrcode")
    store.insertQRCodeBlock(sectionEl?.clientWidth, sectionEl?.clientHeight);
  if (key === "musicPlayer")
    store.insertMusicPlayerBlock(
      sectionEl?.clientWidth,
      sectionEl?.clientHeight
    );
};
</script>

<style scoped lang="scss">
.blocks-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 12px;

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 16px 8px;
    border: 1px solid $cream-dark;
    border-radius: $radius-md;
    background: $white;
    color: $text-mid;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      border-color: $sage-light;
      background: #eef3e8;
      color: $sage-dark;
    }
  }

  &__icon {
    color: currentColor;
  }
}
</style>
