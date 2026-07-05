import { escapeHtml } from '../utils/helpers.js';

const typeColors = {
  waterfall: '#0e7490', cave: '#78716c', historical: '#57534e',
  spiritual: '#9f1239', other: '#4b5563'
};

const typeEmoji = {
  waterfall: '💧', cave: '🕳️', historical: '🏛️', spiritual: '⛩️', other: '📍'
};

export function renderDestinationCard(destination, options = {}) {
  const { showActions = false, onClick = null } = options;
  const d = destination;
  const name = escapeHtml(d.name?.vi || d.name?.en || 'Unknown');
  const desc = escapeHtml(d.description?.vi || d.description?.en || '');
  const color = typeColors[d.type] || typeColors.other;
  const emoji = typeEmoji[d.type] || typeEmoji.other;

  return `
    <div class="dest-card" ${onClick ? `onclick="${onClick}"` : `onclick="location.href='detail.html?slug=${d.slug}'"`}>
      <div class="dest-card-icon" style="background:${color}20;color:${color}">
        ${emoji}
      </div>
      <div class="dest-card-content">
        <div class="dest-card-type">${d.type}</div>
        <h3>${name}</h3>
        <p>${desc.substring(0, 100)}${desc.length > 100 ? '...' : ''}</p>
        ${d.region ? `<div class="dest-card-region">📍 ${escapeHtml(d.region)}</div>` : ''}
      </div>
      ${showActions ? `
        <div class="dest-card-actions">
          <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); editDestination('${d.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteDestination('${d.id}')">🗑️</button>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderDestinationsList(destinations, containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!destinations || destinations.length === 0) {
    container.innerHTML = '<p class="empty-state">Không có điểm đến nào</p>';
    return;
  }

  container.innerHTML = destinations.map(d => renderDestinationCard(d, options)).join('');
}
