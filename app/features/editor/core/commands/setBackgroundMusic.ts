import type { EditorStore } from '../../store/editorStore'
import type { Command, BackgroundMusic } from '../../types'

const cloneMusic = (music: BackgroundMusic | null): BackgroundMusic | null =>
    music ? { ...music } : null

export function createSetBackgroundMusicCommand(
    store: EditorStore,
    payload: {
        oldMusic: BackgroundMusic | null
        newMusic: BackgroundMusic | null
    }
): Command {
    const oldMusic = cloneMusic(payload.oldMusic)
    const newMusic = cloneMusic(payload.newMusic)

    return {
        execute() {
            store.document.backgroundMusic = cloneMusic(newMusic)
        },
        undo() {
            store.document.backgroundMusic = cloneMusic(oldMusic)
        },
    }
}