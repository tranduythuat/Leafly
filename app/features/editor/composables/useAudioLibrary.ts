import { ref, readonly } from "vue";

export interface AudioAsset {
    id: string;
    name: string;
    src: string;
    duration: number; // seconds
    sizeKb: number;
    isLocal: boolean;
}

// Singleton — share state giữa mọi component
const assets = ref<AudioAsset[]>([]);

const createId = () =>
    `audio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const getDuration = (src: string): Promise<number> =>
    new Promise((resolve) => {
        const audio = new Audio();
        audio.addEventListener("loadedmetadata", () =>
            resolve(audio.duration || 0)
        );
        audio.addEventListener("error", () => resolve(0));
        audio.src = src;
    });

export function useAudioLibrary() {
    const addFromFile = async (file: File): Promise<AudioAsset> => {
        const src = URL.createObjectURL(file);
        const duration = await getDuration(src);

        const asset: AudioAsset = {
            id: createId(),
            name: file.name,
            src,
            duration,
            sizeKb: Math.round(file.size / 1024),
            isLocal: true,
        };

        assets.value.unshift(asset);
        return asset;
    };

    const addFromUrl = async (url: string): Promise<AudioAsset | null> => {
        if (!url.trim()) return null;
        const duration = await getDuration(url);
        const name = url.split("/").pop()?.split("?")[0] ?? "audio";

        const asset: AudioAsset = {
            id: createId(),
            name,
            src: url,
            duration,
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