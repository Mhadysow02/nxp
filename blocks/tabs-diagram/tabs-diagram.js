// eslint-disable-next-line import/no-unresolved
import { moveInstrumentation } from '../../scripts/scripts.js';

// keep track globally of the number of tab blocks on the page
let tabBlockCnt = 0;

function openExpanded(img) {
  const dialog = document.createElement('dialog');
  dialog.className = 'tabs-diagram-dialog';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'tabs-diagram-dialog-close';
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

/**
 * Tabs Diagram: one row per diagram — label | panel (H3 title, diagram image, PDF link).
 * Labels render as pill toggles; each diagram sits in a frame with an expand control.
 */
export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-diagram-list';
  tablist.setAttribute('role', 'tablist');
  tablist.id = `tabs-diagram-list-${tabBlockCnt += 1}`;

  const tabHeadings = [...block.children]
    .filter((child) => child.firstElementChild && child.firstElementChild.children.length > 0)
    .map((child) => child.firstElementChild);

  tabHeadings.forEach((tab, i) => {
    const id = `tabs-diagram-panel-${tabBlockCnt}-${i + 1}`;

    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-diagram-panel';
    tabpanel.id = id;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    const button = document.createElement('button');
    button.className = 'tabs-diagram-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });

    tablist.append(button);
    tab.remove();
    if (button.firstElementChild) {
      moveInstrumentation(button.firstElementChild, null);
    }

    // wrap the diagram image in a frame with an expand control
    const pic = tabpanel.querySelector('picture');
    if (pic) {
      const frame = document.createElement('div');
      frame.className = 'tabs-diagram-frame';
      const heading = tabpanel.querySelector('h1, h2, h3, h4, h5, h6');
      const picHost = pic.parentElement.tagName === 'P' && pic.parentElement.children.length === 1
        ? pic.parentElement : pic;
      picHost.before(frame);
      if (heading) frame.append(heading);
      frame.append(picHost);
      const expand = document.createElement('button');
      expand.type = 'button';
      expand.className = 'tabs-diagram-expand';
      expand.setAttribute('aria-label', 'Expand diagram');
      expand.addEventListener('click', () => openExpanded(pic.querySelector('img')));
      frame.append(expand);
    }
  });

  block.prepend(tablist);
}
