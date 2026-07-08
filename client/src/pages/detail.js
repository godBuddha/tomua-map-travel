const _typeLabels = { waterfall: 'Thác nước', cave: 'Hang động', historical: 'Di tích lịch sử', spiritual: 'Tâm linh' };
const typeKickers = {
  waterfall: 'Thác nước · Khu vực',
  cave: 'Hang động · Khu vực',
  historical: 'Di tích lịch sử · Khu vực',
  spiritual: 'Tâm linh · Khu vực'
};
const _typeColors = typeof TomuaConfig !== 'undefined' ? TomuaConfig.typeColors : {};
const typeEmoji = typeof TomuaConfig !== 'undefined' ? TomuaConfig.typeEmoji : {};
const transportLabels = { walk: '🚶 Đi bộ', bike: '🏍️ Xe máy', car: '🚗 Ô tô' };
const difficultyLabels = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
const eventTypeLabels = {
  festival: 'Lễ hội',
  season: 'Theo mùa',
  experience: 'Trải nghiệm',
  cultural: 'Văn hóa',
  sport: 'Thể thao',
  food: 'Ẩm thực',
  other: 'Khác'
};

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function show404() {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:var(--font);flex-direction:column;gap:16px;">
      <h1 style="font-size:72px;font-weight:800;color:var(--accent);">404</h1>
      <p style="font-size:18px;color:var(--muted);">Không tìm thấy trang</p>
      <a href="index.html" style="padding:12px 24px;background:var(--accent);color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">Về trang chủ</a>
    </div>`;
}

function showError() {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:var(--font);flex-direction:column;gap:16px;">
      <h1 style="font-size:48px;font-weight:800;color:var(--danger);">Lỗi</h1>
      <p style="font-size:18px;color:var(--muted);">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
      <a href="index.html" style="padding:12px 24px;background:var(--accent);color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">Về trang chủ</a>
    </div>`;
}

// === LOAD ENTITY ===
async function loadEntity() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const type = params.get('type'); // optional: 'destination', 'route', 'event'
  const lang = typeof I18nNew !== 'undefined' ? I18nNew.getLang() : localStorage.getItem('tm_lang') || 'vi';

  if (!slug) {
    show404();
    return;
  }

  try {
    // Try to load based on type hint, or try all
    let data = null;
    let entityType = type;

    if (type === 'route' || !type) {
      const res = await fetch(`/api/routes/${slug}`);
      const json = await res.json();
      if (json.success) {
        data = json.data;
        entityType = 'route';
      }
    }

    if (!data && (type === 'event' || !type)) {
      const res = await fetch(`/api/events/${slug}`);
      const json = await res.json();
      if (json.success) {
        data = json.data;
        entityType = 'event';
      }
    }

    if (!data && (type === 'destination' || !type)) {
      const res = await fetch(`/api/destinations/${slug}`);
      const json = await res.json();
      if (json.success) {
        data = json.data;
        entityType = 'destination';
      }
    }

    if (!data) {
      show404();
      return;
    }

    window.dest = data;
    window.entityType = entityType;

    if (entityType === 'destination') {
      renderDestination(lang);
    } else if (entityType === 'route') {
      renderRoute(lang);
    } else if (entityType === 'event') {
      renderEvent(lang);
    }

    loadComments();
  } catch (error) {
    console.error('Error loading entity:', error);
    showError();
  }
}

