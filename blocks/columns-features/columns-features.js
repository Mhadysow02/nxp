/**
 * Columns Features: one row per feature group — group label | bullet list.
 * On desktop the list is clipped to a fixed height with a fade and a
 * "More"/"Less" toggle (as on the source); on mobile every group is shown.
 */

const TOGGLE_LABELS = { collapsed: 'More', expanded: 'Less' };

/**
 * The authored page carries a placeholder "More" link right after the block.
 * The block renders its own toggle, so drop that placeholder paragraph.
 */
function removeAuthoredToggle(block) {
  const wrapper = block.closest('.columns-features-wrapper') || block;
  const next = wrapper.nextElementSibling;
  if (!next) return;
  const candidate = next.classList.contains('default-content-wrapper')
    ? next.firstElementChild
    : next;
  if (!candidate || candidate.tagName !== 'P') return;
  const link = candidate.querySelector('a');
  const text = candidate.textContent.trim().toLowerCase();
  if (!link || (text !== 'more' && text !== 'less')) return;
  candidate.remove();
  if (!next.children.length && next.classList.contains('default-content-wrapper')) next.remove();
}

export default function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    row.classList.add('columns-features-row');
    const [label, body] = row.children;
    label?.classList.add('columns-features-label');
    body?.classList.add('columns-features-body');
  });

  removeAuthoredToggle(block);

  const list = document.createElement('div');
  list.className = 'columns-features-list';
  list.id = `columns-features-list-${Math.random().toString(36).slice(2, 8)}`;
  list.append(...rows);

  const toggleWrap = document.createElement('p');
  toggleWrap.className = 'columns-features-toggle-wrap';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'columns-features-toggle';
  toggle.setAttribute('aria-controls', list.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = TOGGLE_LABELS.collapsed;
  toggleWrap.append(toggle);

  block.classList.add('is-collapsed');
  block.replaceChildren(list, toggleWrap);

  toggle.addEventListener('click', () => {
    const collapsed = block.classList.toggle('is-collapsed');
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.textContent = collapsed ? TOGGLE_LABELS.collapsed : TOGGLE_LABELS.expanded;
  });

  // hide the toggle when the content fits within the collapsed height
  const observer = new ResizeObserver(() => {
    if (!block.classList.contains('is-collapsed')) return;
    block.classList.toggle('is-short', list.scrollHeight <= list.clientHeight + 1);
  });
  observer.observe(list);
}
