import type { Component } from "vue";
import TextPanel from "./panels/TextPanel.vue";
import ImagePanel from "./panels/ImagePanel.vue";
import FormPanel from "./panels/FormPanel.vue";
import MapPanel from "./panels/MapPanel.vue";
import AlbumPanel from "./panels/AlbumPanel.vue";
import CountdownPanel from "./panels/CountdownPanel.vue";
import LoveStoryPanel from "./panels/LoveStoryPanel.vue";
import VideoPanel from "./panels/VideoPanel.vue";

// ── Config per element type ──
export interface InspectorMeta {
  /** Label shown in the inspector header badge */
  label: string;
  /** Background color for the badge */
  badgeColor: string;
  /** Text color for the badge */
  badgeTextColor: string;
  /** The panel component rendered inside the inspector */
  component: Component;
  /** Which shared sections to show */
  shared: {
    position: boolean;
    transform: boolean; // rotation + flip + opacity
    layer: boolean;
  };
}

const registry = new Map<string, InspectorMeta>([
  [
    "text",
    {
      label: "Text",
      badgeColor: "#eef3e8",
      badgeTextColor: "#4A6B4D",
      component: TextPanel,
      shared: { position: true, transform: true, layer: true },
    },
  ],
  [
    "image",
    {
      label: "Image",
      badgeColor: "#f0eaf8",
      badgeTextColor: "#7b5ea7",
      component: ImagePanel,
      shared: { position: true, transform: true, layer: true },
    },
  ],
  [
    "form",
    {
      label: "Form",
      badgeColor: "#e8f0fb",
      badgeTextColor: "#3d6bcc",
      component: FormPanel,
      // Forms are positioned but not usually rotated or layered
      shared: { position: true, transform: false, layer: false },
    },
  ],
  [
    "map",
    {
      label: "Map",
      badgeColor: "#fef3e8",
      badgeTextColor: "#b5693a",
      component: MapPanel,
      // Maps are positioned but rotation/layer make no sense
      shared: { position: true, transform: false, layer: false },
    },
  ],
  [
    "album",
    {
      label: "Album",
      badgeColor: "#fde8ee",
      badgeTextColor: "#b5406a",
      component: AlbumPanel,
      shared: { position: true, transform: true, layer: true },
    },
  ],
  [
    "countdown",
    {
      label: "Countdown",
      badgeColor: "#fef3e8",
      badgeTextColor: "#b5693a",
      component: CountdownPanel,
      shared: { position: true, transform: false, layer: true },
    },
  ],
  [
    "loveStory",
    {
      label: "Love Story",
      badgeColor: "#fde8ee",
      badgeTextColor: "#b5406a",
      component: LoveStoryPanel,
      shared: { position: true, transform: false, layer: true },
    },
  ],
  [
    "video",
    {
      label: "Video",
      badgeColor: "#e8f4fb",
      badgeTextColor: "#1a6fa0",
      component: VideoPanel,
      // Video xoay được (rotation) nhưng không cần flip/opacity-slider riêng
      // (opacity đã có sẵn trong VideoPanel's "Appearance" section)
      shared: { position: true, transform: true, layer: true },
    },
  ],
]);

// ── Public API ──

/** Get inspector config for a given element type. Returns null for unknown types. */
export const getInspector = (type: string): InspectorMeta | null =>
  registry.get(type) ?? null;

/**
 * Register a new element type at runtime.
 * Use this to add types from plugins or feature modules without editing registry.ts.
 *
 * @example
 * registerInspector('video', {
 *   label: 'Video',
 *   badgeColor: '#e8f4fb',
 *   badgeTextColor: '#1a6fa0',
 *   component: VideoPanel,
 *   shared: { position: true, transform: false, layer: true },
 * })
 */
export const registerInspector = (type: string, meta: InspectorMeta): void => {
  registry.set(type, meta);
};

/** List all registered types (useful for debugging) */
export const registeredTypes = (): string[] => [...registry.keys()];
