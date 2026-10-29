/* eslint-disable */
/* global WebImporter */

/**
 * NXP cleanup transformer.
 * Removes global chrome, widgets, tracking and app-only UI (facets, sort,
 * keyword filters, pagination, hidden duplicate tab panes) from NXP product
 * pages, keeping the authored content the block parsers rely on.
 * Selectors come from migration-work/cleaned.html (www.nxp.com/products/S32K3).
 */

function remove(element, selectors) {
  selectors.forEach((sel) => {
    element.querySelectorAll(sel).forEach((el) => el.remove());
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    remove(element, [
      // Global header / mobile nav
      '#sectionirs5dxuw',
      'header.loadnav',
      'div.site-header',
      '#nxp-mobile-nav',
      // Global footer
      '#sectionirs5dxv0',
      'footer.loadnav',
      // Breadcrumb trail with category dropdowns
      '#sectionjthecag7',
      // Recently viewed products (per-visitor history)
      '#iw_comp1743604526417',
      '#RecentlyViewedXSP',
      // Chat widgets and overlays
      '#ask-nxp-chat-app',
      '#ask-nxp-chat-bubble-trigger',
      '#embedded-messaging',
      '#embeddedMessagingSiteContextFrame',
      '#messaging_invite_button',
      '.messaging_invite_button_standard',
      // Cookie banner, modals, tracking
      '#onetrust-consent-sdk',
      '#progressiveModal',
      '#ClickTaleDiv',
      '#universal_pixel_b80bwdg',
      '.progressiveProfiling',
      // Hidden state inputs
      'body > input',
      '.iw_component > input',
      '.ds-resources-content > input',
      '.ds-column-right > input',
      // Hidden duplicate tab panes (NXP / Partner / Secure states) outside the visible lists
      '.iw_component > .nav-container.filter-list-sticky.hidden',
      '.iw_component > .ds-column-right.hidden',
      '.iw_component > [id$="RightSection"].hidden',
      // Facet sidebars, sign-in and loader placeholders inside resource lists
      '.ds-resources-content > .ds-column-left',
      '.ds-resources-content > .ds-column-right.hidden',
      // Keyword filter bars and sort / result-count controls
      '.ds-resources-sorting .keyword-filter-bar',
      '.ds-resources-sorting .sort-results',
      '.ds-column-right > section.results-controls',
      '#engg-services-noresult',
      // Parametric table app chrome (result count, XLS, side filters, pagination)
      '#product-selector-v2-app .table-header-container',
      '#product-selector-v2-app .side',
      '#product-selector-v2-app .static-elements',
      '#product-selector-v2-app nav.table-footer',
      // Bookmark / collection controls and download-manager alerts
      '.item-options',
      '.item-options-collections',
      '#createCollectionAlert',
      '#downloadManagerAlert',
      '#downloadManagerMacOSNotSupportedAlert',
      // Video.js player UI (keep video/poster)
      '.vjs-control-bar',
      '.vjs-modal-dialog',
      '.vjs-loading-spinner',
      '.vjs-big-play-button',
      '.vjs-text-track-display',
      '.vjs-title-bar',
      // Carousel arrows
      '.swiper-button-next',
      '.swiper-button-prev',
    ]);

    // Drop now-empty sorting wrappers (ES keeps its authored alert note).
    element.querySelectorAll('.ds-resources-sorting').forEach((el) => {
      if (!el.textContent.trim() && !el.querySelector('img, a')) el.remove();
    });

    // "Show All" is a client-side expand toggle, not an authored link.
    element.querySelectorAll('a#btnShow').forEach((a) => {
      const href = (a.getAttribute('href') || '').trim();
      if (!href || href === '#' || href.startsWith('javascript')) a.remove();
    });
  }

  if (hookName === 'afterTransform') {
    remove(element, [
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
      'object',
      'embed',
      'form:not(:has(*))',
    ]);

    // Strip tracking / app attributes.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach(({ name }) => {
        if (
          name.startsWith('data-dtm')
          || name.startsWith('data-track')
          || name.startsWith('data-analytics')
          || name.startsWith('data-gtm')
          || name.startsWith('on')
        ) {
          el.removeAttribute(name);
        }
      });
    });
  }
}
