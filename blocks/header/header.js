// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Fetches the nav fragment. Metadata-independent: /content first (local preview),
 * then the site root (DA/EDS preview + live).
 * @returns {Promise<HTMLElement|null>}
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  // resolve relative image paths against the folder the fragment was served from
  const base = new URL(resp.url).pathname.replace(/[^/]*$/, '');
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|\/|data:)/.test(src)) img.src = `${base}${src}`;
  });
  return wrapper;
}

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  children.flat().forEach((c) => c && node.append(c));
  return node;
}

/** direct text of a list item (ignoring nested lists) */
function ownText(li) {
  const first = li.querySelector(':scope > p, :scope > a, :scope > strong');
  if (first) return first.textContent.trim();
  return [...li.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join(' ').trim();
}

/** true when the current URL lives under the section a panel's heading links point to */
function isCurrentSection(panelSource) {
  const href = panelSource.querySelector('strong a, a')?.getAttribute('href');
  if (!href) return false;
  let seg;
  try {
    seg = new URL(href, window.location.href).pathname.split(/[/:]/).find(Boolean);
  } catch (e) {
    return false;
  }
  const here = window.location.pathname.toLowerCase().split(/[/:]/).filter(Boolean);
  return !!seg && here.includes(seg.toLowerCase());
}

/* ---------- open / close state ---------- */

function syncState(nav) {
  const anyPanel = nav.querySelector('.nav-drop > button[aria-expanded="true"], .nav-search-trigger[aria-expanded="true"]');
  const menuOpen = nav.querySelector('.nav-hamburger')?.getAttribute('aria-expanded') === 'true';
  nav.classList.toggle('nav-is-open', !!anyPanel);
  nav.classList.toggle('nav-search-open', !!nav.querySelector('.nav-search-trigger[aria-expanded="true"]'));
  document.body.classList.toggle('nav-no-scroll', (!!anyPanel && isDesktop.matches) || menuOpen);
}

/** closes every panel/dropdown (the mobile drawer itself stays as it is) */
function closeAll(nav) {
  nav.querySelectorAll('[aria-expanded="true"]:not(.nav-hamburger)').forEach((t) => t.setAttribute('aria-expanded', 'false'));
  syncState(nav);
}

function toggle(nav, trigger) {
  const open = trigger.getAttribute('aria-expanded') !== 'true';
  closeAll(nav);
  trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  syncState(nav);
}

function toggleMenu(nav, force = null) {
  const hamburger = nav.querySelector('.nav-hamburger');
  const open = force !== null ? force : hamburger.getAttribute('aria-expanded') !== 'true';
  hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('nav-menu-open', open);
  // always reopen the drill-down at its first level
  const mobile = nav.querySelector('.nav-mobile');
  // eslint-disable-next-line no-use-before-define
  if (mobile && !open) showMobilePanel(mobile, mobile.querySelector('.nav-mpanel'));
  closeAll(nav);
}

/* ---------- builders ---------- */

/**
 * Builds a megamenu panel from a nested list:
 * <ul><li>(column) <p><strong><a>Heading</a></strong></p><ul>links</ul>[<ul>more</ul>] …</li></ul>
 * Consecutive lists under one heading render as side-by-side sub-columns.
 */
function buildPanel(columnsList, label) {
  const panel = el('div', 'nav-megamenu');
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', label);
  const close = el('button', 'nav-close');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close menu');
  const grid = el('div', 'nav-megamenu-grid');
  [...columnsList.children].forEach((colLi) => {
    const col = el('div', 'nav-col');
    let lists = [];
    const flush = () => {
      if (!lists.length) return;
      if (lists.length > 1) {
        col.append(el('div', 'nav-col-split', lists));
        col.classList.add('nav-col-wide');
      } else col.append(lists[0]);
      lists = [];
    };
    [...colLi.children].forEach((child) => {
      if (child.tagName === 'UL') {
        child.classList.add('nav-col-list');
        child.querySelectorAll('ul').forEach((sub) => sub.classList.add('nav-col-sublist'));
        child.querySelectorAll('em > a').forEach((a) => a.classList.add('nav-link-highlight'));
        lists.push(child);
      } else if (child.tagName === 'BLOCKQUOTE') {
        // promo card: strong = title, other paragraphs = copy / call to action
        flush();
        const promo = el('div', 'nav-promo');
        [...child.children].forEach((p) => {
          const strong = p.querySelector(':scope > strong');
          if (strong && strong.textContent.trim() === p.textContent.trim()) {
            promo.append(el('h3', 'nav-promo-title', strong.textContent.trim()));
          } else promo.append(p);
        });
        col.append(promo);
      } else {
        flush();
        const h = el('h3', 'nav-col-heading');
        const a = child.querySelector('a');
        h.append(a || child.textContent.trim());
        col.append(h);
      }
    });
    flush();
    grid.append(col);
  });
  panel.append(close, grid);
  return panel;
}

function buildPrimary(nav, sectionsSrc) {
  const list = el('ul', 'nav-primary');
  const srcList = sectionsSrc.querySelector('ul');
  if (!srcList) return list;
  [...srcList.children].forEach((li) => {
    const sub = li.querySelector(':scope > ul');
    if (sub) {
      const label = ownText(li);
      const item = el('li', 'nav-drop');
      const trigger = el('button', 'nav-trigger', label);
      trigger.type = 'button';
      trigger.setAttribute('aria-expanded', 'false');
      if (isCurrentSection(sub)) item.classList.add('nav-current');
      const panel = buildPanel(sub, label);
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle(nav, trigger);
      });
      panel.querySelector('.nav-close').addEventListener('click', () => {
        trigger.setAttribute('aria-expanded', 'false');
        closeAll(nav);
        // eslint-disable-next-line no-use-before-define
        if (!isDesktop.matches) toggleMenu(nav, false);
      });
      item.append(trigger, panel);
      list.append(item);
    } else {
      const a = li.querySelector('a');
      const item = el('li', li.querySelector('strong') ? 'nav-cta' : 'nav-link');
      if (a) item.append(a);
      list.append(item);
    }
  });
  return list;
}

