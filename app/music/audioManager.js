/* SPIDEY OS - Shared audio controller */
(function createSpidyAudio() {
  const VOLUME_KEY = 'spidey-audio-volume';
  const MUTED_KEY = 'spidey-audio-muted';
  const INTRO_TRACK = {
    id: 'intro-theme',
    title: 'Spider-Man Intro',
    artist: 'Spidey OS',
    src: 'spider-man-intro.mp3'
  };

  class SpidyAudioController {
    constructor() {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.loop = false;
      this.track = null;
      this.listeners = new Set();
      this.error = null;
      this.volume = this.readVolume();
      this.muted = this.readMuted();
      this.audio.volume = this.volume;
      this.audio.muted = this.muted;

      ['loadedmetadata', 'timeupdate', 'play', 'pause', 'ended', 'volumechange', 'error'].forEach((eventName) => {
        this.audio.addEventListener(eventName, () => {
          if (eventName === 'error') this.error = 'Audio could not be loaded';
          if (eventName !== 'error') this.error = null;
          this.notify();
        });
      });
    }

    readVolume() {
      try {
        const saved = Number(localStorage.getItem(VOLUME_KEY));
        return Number.isFinite(saved) ? Math.max(0, Math.min(1, saved)) : 0.8;
      } catch {
        return 0.8;
      }
    }

    readMuted() {
      try {
        return localStorage.getItem(MUTED_KEY) === 'true';
      } catch {
        return false;
      }
    }

    savePreferences() {
      try {
        localStorage.setItem(VOLUME_KEY, String(this.volume));
        localStorage.setItem(MUTED_KEY, String(this.muted));
      } catch {}
    }

    loadTrack(track = INTRO_TRACK) {
      if (!track?.src) return;
      if (this.track?.src === track.src) return;
      this.track = { ...track };
      this.error = null;
      this.audio.src = track.src;
      this.audio.load();
      this.notify();
    }

    play() {
      if (!this.track) this.loadTrack(INTRO_TRACK);
      const start = () => this.audio.play();
      return start().catch((error) => {
        // A freshly assigned source can briefly reject while the browser swaps
        // media. Retry once after it becomes playable; genuine autoplay errors
        // still reach the caller and are shown by the player UI.
        if (error?.name !== 'NotAllowedError' && this.audio.readyState < 2) {
          return new Promise((resolve, reject) => {
            const retry = () => {
              this.audio.removeEventListener('canplay', retry);
              start().then(resolve).catch(reject);
            };
            this.audio.addEventListener('canplay', retry, { once: true });
            this.audio.load();
          });
        }
        throw error;
      }).then(() => {
        this.notify();
        return true;
      }).catch((error) => {
        this.error = error?.message || 'Audio playback was blocked';
        this.notify();
        throw error;
      });
    }

    pause() {
      this.audio.pause();
      this.notify();
    }

    toggle() {
      return this.audio.paused ? this.play() : this.pause();
    }

    stop() {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.notify();
    }

    seek(seconds) {
      if (!Number.isFinite(seconds)) return;
      const duration = this.audio.duration || 0;
      this.audio.currentTime = Math.max(0, Math.min(duration || seconds, seconds));
      this.notify();
    }

    setVolume(value) {
      this.volume = Math.max(0, Math.min(1, Number(value) || 0));
      this.audio.volume = this.volume;
      if (this.volume > 0 && this.muted) this.muted = false;
      this.audio.muted = this.muted;
      this.savePreferences();
      this.notify();
    }

    toggleMute() {
      this.muted = !this.muted;
      this.audio.muted = this.muted;
      this.savePreferences();
      this.notify();
    }

    enableSoundForUserGesture() {
      this.muted = false;
      this.audio.muted = false;
      this.savePreferences();
      this.notify();
    }

    getState() {
      return {
        track: this.track,
        isPlaying: !this.audio.paused && !this.audio.ended,
        currentTime: this.audio.currentTime || 0,
        duration: Number.isFinite(this.audio.duration) ? this.audio.duration : 0,
        volume: this.volume,
        muted: this.muted,
        error: this.error
      };
    }

    subscribe(listener) {
      if (typeof listener !== 'function') return () => {};
      this.listeners.add(listener);
      listener(this.getState());
      return () => this.listeners.delete(listener);
    }

    notify() {
      const state = this.getState();
      this.listeners.forEach((listener) => listener(state));
    }
  }

  window.SPIDY_AUDIO_TRACKS = { intro: INTRO_TRACK };
  window.SpidyAudio = new SpidyAudioController();
})();
