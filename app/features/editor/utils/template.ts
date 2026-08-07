import type { EditorStore } from "../store/editorStore";
import { toEmbedUrl } from "./videoUtils";

export function exportTemplate(store: EditorStore) {
  return JSON.stringify({
    background: store.background,
    backgroundMusic: store.backgroundMusic, // 🎵 NEW
    sections: store.sections,
  });
}

export function generateHTML(store: EditorStore) {
  const bg = store.background;
  const music = store.backgroundMusic; // 🎵 NEW

  const backgroundStyle = bg
    ? bg.type === "color"
      ? `background:${bg.value};`
      : `background-image:url('${bg.value}'); background-size:cover; background-position:center;`
    : "";


  const sectionsHTML = store.sections
    .map((section) => {
      const elementsHTML = section.elements
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
              <div style="${baseStyle}; font-size:${el.fontSize}px; color:${el.color}; text-align:${el.alignment};">
                ${el.content}
              </div>
            `;
          }

          if (el.type === "image") {
            return `
              <img src="${el.src}" style="${baseStyle}; object-fit:cover;" />
            `;
          }

          if (el.type === "video") {
            const rotation = el.rotation ? `transform:rotate(${el.rotation}deg);` : "";
            const commonStyle = `${baseStyle}; ${rotation} border-radius:${el.borderRadius}px; opacity:${el.opacity / 100};`;

            if (el.sourceType === "upload") {
              return `
                <video src="${el.src}" style="${commonStyle}"
                  ${el.controls ? "controls" : ""}
                  ${el.autoplay ? "autoplay" : ""}
                  ${el.loop ? "loop" : ""}
                  ${el.muted || el.autoplay ? "muted" : ""}
                  playsinline>
                </video>
              `;
            }

            const embed = toEmbedUrl(el.src, el.sourceType, {
              autoplay: el.autoplay,
              loop: el.loop,
              muted: el.muted,
              controls: el.controls,
            });
            if (!embed) return "";

            return `
              <iframe src="${embed}" style="${commonStyle}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
              </iframe>
            `;
          }

          if (el.type === "button") {
            const href =
              el.action === "link" ? (el.url || "#") :
                el.action === "scroll" ? `#${el.sectionTarget || ""}` :
                  el.action === "mailto" ? `mailto:${el.email || ""}` :
                    el.action === "tel" ? `tel:${el.phone || ""}` : "#";

            const target =
              el.action === "link" && el.openInNewTab
                ? ' target="_blank" rel="noopener"'
                : "";

            return `
            <a href="${href}"${target} style="${baseStyle};
              display:flex; align-items:center; justify-content:center;
              text-decoration:none; box-sizing:border-box;
              background:${el.bgColor}; color:${el.textColor};
              border-radius:${el.borderRadius}px;
              border:${el.borderWidth ?? 0}px solid ${el.borderColor ?? "transparent"};
              font-size:${el.fontSize}px; font-weight:${el.fontWeight};">
              ${el.label}
            </a>
          `;
          }

          return "";
        })
        .join("");
      const sectionBackground =
        section.style.background.type === "color"
          ? `background:${section.style.background.value};`
          : `background-image:url('${section.style.background.value}'); background-size:cover; background-position:center;`

      return `
        <section style="position:relative; min-height:${section.style.minHeight}px; padding:${section.style.padding}px; ${sectionBackground}">
          ${elementsHTML}
        </section>
      `;
    })
    .join("");

  const musicHTML = music ?
    `<audio id="bg-music" src="${music.src}" ${music.loop ? "loop" : ""} preload="auto"></audio>
          <button id="bg-music-toggle" style="position:fixed;right:24px;bottom:24px;z-index:9999;width:44px;height:44px;border-radius:50%;border:none;background:#36402d;color:#fff;font-size:18px;cursor:pointer;">🔈</button>
          <script>
            (function () {
              var audio = document.getElementById('bg-music');
              var btn = document.getElementById('bg-music-toggle');
              audio.volume = ${music.volume ?? 0.6};

              btn.addEventListener('click', function () {
                if (audio.paused) {
                  audio.play();
                  btn.textContent = '🔊';
                } else {
                  audio.pause();
                  btn.textContent = '🔈';
                }
              });

              ${music.autoplay
      ? `audio.play().then(function () { btn.textContent = '🔊'; }).catch(function () {});`
      : ""}
            })();
          </scr` + `ipt>
        `
    : "";


  return `
      <html>
        <body style="margin:0;">
          <div style="position:relative; width:100%; height:100vh; ${backgroundStyle}">
            ${sectionsHTML}
          </div>
           ${musicHTML}
        </body>
      </html>
    `;
}
