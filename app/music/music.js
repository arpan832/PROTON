/* SPIDEY OS - Music app and global mini-player */
(function initMusicSystem() {
  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remaining}`;
  };

  class MusicApp {
    constructor(container) {
      this.container = container;
      this.audio = window.SpidyAudio;
      this.unsubscribe = null;
      this.render();
      this.bind();
      this.unsubscribe = this.audio?.subscribe((state) => this.update(state));
    }

    render() {
      this.container.innerHTML = `
        <section class="music-app">
          <div class="music-hero">
            <div class="music-disc" aria-hidden="true">🕷️</div>
            <div>
              <span class="music-eyebrow">Spidey OS audio link</span>
              <h2>Spidey Mix</h2>
              <p>One shared sound system for the whole neighborhood.</p>
            </div>
          </div>
          <div class="music-track-card">
            <div class="music-track-art">♪</div>
            <div class="music-track-info">
              <strong data-music-title>Spider-Man Intro</strong>
              <span data-music-artist>Spidey OS</span>
            </div>
            <span class="music-status" data-music-status>Ready</span>
          </div>
          <div class="music-progress-row">
            <span data-music-current>0:00</span>
            <input data-music-seek type="range" min="0" max="0" value="0" step="0.1" aria-label="Seek through track">
            <span data-music-duration>0:00</span>
          </div>
          <div class="music-controls">
            <button class="music-button secondary" data-music-restart type="button">↺ Restart</button>
            <button class="music-button primary" data-music-toggle type="button">▶ Play</button>
            <button class="music-button secondary" data-music-mute type="button">🔊 Sound</button>
          </div>
          <label class="music-volume">
            <span>Volume</span>
            <input data-music-volume type="range" min="0" max="1" value="0.8" step="0.01" aria-label="Volume">
          </label>
          <div class="music-note">The intro theme is shared with the boot sequence. Future tracks can be added to the shared playlist.</div>
        </section>
      `;
    }

    bind() {
      this.container.querySelector('[data-music-toggle]')?.addEventListener('click', () => this.audio?.toggle().catch(() => {}));
      this.container.querySelector('[data-music-restart]')?.addEventListener('click', () => {
        this.audio?.stop();
        this.audio?.play().catch(() => {});
      });
      this.container.querySelector('[data-music-mute]')?.addEventListener('click', () => this.audio?.toggleMute());
      this.container.querySelector('[data-music-seek]')?.addEventListener('input', (event) => this.audio?.seek(Number(event.target.value)));
      this.container.querySelector('[data-music-volume]')?.addEventListener('input', (event) => this.audio?.setVolume(Number(event.target.value)));
    }

    update(state) {
      if (!state) return;
      const title = state.track?.title || 'No track loaded';
      const artist = state.track?.artist || 'Spidey OS';
      const seek = this.container.querySelector('[data-music-seek]');
      this.container.querySelector('[data-music-title]').textContent = title;
      this.container.querySelector('[data-music-artist]').textContent = artist;
      this.container.querySelector('[data-music-current]').textContent = formatTime(state.currentTime);
      this.container.querySelector('[data-music-duration]').textContent = formatTime(state.duration);
      this.container.querySelector('[data-music-status]').textContent = state.error ? 'Audio unavailable' : state.isPlaying ? 'Playing' : 'Paused';
      this.container.querySelector('[data-music-toggle]').textContent = state.isPlaying ? 'Ⅱ Pause' : '▶ Play';
      this.container.querySelector('[data-music-mute]').textContent = state.muted ? '🔇 Muted' : '🔊 Sound';
      if (seek) {
        seek.max = String(state.duration || 0);
        seek.value = String(Math.min(state.currentTime, state.duration || 0));
      }
      const volume = this.container.querySelector('[data-music-volume]');
      if (volume) volume.value = String(state.volume);
    }
  }

  function initGlobalPlayer() {
    const player = document.getElementById('global-audio-player');
    const audio = window.SpidyAudio;
    if (!player || !audio) return;

    const toggle = player.querySelector('[data-global-audio-toggle]');
    const mute = player.querySelector('[data-global-audio-mute]');
    const open = player.querySelector('[data-global-audio-open]');
    const seek = player.querySelector('[data-global-audio-seek]');
    const title = player.querySelector('[data-global-audio-title]');
    const progress = player.querySelector('[data-global-audio-progress]');

    toggle.addEventListener('click', () => audio.toggle().catch(() => {}));
    mute.addEventListener('click', () => audio.toggleMute());
    seek.addEventListener('input', (event) => audio.seek(Number(event.target.value)));
    open.addEventListener('click', () => window.SpidyWindowManager?.openWindow('music'));
    open.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.SpidyWindowManager?.openWindow('music');
      }
    });

    audio.subscribe((state) => {
      player.classList.toggle('is-active', Boolean(state.track));
      toggle.textContent = state.isPlaying ? 'Ⅱ' : '▶';
      toggle.setAttribute('aria-label', state.isPlaying ? 'Pause music' : 'Play music');
      mute.textContent = state.muted ? '🔇' : '🔊';
      title.textContent = state.error ? 'Audio unavailable — click play to retry' : (state.track?.title || 'No track loaded');
      seek.max = String(state.duration || 0);
      seek.value = String(Math.min(state.currentTime, state.duration || 0));
      progress.style.width = state.duration ? `${(state.currentTime / state.duration) * 100}%` : '0%';
    });
  }

  window.MusicApp = MusicApp;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGlobalPlayer);
  else initGlobalPlayer();
})();
