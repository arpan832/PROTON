/* DAILY BUGLE NEWS SERVICE - Abstraction layer for swappable providers */

const NEWS_CACHE_KEY = 'spidey-bugle-cache-v1';
const NEWS_CACHE_TTL = 1000 * 60 * 15; // 15 min

class NewsService {
  constructor() {
    this.provider = 'fallback'; // can be 'fallback', 'newsapi', 'gnews', 'rss', 'hackernews', etc.
    this.apiKey = null;
    this.initConfig();
  }

  initConfig() {
    // Allow configuration via localStorage or window global
    try {
      const cfg = JSON.parse(localStorage.getItem('spidey-news-config') || '{}');
      if (cfg.provider) this.provider = cfg.provider;
      if (cfg.apiKey) this.apiKey = cfg.apiKey;
    } catch {}
    if (window.SPIDEY_NEWS_API_KEY) this.apiKey = window.SPIDEY_NEWS_API_KEY;
    if (window.SPIDEY_NEWS_PROVIDER) this.provider = window.SPIDEY_NEWS_PROVIDER;
  }

  setConfig({ provider, apiKey }) {
    if (provider) this.provider = provider;
    if (apiKey) this.apiKey = apiKey;
    try {
      localStorage.setItem('spidey-news-config', JSON.stringify({ provider: this.provider, apiKey: this.apiKey }));
    } catch {}
  }

  async fetchFromProvider({ category, search }) {
    // Attempt real API if configured
    if (this.provider === 'newsapi' && this.apiKey) {
      return await this.fetchNewsAPI({ category, search });
    }
    if (this.provider === 'gnews' && this.apiKey) {
      return await this.fetchGNews({ category, search });
    }
    if (this.provider === 'hackernews') {
      return await this.fetchHackerNews({ search });
    }
    // Default: try public no-key APIs, then fallback
    if (this.provider !== 'fallback') {
      try {
        if (this.provider === 'hackernews') return await this.fetchHackerNews({ search });
      } catch (e) {
        console.warn('Provider fetch failed, falling back', e);
      }
    }
    // If no provider or failed, return fallback
    return this.getFallback({ category, search });
  }

  async fetchNewsAPI({ category, search }) {
    // NewsAPI.org - requires key, category mapping
    let url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=30`;
    if (search) url += `&q=${encodeURIComponent(search)}`;
    else if (category && category !== 'Breaking' && category !== 'All') {
      const catMap = { India: 'general', World: 'general', Technology: 'technology', Science: 'science', Entertainment: 'entertainment', Sports: 'sports' };
      url += `&category=${catMap[category] || 'general'}`;
    }
    const res = await fetch(url, { headers: { 'X-Api-Key': this.apiKey } });
    if (!res.ok) throw new Error(`NewsAPI error ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(data.message || 'NewsAPI failed');
    return data.articles.map((a, i) => ({
      id: `newsapi-${i}-${Date.now()}`,
      title: a.title,
      excerpt: a.description || a.title,
      content: a.content || a.description || '',
      category: this.inferCategory(a.title + ' ' + (a.description||''), category),
      timestamp: a.publishedAt,
      source: a.source?.name || 'NewsAPI',
      image: a.urlToImage,
      url: a.url,
      isFallback: false,
      breaking: false
    }));
  }

