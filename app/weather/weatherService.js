/* SPIDEY WEATHER SERVICE
   Configurable provider layer - defaults to Open-Meteo (no API key required)
   Handles geolocation, city search, caching, offline fallback
*/

const WEATHER_CACHE_KEY = 'spidey-weather-cache-v1';
const WEATHER_LAST_CITY_KEY = 'spidey-weather-last-city';
const WEATHER_CACHE_TTL = 1000 * 60 * 20; // 20 minutes

// WMO Weather codes mapping
const WMO_CODES = {
  0: { label: 'Clear Sky', icon: '☀️', nightIcon: '🌙' },
  1: { label: 'Mainly Clear', icon: '🌤️', nightIcon: '🌙' },
  2: { label: 'Partly Cloudy', icon: '⛅', nightIcon: '☁️' },
  3: { label: 'Overcast', icon: '☁️', nightIcon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️', nightIcon: '🌫️' },
  48: { label: 'Depositing Fog', icon: '🌫️', nightIcon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️', nightIcon: '🌧️' },
  53: { label: 'Drizzle', icon: '🌦️', nightIcon: '🌧️' },
  55: { label: 'Dense Drizzle', icon: '🌧️', nightIcon: '🌧️' },
  61: { label: 'Slight Rain', icon: '🌧️', nightIcon: '🌧️' },
  63: { label: 'Moderate Rain', icon: '🌧️', nightIcon: '🌧️' },
  65: { label: 'Heavy Rain', icon: '🌧️', nightIcon: '🌧️' },
  71: { label: 'Slight Snow', icon: '🌨️', nightIcon: '🌨️' },
  73: { label: 'Snow', icon: '❄️', nightIcon: '❄️' },
  75: { label: 'Heavy Snow', icon: '❄️', nightIcon: '❄️' },
  80: { label: 'Rain Showers', icon: '🌦️', nightIcon: '🌧️' },
  81: { label: 'Moderate Showers', icon: '🌦️', nightIcon: '🌧️' },
  82: { label: 'Violent Showers', icon: '⛈️', nightIcon: '⛈️' },
  95: { label: 'Thunderstorm', icon: '⛈️', nightIcon: '⛈️' },
  96: { label: 'Storm + Hail', icon: '⛈️', nightIcon: '⛈️' },
  99: { label: 'Severe Storm', icon: '⛈️', nightIcon: '⛈️' },
};

function getWeatherMeta(code, isDay = 1) {
  const meta = WMO_CODES[code] || { label: 'Unknown', icon: '🌡️', nightIcon: '🌡️' };
  return {
    label: meta.label,
    icon: isDay ? meta.icon : meta.nightIcon,
    code
  };
}

class WeatherService {
  constructor() {
    this.provider = 'open-meteo'; // configurable
  }

  // Attempt to get user location via browser geolocation
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: 'geolocation' }),
        err => reject(err),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    });
  }

  // Geocoding search for city
  async searchCity(query) {
    if (!query || query.trim().length < 2) return [];
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Geocoding failed');
      const data = await res.json();
      return (data.results || []).map(r => ({
        name: r.name,
        country: r.country,
        admin1: r.admin1,
        lat: r.latitude,
        lon: r.longitude,
        display: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`
      }));
    } catch (e) {
      console.warn('City search failed', e);
      return [];
    }
  }

  // Reverse geocode to get location name
  async reverseGeocode(lat, lon) {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Reverse geocode failed');
      const data = await res.json();
      if (data.results && data.results[0]) {
        const r = data.results[0];
        return `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}, ${r.country}`;
      }
    } catch (e) {
      console.warn('Reverse geocode failed', e);
    }
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  }

  async fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=7`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
    const data = await res.json();
    return data;
  }

  async getWeatherForCoords(lat, lon, locationName = null) {
    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    try {
      const data = await this.fetchWeather(lat, lon);
      const location = locationName || await this.reverseGeocode(lat, lon);
      
      const currentMeta = getWeatherMeta(data.current.weather_code, data.current.is_day);
      
      const hourly = (data.hourly.time || []).slice(0, 24).map((t, i) => ({
        time: t,
        temp: data.hourly.temperature_2m[i],
        code: data.hourly.weather_code[i],
        isDay: data.hourly.is_day[i],
        meta: getWeatherMeta(data.hourly.weather_code[i], data.hourly.is_day[i])
      }));

      const daily = (data.daily.time || []).map((t, i) => ({
        date: t,
        max: data.daily.temperature_2m_max[i],
        min: data.daily.temperature_2m_min[i],
        code: data.daily.weather_code[i],
        sunrise: data.daily.sunrise[i],
        sunset: data.daily.sunset[i],
        meta: getWeatherMeta(data.daily.weather_code[i], 1)
      }));

      const result = {
        location,
        lat,
        lon,
        current: {
          temp: data.current.temperature_2m,
          feelsLike: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          windDir: data.current.wind_direction_10m,
          precip: data.current.precipitation,
          code: data.current.weather_code,
          isDay: data.current.is_day,
          meta: currentMeta,
          time: data.current.time
        },
        hourly,
        daily,
        fetchedAt: Date.now(),
        cacheKey,
        isOffline: false
      };

      this.saveCache(result);
      if (location) localStorage.setItem(WEATHER_LAST_CITY_KEY, JSON.stringify({ lat, lon, location }));
      return result;
    } catch (e) {
      console.warn('Weather fetch failed, trying cache', e);
      const cached = this.loadCache();
      if (cached && cached.cacheKey === cacheKey && (Date.now() - cached.fetchedAt) < WEATHER_CACHE_TTL * 3) {
        return { ...cached, isOffline: true, error: e.message };
      }
      // try any cached data if same location not available
      if (cached) {
        return { ...cached, isOffline: true, error: e.message, location: cached.location + ' (cached)' };
      }
      throw e;
    }
  }

  async getWeatherForCity(cityObj) {
    return this.getWeatherForCoords(cityObj.lat, cityObj.lon, cityObj.display || cityObj.name);
  }

  saveCache(data) {
    try {
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
    } catch {}
  }

  loadCache() {
    try {
      const raw = localStorage.getItem(WEATHER_CACHE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // basic validation
      if (!data.current) return null;
      return data;
    } catch {
      return null;
    }
  }

  getLastCity() {
    try {
      const raw = localStorage.getItem(WEATHER_LAST_CITY_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  }

  // Main entry - tries geolocation, then last city, then cache
  async initWeather() {
    // if offline and cache exists, return cache immediately
    if (!navigator.onLine) {
      const cached = this.loadCache();
      if (cached) return { ...cached, isOffline: true };
    }

    try {
      const pos = await this.getCurrentPosition();
      return await this.getWeatherForCoords(pos.lat, pos.lon);
    } catch (geoErr) {
      console.log('Geolocation failed or denied:', geoErr.message);
      const lastCity = this.getLastCity();
      if (lastCity) {
        try {
          return await this.getWeatherForCoords(lastCity.lat, lastCity.lon, lastCity.location);
        } catch {}
      }
      const cached = this.loadCache();
      if (cached) {
        return { ...cached, isOffline: false, needsLocation: true, geoError: geoErr.message };
      }
      // No data at all - return needsLocation state
      return { needsLocation: true, geoError: geoErr.message, error: geoErr.message };
    }
  }
}

// Export singleton
window.SpidyWeatherService = new WeatherService();
