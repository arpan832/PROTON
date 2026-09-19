/* DAILY BUGLE APP COMPONENT */

class BugleApp {
  constructor(container) {
    this.container = container;
    this.service = window.SpidyNewsService;
    this.currentCategory = 'All';
    this.currentSearch = '';
    this.articles = [];
    this.selectedArticle = null;
    this.isOffline = false;
    this.isFallback = false;
    this.error = null;
    this.renderLoading();
    this.load();
  }

  async load() {
    try {
      const result = await this.service.getNews({ category: this.currentCategory, search: this.currentSearch });
      this.articles = result.articles;
      this.isOffline = result.isOffline;
      this.isFallback = result.isFallback;
      this.error = result.error || null;
      if (this.selectedArticle) {
        // keep detail view if article still exists
        const stillExists = this.articles.find(a => a.id === this.selectedArticle.id);
        if (!stillExists) this.selectedArticle = null;
      }
      this.render();
    } catch (e) {
      console.error('Bugle load failed', e);
      this.error = e.message;
      this.renderError(e.message);
    }
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="bugle-app">
        ${this.mastheadHTML()}
        <div class="bugle-loading">
          <div class="bugle-loading-spinner"></div>
          <div class="bugle-state-title">Printing Press Running</div>
          <div class="bugle-state-sub">J. Jonah Jameson is yelling about deadlines...</div>
        </div>
      </div>
    `;
  }

  renderError(msg) {
    this.container.innerHTML = `
      <div class="bugle-app">
        ${this.mastheadHTML()}
        <div class="bugle-controls">
          ${this.controlsHTML()}
        </div>
        <div class="bugle-error">
          <div style="font-size:36px;">🗞️</div>
          <div class="bugle-state-title">Press Jam</div>
          <div class="bugle-state-sub">${this.escape(msg)}<br>Showing demo edition instead.</div>
          <button class="bugle-btn" data-action="retry">↻ Retry</button>
        </div>
      </div>
    `;
    this.bindControls();
    this.container.querySelector('[data-action="retry"]')?.addEventListener('click', () => { this.renderLoading(); this.load(); });
  }

  mastheadHTML() {
    const liveBadge = !this.isFallback ? `<span class="bugle-live-badge"><span class="bugle-live-dot"></span> Live Wire</span>` : `<span class="bugle-fallback-badge">📰 Demo Edition • Offline Ready</span>`;
    const offlineBadge = this.isOffline ? `<span class="bugle-fallback-badge">● Offline • Cached</span>` : '';
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return `
      <div class="bugle-masthead">
        <h1 class="bugle-masthead-title">Daily <span>Bugle</span></h1>
        <div class="bugle-masthead-sub">
          <span>New York's Finest Since 1898 • Parker Photos • Jameson Rants</span>
          <div class="bugle-masthead-meta">
            <span>${dateStr}</span>
            ${liveBadge}
            ${offlineBadge}
          </div>
        </div>
      </div>
      ${this.tickerHTML()}
    `;
  }

  tickerHTML() {
    const breaking = (window.BUGLE_FALLBACK_ARTICLES || []).filter(a => a.breaking).slice(0, 6);
    const items = breaking.length ? breaking : this.articles.slice(0, 6);
    if (!items.length) return '';
    const doubled = [...items, ...items]; // for seamless loop
    return `
      <div class="bugle-ticker">
        <div class="bugle-ticker-label">Breaking News</div>
        <div class="bugle-ticker-track">
          ${doubled.map(a => `<span class="bugle-ticker-item">${this.escape(a.title)}</span>`).join('')}
        </div>
      </div>
    `;
  }

  controlsHTML() {
    const cats = ['All','Breaking','India','World','Technology','Science','Entertainment','Sports'];
    return `
      <div class="bugle-search-wrap">
        <input class="bugle-search-input" placeholder="Search Bugle archives..." value="${this.escape(this.currentSearch)}" data-role="search" />
        <button class="bugle-btn" data-action="search">Search</button>
        <button class="bugle-btn" data-action="refresh" title="Refresh feed">↻</button>
      </div>
      <div class="bugle-categories">
        ${cats.map(c => `<button class="bugle-cat ${this.currentCategory===c?'active':''}" data-cat="${c}">${c}</button>`).join('')}
      </div>
    `;
  }

  feedHTML() {
    if (!this.articles.length) {
      return `
        <div class="bugle-empty">
          <div style="font-size:36px;">🔍</div>
          <div class="bugle-state-title">No Stories Found</div>
          <div class="bugle-state-sub">Try a different search or category. Even Spider-Man can't find everything.</div>
          <button class="bugle-btn" data-action="clear">Clear Filters</button>
        </div>
      `;
    }
    return `
      <div class="bugle-feed">
        ${this.articles.map(a => `
          <div class="bugle-card ${a.breaking?'breaking':''}" data-id="${a.id}">
            <div class="bugle-card-image">
              ${a.image ? `<img src="${this.escape(a.image)}" alt="" loading="lazy" onerror="this.style.display='none'">` : this.categoryEmoji(a.category)}
            </div>
            <div class="bugle-card-content">
              <div class="bugle-card-meta">
                <span class="bugle-card-category">${this.escape(a.category)}</span>
                <span class="bugle-card-time">${this.timeAgo(a.timestamp)}</span>
                <span class="bugle-card-source">${this.escape(a.source)}</span>
              </div>
              <h3 class="bugle-card-title">${this.escape(a.title)}</h3>
              <p class="bugle-card-excerpt">${this.escape(a.excerpt)}</p>
              ${a.isFallback ? `<div class="bugle-card-fallback-note">📰 Demo Story • From Bugle Archives (offline-ready)</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  articleHTML() {
    const a = this.selectedArticle;
    if (!a) return this.feedHTML();
    return `
      <div class="bugle-article">
        <button class="bugle-article-back" data-action="back">← Back to Front Page</button>
        <div class="bugle-article-category">${this.escape(a.category)} ${a.breaking ? '• Breaking' : ''} ${a.isFallback ? '• Demo' : '• Live'}</div>
        <h1 class="bugle-article-title">${this.escape(a.title)}</h1>
        <div class="bugle-article-meta">
          <span>By ${this.escape(a.source)}</span>
          <span>•</span>
          <span>${new Date(a.timestamp).toLocaleString()}</span>
          ${a.url ? `<span>•</span><a href="${this.escape(a.url)}" target="_blank" style="color:#ff9999;text-decoration:none;">View Original ↗</a>` : ''}
        </div>
        ${a.image ? `<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);"><img src="${this.escape(a.image)}" style="width:100%;max-height:360px;object-fit:cover;display:block;" onerror="this.parentElement.style.display='none'"></div>` : ''}
        <div class="bugle-article-body">${this.escape(a.content || a.excerpt)}</div>
        ${a.isFallback ? `<div style="margin-top:20px;padding:12px;border-radius:10px;background:rgba(255,180,0,0.08);border:1px solid rgba(255,180,0,0.15);font-family:'Segoe UI',sans-serif;font-size:12px;color:#ffcc88;">⚠️ This is a demo story from the local archive to showcase the Daily Bugle layout. It is clearly marked as fallback and is not presented as live news. Live news will appear when a provider API key is configured via <code>localStorage.setItem('spidey-news-config', JSON.stringify({provider:'newsapi', apiKey:'YOUR_KEY'}))</code></div>` : ''}
      </div>
    `;
  }

  render() {
    if (this.selectedArticle) {
      this.container.innerHTML = `
        <div class="bugle-app">
          ${this.mastheadHTML()}
          <div class="bugle-controls">${this.controlsHTML()}</div>
          ${this.articleHTML()}
        </div>
      `;
    } else {
      this.container.innerHTML = `
        <div class="bugle-app">
          ${this.mastheadHTML()}
          <div class="bugle-controls">${this.controlsHTML()}</div>
          ${this.feedHTML()}
          <div style="padding:12px 16px;text-align:center;font-family:'Segoe UI',sans-serif;font-size:10px;color:#555;letter-spacing:0.06em;text-transform:uppercase;">
            ${this.isFallback ? 'Demo Edition • Stories are fictional placeholders to demonstrate layout • Clearly marked as fallback' : 'Live Feed • Powered by configurable news provider'} • Cached for offline reading • ${this.articles.length} stories
            ${this.error ? `<br><span style="color:#ff9999;">Provider error: ${this.escape(this.error)} - showing fallback/cache</span>` : ''}
          </div>
        </div>
      `;
    }
    this.bindControls();
    this.bindCards();
  }

  bindControls() {
    const searchInput = this.container.querySelector('[data-role="search"]');
    const searchBtn = this.container.querySelector('[data-action="search"]');
    const refreshBtn = this.container.querySelector('[data-action="refresh"]');
    const clearBtn = this.container.querySelector('[data-action="clear"]');

    const doSearch = () => {
      this.currentSearch = searchInput ? searchInput.value.trim() : '';
      this.selectedArticle = null;
      this.renderLoading();
      this.load();
    };

    searchBtn?.addEventListener('click', doSearch);
    searchInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
    refreshBtn?.addEventListener('click', () => { this.renderLoading(); this.load(); });
    clearBtn?.addEventListener('click', () => {
      this.currentSearch = '';
      this.currentCategory = 'All';
      this.selectedArticle = null;
      this.renderLoading();
      this.load();
    });

    this.container.querySelectorAll('.bugle-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentCategory = btn.dataset.cat;
        this.selectedArticle = null;
        this.renderLoading();
        this.load();
      });
    });
  }

  bindCards() {
    this.container.querySelectorAll('.bugle-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const article = this.articles.find(a => a.id === id);
        if (article) {
          this.selectedArticle = article;
          this.render();
          // scroll top
          const body = this.container.querySelector('.spidey-window-body') || this.container;
          body.scrollTop = 0;
        }
      });
    });
    this.container.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      this.selectedArticle = null;
      this.render();
    });
  }

  categoryEmoji(cat) {
    const map = { Breaking: '🚨', India: '🇮🇳', World: '🌍', Technology: '💻', Science: '🔬', Entertainment: '🎬', Sports: '⚽' };
    return map[cat] || '📰';
  }

  timeAgo(iso) {
    try {
      const diff = Date.now() - new Date(iso).getTime();
      const mins = Math.floor(diff/60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins/60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs/24);
      return `${days}d ago`;
    } catch { return ''; }
  }

  escape(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
}

window.BugleApp = BugleApp;
