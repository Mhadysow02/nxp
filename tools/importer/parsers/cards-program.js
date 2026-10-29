/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-program. Base: cards.
 * Source: https://www.nxp.com/products/S32K3
 * Selector: #LCA
 * Model (xwalk): container, item cards-program-card: image (reference, +imageAlt collapsed), text (richtext).
 * One row per program: [logo image] [H4 title, description, Read more link].
 * The group heading ("Product Programs") is kept as default content before the block.
 */
export default function parse(element, { document }) {
  const cells = [];
  const heading = element.querySelector(':scope > h2, :scope > h3');
  const items = Array.from(element.querySelectorAll('article.secondary-topic-item'));

  items.forEach((item) => {
    const img = item.querySelector('.secondary-topic-media img, figure img');
    const title = item.querySelector('.secondary-topic-title, h4, h3');
    const desc = item.querySelector('.secondary-topic-text');
    const links = Array.from(item.querySelectorAll('.secondary-topic-link a[href]'));

    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      const image = document.createElement('img');
      // html2md turns any src ending in ".svg" into an :icon: token; keep logos as images
      let src = img.getAttribute('src') || '';
      if (/\.svg$/i.test(src)) src = `${src}?fmt=svg`;
      image.src = src;
      const alt = (img.getAttribute('alt') || '').trim() || (title ? title.textContent.trim() : '');
      if (alt) image.alt = alt;
      imageCell.appendChild(image);
    }

    const textCell = document.createDocumentFragment();
    const content = [];
    if (title && title.textContent.trim()) {
      const h4 = document.createElement('h4');
      h4.textContent = title.textContent.trim();
      content.push(h4);
    }
    if (desc) {
      const paras = Array.from(desc.querySelectorAll(':scope > p, :scope > ul, :scope > ol'));
      if (paras.length) content.push(...paras);
      else if (desc.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        content.push(p);
      }
    }
    links.forEach((a) => {
      if (!a.textContent.trim()) return;
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent.trim();
      p.appendChild(link);
      content.push(p);
    });
    if (content.length) {
      textCell.appendChild(document.createComment(' field:text '));
      content.forEach((el) => textCell.appendChild(el));
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-program', cells });
  if (heading && heading.textContent.trim()) {
    const h3 = document.createElement('h3');
    h3.textContent = heading.textContent.trim();
    element.before(h3);
  }
  element.replaceWith(block);
}
