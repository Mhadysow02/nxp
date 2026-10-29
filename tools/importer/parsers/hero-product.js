/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-product. Base: hero.
 * Source: https://www.nxp.com/products/S32K3
 * Selector: #hero-component-global-header (.sp-hero-title-container)
 * Model (xwalk): image (reference) + imageAlt (collapsed), text (richtext).
 * Rows: [background image (empty on source)], [H1 title, product code, status link, alerts CTA].
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: optional background image (none on product heroes, keep row empty)
  const img = element.querySelector(':scope > picture img, :scope > img, .sp-hero-image img');
  const imageCell = document.createDocumentFragment();
  if (img) {
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(img);
  }
  cells.push([imageCell]);

  // Row 2: text (title, product code, lifecycle status, alerts CTA)
  const textCell = document.createDocumentFragment();
  const title = element.querySelector('h1.sp-hero-title, h1, h2');
  const meta = element.querySelector('.sp-hero-metadata');
  const content = [];

  if (title) {
    const h1 = document.createElement('h1');
    h1.textContent = title.textContent.trim();
    content.push(h1);
  }

  if (meta) {
    const code = meta.querySelector('.sp-hero-others-codeid');
    if (code && code.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = code.textContent.trim();
      content.push(p);
    }

    const status = meta.querySelector('.product-status');
    if (status && status.textContent.trim()) {
      const p = document.createElement('p');
      const statusLink = status.closest('a[href]');
      if (statusLink) {
        const a = document.createElement('a');
        a.href = statusLink.getAttribute('href');
        a.textContent = status.textContent.trim();
        p.appendChild(a);
      } else {
        p.textContent = status.textContent.trim();
      }
      content.push(p);
    }

    const alerts = meta.querySelector('.recieve-alerts a, a.btn-follow');
    if (alerts && alerts.textContent.trim()) {
      const p = document.createElement('p');
      const href = alerts.getAttribute('href');
      if (href && href !== '#' && !href.startsWith('javascript')) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = alerts.textContent.trim();
        p.appendChild(a);
      } else {
        p.textContent = alerts.textContent.trim();
      }
      content.push(p);
    }
  }

  if (content.length) {
    textCell.appendChild(document.createComment(' field:text '));
    content.forEach((el) => textCell.appendChild(el));
  }
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-product', cells });
  element.replaceWith(block);
}
