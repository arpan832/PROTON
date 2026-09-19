/* SPIDEY OS WINDOW MANAGER
   Handles open/close/focus/minimize/z-index/drag/resize/state
*/

class SpideyWindowManager {
  constructor() {
    this.windows = new Map(); // id -> { element, app, z, minimized, instance }
    this.zCounter = 100;
    this.windowLayer = null;
    this.storageKey = 'spidey-window-state-v1';
    this.init();
  }

  init() {
    this.windowLayer = document.getElementById('window-layer');
    if (!this.windowLayer) {
      this.windowLayer = document.createElement('div');
      this.windowLayer.id = 'window-layer';
      document.body.appendChild(this.windowLayer);
    }
    // global listeners for custom close events from stub apps
    this.windowLayer.addEventListener('spidey-request-close', (e) => {
      const appId = e.detail?.appId;
      if (appId) this.closeWindow(appId);
    });
    // handle legacy panels existing outside layer - bring them into management
    this.adoptLegacyPanels();
    this.restoreState();
  }

  adoptLegacyPanels() {
    // legacy panels will be managed but keep their own CSS
    const legacyIds = ['note-bigbox', 'cal-bigbox'];
    legacyIds.forEach(panelId => {
      const panel = document.getElementById(panelId);
      if (panel) {
        // ensure they are above desktop but below taskbar
        panel.style.zIndex = '60';
        // add focused handling
        panel.addEventListener('mousedown', () => {
          const appId = panelId.includes('note') ? 'notepad' : 'calculator';
          this.focusWindow(appId);
        });
      }
    });
  }

  getNextZ() {
    return ++this.zCounter;
  }

  isOpen(appId) {
    return this.windows.has(appId) && !this.windows.get(appId).minimized;
  }

  isMinimized(appId) {
    return this.windows.has(appId) && this.windows.get(appId).minimized;
  }

  openWindow(appId) {
    const app = window.getSpideyApp(appId);
    if (!app) { console.warn('App not found', appId); return; }

    // Legacy handling
    if (app.isLegacy) {
      const panel = document.getElementById(app.legacyPanelId);
      if (!panel) return;
      const isOpen = panel.classList.contains('open');
      if (isOpen) {
        // if minimized, restore; else focus
        panel.classList.remove('minimized');
        this.focusWindow(appId);
        panel.style.zIndex = this.getNextZ();
        this.updateTaskbar();
        this.saveState();
        return;
      }
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      panel.style.zIndex = this.getNextZ();
      // ensure visible position
      if (!panel.style.left || panel.style.left === '0px') {
        panel.style.left = appId === 'notepad' ? '80px' : '120px';
        panel.style.top = appId === 'notepad' ? '80px' : '100px';
      }
      // track in map for taskbar
      this.windows.set(appId, { element: panel, app, z: parseInt(panel.style.zIndex), minimized: false, isLegacy: true });
      this.focusWindow(appId);
      this.updateTaskbar();
      this.saveState();
      return;
    }

    // Check if already open
    if (this.windows.has(appId)) {
      const win = this.windows.get(appId);
      if (win.minimized) {
        this.restoreWindow(appId);
      } else {
        this.focusWindow(appId);
      }
      return;
    }

    // Create new spidey window
    const winEl = this.createWindowElement(app);
    this.windowLayer.appendChild(winEl);
    
    // Instantiate app component inside body
    const body = winEl.querySelector('.spidey-window-body');
    let instance = null;
    if (app.component && window[app.component]) {
      try {
        instance = new window[app.component](body);
      } catch (e) {
        console.error('Failed to instantiate app', appId, e);
        body.innerHTML = `<div style="padding:20px;color:#ff9999;">Failed to load ${app.name}: ${e.message}</div>`;
      }
    }

    const z = this.getNextZ();
    winEl.style.zIndex = z;
    winEl.style.width = app.width + 'px';
    winEl.style.height = app.height + 'px';
    // smart positioning - cascade
    const offset = this.windows.size * 28;
    const baseLeft = Math.min(window.innerWidth * 0.15 + offset, window.innerWidth - app.width - 40);
    const baseTop = Math.min(80 + offset, window.innerHeight - app.height - 100);
    winEl.style.left = Math.max(10, baseLeft) + 'px';
    winEl.style.top = Math.max(20, baseTop) + 'px';

    // animation
    requestAnimationFrame(() => winEl.classList.add('entering'));

    this.windows.set(appId, { element: winEl, app, z, minimized: false, instance, isLegacy: false });

    this.focusWindow(appId);
    this.makeDraggable(winEl, appId);
    this.makeResizable(winEl);
    this.updateTaskbar();
    this.saveState();

    // focus tracking for mouse
    winEl.addEventListener('mousemove', (e) => {
      const rect = winEl.getBoundingClientRect();
      winEl.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
      winEl.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  }

  createWindowElement(app) {
    const el = document.createElement('div');
    el.className = 'spidey-window';
    el.dataset.appId = app.id;
    el.innerHTML = `
      <div class="spidey-window-header">
        <div class="spidey-window-title">
          <span class="spidey-window-title-icon">${this.getIconHTML(app, 16)}</span>
          <span>${app.name}</span>
        </div>
        <div class="spidey-window-controls">
          <button class="spidey-win-btn minimize" data-action="minimize" title="Minimize">─</button>
          <button class="spidey-win-btn close" data-action="close" title="Close">×</button>
        </div>
      </div>
      <div class="spidey-window-body"></div>
      <div class="spidey-resize-handle"></div>
    `;

    // header buttons
    el.querySelector('[data-action="close"]').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeWindow(app.id);
    });
    el.querySelector('[data-action="minimize"]').addEventListener('click', (e) => {
      e.stopPropagation();
      this.minimizeWindow(app.id);
    });

    // focus on click
    el.addEventListener('mousedown', () => this.focusWindow(app.id));

    return el;
  }