// === RENDER DESTINATION ===
function renderDestination(lang) {
  const d = window.dest;
  const lat = d.lat || 0;
  const lng = d.lng || 0;
  const color = d.color || typeColors[d.type] || '#2d6a4f';
  const gradient = d.gradient || `linear-gradient(170deg, #1b4332, ${color} 50%, #95d5b2)`;
  const imageUrl = d.image_url || null;
  const name = escapeHtml(d.name[lang] || d.name.vi || d.name.en) || '';
  const desc = d.description ? d.description[lang] || d.description.vi || d.description.en || '' : '';
  const quoteStr = d.quote ? d.quote[lang] || d.quote.vi || d.quote.en || '' : '';

  document.title = name + ' — Tô Múa';

  // Hero
  document.getElementById('heroSky').style.background = gradient;
  if (imageUrl) {
    document.getElementById('heroSky').style.backgroundImage = `url('${imageUrl}')`;
    document.getElementById('heroSky').style.backgroundSize = 'cover';
    document.getElementById('heroSky').style.backgroundPosition = 'center';
    document.getElementById('galleryMain').innerHTML = `<img src="${imageUrl}" alt="${name}" class="gallery-img">`;
  }

  document.getElementById('detailName').textContent = name;
  document.getElementById('heroKicker').textContent = (typeKickers[d.type] || d.type) + ' · ' + (d.region || 'Tô Múa');
  document.getElementById('detailRegion').textContent = 'Khu vực: ' + (d.region || 'Tô Múa');
  document.getElementById('detailCoords').textContent = `${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E`;
  document.getElementById('detailCoordsText').textContent = `${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E`;
  document.getElementById('dirLink').href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // Description
  document.getElementById('detailDesc').textContent = desc;

  // Pull quote
  const pullQuote = document.getElementById('pullQuote');
  if (pullQuote) {
    if (quoteStr) {
      pullQuote.textContent = '"' + quoteStr + '"';
      pullQuote.style.display = '';
    } else {
      pullQuote.style.display = 'none';
    }
  }

  // Stats
  const stats = d.stats?.vi || d.stats?.en || d.stats || {};
  if (typeof stats === 'object' && Object.keys(stats).length > 0) {
    document.getElementById('statsStrip').innerHTML = Object.entries(stats)
      .map(
        ([k, v]) =>
          `<div class="stat-cell"><div class="stat-value">${escapeHtml(v)}</div><div class="stat-label">${escapeHtml(k)}</div></div>`
      )
      .join('');
  }

  // Info table
  const info = d.info?.vi || d.info?.en || d.info || {};
  if (typeof info === 'object' && Object.keys(info).length > 0) {
    document.getElementById('infoTable').innerHTML = Object.entries(info)
      .map(
        ([k, v]) => `<tr><td class="info-label">${escapeHtml(k)}</td><td class="info-value">${escapeHtml(v)}</td></tr>`
      )
      .join('');
  }

  // Gallery with multiple images
  const images = d.image_urls || (d.image_url ? [d.image_url] : []);
  if (images.length > 0) {
    const galleryHtml = images
      .slice(0, 3)
      .map(
        (url, i) =>
          `<div class="gallery-item${i === 0 ? '' : ''}"><img src="${url}" alt="${name} ${i + 1}" class="gallery-img"></div>`
      )
      .join('');
    document.querySelector('.gallery').innerHTML = galleryHtml;
  }

  // Map
  initDetailMap(lat, lng, color, name);
  loadNearby(lat, lng, lang);
}

