// i18next Module - Replaces custom i18n.js
// Provides same API as old I18n module but uses i18next

const I18nNew = {
  currentPage: null,
  translations: {},

  // Initialize i18next
  async init(page) {
    this.currentPage = page;

    // Load dynamic settings first if available
    if (typeof TomuaConfig !== 'undefined' && TomuaConfig.initSettings) {
      await TomuaConfig.initSettings();
    }

    // Load translations from API
    await this.loadTranslations(page);

    // Listen for language changes
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      const savedLang = localStorage.getItem('tm_lang') || 'vi';
      langSelect.value = savedLang;

      langSelect.addEventListener('change', async (e) => {
        const lang = e.target.value;
        localStorage.setItem('tm_lang', lang);
        await this.loadTranslations(page);
        this.apply();
        document.dispatchEvent(new CustomEvent('i18n-changed'));
      });
    }

    // Apply initial translations
    this.apply();
  },

  // Load translations from API
  async loadTranslations(page) {
    const lang = localStorage.getItem('tm_lang') || 'vi';

    try {
      // Load common, navigation, and page-specific translations in parallel
      const [commonRes, navRes, pageRes] = await Promise.all([
        fetch(`/api/i18n/common/${lang}`),
        fetch(`/api/i18n/navigation/${lang}`),
        fetch(`/api/i18n/${page}/${lang}`)
      ]);

      const [commonData, navData, pageData] = await Promise.all([
        commonRes.json(),
        navRes.json(),
        pageRes.json()
      ]);

      // Merge translations (page-specific takes priority)
      this.translations = {
        ...(commonData.success ? commonData.data.translations : {}),
        ...(navData.success ? navData.data.translations : {}),
        ...(pageData.success ? pageData.data.translations : {})
      };
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  },

  // Apply translations to DOM
  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      // Try exact key first, then strip page prefix
      let value = this.translations[key];
      if (!value && this.currentPage) {
        const prefix = this.currentPage + '.';
        if (key.startsWith(prefix)) {
          const shortKey = key.substring(prefix.length);
          value = this.translations[shortKey];
        }
      }
      if (value) {
        el.innerHTML = value;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      let value = this.translations[key];
      if (!value && this.currentPage) {
        const prefix = this.currentPage + '.';
        if (key.startsWith(prefix)) {
          value = this.translations[key.substring(prefix.length)];
        }
      }
      if (value) {
        el.placeholder = value;
      }
    });

    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      const key = el.getAttribute('data-i18n-value');
      let value = this.translations[key];
      if (!value && this.currentPage) {
        const prefix = this.currentPage + '.';
        if (key.startsWith(prefix)) {
          value = this.translations[key.substring(prefix.length)];
        }
      }
      if (value) {
        el.value = value;
      }
    });
  },

  // Get translation by key
  get(key, defaultValue = '') {
    let value = this.translations[key];
    if (!value && this.currentPage) {
      const prefix = this.currentPage + '.';
      if (key.startsWith(prefix)) {
        value = this.translations[key.substring(prefix.length)];
      }
    }
    return value || defaultValue;
  },

  // Get common translation
  getCommon(key, defaultValue = '') {
    return this.translations[key] || defaultValue;
  },

  // Get current language
  getLang() {
    return localStorage.getItem('tm_lang') || 'vi';
  },

  // Set language
  setLang(lang) {
    localStorage.setItem('tm_lang', lang);
  },

  // Clear cache
  clearCache() {
    this.translations = {};
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18nNew;
}
