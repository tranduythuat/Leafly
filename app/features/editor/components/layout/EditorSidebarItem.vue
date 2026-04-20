<template>
  <div
    class="border rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow"
    @click="onClickItem"
  >
    <div class="w-10 h-10 bg-gray-100 rounded mb-2" />
    <span class="text-sm text-center">{{ item.label }}</span>
    <input
      v-if="type === 'image'"
      ref="fileInputRef"
      class="hidden"
      type="file"
      accept="image/*"
      @change="onUploadImage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useEditorStore } from "../../store/editorStore";

interface SidebarItem {
  id: string
  label: string
  src?: string
  upload?: boolean
}

const props = defineProps<{
  item: SidebarItem
  type: string
}>()

const store = useEditorStore();
const fileInputRef = ref<HTMLInputElement | null>(null)

const insertText = (variant: "heading" | "paragraph" | "quote") => {
  const sectionEl = document.querySelector(`[data-section-id="${store.activeSectionId}"]`)
  store.insertTextBlock(variant, sectionEl?.clientWidth, sectionEl?.clientHeight)
};

const applyImage = (src: string) => {
  const selected = store.selectedElement
  if (selected?.type === "image") {
    store.updateImageSource(selected.id, src)
    return
  }

  const sectionEl = document.querySelector(`[data-section-id="${store.activeSectionId}"]`)
  store.insertImageBlock(src, sectionEl?.clientWidth, sectionEl?.clientHeight)
}

const onUploadImage = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const src = URL.createObjectURL(file)
  applyImage(src)
  input.value = ""
}

const onClickItem = () => {
  if (props.type === "text") {
    insertText(props.item.id as "heading" | "paragraph" | "quote")
    return
  }

  if (props.type !== "image") return

  if (props.item.upload) {
    fileInputRef.value?.click()
    return
  }

  if (props.item.src) {
    applyImage(props.item.src)
  }
}

</script>
