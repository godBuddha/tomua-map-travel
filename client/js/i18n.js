// i18n Module - Load translations from API
const I18n = {
  cache: {},
  currentLang: 'vi',
  currentPage: null,

  // Initialize i18n
  init(page) {
    this.currentPage = page;
    this.currentLang = localStorage.getItem('tm_lang') || 'vi';
    
    // Listen for language changes
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.value = this.currentLang;
      langSelect.addEventListener('change', async (e) => {
        this.currentLang = e.target.value;
        localStorage.setItem('tm_lang', this.currentLang);
        await this.loadAndApply();
        document.dispatchEvent(new CustomEvent('i18n-changed'));
      });
    }
  },

  // Load translations from API or cache
  async load(page, lang) {
    const cacheKey = `${page}_${lang}`;
    
    // Check memory cache
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    // Check localStorage cache
    const stored = localStorage.getItem(`i18n_${cacheKey}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.cache[cacheKey] = parsed;
        return parsed;
      } catch (e) {
        localStorage.removeItem(`i18n_${cacheKey}`);
      }
    }

    // Fetch from API
    try {
      const response = await fetch(`/api/i18n/${page}/${lang}`);
      const data = await response.json();
      if (data.success && data.data.translations) {
        this.cache[cacheKey] = data.data.translations;
        localStorage.setItem(`i18n_${cacheKey}`, JSON.stringify(data.data.translations));
        return data.data.translations;
      }
    } catch (error) {
      console.error('Error loading translations:', error);
    }

    return {};
  },

  // Load common translations + page-specific translations
  async loadAndApply() {
    if (!this.currentPage) return;

    try {
      // Load common translations (types, status, etc.)
      const common = await this.load('common', this.currentLang);
      
      // Load navigation translations
      const navigation = await this.load('navigation', this.currentLang);
      
      // Load page-specific translations
      const page = await this.load(this.currentPage, this.currentLang);
      
      // Merge translations (page-specific takes priority)
      const translations = { ...common, ...navigation, ...page };
      
      // Apply to DOM
      this.apply(translations);
      
      return translations;
    } catch (error) {
      console.error('Error in loadAndApply:', error);
      return {};
    }
  },

  // Apply translations to DOM elements with data-i18n attribute
  apply(translations) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) {
        el.innerHTML = translations[key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) {
        el.placeholder = translations[key];
      }
    });

    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      const key = el.getAttribute('data-i18n-value');
      if (translations[key]) {
        el.value = translations[key];
      }
    });
  },

  // Get a single translation
  get(key, defaultValue = '') {
    const cacheKey = `${this.currentPage}_${this.currentLang}`;
    const translations = this.cache[cacheKey] || {};
    return translations[key] || defaultValue;
  },

  // Get common translation
  getCommon(key, defaultValue = '') {
    const cacheKey = `common_${this.currentLang}`;
    const translations = this.cache[cacheKey] || {};
    return translations[key] || defaultValue;
  },

  // Clear cache (useful after admin updates translations)
  clearCache() {
    this.cache = {};
    // Clear localStorage i18n entries
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('i18n_')) {
        localStorage.removeItem(key);
      }
    });
  },

  // Get current language
  getLang() {
    return this.currentLang;
  },

  // Set language
  setLang(lang) {
    this.currentLang = lang;
    localStorage.setItem('tm_lang', lang);
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18n;
}