/* ---------- mobile drill-down menu ---------- */

/** shows one drill-down panel; panels before it slide out left, after it right */
function showMobilePanel(menu, panel) {
  const panels = [...menu.querySelectorAll('.nav-mpanel')];
  const path = [];
  for (let p = panel; p; p = menu.querySelector(`#${p.dataset.parent}`)) path.unshift(p);
  panels.forEach((p) => {
    p.classList.toggle('nav-panel-active', p === panel);
    p.classList.toggle('nav-panel-hidden', p !== panel);
    p.classList.toggle('nav-panel-left', p !== panel && path.includes(p));
    p.setAttribute('aria-hidden', p === panel ? 'false' : 'true');
  });
  menu.querySelectorAll('.nav-mcount').forEach((b) => {
    b.setAttribute('aria-expanded', path.some((p) => p.id === b.getAttribute('aria-controls')) ? 'true' : 'false');
  });
}

function mobilePanel(menu, id, parent, backLabel, title) {
  const panel = el('div', 'nav-mpanel nav-panel nav-panel-hidden');
  panel.id = id;
  panel.dataset.depth = parent ? Number(parent.dataset.depth) + 1 : 0;
  if (parent) {
    panel.dataset.parent = parent.id;
    const back = el('button', 'nav-mback', backLabel);
    back.type = 'button';
    back.addEventListener('click', () => showMobilePanel(menu, parent));
    // visually hidden panel heading (the visible label is the back button)
    panel.append(back, el('h2', 'nav-panel-title', el('span', '', title)));
  }
  const list = el('ul', 'nav-mlist');
  panel.append(list);
  menu.append(panel);
  return { panel, list };
}

/** a row: label (link or text) + optional count pill opening a child panel */
function mobileRow(menu, list, labelNode, childPanel, count) {
  const row = el('li', 'nav-mrow');
  labelNode.classList.add('nav-mlabel');
  row.append(labelNode);
  if (childPanel) {
    const btn = el('button', 'nav-mcount', el('span', 'nav-msr', labelNode.textContent.trim()), String(count));
    btn.type = 'button';
    btn.setAttribute('aria-controls', childPanel.id);
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', `${labelNode.textContent.trim()} (${count})`);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showMobilePanel(menu, childPanel);
    });
    row.append(btn);
  }
  list.append(row);
}

/** adds links of a list (with nested sub-lists as their own panels) to a panel list */
function mobileLinks(menu, list, ul, parent, idBase) {
  [...ul.children].forEach((li, i) => {
    const a = li.querySelector(':scope > a, :scope > em > a');
    if (!a) return;
    const link = a.cloneNode(true);
    const sub = li.querySelector(':scope > ul');
    if (sub) {
      const text = a.textContent.trim();
      const child = mobilePanel(menu, `${idBase}-${i}`, parent, text, text);
      mobileLinks(menu, child.list, sub, child.panel, `${idBase}-${i}`);
      mobileRow(menu, list, link, child.panel, sub.children.length);
    } else mobileRow(menu, list, link);
  });
}

/**
 * Builds the mobile drill-down from the nav fragment: level 1 = sections with entry counts,
 * level 2 = column headings (a heading named like its section is expanded inline),
 * level 3 = the heading's links.
 */
