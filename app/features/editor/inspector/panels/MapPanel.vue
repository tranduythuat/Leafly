<template>
  <!-- Location search -->
  <InsSection title="Location">
    <div class="mp-search-row">
      <input
        v-model="searchQuery"
        class="mp-search-input"
        placeholder="Search address..."
        @keydown.enter="searchLocation"
      />
      <button
        class="mp-search-btn"
        @click="searchLocation"
        :disabled="searching"
      >
        <svg
          v-if="!searching"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span v-else class="mp-spinner" />
      </button>
    </div>

    <div v-if="local.address" class="mp-address-badge">
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      {{ local.address }}
    </div>

    <div class="mp-coords-row">
      <InsField
        type="number"
        label="Latitude"
        :model-value="local.lat"
        :step="0.0001"
        @update:model-value="
          local.lat = $event;
          sync();
        "
      />
      <InsField
        type="number"
        label="Longitude"
        :model-value="local.lng"
        :step="0.0001"
        @update:model-value="
          local.lng = $event;
          sync();
        "
      />
    </div>
  </InsSection>

  <!-- Map style -->
  <InsSection title="Map Style">
    <div class="mp-style-grid">
      <button
        v-for="style in mapStyles"
        :key="style.value"
        class="mp-style-btn"
        :class="{ 'mp-style-btn--active': local.mapStyle === style.value }"
        @click="
          local.mapStyle = style.value;
          sync();
        "
      >
        <div class="mp-style-preview" :style="{ background: style.preview }" />
        {{ style.label }}
      </button>
    </div>
  </InsSection>

  <!-- Controls -->
  <InsSection title="Controls" :default-open="false">
    <InsField
      type="number"
      label="Zoom"
      :model-value="local.zoom"
      :min="1"
      :max="20"
      @update:model-value="
        local.zoom = $event;
        sync();
      "
    />
    <InsField
      type="toggle"
      label="Show zoom controls"
      :model-value="local.showControls"
      @update:model-value="
        local.showControls = $event;
        sync();
      "
    />
    <InsField
      type="toggle"
      label="Show marker pin"
      :model-value="local.showMarker"
      @update:model-value="
        local.showMarker = $event;
        sync();
      "
    />
    <InsField
      type="toggle"
      label="Allow scroll to zoom"
      :model-value="local.scrollZoom"
      @update:model-value="
        local.scrollZoom = $event;
        sync();
      "
    />
  </InsSection>

  <!-- Marker popup -->
  <InsSection title="Marker Label" :default-open="false">
    <InsField
      type="text"
      label="Title"
      :model-value="local.markerTitle"
      placeholder="Wedding Venue"
      @update:model-value="
        local.markerTitle = $event;
        sync();
      "
    />
    <InsField
      type="textarea"
      label="Description"
      :model-value="local.markerDesc"
      placeholder="123 Rose Garden Ave..."
      :rows="2"
      @update:model-value="
        local.markerDesc = $event;
        sync();
      "
    />
  </InsSection>

  <!-- Border -->
  <InsSection title="Appearance" :default-open="false">
    <InsField
      type="range"
      label="Border radius"
      :model-value="local.borderRadius"
      :min="0"
      :max="32"
      suffix="px"
      @update:model-value="
        local.borderRadius = $event;
        sync();
      "
    />
    <InsField
      type="range"
      label="Opacity"
      :model-value="local.opacity"
      :min="0"
      :max="100"
      suffix="%"
      @update:model-value="
        local.opacity = $event;
        sync();
      "
    />
  </InsSection>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import InsSection from "../shared/InsSection.vue";
import InsField from "../shared/InsField.vue";
import { useEditorStore } from "../../store/editorStore";
import { createUpdateStyleCommand } from "../../core/commands/updateStyle";
import type { CanvasElement } from "../../types";

const props = defineProps<{ element: CanvasElement & { [k: string]: any } }>();
const store = useEditorStore();

const searchQuery = ref("");
const searching = ref(false);

