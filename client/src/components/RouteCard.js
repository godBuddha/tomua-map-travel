import { escapeHtml, formatDistance, formatTime } from '../utils/helpers.js';

const transportIcons = { walk: '🚶', bike: '🏍️', car: '🚗', bus: '🚌' };
const difficultyLabels = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
const durationLabels = { half_day: 'Nửa ngày', full_day: '1 ngày', two_day: '2 ngày', custom: 'Tùy chỉnh' };

export function renderRouteCard(route, options = {}) {
  const { showActions = false } = options;
  const r = route;
  const name = escapeHtml(r.name?.vi || r.name?.en || 'Unknown');
  const desc = escapeHtml(r.description?.vi || r.description?.en || '');
  const transport = transportIcons[r.transport] || '🚗';
  const difficulty = difficultyLabels[r.difficulty] || r.difficulty;
  const duration = durationLabels[r.duration] || r.duration;
  const stops = r.stops || [];

  return `
    <div class="route-card">
      <div class="route-header">
        <h3>${name}</h3>
        <span class="route-transport">${transport}</span>
      </div>
      <p>${desc.substring(0, 100)}${desc.length > 100 ? '...' : ''}</p>
      <div class="route-meta">
        <span>🎯 ${difficulty}</span>
        <span>⏱️ ${duration}</span>
        ${r.distance_km ? `<span>📏 ${formatDistance(r.distance_km)}</span>` : ''}
        ${r.estimated_time_min ? `<span>⏰ ${formatTime(r.estimated_time_min)}</span>` : ''}
      </div>
      ${stops.length > 0 ? `
        <div class="route-stops">
          ${stops.slice(0, 3).map((s, i) => `
            <span class="route-stop">${escapeHtml(s.destination_name?.vi || s.destination_name?.en || `Stop ${i+1}`)}</span>
            ${i < Math.min(stops.length, 3) - 1 ? '<span class="route-arrow">→</span>' : ''}
          `).join('')}
          ${stops.length > 3 ? `<span class="route-more">+${stops.length - 3} điểm dừng</span>` : ''}
        </div>
      ` : ''}
      ${showActions ? `
        <div class="route-card-actions">
          <button class="btn btn-sm btn-outline" onclick="editRoute('${r.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRoute('${r.id}')">🗑️</button>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderRoutesList(routes, containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!routes || routes.length === 0) {
    container.innerHTML = '<p class="empty-state">Không có lộ trình nào</p>';
    return;
  }

  container.innerHTML = routes.map(r => renderRouteCard(r, options)).join('');
}
