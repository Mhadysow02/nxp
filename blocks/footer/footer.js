const TICKER_INTERVAL = 6000;

/**
 * Fetches the footer fragment. Local preview serves it under /content,
 * DA/EDS serves it at the site root.
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchFooterFragment() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Resolves relative image sources against the fragment URL
 * so they work regardless of the page path.
 * @param {Element} root
 * @param {string} base
 */
function resolveImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|data:|\/)/.test(src)) img.src = new URL(src, base).href;
  });
}

/**
 * Classifies a fragment section by its content shape.
 * @param {Element} section
 * @returns {string}
 */
function getSectionRole(section) {
  const links = section.querySelectorAll('a');
  const imgs = section.querySelectorAll('img');
  const list = section.querySelector('ul, ol');
  if (!links.length && !imgs.length) return 'control';
  if (list && section.querySelector(':scope > p > strong')) return 'ticker';
  if (!list && imgs.length) return 'brand';
  if (list && links.length && [...links].every((a) => a.querySelector('img'))) return 'social';
  if (list && section.querySelector(':scope > p')) return 'legal';
  return 'primary';
}

/**
 * Builds the rotating ticker from a label paragraph and a list of items
 * formatted "date | title <a>action</a>".
 * @param {Element} section
 * @returns {HTMLElement}
 */
function buildTicker(section) {
  const label = section.querySelector(':scope > p > strong')?.textContent.trim() || '';
  const ticker = document.createElement('div');
  ticker.className = 'footer-news';
  ticker.setAttribute('aria-live', 'polite');
  const items = [...section.querySelectorAll('li')].map((li, i) => {
    const link = li.querySelector('a');
    if (link) link.remove();
    const [date, ...rest] = li.textContent.split('|');
    const item = document.createElement('p');
    item.className = `footer-news-item${i === 0 ? ' active' : ''}`;
    const parts = [['label', label], ['date', date.trim()], ['title', rest.join('|').trim()]];
    parts.forEach(([name, text]) => {
      if (!text) return;
      const span = document.createElement('span');
      span.className = `footer-news-${name}`;
      span.textContent = text;
      item.append(span);
      if (name === 'date') {
        const sep = document.createElement('span');
        sep.className = 'footer-news-sep';
        sep.textContent = '|';
        item.append(sep);
      }
    });
    if (link) {
      link.className = 'footer-news-action';
      item.append(link);
    }
    ticker.append(item);
    return item;
  });

  if (items.length > 1) {
    let current = 0;
    let timer;
    const start = () => {
      timer = setInterval(() => {
        items[current].classList.remove('active');
        current = (current + 1) % items.length;
        items[current].classList.add('active');
      }, TICKER_INTERVAL);
    };
    ticker.addEventListener('mouseenter', () => clearInterval(timer));
    ticker.addEventListener('mouseleave', start);
    start();
  }
  return ticker;
}

/**
 * Builds the fixed back-to-top control, shown once the page is scrolled.
 * @param {Element} section
 * @returns {HTMLElement}
 */
function buildBackToTop(section) {
  const label = section.textContent.trim();
  const wrapper = document.createElement('div');
  wrapper.className = 'footer-back-to-top';
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  const icon = document.createElement('span');
  icon.className = 'footer-back-to-top-icon';
  icon.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span');
  text.className = 'footer-back-to-top-label';
  text.textContent = label;
  button.append(icon, text);
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  wrapper.append(button);
  const toggle = () => wrapper.classList.toggle('visible', window.scrollY > 300);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
  return wrapper;
}

/**
 * Moves a section's list into a classed container.
 * @param {Element} section
 * @param {string} className
 * @returns {Element}
 */
function classList(section, className) {
  const list = section.querySelector('ul, ol');
  list.className = className;
  return list;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooterFragment();
  block.textContent = '';
  if (!fragment) return;

  const source = document.createElement('div');
  source.innerHTML = fragment.html;
  resolveImages(source, fragment.base);

  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  const navRow = document.createElement('div');
  navRow.className = 'footer-row footer-row-nav';
  const legalRow = document.createElement('div');
  legalRow.className = 'footer-row footer-row-legal';
  let control;

  [...source.children].forEach((section) => {
    const role = getSectionRole(section);
    if (role === 'control') {
      control = buildBackToTop(section);
    } else if (role === 'ticker') {
      inner.append(buildTicker(section));
    } else if (role === 'brand') {
      const brand = document.createElement('div');
      brand.className = 'footer-logo';
      brand.append(...section.childNodes);
      inner.append(brand);
    } else if (role === 'primary') {
      navRow.append(classList(section, 'footer-nav-primary'));
    } else if (role === 'social') {
      const social = classList(section, 'footer-nav-social');
      social.querySelectorAll('a').forEach((a) => {
        const img = a.querySelector('img');
        if (img && !a.getAttribute('aria-label')) a.setAttribute('aria-label', img.alt);
      });
      navRow.append(social);
    } else if (role === 'legal') {
      legalRow.append(classList(section, 'footer-nav-legal'));
      const copyright = section.querySelector(':scope > p');
      if (copyright) {
        copyright.className = 'footer-license';
        legalRow.append(copyright);
      }
    }
  });

  if (navRow.children.length) inner.append(navRow);
  if (legalRow.children.length) inner.append(legalRow);
  block.append(inner);
  if (control) block.append(control);
}
