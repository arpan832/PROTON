/* SPIDEY OS STUB APPS - Browser, Gallery, Music, Files, Settings, Terminal */

function createStubApp(id, name, emoji, description) {
  return class {
    constructor(container) {
      this.container = container;
      this.id = id;
      this.render();
    }
    render() {
      this.container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100%;padding:32px 20px;text-align:center;background:radial-gradient(600px circle at 50% 0%, rgba(225,6,0,0.08), transparent 60%), linear-gradient(180deg, rgba(18,18,20,0.6), rgba(10,10,12,0.9));color:#f0f0f0;font-family:'Segoe UI',system-ui;">
          <div style="width:72px;height:72px;border-radius:18px;background:rgba(225,6,0,0.12);border:1px solid rgba(225,6,0,0.22);display:grid;place-items:center;font-size:34px;margin-bottom:16px;box-shadow:0 0 24px rgba(225,6,0,0.15);">${emoji}</div>
          <div style="font-size:20px;font-weight:800;letter-spacing:-0.02em;margin-bottom:8px;">${name}</div>
          <div style="font-size:13px;color:#999;max-width:320px;line-height:1.5;margin-bottom:18px;">${description}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
            <span style="font-size:10px;letter-spacing:0.08em;text-transform:uppercase;padding:6px 10px;border-radius:20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);color:#aaa;">Coming Soon</span>
            <span style="font-size:10px;letter-spacing:0.08em;text-transform:uppercase;padding:6px 10px;border-radius:20px;background:rgba(225,6,0,0.12);border:1px solid rgba(225,6,0,0.18);color:#ff9999;">Under Construction</span>
          </div>
          <div style="margin-top:20px;font-size:11px;color:#555;letter-spacing:0.06em;text-transform:uppercase;">Spidey OS Module • ${id}.spidey</div>
          <div style="margin-top:12px;display:flex;gap:8px;">
            <button class="weather-btn" onclick="this.closest('.spidey-window-body').dispatchEvent(new CustomEvent('spidey-close-window'))">Close</button>
          </div>
        </div>
      `;
      // allow close event bubbling
      this.container.querySelector('.weather-btn')?.addEventListener('click', () => {
        const ev = new CustomEvent('spidey-request-close', { bubbles: true, detail: { appId: this.id } });
        this.container.dispatchEvent(ev);
      });
    }
  };
}

window.BrowserApp = createStubApp('browser', 'Web Crawler', '🕸️', 'Quantum-encrypted browser with spider-silk security protocol. Browse the web like Peter Parker swings through Manhattan.');
window.GalleryApp = createStubApp('gallery', 'Photo Lab', '📸', 'Peter Parker\'s photo lab. Auto-enhances, tags, and organizes your shots. Stark-enhanced image processing.');
window.FilesApp = createStubApp('files', 'Web Files', '📁', 'File system with organic web-structure. Files are stored in a bio-neural network inspired by spider silk.');
window.SettingsApp = createStubApp('settings', 'Suit Lab', '⚙️', 'Customize your suit OS, web-shooters, and HUD. Red tint intensity, blur level, and spider-sense sensitivity.');
window.TerminalApp = createStubApp('terminal', 'Spider-Term', '>_', 'Root access to Spidey OS. Type "help" for commands. Warning: With great power comes great responsibility.\n\n$ whoami\n> friendly-neighborhood-spider-man');
