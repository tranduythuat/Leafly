import type { VideoSourceType } from "../types"

export function detectVideoSource(input: string): VideoSourceType {
    if (/youtu\.?be/i.test(input)) return "youtube"
    if (/vimeo\.com/i.test(input)) return "vimeo"
    return "upload"
}

export function getYoutubeId(url: string): string | null {
    const patterns = [
        /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
        /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
    ]
    for (const re of patterns) {
        const m = url.match(re)
        if (m && m[1]) return m[1]
    }
    return null
}

export function getVimeoId(url: string): string | null {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    return m && m[1] ? m[1] : null
}

export interface EmbedOptions {
    autoplay?: boolean
    loop?: boolean
    muted?: boolean
    controls?: boolean
}

export function toEmbedUrl(
    src: string,
    sourceType: VideoSourceType,
    opts: EmbedOptions = {}
): string | null {
    if (sourceType === "youtube") {
        const id = getYoutubeId(src)
        if (!id) return null
        const params = new URLSearchParams({
            autoplay: opts.autoplay ? "1" : "0",
            mute: opts.muted || opts.autoplay ? "1" : "0", // browser chặn autoplay nếu không mute
            loop: opts.loop ? "1" : "0",
            controls: opts.controls === false ? "0" : "1",
            playsinline: "1",
            rel: "0",
            modestbranding: "1",
        })
        if (opts.loop) params.set("playlist", id) // youtube cần playlist=id để loop 1 video
        return `https://www.youtube.com/embed/${id}?${params.toString()}`
    }

    if (sourceType === "vimeo") {
        const id = getVimeoId(src)
        if (!id) return null
        const params = new URLSearchParams({
            autoplay: opts.autoplay ? "1" : "0",
            muted: opts.muted || opts.autoplay ? "1" : "0",
            loop: opts.loop ? "1" : "0",
            controls: opts.controls === false ? "0" : "1",
            title: "0",
            byline: "0",
            portrait: "0",
        })
        return `https://player.vimeo.com/video/${id}?${params.toString()}`
    }

    return null // upload → dùng thẻ <video> trực tiếp, không cần embed url
}