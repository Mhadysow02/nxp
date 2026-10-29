import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Cards Resource: list of design resources (design files, hardware, software, services,
 * training). Each item: optional image | eyebrow, linked title, badges, metadata, CTA.
 * Collapses after five items behind "Show All".
 */
function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    // external (not yet uploaded) and SVG images keep the authored picture
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
}

/** Wraps a leading "Label:" (e.g. "HQ:", "Level:") of a meta item in <strong>. */
function emphasizeLabel(item) {
  const first = item.firstChild;
  if (!first || first.nodeType !== Node.TEXT_NODE) return;
  const match = first.textContent.match(/^([^:|]{1,30}:)\s*/);
  if (!match) return;
  const strong = document.createElement('strong');
  [, strong.textContent] = match;
  first.textContent = ` ${first.textContent.slice(match[0].length)}`;
  item.prepend(strong);
}

/** Splits a "A | B | C" paragraph into individual meta items, keeping inline links. */
function buildMeta(p) {
  const meta = document.createElement('div');
  meta.className = 'cards-resource-meta';
  let item = document.createElement('span');
  const flush = () => {
    if (item.textContent.trim() || item.querySelector('a, img')) {
      if (item.firstChild?.nodeType === Node.TEXT_NODE) {
        item.firstChild.textContent = item.firstChild.textContent.trimStart();
      }
      if (item.lastChild?.nodeType === Node.TEXT_NODE) {
        item.lastChild.textContent = item.lastChild.textContent.trimEnd();
      }
      item.className = 'cards-resource-meta-item';
      emphasizeLabel(item);
      meta.append(item);
    }
    item = document.createElement('span');
  };
  [...p.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('|')) {
      node.textContent.split('|').forEach((part, i) => {
        if (i > 0) flush();
        if (part) item.append(document.createTextNode(part));
      });
    } else {
      item.append(node);
    }
  });
  flush();
  moveInstrumentation(p, meta);
  return meta;
}

/** Turns the badges paragraph (<em>Featured</em> + status link) into inline title badges. */
function buildBadges(p) {
  const badges = [];
  [...p.children].forEach((el) => {
    if (el.matches('em, strong')) {
      const badge = document.createElement('span');
      badge.className = 'cards-resource-badge';
      badge.textContent = el.textContent.trim();
      badges.push(badge);
    } else if (el.matches('a')) {
      el.classList.remove('button');
      el.classList.add('cards-resource-status');
      badges.push(el);
    }
  });
  return badges;
}

function decorateBody(body) {
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.classList.add('cards-resource-title');
    if (!heading.firstElementChild) {
      const span = document.createElement('span');
      span.append(...heading.childNodes);
      heading.append(span);
    }
  }
  let beforeTitle = true;
  [...body.children].forEach((el) => {
    if (el === heading) {
      beforeTitle = false;
      return;
    }
    if (el.tagName !== 'P') return;
    el.querySelectorAll('.button').forEach((a) => a.classList.remove('button'));
    const text = el.textContent.trim();
    if (beforeTitle) {
      el.className = 'cards-resource-eyebrow';
    } else if (heading && el.querySelector(':scope > em') && el.textContent.replace(/\s+/g, ' ').length < 40) {
      heading.append(...buildBadges(el));
      el.remove();
    } else if (/^account required$/i.test(text)) {
      el.className = 'cards-resource-auth';
    } else {
      el.replaceWith(buildMeta(el));
    }
  });
}

function buildList(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && div.textContent.trim() === '') div.className = 'cards-resource-card-image';
      else if (div.textContent.trim() === '' && !div.querySelector('a, picture')) div.remove();
      else {
        div.className = 'cards-resource-card-body';
        decorateBody(div);
      }
    });
    if (!li.querySelector('.cards-resource-card-image')) li.classList.add('no-image');
    ul.append(li);
  });
  optimizeImages(ul);
  block.replaceChildren(ul);
  return ul;
}

function addShowAll(block, ul, limit) {
  const items = [...ul.children];
  if (items.length <= limit) return;
  items.slice(limit).forEach((li) => li.classList.add('cards-resource-overflow'));
  block.classList.add('is-collapsed');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cards-resource-show-all secondary';
  btn.setAttribute('aria-expanded', 'false');
  btn.textContent = 'Show All';
  btn.addEventListener('click', () => {
    const collapsed = block.classList.toggle('is-collapsed');
    btn.setAttribute('aria-expanded', !collapsed);
    btn.textContent = collapsed ? 'Show All' : 'Show Less';
  });
  block.append(btn);
}

export default function decorate(block) {
  const ul = buildList(block);
  addShowAll(block, ul, 5);
}
