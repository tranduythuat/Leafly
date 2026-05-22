import { ref, readonly } from "vue";

export interface ImageAsset {
  id: string;
  name: string;
  src: string; // blob URL hoặc /static path
  width: number;
  height: number;
  sizeKb: number;
  isLocal: boolean; // true = blob URL từ upload
}

// Singleton — share state giữa mọi component
const assets = ref<ImageAsset[]>([
//   {
//     id: "preset-1",
//     name: "Sample 1",
//     src: "/img/1.jpg",
//     width: 800,
//     height: 600,
//     sizeKb: 0,
//     isLocal: false,
//   },
//   {
//     id: "preset-2",
//     name: "Sample 2",
//     src: "/img/2.jpg",
//     width: 800,
//     height: 600,
//     sizeKb: 0,
//     isLocal: false,
//   },
]);

const createId = () =>
  `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const getMeta = (src: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = src;
  });

export function useImageLibrary() {
  const addFromFile = async (file: File): Promise<ImageAsset> => {
    const src = URL.createObjectURL(file);
    const { width, height } = await getMeta(src);

    const asset: ImageAsset = {
      id: createId(),
      name: file.name,
      src,
      width,
      height,
      sizeKb: Math.round(file.size / 1024),
      isLocal: true,
    };

    assets.value.unshift(asset);
    return asset;
  };

  const addFromUrl = async (url: string): Promise<ImageAsset | null> => {
    if (!url.trim()) return null;
    const { width, height } = await getMeta(url);
    const name = url.split("/").pop()?.split("?")[0] ?? "image";

    const asset: ImageAsset = {
      id: createId(),
      name,
      src: url,
      width,
      height,
      sizeKb: 0,
      isLocal: false,
    };

    assets.value.unshift(asset);
    return asset;
  };

  const remove = (id: string) => {
    const idx = assets.value.findIndex((a) => a.id === id);
    if (idx < 0) return;

    const asset = assets.value[idx];
    if (asset.isLocal) URL.revokeObjectURL(asset.src);

    assets.value.splice(idx, 1);
  };

  return {
    assets: readonly(assets),
    addFromFile,
    addFromUrl,
    remove,
  };
}
