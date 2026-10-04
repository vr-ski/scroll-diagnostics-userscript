// ==UserScript==
// @name         Scroll Diagnostics (Firefox Wayland)
// @namespace    https://github.com/vr-ski/scroll-diagnostics-userscript
// @version      1.0.0
// @description  Log wheel/scroll events and dump scroll chains on any page to isolate site-specific failures
// @author       vr-ski
// @license      BSD-2-Clause
// @match        *://*/*
// @run-at       document-start
// @grant        none
// @homepageURL  https://github.com/vr-ski/scroll-diagnostics-userscript
// @supportURL   https://github.com/vr-ski/scroll-diagnostics-userscript/issues
// ==/UserScript==

(function () {
  'use strict';

  const MAX_LINES = 300;
  let panel, pre;

  function ensurePanel() {
    if (panel || !document.documentElement) return;
    panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed; right: 0; top: 0; width: 480px; height: 100vh;
      background: rgba(0,0,0,0.9); color: #0f0; font: 11px/1.35 monospace;
      padding: 6px; overflow: auto; z-index: 2147483647;
      white-space: pre-wrap; border-left: 1px solid #444;
    `;
    pre = document.createElement('pre');
    pre.style.margin = '0';
    panel.appendChild(pre);

    const close = document.createElement('button');
    close.textContent = '×';
    close.style.cssText = `
      position: absolute; top: 2px; right: 4px; background: #300;
      color: #f88; border: none; cursor: pointer; padding: 2px 6px;
    `;
    close.onclick = () => { panel.style.display = 'none'; };
    panel.appendChild(close);

    document.documentElement.appendChild(panel);
  }

  function log(msg) {
    if (!panel) ensurePanel();
    if (!panel) return;
    pre.textContent += msg + '\n';
    const lines = pre.textContent.split('\n');
    if (lines.length > MAX_LINES) {
      pre.textContent = lines.slice(-MAX_LINES).join('\n');
    }
    panel.scrollTop = panel.scrollHeight;
    console.log('[scrolldiag]', msg);
  }

  function describe(el) {
    if (!el || el.nodeType !== 1) return '(non-element)';
    if (el === document.documentElement) return 'html';
    if (el === document.body) return 'body';
    const id = el.id ? '#' + el.id : '';
    const cls = el.classList && el.classList.length
      ? '.' + Array.from(el.classList).slice(0, 3).join('.')
      : '';
    return el.tagName.toLowerCase() + id + cls;
  }

  function scrollInfo(el) {
    if (!el || el.nodeType !== 1) return '';
    const cs = getComputedStyle(el);
    return `[ovf=${cs.overflowY} osb=${cs.overscrollBehaviorY} snap=${cs.scrollSnapType}]`;
  }

  // Capture phase: what arrives, where, with what delta
  window.addEventListener('wheel', (e) => {
    log(`WHEEL-IN  ${describe(e.target)} dy=${e.deltaY} dx=${e.deltaX} ` +
        `mode=${e.deltaMode} ctrl=${e.ctrlKey} ${scrollInfo(e.target)}`);
  }, { capture: true, passive: true });

  // Bubble phase: whether any listener prevented the default action
  window.addEventListener('wheel', (e) => {
    if (e.defaultPrevented) {
      log(`WHEEL-PREVENTED ${describe(e.target)} dy=${e.deltaY}`);
    }
  }, { capture: false, passive: true });

  // Scroll events from any element (capture-phase on document catches non-bubbling scroll)
  document.addEventListener('scroll', (e) => {
    const el = e.target === document ? document.scrollingElement : e.target;
    if (!el || el.nodeType !== 1) return;
    log(`SCROLL    ${describe(el)} top=${el.scrollTop} left=${el.scrollLeft}`);
  }, { capture: true, passive: true });

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
      if (!panel) ensurePanel();
      if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensurePanel, { once: true });
  } else {
    ensurePanel();
  }

  log('scroll-diag loaded: ' + location.href);
})();
