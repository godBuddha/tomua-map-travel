const INITIAL_LIMIT = 6;
const LOAD_MORE_LIMIT = 3;
let currentOffset = 0;
let totalDestinations = 0;
let isLoading = false;
let allLoaded = false;
let allEvents = [];
let currentEventFilter = 'all';
let allRoutes = [];
let currentRouteFilter = 'all';

function getTypeLabel(type) {
  return (typeof I18nNew !== 'undefined') ? I18nNew.getCommon(`type.${type}`, type) : type;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// === DESTINATIONS ===
async function loadDestinationCards(isLoadMore = false) {
  if (isLoading) return;
  isLoading = true;
  const btn = document.getElementById('viewMoreBtn');
  const btnText = document.getElementById('viewMoreText');
  const btnArrow = btn ? btn.querySelector('.arrow') : null;

  if (isLoadMore && btn) {
    btn.classList.add('loading');
    btn.disabled = true;
    btnText.textContent = (typeof I18nNew !== 'undefined') ? I18nNew.get('map.loading', 'Đang tải...') : 'Đang tải...';
    btnArrow.textContent = '⟳';
  }

  try {
    const limit = isLoadMore ? LOAD_MORE_LIMIT : INITIAL_LIMIT;
    const offset = isLoadMore ? currentOffset : 0;
    const response = await fetch(`/api/destinations?status=published&limit=${limit}&offset=${offset}`);
    const data = await response.json();

    if (data.success) {
      const grid = document.getElementById('destGrid');
      const lang = (typeof I18nNew !== 'undefined') ? I18nNew.getLang() : 'vi';
      const newItems = data.data.items;
      totalDestinations = data.data.pagination.total;

      const header = document.querySelector('[data-i18n="dest.title"]');
      if (header) {
        const titleTemplate = (typeof I18nNew !== 'undefined') ? I18nNew.get('dest.title', 'Khám phá {{count}} điểm đến') : 'Khám phá {{count}} điểm đến';
        header.textContent = titleTemplate.replace('{{count}}', totalDestinations);
      }

      const newHtml = newItems.map((d, index) => {
        const lat = d.lat || 0;
        const lng = d.lng || 0;
        const name = d.name[lang] || d.name.vi || d.name.en || 'Unknown';
        const desc = d.description ? (d.description[lang] || d.description.vi || d.description.en || '') : '';
        const typeLabel = getTypeLabel(d.type);
        const imageUrl = d.image_url || null;
        return `
          <a href="detail.html?slug=${d.slug}" class="dest-card type-${d.type}" style="animation-delay: ${(isLoadMore ? 0 : index) * 0.05}s">
            <div class="dest-img" ${imageUrl ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"` : ''}>
              <span class="dest-type">${typeLabel}</span>
              <span class="dest-region">${d.region || 'Tô Múa'}</span>
              <h3>${name}</h3>
            </div>
            <div class="dest-body">
              <p>${desc}</p>
              <div class="dest-meta">
                <span>📍 ${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E</span>
                <span>🏔️ ${d.region || 'Tô Múa'}</span>
              </div>
            </div>
          </a>`;
      }).join('');

      if (isLoadMore) {
        grid.insertAdjacentHTML('beforeend', newHtml);
        currentOffset += newItems.length;
      } else {
        grid.innerHTML = newHtml;
        currentOffset = newItems.length;
      }
      allLoaded = currentOffset >= totalDestinations;
      updateViewMoreButton();
    }
  } catch (error) {
    console.error('Error loading destinations:', error);
  } finally {
    isLoading = false;
    if (btn) {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }
}

function updateViewMoreButton() {
  const viewMoreContainer = document.getElementById('viewMoreContainer');
  const btn = document.getElementById('viewMoreBtn');
  if (!btn || !viewMoreContainer) return;
  const btnText = document.getElementById('viewMoreText');
  const btnArrow = btn.querySelector('.arrow');

  if (totalDestinations <= INITIAL_LIMIT) {
    viewMoreContainer.style.display = 'none';
  } else if (allLoaded) {
    viewMoreContainer.style.display = 'block';
    btnText.textContent = 'Thu gọn';
    btnArrow.textContent = '↑';
    btn.onclick = collapseDestinations;
  } else {
    viewMoreContainer.style.display = 'block';
    const remaining = totalDestinations - currentOffset;
    btnText.textContent = `Xem thêm (${remaining})`;
    btnArrow.textContent = '↓';
    btn.onclick = () => loadDestinationCards(true);
  }
}

function collapseDestinations() {
  currentOffset = 0;
  allLoaded = false;
  loadDestinationCards(false);
  setTimeout(() => {
    const destSection = document.getElementById('destinations');
    if (destSection) destSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

window.toggleDestinations = () => {
  if (allLoaded) collapseDestinations();
  else loadDestinationCards(true);
};

// === EVENTS ===
function filterEvents(type, btn) {
  currentEventFilter = type;
  document.querySelectorAll('#events .filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderEvents();
}
window.filterEvents = filterEvents;

function renderEvents() {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;
  const lang = (typeof I18nNew !== 'undefined') ? I18nNew.getLang() : 'vi';
  const typeIcons = { festival: '🎪', season: '🌿', experience: '⛰️', cultural: '🎭', sport: '🏃', food: '🍜', other: '📌' };
  const filtered = currentEventFilter === 'all' ? allEvents : allEvents.filter(e => e.type === currentEventFilter);
  const formatDate = d => { if (!d) return ''; return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); };

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted); text-align:center;">Không có sự kiện nào</p>';
    return;
  }
  grid.innerHTML = filtered.map(event => {
    const name = escapeHtml(event.name[lang] || event.name.vi || event.name.en);
    const desc = event.description ? (event.description[lang] || event.description.vi || event.description.en || '') : '';
    const icon = event.icon || typeIcons[event.type] || '📅';
    return `
      <div class="event-card" onclick="window.location.href='detail.html?slug=${event.slug}'" style="cursor:pointer;">
        <div class="event-icon">${icon}</div>
        <h3>${name}</h3>
        <p>${desc.substring(0, 120)}...</p>
        <div class="event-meta"><span>📅 ${formatDate(event.start_date)}</span></div>
      </div>`;
  }).join('');
}

async function loadEvents() {
  try {
    const response = await fetch('/api/events?status=published');
    const data = await response.json();
    if (data.success) { allEvents = data.data.items; renderEvents(); }
  } catch (error) { console.error('Error loading events:', error); }
}

// === ROUTES ===
function filterRoutes(transport, btn) {
  currentRouteFilter = transport;
  document.querySelectorAll('#routes .filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderRoutes();
}
window.filterRoutes = filterRoutes;

function renderRoutes() {
  const grid = document.getElementById('routesGrid');
  if (!grid) return;
  const lang = (typeof I18nNew !== 'undefined') ? I18nNew.getLang() : 'vi';
  const filtered = currentRouteFilter === 'all' ? allRoutes : allRoutes.filter(r => r.transport === currentRouteFilter);

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted); text-align:center;">Không có lộ trình nào</p>';
    return;
  }
  grid.innerHTML = filtered.map(route => {
    const name = escapeHtml(route.name[lang] || route.name.vi || route.name.en);
    const desc = route.description ? (route.description[lang] || route.description.vi || route.description.en || '') : '';
    const stops = route.stops || [];
    const stopsHtml = stops.map((s, i) => {
      const stopName = s.destination_name ? (s.destination_name[lang] || s.destination_name.vi || s.destination_name.en) : 'Unknown';
      return `<span class="route-stop"><span class="dot" style="background:var(--accent)"></span>${stopName}</span>${i < stops.length - 1 ? '<span class="route-arrow">→</span>' : ''}`;
    }).join('');
    return `
      <div class="route-card" onclick="window.location.href='detail.html?slug=${route.slug}'" style="cursor:pointer;">
        <div class="route-header"><h3>${name}</h3></div>
        <p>${desc.substring(0, 150)}...</p>
        <div class="route-stops">${stopsHtml || '<span style="color:var(--muted)">Chưa có điểm dừng</span>'}</div>
      </div>`;
  }).join('');
}

async function loadRoutes() {
  try {
    const response = await fetch('/api/routes?status=published');
    const data = await response.json();
    if (data.success) { allRoutes = data.data.items; renderRoutes(); }
  } catch (error) { console.error('Error loading routes:', error); }
}

// === MINI MAP ===
function initMiniMap() {
  if (typeof L === 'undefined') return;
  const center = (typeof TomuaConfig !== 'undefined' && TomuaConfig.mapCenter) ? TomuaConfig.mapCenter : [20.844, 104.825];
  const map = L.map('mini-map', { zoomControl: false, attributionControl: false }).setView(center, 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

  const geoFiles = (typeof TomuaConfig !== 'undefined' && TomuaConfig.geoFiles) ? TomuaConfig.geoFiles : [
    { file: 'Tô Múa - 63.geojson', name: 'Tô Múa', color: '#2d6a4f' },
    { file: 'Chiềng Khoa - 63.geojson', name: 'Chiềng Khoa', color: '#0e7490' },
    { file: 'Suối Bàng - 63.geojson', name: 'Suối Bàng', color: '#d97706' }
  ];
  geoFiles.forEach(({ file, name, color }) => {
    fetch(file).then(r => r.json()).then(data => {
      L.geoJSON(data, { style: { color, weight: 2.5, opacity: 0.8, fillColor: color, fillOpacity: 0.1, dashArray: '6 4' } })
        .bindTooltip(name, { permanent: false, direction: 'center' }).addTo(map);
    }).catch(() => {});
  });

  const mergedFile = (typeof TomuaConfig !== 'undefined' && TomuaConfig.mergedBoundary) ? TomuaConfig.mergedBoundary : 'Tô Múa (phường xã) - 34.geojson';
  fetch(mergedFile).then(r => r.json()).then(data => {
    L.geoJSON(data, { style: { color: '#1b4332', weight: 3, opacity: 1, fillColor: '#1b4332', fillOpacity: 0.04 } }).addTo(map);
  }).catch(() => {});

  const typeColors = (typeof TomuaConfig !== 'undefined') ? TomuaConfig.typeColors : {};
  const typeEmoji = (typeof TomuaConfig !== 'undefined') ? TomuaConfig.typeEmoji : {};

  fetch('/api/destinations?status=published').then(r => r.json()).then(data => {
    if (data.success) {
      data.data.items.forEach(d => {
        const lat = d.lat || 0; const lng = d.lng || 0;
        const name = d.name.vi || d.name.en || 'Unknown';
        const icon = L.divIcon({
          html: `<div style="background:${typeColors[d.type] || '#666'};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${typeEmoji[d.type] || '📍'}</div>`,
          className: '', iconSize: [32, 32], iconAnchor: [16, 16]
        });
        L.marker([lat, lng], { icon }).addTo(map).bindPopup(`<strong>${name}</strong>`);
      });
    }
  }).catch(() => {});

  setTimeout(() => map.invalidateSize(), 200);
}

