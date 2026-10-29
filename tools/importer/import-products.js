/* eslint-disable */
/* global WebImporter */

// Parsers
import heroProductParser from './parsers/hero-product.js';
import columnsJumpNavParser from './parsers/columns-jump-nav.js';
import columnsGalleryParser from './parsers/columns-gallery.js';
import tabsDiagramParser from './parsers/tabs-diagram.js';
import columnsFeaturesParser from './parsers/columns-features.js';
import tableCompareParser from './parsers/table-compare.js';
import cardsProgramParser from './parsers/cards-program.js';
import cardsProductParser from './parsers/cards-product.js';
import tableParametricParser from './parsers/table-parametric.js';
import cardsDocListParser from './parsers/cards-doc-list.js';
import cardsResourceParser from './parsers/cards-resource.js';
import searchCommunityParser from './parsers/search-community.js';
import columnsLinksParser from './parsers/columns-links.js';

// Transformers
import nxpCleanupTransformer from './transformers/nxp-cleanup.js';
import nxpSectionsTransformer from './transformers/nxp-sections.js';

const PAGE_TEMPLATE = {
  "name": "products",
  "urls": [
    "https://www.nxp.com/products/S32K3"
  ],
  "representativeUrl": "https://www.nxp.com/products/S32K3",
  "description": "NXP product family pages (hero, jump nav, overview gallery, product details, parametrics, documentation, design resources, training, support)",
  "blocks": [
    {
      "name": "hero-product",
      "instances": [
        "#hero-component-global-header",
        ".sp-hero-title-container"
      ]
    },
    {
      "name": "columns-jump-nav",
      "instances": [
        "#contextnav",
        "aside.contextnav-ste"
      ]
    },
    {
      "name": "columns-gallery",
      "instances": [
        "#rowjthecagu",
        ".row.iw_row.rich-wrapper"
      ]
    },
    {
      "name": "tabs-diagram",
      "instances": [
        "#blockdiagram .interactive-bd-component",
        ".interactive-bd-component"
      ]
    },
    {
      "name": "columns-features",
      "instances": [
        "#featuresXsp .features-xsp",
        ".features-xsp"
      ]
    },
    {
      "name": "table-compare",
      "instances": [
        "#SK32K3Table table.comparisonTable",
        "table.comparisonTable"
      ]
    },
    {
      "name": "cards-program",
      "instances": [
        "#LCA"
      ]
    },
    {
      "name": "cards-product",
      "instances": [
        "#related-products .swiper-slider-container",
        ".swiperSlider .swiper-slider-container"
      ]
    },
    {
      "name": "table-parametric",
      "instances": [
        "#buyparametricsDiv .ds-resources-content"
      ]
    },
    {
      "name": "cards-doc-list",
      "instances": [
        "#documentationDiv .ds-resources-content"
      ]
    },
    {
      "name": "cards-resource",
      "instances": [
        "#design .ds-resources-content",
        "#hardware .ds-resources-content",
        "#softwareDoc .ds-resources-content",
        "#enggservicesDoc .ds-resources-content",
        "#training .ds-resources-content"
      ]
    },
    {
      "name": "search-community",
      "instances": [
        "#support .input-group-search.communityModule",
        ".communityModule-inner .input-group-search"
      ]
    },
    {
      "name": "columns-links",
      "instances": [
        "#communityLinks",
        "article.grouped-links"
      ]
    }
  ],
  "urlPattern": "/products/*",
  "sections": [
    {
      "id": "s1",
      "name": "Product hero",
      "selector": [
        "#sectionjthecagb"
      ],
      "style": null,
      "blocks": [
        "hero-product"
      ],
      "defaultContent": []
    },
    {
      "id": "s2",
      "name": "Jump-to navigation",
      "selector": [
        "#sectionjthecagf"
      ],
      "style": null,
      "blocks": [
        "columns-jump-nav"
      ],
      "defaultContent": []
    },
    {
      "id": "s3",
      "name": "Overview",
      "selector": [
        "#rowjthecagu"
      ],
      "style": null,
      "blocks": [
        "columns-gallery"
      ],
      "defaultContent": []
    },
    {
      "id": "s4",
      "name": "Product Details",
      "selector": [
        "#iw_comp1553097818625"
      ],
      "style": null,
      "blocks": [
        "tabs-diagram",
        "columns-features",
        "table-compare",
        "cards-program",
        "cards-product"
      ],
      "defaultContent": [
        "#product-details > h2.ds-resources-big-title",
        "#product-details .ds-resources-navigation",
        "#blockdiagram h3.bd-title",
        "#blockdiagram p.bd-subtitle",
        "#features > h3",
        "#compaTableTitle > h3",
        "#LCA > h3",
        "#related-products > h3.related-title",
        "#relatedApplications"
      ]
    },
    {
      "id": "s5",
      "name": "Buy/Parametrics",
      "selector": [
        "#iw_comp1722446614217"
      ],
      "style": null,
      "blocks": [
        "table-parametric"
      ],
      "defaultContent": [
        "#buyparametricsDiv > h2.ds-resources-big-title",
        "#buyparametricsDiv > div.ds-resources-subtitle"
      ]
    },
    {
      "id": "s6",
      "name": "Documentation",
      "selector": [
        "#iw_comp1733930752981"
      ],
      "style": null,
      "blocks": [
        "cards-doc-list"
      ],
      "defaultContent": [
        "#documentationDiv > h2.ds-resources-big-title",
        "#documentationDiv > div.ds-resources-subtitle"
      ]
    },
    {
      "id": "s7",
      "name": "Design Resources",
      "selector": [
        "#iw_comp1638313320833"
      ],
      "style": null,
      "blocks": [
        "cards-resource"
      ],
      "defaultContent": [
        "#design-resources",
        "#design h3.ds-resources-title",
        "#design .ds-resources-subtitle",
        "#hardware h3.ds-resources-title",
        "#hardware .ds-resources-subtitle",
        "#softwareDoc > h3.ds-resources-title",
        "#softwareDoc > div.ds-resources-subtitle",
        "#enggservicesDoc > h3.ds-resources-title",
        "#enggservicesDoc > div.ds-resources-subtitle"
      ]
    },
    {
      "id": "s8",
      "name": "Training",
      "selector": [
        "#iw_comp1633646896654"
      ],
      "style": null,
      "blocks": [
        "cards-resource"
      ],
      "defaultContent": [
        "#training > h2.ds-resources-big-title",
        "#training > div.ds-resources-subtitle"
      ]
    },
    {
      "id": "s9",
      "name": "Support",
      "selector": [
        "#iw_comp1553097818773"
      ],
      "style": null,
      "blocks": [
        "search-community",
        "columns-links"
      ],
      "defaultContent": [
        "#gethelp",
        "#supportC"
      ]
    }
  ]
};

const parsers = {
  'hero-product': heroProductParser,
  'columns-jump-nav': columnsJumpNavParser,
  'columns-gallery': columnsGalleryParser,
  'tabs-diagram': tabsDiagramParser,
  'columns-features': columnsFeaturesParser,
  'table-compare': tableCompareParser,
  'cards-program': cardsProgramParser,
  'cards-product': cardsProductParser,
  'table-parametric': tableParametricParser,
  'cards-doc-list': cardsDocListParser,
  'cards-resource': cardsResourceParser,
  'search-community': searchCommunityParser,
  'columns-links': columnsLinksParser,
};

const transformers = [
  nxpCleanupTransformer,
  nxpSectionsTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try {
      fn(hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try {
        parser(block.element, { document, url, params });
      } catch (e) {
        console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
      }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
