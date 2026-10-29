/* eslint-disable */
/* global WebImporter */

/**
 * Parser for table-parametric. Base: table.
 * Source: https://www.nxp.com/products/S32K3
 * Selector: #buyparametricsDiv .ds-resources-content
 * Model (xwalk): container; rows use table-parametric-col-N with column1text..columnNtext (richtext).
 * First row = parameter headers, following rows = one part number each.
 * Only the results table is read; the product-selector app chrome (filters, counts,
 * XLS export, pagination) is ignored here and removed by the cleanup transformer.
 */
export default function parse(element, { document }) {
  const table = element.querySelector('#tableContainer table, table.table-prod-sel, table');
  const rows = table ? Array.from(table.querySelectorAll(':scope > thead > tr, :scope > tbody > tr')) : [];

  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

  const headerCell = (th) => {
    const label = th.querySelector('.table-filter') || th;
    const text = clean(label.textContent);
    if (!text) return null;
    const p = document.createElement('p');
    p.textContent = text;
    return [p];
  };

  const bodyCell = (td) => {
    const root = td.querySelector('.table-container-cell') || td;
    const out = [];
    const links = Array.from(root.querySelectorAll('a[href]'))
      .filter((a) => clean(a.textContent) && !/^(#|javascript)/.test(a.getAttribute('href')));
    if (links.length) {
      links.forEach((a, i) => {
        const p = document.createElement('p');
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = clean(a.textContent);
        if (i === 0 && a.classList.contains('bold')) {
          const strong = document.createElement('strong');
          strong.appendChild(link);
          p.appendChild(strong);
        } else {
          p.appendChild(link);
        }
        out.push(p);
      });
      return out;
    }
    const text = clean(root.textContent);
    if (!text) return null;
    const p = document.createElement('p');
    p.textContent = text;
    return [p];
  };

  const grid = rows.map((tr) => Array.from(tr.children)
    .filter((c) => /^(TD|TH)$/.test(c.tagName))
    .map((c) => (c.tagName === 'TH' ? headerCell(c) : bodyCell(c))));
  const width = Math.max(0, ...grid.map((r) => r.length));

  const cells = grid.map((row) => {
    const out = [];
    for (let i = 0; i < width; i += 1) {
      const frag = document.createDocumentFragment();
      const content = row[i];
      if (content && content.length) {
        frag.appendChild(document.createComment(` field:column${i + 1}text `));
        content.forEach((n) => frag.appendChild(n));
      }
      out.push(frag);
    }
    return out;
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-parametric', cells });
  element.replaceWith(block);
}
