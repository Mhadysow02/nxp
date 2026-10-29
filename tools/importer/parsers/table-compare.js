/* eslint-disable */
/* global WebImporter */

/**
 * Parser for table-compare. Base: table.
 * Source: https://www.nxp.com/products/S32K3
 * Selector: #SK32K3Table table.comparisonTable
 * Model (xwalk): container; rows use table-compare-col-N with column1text..columnNtext (richtext).
 * First row = header cells, following rows = body cells. Rows padded to the widest row.
 */
export default function parse(element, { document }) {
  const table = element.matches('table') ? element : element.querySelector('table');
  const rows = table ? Array.from(table.querySelectorAll(':scope > thead > tr, :scope > tbody > tr, :scope > tr')) : [];

  // Expand colspans so every row has the same number of cells
  const grid = rows.map((tr) => {
    const out = [];
    Array.from(tr.children).filter((c) => /^(TD|TH)$/.test(c.tagName)).forEach((c) => {
      out.push(c);
      const span = parseInt(c.getAttribute('colspan') || '1', 10);
      for (let i = 1; i < span; i += 1) out.push(null);
    });
    return out;
  });
  let width = Math.max(0, ...grid.map((r) => r.length));
  // Drop trailing columns that are empty in every row (stray/hidden source cells)
  const isFilled = (c) => c && (c.textContent.trim() || c.querySelector('img, a'));
  while (width > 1 && grid.every((r) => !isFilled(r[width - 1]))) width -= 1;

  const cells = grid.map((row) => {
    const out = [];
    for (let i = 0; i < width; i += 1) {
      const cell = row[i];
      const frag = document.createDocumentFragment();
      const hasContent = cell && (cell.textContent.trim() || cell.querySelector('img, a'));
      if (hasContent) {
        frag.appendChild(document.createComment(` field:column${i + 1}text `));
        const blockChildren = Array.from(cell.children).filter((c) => /^(P|UL|OL|H[1-6]|DIV|TABLE)$/.test(c.tagName));
        if (blockChildren.length) {
          Array.from(cell.childNodes).forEach((n) => frag.appendChild(n));
        } else if (cell.tagName === 'TH') {
          const p = document.createElement('p');
          const strong = document.createElement('strong');
          strong.textContent = cell.textContent.trim();
          p.appendChild(strong);
          frag.appendChild(p);
        } else {
          const p = document.createElement('p');
          Array.from(cell.childNodes).forEach((n) => p.appendChild(n));
          frag.appendChild(p);
        }
      }
      out.push(frag);
    }
    return out;
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-compare', cells });
  element.replaceWith(block);
}
