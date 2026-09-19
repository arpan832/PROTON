/* SPIDEY OS INTEGRATION LAYER
   Preserves existing Notepad/Calculator while connecting them to new WindowManager + Taskbar
*/

(function() {
  function initIntegration() {
    const wm = window.SpidyWindowManager;
    const taskbar = window.SpidyTaskbar;
    if (!wm) {
      setTimeout(initIntegration, 100);
      return;
    }

    // Ensure legacy panels start closed (preserve but fix initial open class bug)
    const notePanel = document.getElementById('note-bigbox');
    const calcPanel = document.getElementById('cal-bigbox');
    if (notePanel) {
      notePanel.classList.remove('open');
      notePanel.setAttribute('aria-hidden', 'true');
    }
    if (calcPanel) {
      calcPanel.classList.remove('open');
      calcPanel.setAttribute('aria-hidden', 'true');
    }

    // Re-wire legacy floating icons to use WindowManager
    // We clone nodes to remove old listeners added by legacy scripts
    function rewireIcon(iconId, appId) {
      const oldIcon = document.getElementById(iconId);
      if (!oldIcon) return;
      const newIcon = oldIcon.cloneNode(true);
      oldIcon.parentNode.replaceChild(newIcon, oldIcon);
      newIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        wm.openWindow(appId);
      });
      // keep id
      newIcon.id = iconId;
    }

    rewireIcon('note-box', 'notepad');
    rewireIcon('cal-box', 'calculator');

    // Override legacy close buttons to use WM
    const noteClose = document.getElementById('note-close');
    if (noteClose) {
      const newClose = noteClose.cloneNode(true);
      noteClose.parentNode.replaceChild(newClose, noteClose);
      newClose.id = 'note-close';
      newClose.addEventListener('click', (e) => {
        e.stopPropagation();
        wm.closeWindow('notepad');
      });
    }

    const calcClose = document.getElementById('calc-close');
    if (calcClose) {
      const newClose = calcClose.cloneNode(true);
      calcClose.parentNode.replaceChild(newClose, calcClose);
      newClose.id = 'calc-close';
      newClose.addEventListener('click', (e) => {
        e.stopPropagation();
        wm.closeWindow('calculator');
      });
    }

    // Make legacy panels draggable via WindowManager logic (if not already)
    function enhanceLegacyDrag(panelId, headerSelector) {
      const panel = document.getElementById(panelId);
      const header = panel ? panel.querySelector(headerSelector) : null;
      if (!panel || !header) return;
      let isDragging = false;
      let offsetX = 0, offsetY = 0;

      header.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        isDragging = true;
        offsetX = e.clientX - panel.offsetLeft;
        offsetY = e.clientY - panel.offsetTop;
        header.style.cursor = 'grabbing';
        panel.style.transition = 'none';
        wm.focusWindow(panelId === 'note-bigbox' ? 'notepad' : 'calculator');
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const left = e.clientX - offsetX;
        const top = e.clientY - offsetY;
        panel.style.left = Math.max(5, Math.min(window.innerWidth - panel.offsetWidth - 5, left)) + 'px';
        panel.style.top = Math.max(40, Math.min(window.innerHeight - panel.offsetHeight - 80, top)) + 'px';
      });

      window.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          header.style.cursor = 'grab';
          panel.style.transition = '';
          wm.saveState();
        }
      });
    }

    enhanceLegacyDrag('note-bigbox', '.notepad-header');
    enhanceLegacyDrag('cal-bigbox', '.calculator-header');

    // Focus handling for legacy panels
    [notePanel, calcPanel].forEach(panel => {
      if (!panel) return;
      panel.addEventListener('mousedown', () => {
        const appId = panel.id === 'note-bigbox' ? 'notepad' : 'calculator';
        wm.focusWindow(appId);
      });
    });

    // Sync topbar clock with existing clock logic
    const existingClock = document.getElementById('clock');
    const existingDate = document.getElementById('Dati');
    const topbarClock = document.getElementById('spidey-topbar-clock');
    const topbarDate = document.getElementById('spidey-topbar-date');

    function syncClocks() {
      if (existingClock && topbarClock) topbarClock.textContent = existingClock.textContent;
      if (existingDate && topbarDate) topbarDate.textContent = existingDate.textContent;
    }
    setInterval(syncClocks, 1000);
    syncClocks();

    // Expose helper for adding new apps easily
    window.SpidyOS = {
      openApp: (id) => wm.openWindow(id),
      closeApp: (id) => wm.closeWindow(id),
      apps: window.SPIDEY_APPS,
      version: '2.0 - Friendly Neighborhood Edition'
    };

    console.log('%c🕷️ SPIDEY OS v2.0 Loaded', 'color:#e10600;font-weight:800;font-size:14px;');
    console.log('Apps:', window.SPIDEY_APPS.map(a => a.id).join(', '));
    console.log('Tip: Use SpidyOS.openApp("weather") or SpidyOS.openApp("bugle") in console');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntegration);
  } else {
    initIntegration();
  }
})();
