// Security: HTML escape to prevent XSS
export function escapeHtml(text) {
  if (text == null) return '';
  const str = String(text);
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
  return str.replace(/[&<>"'/]/g, c => map[c]);
}

// Format date
export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Format distance
export function formatDistance(km) {
  if (!km) return '';
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

// Format time
export function formatTime(minutes) {
  if (!minutes) return '';
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h}h${m}ph` : `${h}h`;
  }
  return `${Math.round(minutes)}ph`;
}

// Debounce
export function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
