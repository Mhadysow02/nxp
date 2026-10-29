/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-diagram. Base: tabs.
 * Source: https://www.nxp.com/products/S32K3
 * Selector: #blockdiagram .interactive-bd-component
 * Model (xwalk): container, item tabs-diagram-item:
 *   title (text) | content_heading (+Type collapsed), content_image, content_richtext (grouped)
 * One row per diagram: [tab label] [H3 title, diagram image, PDF link].
 */
export default function parse(element, { document }) {
  const cells = [];

  // Section heading ("Block Diagram") stays as default content before the block
  const sectionTitle = element.querySelector(':scope > h3.bd-title, :scope > h2');

  // Shared "Get diagram PDF" link from the modal footer
  const pdfLink = Array.from(element.querySelectorAll('a[href]'))
    .find((a) => /\.pdf(\?|$)/i.test(a.getAttribute('href')) && a.textContent.trim());

  const toggles = Array.from(element.querySelectorAll('ul.bd-toggle > li > a'));
  const panes = Array.from(element.querySelectorAll('.tab-content > .tab-pane'));

  panes.forEach((pane, i) => {
    const toggle = toggles.find((a) => a.getAttribute('href') === `#${pane.id}`) || toggles[i];
    const heading = pane.querySelector('.bd-media-title, h3, h4');
    const img = pane.querySelector('.bd-img img, figure img, img');
    const label = (toggle && toggle.textContent.trim()) || (heading && heading.textContent.trim()) || '';

    // Cell 1: tab title
    const titleCell = document.createDocumentFragment();
    if (label) {
      titleCell.appendChild(document.createComment(' field:title '));
      titleCell.appendChild(document.createTextNode(label));
    }

    // Cell 2: content group (heading, image, richtext)
    const contentCell = document.createDocumentFragment();
    if (heading && heading.textContent.trim()) {
      contentCell.appendChild(document.createComment(' field:content_heading '));
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      contentCell.appendChild(h3);
    }
    if (img) {
      contentCell.appendChild(document.createComment(' field:content_image '));
      const image = document.createElement('img');
      // html2md turns any src ending in ".svg" into an :icon: token; keep diagrams as images
      let src = img.getAttribute('src') || '';
      if (/\.svg$/i.test(src)) src = `${src}?fmt=svg`;
      image.src = src;
      const alt = (img.getAttribute('alt') || '').trim();
      if (alt) image.alt = alt;
      contentCell.appendChild(image);
    }
    if (pdfLink) {
      contentCell.appendChild(document.createComment(' field:content_richtext '));
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = pdfLink.getAttribute('href');
      a.textContent = pdfLink.textContent.trim();
      p.appendChild(a);
      contentCell.appendChild(p);
    }

    cells.push([titleCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-diagram', cells });
  if (sectionTitle && sectionTitle.textContent.trim()) {
    const h3 = document.createElement('h3');
    h3.textContent = sectionTitle.textContent.trim();
    element.before(h3);
  }
  element.replaceWith(block);
}