function buildMobile(sectionsSrc, backLabel) {
  const menu = el('div', 'nav-mobile');
  const root = mobilePanel(menu, 'nav-m', null);
  root.panel.classList.replace('nav-panel-hidden', 'nav-panel-active');
  const srcList = sectionsSrc.querySelector('ul');
  [...(srcList?.children || [])].forEach((li, si) => {
    const sub = li.querySelector(':scope > ul');
    if (!sub) {
      const a = li.querySelector('a');
      if (a) root.panel.append(el('p', li.querySelector('strong') ? 'nav-mcta' : 'nav-mlink', a.cloneNode(true)));
      return;
    }
    const label = ownText(li);
    const id = `nav-m-${si}`;
    const lvl2 = mobilePanel(menu, id, root.panel, backLabel, label);
    [...sub.children].forEach((col, ci) => {
      let heading = null;
      // a heading named like its section whose column holds several lists (e.g. Products)
      // is expanded inline; promo cards are desktop-only
      const inline = col.querySelectorAll(':scope > ul').length > 1;
      const isInline = () => inline && heading?.textContent.trim() === label;
      // a heading without its own list (e.g. "Contact Us") is a plain entry
      const flushHeading = () => {
        if (heading && !isInline()) mobileRow(menu, lvl2.list, heading.cloneNode(true));
      };
      [...col.children].forEach((child, k) => {
        if (child.tagName === 'UL') {
          if (heading && !isInline()) {
            const hid = `${id}-${ci}-${k}`;
            const htext = heading.textContent.trim();
            const lvl3 = mobilePanel(menu, hid, lvl2.panel, htext, htext);
            mobileLinks(menu, lvl3.list, child, lvl3.panel, hid);
            mobileRow(menu, lvl2.list, heading.cloneNode(true), lvl3.panel, child.children.length);
            // highlighted links are also surfaced as their own entries
            child.querySelectorAll(':scope > li > em > a')
              .forEach((a) => mobileRow(menu, lvl2.list, a.cloneNode(true)));
            heading = null;
          } else mobileLinks(menu, lvl2.list, child, lvl2.panel, `${id}-${ci}-${k}`);
        } else if (child.tagName !== 'BLOCKQUOTE') {
          flushHeading();
          heading = child.querySelector('a') || el('span', '', child.textContent.trim());
        }
      });
      flushHeading();
    });
    mobileRow(menu, root.list, el('span', '', label), lvl2.panel, lvl2.list.children.length);
  });
  // the store CTA sits after the list in level 1
  const cta = root.panel.querySelector('.nav-mcta');
  if (cta) root.panel.append(cta);
  return menu;
}

/** search trigger + "How can we help you?" panel; copy comes from the nav fragment */
function buildSearch(nav, li) {
  const wrap = el('div', 'nav-search');
  const label = li.querySelector(':scope > p');
  const trigger = el('button', 'nav-search-trigger');
  trigger.type = 'button';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.append(...label.childNodes);
  trigger.setAttribute('aria-label', trigger.textContent.trim() || 'Search');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle(nav, trigger);
  });

  const panel = el('div', 'nav-search-panel');
  const close = el('button', 'nav-close');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close search');
  close.addEventListener('click', () => {
    trigger.setAttribute('aria-expanded', 'false');
    closeAll(nav);
  });
  const inner = el('div', 'nav-search-inner');
  const heading = li.querySelector(':scope > h2');
  const [modes, chips] = li.querySelectorAll(':scope > ul');
  const paras = [...li.querySelectorAll(':scope > p')].slice(1);
  const [placeholder, info, suggested, note] = paras;

  const form = el('form', 'nav-search-form');
  form.action = 'https://www.nxp.com/search';
  form.method = 'get';
  const tabs = el('div', 'nav-search-modes');
  tabs.setAttribute('role', 'tablist');
  [...(modes?.children || [])].forEach((m, i) => {
    const b = el('button', 'nav-search-mode', m.textContent.trim());
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.addEventListener('click', () => {
      tabs.querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
    });
    tabs.append(b);
  });
  const field = el('div', 'nav-search-field');
  const input = el('textarea', 'nav-search-input');
  input.name = 'keyword';
  input.rows = 2;
  input.maxLength = 1024;
  input.placeholder = placeholder?.textContent.trim() || '';
  input.setAttribute('aria-label', input.placeholder || 'Search');
  const send = el('button', 'nav-search-send');
  send.type = 'submit';
  send.setAttribute('aria-label', 'Send');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.value.trim()) form.submit();
    }
  });
  field.append(input, send);
  form.append(field);
  if (info) form.append(el('p', 'nav-search-info', ...info.childNodes));

  const chipList = el('ul', 'nav-search-chips');
  [...(chips?.children || [])].forEach((c) => {
    const a = c.querySelector('a');
    const chip = el('li', a ? 'nav-chip nav-chip-live' : 'nav-chip');
    if (a) chip.append(a);
    else {
      const b = el('button', '', c.textContent.trim());
      b.type = 'button';
      b.addEventListener('click', () => {
        input.value = b.textContent;
        input.focus();
      });
      chip.append(b);
    }
    chipList.append(chip);
  });
  inner.append(
    heading ? el('h2', 'nav-search-title', heading.textContent.trim()) : '',
    tabs,
    form,
    suggested ? el('p', 'nav-search-suggested', suggested.textContent.trim()) : '',
    chipList,
  );
  panel.append(close, inner);
  if (note) panel.append(el('p', 'nav-search-note', ...note.childNodes));
  panel.addEventListener('click', (e) => e.stopPropagation());
  wrap.append(trigger, panel);
  return wrap;
}