// === RENDER ROUTE ===
function renderRoute(lang) {
  const r = window.dest;
  const name = escapeHtml(r.name[lang] || r.name.vi || r.name.en) || '';
  const desc = r.description ? r.description[lang] || r.description.vi || r.description.en || '' : '';

  document.title = name + ' — Tô Múa';

  // Hero - use route color
  document.getElementById('heroSky').style.background = 'linear-gradient(170deg, #1b4332, #2d6a4f 50%, #52b788)';
  document.getElementById('detailName').textContent = name;
  document.getElementById('heroKicker').textContent = '🗺️ Lộ trình · ' + (transportLabels[r.transport] || r.transport);
  document.getElementById('detailRegion').textContent = 'Độ khó: ' + (difficultyLabels[r.difficulty] || r.difficulty);
  document.getElementById('detailCoords').textContent =
    r.duration === 'half_day'
      ? 'Nửa ngày'
      : r.duration === 'full_day'
        ? '1 ngày'
        : r.duration === 'two_day'
          ? '2 ngày'
          : r.duration;
  document.getElementById('detailCoordsText').textContent = r.stops?.length + ' điểm dừng';

  // Description
  document.getElementById('detailDesc').textContent = desc;

  // Hide pull quote for routes
  const pullQuote = document.getElementById('pullQuote');
  if (pullQuote) pullQuote.style.display = 'none';

  // Stats
  const stops = r.stops || [];
  document.getElementById('statsStrip').innerHTML = `
    <div class="stat-cell"><div class="stat-value">${stops.length}</div><div class="stat-label">Điểm dừng</div></div>
    <div class="stat-cell"><div class="stat-value">${transportLabels[r.transport] || r.transport}</div><div class="stat-label">Phương tiện</div></div>
    <div class="stat-cell"><div class="stat-value">${difficultyLabels[r.difficulty] || r.difficulty}</div><div class="stat-label">Độ khó</div></div>
    <div class="stat-cell"><div class="stat-value">${r.duration === 'half_day' ? 'Nửa ngày' : r.duration === 'full_day' ? '1 ngày' : r.duration === 'two_day' ? '2 ngày' : r.duration}</div><div class="stat-label">Thời gian</div></div>
  `;

  // Info table - show stops
  if (stops.length > 0) {
    document.getElementById('infoTable').innerHTML = stops
      .map((s, i) => {
        const stopName = s.destination_name
          ? s.destination_name[lang] || s.destination_name.vi || s.destination_name.en
          : 'Điểm ' + (i + 1);
        const stopDesc = s.description ? s.description[lang] || s.description.vi || s.description.en || '' : '';
        return `<tr><td class="info-label">Điểm ${i + 1}</td><td class="info-value"><strong>${escapeHtml(stopName)}</strong>${stopDesc ? '<br>' + escapeHtml(stopDesc) : ''}</td></tr>`;
      })
      .join('');
  }

  // Gallery - hide for routes
  document.querySelector('.gallery').style.display = 'none';
  document.querySelector('.gallery-caption').style.display = 'none';

  // Map with route stops
  if (stops.length > 0) {
    initRouteMap(stops, lang);
  }
}