  getIconHTML(app, size = 26) {
    // try image, fallback to emoji
    // we use <img> with onerror fallback
    const safeId = `icon-${app.id}-${Date.now()}`;
    return `
      <span style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;">
        <img src="${app.icon}" alt="" style="width:${size}px;height:${size}px;object-fit:contain;display:block;" 
          onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
        <span style="display:none;width:${size}px;height:${size}px;place-items:center;font-size:${Math.round(size*0.7)}px;">${app.fallbackIcon}</span>
      </span>
    `;
  }

  focusWindow(appId) {
    // remove focused from all
    this.windows.forEach((win, id) => {
      win.element.classList.remove('focused');
    });
    document.querySelectorAll('.notepad-panel, .calculator-panel').forEach(p => p.classList.remove('focused-legacy'));

    const win = this.windows.get(appId);
    if (!win) {
      // legacy maybe not in map yet but panel exists
      const app = window.getSpideyApp(appId);
      if (app?.isLegacy) {
        const panel = document.getElementById(app.legacyPanelId);
        if (panel) {
          panel.classList.add('focused-legacy');
          panel.style.zIndex = this.getNextZ();
        }
      }
      this.updateTaskbarFocus(appId);
      return;
    }
    win.element.classList.add('focused');
    win.z = this.getNextZ();
    win.element.style.zIndex = win.z;
    this.updateTaskbarFocus(appId);
    this.saveState();
  }

  closeWindow(appId) {
    const win = this.windows.get(appId);
    if (!win) {
      // legacy close
      const app = window.getSpideyApp(appId);
      if (app?.isLegacy) {
        const panel = document.getElementById(app.legacyPanelId);
        if (panel) {
          panel.classList.remove('open');
          panel.setAttribute('aria-hidden', 'true');
        }
        this.windows.delete(appId);
        this.updateTaskbar();
        this.saveState();
      }
      return;
    }

    if (win.isLegacy) {
      const panel = document.getElementById(win.app.legacyPanelId);
      if (panel) {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
      }
      this.windows.delete(appId);
      this.updateTaskbar();
      this.saveState();
      return;
    }

    // animate out
    win.element.classList.remove('entering');
    win.element.classList.add('exiting');
    setTimeout(() => {
      win.element.remove();
      this.windows.delete(appId);
      this.updateTaskbar();
      this.saveState();
    }, 220);
  }

