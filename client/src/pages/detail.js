const typeLabels = { waterfall: 'Thác nước', cave: 'Hang động', historical: 'Di tích lịch sử', spiritual: 'Tâm linh' };
const typeKickers = {
  waterfall: 'Thác nước · Khu vực',
  cave: 'Hang động · Khu vực',
  historical: 'Di tích lịch sử · Khu vực',
  spiritual: 'Tâm linh · Khu vực'
};
const typeColors = typeof TomuaConfig !== 'undefined' ? TomuaConfig.typeColors : {};
const typeEmoji = typeof TomuaConfig !== 'undefined' ? TomuaConfig.typeEmoji : {};

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function t(key) {
  if (typeof I18nNew === 'undefined') return key;
  return I18nNew.get(key, I18nNew.get('d' + window.dest.id + '.name', key));
}

// === LOAD DESTINATION ===
async function loadDestination() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug') || 'hang-dong-son';
  const lang = typeof I18nNew !== 'undefined' ? I18nNew.getLang() : localStorage.getItem('tm_lang') || 'vi';

  try {
    const response = await fetch(`/api/destinations/${slug}`);
    const data = await response.json();
    if (!data.success) {
      console.error('Destination not found');
      document.body.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;flex-direction:column"><h1>404</h1><p>Không tìm thấy điểm đến</p><a href="/">Về trang chủ</a></div>';
      return;
    }

    window.dest = data.data;
    const lat = window.dest.lat || 0;
    const lng = window.dest.lng || 0;
    const color = window.dest.color || typeColors[window.dest.type] || '#2d6a4f';
    const gradient = window.dest.gradient || `linear-gradient(170deg, #1b4332, ${color} 50%, #95d5b2)`;
    const imageUrl = window.dest.image_url || null;

    document.getElementById('heroSky').style.background = gradient;
    if (imageUrl) {
      document.getElementById('heroSky').style.backgroundImage = `url('${imageUrl}')`;
      document.getElementById('heroSky').style.backgroundSize = 'cover';
      document.getElementById('heroSky').style.backgroundPosition = 'center';
      const name = escapeHtml(window.dest.name[lang] || window.dest.name.vi || window.dest.name.en);
      document.getElementById('galleryMain').innerHTML = `<img src="${imageUrl}" alt="${name}" class="gallery-img">`;
    }

    document.getElementById('detailCoords').textContent = `${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E`;
    document.getElementById('detailCoordsText').textContent = `${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E`;
    document.getElementById('dirLink').href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    populateDest();

    // Map
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
    L.marker([lat, lng], { icon }).addTo(detailMap);

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
    loadNearby(lat, lng, lang);
    loadComments();
  } catch (error) {
    console.error('Error loading destination:', error);
    document.body.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;flex-direction:column"><h1>Lỗi</h1><p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p><a href="/">Về trang chủ</a></div>';
  }
}

