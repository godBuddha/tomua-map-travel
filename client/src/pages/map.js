let destinations = [];
let allRoutesData = [];
let allEventsData = [];
let currentRouteTransport = 'all';
let currentEventType = 'all';
let activeFilters = new Set(['all']);
let searchQuery = '';
const markers = {};
let map, osmLayer, terrainLayer, boundaryGroup, markerGroup, routeGroup, eventGroup;

const typeColors = (typeof TomuaConfig !== 'undefined') ? TomuaConfig.typeColors : {};
const typeEmoji = (typeof TomuaConfig !== 'undefined') ? TomuaConfig.typeEmoji : {};
const gradients = {
  waterfall: 'linear-gradient(135deg, #0e7490, #155e75)',
  cave: 'linear-gradient(135deg, #57534e, #44403c)',
  historical: 'linear-gradient(135deg, #78716c, #57534e)',
  spiritual: 'linear-gradient(135deg, #9f1239, #881337)'
};

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getTypeLabel(type) {
  return (typeof I18nNew !== 'undefined') ? I18nNew.getCommon(`type.${type}`, type) : type;
}

function getLang() {
  return (typeof I18nNew !== 'undefined') ? I18nNew.getLang() : 'vi';
}

// === MAP INIT ===
function initMap() {
  if (typeof L === 'undefined') return;
  const center = (typeof TomuaConfig !== 'undefined' && TomuaConfig.mapCenter) ? TomuaConfig.mapCenter : [20.844, 104.825];
  map = L.map('map', { zoomControl: false }).setView(center, 12);
  L.control.zoom({ position: 'topright' }).addTo(map);

  osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(map);
  terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: '© OpenTopoMap' });

  boundaryGroup = L.layerGroup().addTo(map);
  markerGroup = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    iconCreateFunction: function(cluster) {
      const count = cluster.getChildCount();
      let size = 'small';
      if (count >= 10) size = 'medium';
      if (count >= 20) size = 'large';
      return L.divIcon({
        html: '<div style="background:var(--accent,#2d6a4f);color:#fff;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);">' + count + '</div>',
        className: 'marker-cluster marker-cluster-' + size,
        iconSize: [40, 40]
      });
    }
  }).addTo(map);
  routeGroup = L.layerGroup().addTo(map);
  eventGroup = L.layerGroup().addTo(map);

  const geoFiles = (typeof TomuaConfig !== 'undefined' && TomuaConfig.geoFiles) ? TomuaConfig.geoFiles : [];
  geoFiles.forEach(({ file, name, color }) => {
    fetch(file).then(r => r.json()).then(data => {
      L.geoJSON(data, { style: { color, weight: 2.5, opacity: 0.8, fillColor: color, fillOpacity: 0.06, dashArray: '6 4' } })
        .bindTooltip(name, { permanent: false, direction: 'center', className: 'commune-label' }).addTo(boundaryGroup);
    }).catch(() => {});
  });

  const mergedFile = (typeof TomuaConfig !== 'undefined' && TomuaConfig.mergedBoundary) ? TomuaConfig.mergedBoundary : 'Tô Múa (phường xã) - 34.geojson';
  fetch(mergedFile).then(r => r.json()).then(data => {
    L.geoJSON(data, { style: { color: '#1b4332', weight: 3.5, opacity: 1, fillColor: '#1b4332', fillOpacity: 0.03 } }).addTo(boundaryGroup);
  }).catch(() => {});

  setTimeout(() => map.invalidateSize(), 100);
}

// === DESTINATIONS ===
async function loadDestinations() {
  try {
    markerGroup.clearLayers();
    Object.keys(markers).forEach(key => delete markers[key]);

    const response = await fetch('/api/destinations?status=published');
    const data = await response.json();
    if (data.success) {
      const lang = getLang();
      destinations = data.data.items.map(d => ({
        id: d.id, slug: d.slug,
        name: d.name[lang] || d.name.vi || d.name.en,
        desc: d.description ? (d.description[lang] || d.description.vi || d.description.en || '') : '',
        type: d.type, region: d.region || 'Tô Múa',
        lat: d.lat || 0, lng: d.lng || 0
      }));

      // Update total count
      const totalEl = document.getElementById('totalCount');
      if (totalEl) totalEl.textContent = `${destinations.length} điểm du lịch`;

      destinations.forEach(d => {
        const icon = L.divIcon({
          html: `<div style="background:${typeColors[d.type] || '#666'};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">${typeEmoji[d.type] || '📍'}</div>`,
          className: '', iconSize: [36, 36], iconAnchor: [18, 18]
        });
        const marker = L.marker([d.lat, d.lng], { icon }).addTo(markerGroup);
        marker.on('click', () => showInfoPanel(d));
        markers[d.id] = marker;
      });
      renderList();
    }
  } catch (error) { console.error('Error loading destinations:', error); }
}