  minimizeWindow(appId) {
    const win = this.windows.get(appId);
    if (!win) return;
    if (win.isLegacy) {
      const panel = document.getElementById(win.app.legacyPanelId);
      if (panel) {
        panel.classList.add('minimized');
        setTimeout(() => {
          panel.classList.remove('open');
          panel.classList.remove('minimized');
          panel.setAttribute('aria-hidden', 'true');
        }, 200);
      }
      win.minimized = true;
      this.windows.set(appId, { ...win, minimized: true });
    } else {
      win.element.classList.add('minimized');
      win.minimized = true;
      setTimeout(() => {
        win.element.style.display = 'none';
      }, 250);
    }
    this.updateTaskbar();
    this.saveState();
  }

  restoreWindow(appId) {
    const win = this.windows.get(appId);
    if (!win) return;
    win.minimized = false;
    if (win.isLegacy) {
      const panel = document.getElementById(win.app.legacyPanelId);
      if (panel) {
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        panel.style.zIndex = this.getNextZ();
      }
    } else {
      win.element.style.display = 'flex';
      // force reflow then remove minimized
      void win.element.offsetWidth;
      win.element.classList.remove('minimized');
      win.element.classList.add('entering');
      win.z = this.getNextZ();
      win.element.style.zIndex = win.z;
    }
    this.focusWindow(appId);
    this.updateTaskbar();
    this.saveState();
  }

  makeDraggable(winEl, appId) {
    const header = winEl.querySelector('.spidey-window-header');
    if (!header) return;
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    const onMouseDown = (e) => {
      if (e.target.closest('button')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(winEl.style.left, 10) || 0;
      startTop = parseInt(winEl.style.top, 10) || 0;
      header.style.cursor = 'grabbing';
      winEl.style.transition = 'none';
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newLeft = startLeft + dx;
      let newTop = startTop + dy;
      // clamp to viewport
      const maxLeft = window.innerWidth - winEl.offsetWidth - 10;
      const maxTop = window.innerHeight - winEl.offsetHeight - 70; // account taskbar
      newLeft = Math.max(5, Math.min(maxLeft, newLeft));
      newTop = Math.max(5, Math.min(maxTop, newTop));
      winEl.style.left = newLeft + 'px';
      winEl.style.top = newTop + 'px';
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      header.style.cursor = 'grab';
      winEl.style.transition = '';
      this.saveState();
    };

    header.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // touch
    header.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      if (!t) return;
      isDragging = true;
      startX = t.clientX;
      startY = t.clientY;
      startLeft = parseInt(winEl.style.left, 10) || 0;
      startTop = parseInt(winEl.style.top, 10) || 0;
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      winEl.style.left = (startLeft + dx) + 'px';
      winEl.style.top = (startTop + dy) + 'px';
    }, { passive: false });

    window.addEventListener('touchend', () => { isDragging = false; this.saveState(); });
  }

  makeResizable(winEl) {
    const handle = winEl.querySelector('.spidey-resize-handle');
    if (!handle) return;
    let isResizing = false;
    let startX, startY, startW, startH;

    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = winEl.offsetWidth;
      startH = winEl.offsetHeight;
      winEl.style.transition = 'none';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const dw = e.clientX - startX;
      const dh = e.clientY - startY;
      const newW = Math.max(320, Math.min(window.innerWidth - 20, startW + dw));
      const newH = Math.max(240, Math.min(window.innerHeight - 80, startH + dh));
      winEl.style.width = newW + 'px';
      winEl.style.height = newH + 'px';
    });

    window.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        winEl.style.transition = '';
        this.saveState();
      }
    });
  }

  updateTaskbar() {
    if (window.SpidyTaskbar) window.SpidyTaskbar.render();
  }

  updateTaskbarFocus(focusedId) {
    if (window.SpidyTaskbar) window.SpidyTaskbar.setFocused(focusedId);
  }

  saveState() {
    try {
      const state = {};
      this.windows.forEach((win, id) => {
        state[id] = {
          minimized: win.minimized,
          z: win.z,
          left: win.element.style.left,
          top: win.element.style.top,
          width: win.element.style.width,
          height: win.element.style.height,
          open: true
        };
      });
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch {}
  }

  restoreState() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const state = JSON.parse(raw);
      // we won't auto-restore all windows on boot to avoid clutter, but restore positions if they get opened
      this._restoredPositions = state;
    } catch {}
  }

  getRestoredPosition(appId) {
    return this._restoredPositions?.[appId] || null;
  }
}

window.SpidyWindowManager = new SpideyWindowManager();