// === POPULATE ===
function populateDest() {
  if (!window.dest) return;
  const lang = typeof I18nNew !== 'undefined' ? I18nNew.getLang() : 'vi';
  const name = escapeHtml(window.dest.name[lang] || window.dest.name.vi || window.dest.name.en) || '';
  const desc = window.dest.description
    ? window.dest.description[lang] || window.dest.description.vi || window.dest.description.en || ''
    : '';
  const quoteStr = window.dest.quote
    ? window.dest.quote[lang] || window.dest.quote.vi || window.dest.quote.en || ''
    : '';

  document.title = name + ' — Tô Múa';
  document.getElementById('detailName').textContent = name;
  document.getElementById('heroKicker').textContent =
    (typeof I18nNew !== 'undefined' ? I18nNew.get('kicker.' + window.dest.type) : typeKickers[window.dest.type] || '') +
    ' ' +
    window.dest.region;
  document.getElementById('detailRegion').textContent =
    (typeof I18nNew !== 'undefined' ? I18nNew.get('region') : 'Khu vực') + ': ' + window.dest.region;
  document.getElementById('detailDesc').textContent = desc;
  // Show/hide pull-quote section based on quote data
  const pullQuote = document.getElementById('pullQuote');
  if (pullQuote) {
    if (quoteStr) {
      pullQuote.textContent = '"' + quoteStr + '"';
      pullQuote.style.display = '';
    } else {
      pullQuote.style.display = 'none';
    }
  }

  const detailDescMore = document.getElementById('detailDescMore');
  if (detailDescMore) detailDescMore.style.display = 'none';

  if (typeof I18nNew !== 'undefined') {
    document.getElementById('headingIntro').textContent =
      I18nNew.get('detail.intro') || I18nNew.getCommon('nav.about') || 'Giới thiệu';
    document.getElementById('headingFeatures').textContent = I18nNew.get('detail.features') || 'Đặc điểm nổi bật';
    document.getElementById('headingGallery').textContent = I18nNew.get('detail.gallery') || 'Thư viện ảnh';
  }

  // Stats
  const stats = window.dest.stats?.[lang] || window.dest.stats?.vi || window.dest.stats?.en;
  const statsStrip = document.getElementById('statsStrip');
  const statsSection = statsStrip?.closest('section') || statsStrip?.parentElement;
  if (stats && typeof stats === 'object' && Object.keys(stats).length > 0) {
    statsStrip.innerHTML = Object.entries(stats)
      .map(
        ([key, value]) =>
          `<div class="stat-cell"><div class="stat-value">${value}</div><div class="stat-label">${key}</div></div>`
      )
      .join('');
    if (statsSection) statsSection.style.display = '';
  } else if (typeof I18nNew !== 'undefined') {
    const statsStr = I18nNew.get('d' + window.dest.id + '.stats');
    if (statsStr) {
      statsStrip.innerHTML = statsStr
        .split('|')
        .map(s => {
          const [l, v] = s.split(',');
          return `<div class="stat-cell"><div class="stat-value">${v}</div><div class="stat-label">${l}</div></div>`;
        })
        .join('');
      if (statsSection) statsSection.style.display = '';
    } else {
      if (statsSection) statsSection.style.display = 'none';
    }
  } else {
    if (statsSection) statsSection.style.display = 'none';
  }

  // Info table
  const info = window.dest.info?.[lang] || window.dest.info?.vi || window.dest.info?.en;
  const infoTable = document.getElementById('infoTable');
  const infoSection = infoTable?.closest('section') || infoTable?.parentElement;
  if (info && typeof info === 'object' && Object.keys(info).length > 0) {
    infoTable.innerHTML = Object.entries(info)
      .map(([label, value]) => `<tr><td class="info-label">${label}</td><td class="info-value">${value}</td></tr>`)
      .join('');
    if (infoSection) infoSection.style.display = '';
  } else if (typeof I18nNew !== 'undefined') {
    const infoStr = I18nNew.get('d' + window.dest.id + '.info');
    if (infoStr) {
      infoTable.innerHTML = infoStr
        .split('|')
        .map(s => {
          const [l, v] = s.split(',');
          return `<tr><td class="info-label">${l}</td><td class="info-value">${v}</td></tr>`;
        })
        .join('');
      if (infoSection) infoSection.style.display = '';
    } else {
      if (infoSection) infoSection.style.display = 'none';
    }
  } else {
    if (infoSection) infoSection.style.display = 'none';
  }

  // Visitor Notes
  const notesBlock = document.getElementById('visitorNotesBlock');
  const notesList = document.getElementById('visitorNotesList');
  const notes =
    window.dest.visitor_notes || window.dest.metadata?.visitor_notes?.[lang] || window.dest.metadata?.visitor_notes?.vi;
  if (notes && Array.isArray(notes) && notes.length > 0) {
    notesBlock.style.display = 'block';
    notesList.innerHTML = notes
      .map(note => {
        if (typeof note === 'string') {
          let icon = '📌';
          let text = note;
          const match = note.match(/^(\p{Emoji}|\p{Extended_Pictographic})\s*(.*)$/u);
          if (match) {
            icon = match[1];
            text = match[2];
          }
          return `<li><span class="note-icon">${icon}</span> <span>${text}</span></li>`;
        } else if (note && note.text) {
          const text = note.text[lang] || note.text.vi || note.text.en || '';
          return `<li><span class="note-icon">${note.icon || '📌'}</span> <span>${text}</span></li>`;
        }
        return '';
      })
      .join('');
  } else {
    notesBlock.style.display = 'none';
  }
}

