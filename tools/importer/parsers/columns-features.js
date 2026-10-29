/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-features. Base: columns.
 * Source: https://www.nxp.com/products/S32K3
 * Selector: #featuresXsp .features-xsp
 * Columns block (xwalk): no field hints. One row per feature group x 2 cells:
 *   group label (H3) | bullet list.
 */
export default function parse(element, { document }) {
  const cells = [];
  const groups = Array.from(element.querySelectorAll(':scope > .ste-list, :scope > .collapse-mobile'));
  const unique = groups.filter((g, i) => groups.indexOf(g) === i);

  unique.forEach((group) => {
    const heading = group.querySelector('h2, h3, h4');
    const labelCell = [];
    if (heading && heading.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      labelCell.push(h3);
    }
    const bodyCell = Array.from(group.querySelectorAll(':scope > ul, :scope > ol, :scope > p'));
    if (labelCell.length || bodyCell.length) cells.push([labelCell, bodyCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-features', cells });
  element.replaceWith(block);
}
