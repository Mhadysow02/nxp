/**
 * Columns Links: one row of side-by-side link groups, each cell a heading plus a link list.
 */
export default function decorate(block) {
  const cols = block.firstElementChild ? [...block.firstElementChild.children] : [];
  block.classList.add(`columns-links-${cols.length}-cols`);
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      cell.classList.add('columns-links-group');
      // plain paragraphs of single links become a list
      const linkParas = [...cell.querySelectorAll(':scope > p')]
        .filter((p) => p.children.length === 1 && p.firstElementChild.tagName === 'A'
          && p.textContent.trim() === p.firstElementChild.textContent.trim());
      if (linkParas.length > 1 && !cell.querySelector('ul')) {
        const ul = document.createElement('ul');
        linkParas[0].before(ul);
        linkParas.forEach((p) => {
          const li = document.createElement('li');
          const a = p.firstElementChild;
          a.classList.remove('button');
          li.append(a);
          ul.append(li);
          p.remove();
        });
      }
    });
  });
}