// === RENDER EVENT ===
function renderEvent(lang) {
  const e = window.dest;
  const name = escapeHtml(e.name[lang] || e.name.vi || e.name.en) || '';
  const desc = e.description ? e.description[lang] || e.description.vi || e.description.en || '' : '';
  const icon = e.icon || '📅';
  const imageUrl = e.image_url || null;

  document.title = name + ' — Tô Múa';

  // Hero
  document.getElementById('heroSky').style.background = 'linear-gradient(170deg, #1b4332, #7e22ce 50%, #a855f7)';
  if (imageUrl) {
    document.getElementById('heroSky').style.backgroundImage = `url('${imageUrl}')`;
    document.getElementById('heroSky').style.backgroundSize = 'cover';
    document.getElementById('heroSky').style.backgroundPosition = 'center';
  }

  document.getElementById('detailName').textContent = icon + ' ' + name;
  document.getElementById('heroKicker').textContent = '📅 Sự kiện · ' + (eventTypeLabels[e.type] || e.type);
  document.getElementById('detailRegion').textContent = e.address?.vi || e.address?.en || '';

  const formatDate = d => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  document.getElementById('detailCoords').textContent =
    formatDate(e.start_date) + (e.end_date ? ' — ' + formatDate(e.end_date) : '');
  document.getElementById('detailCoordsText').textContent = e.start_time || '08:00' + ' - ' + (e.end_time || '17:00');

  // Description
  document.getElementById('detailDesc').textContent = desc;

  // Hide pull quote for events
  const pullQuote = document.getElementById('pullQuote');
  if (pullQuote) pullQuote.style.display = 'none';

  // Stats
  document.getElementById('statsStrip').innerHTML = `
    <div class="stat-cell"><div class="stat-value">${icon}</div><div class="stat-label">${eventTypeLabels[e.type] || e.type}</div></div>
    <div class="stat-cell"><div class="stat-value">${formatDate(e.start_date)}</div><div class="stat-label">Ngày bắt đầu</div></div>
    <div class="stat-cell"><div class="stat-value">${formatDate(e.end_date)}</div><div class="stat-label">Ngày kết thúc</div></div>
    <div class="stat-cell"><div class="stat-value">${e.recurring !== 'none' ? '🔁 Hàng năm' : '📅 Một lần'}</div><div class="stat-label">Tần suất</div></div>
  `;

  // Info table
  const infoRows = [];
  if (e.type) infoRows.push(['Loại sự kiện', eventTypeLabels[e.type] || e.type]);
  if (e.destination_id) infoRows.push(['Địa điểm', 'Liên kết điểm du lịch']);
  if (e.start_time) infoRows.push(['Giờ bắt đầu', e.start_time]);
  if (e.end_time) infoRows.push(['Giờ kết thúc', e.end_time]);
  document.getElementById('infoTable').innerHTML = infoRows
    .map(([k, v]) => `<tr><td class="info-label">${k}</td><td class="info-value">${v}</td></tr>`)
    .join('');

  // Gallery with event images
  const images = e.image_urls || (e.image_url ? [e.image_url] : []);
  if (images.length > 0) {
    document.querySelector('.gallery').innerHTML = images
      .slice(0, 3)
      .map((url, i) => `<div class="gallery-item"><img src="${url}" alt="${name} ${i + 1}" class="gallery-img"></div>`)
      .join('');
  } else {
    document.querySelector('.gallery').style.display = 'none';
    document.querySelector('.gallery-caption').style.display = 'none';
  }

  // Map - show event location if available
  if (e.lat && e.lng) {
    initDetailMap(e.lat, e.lng, '#7e22ce', name);
  } else {
    document.querySelector('.sidebar-card').style.display = 'none';
  }
}

