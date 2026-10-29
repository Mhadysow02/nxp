/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-doc-list. Base: cards.
 * Source: https://www.nxp.com/products/S32K3
 * Selector: #documentationDiv .ds-resources-content
 * Model (xwalk): container, item cards-doc-list-card: image (reference, +imageAlt collapsed), text (richtext).
 * One row per document (no image): [empty] [title link + doc id (+ Featured), format links, date | revision].
 * Reads the compact list view (all doc-type groups, in document order); nested child
 * entries are skipped because they are repeated as top-level items in their own group.
 * Facets, sort and pagination are removed by the cleanup transformer and ignored here.
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const scope = element.querySelector('.ds-column-right:not(.hidden)') || element;

  let items = Array.from(scope.querySelectorAll('#compactListView ul.compact-list:not(.compact-list__nested) > li.compact-item'));
  if (!items.length) {
    items = Array.from(scope.querySelectorAll('ul.compact-list:not(.compact-list__nested) > li.compact-item'));
  }

  const mkLink = (a, text) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = text || clean(a.textContent);
    return link;
  };

  const cells = [];
  items.forEach((item) => {
    const content = item.querySelector(':scope > .compact-content-wrapper > .compact-content') || item;
    const titleWrap = content.querySelector('.compact-title .title-and-elements, .compact-title');
    const titleLink = titleWrap && titleWrap.querySelector('a[href]');
    const code = titleWrap && titleWrap.querySelector('.code-id');
    const markers = titleWrap ? Array.from(titleWrap.querySelectorAll('.marker')) : [];
    const formats = Array.from(content.querySelectorAll('.compact-metadata .format a[href]'));
    const date = content.querySelector('.compact-metadata .date');
    const rev = content.querySelector('.compact-metadata .revision');

    const parts = [];
    if (titleWrap) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      if (titleLink) strong.appendChild(mkLink(titleLink));
      else strong.textContent = clean(titleWrap.textContent);
      p.appendChild(strong);
      if (code && clean(code.textContent)) p.appendChild(document.createTextNode(` ${clean(code.textContent)}`));
      markers.forEach((m) => {
        if (!clean(m.textContent)) return;
        p.appendChild(document.createTextNode(' '));
        const em = document.createElement('em');
        em.textContent = clean(m.textContent);
        p.appendChild(em);
      });
      parts.push(p);
    }
    if (formats.length) {
      const p = document.createElement('p');
      formats.forEach((a, i) => {
        if (i) p.appendChild(document.createTextNode(' | '));
        p.appendChild(mkLink(a));
      });
      parts.push(p);
    }
    const meta = [date, rev].map((e) => (e ? clean(e.textContent) : '')).filter(Boolean);
    if (meta.length) {
      const p = document.createElement('p');
      p.textContent = meta.join(' | ');
      parts.push(p);
    }

    if (!parts.length) return;
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    parts.forEach((el) => textCell.appendChild(el));
    cells.push([document.createDocumentFragment(), textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-doc-list', cells });
  // The live page re-renders result controls and the grouped/list views next to the
  // parsed container; drop those leftovers so the documents are not duplicated.
  const host = element.closest('#documentationDiv, .ds-resources-block');
  element.replaceWith(block);
  if (host) {
    host.querySelectorAll('.ds-column-left, .ds-column-right, .ds-resources-sorting, .results-controls, #compactListView, #listView, ul.retrieved-items, ul.compact-list')
      .forEach((el) => { if (!block.contains(el)) el.remove(); });
  }
}
