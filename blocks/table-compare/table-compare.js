import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Table Compare: bordered comparison grid. First row is the header (unless `no-header`).
 * Empty cells that follow a filled cell extend it (colspan), recreating spanned
 * cells that authoring flattened into the grid.
 */
function mergeEmptyCells(tr) {
  let anchor = null;
  [...tr.children].forEach((cell) => {
    const empty = cell.textContent.trim() === '' && !cell.querySelector('img, picture, a');
    if (empty && anchor) {
      anchor.colSpan += 1;
      cell.remove();
    } else if (!empty) {
      anchor = cell;
    }
  });
}

/** Table links are plain text links: undo EDS auto-button decoration. */
function unbutton(cell) {
  cell.querySelectorAll('a.button').forEach((a) => a.classList.remove('button', 'primary', 'secondary'));
  cell.querySelectorAll('.button-container').forEach((p) => p.classList.remove('button-container'));
}

/**
 * A paragraph that starts with a bold title followed by a line break carries a
 * secondary note after the break (e.g. "including Config Tools"): mark it up.
 */
function wrapNotes(cell) {
  cell.querySelectorAll('p').forEach((p) => {
    const first = p.firstElementChild;
    const br = p.querySelector(':scope > br');
    if (!first || first.tagName !== 'STRONG' || !br) return;
    const rest = [];
    let n = br.nextSibling;
    while (n) {
      rest.push(n);
      n = n.nextSibling;
    }
    if (!rest.some((node) => node.textContent.trim())) return;
    const span = document.createElement('span');
    span.className = 'table-compare-note';
    span.append(...rest);
    if (span.firstChild && span.firstChild.nodeType === Node.TEXT_NODE) {
      span.firstChild.textContent = span.firstChild.textContent.replace(/^\s+/, '');
    }
    p.append(span);
  });
}

/** A link that closes a sentence ("... Support Home") is a CTA with a chevron. */
function markCtas(cell) {
  cell.querySelectorAll('p > a:last-child').forEach((a) => {
    const p = a.parentElement;
    const before = p.textContent.slice(0, p.textContent.lastIndexOf(a.textContent)).trim();
    if (before && !a.nextSibling?.textContent.trim()) a.classList.add('table-compare-cta');
  });
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const header = !block.classList.contains('no-header');

  [...block.children].forEach((row, i) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);
    const isHead = i === 0 && header;

    [...row.children].forEach((cell) => {
      const td = document.createElement(isHead ? 'th' : 'td');
      if (isHead) td.setAttribute('scope', 'col');
      td.innerHTML = cell.innerHTML;
      unbutton(td);
      if (!isHead) {
        wrapNotes(td);
        markCtas(td);
      }
      tr.append(td);
    });

    mergeEmptyCells(tr);
    if (isHead) {
      thead.append(tr);
    } else {
      // a body row whose first cell is bold/strong-only acts as a row header
      const first = tr.firstElementChild;
      if (first && first.querySelector('strong') && first.textContent.trim() === first.querySelector('strong').textContent.trim()) {
        tr.classList.add('table-compare-group');
      }
      tbody.append(tr);
    }
  });

  table.append(thead, tbody);
  const scroller = document.createElement('div');
  scroller.className = 'table-compare-scroller';
  scroller.append(table);
  block.replaceChildren(scroller);
}