  async fetchGNews({ category, search }) {
    let url = `https://gnews.io/api/v4/top-headlines?lang=en&max=30&apikey=${this.apiKey}`;
    if (search) url += `&q=${encodeURIComponent(search)}`;
    if (category && category !== 'All' && category !== 'Breaking') url += `&topic=${category.toLowerCase()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GNews error ${res.status}`);
    const data = await res.json();
    return (data.articles || []).map((a, i) => ({
      id: `gnews-${i}-${Date.now()}`,
      title: a.title,
      excerpt: a.description || a.title,
      content: a.content || a.description || '',
      category: this.inferCategory(a.title + ' ' + (a.description||''), category),
      timestamp: a.publishedAt,
      source: a.source?.name || 'GNews',
      image: a.image,
      url: a.url,
      isFallback: false,
      breaking: false
    }));
  }

  async fetchHackerNews({ search }) {
    // Public, no key - good for tech
    const q = search || 'technology';
    const res = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=20`);
    if (!res.ok) throw new Error('HN fetch failed');
    const data = await res.json();
    return data.hits.map(h => ({
      id: `hn-${h.objectID}`,
      title: h.title,
      excerpt: `Points: ${h.points} • Author: ${h.author}`,
      content: h.story_text || h.title,
      category: 'Technology',
      timestamp: h.created_at,
      source: 'Hacker News',
      image: null,
      url: h.url,
      isFallback: false,
      breaking: false
    }));
  }

  inferCategory(text, fallbackCategory) {
    const t = text.toLowerCase();
    if (t.includes('india') || t.includes('mumbai') || t.includes('delhi') || t.includes('ipl') || t.includes('isro')) return 'India';
    if (t.includes('tech') || t.includes('ai') || t.includes('software') || t.includes('quantum') || t.includes('stark')) return 'Technology';
    if (t.includes('space') || t.includes('science') || t.includes('telescope') || t.includes('galaxy')) return 'Science';
    if (t.includes('movie') || t.includes('actor') || t.includes('music') || t.includes('broadway') || t.includes('entertainment')) return 'Entertainment';
    if (t.includes('sport') || t.includes('cricket') || t.includes('football') || t.includes('match') || t.includes('world cup')) return 'Sports';
    if (t.includes('world') || t.includes('global') || t.includes('climate') || t.includes('un ')) return 'World';
    return fallbackCategory && fallbackCategory !== 'All' ? fallbackCategory : 'Breaking';
  }

  getFallback({ category, search }) {
    let articles = window.BUGLE_FALLBACK_ARTICLES || [];
    if (category && category !== 'All') {
      articles = articles.filter(a => a.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.excerpt.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q)
      );
    }
    // sort by timestamp desc, breaking first
    articles = [...articles].sort((a,b) => {
      if (a.breaking && !b.breaking) return -1;
      if (!a.breaking && b.breaking) return 1;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    return articles;
  }

  saveCache(articles) {
    try {
      localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ articles, fetchedAt: Date.now() }));
    } catch {}
  }

  loadCache() {
    try {
      const raw = localStorage.getItem(NEWS_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.fetchedAt > NEWS_CACHE_TTL * 4) return null; // stale after 1h
      return parsed;
    } catch { return null; }
  }

  async getNews({ category = 'All', search = '' } = {}) {
    // offline handling
    if (!navigator.onLine) {
      const cached = this.loadCache();
      if (cached) return { articles: this.filterCached(cached.articles, category, search), isOffline: true, isFallback: cached.articles[0]?.isFallback, fromCache: true };
      const fallback = this.getFallback({ category, search });
      return { articles: fallback, isOffline: true, isFallback: true, fromCache: false };
    }

    try {
      const articles = await this.fetchFromProvider({ category, search });
      if (articles && articles.length) {
        this.saveCache(articles);
        return { articles, isOffline: false, isFallback: articles[0]?.isFallback || false, fromCache: false };
      }
      throw new Error('Empty response');
    } catch (e) {
      console.warn('News fetch failed, using fallback', e);
      const cached = this.loadCache();
      if (cached) {
        return { articles: this.filterCached(cached.articles, category, search), isOffline: false, isFallback: cached.articles[0]?.isFallback, fromCache: true, error: e.message };
      }
      const fallback = this.getFallback({ category, search });
      return { articles: fallback, isOffline: false, isFallback: true, fromCache: false, error: e.message };
    }
  }

  filterCached(articles, category, search) {
    let res = articles;
    if (category && category !== 'All') res = res.filter(a => a.category === category || category === 'Breaking' && a.breaking);
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
    }
    return res;
  }
}

window.SpidyNewsService = new NewsService();
