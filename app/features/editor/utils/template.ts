import type { EditorStore } from "../store/editorStore";

export function exportTemplate(store: EditorStore) {
  return JSON.stringify({
    background: store.background,
    elements: store.elements,
  });
}

export function generateHTML(store: EditorStore) {
  const bg = store.background;

  const backgroundStyle = bg
    ? bg.type === "color"
      ? `background:${bg.value};`
      : `background-image:url('${bg.value}'); background-size:cover; background-position:center;`
    : "";

  const elementsHTML = store.elements
    .map((el) => {
      const baseStyle = `
        position:absolute;
        left:${el.x}px;
        top:${el.y}px;
        width:${el.width}px;
        height:${el.height}px;
        z-index:${el.zIndex};
      `;

      if (el.type === "text") {
        return `
          <div style="${baseStyle}; font-size:${el.fontSize}px; color:${el.color};">
            ${el.content}
          </div>
        `;
      }

      if (el.type === "image") {
        return `
          <img src="${el.src}" style="${baseStyle}; object-fit:cover;" />
        `;
      }

      return "";
    })
    .join("");

  return `
      <html>
        <body style="margin:0;">
          <div style="position:relative; width:100%; height:100vh; ${backgroundStyle}">
            ${elementsHTML}
          </div>
        </body>
      </html>
    `;
}
