/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-resource. Base: cards.
 * Source: https://www.nxp.com/products/S32K3
 * Selectors: #design / #hardware / #softwareDoc / #enggservicesDoc / #training .ds-resources-content
 * Model (xwalk): container, item cards-resource-card: image (reference, +imageAlt collapsed), text (richtext).
 * One row per retrieved item: [optional image] [eyebrow, H4 title (link), badges, metadata, account note].
 * Authored notes around the list (engineering-services alert, desktop / partner-marketplace notes)
 * are kept as default content before / after the block. App-only alerts with javascript or
 * empty links (eCad loader, partner-training toggle) are dropped.
 * Facets, keyword filter, sort and result counts are removed by the cleanup transformer.
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const usable = (a) => {
    const href = a && a.getAttribute('href');
    return !!href && href !== '#' && !href.startsWith('javascript');
  };
  const mkLink = (a, text) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = text || clean(a.textContent);
    return link;
  };

  const scope = element.querySelector('.ds-column-right:not(.hidden)') || element;
  const list = scope.querySelector('ul.retrieved-items');
  const items = list
    ? Array.from(list.querySelectorAll(':scope > li.retrieved-item')).filter((li) => li.querySelector('.title-and-elements'))
    : [];

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector(':scope > figure.item-media img, :scope > figure img');
    const body = item.querySelector(':scope > .item-body') || item;
    const signpost = body.querySelector('.item-signpost');
    const titleWrap = body.querySelector('.title-and-elements');
    const titleLink = Array.from(titleWrap.querySelectorAll(':scope > a[href]'))
      .find((a) => usable(a) && !a.querySelector('.product-status'));
    const titleSpan = titleWrap.querySelector(':scope > span:not(.marker)');
    // Fallback title text must not include badge/status text (e.g. "Featured")
    const titleSource = (titleLink || titleSpan || titleWrap).cloneNode(true);
    titleSource.querySelectorAll('.marker, .product-status').forEach((m) => m.remove());
    const titleText = clean(titleSource.textContent);
    const markers = Array.from(titleWrap.querySelectorAll('.marker'));
    const status = titleWrap.querySelector('.product-status');
    const metaItems = Array.from(body.querySelectorAll('.metadata > .meta-item'));
    const security = body.querySelector('.security-status');

    // Image cell
    const imageCell = document.createDocumentFragment();
    if (img && img.getAttribute('src')) {
      imageCell.appendChild(document.createComment(' field:image '));
      const image = document.createElement('img');
      let src = img.getAttribute('src');
      if (/\.svg$/i.test(src)) src = `${src}?fmt=svg`;
      image.src = src;
      const alt = clean(img.getAttribute('alt'));
      image.alt = alt && alt !== 'placeholder image' ? alt : titleText;
      imageCell.appendChild(image);
    }

    // Text cell
    const parts = [];
    if (signpost && clean(signpost.textContent)) {
      const p = document.createElement('p');
      p.textContent = clean(signpost.textContent);
      parts.push(p);
    }
    if (titleText) {
      const h4 = document.createElement('h4');
      if (titleLink) h4.appendChild(mkLink(titleLink, titleText));
      else h4.textContent = titleText;
      parts.push(h4);
    }
    const badges = [];
    markers.forEach((m) => {
      if (!clean(m.textContent)) return;
      const em = document.createElement('em');
      em.textContent = clean(m.textContent);
      badges.push(em);
    });
    if (status && clean(status.textContent)) {
      const statusLink = status.closest('a');
      badges.push(usable(statusLink) ? mkLink(statusLink, clean(status.textContent)) : document.createTextNode(clean(status.textContent)));
    }
    if (badges.length) {
      const p = document.createElement('p');
      badges.forEach((b, i) => {
        if (i) p.appendChild(document.createTextNode(' '));
        p.appendChild(b);
      });
      parts.push(p);
    }
    if (metaItems.length) {
      const p = document.createElement('p');
      metaItems.forEach((mi) => {
        const text = clean(mi.textContent);
        if (!text) return;
        if (p.childNodes.length) p.appendChild(document.createTextNode(' | '));
        const link = Array.from(mi.querySelectorAll('a[href]')).find(usable);
        if (link) {
          const linkText = clean(link.textContent);
          const before = text.slice(0, text.indexOf(linkText)).trim();
          if (before) p.appendChild(document.createTextNode(`${before} `));
          p.appendChild(mkLink(link, linkText));
        } else {
          p.appendChild(document.createTextNode(text));
        }
      });
      if (p.childNodes.length) parts.push(p);
    }
    if (security && clean(security.textContent)) {
      const p = document.createElement('p');
      p.textContent = clean(security.textContent);
      parts.push(p);
    }

    if (!parts.length) return;
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    parts.forEach((el) => textCell.appendChild(el));
    cells.push([imageCell, textCell]);
  });

  // Authored notes around the list become default content
  const toParagraph = (el) => {
    if (el.querySelector('a[href^="javascript"]') || el.querySelector('a:not([href])')) return null;
    if (!clean(el.textContent)) return null;
    const src = el.matches('p') ? el : el.querySelector('p') || el;
    const p = document.createElement('p');
    Array.from(src.childNodes).forEach((n) => p.appendChild(n));
    return p;
  };
  const before = [];
  const after = [];
  if (list) {
    let seenList = false;
    Array.from(scope.children).forEach((child) => {
      if (child === list) { seenList = true; return; }
      if (child.matches('.ds-column-left, .keyword-filter-bar, .results-controls, input, nav, .pagination')) return;
      if (child.querySelector('.keyword-filter-bar, .sort-results, select, input.search-input')) return;
      const p = toParagraph(child);
      if (p) (seenList ? after : before).push(p);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-resource', cells });
  before.forEach((p) => element.before(p));
  after.reverse().forEach((p) => element.after(p));
  element.replaceWith(block);
}