// === STATS ===
async function loadHomepageStats() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.data && data.data.homepage_stats) {
      const stats = data.data.homepage_stats.stats;
      const grid = document.getElementById('statsGrid');
      if (grid && stats) {
        grid.innerHTML = stats.map(s => {
          const label = (typeof I18nNew !== 'undefined') ? I18nNew.get(s.labelKey, s.labelKey) : s.labelKey;
          return `
            <div class="stat-card">
              <span class="stat-icon">${s.icon}</span>
              <span class="stat-number">${s.number}${s.unit ? ' <span class="stat-unit">' + s.unit + '</span>' : ''}</span>
              <span class="stat-label">${label}</span>
            </div>`;
        }).join('');
      }
    }
  } catch (e) { console.error('Error loading stats:', e); }
}

// === EVENT FILTERS ===
async function loadEventFilters() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.data && data.data.event_filters) {
      const filters = data.data.event_filters.filters;
      const container = document.getElementById('eventFilters');
      if (container && filters) {
        container.innerHTML = filters.map((f, i) => {
          const label = (typeof I18nNew !== 'undefined') ? I18nNew.get(f.labelKey, f.labelKey) : f.labelKey;
          return `<button class="filter-chip${i === 0 ? ' active' : ''}" onclick="filterEvents('${f.type}', this)">${f.icon ? f.icon + ' ' : ''}${label}</button>`;
        }).join('');
      }
    }
  } catch (e) { console.error('Error loading event filters:', e); }
}

