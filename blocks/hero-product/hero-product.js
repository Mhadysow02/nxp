/**
 * Hero Product block: text-first product title band.
 * Rows: [optional background image], [title (H1), product code / status, CTA links].
 */
export default function decorate(block) {
  const rows = [...block.children];
  let hasImage = false;

  rows.forEach((row) => {
    const pic = row.querySelector('picture');
    if (pic && row.textContent.trim() === '') {
      row.classList.add('hero-product-image');
      hasImage = true;
    } else if (!pic && row.textContent.trim() === '' && !row.querySelector('a')) {
      // empty optional image row
      row.remove();
    } else {
      row.classList.add('hero-product-content');
    }
  });

  if (!hasImage) block.classList.add('no-image');

  const content = block.querySelector('.hero-product-content > div') || block.querySelector('.hero-product-content');
  if (!content) return;

  // paragraphs after the heading form the meta line (product code, status, alerts link)
  const heading = content.querySelector(':scope > h1, :scope > h2');
  const metas = [];
  let el = heading ? heading.nextElementSibling : content.firstElementChild;
  while (el) {
    if (el.tagName === 'P') metas.push(el);
    el = el.nextElementSibling;
  }
  if (!metas.length) return;

  const meta = document.createElement('div');
  meta.className = 'hero-product-meta';
  metas[0].before(meta);
  meta.append(...metas);

  // classify meta items: first plain-text item is the product code,
  // a lone link is the lifecycle status, remaining items are actions (e.g. alerts)
  let codeFound = false;
  metas.forEach((p) => {
    const links = p.querySelectorAll('a');
    const isLoneLink = links.length === 1 && p.textContent.trim() === links[0].textContent.trim();
    if (isLoneLink && !p.querySelector('picture') && !meta.querySelector('.hero-product-status')) {
      p.classList.remove('button-container');
      p.classList.add('hero-product-status');
      links[0].classList.remove('button', 'primary', 'secondary');
    } else if (!codeFound && !links.length) {
      p.classList.add('hero-product-code');
      codeFound = true;
    } else {
      p.classList.add('hero-product-action');
      p.classList.remove('button-container');
      p.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
    }
  });
}
