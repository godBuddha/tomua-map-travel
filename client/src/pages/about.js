export function initAboutPage() {
  document.body.classList.add('page-fade-in');

  // Navbar scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Mobile menu
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Init map
  initAboutMap();

  // Init i18n
  initI18n();
}

function initAboutMap() {
  const mapEl = document.getElementById('about-map');
  if (!mapEl || typeof L === 'undefined') return;

  const center = (typeof TomuaConfig !== 'undefined' && TomuaConfig.mapCenter)
    ? TomuaConfig.mapCenter
    : [20.844, 104.825];

  const map = L.map('about-map', { zoomControl: true, attributionControl: false })
    .setView(center, 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
  }).addTo(map);

  // Load boundaries from config
  const geoFiles = (typeof TomuaConfig !== 'undefined' && TomuaConfig.geoFiles)
    ? TomuaConfig.geoFiles
    : [
        { file: 'Tô Múa - 63.geojson', color: '#2d6a4f', name: 'Tô Múa (cũ)' },
        { file: 'Chiềng Khoa - 63.geojson', color: '#0e7490', name: 'Chiềng Khoa (cũ)' },
        { file: 'Suối Bàng - 63.geojson', color: '#d97706', name: 'Suối Bàng (cũ)' }
      ];

  geoFiles.forEach(({ file, color, name }) => {
    fetch(file)
      .then(r => r.json())
      .then(data => {
        L.geoJSON(data, {
          style: { color, weight: 2.5, opacity: 0.8, fillColor: color, fillOpacity: 0.1, dashArray: '6 4' }
        }).bindTooltip(name, { permanent: false, direction: 'center' }).addTo(map);
      })
      .catch(() => {});
  });

  // Merged boundary
  const mergedFile = (typeof TomuaConfig !== 'undefined' && TomuaConfig.mergedBoundary)
    ? TomuaConfig.mergedBoundary
    : 'Tô Múa (phường xã) - 34.geojson';

  fetch(mergedFile)
    .then(r => r.json())
    .then(data => {
      L.geoJSON(data, {
        style: { color: '#1b4332', weight: 3, opacity: 1, fillColor: '#1b4332', fillOpacity: 0.04 }
      }).addTo(map);
    })
    .catch(() => {});

  setTimeout(() => map.invalidateSize(), 200);
}

function initI18n() {
  if (typeof I18nNew === 'undefined') return;

  async function applyI18n() {
    await I18nNew.init('about');

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = I18nNew.get(key);
      if (translation && translation !== key) {
        el.textContent = translation;
      }
    });
    document.title = I18nNew.get('about.hero.title', 'Giới thiệu') + ' — Xã Tô Múa';

    document.addEventListener('i18n-changed', () => {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = I18nNew.get(key);
        if (translation && translation !== key) {
          el.textContent = translation;
        }
      });
      document.title = I18nNew.get('about.hero.title', 'Giới thiệu') + ' — Xã Tô Múa';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyI18n);
  } else {
    applyI18n();
  }
}

initAboutPage();
