/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-links. Base: columns.
 * Source: https://www.nxp.com/products/S32K3
 * Selector: #communityLinks (article.grouped-links)
 * Columns block (xwalk): no field hints. One row, one cell per link group:
 *   group heading (H4) + link list.
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const container = element.querySelector('.grouped-links-container') || element;
  const groups = Array.from(container.children).filter((c) => c.querySelector('ul.grouped-links-list, ul'));

  const row = groups.map((group) => {
    const cell = [];
    const title = group.querySelector('.grouped-links-title, h2, h3, h4');
    if (title && clean(title.textContent)) {
      const h4 = document.createElement('h4');
      h4.textContent = clean(title.textContent);
      cell.push(h4);
    }
    const ul = document.createElement('ul');
    Array.from(group.querySelectorAll('ul > li')).forEach((li) => {
      const a = li.querySelector('a[href]');
      if (!a || !clean(a.textContent)) return;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = clean(a.textContent);
      item.appendChild(link);
      ul.appendChild(item);
    });
    if (ul.children.length) cell.push(ul);
    return cell;
  });

  const cells = row.length ? [row] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-links', cells });
  element.replaceWith(block);
}
