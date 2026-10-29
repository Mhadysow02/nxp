import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Cards Doc List: compact single-line document rows (title link with id, HTML | PDF links,
 * date, revision). Adds a keyword filter and collapses the list after ten items.
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

/**
 * Tag the authored paragraphs (title, format links, date | revision) so the row can be
 * laid out as columns, and split the meta line into separate date and revision cells.
 */
function decorateBody(body) {
  [...body.querySelectorAll(':scope > p')].forEach((p) => {
    const text = p.textContent.trim();
    if (p.querySelector('strong a, b a') || p === body.querySelector(':scope > p')) {
      p.classList.add('cards-doc-list-title');
      [...p.childNodes].forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE || !/\[[^\]]+\]/.test(node.textContent)) return;
        const span = document.createElement('span');
        span.className = 'cards-doc-list-code';
        span.textContent = node.textContent.trim();
        node.replaceWith(span, ' ');
      });
      p.querySelectorAll('em').forEach((em) => em.classList.add('cards-doc-list-marker'));
    } else if (p.querySelector('a')) {
      p.classList.add('cards-doc-list-formats');
    } else if (text) {
      p.classList.add('cards-doc-list-meta');
      const parts = text.split('|').map((s) => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        p.replaceChildren(...parts.map((part, i) => {
          const span = document.createElement('span');
          span.className = i === parts.length - 1 && /^rev/i.test(part) ? 'cards-doc-list-rev' : 'cards-doc-list-date';
          span.textContent = part;
          return span;
        }));
      }
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
      if (div.querySelector('picture') && div.textContent.trim() === '') div.className = 'cards-doc-list-card-image';
      else if (div.textContent.trim() === '' && !div.querySelector('a, picture')) div.remove();
      else {
        div.className = 'cards-doc-list-card-body';
        decorateBody(div);
      }
    });
    if (!li.querySelector('.cards-doc-list-card-image')) li.classList.add('no-image');
    ul.append(li);
  });
  optimizeImages(ul);
  block.replaceChildren(ul);
  return ul;
}

function addShowAll(block, ul, limit) {
  const items = [...ul.children];
  if (items.length <= limit) return;
  items.slice(limit).forEach((li) => li.classList.add('cards-doc-list-overflow'));
  block.classList.add('is-collapsed');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cards-doc-list-show-all';
  btn.setAttribute('aria-expanded', 'false');
  btn.textContent = 'Show All';
  btn.addEventListener('click', () => {
    const collapsed = block.classList.toggle('is-collapsed');
    btn.setAttribute('aria-expanded', !collapsed);
    btn.textContent = collapsed ? 'Show All' : 'Show Less';
  });
  block.append(btn);
}

function addFilter(block, ul) {
  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'cards-doc-list-filter';
  input.placeholder = 'Filter by keyword';
  input.setAttribute('aria-label', 'Filter by keyword');
  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    block.classList.toggle('is-filtering', !!term);
    [...ul.children].forEach((li) => {
      li.hidden = !!term && !li.textContent.toLowerCase().includes(term);
    });
  });
  block.prepend(input);
}

export default function decorate(block) {
  const ul = buildList(block);
  // source shows the first 10 documents ("1-10 of 52 documents") before "Show All"
  addShowAll(block, ul, 10);
  addFilter(block, ul);
}
