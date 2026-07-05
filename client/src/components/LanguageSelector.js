const LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Melayu', flag: '🇲🇾' },
  { code: 'lo', name: 'ລາວ', flag: '🇱🇦' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
];

export function renderLanguageSelector(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentLang = localStorage.getItem('tm_lang') || 'vi';
  const { onChange = null, style = 'select' } = options;

  if (style === 'select') {
    container.innerHTML = `
      <select class="lang-select" id="langSelect">
        ${LANGUAGES.map(l => `
          <option value="${l.code}" ${l.code === currentLang ? 'selected' : ''}>
            ${l.flag} ${l.name}
          </option>
        `).join('')}
      </select>
    `;

    const select = container.querySelector('#langSelect');
    select.addEventListener('change', (e) => {
      const lang = e.target.value;
      localStorage.setItem('tm_lang', lang);
      if (onChange) onChange(lang);
    });
  } else if (style === 'buttons') {
    container.innerHTML = `
      <div class="lang-buttons">
        ${LANGUAGES.map(l => `
          <button class="lang-btn ${l.code === currentLang ? 'active' : ''}" 
                  data-lang="${l.code}" 
                  title="${l.name}">
            ${l.flag}
          </button>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        localStorage.setItem('tm_lang', lang);
        container.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (onChange) onChange(lang);
      });
    });
  }
}

export function getCurrentLang() {
  return localStorage.getItem('tm_lang') || 'vi';
}

export { LANGUAGES };
