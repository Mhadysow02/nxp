/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-products.js
  var import_products_exports = {};
  __export(import_products_exports, {
    default: () => import_products_default
  });

  // tools/importer/parsers/hero-product.js
  function parse(element, { document }) {
    const cells = [];
    const img = element.querySelector(":scope > picture img, :scope > img, .sp-hero-image img");
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(" field:image "));
      imageCell.appendChild(img);
    }
    cells.push([imageCell]);
    const textCell = document.createDocumentFragment();
    const title = element.querySelector("h1.sp-hero-title, h1, h2");
    const meta = element.querySelector(".sp-hero-metadata");
    const content = [];
    if (title) {
      const h1 = document.createElement("h1");
      h1.textContent = title.textContent.trim();
      content.push(h1);
    }
    if (meta) {
      const code = meta.querySelector(".sp-hero-others-codeid");
      if (code && code.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = code.textContent.trim();
        content.push(p);
      }
      const status = meta.querySelector(".product-status");
      if (status && status.textContent.trim()) {
        const p = document.createElement("p");
        const statusLink = status.closest("a[href]");
        if (statusLink) {
          const a = document.createElement("a");
          a.href = statusLink.getAttribute("href");
          a.textContent = status.textContent.trim();
          p.appendChild(a);
        } else {
          p.textContent = status.textContent.trim();
        }
        content.push(p);
      }
      const alerts = meta.querySelector(".recieve-alerts a, a.btn-follow");
      if (alerts && alerts.textContent.trim()) {
        const p = document.createElement("p");
        const href = alerts.getAttribute("href");
        if (href && href !== "#" && !href.startsWith("javascript")) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = alerts.textContent.trim();
          p.appendChild(a);
        } else {
          p.textContent = alerts.textContent.trim();
        }
        content.push(p);
      }
    }
    if (content.length) {
      textCell.appendChild(document.createComment(" field:text "));
      content.forEach((el) => textCell.appendChild(el));
    }
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-jump-nav.js
  function parse2(element, { document }) {
    const items = Array.from(element.querySelectorAll("ul.contextnav > li"));
    const labelCell = [];
    const label = element.querySelector("ul.contextnav > li h2, h2, h3");
    if (label && label.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = label.textContent.trim();
      labelCell.push(p);
    }
    const ul = document.createElement("ul");
    const actionsCell = [];
    items.forEach((li) => {
      const a = li.querySelector(":scope > a[href]");
      if (!a || !a.textContent.trim()) return;
      const link = document.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.trim();
      if (li.classList.contains("has-buttons")) {
        const p = document.createElement("p");
        if (a.classList.contains("btn-primary")) {
          const strong = document.createElement("strong");
          strong.appendChild(link);
          p.appendChild(strong);
        } else {
          p.appendChild(link);
        }
        actionsCell.push(p);
      } else {
        const item = document.createElement("li");
        item.appendChild(link);
        ul.appendChild(item);
      }
    });
    const linksCell = ul.children.length ? [ul] : [];
    const cells = [[labelCell, linksCell, actionsCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-jump-nav", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-gallery.js
  function parse3(element, { document }) {
    const toAbs = (href) => {
      if (!href) return href;
      if (/^https?:\/\//.test(href)) return href;
      if (href.startsWith("/")) return `https://www.nxp.com${href}`;
      return href;
    };
    const mediaCell = [];
    const media = element.querySelector(".xsp-richMedia, #richmedia");
    const thumbsWrap = media && media.querySelector("#xzoom-images, .xzoom-thumbs:not(.modal-img)");
    const videoTitles = media ? Array.from(media.querySelectorAll(".video-container figure img")).map((i) => (i.getAttribute("alt") || "").trim()) : [];
    const modalTitle = media && media.querySelector("#modalTitle");
    if (thumbsWrap) {
      let videoIdx = 0;
      let imgIdx = 0;
      Array.from(thumbsWrap.querySelectorAll(":scope > a")).forEach((a) => {
        const img = a.querySelector("img");
        const isVideo = !!a.querySelector("figure") || /\/videos\//.test(a.getAttribute("href") || "");
        if (isVideo) {
          const title = videoTitles[videoIdx] || img && img.getAttribute("alt") || `Video ${videoIdx + 1}`;
          videoIdx += 1;
          const p = document.createElement("p");
          const link = document.createElement("a");
          link.href = toAbs(a.getAttribute("href"));
          link.textContent = title;
          p.appendChild(link);
          mediaCell.push(p);
        } else if (img) {
          const image = document.createElement("img");
          image.src = img.getAttribute("src");
          const alt = img.getAttribute("alt") || (imgIdx === 0 && modalTitle ? modalTitle.textContent.trim() : "");
          if (alt) image.alt = alt;
          imgIdx += 1;
          const p = document.createElement("p");
          p.appendChild(image);
          mediaCell.push(p);
        }
      });
    } else if (media) {
      const main = media.querySelector("#xzoom-image, img");
      if (main) mediaCell.push(main);
    }
    const textCell = [];
    const overview = element.querySelector("#overviewToggle, .xsp-overview");
    if (overview) {
      Array.from(overview.querySelectorAll("p, ul, ol, h2, h3, h4")).forEach((el) => {
        if (el.closest("ul, ol") && el.closest("ul, ol") !== el) return;
        if (el.textContent.trim()) textCell.push(el);
      });
    }
    const cells = [[mediaCell, textCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-diagram.js
  function parse4(element, { document }) {
    const cells = [];
    const sectionTitle = element.querySelector(":scope > h3.bd-title, :scope > h2");
    const pdfLink = Array.from(element.querySelectorAll("a[href]")).find((a) => /\.pdf(\?|$)/i.test(a.getAttribute("href")) && a.textContent.trim());
    const toggles = Array.from(element.querySelectorAll("ul.bd-toggle > li > a"));
    const panes = Array.from(element.querySelectorAll(".tab-content > .tab-pane"));
    panes.forEach((pane, i) => {
      const toggle = toggles.find((a) => a.getAttribute("href") === `#${pane.id}`) || toggles[i];
      const heading = pane.querySelector(".bd-media-title, h3, h4");
      const img = pane.querySelector(".bd-img img, figure img, img");
      const label = toggle && toggle.textContent.trim() || heading && heading.textContent.trim() || "";
      const titleCell = document.createDocumentFragment();
      if (label) {
        titleCell.appendChild(document.createComment(" field:title "));
        titleCell.appendChild(document.createTextNode(label));
      }
      const contentCell = document.createDocumentFragment();
      if (heading && heading.textContent.trim()) {
        contentCell.appendChild(document.createComment(" field:content_heading "));
        const h3 = document.createElement("h3");
        h3.textContent = heading.textContent.trim();
        contentCell.appendChild(h3);
      }
      if (img) {
        contentCell.appendChild(document.createComment(" field:content_image "));
        const image = document.createElement("img");
        let src = img.getAttribute("src") || "";
        if (/\.svg$/i.test(src)) src = `${src}?fmt=svg`;
        image.src = src;
        const alt = (img.getAttribute("alt") || "").trim();
        if (alt) image.alt = alt;
        contentCell.appendChild(image);
      }
      if (pdfLink) {
        contentCell.appendChild(document.createComment(" field:content_richtext "));
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = pdfLink.getAttribute("href");
        a.textContent = pdfLink.textContent.trim();
        p.appendChild(a);
        contentCell.appendChild(p);
      }
      cells.push([titleCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-diagram", cells });
    if (sectionTitle && sectionTitle.textContent.trim()) {
      const h3 = document.createElement("h3");
      h3.textContent = sectionTitle.textContent.trim();
      element.before(h3);
    }
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-features.js
  function parse5(element, { document }) {
    const cells = [];
    const groups = Array.from(element.querySelectorAll(":scope > .ste-list, :scope > .collapse-mobile"));
    const unique = groups.filter((g, i) => groups.indexOf(g) === i);
    unique.forEach((group) => {
      const heading = group.querySelector("h2, h3, h4");
      const labelCell = [];
      if (heading && heading.textContent.trim()) {
        const h3 = document.createElement("h3");
        h3.textContent = heading.textContent.trim();
        labelCell.push(h3);
      }
      const bodyCell = Array.from(group.querySelectorAll(":scope > ul, :scope > ol, :scope > p"));
      if (labelCell.length || bodyCell.length) cells.push([labelCell, bodyCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-features", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-compare.js
  function parse6(element, { document }) {
    const table = element.matches("table") ? element : element.querySelector("table");
    const rows = table ? Array.from(table.querySelectorAll(":scope > thead > tr, :scope > tbody > tr, :scope > tr")) : [];
    const grid = rows.map((tr) => {
      const out = [];
      Array.from(tr.children).filter((c) => /^(TD|TH)$/.test(c.tagName)).forEach((c) => {
        out.push(c);
        const span = parseInt(c.getAttribute("colspan") || "1", 10);
        for (let i = 1; i < span; i += 1) out.push(null);
      });
      return out;
    });
    let width = Math.max(0, ...grid.map((r) => r.length));
    const isFilled = (c) => c && (c.textContent.trim() || c.querySelector("img, a"));
    while (width > 1 && grid.every((r) => !isFilled(r[width - 1]))) width -= 1;
    const cells = grid.map((row) => {
      const out = [];
      for (let i = 0; i < width; i += 1) {
        const cell = row[i];
        const frag = document.createDocumentFragment();
        const hasContent = cell && (cell.textContent.trim() || cell.querySelector("img, a"));
        if (hasContent) {
          frag.appendChild(document.createComment(` field:column${i + 1}text `));
          const blockChildren = Array.from(cell.children).filter((c) => /^(P|UL|OL|H[1-6]|DIV|TABLE)$/.test(c.tagName));
          if (blockChildren.length) {
            Array.from(cell.childNodes).forEach((n) => frag.appendChild(n));
          } else if (cell.tagName === "TH") {
            const p = document.createElement("p");
            const strong = document.createElement("strong");
            strong.textContent = cell.textContent.trim();
            p.appendChild(strong);
            frag.appendChild(p);
          } else {
            const p = document.createElement("p");
            Array.from(cell.childNodes).forEach((n) => p.appendChild(n));
            frag.appendChild(p);
          }
        }
        out.push(frag);
      }
      return out;
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "table-compare", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-program.js
  function parse7(element, { document }) {
    const cells = [];
    const heading = element.querySelector(":scope > h2, :scope > h3");
    const items = Array.from(element.querySelectorAll("article.secondary-topic-item"));
    items.forEach((item) => {
      const img = item.querySelector(".secondary-topic-media img, figure img");
      const title = item.querySelector(".secondary-topic-title, h4, h3");
      const desc = item.querySelector(".secondary-topic-text");
      const links = Array.from(item.querySelectorAll(".secondary-topic-link a[href]"));
      const imageCell = document.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document.createComment(" field:image "));
        const image = document.createElement("img");
        let src = img.getAttribute("src") || "";
        if (/\.svg$/i.test(src)) src = `${src}?fmt=svg`;
        image.src = src;
        const alt = (img.getAttribute("alt") || "").trim() || (title ? title.textContent.trim() : "");
        if (alt) image.alt = alt;
        imageCell.appendChild(image);
      }
      const textCell = document.createDocumentFragment();
      const content = [];
      if (title && title.textContent.trim()) {
        const h4 = document.createElement("h4");
        h4.textContent = title.textContent.trim();
        content.push(h4);
      }
      if (desc) {
        const paras = Array.from(desc.querySelectorAll(":scope > p, :scope > ul, :scope > ol"));
        if (paras.length) content.push(...paras);
        else if (desc.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = desc.textContent.trim();
          content.push(p);
        }
      }
      links.forEach((a) => {
        if (!a.textContent.trim()) return;
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = a.textContent.trim();
        p.appendChild(link);
        content.push(p);
      });
      if (content.length) {
        textCell.appendChild(document.createComment(" field:text "));
        content.forEach((el) => textCell.appendChild(el));
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-program", cells });
    if (heading && heading.textContent.trim()) {
      const h3 = document.createElement("h3");
      h3.textContent = heading.textContent.trim();
      element.before(h3);
    }
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse8(element, { document }) {
    const cells = [];
    const boxes = Array.from(element.querySelectorAll("article.box-container"));
    const mkLink = (a, text) => {
      const link = document.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = text || a.textContent.trim();
      return link;
    };
    boxes.forEach((box) => {
      const img = box.querySelector(".box-opts-image img, figure img");
      const content = box.querySelector(".box-opts-content") || box;
      const titleLink = content.querySelector(".prodStatus-heading h3 a[href], h3 a[href], h4 a[href]");
      const titleEl = content.querySelector(".prodStatus-heading h3, h3, h4");
      const status = content.querySelector(".prodStatus-heading .svg-icon, .prodStatus-heading span");
      const tags = Array.from(content.querySelectorAll("ul.metadata > li"));
      const desc = Array.from(content.querySelectorAll(":scope > p"));
      const docList = content.querySelector("ul.nav-piped-2");
      const name = titleEl ? titleEl.textContent.trim() : "";
      const imageCell = document.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document.createComment(" field:image "));
        const image = document.createElement("img");
        let src = img.getAttribute("src") || "";
        if (/\.svg$/i.test(src)) src = `${src}?fmt=svg`;
        image.src = src;
        const alt = (img.getAttribute("alt") || "").trim() || name;
        if (alt) image.alt = alt;
        imageCell.appendChild(image);
      }
      const parts = [];
      if (name) {
        const h3 = document.createElement("h3");
        if (titleLink) h3.appendChild(mkLink(titleLink, name));
        else h3.textContent = name;
        parts.push(h3);
      }
      if (status && status.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = status.textContent.trim();
        parts.push(p);
      }
      tags.forEach((li) => {
        if (!li.textContent.trim()) return;
        const p = document.createElement("p");
        const em = document.createElement("em");
        em.textContent = li.textContent.trim();
        p.appendChild(em);
        parts.push(p);
      });
      desc.forEach((d) => {
        if (!d.textContent.trim()) return;
        const p = document.createElement("p");
        p.textContent = d.textContent.trim().replace(/\s+/g, " ");
        parts.push(p);
      });
      if (docList) {
        const p = document.createElement("p");
        const label = docList.querySelector("li.title");
        if (label && label.textContent.trim()) {
          const strong = document.createElement("strong");
          strong.textContent = label.textContent.trim();
          p.appendChild(strong);
        }
        Array.from(docList.querySelectorAll("li a[href]")).forEach((a) => {
          if (!a.textContent.trim()) return;
          if (p.childNodes.length) p.appendChild(document.createTextNode(" "));
          p.appendChild(mkLink(a));
        });
        if (p.textContent.trim()) parts.push(p);
      }
      const textCell = document.createDocumentFragment();
      if (parts.length) {
        textCell.appendChild(document.createComment(" field:text "));
        parts.forEach((el) => textCell.appendChild(el));
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-parametric.js
  function parse9(element, { document }) {
    const table = element.querySelector("#tableContainer table, table.table-prod-sel, table");
    const rows = table ? Array.from(table.querySelectorAll(":scope > thead > tr, :scope > tbody > tr")) : [];
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const headerCell = (th) => {
      const label = th.querySelector(".table-filter") || th;
      const text = clean(label.textContent);
      if (!text) return null;
      const p = document.createElement("p");
      p.textContent = text;
      return [p];
    };
    const bodyCell = (td) => {
      const root = td.querySelector(".table-container-cell") || td;
      const out = [];
      const links = Array.from(root.querySelectorAll("a[href]")).filter((a) => clean(a.textContent) && !/^(#|javascript)/.test(a.getAttribute("href")));
      if (links.length) {
        links.forEach((a, i) => {
          const p2 = document.createElement("p");
          const link = document.createElement("a");
          link.href = a.getAttribute("href");
          link.textContent = clean(a.textContent);
          if (i === 0 && a.classList.contains("bold")) {
            const strong = document.createElement("strong");
            strong.appendChild(link);
            p2.appendChild(strong);
          } else {
            p2.appendChild(link);
          }
          out.push(p2);
        });
        return out;
      }
      const text = clean(root.textContent);
      if (!text) return null;
      const p = document.createElement("p");
      p.textContent = text;
      return [p];
    };
    const grid = rows.map((tr) => Array.from(tr.children).filter((c) => /^(TD|TH)$/.test(c.tagName)).map((c) => c.tagName === "TH" ? headerCell(c) : bodyCell(c)));
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
    const block = WebImporter.Blocks.createBlock(document, { name: "table-parametric", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-doc-list.js
  function parse10(element, { document }) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const scope = element.querySelector(".ds-column-right:not(.hidden)") || element;
    let items = Array.from(scope.querySelectorAll("#compactListView ul.compact-list:not(.compact-list__nested) > li.compact-item"));
    if (!items.length) {
      items = Array.from(scope.querySelectorAll("ul.compact-list:not(.compact-list__nested) > li.compact-item"));
    }
    const mkLink = (a, text) => {
      const link = document.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = text || clean(a.textContent);
      return link;
    };
    const cells = [];
    items.forEach((item) => {
      const content = item.querySelector(":scope > .compact-content-wrapper > .compact-content") || item;
      const titleWrap = content.querySelector(".compact-title .title-and-elements, .compact-title");
      const titleLink = titleWrap && titleWrap.querySelector("a[href]");
      const code = titleWrap && titleWrap.querySelector(".code-id");
      const markers = titleWrap ? Array.from(titleWrap.querySelectorAll(".marker")) : [];
      const formats = Array.from(content.querySelectorAll(".compact-metadata .format a[href]"));
      const date = content.querySelector(".compact-metadata .date");
      const rev = content.querySelector(".compact-metadata .revision");
      const parts = [];
      if (titleWrap) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        if (titleLink) strong.appendChild(mkLink(titleLink));
        else strong.textContent = clean(titleWrap.textContent);
        p.appendChild(strong);
        if (code && clean(code.textContent)) p.appendChild(document.createTextNode(` ${clean(code.textContent)}`));
        markers.forEach((m) => {
          if (!clean(m.textContent)) return;
          p.appendChild(document.createTextNode(" "));
          const em = document.createElement("em");
          em.textContent = clean(m.textContent);
          p.appendChild(em);
        });
        parts.push(p);
      }
      if (formats.length) {
        const p = document.createElement("p");
        formats.forEach((a, i) => {
          if (i) p.appendChild(document.createTextNode(" | "));
          p.appendChild(mkLink(a));
        });
        parts.push(p);
      }
      const meta = [date, rev].map((e) => e ? clean(e.textContent) : "").filter(Boolean);
      if (meta.length) {
        const p = document.createElement("p");
        p.textContent = meta.join(" | ");
        parts.push(p);
      }
      if (!parts.length) return;
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      parts.forEach((el) => textCell.appendChild(el));
      cells.push([document.createDocumentFragment(), textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-doc-list", cells });
    const host = element.closest("#documentationDiv, .ds-resources-block");
    element.replaceWith(block);
    if (host) {
      host.querySelectorAll(".ds-column-left, .ds-column-right, .ds-resources-sorting, .results-controls, #compactListView, #listView, ul.retrieved-items, ul.compact-list").forEach((el) => {
        if (!block.contains(el)) el.remove();
      });
    }
  }

  // tools/importer/parsers/cards-resource.js
  function parse11(element, { document }) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const usable = (a) => {
      const href = a && a.getAttribute("href");
      return !!href && href !== "#" && !href.startsWith("javascript");
    };
    const mkLink = (a, text) => {
      const link = document.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = text || clean(a.textContent);
      return link;
    };
    const scope = element.querySelector(".ds-column-right:not(.hidden)") || element;
    const list = scope.querySelector("ul.retrieved-items");
    const items = list ? Array.from(list.querySelectorAll(":scope > li.retrieved-item")).filter((li) => li.querySelector(".title-and-elements")) : [];
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(":scope > figure.item-media img, :scope > figure img");
      const body = item.querySelector(":scope > .item-body") || item;
      const signpost = body.querySelector(".item-signpost");
      const titleWrap = body.querySelector(".title-and-elements");
      const titleLink = Array.from(titleWrap.querySelectorAll(":scope > a[href]")).find((a) => usable(a) && !a.querySelector(".product-status"));
      const titleSpan = titleWrap.querySelector(":scope > span:not(.marker)");
      const titleSource = (titleLink || titleSpan || titleWrap).cloneNode(true);
      titleSource.querySelectorAll(".marker, .product-status").forEach((m) => m.remove());
      const titleText = clean(titleSource.textContent);
      const markers = Array.from(titleWrap.querySelectorAll(".marker"));
      const status = titleWrap.querySelector(".product-status");
      const metaItems = Array.from(body.querySelectorAll(".metadata > .meta-item"));
      const security = body.querySelector(".security-status");
      const imageCell = document.createDocumentFragment();
      if (img && img.getAttribute("src")) {
        imageCell.appendChild(document.createComment(" field:image "));
        const image = document.createElement("img");
        let src = img.getAttribute("src");
        if (/\.svg$/i.test(src)) src = `${src}?fmt=svg`;
        image.src = src;
        const alt = clean(img.getAttribute("alt"));
        image.alt = alt && alt !== "placeholder image" ? alt : titleText;
        imageCell.appendChild(image);
      }
      const parts = [];
      if (signpost && clean(signpost.textContent)) {
        const p = document.createElement("p");
        p.textContent = clean(signpost.textContent);
        parts.push(p);
      }
      if (titleText) {
        const h4 = document.createElement("h4");
        if (titleLink) h4.appendChild(mkLink(titleLink, titleText));
        else h4.textContent = titleText;
        parts.push(h4);
      }
      const badges = [];
      markers.forEach((m) => {
        if (!clean(m.textContent)) return;
        const em = document.createElement("em");
        em.textContent = clean(m.textContent);
        badges.push(em);
      });
      if (status && clean(status.textContent)) {
        const statusLink = status.closest("a");
        badges.push(usable(statusLink) ? mkLink(statusLink, clean(status.textContent)) : document.createTextNode(clean(status.textContent)));
      }
      if (badges.length) {
        const p = document.createElement("p");
        badges.forEach((b, i) => {
          if (i) p.appendChild(document.createTextNode(" "));
          p.appendChild(b);
        });
        parts.push(p);
      }
      if (metaItems.length) {
        const p = document.createElement("p");
        metaItems.forEach((mi) => {
          const text = clean(mi.textContent);
          if (!text) return;
          if (p.childNodes.length) p.appendChild(document.createTextNode(" | "));
          const link = Array.from(mi.querySelectorAll("a[href]")).find(usable);
          if (link) {
            const linkText = clean(link.textContent);
            const before2 = text.slice(0, text.indexOf(linkText)).trim();
            if (before2) p.appendChild(document.createTextNode(`${before2} `));
            p.appendChild(mkLink(link, linkText));
          } else {
            p.appendChild(document.createTextNode(text));
          }
        });
        if (p.childNodes.length) parts.push(p);
      }
      if (security && clean(security.textContent)) {
        const p = document.createElement("p");
        p.textContent = clean(security.textContent);
        parts.push(p);
      }
      if (!parts.length) return;
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      parts.forEach((el) => textCell.appendChild(el));
      cells.push([imageCell, textCell]);
    });
    const toParagraph = (el) => {
      if (el.querySelector('a[href^="javascript"]') || el.querySelector("a:not([href])")) return null;
      if (!clean(el.textContent)) return null;
      const src = el.matches("p") ? el : el.querySelector("p") || el;
      const p = document.createElement("p");
      Array.from(src.childNodes).forEach((n) => p.appendChild(n));
      return p;
    };
    const before = [];
    const after = [];
    if (list) {
      let seenList = false;
      Array.from(scope.children).forEach((child) => {
        if (child === list) {
          seenList = true;
          return;
        }
        if (child.matches(".ds-column-left, .keyword-filter-bar, .results-controls, input, nav, .pagination")) return;
        if (child.querySelector(".keyword-filter-bar, .sort-results, select, input.search-input")) return;
        const p = toParagraph(child);
        if (p) (seenList ? after : before).push(p);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-resource", cells });
    before.forEach((p) => element.before(p));
    after.reverse().forEach((p) => element.after(p));
    element.replaceWith(block);
  }

  // tools/importer/parsers/search-community.js
  function parse12(element, { document }) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const DEFAULT_TARGET = "https://community.nxp.com/t5/forums/searchpage/tab/message";
    const button = element.querySelector("#keywordCommunitiesBtn, .search-btn a[href], a.btn-search");
    const input = element.querySelector("input#communityKeywordText, input.search-input, input");
    let target = DEFAULT_TARGET;
    const rawHref = button && button.getAttribute("href") || (element.querySelector('a[href*="community.nxp.com"]') || { getAttribute: () => "" }).getAttribute("href");
    if (rawHref) {
      try {
        const url = new URL(rawHref, "https://www.nxp.com");
        if (!url.searchParams.get("q")) url.searchParams.delete("q");
        target = url.toString();
      } catch (e) {
      }
    }
    const indexCell = document.createDocumentFragment();
    indexCell.appendChild(document.createComment(" field:index "));
    indexCell.appendChild(document.createTextNode(target));
    const placeholder = input ? clean(input.getAttribute("placeholder") || input.getAttribute("aria-label")) : "";
    const placeholderCell = document.createDocumentFragment();
    if (placeholder) {
      placeholderCell.appendChild(document.createComment(" field:placeholder "));
      placeholderCell.appendChild(document.createTextNode(placeholder));
    }
    const label = button ? clean(button.textContent) : "";
    const labelCell = document.createDocumentFragment();
    if (label) {
      labelCell.appendChild(document.createComment(" field:buttonLabel "));
      labelCell.appendChild(document.createTextNode(label));
    }
    const cells = [[indexCell], [placeholderCell], [labelCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "search-community", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-links.js
  function parse13(element, { document }) {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const container = element.querySelector(".grouped-links-container") || element;
    const groups = Array.from(container.children).filter((c) => c.querySelector("ul.grouped-links-list, ul"));
    const row = groups.map((group) => {
      const cell = [];
      const title = group.querySelector(".grouped-links-title, h2, h3, h4");
      if (title && clean(title.textContent)) {
        const h4 = document.createElement("h4");
        h4.textContent = clean(title.textContent);
        cell.push(h4);
      }
      const ul = document.createElement("ul");
      Array.from(group.querySelectorAll("ul > li")).forEach((li) => {
        const a = li.querySelector("a[href]");
        if (!a || !clean(a.textContent)) return;
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = clean(a.textContent);
        item.appendChild(link);
        ul.appendChild(item);
      });
      if (ul.children.length) cell.push(ul);
      return cell;
    });
    const cells = row.length ? [row] : [];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/nxp-cleanup.js
  function remove(element, selectors) {
    selectors.forEach((sel) => {
      element.querySelectorAll(sel).forEach((el) => el.remove());
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      remove(element, [
        // Global header / mobile nav
        "#sectionirs5dxuw",
        "header.loadnav",
        "div.site-header",
        "#nxp-mobile-nav",
        // Global footer
        "#sectionirs5dxv0",
        "footer.loadnav",
        // Breadcrumb trail with category dropdowns
        "#sectionjthecag7",
        // Recently viewed products (per-visitor history)
        "#iw_comp1743604526417",
        "#RecentlyViewedXSP",
        // Chat widgets and overlays
        "#ask-nxp-chat-app",
        "#ask-nxp-chat-bubble-trigger",
        "#embedded-messaging",
        "#embeddedMessagingSiteContextFrame",
        "#messaging_invite_button",
        ".messaging_invite_button_standard",
        // Cookie banner, modals, tracking
        "#onetrust-consent-sdk",
        "#progressiveModal",
        "#ClickTaleDiv",
        "#universal_pixel_b80bwdg",
        ".progressiveProfiling",
        // Hidden state inputs
        "body > input",
        ".iw_component > input",
        ".ds-resources-content > input",
        ".ds-column-right > input",
        // Hidden duplicate tab panes (NXP / Partner / Secure states) outside the visible lists
        ".iw_component > .nav-container.filter-list-sticky.hidden",
        ".iw_component > .ds-column-right.hidden",
        '.iw_component > [id$="RightSection"].hidden',
        // Facet sidebars, sign-in and loader placeholders inside resource lists
        ".ds-resources-content > .ds-column-left",
        ".ds-resources-content > .ds-column-right.hidden",
        // Keyword filter bars and sort / result-count controls
        ".ds-resources-sorting .keyword-filter-bar",
        ".ds-resources-sorting .sort-results",
        ".ds-column-right > section.results-controls",
        "#engg-services-noresult",
        // Parametric table app chrome (result count, XLS, side filters, pagination)
        "#product-selector-v2-app .table-header-container",
        "#product-selector-v2-app .side",
        "#product-selector-v2-app .static-elements",
        "#product-selector-v2-app nav.table-footer",
        // Bookmark / collection controls and download-manager alerts
        ".item-options",
        ".item-options-collections",
        "#createCollectionAlert",
        "#downloadManagerAlert",
        "#downloadManagerMacOSNotSupportedAlert",
        // Video.js player UI (keep video/poster)
        ".vjs-control-bar",
        ".vjs-modal-dialog",
        ".vjs-loading-spinner",
        ".vjs-big-play-button",
        ".vjs-text-track-display",
        ".vjs-title-bar",
        // Carousel arrows
        ".swiper-button-next",
        ".swiper-button-prev"
      ]);
      element.querySelectorAll(".ds-resources-sorting").forEach((el) => {
        if (!el.textContent.trim() && !el.querySelector("img, a")) el.remove();
      });
      element.querySelectorAll("a#btnShow").forEach((a) => {
        const href = (a.getAttribute("href") || "").trim();
        if (!href || href === "#" || href.startsWith("javascript")) a.remove();
      });
    }
    if (hookName === "afterTransform") {
      remove(element, [
        "script",
        "style",
        "noscript",
        "link",
        "iframe",
        "object",
        "embed",
        "form:not(:has(*))"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach(({ name }) => {
          if (name.startsWith("data-dtm") || name.startsWith("data-track") || name.startsWith("data-analytics") || name.startsWith("data-gtm") || name.startsWith("on")) {
            el.removeAttribute(name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/nxp-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (let i = 0; i < selectors.length; i += 1) {
      const sel = selectors[i];
      if (sel) {
        try {
          const el = root.querySelector(sel);
          if (el) return el;
        } catch (e) {
        }
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const template = payload && payload.template;
    const sections = template && template.sections || [];
    if (sections.length < 2) return;
    const document = element.ownerDocument;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (el) {
          if (i > 0 || section.style) {
            const hr = document.createElement("hr");
            if (section.style) hr.setAttribute(MARKER, section.id);
            el.parentNode.insertBefore(hr, el);
          }
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (section.style) {
          const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
          const anchor = marker || findSectionElement(element, section);
          if (anchor) {
            const meta = WebImporter.Blocks.createBlock(document, {
              name: "Section Metadata",
              cells: { style: section.style }
            });
            let cursor = anchor.nextElementSibling;
            let last = anchor;
            while (cursor && cursor.tagName !== "HR") {
              last = cursor;
              cursor = cursor.nextElementSibling;
            }
            last.after(meta);
            if (marker) {
              if (i === 0) {
                marker.remove();
              } else {
                marker.removeAttribute(MARKER);
              }
            }
          }
        }
      }
      element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
    }
  }

  // tools/importer/import-products.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "hero-product": parse,
    "columns-jump-nav": parse2,
    "columns-gallery": parse3,
    "tabs-diagram": parse4,
    "columns-features": parse5,
    "table-compare": parse6,
    "cards-program": parse7,
    "cards-product": parse8,
    "table-parametric": parse9,
    "cards-doc-list": parse10,
    "cards-resource": parse11,
    "search-community": parse12,
    "columns-links": parse13
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
  var import_products_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_products_exports);
})();
