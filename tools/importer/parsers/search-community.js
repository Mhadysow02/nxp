/* eslint-disable */
/* global WebImporter */

/**
 * Parser for search-community. Base: search.
 * Source: https://www.nxp.com/products/S32K3
 * Selector: #support .input-group-search.communityModule
 * Model (xwalk): index (text), placeholder (text), buttonLabel (text) -> 3 rows, 1 cell each.
 *   Row 1: NXP Community search URL (empty "q" parameter stripped)
 *   Row 2: input placeholder (empty when the source has none; block falls back to its default)
 *   Row 3: submit button label
 * The "Narrow your search" dropdown is client-side suggestion UI and is not authored.
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const DEFAULT_TARGET = 'https://community.nxp.com/t5/forums/searchpage/tab/message';

  const button = element.querySelector('#keywordCommunitiesBtn, .search-btn a[href], a.btn-search');
  const input = element.querySelector('input#communityKeywordText, input.search-input, input');

  // Row 1: search target
  let target = DEFAULT_TARGET;
  const rawHref = (button && button.getAttribute('href'))
    || (element.querySelector('a[href*="community.nxp.com"]') || { getAttribute: () => '' }).getAttribute('href');
  if (rawHref) {
    try {
      const url = new URL(rawHref, 'https://www.nxp.com');
      if (!url.searchParams.get('q')) url.searchParams.delete('q');
      target = url.toString();
    } catch (e) {
      // keep default
    }
  }
  const indexCell = document.createDocumentFragment();
  indexCell.appendChild(document.createComment(' field:index '));
  indexCell.appendChild(document.createTextNode(target));

  // Row 2: placeholder
  const placeholder = input ? clean(input.getAttribute('placeholder') || input.getAttribute('aria-label')) : '';
  const placeholderCell = document.createDocumentFragment();
  if (placeholder) {
    placeholderCell.appendChild(document.createComment(' field:placeholder '));
    placeholderCell.appendChild(document.createTextNode(placeholder));
  }

  // Row 3: button label
  const label = button ? clean(button.textContent) : '';
  const labelCell = document.createDocumentFragment();
  if (label) {
    labelCell.appendChild(document.createComment(' field:buttonLabel '));
    labelCell.appendChild(document.createTextNode(label));
  }

  const cells = [[indexCell], [placeholderCell], [labelCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'search-community', cells });
  element.replaceWith(block);
}
