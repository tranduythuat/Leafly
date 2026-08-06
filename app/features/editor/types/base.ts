export type ID = string;

export type Alignment = "left" | "center" | "right" | "justify";
export type HeightMode = "fixed" | "auto";
export type VideoSourceType = "youtube" | "vimeo" | "upload"

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

export interface VideoElement extends BaseElement {
  type: 'video'
  src: string          // URL gốc (youtube/vimeo link) hoặc blob/upload URL
  sourceType: VideoSourceType
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  thumbnail?: string    // cache thumbnail cho youtube/vimeo (hiển thị nhanh khi chưa load iframe)
}

// ---- Form -----

export interface FormFieldOption {
  id: string;
  label: string;
  subLabel?: string;
  defaultChecked?: boolean;
}

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
  borderColor?: string;
  options?: FormFieldOption[];
  displayStyle?: "default" | "pill";
  pillRadius?: number; // border-radius riêng cho pill, px
  pillLayout?: "row" | "column" | "grid2"; // bố cục: ngang / dọc / lưới 2 cột
  pillWidth?: number | "auto"; // px cố định, hoặc 'auto' theo nội dung
  pillHeight?: number; // px
  pillAlign?: "left" | "center" | "right" | "between"; // căn nhóm pill trong field
  pillQuestion?: string; // câu hỏi hiển thị phía trên pill group
  pillQuestionAlign?: "left" | "center" | "right";
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
  borderColor: string;
  borderRadius: number;
  showLabels: boolean;
  fieldGap?: number;
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

export interface CountdownElement extends BaseElement {
  type: "countdown";
  targetDate: string; // ISO string, vd: "2025-12-24T18:00:00"
  label: string; // vd: "Đếm ngược đến ngày trọng đại"
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
  numberColor: string;
  labelColor: string;
  accentColor: string;
  layout: "boxes" | "inline" | "circles";
  borderRadius: number;
  bgColor: string;
  onComplete: "hide" | "message";
  completeMessage: string;
}

// --- Love Story / Timeline ---
export interface StoryMilestone {
  id: string;
  date: string;      // vd: "Tháng 3, 2022" hoặc "14/02/2023"
  title: string;      // vd: "Lần đầu gặp gỡ"
  description: string;
  image?: string;
}

export interface LoveStoryElement extends BaseElement {
  type: "loveStory";
  milestones: StoryMilestone[];
  layout: "vertical" | "alternating";
  lineColor: string;
  dotColor: string;
  dateColor: string;
  titleColor: string;
  textColor: string;
  bgColor: string;
  cardBg: string;
  cardRadius: number;
  itemGap: number;
  imageRatio: "square" | "landscape" | "portrait";
}

export type CanvasElement =
  | TextElement
  | ImageElement
  | FormElement
  | MapElement
  | AlbumElement
  | CountdownElement
  | LoveStoryElement
  | VideoElement;