// === NEARBY ===
async function loadNearby(lat, lng, lang) {
  try {
    const response = await fetch(`/api/destinations/nearby?lat=${lat}&lng=${lng}&radius=10000`);
    const data = await response.json();
    if (data.success) {
      const nearby = data.data.filter(d => (d.lat || 0) !== lat || (d.lng || 0) !== lng).slice(0, 3);
      const nearbyHtml = nearby
        .map(d => {
          const name = d.name[lang] || d.name.vi || d.name.en;
          return `<a href="detail.html?slug=${d.slug}" class="nearby-item"><span class="nearby-icon">${typeEmoji[d.type] || '📍'}</span><span>${name}</span></a>`;
        })
        .join('');
      const emptyMsg = typeof I18nNew !== 'undefined' ? I18nNew.get('nearby.empty') : 'Không có điểm đến lân cận';
      document.getElementById('nearbyList').innerHTML = nearbyHtml || `<p class="muted">${emptyMsg}</p>`;
    }
  } catch (error) {
    console.error('Error loading nearby:', error);
  }
}

// === COMMENTS ===
async function loadComments() {
  if (!window.dest) return;
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/api/destinations/${window.dest.id}/comments`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const data = await response.json();
    if (data.success) {
      const container = document.getElementById('commentsList');
      if (data.data.length === 0) {
        container.innerHTML = '<p style="color:var(--muted);font-size:14px;">Chưa có bình luận nào.</p>';
      } else {
        container.innerHTML = data.data
          .map(
            c => `
          <div style="padding:12px 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <strong style="font-size:14px;">${c.user_name || 'Ẩn danh'}</strong>
              <span style="font-size:12px;color:var(--muted);">${new Date(c.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            <p style="font-size:14px;margin:0;">${c.comment}</p>
          </div>
        `
          )
          .join('');
      }
      if (token) document.getElementById('commentForm').style.display = 'block';
    }
  } catch (error) {
    console.error('Error loading comments:', error);
  }
}

async function addComment() {
  const input = document.getElementById('commentInput');
  const comment = input.value.trim();
  if (!comment) return alert('Vui lòng nhập bình luận');
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/api/destinations/${window.dest.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ comment, action: 'comment' })
    });
    const data = await response.json();
    if (data.success) {
      input.value = '';
      loadComments();
    } else {
      alert('Lỗi: ' + (data.message || 'Không thể gửi bình luận'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}
window.addComment = addComment;

function copyCoords() {
  if (window.dest) {
    navigator.clipboard.writeText(`${window.dest.lat}, ${window.dest.lng}`).then(() => {
      alert(typeof I18nNew !== 'undefined' ? I18nNew.get('copy_alert') : 'Đã sao chép tọa độ!');
    });
  }
}
window.copyCoords = copyCoords;

// === INIT ===
function initDetailPage() {
  document.body.classList.add('page-fade-in');

  if (typeof I18nNew !== 'undefined') {
    I18nNew.init('detail').then(() => {
      document.addEventListener('i18n-changed', () => {
        if (window.dest) populateDest();
      });
      loadDestination();
    });
  } else {
    loadDestination();
  }
}

initDetailPage();
