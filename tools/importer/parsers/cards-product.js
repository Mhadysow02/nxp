/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-product. Base: cards.
 * Source: https://www.nxp.com/products/S32K3
 * Selector: #related-products .swiper-slider-container
 * Model (xwalk): container, item cards-product-card: image (reference, +imageAlt collapsed), text (richtext).
 * One row per product box: [product image] [H3 name link, status, relation tag, description, data sheet links].
 */
export default function parse(element, { document }) {
  const cells = [];
  const boxes = Array.from(element.querySelectorAll('article.box-container'));

  const mkLink = (a, text) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = text || a.textContent.trim();
    return link;
  };

  boxes.forEach((box) => {
    const img = box.querySelector('.box-opts-image img, figure img');
    const content = box.querySelector('.box-opts-content') || box;
    const titleLink = content.querySelector('.prodStatus-heading h3 a[href], h3 a[href], h4 a[href]');
    const titleEl = content.querySelector('.prodStatus-heading h3, h3, h4');
    const status = content.querySelector('.prodStatus-heading .svg-icon, .prodStatus-heading span');
    const tags = Array.from(content.querySelectorAll('ul.metadata > li'));
    const desc = Array.from(content.querySelectorAll(':scope > p'));
    const docList = content.querySelector('ul.nav-piped-2');
    const name = titleEl ? titleEl.textContent.trim() : '';

    // Image cell
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      const image = document.createElement('img');
      let src = img.getAttribute('src') || '';
      if (/\.svg$/i.test(src)) src = `${src}?fmt=svg`;
      image.src = src;
      const alt = (img.getAttribute('alt') || '').trim() || name;
      if (alt) image.alt = alt;
      imageCell.appendChild(image);
    }

    // Text cell
    const parts = [];
    if (name) {
      const h3 = document.createElement('h3');
      if (titleLink) h3.appendChild(mkLink(titleLink, name));
      else h3.textContent = name;
      parts.push(h3);
    }
    if (status && status.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = status.textContent.trim();
      parts.push(p);
    }
    tags.forEach((li) => {
      if (!li.textContent.trim()) return;
      const p = document.createElement('p');
      const em = document.createElement('em');
      em.textContent = li.textContent.trim();
      p.appendChild(em);
      parts.push(p);
    });
    desc.forEach((d) => {
      if (!d.textContent.trim()) return;
      const p = document.createElement('p');
      p.textContent = d.textContent.trim().replace(/\s+/g, ' ');
      parts.push(p);
    });
    if (docList) {
      const p = document.createElement('p');
      const label = docList.querySelector('li.title');
      if (label && label.textContent.trim()) {
        const strong = document.createElement('strong');
        strong.textContent = label.textContent.trim();
        p.appendChild(strong);
      }
      Array.from(docList.querySelectorAll('li a[href]')).forEach((a) => {
        if (!a.textContent.trim()) return;
        if (p.childNodes.length) p.appendChild(document.createTextNode(' '));
        p.appendChild(mkLink(a));
      });
      if (p.textContent.trim()) parts.push(p);
    }

    const textCell = document.createDocumentFragment();
    if (parts.length) {
      textCell.appendChild(document.createComment(' field:text '));
      parts.forEach((el) => textCell.appendChild(el));
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
