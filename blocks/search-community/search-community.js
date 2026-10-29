/**
 * Search Community: a search field that submits to the NXP Community search
 * (community.nxp.com), not the site's own query index.
 * Rows: [search target URL (link or text)], optional [placeholder text], optional [button label].
 */
const DEFAULT_TARGET = 'https://community.nxp.com/t5/forums/searchpage/tab/message';
const ALLOWED_HOST = 'community.nxp.com';

function resolveTarget(block) {
  const firstRow = block.firstElementChild;
  const raw = firstRow?.querySelector('a[href]')?.href || firstRow?.textContent.trim();
  try {
    const url = new URL(raw, window.location.href);
    if (url.hostname === ALLOWED_HOST) return url;
  } catch (e) {
    // fall through to default
  }
  return new URL(DEFAULT_TARGET);
}

export default function decorate(block) {
  const target = resolveTarget(block);
  const rows = [...block.children];
  const placeholder = rows[1]?.textContent.trim() || 'Search NXP Community';
  const label = rows[2]?.textContent.trim() || 'Search';

  const form = document.createElement('form');
  form.className = 'search-community-form';
  form.setAttribute('role', 'search');
  form.method = 'get';
  form.action = `${target.origin}${target.pathname}`;
  form.target = '_blank';
  form.setAttribute('rel', 'noopener');

  // carry fixed parameters of the configured URL (e.g. advanced=false) as hidden fields
  target.searchParams.forEach((value, key) => {
    if (key === 'q') return;
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = key;
    hidden.value = value;
    form.append(hidden);
  });

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.className = 'search-community-input';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);
  input.required = true;

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'search-community-submit';
  button.textContent = label;

  form.append(input, button);
  block.replaceChildren(form);
}
