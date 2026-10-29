/**
 * Columns Gallery: one row, two cells — media gallery | overview text.
 * Media cell: main image plus thumbnails (images and video links); clicking the main
 * image opens an expanded view. Text cell: long copy collapses behind a "More" toggle,
 * trailing button links are grouped into an action row.
 */
const VISIBLE_PARAGRAPHS = 2;
const CAPTION_TEXT = 'Click image to open expanded view';

function openExpanded(img) {
  const dialog = document.createElement('dialog');
  dialog.className = 'columns-gallery-dialog';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'columns-gallery-dialog-close';
  close.setAttribute('aria-label', 'Close');
  close.textContent = '×';
  const big = img.cloneNode(true);
  big.removeAttribute('loading');
  dialog.append(close, big);
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
}

function decorateMedia(cell) {
  const pictures = [...cell.querySelectorAll('picture')];
  const videoLinks = [...cell.querySelectorAll('a')].filter((a) => !a.querySelector('picture'));
  if (!pictures.length) return;

  const stage = document.createElement('div');
  stage.className = 'columns-gallery-stage';
  stage.append(pictures[0].cloneNode(true));

  const expand = document.createElement('button');
  expand.type = 'button';
  expand.className = 'columns-gallery-expand';
  expand.setAttribute('aria-label', 'Open expanded view');
  stage.append(expand);
  stage.addEventListener('click', (e) => {
    if (e.target.closest('picture, .columns-gallery-expand')) openExpanded(stage.querySelector('img'));
  });

  const thumbs = document.createElement('ul');
  thumbs.className = 'columns-gallery-thumbs';
  pictures.forEach((pic, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-pressed', i === 0);
    btn.setAttribute('aria-label', pic.querySelector('img')?.alt || `Image ${i + 1}`);
    btn.append(pic);
    li.append(btn);
    thumbs.append(li);
  });
  thumbs.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    stage.querySelector('picture').replaceWith(btn.querySelector('picture').cloneNode(true));
    thumbs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === btn));
  });

  // video items: render as thumbnail links with a play icon (href is the video thumbnail)
  videoLinks.forEach((a) => {
    const li = document.createElement('li');
    li.className = 'columns-gallery-video';
    const label = a.textContent.trim();
    a.className = 'columns-gallery-video-link';
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', label);
    const img = document.createElement('img');
    img.src = a.href;
    img.alt = label;
    img.loading = 'lazy';
    a.replaceChildren(img);
    li.append(a);
    thumbs.append(li);
  });

  // keep any caption text authored in the media cell, otherwise add the default hint
  let captions = [...cell.querySelectorAll('p')].filter((p) => p.textContent.trim() && !p.querySelector('a, picture'));
  if (!captions.length) {
    const p = document.createElement('p');
    p.textContent = CAPTION_TEXT;
    captions = [p];
  }
  captions.forEach((p) => p.classList.add('columns-gallery-caption'));
  cell.replaceChildren(stage, ...captions, thumbs);
}

function decorateText(cell) {
  const children = [...cell.children];
  const actions = [];
  while (children.length && children[children.length - 1].classList.contains('button-container')) {
    actions.unshift(children.pop());
  }

  const overview = document.createElement('div');
  overview.className = 'columns-gallery-overview';
  overview.append(...children);
  cell.replaceChildren(overview);

  const paragraphs = overview.querySelectorAll(':scope > p');
  if (paragraphs.length > VISIBLE_PARAGRAPHS) {
    cell.classList.add('is-collapsed');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'columns-gallery-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'More';
    toggle.addEventListener('click', () => {
      const collapsed = cell.classList.toggle('is-collapsed');
      toggle.setAttribute('aria-expanded', !collapsed);
      toggle.textContent = collapsed ? 'More' : 'Less';
    });
    cell.append(toggle);
  }

  if (actions.length) {
    const row = document.createElement('div');
    row.className = 'columns-gallery-actions';
    row.append(...actions);
    cell.append(row);
  }
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const mediaCell = cells.find((c) => c.querySelector('picture'));
    cells.forEach((cell) => {
      if (cell === mediaCell) {
        cell.classList.add('columns-gallery-media');
        decorateMedia(cell);
      } else {
        cell.classList.add('columns-gallery-text');
        decorateText(cell);
      }
    });
  });
}