// === ROUTE FILTERS ===
async function loadRouteFilters() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.data && data.data.route_filters) {
      const filters = data.data.route_filters.filters;
      const container = document.getElementById('routeFilters');
      if (container && filters) {
        container.innerHTML = filters.map((f, i) => {
          const label = (typeof I18nNew !== 'undefined') ? I18nNew.get(f.labelKey, f.labelKey) : f.labelKey;
          return `<button class="filter-chip${i === 0 ? ' active' : ''}" onclick="filterRoutes('${f.type}', this)">${f.icon ? f.icon + ' ' : ''}${label}</button>`;
        }).join('');
      }
    }
  } catch (e) { console.error('Error loading route filters:', e); }
}

// === INIT ===
function initIndexPage() {
  document.body.classList.add('page-fade-in');

  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  initMiniMap();

  if (typeof I18nNew !== 'undefined') {
    I18nNew.init('homepage').then(() => {
      loadHomepageStats();
      loadEventFilters();
      loadRouteFilters();
      loadDestinationCards();
      loadEvents();
      loadRoutes();
    });
    document.addEventListener('i18n-changed', () => {
      currentOffset = 0;
      allLoaded = false;
      loadHomepageStats();
      loadEventFilters();
      loadRouteFilters();
      loadDestinationCards();
      loadEvents();
      loadRoutes();
    });
  } else {
    loadHomepageStats();
    loadEventFilters();
    loadRouteFilters();
    loadDestinationCards();
    loadEvents();
    loadRoutes();
  }
}

initIndexPage();
