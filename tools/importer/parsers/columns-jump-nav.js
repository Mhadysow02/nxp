/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-jump-nav. Base: columns.
 * Source: https://www.nxp.com/products/S32K3
 * Selector: #contextnav (aside.contextnav-ste)
 * Columns block (xwalk): no field hints. One row x 3 cells:
 *   label | in-page anchor links (list) | action buttons.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('ul.contextnav > li'));

  // Cell 1: label ("Jump To")
  const labelCell = [];
  const label = element.querySelector('ul.contextnav > li h2, h2, h3');
  if (label && label.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = label.textContent.trim();
    labelCell.push(p);
  }

  // Cell 2: anchor links; Cell 3: action buttons (li.has-buttons)
  const ul = document.createElement('ul');
  const actionsCell = [];
  items.forEach((li) => {
    const a = li.querySelector(':scope > a[href]');
    if (!a || !a.textContent.trim()) return;
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    if (li.classList.contains('has-buttons')) {
      const p = document.createElement('p');
      if (a.classList.contains('btn-primary')) {
        const strong = document.createElement('strong');
        strong.appendChild(link);
        p.appendChild(strong);
      } else {
        p.appendChild(link);
      }
      actionsCell.push(p);
    } else {
      const item = document.createElement('li');
      item.appendChild(link);
      ul.appendChild(item);
    }
  });

  const linksCell = ul.children.length ? [ul] : [];
  const cells = [[labelCell, linksCell, actionsCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-jump-nav', cells });
  element.replaceWith(block);
}
