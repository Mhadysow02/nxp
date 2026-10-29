/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-gallery. Base: columns.
 * Source: https://www.nxp.com/products/S32K3
 * Selector: #rowjthecagu (.row.iw_row.rich-wrapper)
 * Columns block (xwalk): no field hints. One row x 2 cells:
 *   media gallery (images + video links) | overview text.
 */
export default function parse(element, { document }) {
  const toAbs = (href) => {
    if (!href) return href;
    if (/^https?:\/\//.test(href)) return href;
    if (href.startsWith('/')) return `https://www.nxp.com${href}`;
    return href;
  };

  // ---- Media cell ----
  const mediaCell = [];
  const media = element.querySelector('.xsp-richMedia, #richmedia');
  const thumbsWrap = media && media.querySelector('#xzoom-images, .xzoom-thumbs:not(.modal-img)');
  const videoTitles = media
    ? Array.from(media.querySelectorAll('.video-container figure img')).map((i) => (i.getAttribute('alt') || '').trim())
    : [];
  const modalTitle = media && media.querySelector('#modalTitle');

  if (thumbsWrap) {
    let videoIdx = 0;
    let imgIdx = 0;
    Array.from(thumbsWrap.querySelectorAll(':scope > a')).forEach((a) => {
      const img = a.querySelector('img');
      const isVideo = !!a.querySelector('figure') || /\/videos\//.test(a.getAttribute('href') || '');
      if (isVideo) {
        const title = videoTitles[videoIdx] || (img && img.getAttribute('alt')) || `Video ${videoIdx + 1}`;
        videoIdx += 1;
        const p = document.createElement('p');
        const link = document.createElement('a');
        link.href = toAbs(a.getAttribute('href'));
        link.textContent = title;
        p.appendChild(link);
        mediaCell.push(p);
      } else if (img) {
        const image = document.createElement('img');
        image.src = img.getAttribute('src');
        const alt = img.getAttribute('alt') || (imgIdx === 0 && modalTitle ? modalTitle.textContent.trim() : '');
        if (alt) image.alt = alt;
        imgIdx += 1;
        const p = document.createElement('p');
        p.appendChild(image);
        mediaCell.push(p);
      }
    });
  } else if (media) {
    const main = media.querySelector('#xzoom-image, img');
    if (main) mediaCell.push(main);
  }

  // ---- Text cell ----
  const textCell = [];
  const overview = element.querySelector('#overviewToggle, .xsp-overview');
  if (overview) {
    Array.from(overview.querySelectorAll('p, ul, ol, h2, h3, h4')).forEach((el) => {
      if (el.closest('ul, ol') && el.closest('ul, ol') !== el) return;
      if (el.textContent.trim()) textCell.push(el);
    });
  }

  const cells = [[mediaCell, textCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-gallery', cells });
  element.replaceWith(block);
}
