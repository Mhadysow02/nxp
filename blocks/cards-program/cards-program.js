import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Cards Program: stacked program items — logo image | title, description, Read more link.
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

function buildList(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && div.textContent.trim() === '') div.className = 'cards-program-card-image';
      else if (div.textContent.trim() === '' && !div.querySelector('a, picture')) div.remove();
      else div.className = 'cards-program-card-body';
    });
    if (!li.querySelector('.cards-program-card-image')) li.classList.add('no-image');
    ul.append(li);
  });
  optimizeImages(ul);
  block.replaceChildren(ul);
  return ul;
}

export default function decorate(block) {
  buildList(block);
}
