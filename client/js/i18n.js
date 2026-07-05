// i18next initialization module
// Replaces custom I18nNew with standard i18next library
// Requires: i18next, i18next-http-backend, i18next-browser-languagedetector (loaded via CDN)

(function () {
  'use strict';

  var DEFAULT_LANG = 'vi';
  var SUPPORTED_LANGS = ['vi', 'en', 'ko', 'ru', 'th', 'zh', 'id', 'ms', 'lo', 'es', 'fr', 'de'];
  var COMMON_NS = ['common', 'navigation'];

  // Custom response parser for our API format
  // API returns: { success: true, data: { page, lang, translations: { key: value } } }
  function parseResponse(data) {
    if (data && data.success && data.data && data.data.translations) {
      return data.data.translations;
    }
    return data;
  }

  // Custom backend using fetch directly with cache-busting
  var customBackend = {
    type: 'backend',
    init: function () {},
    read: function (language, namespace, callback) {
      var url = '/api/i18n/' + namespace + '/' + language + '?t=' + Date.now();
      fetch(url, { cache: 'no-store' })
        .then(function (response) {
          if (!response.ok) throw new Error('Failed to load');
          return response.json();
        })
        .then(function (data) {
          var translations = parseResponse(data);
          callback(null, translations);
        })
        .catch(function (err) {
          callback(err, null);
        });
    },
    save: function () {}
  };

  // Initialize i18next
  async function init(page) {
    if (typeof TomuaConfig !== 'undefined' && TomuaConfig.initSettings) {
      await TomuaConfig.initSettings();
    }

    var savedLang = localStorage.getItem('tm_lang') || DEFAULT_LANG;
    var namespaces = COMMON_NS.concat([page]);

    await i18next
      .use(customBackend)
      .use(i18nextBrowserLanguageDetector)
      .init({
        lng: savedLang,
        fallbackLng: DEFAULT_LANG,
        supportedLngs: SUPPORTED_LANGS,
        ns: namespaces,
        defaultNS: page,
        fallbackNS: COMMON_NS,
        interpolation: {
          escapeValue: false,
          prefix: '{{',
          suffix: '}}'
        },
        detection: {
          lookupLocalStorage: 'tm_lang',
          lookupQuerystring: false,
          lookupCookie: false,
          lookupSessionStorage: false,
          order: ['localStorage'],
          caches: ['localStorage'],
          fallbackLng: DEFAULT_LANG
        },
        returnNull: false,
        returnEmptyString: false,
        returnDetails: false,
        saveMissing: false,
        initImmediate: false
      });

    applyTranslations();

    var langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.value = savedLang;
      langSelect.addEventListener('change', async function (e) {
        var lang = e.target.value;
        localStorage.setItem('tm_lang', lang);
        await i18next.changeLanguage(lang);
        applyTranslations();
        document.dispatchEvent(new CustomEvent('i18n-changed'));
      });
    }
  }

  // Apply translations to all data-i18n elements
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var value = i18next.t(key);
      if (value && value !== key) el.innerHTML = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var value = i18next.t(key);
      if (value && value !== key) el.placeholder = value;
    });

    document.querySelectorAll('[data-i18n-value]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-value');
      var value = i18next.t(key);
      if (value && value !== key) el.value = value;
    });
  }

  // Get translation with fallback
  function get(key, defaultValue) {
    var value = i18next.t(key);
    if (value && value !== key) return value;
    return defaultValue || key;
  }

  // Get common translation (cross-page)
  function getCommon(key, defaultValue) {
    for (var i = 0; i < COMMON_NS.length; i++) {
      var value = i18next.t(key, { ns: COMMON_NS[i] });
      if (value && value !== key) return value;
    }
    var value = i18next.t(key);
    if (value && value !== key) return value;
    return defaultValue || key;
  }

  // Get current language
  function getLang() {
    return i18next.language || DEFAULT_LANG;
  }

  // Set language
  function setLang(lang) {
    localStorage.setItem('tm_lang', lang);
    i18next.changeLanguage(lang).then(function () {
      applyTranslations();
      document.dispatchEvent(new CustomEvent('i18n-changed'));
    });
  }

  // Clear cache
  function clearCache() {
    i18next.reloadResources();
  }

  // Expose as window.TmI18n
  window.TmI18n = {
    init: init,
    get: get,
    getCommon: getCommon,
    getLang: getLang,
    setLang: setLang,
    clearCache: clearCache,
    applyTranslations: applyTranslations
  };

  // Backward compatibility
  window.I18nNew = window.TmI18n;
})();