const mapStyles = [
  {
    value: "streets",
    label: "Streets",
    preview: "linear-gradient(135deg, #e8dcc8, #c8b89a)",
  },
  {
    value: "satellite",
    label: "Satellite",
    preview: "linear-gradient(135deg, #2c4a2c, #4a7a4a)",
  },
  {
    value: "light",
    label: "Light",
    preview: "linear-gradient(135deg, #f5f5f5, #e0e0e0)",
  },
  {
    value: "dark",
    label: "Dark",
    preview: "linear-gradient(135deg, #1a1a2e, #2d2d44)",
  },
  {
    value: "outdoors",
    label: "Outdoors",
    preview: "linear-gradient(135deg, #d4e8c2, #b0cc8c)",
  },
  {
    value: "watercolor",
    label: "Watercolor",
    preview: "linear-gradient(135deg, #c8d8e8, #a8c0d8)",
  },
];

const local = reactive({
  address: "",
  lat: 21.0285,
  lng: 105.8542,
  zoom: 14,
  mapStyle: "streets",
  showControls: true,
  showMarker: true,
  scrollZoom: false,
  markerTitle: "",
  markerDesc: "",
  borderRadius: 8,
  opacity: 100,
});

watch(
  () => props.element,
  (el) => {
    if (!el) return;
    local.address = el.address ?? "";
    local.lat = el.lat ?? 21.0285;
    local.lng = el.lng ?? 105.8542;
    local.zoom = el.zoom ?? 14;
    local.mapStyle = el.mapStyle ?? "streets";
    local.showControls = el.showControls ?? true;
    local.showMarker = el.showMarker ?? true;
    local.scrollZoom = el.scrollZoom ?? false;
    local.markerTitle = el.markerTitle ?? "";
    local.markerDesc = el.markerDesc ?? "";
    local.borderRadius = el.borderRadius ?? 8;
    local.opacity = el.opacity ?? 100;
  },
  { immediate: true }
);

// Geocode via Nominatim (free, no API key)
const searchLocation = async () => {
  if (!searchQuery.value.trim()) return;
  searching.value = true;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      searchQuery.value
    )}&format=json&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data[0]) {
      local.lat = parseFloat(data[0].lat);
      local.lng = parseFloat(data[0].lon);
      local.address = data[0].display_name.split(",").slice(0, 2).join(", ");
      sync();
    }
  } finally {
    searching.value = false;
  }
};

const sync = () => {
  store.executeCommand(
    createUpdateStyleCommand(store, {
      id: props.element.id,
      oldData: {},
      newData: { ...local },
    })
  );
};
</script>

<style scoped lang="scss">
.mp-search-row {
  display: flex;
  gap: 5px;
}

.mp-search-input {
  flex: 1;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  padding: 5px 8px;
  font-size: 12px;
  background: $white;
  color: $text-dark;
  outline: none;
  &:focus {
    border-color: $sage;
  }
}

.mp-search-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $sage;
  border: none;
  border-radius: $radius-sm;
  color: $white;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;

  &:hover {
    background: $sage-dark;
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}

.mp-spinner {
  width: 11px;
  height: 11px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.mp-address-badge {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  padding: 5px 8px;
  background: #eef3e8;
  border: 1px solid $sage-light;
  border-radius: $radius-sm;
  font-size: 10px;
  color: $sage-dark;
  line-height: 1.4;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
}

.mp-coords-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

/* Map style grid */
.mp-style-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.mp-style-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 5px 3px;
  border: 1px solid $cream-dark;
  border-radius: $radius-sm;
  background: $white;
  cursor: pointer;
  font-size: 9px;
  color: $text-mid;
  transition: all 0.12s;

  &:hover {
    border-color: $sage-light;
  }

  &--active {
    border-color: $sage;
    background: #eef3e8;
    color: $sage-dark;
    font-weight: 600;
  }
}

.mp-style-preview {
  width: 100%;
  height: 28px;
  border-radius: 4px;
}
</style>