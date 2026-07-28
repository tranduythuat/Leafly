import { ref } from "vue";
import { useEditorStore } from "../store/editorStore";
import { createMoveCommand } from "../core/commands/moveElement";
import { createResizeCommand } from "../core/commands/resizeImage";
import { calcSnapWithContainer } from "../core/snapEngine";
import type { ContainerRect, SnapLine } from "../core/snapEngine";
import type { CanvasElement } from "../types";

export function useDragResize(
  element: CanvasElement,
  setSnapLines?: (lines: SnapLine[]) => void,
  getContainerRect?: () => ContainerRect
) {
  const store = useEditorStore();
  const isResizing = ref(false);
  const activeResizeHandle = ref<"tl" | "tr" | "bl" | "br" | null>(null);

  let startX = 0,
    startY = 0,
    initialX = 0,
    initialY = 0;

  const startDrag = (e: MouseEvent) => {
    e.preventDefault();
    initialX = element.x;
    initialY = element.y;
    startX = e.clientX;
    startY = e.clientY;

    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
  };

  const onDrag = (e: MouseEvent) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const rawX = initialX + dx;
    const rawY = initialY + dy;

    const others = store.activeSectionElements
      .filter((el) => el.id !== element.id)
      .map((el) => ({ x: el.x, y: el.y, width: el.width, height: el.height }));

    const container = getContainerRect?.() ?? {
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      paddingX: 48,
      paddingY: 48,
    };

    const result = calcSnapWithContainer(
      { x: rawX, y: rawY, width: element.width, height: element.height },
      others,
      container
    );

    store.move(element.id, result.x, result.y);
    setSnapLines?.(result.lines);
  };

  const stopDrag = () => {
    setSnapLines?.([]);
    const el = store.findElementById(element.id);
    if (el && (el.x !== initialX || el.y !== initialY)) {
      store.executeCommand(
        createMoveCommand(store, {
          id: element.id,
          oldX: initialX,
          oldY: initialY,
          newX: el.x,
          newY: el.y,
        })
      );
    }
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", stopDrag);
  };

  let resizeStartX = 0,
    resizeStartY = 0,
    resizeStartW = 0,
    resizeStartH = 0;
  let resizeStartLeft = 0,
    resizeStartTop = 0;
  let resizeDir: "tl" | "tr" | "bl" | "br" = "br";
  const MIN_SIZE = 60;

  const startResize = (e: MouseEvent, dir: "tl" | "tr" | "bl" | "br") => {
    e.preventDefault();
    resizeDir = dir;
    activeResizeHandle.value = dir;
    isResizing.value = true;

    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartW = element.width;
    resizeStartH = element.height;
    resizeStartLeft = element.x;
    resizeStartTop = element.y;

    document.body.style.userSelect = "none";
    document.body.style.cursor = "nwse-resize";
    window.addEventListener("mousemove", onResize);
    window.addEventListener("mouseup", stopResize);
  };

  const onResize = (e: MouseEvent) => {
    const dx = e.clientX - resizeStartX;
    const dy = e.clientY - resizeStartY;

    let newW = resizeStartW,
      newH = resizeStartH;
    let newX = resizeStartLeft,
      newY = resizeStartTop;

    if (resizeDir.includes("r")) newW = resizeStartW + dx;
    if (resizeDir.includes("l")) {
      newW = resizeStartW - dx;
      newX = resizeStartLeft + dx;
    }
    if (resizeDir.includes("b")) newH = resizeStartH + dy;
    if (resizeDir.includes("t")) {
      newH = resizeStartH - dy;
      newY = resizeStartTop + dy;
    }

    newW = Math.max(MIN_SIZE, Math.round(newW));
    newH = Math.max(MIN_SIZE, Math.round(newH));

    if (resizeDir.includes("l")) newX = resizeStartLeft + (resizeStartW - newW);
    if (resizeDir.includes("t")) newY = resizeStartTop + (resizeStartH - newH);

    store.move(element.id, newX, newY);
    store.resize(element.id, newW, newH);
  };

  const stopResize = () => {
    document.body.style.userSelect = "";
    document.body.style.cursor = "";

    const el = store.findElementById(element.id);
    if (el) {
      const changed =
        el.x !== resizeStartLeft ||
        el.y !== resizeStartTop ||
        el.width !== resizeStartW ||
        el.height !== resizeStartH;

      if (changed) {
        store.executeCommand(
          createResizeCommand(store, {
            id: element.id,
            oldX: resizeStartLeft,
            oldY: resizeStartTop,
            oldWidth: resizeStartW,
            oldHeight: resizeStartH,
            newX: el.x,
            newY: el.y,
            newWidth: el.width,
            newHeight: el.height,
          })
        );
      }
    }

    isResizing.value = false;
    activeResizeHandle.value = null;
    window.removeEventListener("mousemove", onResize);
    window.removeEventListener("mouseup", stopResize);
  };

  return { isResizing, activeResizeHandle, startDrag, startResize };
}
