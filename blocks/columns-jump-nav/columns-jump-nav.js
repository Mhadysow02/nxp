/**
 * Columns Jump Nav: one row, three cells — label | in-page anchor links | action buttons.
 * Becomes sticky on scroll and highlights the link of the section in view.
 */
const CELL_CLASSES = ['label', 'links', 'actions'];

function setupActiveLink(block) {
  const links = [...block.querySelectorAll('.columns-jump-nav-links a[href*="#"]')];
  // section right below the jump nav: fallback target for a first link without an anchor
  const nextSection = block.closest('.section')?.nextElementSibling;
  const targets = links
    .map((a, i) => {
      const id = decodeURIComponent(new URL(a.href, window.location.href).hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      // observe the whole section so short headings still register while in view
      let el = target?.closest('main > .section') || target;
      if (!el && i === 0 && nextSection?.classList.contains('section')) el = nextSection;
      return el ? { a, el } : null;
    })
    .filter(Boolean);
  // first link is active until another section scrolls into view (as on the source)
  links[0]?.setAttribute('aria-current', 'true');
  if (!targets.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const match = targets.find(({ el }) => el === entry.target);
      links.forEach((a) => {
        if (a === match?.a) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  targets.forEach(({ el }) => observer.observe(el));
}

function setupSticky(block) {
  // the section is the sticky element (see CSS), so the sentinel must sit outside it
  const anchor = block.closest('.section') || block.closest('.columns-jump-nav-wrapper') || block;
  const sentinel = document.createElement('div');
  sentinel.className = 'columns-jump-nav-sentinel';
  sentinel.setAttribute('aria-hidden', 'true');
  anchor.before(sentinel);
  if (!('IntersectionObserver' in window)) return;
  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 0;
  const observer = new IntersectionObserver(([entry]) => {
    block.classList.toggle('is-stuck', !entry.isIntersecting);
  }, { rootMargin: `-${navHeight + 1}px 0px 0px 0px` });
  observer.observe(sentinel);
}

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  block.setAttribute('role', 'navigation');
  block.setAttribute('aria-label', row.firstElementChild?.textContent.trim() || 'Jump to');

  [...row.children].forEach((cell, i) => {
    cell.classList.add(`columns-jump-nav-${CELL_CLASSES[i] || 'extra'}`);
  });

  // links cell: normalise to a list so it can scroll horizontally
  const linksCell = row.querySelector('.columns-jump-nav-links');
  if (linksCell && !linksCell.querySelector('ul')) {
    const anchors = [...linksCell.querySelectorAll('a')];
    if (anchors.length) {
      const ul = document.createElement('ul');
      anchors.forEach((a) => {
        const li = document.createElement('li');
        a.classList.remove('button');
        a.closest('.button-container')?.classList.remove('button-container');
        li.append(a);
        ul.append(li);
      });
      linksCell.replaceChildren(ul);
    }
  }

  setupSticky(block);
  setupActiveLink(block);
}