// === ROUTES ===
function filterRoutes(transport, btn) {
  currentRouteTransport = transport;
  document.querySelectorAll('.route-filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderRoutesOnMap();
}
window.filterRoutes = filterRoutes;

// === EVENTS FILTER ===
function filterEvents(type, btn) {
  currentEventType = type;
  document.querySelectorAll('.event-filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderEventsOnMap();
}
window.filterEvents = filterEvents;

function renderRoutesOnMap() {
  routeGroup.clearLayers();
  const filtered = currentRouteTransport === 'all' ? allRoutesData : allRoutesData.filter(r => r.transport === currentRouteTransport);
  filtered.forEach(route => {
    const transportColors = { walk: '#2d6a4f', bike: '#0e7490', car: '#d97706' };
    const color = transportColors[route.transport] || '#2d6a4f';
    
    // Draw route geometry if available
    if (route.route_geometry) {
      const coords = route.route_geometry.coordinates?.map(c => [c[1], c[0]]) || [];
      if (coords.length > 0) {
        L.polyline(coords, { color, weight: 4, opacity: 0.7, dashArray: '10 6' })
          .bindPopup(`<b>${route.name?.vi || route.name?.en || 'Route'}</b><br>${route.transport || ''}`)
          .on('click', () => showRouteInfoPanel(route))
          .addTo(routeGroup);
      }
    }
    
    // Draw route from stops if available
    if (route.stops && route.stops.length > 0) {
      const stopCoords = route.stops
        .filter(s => s.destination_lat && s.destination_lng)
        .map(s => [s.destination_lat, s.destination_lng]);
      
      // Draw polyline if multiple stops
      if (stopCoords.length > 1) {
        L.polyline(stopCoords, { color, weight: 3, opacity: 0.6, dashArray: '8 4' })
          .bindPopup(`<b>${route.name?.vi || route.name?.en || 'Route'}</b><br>${route.stops.length} điểm dừng`)
          .on('click', () => showRouteInfoPanel(route))
          .addTo(routeGroup);
      }
      
      // Add stop markers with click handler
      route.stops.forEach((stop, i) => {
        if (stop.destination_lat && stop.destination_lng) {
          const stopIcon = L.divIcon({
            html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);">${i + 1}</div>`,
            className: '', iconSize: [24, 24], iconAnchor: [12, 12]
          });
          const stopName = stop.destination_name?.vi || stop.destination_name?.en || 'Điểm dừng';
          L.marker([stop.destination_lat, stop.destination_lng], { icon: stopIcon })
            .bindPopup(`<b>${stopName}</b><br>Điểm dừng ${i + 1} / ${route.name?.vi || 'Lộ trình'}`)
            .on('click', () => showRouteInfoPanel(route))
            .addTo(routeGroup);
        }
      });
    }
  });
}

async function loadRoutes() {
  try {
    const response = await fetch('/api/routes?status=published');
    const data = await response.json();
    if (data.success) { 
      allRoutesData = data.data.items; 
      renderRoutesOnMap();
      // Show route filters only if there are routes
      const routeFilters = document.getElementById('routeFilters');
      if (routeFilters && allRoutesData.length > 0) {
        routeFilters.style.display = 'flex';
      }
    }
  } catch (error) { console.error('Error loading routes:', error); }
}

// === EVENTS ===
function renderEventsOnMap() {
  eventGroup.clearLayers();
  const filtered = currentEventType === 'all' ? allEventsData : allEventsData.filter(e => e.type === currentEventType);
  const lang = getLang();
  const icons = { festival: '🎪', season: '🌿', experience: '⛰️', cultural: '🎭', sport: '🏃', food: '🍜', other: '📌' };
  
  filtered.forEach(event => {
    if (event.lat && event.lng) {
      const icon = L.divIcon({
        html: `<div style="background:#d97706;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${icons[event.type] || '📅'}</div>`,
        className: '', iconSize: [32, 32], iconAnchor: [16, 16]
      });
      const name = event.name?.[lang] || event.name?.vi || event.name?.en || 'Event';
      L.marker([event.lat, event.lng], { icon })
        .bindPopup(`<b>${name}</b><br>${event.type || ''}`)
        .on('click', () => showEventInfoPanel(event))
        .addTo(eventGroup);
    }
  });
}

async function loadEvents() {
  try {
    const response = await fetch('/api/events?status=published');
    const data = await response.json();
    if (data.success) {
      allEventsData = data.data.items;
      renderEventsOnMap();
      // Show event filters only if there are events
      const eventFilters = document.getElementById('eventFilters');
      if (eventFilters && allEventsData.length > 0) {
        eventFilters.style.display = 'flex';
      }
    }
  } catch (error) { console.error('Error loading events:', error); }
}

// === SIDEBAR ===
function renderList() {
  const list = document.getElementById('destList');
  if (!list) return;
  const filtered = destinations.filter(d => {
    const matchType = activeFilters.has('all') || activeFilters.has(d.type);
    const matchSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  list.innerHTML = filtered.map((d, i) => `
    <div class="dest-item" data-id="${d.id}" onclick="focusDest('${d.id}')" style="animation-delay:${i * 40}ms">
      <div class="dest-thumb ${d.type}">${typeEmoji[d.type] || '📍'}</div>
      <div class="dest-info">
        <h4>${escapeHtml(d.name)}</h4>
        <p>${d.desc.substring(0, 80)}...</p>
        <div class="dest-tags">
          <span class="dest-tag">${getTypeLabel(d.type)}</span>
          <span class="dest-tag">${d.region}</span>
        </div>
      </div>
    </div>
  `).join('');

  const countEl = document.getElementById('filteredCount');
  if (countEl) countEl.textContent = `${(typeof I18nNew !== 'undefined') ? I18nNew.get('map.showing', 'Hiển thị') : 'Hiển thị'}: ${filtered.length}`;

  destinations.forEach(d => {
    const show = filtered.includes(d);
    if (markers[d.id]) {
      if (show && !markerGroup.hasLayer(markers[d.id])) markerGroup.addLayer(markers[d.id]);
      if (!show && markerGroup.hasLayer(markers[d.id])) markerGroup.removeLayer(markers[d.id]);
    }
  });
}

function focusDest(id) {
  const d = destinations.find(x => x.id === id);
  if (!d) return;
  map.flyTo([d.lat, d.lng], 15, { duration: 0.8 });
  showInfoPanel(d);
  document.querySelectorAll('.dest-item').forEach(el => el.classList.toggle('active', el.dataset.id === id));
}
window.focusDest = focusDest;

// === INFO PANEL ===
function showInfoPanel(d) {
  const panel = document.getElementById('infoPanel');
  document.getElementById('infoPanelTitle').textContent = d.name;
  document.getElementById('infoPanelImg').style.background = gradients[d.type] || gradients.waterfall;
  document.getElementById('infoPanelType').textContent = `${typeEmoji[d.type]} ${getTypeLabel(d.type)}`;
  document.getElementById('infoPanelDesc').textContent = d.desc;
  document.getElementById('infoPanelCoords').textContent = `${d.lat.toFixed(6)}°N, ${d.lng.toFixed(6)}°E`;
  document.getElementById('infoPanelRegion').textContent = `${d.region} (${(typeof I18nNew !== 'undefined') ? I18nNew.get('map.before_merge', 'trước sáp nhập') : 'trước sáp nhập'})`;
  document.getElementById('infoPanelDir').href = `https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}`;
  document.getElementById('infoPanelDetail').href = `detail.html?slug=${d.slug}`;
  panel.classList.add('visible');
  loadNearbyDestinations(d.lat, d.lng, d.id);
}

function closeInfoPanel() {
  document.getElementById('infoPanel').classList.remove('visible');
}
window.closeInfoPanel = closeInfoPanel;

// === ROUTE INFO PANEL ===
function showRouteInfoPanel(route) {
  const panel = document.getElementById('routeInfoPanel');
  const lang = getLang();
  
  document.getElementById('routeInfoPanelTitle').textContent = route.name?.[lang] || route.name?.vi || 'Lộ trình';
  
  const transportLabels = { walk: '🚶 Đi bộ', bike: '🏍️ Xe máy', car: '🚗 Ô tô', bus: '🚌 Xe buýt' };
  document.getElementById('routeInfoPanelTransport').textContent = transportLabels[route.transport] || route.transport;
  
  document.getElementById('routeInfoPanelDesc').textContent = route.description?.[lang] || route.description?.vi || 'Không có mô tả';
  
  const difficultyLabels = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
  document.getElementById('routeInfoPanelDifficulty').textContent = difficultyLabels[route.difficulty] || route.difficulty;
  
  const durationLabels = { half_day: 'Nửa ngày', full_day: 'Cả ngày', two_day: 'Hai ngày', custom: 'Tùy chỉnh' };
  document.getElementById('routeInfoPanelDuration').textContent = durationLabels[route.duration] || route.duration;
  
  document.getElementById('routeInfoPanelDistance').textContent = route.distance_km ? `${route.distance_km} km` : 'Chưa xác định';
  
  // Show stops
  const stopsContainer = document.getElementById('routeInfoPanelStops');
  if (route.stops && route.stops.length > 0) {
    stopsContainer.innerHTML = route.stops.map((stop, i) => {
      const stopName = stop.destination_name?.[lang] || stop.destination_name?.vi || 'Điểm dừng';
      return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;">
        <span style="background:#2d6a4f;color:#fff;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;">${i + 1}</span>
        <span>${stopName}</span>
      </div>`;
    }).join('');
  } else {
    stopsContainer.innerHTML = '<p style="font-size:13px;color:var(--muted);">Chưa có điểm dừng</p>';
  }
  
  // Google Maps link for first stop
  if (route.stops && route.stops.length > 0 && route.stops[0].destination_lat) {
    document.getElementById('routeInfoPanelDir').href = `https://www.google.com/maps/dir/?api=1&destination=${route.stops[0].destination_lat},${route.stops[0].destination_lng}`;
  }
  
  panel.classList.add('visible');
}

function closeRouteInfoPanel() {
  document.getElementById('routeInfoPanel').classList.remove('visible');
}
window.closeRouteInfoPanel = closeRouteInfoPanel;

// === EVENT INFO PANEL ===
function showEventInfoPanel(event) {
  const panel = document.getElementById('eventInfoPanel');
  const lang = getLang();
  
  document.getElementById('eventInfoPanelTitle').textContent = event.name?.[lang] || event.name?.vi || 'Sự kiện';
  
  const typeLabels = { festival: '🎪 Lễ hội', season: '🌿 Theo mùa', experience: '⛰️ Trải nghiệm', cultural: '🎭 Văn hóa', sport: '🏃 Thể thao', food: '🍜 Ẩm thực', other: '📌 Khác' };
  document.getElementById('eventInfoPanelType').textContent = typeLabels[event.type] || event.type;
  
  document.getElementById('eventInfoPanelDesc').textContent = event.description?.[lang] || event.description?.vi || 'Không có mô tả';
  
  // Format dates
  const startDate = event.start_date ? new Date(event.start_date).toLocaleDateString('vi-VN') : '';
  const endDate = event.end_date ? new Date(event.end_date).toLocaleDateString('vi-VN') : '';
  const dateStr = startDate && endDate ? `${startDate} - ${endDate}` : startDate || 'Chưa xác định';
  document.getElementById('eventInfoPanelDate').textContent = dateStr;
  
  document.getElementById('eventInfoPanelLocation').textContent = event.address?.[lang] || event.address?.vi || 'Xã Tô Múa';
  
  // Google Maps link
  if (event.lat && event.lng) {
    document.getElementById('eventInfoPanelDir').href = `https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`;
  }
  
  panel.classList.add('visible');
}

function closeEventInfoPanel() {
  document.getElementById('eventInfoPanel').classList.remove('visible');
}
window.closeEventInfoPanel = closeEventInfoPanel;

async function loadNearbyDestinations(lat, lng, currentId) {
  const section = document.getElementById('nearbySection');
  const list = document.getElementById('nearbyList');
  try {
    const response = await fetch(`/api/destinations/nearby?lat=${lat}&lng=${lng}&radius=10000`);
    const data = await response.json();
    if (data.success && data.data.length > 0) {
      const lang = getLang();
      const nearby = data.data.filter(d => d.id !== currentId).slice(0, 5);
      if (nearby.length > 0) {
        section.style.display = 'block';
        list.innerHTML = nearby.map(d => {
          const name = d.name?.[lang] || d.name?.vi || d.name?.en || 'Unknown';
          const dist = d.distance ? (d.distance < 1000 ? `${Math.round(d.distance)}m` : `${(d.distance / 1000).toFixed(1)}km`) : '';
          return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="focusDest('${d.id}')">
            <span style="font-size:16px;">${typeEmoji[d.type] || '📍'}</span>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
              <div style="font-size:11px;color:var(--muted);">${dist}</div>
            </div>
          </div>`;
        }).join('');
      } else { section.style.display = 'none'; }
    } else { section.style.display = 'none'; }
  } catch (error) { section.style.display = 'none'; }
}

// === LAYERS ===
function toggleLayer(btn, layer) {
  btn.classList.toggle('active');
  const on = btn.classList.contains('active');
  if (layer === 'boundaries') { if (on) boundaryGroup.addTo(map); else map.removeLayer(boundaryGroup); }
  else if (layer === 'markers') { if (on) markerGroup.addTo(map); else map.removeLayer(markerGroup); }
  else if (layer === 'routes') { if (on) routeGroup.addTo(map); else map.removeLayer(routeGroup); }
  else if (layer === 'events') { if (on) eventGroup.addTo(map); else map.removeLayer(eventGroup); }
  else if (layer === 'terrain') { if (on) { terrainLayer.addTo(map); map.removeLayer(osmLayer); } else { osmLayer.addTo(map); map.removeLayer(terrainLayer); } }
}
window.toggleLayer = toggleLayer;

// === INIT ===
function initMapPage() {
  document.body.classList.add('page-fade-in');
  initMap();

  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const type = chip.dataset.type;
      if (type === 'all') {
        activeFilters.clear(); activeFilters.add('all');
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      } else {
        activeFilters.delete('all');
        document.querySelector('.filter-chip[data-type="all"]')?.classList.remove('active');
        chip.classList.toggle('active');
        if (chip.classList.contains('active')) activeFilters.add(type); else activeFilters.delete(type);
        if (activeFilters.size === 0) { activeFilters.add('all'); document.querySelector('.filter-chip[data-type="all"]')?.classList.add('active'); }
      }
      renderList();
    });
  });

  const searchBox = document.getElementById('searchBox');
  if (searchBox) searchBox.addEventListener('input', e => { searchQuery = e.target.value; renderList(); });

  // Geolocation request function
  function requestGeolocation(btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳';
    
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      map.flyTo([lat, lng], 15);
      L.circleMarker([lat, lng], { radius: 8, color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.5 })
        .addTo(map)
        .bindPopup('📍 Vị trí của bạn')
        .openPopup();
      btn.disabled = false;
      btn.innerHTML = '📍';
    }, err => {
      let msg = 'Không thể xác định vị trí.';
      if (err.code === 1) {
        msg = 'Quyền truy cập vị trí bị từ chối.\n\nĐể bật định vị:\n1. Nhấp vào biểu tượng khóa trên thanh địa chỉ\n2. Chọn "Cho phép" cho Vị trí\n3. Tải lại trang';
      } else if (err.code === 2) {
        msg = 'Không thể xác định vị trí. Vui lòng kiểm tra kết nối mạng và thử lại.';
      } else if (err.code === 3) {
        msg = 'Hết thời gian chờ định vị. Vui lòng thử lại.';
      }
      alert(msg);
      btn.disabled = false;
      btn.innerHTML = '📍';
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  }

  const gpsBtn = document.getElementById('gpsBtn');
  if (gpsBtn) gpsBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị.');
      return;
    }
    
    // Check if permissions policy allows geolocation
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        if (permissionStatus.state === 'denied') {
          alert('Quyền truy cập vị trí đã bị chặn. Vui lòng:\n1. Nhấp vào biểu tượng khóa/thanh địa chỉ\n2. Cho phép truy cập vị trí\n3. Tải lại trang');
          return;
        }
        requestGeolocation(gpsBtn);
      }).catch(() => {
        // Fallback if permissions API not supported
        requestGeolocation(gpsBtn);
      });
    } else {
      requestGeolocation(gpsBtn);
    }
  });

  if (typeof I18nNew !== 'undefined') {
    I18nNew.init('map').then(() => { loadDestinations(); });
    document.addEventListener('i18n-changed', () => loadDestinations());
  } else { loadDestinations(); }

  loadRoutes();
  loadEvents();
  renderList();
}

initMapPage();