// === INIT MAP ===
function initDetailMap(lat, lng, color, name) {
  const detailMap = L.map('detailMap', {
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false
  }).setView([lat, lng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(detailMap);
  const icon = L.divIcon({
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);"></div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
  L.marker([lat, lng], { icon }).addTo(detailMap).bindPopup(`<strong>${name}</strong>`);

  // Load boundaries
  const geoFiles =
    typeof TomuaConfig !== 'undefined' && TomuaConfig.geoFiles
      ? TomuaConfig.geoFiles
      : [
          { file: 'Tô Múa - 63.geojson', color: '#2d6a4f' },
          { file: 'Chiềng Khoa - 63.geojson', color: '#0e7490' },
          { file: 'Suối Bàng - 63.geojson', color: '#d97706' }
        ];
  geoFiles.forEach(({ file, color: c }) => {
    fetch(file)
      .then(r => r.json())
      .then(d => {
        L.geoJSON(d, { style: { color: c, weight: 1.5, opacity: 0.5, fillColor: c, fillOpacity: 0.03 } }).addTo(
          detailMap
        );
      })
      .catch(() => {});
  });

  setTimeout(() => detailMap.invalidateSize(), 300);
}

// === INIT ROUTE MAP ===
function initRouteMap(stops, lang) {
  const firstStop = stops[0];
  const lat = firstStop.lat || 0;
  const lng = firstStop.lng || 0;

  const detailMap = L.map('detailMap', {
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false
  }).setView([lat, lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(detailMap);

  const colors = ['#2d6a4f', '#0e7490', '#d97706', '#dc2626', '#7e22ce'];
  const markers = [];

  stops.forEach((s, i) => {
    const sLat = s.lat || 0;
    const sLng = s.lng || 0;
    const sName = s.destination_name
      ? s.destination_name[lang] || s.destination_name.vi || s.destination_name.en
      : 'Điểm ' + (i + 1);
    const color = colors[i % colors.length];

    const icon = L.divIcon({
      html: `<div style="background:${color};width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${i + 1}</div>`,
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    const marker = L.marker([sLat, sLng], { icon })
      .addTo(detailMap)
      .bindPopup(`<strong>#${i + 1} ${sName}</strong>`);
    markers.push(marker);

    // Draw line to next stop
    if (i < stops.length - 1) {
      const next = stops[i + 1];
      L.polyline(
        [
          [sLat, sLng],
          [next.lat || 0, next.lng || 0]
        ],
        {
          color: color,
          weight: 4,
          opacity: 0.7,
          dashArray: '8 4'
        }
      ).addTo(detailMap);
    }
  });

  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    detailMap.fitBounds(group.getBounds().pad(0.2));
  }

  // Load boundaries
  const geoFiles =
    typeof TomuaConfig !== 'undefined' && TomuaConfig.geoFiles
      ? TomuaConfig.geoFiles
      : [{ file: 'Tô Múa - 63.geojson', color: '#2d6a4f' }];
  geoFiles.forEach(({ file, color: c }) => {
    fetch(file)
      .then(r => r.json())
      .then(d => {
        L.geoJSON(d, { style: { color: c, weight: 1.5, opacity: 0.5, fillColor: c, fillOpacity: 0.03 } }).addTo(
          detailMap
        );
      })
      .catch(() => {});
  });

  setTimeout(() => detailMap.invalidateSize(), 300);
}

// === NEARBY ===
async function loadNearby(lat, lng, lang) {
  try {
    const res = await fetch(`/api/destinations/nearby?lat=${lat}&lng=${lng}&radius=10000`);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      const nearby = data.data.filter(d => d.id !== window.dest.id).slice(0, 4);
      document.getElementById('nearbyList').innerHTML = nearby
        .map(d => {
          const nName = d.name[lang] || d.name.vi || d.name.en || '';
          const nColor = typeColors[d.type] || '#2d6a4f';
          const dist = d.distance
            ? d.distance < 1000
              ? Math.round(d.distance) + 'm'
              : (d.distance / 1000).toFixed(1) + 'km'
            : '';
          return `<a href="detail.html?slug=${d.slug}" class="nearby-item">
          <div class="nearby-dot" style="background:${nColor}"></div>
          <div class="nearby-info"><h4>${escapeHtml(nName)}</h4><p>${d.type} ${dist ? '· ' + dist : ''}</p></div>
        </a>`;
        })
        .join('');
    }
  } catch (e) {
    /* ignore */
  }
}

// === COMMENTS ===
async function loadComments() {
  const type = window.entityType === 'route' ? 'route' : window.entityType === 'event' ? 'event' : 'destination';
  try {
    const res = await fetch(`/api/${type}s/${window.dest.id}/comments`);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      document.getElementById('commentsList').innerHTML = data.data
        .map(
          c =>
            `<div style="padding:10px 0;border-bottom:1px solid var(--border);font-size:14px;">
          <strong>${escapeHtml(c.user_name || 'Ẩn danh')}</strong>
          <span style="color:var(--muted);margin-left:8px;font-size:12px;">${new Date(c.created_at).toLocaleDateString('vi-VN')}</span>
          <p style="margin:6px 0 0;line-height:1.6;">${escapeHtml(c.comment)}</p>
        </div>`
        )
        .join('');
    } else {
      document.getElementById('commentsList').innerHTML =
        '<p style="color:var(--muted);font-size:14px;">Chưa có bình luận</p>';
    }
  } catch (e) {
    /* ignore */
  }
}

// === INIT ===
if (typeof I18nNew !== 'undefined') {
  I18nNew.init('detail').then(() => loadEntity());
  document.addEventListener('i18n-changed', () => {
    if (window.dest) {
      const lang = I18nNew.getLang();
      if (window.entityType === 'destination') renderDestination(lang);
      else if (window.entityType === 'route') renderRoute(lang);
      else if (window.entityType === 'event') renderEvent(lang);
    }
  });
} else {
  loadEntity();
}
