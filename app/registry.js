/* SPIDEY OS APP REGISTRY - Add new app with minimal code */

window.SPIDEY_APPS = [
  {
    id: 'notepad',
    name: 'Notepad',
    icon: 'assets/apps/notepad.png', // user can replace - fallback to emoji
    fallbackIcon: '📝',
    component: null, // special handling - uses legacy panel but wrapped
    isLegacy: true,
    legacyIconId: 'note-box',
    legacyPanelId: 'note-bigbox',
    width: 420,
    height: 500,
    description: 'Quick notes'
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: 'assets/apps/calculator.png',
    fallbackIcon: '🧮',
    component: null,
    isLegacy: true,
    legacyIconId: 'cal-box',
    legacyPanelId: 'cal-bigbox',
    width: 340,
    height: 480,
    description: 'Math'
  },
  {
    id: 'weather',
    name: 'Spidey Weather',
    icon: 'assets/apps/weather.png',
    fallbackIcon: '🌦️',
    component: 'SpideyWeatherApp',
    width: 720,
    height: 560,
    description: 'Weather dashboard'
  },
  {
    id: 'bugle',
    name: 'Daily Bugle',
    icon: 'assets/apps/bugle.png',
    fallbackIcon: '📰',
    component: 'BugleApp',
    width: 880,
    height: 640,
    description: 'News'
  },
  {
    id: 'browser',
    name: 'Web Crawler',
    icon: 'assets/apps/browser.png',
    fallbackIcon: '🕸️',
    component: 'BrowserApp',
    width: 800,
    height: 600,
    description: 'Browser'
  },
  {
    id: 'gallery',
    name: 'Photo Lab',
    icon: 'assets/apps/gallery.png',
    fallbackIcon: '📸',
    component: 'GalleryApp',
    width: 700,
    height: 500,
    description: 'Gallery'
  },
  {
    id: 'music',
    name: 'Spidey Mix',
    icon: 'assets/apps/music.png',
    fallbackIcon: '🎧',
    component: 'MusicApp',
    width: 480,
    height: 520,
    description: 'Music'
  },
  {
    id: 'files',
    name: 'Web Files',
    icon: 'assets/apps/files.png',
    fallbackIcon: '📁',
    component: 'FilesApp',
    width: 640,
    height: 480,
    description: 'Files'
  },
  {
    id: 'settings',
    name: 'Suit Lab',
    icon: 'assets/apps/settings.png',
    fallbackIcon: '⚙️',
    component: 'SettingsApp',
    width: 560,
    height: 500,
    description: 'Settings'
  },
  {
    id: 'terminal',
    name: 'Spider-Term',
    icon: 'assets/apps/terminal.png',
    fallbackIcon: '>_',
    component: 'TerminalApp',
    width: 600,
    height: 400,
    description: 'Terminal'
  }
];

// Helper to get app by id
window.getSpideyApp = (id) => window.SPIDEY_APPS.find(a => a.id === id);
