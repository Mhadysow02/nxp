import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Cards Product: horizontally scrolling product boxes (image | name link, status, tag,
 * description, data sheet links) with previous/next controls and a progress bar.
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

/* name the body parts: heading (name + status), tag, description, data sheet links */
function decorateBody(body) {
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    const wrap = document.createElement('div');
    wrap.className = 'cards-product-heading';
    heading.before(wrap);
    wrap.append(heading);
    const status = wrap.nextElementSibling;
    if (status?.tagName === 'P' && !status.querySelector('a, em, strong')
      && status.textContent.trim().length <= 30) {
      status.className = 'cards-product-status';
      wrap.append(status);
    }
  }
  body.querySelectorAll(':scope > p').forEach((p) => {
    if (p.className) return;
    const elements = [...p.children];
    if (p.querySelector('a') && p.querySelector('strong, b')) {
      p.className = 'cards-product-links';
    } else if (elements.length === 1 && elements[0].matches('em, i')
      && p.textContent.trim() === elements[0].textContent.trim()) {
      p.className = 'cards-product-tag';
    } else {
      p.className = 'cards-product-description';
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
      if (div.querySelector('picture') && div.textContent.trim() === '') div.className = 'cards-product-card-image';
      else if (div.textContent.trim() === '' && !div.querySelector('a, picture')) div.remove();
      else {
        div.className = 'cards-product-card-body';
        decorateBody(div);
      }
    });
    if (!li.querySelector('.cards-product-card-image')) li.classList.add('no-image');
    ul.append(li);
  });
  optimizeImages(ul);
  // a hot-linked image that fails keeps its reserved box, without the broken-image glyph
  ul.querySelectorAll('.cards-product-card-image img').forEach((img) => {
    const markBroken = () => img.closest('.cards-product-card-image')?.classList.add('is-broken');
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) markBroken();
    img.addEventListener('error', markBroken, { once: true });
  });
  block.replaceChildren(ul);
  return ul;
}

function addSlider(block, ul) {
  const viewport = document.createElement('div');
  viewport.className = 'cards-product-viewport';
  ul.before(viewport);
  viewport.append(ul);

  const controls = document.createElement('div');
  controls.className = 'cards-product-controls';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'cards-product-prev';
  prev.setAttribute('aria-label', 'Previous products');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'cards-product-next';
  next.setAttribute('aria-label', 'Next products');
  const progress = document.createElement('div');
  progress.className = 'cards-product-progress';
  const bar = document.createElement('span');
  progress.append(bar);
  controls.append(prev, progress, next);
  block.append(controls);

  const step = () => {
    const gap = parseFloat(getComputedStyle(ul).columnGap) || 0;
    return ul.clientWidth + gap;
  };
  prev.addEventListener('click', () => ul.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => ul.scrollBy({ left: step(), behavior: 'smooth' }));

  const update = () => {
    const max = ul.scrollWidth - ul.clientWidth;
    const ratio = max > 0 ? Math.min(1, Math.max(0, ul.scrollLeft / max)) : 0;
    const visible = ul.scrollWidth > 0 ? Math.min(1, ul.clientWidth / ul.scrollWidth) : 1;
    bar.style.width = `${visible * 100}%`;
    bar.style.transform = `translateX(${(ratio * (1 - visible) * 100) / visible}%)`;
    prev.disabled = ul.scrollLeft <= 1;
    next.disabled = ul.scrollLeft >= max - 1;
    controls.hidden = max <= 0;
  };
  ul.addEventListener('scroll', update, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(update).observe(ul);
  else window.addEventListener('resize', update);
  requestAnimationFrame(update);
}

export default function decorate(block) {
  const ul = buildList(block);
  ul.classList.add('cards-product-track');
  addSlider(block, ul);
}
