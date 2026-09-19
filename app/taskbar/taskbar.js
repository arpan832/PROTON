/* SPIDEY OS TASKBAR */

class SpideyTaskbar {
  constructor() {
    this.root = document.getElementById('taskbar-root');
    if (!this.root) {
      this.root = document.createElement('div');
      this.root.id = 'taskbar-root';
      document.body.appendChild(this.root);
    }
    this.focusedId = null;
    this.render();
    this.bindClock();
  }

  bindClock() {
    // if clock element exists in top bar, we already have clock logic
    // add taskbar clock? optional
  }

  render() {
    const apps = window.SPIDEY_APPS || [];
    // split into main and system?
    const mainApps = apps.slice(0, 6);
    const systemApps = apps.slice(6);

    this.root.innerHTML = `
      <div class="spidey-taskbar">
        ${mainApps.map(app => this.appButtonHTML(app)).join('')}
        <div class="spidey-taskbar-divider"></div>
        ${systemApps.map(app => this.appButtonHTML(app)).join('')}
      </div>
    `;

    this.root.querySelectorAll('.taskbar-app').forEach(btn => {
      btn.addEventListener('click', () => {
        const appId = btn.dataset.appId;
        this.handleAppClick(appId);
      });
    });

    this.setFocused(this.focusedId);
  }

  appButtonHTML(app) {
    const isOpen = window.SpidyWindowManager ? window.SpidyWindowManager.windows.has(app.id) : false;
    const isMinimized = window.SpidyWindowManager ? window.SpidyWindowManager.isMinimized(app.id) : false;
    const isActive = isOpen && !isMinimized;
    return `
      <div class="taskbar-app ${isActive ? 'active' : ''}" data-app-id="${app.id}" title="${app.name}">
        <img src="${app.icon}" alt="${app.name}" 
          onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
          style="${isOpen ? '' : ''}"
        >
        <span class="taskbar-icon-fallback" style="display:none;">${app.fallbackIcon}</span>
        <span class="taskbar-tooltip">${app.name}</span>
      </div>
    `;
  }

  handleAppClick(appId) {
    const wm = window.SpidyWindowManager;
    if (!wm) return;
    if (wm.windows.has(appId)) {
      const win = wm.windows.get(appId);
      if (win.minimized) {
        wm.restoreWindow(appId);
      } else if (this.focusedId === appId) {
        // if already focused, minimize (like OS behavior)
        wm.minimizeWindow(appId);
        this.focusedId = null;
        this.setFocused(null);
      } else {
        wm.focusWindow(appId);
      }
    } else {
      wm.openWindow(appId);
    }
    this.render();
    this.setFocused(appId);
  }

  setFocused(appId) {
    this.focusedId = appId;
    this.root.querySelectorAll('.taskbar-app').forEach(el => {
      el.classList.remove('focused');
      if (el.dataset.appId === appId) {
        el.classList.add('focused');
      }
    });
  }
}

// Initialize after DOM
function initTaskbar() {
  window.SpidyTaskbar = new SpideyTaskbar();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTaskbar);
} else {
  initTaskbar();
}
