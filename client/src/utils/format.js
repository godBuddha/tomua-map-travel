// Format date to Vietnamese format
export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const defaultOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return date.toLocaleDateString('vi-VN', { ...defaultOptions, ...options });
}

// Format datetime
export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Format relative time
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return formatDate(dateStr);
}

// Format distance
export function formatDistance(km) {
  if (!km) return '';
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

// Format time in minutes
export function formatTime(minutes) {
  if (!minutes) return '';
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h}h${m}ph` : `${h}h`;
  }
  return `${Math.round(minutes)}ph`;
}

// Format number with separator
export function formatNumber(num) {
  if (num == null) return '0';
  return num.toLocaleString('vi-VN');
}

// Format file size
export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
