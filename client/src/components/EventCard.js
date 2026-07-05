import { escapeHtml, formatDate } from '../utils/helpers.js';

const typeIcons = {
  festival: '🎪', season: '🌿', experience: '⛰️', cultural: '🎭',
  sport: '🏃', food: '🍜', other: '📅'
};

export function renderEventCard(event, options = {}) {
  const { showActions = false } = options;
  const e = event;
  const name = escapeHtml(e.name?.vi || e.name?.en || 'Unknown');
  const desc = escapeHtml(e.description?.vi || e.description?.en || '');
  const icon = typeIcons[e.type] || '📅';
  const startDate = formatDate(e.start_date);
  const endDate = formatDate(e.end_date);

  return `
    <div class="event-card">
      <div class="event-icon">${icon}</div>
      <div class="event-card-content">
        <div class="event-type">${e.type}</div>
        <h3>${name}</h3>
        <p>${desc.substring(0, 100)}${desc.length > 100 ? '...' : ''}</p>
        <div class="event-meta">
          <span>📅 ${startDate}${endDate ? ` — ${endDate}` : ''}</span>
          ${e.location ? `<span>📍 ${escapeHtml(e.location)}</span>` : ''}
        </div>
      </div>
      ${showActions ? `
        <div class="event-card-actions">
          <button class="btn btn-sm btn-outline" onclick="editEvent('${e.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteEvent('${e.id}')">🗑️</button>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderEventsList(events, containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!events || events.length === 0) {
    container.innerHTML = '<p class="empty-state">Không có sự kiện nào</p>';
    return;
  }

  container.innerHTML = events.map(e => renderEventCard(e, options)).join('');
}
