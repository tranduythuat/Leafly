export type ID = string;

export type Alignment = "left" | "center" | "right" | "justify";
export type HeightMode = "fixed" | "auto";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseElement extends Position, Size {
  id: ID;
  zIndex: number;
  rotation?: number;
  groupId?: string;
}

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  fontFamily: string;
  fontSize?: number;
  color?: string;
  alignment?: Alignment;
  heightMode?: HeightMode;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  opacity?: number;
  flipH?: boolean;
  flipV?: boolean;
  style?: {
    objectFit?: "cover" | "contain" | "fill";
  };
}

// ---- Form -----
export interface FormField {
  id: string;
  type:
    | "text"
    | "textarea"
    | "email"
    | "select"
    | "radio"
    | "checkbox"
    | "date"
    | "number";
  label: string;
  required: boolean;
}

export interface FormElement extends BaseElement {
  type: "form";
  field: FormField[];
  submitLabel: string;
  submitColor: string;
  action: "rsvp" | "email" | "redirect" | "none";
  actionEmail?: string;
  actionUrl?: string;
  bgColor: string;
  borderRadius: number;
  showLabels: boolean;
}

export interface MapElement extends BaseElement {
  type: "map";
  address: string;
  lat: number;
  lng: number;
  zoom: number;
  mapStyle:
    | "streets"
    | "satellite"
    | "light"
    | "dark"
    | "outdoors"
    | "watercolor";
  showControls: boolean;
  showMarker: boolean;
  scrollZoom: boolean;
  markerTitle: string;
  markerDesc: string;
  borderRadius: number;
  opacity: number;
}

// --- Album ---
export interface AlbumImage {
  id: string;
  src: string;
}

export interface AlbumElement extends BaseElement {
  type: "album";
  images: AlbumImage[];
  layout: "grid" | "masonry" | "carousel" | "strip";
  columns: number;
  gap: number;
  itemRadius: number;
  objectFit: "cover" | "contain";
  rowHeight: number;
  lightbox: boolean;
  autoplay: boolean;
  autoplayMs: number;
  opacity?: number;
  flipH?: boolean;
  flipV?: boolean;
}

export type CanvasElement =
  | TextElement
  | ImageElement
  | FormElement
  | MapElement
  | AlbumElement;
