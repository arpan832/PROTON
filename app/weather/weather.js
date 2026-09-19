/* SPIDEY WEATHER APP COMPONENT */

function formatHour(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return isoString.slice(11,16); }
}

function formatDay(isoDate) {
  try {
    const d = new Date(isoDate);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const tomorrow = new Date(); tomorrow.setDate(today.getDate()+1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    if (isToday) return { main: 'Today', sub: d.toLocaleDateString([], { month: 'short', day: 'numeric' }) };
    if (isTomorrow) return { main: 'Tomorrow', sub: d.toLocaleDateString([], { month: 'short', day: 'numeric' }) };
    return { main: d.toLocaleDateString([], { weekday: 'short' }), sub: d.toLocaleDateString([], { month: 'short', day: 'numeric' }) };
  } catch {
    return { main: isoDate, sub: '' };
  }
}

class SpideyWeatherApp {
  constructor(container) {
    this.container = container;
    this.service = window.SpidyWeatherService;
    this.data = null;
    this.searchDebounce = null;
    this.renderLoading();
    this.init();
  }

  async init() {
    try {
      const cached = this.service.loadCache();
      if (cached) {
        this.data = cached;
        this.render();
      }
      const live = await this.service.initWeather();
      if (live.needsLocation && !live.current) {
        this.data = live;
        this.renderNeedsLocation(live);
        return;
      }
      this.data = live;
      this.render();
    } catch (e) {
      console.error('Weather init failed', e);
      const cached = this.service.loadCache();
      if (cached) {
        this.data = { ...cached, isOffline: true, error: e.message };
        this.render();
      } else {
        this.renderError(e.message || 'Failed to load weather');
      }
    }
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="spidey-weather-app">
        <div class="weather-loading">
          <div class="weather-loading-spinner"></div>
          <div class="weather-state-title">Scanning Atmosphere</div>
          <div class="weather-state-sub">Spider-Sense is calibrating weather patterns...</div>
        </div>
      </div>
    `;
  }

  renderError(msg) {
    this.container.innerHTML = `
      <div class="spidey-weather-app">
        <div class="weather-error">
          <div class="weather-error-icon">🕸️</div>
          <div class="weather-state-title">Weather Signal Lost</div>
          <div class="weather-state-sub">${this.escape(msg)}<br>Check your connection and try again.</div>
          <button class="weather-btn primary" data-action="retry">Retry Scan</button>
          <div class="weather-search-wrap" style="margin-top:12px; position:relative;">
            <input class="weather-search-input" placeholder="Search city..." data-role="search-input" />
            <button class="weather-btn" data-action="search">Search</button>
            <div class="weather-search-results" data-role="search-results"></div>
          </div>
        </div>
      </div>
    `;
    this.bindSearch();
    this.container.querySelector('[data-action="retry"]')?.addEventListener('click', () => {
      this.renderLoading(); this.init();
    });
  }

  renderNeedsLocation(info) {
    const geoMsg = info.geoError ? this.escape(info.geoError) : 'Location permission denied';
    this.container.innerHTML = `
      <div class="spidey-weather-app">
        <div class="weather-needs-location">
          <div class="weather-error-icon">📍</div>
          <div class="weather-state-title">Location Required</div>
          <div class="weather-state-sub">${geoMsg}<br>Enter a city manually or enable location access.</div>
          <div class="weather-search-wrap" style="position:relative; margin-top:8px;">
            <input class="weather-search-input" placeholder="e.g. New York, Mumbai..." data-role="search-input" autofocus />
            <button class="weather-btn primary" data-action="search">Search</button>
            <div class="weather-search-results" data-role="search-results"></div>
          </div>
          ${info && info.location ? `<div class="weather-offline-badge">Last: ${this.escape(info.location)}</div>` : ''}
        </div>
      </div>
    `;
    this.bindSearch();
  }

  bindSearch() {
    const input = this.container.querySelector('[data-role="search-input"]');
    const resultsEl = this.container.querySelector('[data-role="search-results"]');
    const searchBtn = this.container.querySelector('[data-action="search"]');
    if (!input || !resultsEl) return;

    const doSearch = async () => {
      const q = input.value.trim();
      if (q.length < 2) { resultsEl.classList.remove('open'); return; }
      resultsEl.innerHTML = `<div class="weather-search-item">Searching...</div>`;
      resultsEl.classList.add('open');
      const results = await this.service.searchCity(q);
      if (!results.length) {
        resultsEl.innerHTML = `<div class="weather-search-item">No cities found for "${this.escape(q)}"</div>`;
        return;
      }
      resultsEl.innerHTML = results.map(r => `<div class="weather-search-item" data-lat="${r.lat}" data-lon="${r.lon}" data-name="${this.escape(r.display)}">${this.escape(r.display)}</div>`).join('');
      resultsEl.querySelectorAll('.weather-search-item[data-lat]').forEach(el => {
        el.addEventListener('click', async () => {
          const lat = parseFloat(el.dataset.lat);
          const lon = parseFloat(el.dataset.lon);
          const name = el.dataset.name;
          resultsEl.classList.remove('open');
          this.renderLoading();
          try {
            const data = await this.service.getWeatherForCoords(lat, lon, name);
            this.data = data;
            this.render();
          } catch (e) {
            this.renderError(e.message);
          }
        });
      });
    };

    input.addEventListener('input', () => {
      clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(doSearch, 400);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });
    searchBtn?.addEventListener('click', doSearch);

    // close on outside click
    const closeHandler = (e) => {
      if (!this.container.contains(e.target)) {
        resultsEl.classList.remove('open');
        document.removeEventListener('click', closeHandler);
      } else if (!resultsEl.contains(e.target) && e.target !== input) {
        // if click inside container but not results, keep? close after delay
        setTimeout(() => {
          if (!resultsEl.contains(document.activeElement)) resultsEl.classList.remove('open');
        }, 200);
      }
    };
    document.addEventListener('click', closeHandler);
  }

  render() {
    if (!this.data || !this.data.current) {
      if (this.data?.needsLocation) { this.renderNeedsLocation(this.data); return; }
      this.renderError('No weather data'); return;
    }
    const d = this.data;
    const cur = d.current;
    const hourlySlice = d.hourly.slice(0, 12);
    const dailySlice = d.daily.slice(0, 7);

    const offlineBadge = d.isOffline ? `<div class="weather-offline-badge">● Offline • Last updated ${new Date(d.fetchedAt).toLocaleTimeString()}</div>` : `<div style="font-size:10px;color:#666;letter-spacing:0.06em;text-transform:uppercase;">Updated ${new Date(d.fetchedAt).toLocaleTimeString()}</div>`;

    this.container.innerHTML = `
      <div class="spidey-weather-app">
        <div class="weather-topbar">
          <div class="weather-location">
            <div class="weather-location-icon">🕷️</div>
            <div class="weather-location-text">
              <div class="weather-location-name">${this.escape(d.location)}</div>
              <div class="weather-location-sub">${this.escape(cur.meta.label)} • ${cur.isDay ? 'Day' : 'Night'} • ${d.lat.toFixed(2)}, ${d.lon.toFixed(2)}</div>
            </div>
          </div>
          <div class="weather-search-wrap">
            <input class="weather-search-input" placeholder="Change city..." data-role="search-input" />
            <button class="weather-btn" data-action="locate" title="Use my location">📍</button>
            <button class="weather-btn primary" data-action="refresh">↻ Refresh</button>
            <div class="weather-search-results" data-role="search-results"></div>
          </div>
        </div>

        <div class="weather-hero">
          <div class="weather-main-card">
            <div class="spidey-sense-indicator"><span class="sense-dot"></span> Spider-Sense • ${cur.isDay ? 'Daylight' : 'Nocturnal'} Mode</div>
            <div class="weather-temp-row">
              <div class="weather-icon-large">${cur.meta.icon}</div>
              <div>
                <div class="weather-temp">${Math.round(cur.temp)}<sup>°C</sup></div>
                <div class="weather-condition">${this.escape(cur.meta.label)}</div>
                <div class="weather-feels">Feels like ${Math.round(cur.feelsLike)}° • ${cur.humidity}% humidity</div>
                ${offlineBadge}
                ${d.error ? `<div class="weather-offline-badge" style="background:rgba(225,6,0,0.12);border-color:rgba(225,6,0,0.22);color:#ff9999;">⚠ ${this.escape(d.error)}</div>` : ''}
              </div>
            </div>
            <div class="weather-stats-grid">
              <div class="weather-stat"><div class="weather-stat-label">Humidity</div><div class="weather-stat-value">${cur.humidity}%</div></div>
              <div class="weather-stat"><div class="weather-stat-label">Wind</div><div class="weather-stat-value">${cur.windSpeed} km/h</div></div>
              <div class="weather-stat"><div class="weather-stat-label">Feels Like</div><div class="weather-stat-value">${Math.round(cur.feelsLike)}°C</div></div>
              <div class="weather-stat"><div class="weather-stat-label">Precip</div><div class="weather-stat-value">${cur.precip} mm</div></div>
            </div>
          </div>
          <div class="weather-side">
            <div class="weather-hilo-card">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#888;margin-bottom:8px;">Today's Range</div>
              <div class="weather-hilo-row"><span>High</span><span>${Math.round(d.daily[0]?.max ?? cur.temp)}°C</span></div>
              <div class="weather-hilo-row"><span>Low</span><span>${Math.round(d.daily[0]?.min ?? cur.temp-5)}°C</span></div>
              <div class="weather-hilo-row"><span>Wind Dir</span><span>${Math.round(cur.windDir)}°</span></div>
              <div class="weather-hilo-row"><span>Sunrise</span><span>${d.daily[0]?.sunrise ? formatHour(d.daily[0].sunrise) : '--'}</span></div>
              <div class="weather-hilo-row"><span>Sunset</span><span>${d.daily[0]?.sunset ? formatHour(d.daily[0].sunset) : '--'}</span></div>
            </div>
            <div class="weather-hilo-card" style="background: linear-gradient(135deg, rgba(225,6,0,0.12), rgba(0,0,0,0.3)); border-color: rgba(225,6,0,0.18);">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ff9999;margin-bottom:8px;">🕸️ Suit Advisory</div>
              <div style="font-size:12px; line-height:1.5; color:#ccc;">
                ${this.getSuitAdvisory(cur)}
              </div>
            </div>
          </div>
        </div>

        <div class="weather-section-title">Hourly Forecast • Next 12 Hours</div>
        <div class="weather-hourly">
          ${hourlySlice.map(h => `
            <div class="weather-hour">
              <div class="weather-hour-time">${formatHour(h.time)}</div>
              <div class="weather-hour-icon">${h.meta.icon}</div>
              <div class="weather-hour-temp">${Math.round(h.temp)}°</div>
            </div>
          `).join('')}
        </div>

        <div class="weather-section-title">7-Day Forecast</div>
        <div class="weather-daily">
          ${dailySlice.map(day => {
            const f = formatDay(day.date);
            return `
              <div class="weather-day">
                <div class="weather-day-date">${f.main}<small>${f.sub}</small></div>
                <div class="weather-day-icon">${day.meta.icon}</div>
                <div class="weather-day-temps"><span class="max">${Math.round(day.max)}°</span><span class="min">${Math.round(day.min)}°</span></div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="padding:0 18px 18px; font-size:10px; color:#555; letter-spacing:0.05em; text-transform:uppercase; text-align:center;">
          Powered by Open-Meteo • No API key required • Data cached for offline use
        </div>
      </div>
    `;

    this.bindSearch();
    this.container.querySelector('[data-action="refresh"]')?.addEventListener('click', async () => {
      this.renderLoading();
      try {
        const fresh = await this.service.getWeatherForCoords(d.lat, d.lon, d.location);
        this.data = fresh;
        this.render();
      } catch (e) {
        this.render();
        // show toast? just keep old data
      }
    });
    this.container.querySelector('[data-action="locate"]')?.addEventListener('click', async () => {
      this.renderLoading();
      try {
        const pos = await this.service.getCurrentPosition();
        const fresh = await this.service.getWeatherForCoords(pos.lat, pos.lon);
        this.data = fresh;
        this.render();
      } catch (e) {
        this.renderNeedsLocation({ geoError: e.message, location: d.location });
      }
    });
  }

  getSuitAdvisory(cur) {
    if (cur.temp > 30) return "High temps detected. Switch to breathable suit lining. Hydration protocol active.";
    if (cur.temp < 5) return "Freezing conditions. Thermal web-fluid may thicken. Insulated suit recommended.";
    if (cur.code >= 95) return "Thunderstorm alert! Electrical interference risk. Avoid high-altitude swinging.";
    if (cur.code >= 61) return "Wet surfaces - web adhesion reduced by 12%. Use enhanced grip mode.";
    if (cur.windSpeed > 30) return "High winds - aerial maneuvering compromised. Low-altitude patrol advised.";
    if (cur.humidity > 80) return "High humidity - lenses may fog. Anti-fog coating engaged.";
    return "Optimal patrol conditions. All systems nominal. Friendly neighborhood watch: ACTIVE.";
  }

  escape(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
}

window.SpideyWeatherApp = SpideyWeatherApp;
