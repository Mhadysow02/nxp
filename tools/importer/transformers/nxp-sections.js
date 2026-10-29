/* eslint-disable */
/* global WebImporter */

/**
 * NXP sections transformer.
 * Inserts section breaks (<hr>) before every non-first template section in
 * beforeTransform (while parser targets still exist) and adds Section Metadata
 * for styled sections in afterTransform.
 */

const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (let i = 0; i < selectors.length; i += 1) {
    const sel = selectors[i];
    if (sel) {
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
        // invalid selector, try next
      }
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = (template && template.sections) || [];
  if (sections.length < 2) return;
  const document = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (el) {
        if (i > 0 || section.style) {
          const hr = document.createElement('hr');
          if (section.style) hr.setAttribute(MARKER, section.id);
          el.parentNode.insertBefore(hr, el);
        }
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (section.style) {
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        const anchor = marker || findSectionElement(element, section);
        if (anchor) {
          const meta = WebImporter.Blocks.createBlock(document, {
            name: 'Section Metadata',
            cells: { style: section.style },
          });
          // Place metadata at the end of the section: before the next section break.
          let cursor = anchor.nextElementSibling;
          let last = anchor;
          while (cursor && cursor.tagName !== 'HR') {
            last = cursor;
            cursor = cursor.nextElementSibling;
          }
          last.after(meta);
          if (marker) {
            if (i === 0) {
              marker.remove();
            } else {
              marker.removeAttribute(MARKER);
            }
          }
        }
      }
    }
    // Clean up any leftover markers.
    element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
  }
}