/** language dropdown: <p>EN</p><ul>links</ul><p>note</p> */
function buildDropdown(nav, li) {
  const item = el('li', 'nav-lang');
  const trigger = el('button', 'nav-lang-trigger', ownText(li));
  trigger.type = 'button';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-haspopup', 'true');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle(nav, trigger);
  });
  const menu = el('div', 'nav-lang-menu');
  const list = li.querySelector(':scope > ul');
  if (list) menu.append(list);
  const note = li.querySelector(':scope > p:last-of-type');
  if (note && note !== li.querySelector(':scope > p')) menu.append(el('p', 'nav-lang-note', note.textContent.trim()));
  item.append(trigger, menu);
  return item;
}

function buildTools(nav, toolsSrc) {
  const tools = el('div', 'nav-tools');
  const list = el('ul', 'nav-tools-list');
  const srcList = toolsSrc.querySelector('ul');
  [...(srcList?.children || [])].forEach((li) => {
    if (li.querySelector(':scope > h2')) {
      tools.prepend(buildSearch(nav, li));
    } else if (li.querySelector(':scope > ul')) {
      list.append(buildDropdown(nav, li));
    } else {
      const a = li.querySelector('a');
      if (!a) return;
      const img = a.querySelector('img');
      const item = el('li', img ? 'nav-icon-link' : 'nav-account');
      if (img) {
        a.setAttribute('aria-label', img.alt || a.textContent.trim());
        a.append(el('span', 'nav-icon-label', img.alt));
      }
      item.append(a);
      list.append(item);
    }
  });
  tools.append(list);
  return tools;
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;
  const [brandSrc, sectionsSrc, toolsSrc] = [...fragment.children];

  const nav = el('nav', 'nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  const hamburger = el('button', 'nav-hamburger', el('span'), el('span'), el('span'));
  hamburger.type = 'button';
  hamburger.setAttribute('aria-controls', 'nav');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(nav);
  });

  const brand = el('div', 'nav-brand');
  const brandLink = brandSrc?.querySelector('a');
  if (brandLink) {
    brandLink.setAttribute('aria-label', brandLink.querySelector('img')?.alt || 'Home');
    brand.append(brandLink);
  }

  const sections = el('div', 'nav-sections');
  if (sectionsSrc) {
    const backLabel = sectionsSrc.querySelector(':scope > p')?.textContent.trim() || '';
    const mobileSrc = sectionsSrc.cloneNode(true);
    sections.append(buildPrimary(nav, sectionsSrc));
    // the drill-down menu is only built once the viewport is below the desktop breakpoint
    const ensureMobile = () => {
      if (!isDesktop.matches && !sections.querySelector('.nav-mobile')) {
        sections.append(buildMobile(mobileSrc, backLabel));
      }
    };
    ensureMobile();
    isDesktop.addEventListener('change', ensureMobile);
  }
  const tools = toolsSrc ? buildTools(nav, toolsSrc) : el('div', 'nav-tools');

  const backdrop = el('div', 'nav-backdrop');
  backdrop.addEventListener('click', () => {
    closeAll(nav);
    if (!isDesktop.matches) toggleMenu(nav, false);
  });

  nav.append(hamburger, brand, sections, tools, backdrop);
  // clicks inside an open megamenu must not close it
  nav.querySelectorAll('.nav-megamenu, .nav-lang-menu').forEach((p) => p.addEventListener('click', (e) => e.stopPropagation()));

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) || e.target === backdrop) closeAll(nav);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeAll(nav);
    if (!isDesktop.matches) toggleMenu(nav, false);
  });
  // reset state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, false);
    closeAll(nav);
  });

  const navWrapper = el('div', 'nav-wrapper', nav);
  block.append(navWrapper);
}
