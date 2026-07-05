import { escapeHtml } from '../utils/helpers.js';

const typeColors = {
  waterfall: '#0e7490',
  cave: '#78716c',
  historical: '#57534e',
  spiritual: '#9f1239',
  other: '#4b5563'
};

const typeEmoji = {
  waterfall: '💧',
  cave: '🕳️',
  historical: '🏛️',
  spiritual: '⛩️',
  other: '📍'
};

export class MapComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.center = options.center || [20.844, 104.825];
    this.zoom = options.zoom || 13;
    this.map = null;
    this.markers = [];
    this.routeLines = [];
    this.eventMarkers = [];

    this.init();
  }

  init() {
    if (typeof L === 'undefined') {
      console.error('Leaflet not loaded');
      return;
    }

    this.map = L.map(this.containerId, {
      zoomControl: false,
      attributionControl: false
    }).setView(this.center, this.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
  }

  addMarkers(destinations) {
    this.clearMarkers();

    destinations.forEach(d => {
      if (!d.lat || !d.lng) return;

      const color = typeColors[d.type] || typeColors.other;
      const emoji = typeEmoji[d.type] || typeEmoji.other;

      const icon = L.divIcon({
        html: `<div style="background:${color};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;">${emoji}</div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([d.lat, d.lng], { icon })
        .bindPopup(`
          <div style="min-width:150px;">
            <strong>${escapeHtml(d.name?.vi || d.name?.en)}</strong><br>
            <small>${d.type} · ${d.region || 'Tô Múa'}</small><br>
            <a href="detail.html?slug=${d.slug}" style="color:#2d6a4f;font-size:12px;">Xem chi tiết →</a>
          </div>
        `)
        .addTo(this.map);

      this.markers.push(marker);
    });
  }

  addRouteLine(stops, color = '#2d6a4f') {
    if (!stops || stops.length < 2) return;

    const coords = stops
      .filter(s => s.lat && s.lng)
      .map(s => [s.lat, s.lng]);

    if (coords.length < 2) return;

    const line = L.polyline(coords, {
      color,
      weight: 4,
      opacity: 0.7,
      dashArray: '10 6'
    }).addTo(this.map);

    this.routeLines.push(line);
    return line;
  }

  addEventMarker(event) {
    if (!event.lat || !event.lng) return;

    const icon = L.divIcon({
      html: `<div style="background:#d97706;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">📅</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([event.lat, event.lng], { icon })
      .bindPopup(`<b>${escapeHtml(event.name?.vi || event.name?.en)}</b><br>${event.type || ''}`)
      .addTo(this.map);

    this.eventMarkers.push(marker);
    return marker;
  }

  clearMarkers() {
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
  }

  clearRoutes() {
    this.routeLines.forEach(l => this.map.removeLayer(l));
    this.routeLines = [];
  }

  clearEvents() {
    this.eventMarkers.forEach(m => this.map.removeLayer(m));
    this.eventMarkers = [];
  }

  clearAll() {
    this.clearMarkers();
    this.clearRoutes();
    this.clearEvents();
  }

  flyTo(lat, lng, zoom = 15) {
    this.map.flyTo([lat, lng], zoom, { duration: 0.8 });
  }

  fitBounds(bounds) {
    this.map.fitBounds(bounds, { padding: [50, 50] });
  }

  invalidateSize() {
    if (this.map) this.map.invalidateSize();
  }
}

export { typeColors, typeEmoji };
