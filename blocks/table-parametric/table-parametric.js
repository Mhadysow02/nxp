import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Table Parametric: part-number rows by parameter columns. First row is the header.
 * Adds a part filter (in the "Part" header cell), result count, pagination
 * and a CSV download of the table data.
 */
const PAGE_SIZE = 10;

function cellText(cell) {
  return cell.textContent.replace(/\s+/g, ' ').trim();
}

function toClassName(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function toCsv(grid) {
  return [...grid.querySelectorAll('tr')]
    .map((tr) => [...tr.children].map((c) => `"${cellText(c).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
}

/* links inside the table are plain links, not EDS auto-decorated buttons */
function unbutton(cell) {
  cell.querySelectorAll('.button-container').forEach((p) => p.classList.remove('button-container'));
  cell.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
}

function buildTable(block) {
  const grid = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const colClasses = [];
  [...block.children].forEach((row, i) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);
    [...row.children].forEach((cell, j) => {
      const el = document.createElement(i === 0 || j === 0 ? 'th' : 'td');
      el.setAttribute('scope', i === 0 ? 'col' : 'row');
      el.innerHTML = cell.innerHTML;
      unbutton(el);
      if (i === 0) colClasses[j] = `col-${toClassName(cellText(cell))}`;
      if (colClasses[j] && colClasses[j] !== 'col-') el.classList.add(colClasses[j]);
      if (j === 0) el.classList.add('table-parametric-part');
      tr.append(el);
    });
    (i === 0 ? thead : tbody).append(tr);
  });
  grid.append(thead, tbody);
  return grid;
}

function pagerButton(label, pageNum, { current = false, disabled = false, cls = '' } = {}) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.dataset.page = pageNum;
  if (cls) btn.className = cls;
  if (current) btn.setAttribute('aria-current', 'page');
  if (disabled) btn.disabled = true;
  if (cls) {
    btn.setAttribute('aria-label', label);
  } else {
    btn.textContent = label;
    btn.setAttribute('aria-label', `Page ${label}`);
  }
  li.append(btn);
  return li;
}

export default async function decorate(block) {
  const grid = buildTable(block);
  const rows = [...grid.tBodies[0].rows];

  /* toolbar: result count + download */
  const toolbar = document.createElement('div');
  toolbar.className = 'table-parametric-toolbar';

  const count = document.createElement('p');
  count.className = 'table-parametric-count';
  count.setAttribute('aria-live', 'polite');

  const download = document.createElement('button');
  download.type = 'button';
  download.className = 'table-parametric-download';
  download.textContent = 'Download CSV';
  download.addEventListener('click', () => {
    const blob = new Blob([toCsv(grid)], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'parametrics.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  toolbar.append(count, download);

  /* part filter lives in the first header cell, as on the source */
  const filterWrap = document.createElement('div');
  filterWrap.className = 'table-parametric-filter';
  const filter = document.createElement('input');
  filter.type = 'search';
  filter.placeholder = 'Filter by part number';
  filter.setAttribute('aria-label', 'Filter by part number');
  filterWrap.append(filter);
  const partHead = grid.tHead.rows[0]?.cells[0];
  if (partHead) partHead.append(filterWrap);

  const scroller = document.createElement('div');
  scroller.className = 'table-parametric-scroller';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', 'Parametric part table');
  scroller.append(grid);

  /* footer: range + pagination */
  const footer = document.createElement('nav');
  footer.className = 'table-parametric-footer';
  footer.setAttribute('aria-label', 'Pagination');
  const range = document.createElement('p');
  range.className = 'table-parametric-range';
  const pager = document.createElement('ul');
  pager.className = 'table-parametric-pager';
  footer.append(range, pager);

  let page = 1;
  const render = () => {
    const term = filter.value.trim().toLowerCase();
    const matches = rows
      .filter((tr) => !term || cellText(tr.cells[0]).toLowerCase().includes(term));
    const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    page = Math.min(page, pages);
    const start = (page - 1) * PAGE_SIZE;
    rows.forEach((tr) => { tr.hidden = true; });
    matches.slice(start, start + PAGE_SIZE).forEach((tr) => { tr.hidden = false; });
    const last = Math.min(start + PAGE_SIZE, matches.length);
    const span = matches.length ? `${start + 1}-${last} of ${matches.length}` : '0 of 0';
    count.textContent = matches.length ? `${span} results` : 'No results';
    range.textContent = span;

    const items = [];
    if (pages > 1) {
      items.push(pagerButton('Previous page', page - 1, { disabled: page === 1, cls: 'prev' }));
      for (let n = 1; n <= pages; n += 1) {
        items.push(pagerButton(String(n), n, { current: n === page }));
      }
      items.push(pagerButton('Next page', page + 1, { disabled: page === pages, cls: 'next' }));
    }
    pager.replaceChildren(...items);
  };
  filter.addEventListener('input', () => { page = 1; render(); });
  pager.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-page]');
    if (!btn || btn.disabled) return;
    page = Number(btn.dataset.page);
    render();
  });

  block.replaceChildren(toolbar, scroller, footer);
  render();
}
