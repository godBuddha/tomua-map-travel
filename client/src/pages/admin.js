// === AUTH CHECK ===
(function checkAuth() {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('tm_role');
  if (!token || role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }
  // Set user info in sidebar
  try {
    const user = JSON.parse(localStorage.getItem('tm_user'));
    if (user) {
      const avatarEl = document.querySelector('.sidebar-user .avatar');
      const nameEl = document.querySelector('.sidebar-user .info strong');
      const roleEl = document.querySelector('.sidebar-user .info span');
      if (avatarEl) avatarEl.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'A';
      if (nameEl) nameEl.textContent = user.name || 'Admin';
      if (roleEl) roleEl.textContent = 'Administrator';
    }
  } catch (e) {
    /* ignore */
  }
})();

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Configure Leaflet default marker icons (use CDN instead of local files)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// === API HELPER ===
const API_BASE = '/api';
let token = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');

async function apiRequest(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  // Handle token expiration
  if (response.status === 401) {
    const data = await response.json();
    if (data.code === 'TOKEN_EXPIRED' && refreshToken) {
      // Try to refresh token
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        headers['Authorization'] = `Bearer ${token}`;
        const retryResponse = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        return retryResponse.json();
      }
    }
    // If refresh failed or no refresh token, redirect to login
    localStorage.clear();
    window.location.href = 'login.html';
    return { success: false, message: 'Session expired' };
  }

  // Handle 204 No Content (successful delete)
  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
}

async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        token = data.data.accessToken;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

// === LOAD DASHBOARD DATA ===
async function loadDashboard() {
  try {
    // Load stats from API
    const statsResult = await apiRequest('/stats');
    if (statsResult.success) {
      const stats = statsResult.data;
      document.querySelector('.stat-val').textContent = stats.destinations;
      document.querySelectorAll('.stat-val')[1].textContent = '12';
      document.querySelectorAll('.stat-val')[2].textContent = stats.users;
      document.querySelectorAll('.stat-val')[3].textContent = stats.events || 0;

      // Pending review count (destinations + routes + events)
      const pendingTotal = (stats.pending || 0) + (stats.pendingRoutes || 0) + (stats.pendingEvents || 0);
      const pendingEl = document.getElementById('pendingReviewCount');
      if (pendingEl) pendingEl.textContent = pendingTotal;
    }

    // Load upcoming events count
    try {
      const upcomingResult = await apiRequest('/events/upcoming?limit=100');
      if (upcomingResult.success) {
        document.querySelectorAll('.stat-val')[3].textContent = upcomingResult.data.length;
      }
    } catch (e) {
      // Keep the total events count if upcoming fails
    }

    // Load recent destinations for table
    const recentDest = await apiRequest('/destinations?limit=5&sort=created_at&order=desc');
    if (recentDest.success) {
      const tbody = document.querySelector('#view-dashboard .panel-body tbody');
      if (tbody) {
        tbody.innerHTML = recentDest.data.items
          .map(d => {
            const lat = d.lat || 0;
            const lng = d.lng || 0;
            const name = escapeHtml(d.name.vi || d.name.en);
            const typeLabels = {
              waterfall: I18nNew.getCommon('type.waterfall', 'Thác nước'),
              cave: I18nNew.getCommon('type.cave', 'Hang động'),
              historical: I18nNew.getCommon('type.historical', 'Di tích lịch sử'),
              spiritual: I18nNew.getCommon('type.spiritual', 'Tâm linh')
            };
            const typeColors = TomuaConfig.typeColors;
            const statusLabels = {
              draft: I18nNew.getCommon('status.draft', 'Bản nháp'),
              pending: I18nNew.getCommon('status.pending', 'Chờ duyệt'),
              published: I18nNew.getCommon('status.published', 'Đã xuất bản'),
              archived: I18nNew.getCommon('status.archived', 'Lưu trữ')
            };
            const statusClasses = {
              draft: 'badge-gray',
              pending: 'badge-amber',
              published: 'badge-green',
              archived: 'badge-gray'
            };

            return `<tr>
                <td><div class="dest-name">${d.image_url ? `<img src="${d.image_url}" style="width:32px;height:32px;border-radius:6px;object-fit:cover;flex-shrink:0;">` : `<div class="dest-dot" style="background:${typeColors[d.type] || '#666'};"></div>`}${name}</div></td>
                <td><span class="badge badge-blue">${typeLabels[d.type] || d.type}</span></td>
                <td><span class="badge ${statusClasses[d.status] || 'badge-gray'}">${statusLabels[d.status] || d.status}</span></td>
              </tr>`;
          })
          .join('');
      }
    }

    // Load online users for dashboard
    const onlineResult = await apiRequest('/users/online');
    if (onlineResult.success) {
      const usersContainer = document.getElementById('dashboardUsers');
      if (usersContainer) {
        const avatarColors = ['var(--accent)', '#0e7490', '#d97706', '#78716c', '#6366f1'];
        if (onlineResult.data.length === 0) {
          usersContainer.innerHTML =
            '<p style="color:var(--muted);font-size:14px;padding:16px;">Không có người dùng nào đang online</p>';
        } else {
          usersContainer.innerHTML = onlineResult.data
            .map((u, i) => {
              const initial = u.name ? u.name.charAt(0).toUpperCase() : '?';
              const roleLabels = {
                admin: I18nNew.get('role.admin', 'Quản trị viên'),
                collaborator: I18nNew.get('role.collaborator', 'Cộng tác viên')
              };
              const avatarColor = avatarColors[i % avatarColors.length];

              return `<div class="user-card">
                  <div class="user-avatar" style="background:${avatarColor};">${initial}</div>
                  <div class="user-info"><h4>${escapeHtml(u.name)}</h4><p>${u.username} · ${roleLabels[u.role] || u.role}</p></div>
                  <span class="badge badge-green">Online</span>
                </div>`;
            })
            .join('');
        }
      }
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// Heartbeat to keep user online
async function sendHeartbeat() {
  try {
    await fetch('/api/heartbeat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    });
  } catch (e) {
    /* ignore */
  }
}

// Send heartbeat every 2 minutes
setInterval(sendHeartbeat, 120000);
sendHeartbeat(); // Send immediately

// === LOAD DESTINATIONS LIST ===
async function loadDestinationsList() {
  try {
    const result = await apiRequest('/destinations?limit=50');
    if (result.success) {
      const tbody = document.getElementById('destTable');
      if (tbody) {
        tbody.innerHTML = result.data.items
          .map(d => {
            const lat = d.lat || 0;
            const lng = d.lng || 0;
            const name = escapeHtml(d.name.vi || d.name.en);
            const typeLabels = {
              waterfall: I18nNew.getCommon('type.waterfall', 'Thác nước'),
              cave: I18nNew.getCommon('type.cave', 'Hang động'),
              historical: I18nNew.getCommon('type.historical', 'Di tích lịch sử'),
              spiritual: I18nNew.getCommon('type.spiritual', 'Tâm linh')
            };
            const typeColors = TomuaConfig.typeColors;
            const statusLabels = {
              draft: I18nNew.getCommon('status.draft', 'Bản nháp'),
              pending: I18nNew.getCommon('status.pending', 'Chờ duyệt'),
              pending_edit: 'Chờ duyệt sửa',
              pending_delete: 'Chờ duyệt xóa',
              published: I18nNew.getCommon('status.published', 'Đã xuất bản'),
              archived: I18nNew.getCommon('status.archived', 'Lưu trữ')
            };
            const statusClasses = {
              draft: 'badge-gray',
              pending: 'badge-amber',
              pending_edit: 'badge-amber',
              pending_delete: 'badge-red',
              published: 'badge-green',
              archived: 'badge-gray'
            };

            return `<tr>
                <td><div class="dest-name">${d.image_url ? `<img src="${d.image_url}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;flex-shrink:0;">` : `<div class="dest-dot" style="background:${typeColors[d.type] || '#666'};"></div>`}${name}</div></td>
                <td><span class="badge badge-blue">${typeLabels[d.type] || d.type}</span></td>
                <td>${d.region || 'Tô Múa'}</td>
                <td style="font-family:ui-monospace,monospace;font-size:12px;color:var(--muted);">${lat.toFixed(4)}, ${lng.toFixed(4)}</td>
                <td>
                  <span class="badge ${statusClasses[d.status] || 'badge-gray'}">${statusLabels[d.status] || d.status}</span>
                  ${d.rejection_reason ? `<div style="font-size:11px;color:var(--danger);margin-top:4px;max-width:200px;word-break:break-word;">❌ ${escapeHtml(d.rejection_reason)}</div>` : ''}
                </td>
                <td><div class="actions">
                  <button class="btn-icon" title="Sửa" onclick="editDestination('${d.id}')">✏️</button>
                  <button class="btn-icon" title="Xem" onclick="window.open('detail.html?slug=${d.slug}', '_blank')">👁️</button>
                  ${d.status === 'pending' || d.status === 'pending_edit' ? `<button class="btn-icon" title="Duyệt" onclick="approveDestination('${d.id}')" style="color:var(--success);">✅</button><button class="btn-icon" title="Từ chối" onclick="rejectDestination('${d.id}')" style="color:var(--danger);">❌</button>` : ''}
                  ${d.status === 'pending_delete' ? `<button class="btn-icon" title="Duyệt xóa" onclick="approveDeleteDestination('${d.id}')" style="color:var(--success);">✅</button><button class="btn-icon" title="Từ chối xóa" onclick="rejectDestination('${d.id}')" style="color:var(--danger);">❌</button>` : ''}
                  ${d.status !== 'pending_delete' ? `<button class="btn-icon" title="Xóa" onclick="deleteDestination('${d.id}')">🗑️</button>` : ''}
                </div></td>
              </tr>`;
          })
          .join('');
      }
    }
  } catch (error) {
    console.error('Error loading destinations:', error);
  }
}

// === LOAD USERS LIST ===
// Users pagination
let usersOffset = 0;
const usersLimit = 10;
let usersTotal = 0;

async function loadUsersList(append = false) {
  try {
    if (!append) usersOffset = 0;
    const sortSelect = document.getElementById('userSort');
    const [sort, order] = (sortSelect?.value || 'created_at:desc').split(':');
    const result = await apiRequest(`/users?limit=${usersLimit}&offset=${usersOffset}&sort=${sort}&order=${order}`);
    if (result.success) {
      const tbody = document.getElementById('usersTable');
      usersTotal = result.data.length || 0;

      if (tbody) {
        const html = result.data
          .map(u => {
            const roleLabels = {
              admin: I18nNew.get('role.admin', 'Quản trị viên'),
              collaborator: I18nNew.get('role.collaborator', 'Cộng tác viên')
            };
            const roleClasses = { admin: 'badge-purple', collaborator: 'badge-blue' };
            const statusLabels = { active: 'Hoạt động', inactive: 'Vô hiệu' };
            const statusClasses = { active: 'badge-green', inactive: 'badge-gray' };

            return `<tr>
                <td><div class="dest-name"><div class="dest-dot" style="background:var(--accent);"></div>${escapeHtml(u.name)}</div></td>
                <td>${u.username || '—'}</td>
                <td><span class="badge ${roleClasses[u.role] || 'badge-gray'}">${roleLabels[u.role] || u.role}</span></td>
                <td><span class="badge ${statusClasses[u.status] || 'badge-gray'}">${statusLabels[u.status] || u.status}</span></td>
                <td><div class="actions">
                  <button class="btn-icon" title="Sửa" onclick="openUserModal('${u.id}')">✏️</button>
                  <button class="btn-icon" title="Xóa" onclick="deleteUser('${u.id}')">🗑️</button>
                </div></td>
              </tr>`;
          })
          .join('');

        if (append) {
          tbody.innerHTML += html;
        } else {
          tbody.innerHTML = html;
        }

        // Update load more button
        const loadMoreBtn = document.getElementById('usersLoadMore');
        if (loadMoreBtn) {
          loadMoreBtn.style.display = result.data.length >= usersLimit ? 'block' : 'none';
        }

        usersOffset += result.data.length;
      }
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

// === VIEW SWITCHING ===
function showView(viewId, linkEl) {
  if (event) event.preventDefault();
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  const view = document.getElementById('view-' + viewId);
  if (view) view.classList.add('active');
  if (linkEl) linkEl.classList.add('active');

  const titles = {
    dashboard: I18nNew.get('admin.dashboard', 'Bảng điều khiển'),
    destinations: I18nNew.get('admin.destinations', 'Quản lý điểm du lịch'),
    tours: I18nNew.get('admin.tours', 'Lộ trình / Tour'),
    events: I18nNew.get('admin.events', 'Sự kiện / Lễ hội'),
    users: I18nNew.get('admin.users', 'Quản lý người dùng'),
    content: I18nNew.get('admin.content', 'Quản lý nội dung'),
    languages: I18nNew.get('admin.languages', 'Quản lý ngôn ngữ'),
    settings: I18nNew.get('admin.settings', 'Cài đặt')
  };
  document.getElementById('pageTitle').textContent = titles[viewId] || 'Quản trị';

  if (viewId === 'dashboard') setTimeout(initDashboardMap, 100);
}

// === SETTINGS ===
async function loadSettings() {
  try {
    const result = await apiRequest('/settings');
    if (result.success && result.data) {
      const s = result.data;
      if (s.siteName) document.getElementById('settingsSiteName').value = s.siteName;
      if (s.defaultLanguage) document.getElementById('settingsDefaultLang').value = s.defaultLanguage;
      if (s.supportedLanguages) document.getElementById('settingsLanguages').value = s.supportedLanguages;
      if (s.mapCenter) document.getElementById('settingsMapCenter').value = `${s.mapCenter.lat}, ${s.mapCenter.lng}`;
      if (s.description) document.getElementById('settingsDescription').value = s.description;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveSettings() {
  const siteName = document.getElementById('settingsSiteName').value.trim();
  const defaultLang = document.getElementById('settingsDefaultLang').value;
  const languages = document.getElementById('settingsLanguages').value.trim();
  const mapCenter = document.getElementById('settingsMapCenter').value.trim();
  const description = document.getElementById('settingsDescription').value.trim();

  if (!siteName) return alert('Vui lòng nhập tên website');

  const [lat, lng] = mapCenter.split(',').map(s => parseFloat(s.trim()));

  const settings = [
    { key: 'siteName', value: siteName },
    { key: 'defaultLanguage', value: defaultLang },
    { key: 'supportedLanguages', value: languages },
    { key: 'mapCenter', value: { lat: lat || 20.844, lng: lng || 104.825 } },
    { key: 'description', value: description }
  ];

  try {
    for (const s of settings) {
      await apiRequest(`/settings/${s.key}`, {
        method: 'PUT',
        body: JSON.stringify({ value: s.value })
      });
    }
    alert('Đã lưu cài đặt thành công!');
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

// Load settings on page load
loadSettings();

// === MFA MANAGEMENT ===
let mfaEnabled = false;
let mfaSetupData = null;

async function checkMfaStatus() {
  try {
    const result = await apiRequest('/mfa/status');
    if (result.success) {
      mfaEnabled = result.data.mfa_enabled;
      updateMfaUI();
    }
  } catch (error) {
    console.error('Error checking MFA status:', error);
  }
}

function updateMfaUI() {
  const statusText = document.getElementById('mfaStatusText');
  const toggleBtn = document.getElementById('mfaToggleBtn');
  const setupSection = document.getElementById('mfaSetupSection');
  const backupSection = document.getElementById('mfaBackupSection');

  if (mfaEnabled) {
    statusText.textContent = '✅ Đã bật';
    statusText.style.color = 'var(--success)';
    toggleBtn.textContent = 'Tắt 2FA';
    toggleBtn.className = 'btn btn-danger btn-sm';
    setupSection.style.display = 'none';
    backupSection.style.display = 'block';
  } else {
    statusText.textContent = '❌ Chưa bật';
    statusText.style.color = 'var(--danger)';
    toggleBtn.textContent = 'Bật 2FA';
    toggleBtn.className = 'btn btn-primary btn-sm';
    setupSection.style.display = 'none';
    backupSection.style.display = 'none';
  }
}

async function toggleMfa() {
  if (mfaEnabled) {
    // Disable MFA
    const token = prompt('Nhập mã xác thực từ ứng dụng để tắt 2FA:');
    if (!token) return;

    try {
      const result = await apiRequest('/mfa/disable', {
        method: 'POST',
        body: JSON.stringify({ token })
      });
      if (result.success) {
        mfaEnabled = false;
        updateMfaUI();
        alert('Đã tắt xác thực hai yếu tố');
      } else {
        alert('Lỗi: ' + (result.message || 'Không thể tắt 2FA'));
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  } else {
    // Start MFA setup
    try {
      const result = await apiRequest('/mfa/setup', { method: 'POST' });
      if (result.success) {
        mfaSetupData = result.data;
        showMfaSetup();
      }
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  }
}

function showMfaSetup() {
  document.getElementById('mfaSetupSection').style.display = 'block';
  document.getElementById('mfaSecret').textContent = mfaSetupData.secret;

  // Generate QR code using external API
  const qrDiv = document.getElementById('mfaQrCode');
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaSetupData.otpauthUrl)}`;
  qrDiv.innerHTML = `<img src="${qrUrl}" alt="QR Code" style="max-width:200px;">`;

  // Show backup codes
  const backupDiv = document.getElementById('mfaBackupCodes');
  backupDiv.innerHTML = mfaSetupData.backupCodes
    .map(
      code =>
        `<div style="background:var(--surface); padding:6px 10px; border-radius:6px; font-family:monospace; font-size:13px; text-align:center;">${code}</div>`
    )
    .join('');
}

async function enableMfa() {
  const token = document.getElementById('mfaVerifyToken').value.trim();
  if (!token || token.length !== 6) {
    alert('Vui lòng nhập mã 6 số từ ứng dụng xác thực');
    return;
  }

  try {
    const result = await apiRequest('/mfa/enable', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
    if (result.success) {
      mfaEnabled = true;
      updateMfaUI();
      document.getElementById('mfaBackupSection').style.display = 'block';
      alert('Đã bật xác thực hai yếu tố! Hãy lưu mã dự phòng ở nơi an toàn.');
    } else {
      alert('Lỗi: ' + (result.message || 'Mã xác thực không đúng'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

function cancelMfaSetup() {
  document.getElementById('mfaSetupSection').style.display = 'none';
  document.getElementById('mfaVerifyToken').value = '';
}

async function regenerateBackupCodes() {
  const token = prompt('Nhập mã xác thực từ ứng dụng để tạo mã dự phòng mới:');
  if (!token) return;

  try {
    const result = await apiRequest('/mfa/regenerate-backup-codes', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
    if (result.success) {
      const backupDiv = document.getElementById('mfaBackupCodes');
      backupDiv.innerHTML = result.data.backupCodes
        .map(
          code =>
            `<div style="background:var(--surface); padding:6px 10px; border-radius:6px; font-family:monospace; font-size:13px; text-align:center;">${code}</div>`
        )
        .join('');
      alert('Đã tạo mã dự phòng mới! Hãy lưu ở nơi an toàn.');
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

// Check MFA status on page load
checkMfaStatus();

// === LOGOUT ===
function handleLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tm_user');
  localStorage.removeItem('tm_role');
  sessionStorage.clear();
  window.location.href = 'login.html';
}

// === DASHBOARD MAP ===
let dashMap = null;
let dashMarkers = [];

function initDashboardMap() {
  if (dashMap) {
    dashMap.invalidateSize();
    return;
  }
  dashMap = L.map('admin-map', { zoomControl: false, attributionControl: false }).setView(TomuaConfig.mapCenter, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(dashMap);
  L.control.zoom({ position: 'topright' }).addTo(dashMap);

  // Load boundaries
  [TomuaConfig.geoFiles[0], TomuaConfig.geoFiles[1], TomuaConfig.geoFiles[2]].forEach(({ file, color }) => {
    fetch(file)
      .then(r => r.json())
      .then(data => {
        L.geoJSON(data, {
          style: { color, weight: 2, opacity: 0.7, fillColor: color, fillOpacity: 0.05, dashArray: '4 4' }
        }).addTo(dashMap);
      })
      .catch(() => {});
  });

  fetch(TomuaConfig.mergedBoundary)
    .then(r => r.json())
    .then(data => {
      L.geoJSON(data, { style: { color: '#1b4332', weight: 3, opacity: 1, fillOpacity: 0 } }).addTo(dashMap);
    })
    .catch(() => {});

  // Load markers from API
  loadDashboardMarkers();

  setTimeout(() => dashMap.invalidateSize(), 200);
}

async function loadDashboardMarkers() {
  const typeColors = TomuaConfig.typeColors;
  const typeEmoji = TomuaConfig.typeEmoji;

  try {
    const result = await apiRequest('/destinations?status=published');
    if (result.success) {
      // Clear existing markers
      dashMarkers.forEach(m => dashMap.removeLayer(m));
      dashMarkers = [];

      result.data.items.forEach(d => {
        const lat = d.lat;
        const lng = d.lng;
        if (!lat || !lng) return;

        const name = d.name.vi || d.name.en || 'Unknown';

        const icon = L.divIcon({
          html: `<div style="background:${typeColors[d.type] || '#666'};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;">${typeEmoji[d.type] || '📍'}</div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([lat, lng], { icon }).addTo(dashMap).bindPopup(`
                <div style="min-width:150px;">
                  <strong>${name}</strong><br>
                  <small style="color:#666;">${d.type} · ${d.region || 'Tô Múa'}</small><br>
                  <a href="detail.html?slug=${d.slug}" target="_blank" style="color:#2d6a4f;font-size:12px;">Xem chi tiết →</a>
                </div>
              `);

        dashMarkers.push(marker);
      });
    }
  } catch (error) {
    console.error('Error loading dashboard markers:', error);
  }
}

// === MODAL MAP ===
let modalMap = null;
let tempMarker = null;

function addVisitorNote(icon = '💡', textVi = '', textEn = '') {
  const container = document.getElementById('visitorNotesContainer');
  const div = document.createElement('div');
  div.className = 'visitor-note-item';
  div.innerHTML = `
        <input type="text" class="note-icon-input" value="${icon}" placeholder="Icon" style="width:40px;">
        <input type="text" class="note-text-vi" value="${textVi}" placeholder="Nội dung (VI)">
        <input type="text" class="note-text-en" value="${textEn}" placeholder="Nội dung (EN)">
        <button type="button" class="btn-icon" onclick="this.parentElement.remove()">🗑️</button>
      `;
  container.appendChild(div);
}

function openModal(destId = null) {
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('destId').value = destId || '';
  document.getElementById('modalTitle').textContent = destId ? 'Sửa điểm du lịch' : 'Thêm điểm du lịch mới';

  if (!destId) {
    // Reset form for new destination
    resetLangTabs();
    document.getElementById('destType').value = 'waterfall';
    document.getElementById('destRegion').value = 'Tô Múa';
    document.getElementById('destLat').value = '';
    document.getElementById('destLng').value = '';
    document.getElementById('destColor').value = '#0e7490';
    document.getElementById('destStatus').value = 'draft';
    document.getElementById('destStats').value = '';
    document.getElementById('destInfo').value = '';
    document.getElementById('visitorNotesContainer').innerHTML = '';
    window.destImageUrls = [];
    window.currentDestMetadata = {};
  }

  // Initialize image uploader with current images (multi, max 5)
  setTimeout(() => {
    window.imageUploaders['destImageUploader'] = new ImageUploader({
      containerId: 'destImageUploader',
      category: 'destinations',
      multiple: true,
      maxFiles: 5,
      currentImageUrls: window.destImageUrls || [],
      currentImageUrl: window.destImageUrls && window.destImageUrls.length > 0 ? window.destImageUrls[0] : null,
      onUpload: data => {
        if (data) {
          if (!window.destImageUrls) window.destImageUrls = [];
          if (!window.destImageUrls.includes(data.url)) {
            window.destImageUrls.push(data.url);
          }
        }
      },
      onMultiUpload: dataArray => {
        if (dataArray && dataArray.length > 0) {
          if (!window.destImageUrls) window.destImageUrls = [];
          dataArray.forEach(d => {
            if (!window.destImageUrls.includes(d.url)) {
              window.destImageUrls.push(d.url);
            }
          });
        }
      }
    });
  }, 100);

  // Initialize map after modal is visible
  setTimeout(() => {
    initModalMap();
  }, 300);
}

function initModalMap() {
  const mapContainer = document.getElementById('modalMap');
  if (!mapContainer) return;

  if (modalMap) {
    modalMap.remove();
    modalMap = null;
  }

  modalMap = L.map('modalMap', {
    zoomControl: false,
    attributionControl: false
  }).setView(TomuaConfig.mapCenter, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
  }).addTo(modalMap);

  tempMarker = null;
  modalMap.on('click', function (e) {
    if (tempMarker) modalMap.removeLayer(tempMarker);
    tempMarker = L.marker(e.latlng).addTo(modalMap);
    document.getElementById('destLat').value = e.latlng.lat.toFixed(6);
    document.getElementById('destLng').value = e.latlng.lng.toFixed(6);
  });

  // Restore marker if lat/lng already set
  const lat = parseFloat(document.getElementById('destLat').value);
  const lng = parseFloat(document.getElementById('destLng').value);
  if (!isNaN(lat) && !isNaN(lng)) {
    tempMarker = L.marker([lat, lng]).addTo(modalMap);
    modalMap.setView([lat, lng], 15);
  }

  // Two-way binding: lat/lng input → marker
  let updateTimeout = null;
  const latInput = document.getElementById('destLat');
  const lngInput = document.getElementById('destLng');

  function updateMarkerFromInputs() {
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
    if (tempMarker) modalMap.removeLayer(tempMarker);
    tempMarker = L.marker([lat, lng]).addTo(modalMap);
    modalMap.setView([lat, lng], modalMap.getZoom());
  }

  latInput.addEventListener('input', () => {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(updateMarkerFromInputs, 500);
  });
  lngInput.addEventListener('input', () => {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(updateMarkerFromInputs, 500);
  });

  setTimeout(() => {
    modalMap.invalidateSize();
  }, 200);
}

// GPS定位 function
function locateGPS() {
  const btn = document.getElementById('gpsLocateBtn');
  if (!navigator.geolocation) {
    alert('Trình duyệt không hỗ trợ định vị GPS');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '⏳ Đang định vị...';

  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      document.getElementById('destLat').value = lat.toFixed(6);
      document.getElementById('destLng').value = lng.toFixed(6);

      // Update marker on map
      if (modalMap) {
        if (tempMarker) modalMap.removeLayer(tempMarker);
        tempMarker = L.marker([lat, lng]).addTo(modalMap);
        modalMap.setView([lat, lng], 16);
      }

      btn.disabled = false;
      btn.innerHTML = '📍 GPS';
    },
    error => {
      let msg = 'Không thể định vị: ';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          msg += 'Bạn đã từ chối quyền truy cập vị trí';
          break;
        case error.POSITION_UNAVAILABLE:
          msg += 'Không thể xác định vị trí';
          break;
        case error.TIMEOUT:
          msg += 'Hết thời gian chờ';
          break;
        default:
          msg += error.message;
      }
      alert(msg);
      btn.disabled = false;
      btn.innerHTML = '📍 GPS';
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

document.getElementById('modalOverlay').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// === DESTINATION CRUD ===
async function saveDestination() {
  const id = document.getElementById('destId').value;
  // Save current language before submitting
  destNames[currentLang] = document.getElementById('destNameInput').value;
  destDescs[currentLang] = document.getElementById('destDescInput').value;
  destQuotes[currentLang] = document.getElementById('destQuoteInput').value;

  const nameVi = destNames['vi'] || '';
  const type = document.getElementById('destType').value;
  const region = document.getElementById('destRegion').value.trim();
  const lat = parseFloat(document.getElementById('destLat').value);
  const lng = parseFloat(document.getElementById('destLng').value);
  const color = document.getElementById('destColor').value;
  const status = document.getElementById('destStatus').value;
  const imageUrls = window.destImageUrls || [];
  const imageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

  if (!nameVi || !lat || !lng) {
    alert(I18nNew.get('alert.fill_required', 'Vui lòng điền tên tiếng Việt và chọn vị trí trên bản đồ'));
    return;
  }

  // Parse stats from textarea (format: "Key: Value" per line)
  const statsText = document.getElementById('destStats')?.value.trim() || '';
  const stats = {};
  if (statsText) {
    statsText.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        stats[key.trim()] = valueParts.join(':').trim();
      }
    });
  }

  // Parse info from textarea (format: "Key: Value" per line)
  const infoText = document.getElementById('destInfo')?.value.trim() || '';
  const info = {};
  if (infoText) {
    infoText.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        info[key.trim()] = valueParts.join(':').trim();
      }
    });
  }

  // Parse visitor notes from dynamic UI
  const visitor_notes = [];
  document.querySelectorAll('.visitor-note-item').forEach(item => {
    const icon = item.querySelector('.note-icon-input').value.trim();
    const textVi = item.querySelector('.note-text-vi').value.trim();
    const textEn = item.querySelector('.note-text-en').value.trim();
    if (textVi || textEn) {
      visitor_notes.push({
        icon: icon || '💡',
        text: { vi: textVi, en: textEn || textVi }
      });
    }
  });

  // Clean up old visitor notes from metadata if it exists
  const finalMetadata = window.currentDestMetadata || {};
  if (finalMetadata.visitor_notes) {
    delete finalMetadata.visitor_notes;
  }

  const data = {
    name: destNames,
    type,
    region,
    lat,
    lng,
    description: destDescs,
    quote: destQuotes,
    color,
    status,
    image_url: imageUrl,
    image_urls: imageUrls
  };

  // Only include optional fields if they have values
  if (Object.keys(stats).length > 0) {
    data.stats = { vi: stats, en: stats };
  }
  if (Object.keys(info).length > 0) {
    data.info = { vi: info, en: info };
  }
  if (visitor_notes.length > 0) {
    data.visitor_notes = visitor_notes;
  }

  if (Object.keys(finalMetadata).length > 0) {
    data.metadata = finalMetadata;
  } else if (id) {
    data.metadata = null;
  }

  try {
    let result;
    if (id) {
      // Update existing
      result = await apiRequest(`/destinations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } else {
      // Create new
      result = await apiRequest('/destinations', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    if (result.success) {
      closeModal();
      loadDestinationsList();
      loadDashboard();
      alert(
        id
          ? I18nNew.get('alert.update_success', 'Cập nhật thành công!')
          : I18nNew.get('alert.create_success', 'Tạo mới thành công!')
      );
    } else {
      alert(
        I18nNew.get('alert.error', 'Lỗi: ') + (result.message || I18nNew.get('alert.cannot_save', 'Không thể lưu'))
      );
    }
  } catch (error) {
    alert(I18nNew.get('alert.error', 'Lỗi: ') + error.message);
  }
}

async function editDestination(id) {
  try {
    const result = await apiRequest(`/destinations/${id}`);
    if (result.success) {
      const d = result.data;
      const lat = d.lat || 0;
      const lng = d.lng || 0;

      document.getElementById('destId').value = d.id;
      document.getElementById('destType').value = d.type;
      document.getElementById('destRegion').value = d.region || 'Tô Múa';
      document.getElementById('destLat').value = lat;
      document.getElementById('destLng').value = lng;
      document.getElementById('destColor').value = d.color || '#0e7490';

      // Load multilingual data
      destNames = d.name || {};
      destDescs = d.description || {};
      destQuotes = d.quote || {};
      currentLang = 'vi';
      document.getElementById('destNameInput').value = destNames['vi'] || '';
      document.getElementById('destDescInput').value = destDescs['vi'] || '';
      document.getElementById('destQuoteInput').value = destQuotes['vi'] || '';
      switchLang('vi');

      // Populate stats field
      const stats = d.stats?.vi || d.stats?.en || {};
      const statsText = Object.entries(stats)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      document.getElementById('destStats').value = statsText;

      // Populate info field
      const info = d.info?.vi || d.info?.en || {};
      const infoText = Object.entries(info)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      document.getElementById('destInfo').value = infoText;

      // Load dynamic visitor notes
      const container = document.getElementById('visitorNotesContainer');
      if (container) {
        container.innerHTML = '';
        const notes = d.visitor_notes || d.metadata?.visitor_notes?.vi || [];
        if (Array.isArray(notes)) {
          notes.forEach(note => {
            if (typeof note === 'string') {
              addVisitorNote('💡', note, note); // Legacy string format
            } else if (note && note.text) {
              addVisitorNote(note.icon || '💡', note.text.vi || '', note.text.en || '');
            }
          });
        }
      }

      document.getElementById('destStatus').value = d.status;

      // Set image URLs for editing (support both single and array)
      if (d.image_urls && Array.isArray(d.image_urls)) {
        window.destImageUrls = d.image_urls;
      } else if (d.image_url) {
        window.destImageUrls = [d.image_url];
      } else {
        window.destImageUrls = [];
      }

      // Store existing metadata
      window.currentDestMetadata = d.metadata || {};

      openModal(id);
    }
  } catch (error) {
    alert(I18nNew.get('alert.error', 'Lỗi: ') + error.message);
  }
}

async function approveDestination(id) {
  try {
    const result = await apiRequest(`/destinations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment: 'Approved by admin' })
    });
    if (result.success) {
      loadDestinationsList();
      loadDashboard();
      alert('Đã duyệt thành công!');
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể duyệt'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

async function approveDeleteDestination(id) {
  if (!confirm('Bạn có chắc muốn xóa điểm đến này? Hành động này không thể hoàn tác.')) return;
  try {
    const result = await apiRequest(`/destinations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment: 'Deletion approved by admin' })
    });
    if (result.success) {
      loadDestinationsList();
      loadDashboard();
      alert('Đã duyệt xóa và xóa điểm đến!');
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể duyệt xóa'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

async function rejectDestination(id) {
  const reason = prompt('Lý do từ chối:');
  if (!reason) return;

  try {
    const result = await apiRequest(`/destinations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    if (result.success) {
      loadDestinationsList();
      loadDashboard();
      alert('Đã từ chối!');
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể từ chối'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

async function submitDestinationForReview(id) {
  if (!confirm('Gửi điểm đến này cho admin duyệt?')) return;
  try {
    const result = await apiRequest(`/destinations/${id}/submit-review`, { method: 'POST' });
    if (result.success) {
      loadDestinationsList();
      alert('Đã gửi duyệt thành công!');
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể gửi duyệt'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

async function deleteDestination(id) {
  if (!confirm(I18nNew.get('confirm.delete_dest', 'Bạn có chắc muốn xóa điểm đến này?'))) return;

  try {
    const result = await apiRequest(`/destinations/${id}`, {
      method: 'DELETE'
    });

    if (result.success) {
      loadDestinationsList();
      loadDashboard();
      alert(I18nNew.get('alert.delete_success', 'Xóa thành công!'));
    } else {
      alert(
        I18nNew.get('alert.error', 'Lỗi: ') + (result.message || I18nNew.get('alert.cannot_delete', 'Không thể xóa'))
      );
    }
  } catch (error) {
    alert(I18nNew.get('alert.error', 'Lỗi: ') + error.message);
  }
}

// Init dashboard map
setTimeout(initDashboardMap, 300);

// === LOAD ROUTES ===
// Routes pagination
let routesOffset = 0;
const routesLimit = 10;
let routesTotal = 0;

async function loadRoutes(append = false) {
  try {
    if (!append) routesOffset = 0;
    const sortSelect = document.getElementById('routeSort');
    const [sort, order] = (sortSelect?.value || 'created_at:desc').split(':');
    const result = await apiRequest(`/routes?limit=${routesLimit}&offset=${routesOffset}&sort=${sort}&order=${order}`);
    if (result.success) {
      const routeList = document.getElementById('routeList');
      const routeEmptyState = document.getElementById('routeEmptyState');
      routesTotal = result.data.total || 0;

      if (result.data.items && result.data.items.length > 0) {
        routeEmptyState.style.display = 'none';
        routeList.style.display = 'grid';

        const html = result.data.items
          .map(route => {
            const name = escapeHtml(route.name.vi || route.name.en || 'Unknown');
            const desc = route.description?.vi || route.description?.en || '';
            const transportLabels = { walk: '🚶 Đi bộ', bike: '🏍️ Xe máy', car: '🚗 Ô tô' };
            const difficultyLabels = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
            const statusLabels = {
              draft: 'Bản nháp',
              pending: 'Chờ duyệt',
              pending_edit: 'Chờ duyệt sửa',
              pending_delete: 'Chờ duyệt xóa',
              published: 'Đã xuất bản'
            };
            const statusClasses = {
              draft: 'badge-gray',
              pending: 'badge-amber',
              pending_edit: 'badge-amber',
              pending_delete: 'badge-red',
              published: 'badge-green'
            };

            return `<div class="route-card" style="background:var(--surface);border-radius:var(--radius);padding:20px;border:1px solid var(--border);">
                <h4 style="margin-bottom:8px;">${name}</h4>
                <p style="color:var(--muted);font-size:13px;margin-bottom:12px;">${desc.substring(0, 100)}...</p>
                <div style="display:flex;gap:8px;margin-bottom:12px;">
                  <span class="badge badge-blue">${transportLabels[route.transport] || route.transport}</span>
                  <span class="badge badge-amber">${difficultyLabels[route.difficulty] || route.difficulty}</span>
                  <span class="badge ${statusClasses[route.status] || 'badge-gray'}">${statusLabels[route.status] || route.status}</span>
                </div>
                ${route.rejection_reason ? `<div style="font-size:11px;color:var(--danger);margin-bottom:8px;">❌ ${route.rejection_reason}</div>` : ''}
                <div style="display:flex;gap:8px;">
                  ${route.status !== 'pending_delete' ? `<button class="btn btn-sm btn-outline" onclick="editRoute('${route.id}')">✏️ Sửa</button>` : ''}
                  ${route.status !== 'pending_delete' ? `<button class="btn btn-sm btn-outline" onclick="deleteRoute('${route.id}')" style="color:var(--danger);">🗑️ Xóa</button>` : ''}
                  ${route.status === 'pending' || route.status === 'pending_edit' ? `<button class="btn btn-sm btn-outline" title="Duyệt" onclick="approveRoute('${route.id}')" style="color:var(--success);">✅ Duyệt</button><button class="btn btn-sm btn-outline" title="Từ chối" onclick="rejectRoute('${route.id}')" style="color:var(--danger);">❌ Từ chối</button>` : ''}
                  ${route.status === 'pending_delete' ? `<button class="btn btn-sm btn-outline" title="Duyệt xóa" onclick="approveDeleteRoute('${route.id}')" style="color:var(--success);">✅ Duyệt xóa</button><button class="btn btn-sm btn-outline" title="Từ chối xóa" onclick="rejectRoute('${route.id}')" style="color:var(--danger);">❌ Từ chối</button>` : ''}
                </div>
              </div>`;
          })
          .join('');

        if (append) {
          routeList.innerHTML += html;
        } else {
          routeList.innerHTML = html;
        }

        // Update load more button
        const loadMoreBtn = document.getElementById('routesLoadMore');
        if (loadMoreBtn) {
          loadMoreBtn.style.display = routesOffset + routesLimit < routesTotal ? 'block' : 'none';
        }

        routesOffset += result.data.items.length;
      } else {
        if (!append) {
          routeEmptyState.style.display = 'block';
          routeList.style.display = 'none';
        }
      }
    }
  } catch (error) {
    console.error('Error loading routes:', error);
  }
}

async function editRoute(id) {
  try {
    const result = await apiRequest(`/routes/${id}`);
    if (result.success) {
      const r = result.data;

      editingRouteIdx = id; // Store ID as string
      editingRouteId = id; // For comments

      document.getElementById('routeModalTitle').textContent = 'Sửa lộ trình';
      document.getElementById('routeName').value = r.name?.vi || r.name?.en || '';
      document.getElementById('routeDesc').value = r.description?.vi || r.description?.en || '';
      document.getElementById('routeTransport').value = r.transport || 'bike';
      document.getElementById('routeDuration').value = r.duration || 'full';
      document.getElementById('routeDifficulty').value = r.difficulty || 'medium';
      document.getElementById('routeStatus').value = r.status || 'draft';

      routeStopsData = [];
      if (r.stops && r.stops.length > 0) {
        for (const s of r.stops) {
          const dest = DESTINATIONS.find(d => d.id === s.destination_id);
          if (dest) {
            routeStopsData.push({ ...dest, note: s.description?.vi || '' });
          }
        }
      }

      document.getElementById('routeModalOverlay').classList.add('open');
      renderRouteStops();
      loadRouteComments(id); // Load comments

      setTimeout(() => {
        if (!routeMap) {
          routeMap = L.map('routeMap', { zoomControl: false, attributionControl: false }).setView(
            TomuaConfig.mapCenter,
            12
          );
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(routeMap);
          L.control.zoom({ position: 'topright' }).addTo(routeMap);
        }
        setTimeout(() => {
          routeMap.invalidateSize();
          updateRouteMap();
        }, 150);
      }, 100);
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể tải lộ trình'));
    }
  } catch (error) {
    alert(I18nNew.get('alert.error', 'Lỗi: ') + error.message);
  }
}

// Route Comments
let editingRouteId = null;

async function loadRouteComments(routeId) {
  try {
    const result = await apiRequest(`/routes/${routeId}/comments`);
    const container = document.getElementById('routeCommentsList');
    const section = document.getElementById('routeCommentsSection');

    if (result.success && result.data.length > 0) {
      section.style.display = 'block';
      container.innerHTML = result.data
        .map(
          c => `
            <div style="padding:8px 0; border-bottom:1px solid var(--border); font-size:13px;">
              <strong>${escapeHtml(c.user_name || 'Ẩn danh')}</strong>
              <span style="color:var(--muted); margin-left:8px;">${new Date(c.created_at).toLocaleDateString('vi-VN')}</span>
              <p style="margin:4px 0 0;">${escapeHtml(c.comment)}</p>
            </div>
          `
        )
        .join('');
    } else {
      section.style.display = 'block';
      container.innerHTML = '<p style="color:var(--muted); font-size:13px;">Chưa có bình luận</p>';
    }
  } catch (error) {
    console.error('Error loading route comments:', error);
  }
}

async function addRouteComment() {
  const input = document.getElementById('routeCommentInput');
  const comment = input.value.trim();
  if (!comment || !editingRouteId) return;

  try {
    const result = await apiRequest(`/routes/${editingRouteId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, action: 'comment' })
    });
    if (result.success) {
      input.value = '';
      loadRouteComments(editingRouteId);
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

async function approveRoute(id) {
  try {
    const result = await apiRequest(`/routes/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment: 'Approved by admin' })
    });
    if (result.success) {
      loadRoutes();
      alert('Đã duyệt lộ trình thành công!');
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể duyệt'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

async function approveDeleteRoute(id) {
  if (!confirm('Bạn có chắc muốn xóa lộ trình này? Hành động này không thể hoàn tác.')) return;
  try {
    const result = await apiRequest(`/routes/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment: 'Deletion approved by admin' })
    });
    if (result.success) {
      loadRoutes();
      alert('Đã duyệt xóa lộ trình!');
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể duyệt xóa'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}
window.approveDeleteRoute = approveDeleteRoute;

async function rejectRoute(id) {
  const reason = prompt('Lý do từ chối:');
  if (!reason) return;

  try {
    const result = await apiRequest(`/routes/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    if (result.success) {
      loadRoutes();
      alert('Đã từ chối lộ trình!');
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể từ chối'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

// === LOAD EVENTS ===
// Events pagination
let eventsOffset = 0;
const eventsLimit = 10;
let eventsTotal = 0;

async function loadEvents(append = false) {
  try {
    if (!append) eventsOffset = 0;
    const sortSelect = document.getElementById('eventSort');
    const [sort, order] = (sortSelect?.value || 'created_at:desc').split(':');
    const result = await apiRequest(`/events?limit=${eventsLimit}&offset=${eventsOffset}&sort=${sort}&order=${order}`);
    if (result.success) {
      const tbody = document.getElementById('eventsTableBody');
      eventsTotal = result.data.total || 0;

      if (tbody) {
        const typeIcons = {
          festival: '🎪',
          season: '🌿',
          experience: '⛰️',
          cultural: '🎭',
          sport: '⚽',
          food: '🍜',
          other: '📅'
        };
        const typeLabels = {
          festival: 'Lễ hội',
          season: 'Theo mùa',
          experience: 'Trải nghiệm',
          cultural: 'Văn hóa',
          sport: 'Thể thao',
          food: 'Ẩm thực',
          other: 'Khác'
        };
        const statusLabels = {
          draft: 'Bản nháp',
          pending: 'Chờ duyệt',
          pending_edit: 'Chờ duyệt sửa',
          pending_delete: 'Chờ duyệt xóa',
          published: 'Đã xuất bản',
          archived: 'Lưu trữ'
        };
        const statusClasses = {
          draft: 'badge-gray',
          pending: 'badge-amber',
          pending_edit: 'badge-amber',
          pending_delete: 'badge-red',
          published: 'badge-green',
          archived: 'badge-gray'
        };

        const html = result.data.items
          .map(event => {
            const name = escapeHtml(event.name.vi || event.name.en || 'Unknown');
            const icon = event.icon || typeIcons[event.type] || '📅';
            const location =
              event.lat && event.lng
                ? `${event.lat.toFixed(4)}, ${event.lng.toFixed(4)}`
                : event.address?.vi || event.address?.en || 'Chưa xác định';
            const formatDate = d => {
              if (!d) return '';
              return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            };

            return `<tr>
                <td><div class="dest-name">${event.image_url ? `<img src="${event.image_url}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;flex-shrink:0;">` : `<span style="font-size:20px;margin-right:8px;">${icon}</span>`}<span>${name}</span></div></td>
                <td><span class="badge badge-blue">${typeLabels[event.type] || event.type}</span></td>
                <td><span style="font-size:13px;">${formatDate(event.start_date)} — ${formatDate(event.end_date)}</span></td>
                <td><span style="font-size:13px;">${location}</span></td>
                <td>
                  <span class="badge ${statusClasses[event.status] || 'badge-gray'}">${statusLabels[event.status] || event.status}</span>
                  ${event.rejection_reason ? `<div style="font-size:11px;color:var(--danger);margin-top:4px;">❌ ${event.rejection_reason}</div>` : ''}
                </td>
                <td><div class="actions">
                  ${event.status !== 'pending_delete' ? `<button class="btn-icon" title="Sửa" onclick="editEvent('${event.id}')">✏️</button>` : ''}
                  ${event.status !== 'pending_delete' ? `<button class="btn-icon" title="Xóa" onclick="deleteEvent('${event.id}')">🗑️</button>` : ''}
                  ${event.status === 'pending' || event.status === 'pending_edit' ? `<button class="btn-icon" title="Duyệt" onclick="approveEvent('${event.id}')" style="color:var(--success);">✅</button><button class="btn-icon" title="Từ chối" onclick="rejectEvent('${event.id}')" style="color:var(--danger);">❌</button>` : ''}
                  ${event.status === 'pending_delete' ? `<button class="btn-icon" title="Duyệt xóa" onclick="approveDeleteEvent('${event.id}')" style="color:var(--success);">✅</button><button class="btn-icon" title="Từ chối xóa" onclick="rejectEvent('${event.id}')" style="color:var(--danger);">❌</button>` : ''}
                </div></td>
              </tr>`;
          })
          .join('');

        if (append) {
          tbody.innerHTML += html;
        } else {
          tbody.innerHTML = html;
        }

        // Update load more button
        const loadMoreBtn = document.getElementById('eventsLoadMore');
        if (loadMoreBtn) {
          loadMoreBtn.style.display = eventsOffset + eventsLimit < eventsTotal ? 'block' : 'none';
        }

        eventsOffset += result.data.items.length;
      }
    }
  } catch (error) {
    console.error('Error loading events:', error);
  }
}

async function editEvent(id) {
  try {
    const result = await apiRequest(`/events/${id}`);
    if (result.success) {
      const e = result.data;
      editingEventId = id;
      document.getElementById('eventModalTitle').textContent = 'Chỉnh sửa sự kiện';
      document.getElementById('eventFormError').style.display = 'none';

      document.getElementById('eventName').value = e.name?.vi || e.name?.en || '';
      document.getElementById('eventDesc').value = e.description?.vi || e.description?.en || '';
      document.getElementById('eventType').value = e.type || 'festival';

      if (e.start_date) document.getElementById('eventStartDate').value = e.start_date.substring(0, 10);
      if (e.end_date) document.getElementById('eventEndDate').value = e.end_date.substring(0, 10);

      document.getElementById('eventDestId').value = e.destination_id || '';
      document.getElementById('eventLocation').value =
        e.address?.vi || e.address?.en || (e.lat && e.lng ? `${e.lat.toFixed(4)}, ${e.lng.toFixed(4)}` : '');
      document.getElementById('eventStatus').value = e.status || 'draft';
      selectedEventIcon = e.icon || '🎪';

      // Load event images
      if (e.image_urls && Array.isArray(e.image_urls)) {
        window.eventImageUrls = e.image_urls;
      } else if (e.image_url) {
        window.eventImageUrls = [e.image_url];
      } else {
        window.eventImageUrls = [];
      }

      if (e.recurring && e.recurring !== 'none') {
        document.getElementById('eventRecurring').checked = true;
        document.getElementById('recurrenceOptions').style.display = 'block';
        document.getElementById('eventFrequency').value = e.recurring;
      } else {
        document.getElementById('eventRecurring').checked = false;
        document.getElementById('recurrenceOptions').style.display = 'none';
      }

      document.querySelectorAll('.icon-pick').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.icon === selectedEventIcon);
      });

      updateEventPreview();
      document.getElementById('eventModalOverlay').classList.add('open');

      // Initialize image uploader for events (multi, max 5)
      setTimeout(() => {
        window.imageUploaders['eventImageUploader'] = new ImageUploader({
          containerId: 'eventImageUploader',
          category: 'events',
          multiple: true,
          maxFiles: 5,
          currentImageUrls: window.eventImageUrls || [],
          currentImageUrl: window.eventImageUrls && window.eventImageUrls.length > 0 ? window.eventImageUrls[0] : null,
          onUpload: data => {
            if (data) {
              if (!window.eventImageUrls) window.eventImageUrls = [];
              if (!window.eventImageUrls.includes(data.url)) {
                window.eventImageUrls.push(data.url);
              }
            }
          },
          onMultiUpload: dataArray => {
            if (dataArray && dataArray.length > 0) {
              if (!window.eventImageUrls) window.eventImageUrls = [];
              dataArray.forEach(d => {
                if (!window.eventImageUrls.includes(d.url)) {
                  window.eventImageUrls.push(d.url);
                }
              });
            }
          }
        });
      }, 100);

      loadEventComments(id); // Load comments
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể tải sự kiện'));
    }
  } catch (error) {
    alert(I18nNew.get('alert.error', 'Lỗi: ') + error.message);
  }
}

async function submitEventForReview(id) {
  if (!confirm('Gửi sự kiện này cho admin duyệt?')) return;
  try {
    const result = await apiRequest(`/events/${id}/submit-review`, { method: 'POST' });
    if (result.success) {
      loadEvents();
      alert('Đã gửi duyệt thành công!');
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể gửi duyệt'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

async function deleteEvent(id) {
  if (!confirm('Bạn có chắc muốn xóa sự kiện này?')) return;

  try {
    const result = await apiRequest(`/events/${id}`, { method: 'DELETE' });
    if (result.success) {
      loadEvents();
      alert(I18nNew.get('alert.delete_success', 'Xóa thành công!'));
    } else {
      alert(
        I18nNew.get('alert.error', 'Lỗi: ') + (result.message || I18nNew.get('alert.cannot_delete', 'Không thể xóa'))
      );
    }
  } catch (error) {
    alert(I18nNew.get('alert.error', 'Lỗi: ') + error.message);
  }
}

// Event Comments
async function loadEventComments(eventId) {
  try {
    const result = await apiRequest(`/events/${eventId}/comments`);
    const container = document.getElementById('eventCommentsList');
    const section = document.getElementById('eventCommentsSection');

    if (result.success && result.data.length > 0) {
      section.style.display = 'block';
      container.innerHTML = result.data
        .map(
          c => `
            <div style="padding:8px 0; border-bottom:1px solid var(--border); font-size:13px;">
              <strong>${escapeHtml(c.user_name || 'Ẩn danh')}</strong>
              <span style="color:var(--muted); margin-left:8px;">${new Date(c.created_at).toLocaleDateString('vi-VN')}</span>
              <p style="margin:4px 0 0;">${escapeHtml(c.comment)}</p>
            </div>
          `
        )
        .join('');
    } else {
      section.style.display = 'block';
      container.innerHTML = '<p style="color:var(--muted); font-size:13px;">Chưa có bình luận</p>';
    }
  } catch (error) {
    console.error('Error loading event comments:', error);
  }
}

async function addEventComment() {
  const input = document.getElementById('eventCommentInput');
  const comment = input.value.trim();
  if (!comment || !editingEventId) return;

  try {
    const result = await apiRequest(`/events/${editingEventId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, action: 'comment' })
    });
    if (result.success) {
      input.value = '';
      loadEventComments(editingEventId);
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

async function approveEvent(id) {
  try {
    const result = await apiRequest(`/events/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment: 'Approved by admin' })
    });
    if (result.success) {
      loadEvents();
      alert('Đã duyệt sự kiện thành công!');
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể duyệt'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

async function approveDeleteEvent(id) {
  if (!confirm('Bạn có chắc muốn xóa sự kiện này? Hành động này không thể hoàn tác.')) return;
  try {
    const result = await apiRequest(`/events/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment: 'Deletion approved by admin' })
    });
    if (result.success) {
      loadEvents();
      alert('Đã duyệt xóa sự kiện!');
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể duyệt xóa'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}
window.approveDeleteEvent = approveDeleteEvent;

async function rejectEvent(id) {
  const reason = prompt('Lý do từ chối:');
  if (!reason) return;

  try {
    const result = await apiRequest(`/events/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    if (result.success) {
      loadEvents();
      alert('Đã từ chối sự kiện!');
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể từ chối'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

// Load routes and events on page load
document.addEventListener('DOMContentLoaded', function () {
  loadDashboard();
  loadDestinationsList();
  loadUsersList();
  loadRoutes();
  loadEvents();
});

// === ROUTE BUILDER ===
let DESTINATIONS = [];

// Load destinations for route builder
async function loadRouteDestinations() {
  try {
    const result = await apiRequest('/destinations?status=published');
    if (result.success) {
      DESTINATIONS = result.data.items.map(d => ({
        id: d.id,
        name: d.name.vi || d.name.en,
        lat: d.lat || 0,
        lng: d.lng || 0,
        color: d.color || '#2d6a4f',
        type: d.type,
        area: d.region || 'Tô Múa'
      }));
    }
  } catch (error) {
    console.error('Error loading route destinations:', error);
  }
}

// Load destinations on page load
loadRouteDestinations();

let routeStopsData = [];
let routeMap = null;
let routeSegments = [];
let routeMarkers = [];

const SEGMENT_COLORS = TomuaConfig.segmentColors;
const TRANSPORT_SPEEDS = TomuaConfig.transportSpeeds;
const OSRM_PROFILES = TomuaConfig.osrmProfiles;
const routes = [];
let editingRouteIdx = -1;
let draggedIdx = null;
const osrmRouteCache = {};
let osrmRouteData = null;

function openRouteModal(idx) {
  editingRouteIdx = typeof idx === 'number' ? idx : -1;
  const overlay = document.getElementById('routeModalOverlay');
  overlay.classList.add('open');

  if (editingRouteIdx >= 0 && routes[editingRouteIdx]) {
    const r = routes[editingRouteIdx];
    document.getElementById('routeModalTitle').textContent = 'Sửa lộ trình';
    document.getElementById('routeName').value = r.name?.vi || r.name?.en || r.name || '';
    document.getElementById('routeDesc').value = r.description?.vi || r.description?.en || r.desc || '';
    document.getElementById('routeTransport').value = r.transport;
    document.getElementById('routeDuration').value = r.duration;
    document.getElementById('routeDifficulty').value = r.difficulty;
    document.getElementById('routeStatus').value = r.status;
    routeStopsData = r.stops ? r.stops.map(s => ({ ...s })) : [];
  } else {
    document.getElementById('routeModalTitle').textContent = 'Tạo lộ trình mới';
    document.getElementById('routeName').value = '';
    document.getElementById('routeDesc').value = '';
    document.getElementById('routeTransport').value = 'bike';
    document.getElementById('routeDuration').value = 'full_day';
    document.getElementById('routeDifficulty').value = 'medium';
    document.getElementById('routeStatus').value = 'draft';
    routeStopsData = [];
  }

  renderRouteStops();
  setTimeout(() => {
    if (!routeMap) {
      routeMap = L.map('routeMap', { zoomControl: false, attributionControl: false }).setView(
        TomuaConfig.mapCenter,
        12
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(routeMap);
      L.control.zoom({ position: 'topright' }).addTo(routeMap);
    }
    setTimeout(() => {
      routeMap.invalidateSize();
      updateRouteMap();
    }, 150);
  }, 100);
}

function closeRouteModal() {
  document.getElementById('routeModalOverlay').classList.remove('open');
  document.getElementById('destDropdown').classList.remove('open');
}

function toggleDestDropdown(e) {
  e.stopPropagation();
  const dd = document.getElementById('destDropdown');
  const isOpen = dd.classList.contains('open');
  dd.classList.toggle('open');
  if (!isOpen) renderDestDropdown();
}

function renderDestDropdown() {
  const dd = document.getElementById('destDropdown');
  const usedIds = new Set(routeStopsData.map(s => s.id));
  dd.innerHTML = DESTINATIONS.map(d => {
    const disabled = usedIds.has(d.id);
    return `<div class="rb-dropdown-item${disabled ? ' disabled' : ''}" onclick="${disabled ? '' : `addRouteStop('${d.id}')`}">
          <span class="dest-dot" style="background:${d.color}"></span>
          <span>${d.name}</span>
          <span style="margin-left:auto;font-size:11px;color:var(--muted);">${d.area}</span>
        </div>`;
  }).join('');
}

function addRouteStop(destId) {
  const dest = DESTINATIONS.find(d => d.id === destId);
  if (!dest) return;
  routeStopsData.push({ ...dest, note: '' });
  document.getElementById('destDropdown').classList.remove('open');
  renderRouteStops();
  updateRouteMap();
}

function removeRouteStop(idx) {
  routeStopsData.splice(idx, 1);
  renderRouteStops();
  updateRouteMap();
}

function updateStopNote(idx, val) {
  routeStopsData[idx].note = val;
}

function renderRouteStops() {
  const ul = document.getElementById('routeStops');
  if (routeStopsData.length === 0) {
    ul.innerHTML =
      '<li style="padding:24px;text-align:center;color:var(--muted);font-size:13px;border:2px dashed var(--border);border-radius:10px;">Chưa có điểm đến nào. Nhấn "Thêm điểm đến" bên dưới.</li>';
    document.getElementById('rbStatStops').textContent = '0';
    document.getElementById('rbStatDist').textContent = '—';
    return;
  }
  ul.innerHTML = routeStopsData
    .map((s, i) => {
      const segColor = i < routeStopsData.length - 1 ? SEGMENT_COLORS[i % SEGMENT_COLORS.length] : 'var(--border)';
      let dist = 0;
      let timeMin = 0;
      if (i < routeStopsData.length - 1) {
        if (osrmRouteData && osrmRouteData[i]) {
          dist = osrmRouteData[i].distance;
          timeMin = osrmRouteData[i].duration;
        } else {
          dist = haversine(s.lat, s.lng, routeStopsData[i + 1].lat, routeStopsData[i + 1].lng);
          const speed = TRANSPORT_SPEEDS[document.getElementById('routeTransport').value] || 30;
          timeMin = (dist / speed) * 60;
        }
      }
      const distText = dist > 0 ? formatDist(dist) : '';
      const timeText = timeMin > 0 ? ` · ~${formatTime(timeMin)}` : '';
      const connector =
        i < routeStopsData.length - 1
          ? `<div class="rb-connector" style="--seg-color:${segColor};">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${segColor};flex-shrink:0;"></span>
          <span>${distText}${timeText}</span>
        </div>`
          : '';
      return `<li class="rb-stop" draggable="true" data-idx="${i}"
          ondragstart="onStopDragStart(event,${i})" ondragover="onStopDragOver(event,${i})" ondragleave="onStopDragLeave(event)" ondrop="onStopDrop(event,${i})" ondragend="onStopDragEnd(event)">
          <div class="rb-stop-num">${i + 1}</div>
          <div class="rb-stop-info">
            <div class="rb-stop-name">${s.name}</div>
            <div class="rb-stop-meta">${s.area} · ${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}</div>
            <div class="rb-stop-note"><input type="text" placeholder="Ghi chú cho điểm này (tùy chọn)..." value="${s.note || ''}" oninput="updateStopNote(${i}, this.value)" /></div>
          </div>
          <button class="rb-stop-remove" onclick="removeRouteStop(${i})" title="Xóa">×</button>
        </li>${connector}`;
    })
    .join('');
  document.getElementById('rbStatStops').textContent = routeStopsData.length;
  calcRouteDistance();
}

function renderRouteStopsOnly() {
  const ul = document.getElementById('routeStops');
  if (routeStopsData.length === 0) return;
  ul.innerHTML = routeStopsData
    .map((s, i) => {
      const segColor = i < routeStopsData.length - 1 ? SEGMENT_COLORS[i % SEGMENT_COLORS.length] : 'var(--border)';
      let dist = 0;
      let timeMin = 0;
      if (i < routeStopsData.length - 1) {
        if (osrmRouteData && osrmRouteData[i]) {
          dist = osrmRouteData[i].distance;
          timeMin = osrmRouteData[i].duration;
        } else {
          dist = haversine(s.lat, s.lng, routeStopsData[i + 1].lat, routeStopsData[i + 1].lng);
          const speed = TRANSPORT_SPEEDS[document.getElementById('routeTransport').value] || 30;
          timeMin = (dist / speed) * 60;
        }
      }
      const distText = dist > 0 ? formatDist(dist) : '';
      const timeText = timeMin > 0 ? ` · ~${formatTime(timeMin)}` : '';
      const connector =
        i < routeStopsData.length - 1
          ? `<div class="rb-connector" style="--seg-color:${segColor};">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${segColor};flex-shrink:0;"></span>
          <span>${distText}${timeText}</span>
        </div>`
          : '';
      return `<li class="rb-stop" draggable="true" data-idx="${i}"
          ondragstart="onStopDragStart(event,${i})" ondragover="onStopDragOver(event,${i})" ondragleave="onStopDragLeave(event)" ondrop="onStopDrop(event,${i})" ondragend="onStopDragEnd(event)">
          <div class="rb-stop-num">${i + 1}</div>
          <div class="rb-stop-info">
            <div class="rb-stop-name">${s.name}</div>
            <div class="rb-stop-meta">${s.area} · ${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}</div>
            <div class="rb-stop-note"><input type="text" placeholder="Ghi chú cho điểm này (tùy chọn)..." value="${s.note || ''}" oninput="updateStopNote(${i}, this.value)" /></div>
          </div>
          <button class="rb-stop-remove" onclick="removeRouteStop(${i})" title="Xóa">×</button>
        </li>${connector}`;
    })
    .join('');
}

// Drag and drop
function onStopDragStart(e, idx) {
  draggedIdx = idx;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}
function onStopDragOver(e, idx) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}
function onStopDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}
function onStopDrop(e, idx) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (draggedIdx === null || draggedIdx === idx) return;
  const item = routeStopsData.splice(draggedIdx, 1)[0];
  routeStopsData.splice(idx, 0, item);
  renderRouteStops();
  updateRouteMap();
}
function onStopDragEnd(e) {
  e.target.classList.remove('dragging');
  draggedIdx = null;
  document.querySelectorAll('.rb-stop').forEach(el => el.classList.remove('drag-over'));
}

// OSRM routing — fetch real road paths
async function fetchOsrmRoute(from, to, profile) {
  const key = `${profile}:${from.lat.toFixed(5)},${from.lng.toFixed(5)}:${to.lat.toFixed(5)},${to.lng.toFixed(5)}`;
  if (osrmRouteCache[key]) return osrmRouteCache[key];

  const url = `https://router.project-osrm.org/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes || !data.routes.length) throw new Error('No route');
    const route = data.routes[0];
    const result = {
      coords: route.geometry.coordinates.map(c => [c[1], c[0]]),
      distance: route.distance / 1000,
      duration: route.duration / 60
    };
    osrmRouteCache[key] = result;
    return result;
  } catch (e) {
    console.warn('OSRM fallback to straight line:', e.message);
    const dist = haversine(from.lat, from.lng, to.lat, to.lng);
    return {
      coords: [
        [from.lat, from.lng],
        [to.lat, to.lng]
      ],
      distance: dist,
      duration: (dist / (TRANSPORT_SPEEDS[document.getElementById('routeTransport').value] || 30)) * 60
    };
  }
}

function formatDist(km) {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}
function formatTime(min) {
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return m > 0 ? `${h}h${m}ph` : `${h}h`;
  }
  return `${Math.round(min)}ph`;
}

// Map update — now with real road routing
async function updateRouteMap() {
  if (!routeMap) return;
  routeMarkers.forEach(m => routeMap.removeLayer(m));
  routeMarkers = [];
  routeSegments.forEach(s => routeMap.removeLayer(s));
  routeSegments = [];

  if (routeStopsData.length === 0) return;

  const transport = document.getElementById('routeTransport').value;
  const osrmProfile = OSRM_PROFILES[transport] || 'car';
  const speed = TRANSPORT_SPEEDS[transport] || 30;

  // Show loading indicator on map
  const loadingDiv = L.divIcon({
    html: '<div style="background:rgba(45,106,79,0.9);color:#fff;padding:6px 14px;border-radius:8px;font-size:13px;font-weight:600;white-space:nowrap;">Đang tìm đường...</div>',
    className: '',
    iconSize: [0, 0],
    iconAnchor: [50, 14]
  });
  const loadingMarker = L.marker(
    routeStopsData.length > 0 ? [routeStopsData[0].lat, routeStopsData[0].lng] : [20.9, 104.82],
    { icon: loadingDiv, interactive: false, zIndexOffset: 1000 }
  ).addTo(routeMap);
  routeMarkers.push(loadingMarker);

  // Fetch road routes for all segments in parallel
  const segmentPromises = [];
  for (let i = 0; i < routeStopsData.length - 1; i++) {
    segmentPromises.push(fetchOsrmRoute(routeStopsData[i], routeStopsData[i + 1], osrmProfile));
  }
  const segmentResults = await Promise.all(segmentPromises);

  // Remove loading indicator
  routeMap.removeLayer(loadingMarker);
  routeMarkers = routeMarkers.filter(m => m !== loadingMarker);

  // Store route data for stats
  osrmRouteData = segmentResults;

  // Draw each segment with real road path
  for (let i = 0; i < segmentResults.length; i++) {
    const result = segmentResults[i];
    const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
    const coords = result.coords;
    const dist = result.distance;
    const timeMin = result.duration;

    // Glow line underneath
    const glow = L.polyline(coords, {
      color: color,
      weight: 14,
      opacity: 0.12,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(routeMap);
    routeSegments.push(glow);

    // Main road line — colored, follows real road
    const seg = L.polyline(coords, {
      color: color,
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(routeMap);
    routeSegments.push(seg);

    // Place midpoint label at actual midpoint of road path
    const midIdx = Math.floor(coords.length / 2);
    const midLat = coords[midIdx][0];
    const midLng = coords[midIdx][1];
    const labelIcon = L.divIcon({
      html: `<div class="seg-label" style="border-color:${color};">
            <span class="seg-label-dist">${formatDist(dist)}</span>
            <span class="seg-label-sep">·</span>
            <span class="seg-label-time">~${formatTime(timeMin)}</span>
          </div>`,
      className: '',
      iconSize: [0, 0],
      iconAnchor: [40, 14]
    });
    const labelMarker = L.marker([midLat, midLng], { icon: labelIcon, interactive: false }).addTo(routeMap);
    routeMarkers.push(labelMarker);

    // Direction arrows along the real road path
    const arrowSpacing = Math.max(3, Math.floor(coords.length / 4));
    for (let j = arrowSpacing; j < coords.length - 1; j += arrowSpacing) {
      const p1 = coords[j];
      const p2 = coords[Math.min(j + 1, coords.length - 1)];
      const angle = (Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180) / Math.PI;
      const arrowIcon = L.divIcon({
        html: `<div class="seg-arrow" style="transform:rotate(${angle}deg);color:${color};">▸</div>`,
        className: '',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });
      const arrowMarker = L.marker([p1[0], p1[1]], { icon: arrowIcon, interactive: false }).addTo(routeMap);
      routeMarkers.push(arrowMarker);
    }
  }

  // Draw numbered stop markers
  routeStopsData.forEach((s, i) => {
    const icon = L.divIcon({
      html: `<div class="stop-marker" style="background:${s.color};">
            <span>${i + 1}</span>
          </div>`,
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    const m = L.marker([s.lat, s.lng], { icon })
      .addTo(routeMap)
      .bindPopup(
        `<strong>#${i + 1} ${s.name}</strong><br><span style="color:#6b7b6b;font-size:12px;">${s.area}</span>`
      );
    routeMarkers.push(m);
  });

  // Fit bounds to all road path coordinates
  const allCoords = segmentResults.flatMap(r => r.coords);
  if (allCoords.length > 0) {
    routeMap.fitBounds(L.latLngBounds(allCoords).pad(0.15));
  } else {
    routeMap.fitBounds(L.latLngBounds(routeStopsData.map(s => [s.lat, s.lng])).pad(0.15));
  }

  // Update stats with real OSRM data
  updateRouteStatsOSRM();

  // Re-render stops list to show real road distances in connectors
  renderRouteStopsOnly();
}

function updateRouteStatsOSRM() {
  if (!osrmRouteData || osrmRouteData.length === 0) {
    calcRouteDistance();
    return;
  }
  let totalDist = 0;
  let totalTime = 0;
  osrmRouteData.forEach(r => {
    totalDist += r.distance;
    totalTime += r.duration;
  });

  const distEl = document.getElementById('rbStatDist');
  const timeEl = document.getElementById('rbStatTime');

  if (distEl) distEl.textContent = formatDist(totalDist);
  if (timeEl) timeEl.textContent = formatTime(totalTime);
}

function calcRouteDistance() {
  if (routeStopsData.length < 2) {
    document.getElementById('rbStatDist').textContent = routeStopsData.length === 1 ? '0 km' : '—';
    return;
  }
  let total = 0;
  for (let i = 1; i < routeStopsData.length; i++) {
    total += haversine(
      routeStopsData[i - 1].lat,
      routeStopsData[i - 1].lng,
      routeStopsData[i].lat,
      routeStopsData[i].lng
    );
  }
  document.getElementById('rbStatDist').textContent = formatDist(total);
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Save route
async function saveRoute() {
  const name = document.getElementById('routeName').value.trim();
  if (!name) {
    alert('Vui lòng nhập tên lộ trình.');
    return;
  }
  if (routeStopsData.length === 0) {
    alert('Vui lòng thêm ít nhất 1 điểm đến.');
    return;
  }

  const routeData = {
    name: { vi: name, en: name },
    description: { vi: document.getElementById('routeDesc').value.trim(), en: '' },
    transport: document.getElementById('routeTransport').value,
    duration: document.getElementById('routeDuration').value,
    difficulty: document.getElementById('routeDifficulty').value,
    status: document.getElementById('routeStatus').value,
    stops: routeStopsData.map(s => ({
      destination_id: s.id,
      description: { vi: s.note || '', en: '' }
    }))
  };

  try {
    let result;
    const updateId =
      typeof editingRouteIdx === 'string'
        ? editingRouteIdx
        : editingRouteIdx >= 0 && routes[editingRouteIdx]
          ? routes[editingRouteIdx].id
          : null;

    if (updateId) {
      // Update existing route
      result = await apiRequest(`/routes/${updateId}`, {
        method: 'PUT',
        body: JSON.stringify(routeData)
      });
    } else {
      // Create new route
      result = await apiRequest('/routes', {
        method: 'POST',
        body: JSON.stringify(routeData)
      });
    }

    if (result.success) {
      closeRouteModal();
      loadRoutes();
      alert(updateId ? 'Cập nhật lộ trình thành công!' : 'Tạo lộ trình thành công!');
    } else {
      alert(
        I18nNew.get('alert.error', 'Lỗi: ') + (result.message || I18nNew.get('alert.cannot_save', 'Không thể lưu'))
      );
    }
  } catch (error) {
    alert(I18nNew.get('alert.error', 'Lỗi: ') + error.message);
  }
}

async function submitRouteForReview(id) {
  if (!confirm('Gửi lộ trình này cho admin duyệt?')) return;
  try {
    const result = await apiRequest(`/routes/${id}/submit-review`, { method: 'POST' });
    if (result.success) {
      loadRoutes();
      alert('Đã gửi duyệt thành công!');
    } else {
      alert('Lỗi: ' + (result.message || 'Không thể gửi duyệt'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

async function deleteRoute(id) {
  if (!confirm('Bạn có chắc muốn xóa lộ trình này?')) return;

  try {
    const result = await apiRequest(`/routes/${id}`, { method: 'DELETE' });
    if (result.success) {
      loadRoutes();
      alert(I18nNew.get('alert.delete_success', 'Xóa thành công!'));
    } else {
      alert(
        I18nNew.get('alert.error', 'Lỗi: ') + (result.message || I18nNew.get('alert.cannot_delete', 'Không thể xóa'))
      );
    }
  } catch (error) {
    alert(I18nNew.get('alert.error', 'Lỗi: ') + error.message);
  }
}

function renderRouteList() {
  const empty = document.getElementById('routeEmptyState');
  const list = document.getElementById('routeList');
  if (routes.length === 0) {
    empty.style.display = '';
    list.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  list.style.display = '';

  const transportLabel = { walk: '🚶 Đi bộ', bike: '🏍️ Xe máy', car: '🚗 Ô tô' };
  const transportBadge = { walk: 'badge-walk', bike: 'badge-bike', car: 'badge-car' };
  const durationLabel = { half: 'Nửa ngày', full: '1 ngày', two: '2 ngày 1 đêm', custom: 'Tùy chỉnh' };
  const difficultyLabel = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
  const difficultyBadge = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' };
  const statusLabel = { draft: 'Bản nháp', published: 'Đã xuất bản' };
  const statusBadge = { draft: 'badge-amber', published: 'badge-green' };

  list.innerHTML = routes
    .map((r, i) => {
      let dist = 0;
      for (let j = 1; j < r.stops.length; j++) {
        dist += haversine(r.stops[j - 1].lat, r.stops[j - 1].lng, r.stops[j].lat, r.stops[j].lng);
      }
      const distStr = dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
      const stopsHtml = r.stops
        .map(
          (s, si) =>
            `<span class="route-card-stop"><span class="dot" style="background:${s.color}"></span>${s.name.length > 18 ? s.name.slice(0, 18) + '…' : s.name}</span>${si < r.stops.length - 1 ? '<span class="arrow">→</span>' : ''}`
        )
        .join('');

      return `<div class="route-card">
          <div class="route-card-header">
            <div>
              <div class="route-card-title">${r.name}</div>
              <div class="route-card-badges">
                <span class="badge-transport ${transportBadge[r.transport]}">${transportLabel[r.transport]}</span>
                <span class="badge-difficulty ${difficultyBadge[r.difficulty]}">${difficultyLabel[r.difficulty]}</span>
                <span class="badge ${statusBadge[r.status]}">${statusLabel[r.status]}</span>
              </div>
            </div>
          </div>
          ${r.desc ? `<div class="route-card-desc">${r.desc}</div>` : ''}
          <div class="route-card-stops">${stopsHtml}</div>
          <div class="route-card-footer">
            <div class="route-card-stats">
              <span>📍 ${r.stops.length} điểm</span>
              <span>📏 ${distStr}</span>
              <span>⏱ ${durationLabel[r.duration]}</span>
            </div>
            <div class="route-card-actions">
              <button class="btn-icon" title="Sửa" onclick="openRouteModal(${i})">✏️</button>
              <button class="btn-icon" title="Xóa" onclick="deleteRoute(${i})">🗑️</button>
            </div>
          </div>
        </div>`;
    })
    .join('');
}

// Close dropdown on outside click
document.addEventListener('click', function (e) {
  if (!e.target.closest('.rb-add-dest')) {
    document.getElementById('destDropdown').classList.remove('open');
  }
});

// Close route modal on overlay click
document.getElementById('routeModalOverlay').addEventListener('click', function (e) {
  if (e.target === this) closeRouteModal();
});

// === USER MODAL ===
const PERMS = [
  { key: 'view_dests', label: '📍 Xem điểm du lịch', admin: true, collab: true },
  { key: 'create_dests', label: '📍 Thêm điểm du lịch', admin: true, collab: true },
  { key: 'edit_dests', label: '📍 Sửa điểm du lịch', admin: true, collab: true },
  { key: 'delete_dests', label: '📍 Xóa điểm du lịch', admin: true, collab: false },
  { key: 'approve_content', label: '📍 Duyệt / Từ chối nội dung', admin: true, collab: false },
  { key: 'comment_dests', label: '📍 Bình luận điểm du lịch', admin: true, collab: true },
  { key: 'view_routes', label: '🗺️ Xem lộ trình', admin: true, collab: true },
  { key: 'create_routes', label: '🗺️ Thêm lộ trình', admin: true, collab: true },
  { key: 'edit_routes', label: '🗺️ Sửa lộ trình', admin: true, collab: true },
  { key: 'delete_routes', label: '🗺️ Xóa lộ trình', admin: true, collab: false },
  { key: 'manage_stops', label: '🗺️ Quản lý điểm dừng', admin: true, collab: true },
  { key: 'comment_routes', label: '🗺️ Bình luận lộ trình', admin: true, collab: true },
  { key: 'view_events', label: '📅 Xem sự kiện', admin: true, collab: true },
  { key: 'create_events', label: '📅 Thêm sự kiện', admin: true, collab: true },
  { key: 'edit_events', label: '📅 Sửa sự kiện', admin: true, collab: true },
  { key: 'delete_events', label: '📅 Xóa sự kiện', admin: true, collab: false },
  { key: 'comment_events', label: '📅 Bình luận sự kiện', admin: true, collab: true },
  { key: 'manage_users', label: '⚙️ Quản lý người dùng', admin: true, collab: false },
  { key: 'manage_langs', label: '⚙️ Quản lý ngôn ngữ', admin: true, collab: false },
  { key: 'manage_settings', label: '⚙️ Cài đặt hệ thống', admin: true, collab: false },
  { key: 'view_stats_full', label: '⚙️ Thống kê đầy đủ', admin: true, collab: false },
  { key: 'upload_images', label: '📤 Upload hình ảnh', admin: true, collab: true }
];

let editingUserId = null;

async function openUserModal(userId) {
  editingUserId = userId || null;
  const modal = document.getElementById('userModalOverlay');
  const title = document.getElementById('userModalTitle');

  if (editingUserId) {
    title.textContent = 'Sửa thông tin người dùng';
    try {
      const result = await apiRequest(`/users/${userId}`);
      if (result.success) {
        const user = result.data;
        document.getElementById('userName').value = user.name || '';
        document.getElementById('userEmail').value = user.email || '';
        document.getElementById('userUsername').value = user.username || '';
        document.getElementById('userPhone').value = user.phone || '';
        selectUserRole(user.role || 'admin');
        document.getElementById('userStatus').value = user.status || 'active';
        document.getElementById('userPassword').value = '';
        document.getElementById('userPassword').placeholder = 'Để trống nếu không đổi';
      } else {
        showUserError('Không thể tải thông tin người dùng');
        return;
      }
    } catch (error) {
      showUserError('Lỗi: ' + error.message);
      return;
    }
  } else {
    title.textContent = 'Thêm người dùng mới';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userUsername').value = '';
    document.getElementById('userPhone').value = '';
    document.getElementById('userPassword').value = '';
    document.getElementById('userPassword').placeholder = 'Tối thiểu 8 ký tự';
    document.getElementById('userStatus').value = 'active';
    selectUserRole('admin');
  }

  updateUserAvatar();
  hideUserError();
  modal.classList.add('open');
}

function closeUserModal() {
  document.getElementById('userModalOverlay').classList.remove('open');
  editingUserId = null;
}

function selectUserRole(role) {
  document.getElementById('userRole').value = role;
  document.querySelectorAll('.role-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.role === role);
  });
  updatePermPreview(role);
  updateUserAvatar();
}

function updatePermPreview(role) {
  const list = document.getElementById('userPermList');
  list.innerHTML = PERMS.map(p => {
    const granted = role === 'admin' ? p.admin : p.collab;
    return `<div class="perm-item">
          <span class="perm-icon ${granted ? 'granted' : 'denied'}">${granted ? '✓' : '✕'}</span>
          ${p.label}
        </div>`;
  }).join('');
}

function updateUserAvatar() {
  const name = document.getElementById('userName').value.trim();
  const role = document.getElementById('userRole').value;
  const preview = document.getElementById('userAvatarPreview');
  const nameEl = document.getElementById('userAvatarName');
  const roleEl = document.getElementById('userAvatarRole');

  const initial = name ? name.charAt(0).toUpperCase() : '?';
  preview.textContent = initial;
  preview.style.background = role === 'admin' ? 'var(--accent)' : '#0e7490';
  nameEl.textContent = name || 'Chưa có tên';
  roleEl.textContent =
    role === 'admin' ? I18nNew.get('role.admin', 'Quản trị viên') : I18nNew.get('role.collaborator', 'Cộng tác viên');
}

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pw = '';
  for (let i = 0; i < 12; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
  document.getElementById('userPassword').value = pw;
  document.getElementById('userPassword').type = 'text';
}

function togglePasswordVisibility() {
  const input = document.getElementById('userPassword');
  input.type = input.type === 'password' ? 'text' : 'password';
}

function showUserError(msg) {
  const el = document.getElementById('userFormError');
  el.textContent = msg;
  el.style.display = 'block';
}

function hideUserError() {
  document.getElementById('userFormError').style.display = 'none';
}

async function saveUser() {
  hideUserError();
  const name = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const username = document.getElementById('userUsername').value.trim();
  const phone = document.getElementById('userPhone').value.trim();
  const role = document.getElementById('userRole').value;
  const status = document.getElementById('userStatus').value;
  const password = document.getElementById('userPassword').value;

  if (!name) return showUserError('Vui lòng nhập họ và tên.');
  if (!email) return showUserError('Vui lòng nhập email.');
  if (!email.includes('@')) return showUserError('Email không hợp lệ.');
  if (!username) return showUserError('Vui lòng nhập tên đăng nhập.');
  if (username.length < 3) return showUserError('Tên đăng nhập phải có tối thiểu 3 ký tự.');
  if (!editingUserId && !password) return showUserError('Vui lòng nhập mật khẩu.');
  if (password && password.length < 8) return showUserError('Mật khẩu phải có tối thiểu 8 ký tự.');

  try {
    const userData = { name, email, username, phone, role, status };
    if (password) userData.password = password;

    let result;
    if (editingUserId) {
      // Update existing user
      result = await apiRequest(`/users/${editingUserId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    } else {
      // Create new user
      result = await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    }

    if (result.success) {
      closeUserModal();
      loadUsersList();
      alert(editingUserId ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
    } else {
      showUserError(result.message || 'Không thể lưu');
    }
  } catch (error) {
    showUserError('Lỗi: ' + error.message);
  }
}

// Close user modal on overlay click
document.getElementById('userModalOverlay').addEventListener('click', function (e) {
  if (e.target === this) closeUserModal();
});

// Initialize permission preview
selectUserRole('admin');

// === EVENT MODAL ===
let editingEventId = null;
let selectedEventIcon = '🎪';

const EVENT_TYPE_META = {
  festival: { label: 'Lễ hội', icon: '🎪', color: '#2d6a4f' },
  season: { label: 'Theo mùa', icon: '🌿', color: '#0e7490' },
  experience: { label: 'Trải nghiệm', icon: '⛰️', color: '#b45309' },
  cultural: { label: 'Văn hóa', icon: '🎭', color: '#7e22ce' },
  sport: { label: 'Thể thao', icon: '🏃', color: '#dc2626' },
  food: { label: 'Ẩm thực', icon: '🍜', color: '#ea580c' },
  other: { label: 'Khác', icon: '📌', color: '#6b7280' }
};

// DEST_COORDS will be populated from API
const DEST_COORDS = {};

// Load destinations for event form
async function loadEventDestinations() {
  try {
    const result = await apiRequest('/destinations?status=published');
    if (result.success) {
      // Populate DEST_COORDS from API
      result.data.items.forEach(d => {
        DEST_COORDS[d.id] = { lat: d.lat || 0, lng: d.lng || 0, name: d.name.vi || d.name.en };
      });

      const select = document.getElementById('eventDestId');
      select.innerHTML = '<option value="">— Chọn điểm du lịch —</option>';

      result.data.items.forEach(d => {
        const name = escapeHtml(d.name.vi || d.name.en);
        const option = document.createElement('option');
        option.value = d.id;
        option.textContent = name;
        select.appendChild(option);
      });

      // Add custom option
      const customOption = document.createElement('option');
      customOption.value = 'custom';
      customOption.textContent = '📍 Địa điểm khác...';
      select.appendChild(customOption);
    }
  } catch (error) {
    console.error('Error loading event destinations:', error);
  }
}

// Load destinations on page load
loadEventDestinations();

function openEventModal(eventId) {
  editingEventId = eventId || null;
  document.getElementById('eventModalTitle').textContent = eventId ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới';
  document.getElementById('eventFormError').style.display = 'none';

  if (eventId) {
    const row = document.querySelector(`[data-event-id="${eventId}"]`);
    if (row) {
      const name = row.querySelector('.dest-name span:last-child').textContent;
      document.getElementById('eventName').value = name;
    }
  } else {
    document.getElementById('eventName').value = '';
    document.getElementById('eventDesc').value = '';
    document.getElementById('eventType').value = 'festival';
    document.getElementById('eventStartDate').value = '';
    document.getElementById('eventEndDate').value = '';
    document.getElementById('eventStartTime').value = '08:00';
    document.getElementById('eventEndTime').value = '17:00';
    document.getElementById('eventRecurring').checked = false;
    document.getElementById('recurrenceOptions').style.display = 'none';
    document.getElementById('eventDestId').value = '';
    document.getElementById('eventLocation').value = '';
    document.getElementById('eventCustomCoords').style.display = 'none';
    document.getElementById('eventStatus').value = 'draft';
    selectedEventIcon = '🎪';
    window.eventImageUrls = [];
  }

  // Reset icon picker
  document.querySelectorAll('.icon-pick').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.icon === selectedEventIcon);
  });

  // Initialize image uploader for events (multi, max 5)
  setTimeout(() => {
    window.imageUploaders['eventImageUploader'] = new ImageUploader({
      containerId: 'eventImageUploader',
      category: 'events',
      multiple: true,
      maxFiles: 5,
      currentImageUrls: window.eventImageUrls || [],
      currentImageUrl: window.eventImageUrls && window.eventImageUrls.length > 0 ? window.eventImageUrls[0] : null,
      onUpload: data => {
        if (data) {
          if (!window.eventImageUrls) window.eventImageUrls = [];
          if (!window.eventImageUrls.includes(data.url)) {
            window.eventImageUrls.push(data.url);
          }
        }
      },
      onMultiUpload: dataArray => {
        if (dataArray && dataArray.length > 0) {
          if (!window.eventImageUrls) window.eventImageUrls = [];
          dataArray.forEach(d => {
            if (!window.eventImageUrls.includes(d.url)) {
              window.eventImageUrls.push(d.url);
            }
          });
        }
      }
    });
  }, 100);

  updateEventPreview();
  document.getElementById('eventModalOverlay').classList.add('open');
}

function closeEventModal() {
  document.getElementById('eventModalOverlay').classList.remove('open');
  editingEventId = null;
}

function pickEventIcon(btn) {
  selectedEventIcon = btn.dataset.icon;
  document.querySelectorAll('.icon-pick').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateEventPreview();
}

function toggleRecurrence() {
  const checked = document.getElementById('eventRecurring').checked;
  document.getElementById('recurrenceOptions').style.display = checked ? 'block' : 'none';
}

function updateEventLocation() {
  const destId = document.getElementById('eventDestId').value;
  if (destId === 'custom') {
    document.getElementById('eventCustomCoords').style.display = 'block';
    document.getElementById('eventLocation').value = '';
  } else if (destId && DEST_COORDS[destId]) {
    document.getElementById('eventCustomCoords').style.display = 'none';
    document.getElementById('eventLocation').value = DEST_COORDS[destId].name;
  } else {
    document.getElementById('eventCustomCoords').style.display = 'none';
    document.getElementById('eventLocation').value = '';
  }
}

function updateEventPreview() {
  const name = document.getElementById('eventName').value || 'Tên sự kiện';
  const type = document.getElementById('eventType').value;
  const status = document.getElementById('eventStatus').value;
  const startDate = document.getElementById('eventStartDate').value;
  const endDate = document.getElementById('eventEndDate').value;

  const meta = EVENT_TYPE_META[type] || EVENT_TYPE_META.other;

  document.getElementById('eventPreviewIcon').textContent = selectedEventIcon || meta.icon;
  document.getElementById('eventPreviewType').textContent = meta.label;
  document.getElementById('eventPreviewName').textContent = name;
  document.getElementById('eventPreviewBanner').style.background =
    `linear-gradient(135deg, ${meta.color}, ${meta.color}dd)`;

  // Date display
  let dateStr = 'Chọn ngày bên dưới';
  if (startDate) {
    const fmt = d => {
      const p = d.split('-');
      return p[2] + '/' + p[1] + '/' + p[0];
    };
    dateStr = endDate ? `${fmt(startDate)} — ${fmt(endDate)}` : fmt(startDate);
  }
  document.getElementById('eventPreviewDate').textContent = dateStr;

  // Status
  const statusMap = { draft: 'Bản nháp', published: 'Đã xuất bản', archived: 'Lưu trữ' };
  document.getElementById('eventPreviewStatus').textContent = statusMap[status] || 'Bản nháp';
}

async function saveEvent() {
  const name = document.getElementById('eventName').value.trim();
  const errorEl = document.getElementById('eventFormError');

  if (!name) {
    errorEl.textContent = 'Vui lòng nhập tên sự kiện.';
    errorEl.style.display = 'block';
    return;
  }

  const startDate = document.getElementById('eventStartDate').value;
  const endDate = document.getElementById('eventEndDate').value;

  if (!startDate) {
    errorEl.textContent = 'Vui lòng chọn ngày bắt đầu.';
    errorEl.style.display = 'block';
    return;
  }

  if (!endDate) {
    errorEl.textContent = 'Vui lòng chọn ngày kết thúc.';
    errorEl.style.display = 'block';
    return;
  }

  const type = document.getElementById('eventType').value;
  const status = document.getElementById('eventStatus').value;
  const destId = document.getElementById('eventDestId').value;
  const location = document.getElementById('eventLocation').value;
  const desc = document.getElementById('eventDesc').value;
  const isRecurring = document.getElementById('eventRecurring').checked;
  const frequency = isRecurring ? document.getElementById('eventFrequency').value : 'none';

  const eventData = {
    name: { vi: name, en: name },
    description: { vi: desc, en: desc },
    type,
    icon: selectedEventIcon,
    start_date: startDate,
    end_date: endDate,
    recurring: frequency,
    frequency: isRecurring ? frequency : null,
    destination_id: destId || null,
    location: location,
    status,
    image_url: window.eventImageUrls && window.eventImageUrls.length > 0 ? window.eventImageUrls[0] : null,
    image_urls: window.eventImageUrls || []
  };

  try {
    let result;
    if (editingEventId) {
      // Update existing event
      result = await apiRequest(`/events/${editingEventId}`, {
        method: 'PUT',
        body: JSON.stringify(eventData)
      });
    } else {
      // Create new event
      result = await apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify(eventData)
      });
    }

    if (result.success) {
      closeEventModal();
      loadEvents();
      alert(editingEventId ? 'Cập nhật sự kiện thành công!' : 'Tạo sự kiện thành công!');
    } else {
      alert(
        I18nNew.get('alert.error', 'Lỗi: ') + (result.message || I18nNew.get('alert.cannot_save', 'Không thể lưu'))
      );
    }
  } catch (error) {
    alert(I18nNew.get('alert.error', 'Lỗi: ') + error.message);
  }
}

// Close event modal on overlay click
document.getElementById('eventModalOverlay').addEventListener('click', function (e) {
  if (e.target === this) closeEventModal();
});

// === LANGUAGES ===
const langFlags = {
  vi: '🇻🇳',
  en: '🇬🇧',
  ko: '🇰🇷',
  ru: '🇷🇺',
  th: '🇹🇭',
  zh: '🇨🇳',
  id: '🇮🇩',
  ms: '🇲🇾',
  lo: '🇱🇦',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪'
};

async function deleteUser(userId) {
  if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
  try {
    const res = await apiRequest(`/users/${userId}`, { method: 'DELETE' });
    if (res.success) {
      alert('Đã xóa người dùng!');
      loadUsersList();
    } else {
      alert('Lỗi: ' + (res.message || 'Không thể xóa'));
    }
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
}

async function loadLanguages() {
  const container = document.getElementById('langList');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:24px;color:var(--muted);">Đang tải...</div>';

  try {
    const res = await fetch('/api/i18n/languages');
    const data = await res.json();
    if (!data.success) throw new Error('Failed to load');

    const { supportedLanguages, languageNames } = data.data;
    const countEl = document.getElementById('langCount');
    if (countEl) countEl.textContent = `${supportedLanguages.length} ngôn ngữ`;

    container.innerHTML = supportedLanguages
      .map(
        code => `
          <div class="lang-row">
            <span class="lang-flag">${langFlags[code] || '🌐'}</span>
            <span class="lang-name">${languageNames[code] || code}</span>
            <span class="lang-code">${code}</span>
            <span class="lang-status complete">Hoạt động</span>
          </div>
        `
      )
      .join('');
  } catch (error) {
    container.innerHTML =
      '<div style="text-align:center;padding:24px;color:var(--danger);">Lỗi tải danh sách ngôn ngữ</div>';
  }
}

// === INITIALIZE DATA LOADING ===
document.addEventListener('DOMContentLoaded', function () {
  loadDashboard();
  loadDestinationsList();
  loadUsersList();
  loadLanguages();
});

// === CHANGE PASSWORD ===
function openChangePasswordModal() {
  document.getElementById('changePasswordOverlay').classList.add('open');
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  document.getElementById('changePasswordError').style.display = 'none';
}

function closeChangePasswordModal() {
  document.getElementById('changePasswordOverlay').classList.remove('open');
}

async function handleChangePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorEl = document.getElementById('changePasswordError');

  if (!currentPassword || !newPassword || !confirmPassword) {
    errorEl.textContent = 'Vui lòng điền đầy đủ thông tin';
    errorEl.style.display = 'block';
    return;
  }

  if (newPassword.length < 6) {
    errorEl.textContent = 'Mật khẩu mới phải có tối thiểu 6 ký tự';
    errorEl.style.display = 'block';
    return;
  }

  if (newPassword !== confirmPassword) {
    errorEl.textContent = 'Mật khẩu xác nhận không khớp';
    errorEl.style.display = 'block';
    return;
  }

  try {
    const result = await apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (result.success) {
      alert('Đổi mật khẩu thành công!');
      closeChangePasswordModal();
    } else {
      errorEl.textContent = result.message || 'Đổi mật khẩu thất bại';
      errorEl.style.display = 'block';
    }
  } catch (error) {
    errorEl.textContent = 'Lỗi: ' + error.message;
    errorEl.style.display = 'block';
  }
}

// Close change password modal on overlay click
document.addEventListener('DOMContentLoaded', function () {
  const changePwdOverlay = document.getElementById('changePasswordOverlay');
  if (changePwdOverlay) {
    changePwdOverlay.addEventListener('click', function (e) {
      if (e.target === this) closeChangePasswordModal();
    });
  }
});

// === LANGUAGE TABS ===
const LANG_LABELS = {
  vi: 'Tiếng Việt',
  en: 'English',
  ko: '한국어',
  ru: 'Русский',
  th: 'ภาษาไทย',
  'zh-Hans': '中文',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch'
};

const SUPPORTED_LANGS = ['vi', 'en', 'ko', 'ru', 'th', 'zh-Hans', 'id', 'ms', 'es', 'fr', 'de'];

let currentLang = 'vi';
let destNames = {}; // { vi: "...", en: "...", ... }
let destDescs = {}; // { vi: "...", en: "...", ... }
let destQuotes = {}; // { vi: "...", en: "...", ... }

function switchLang(lang) {
  // Save current lang data
  destNames[currentLang] = document.getElementById('destNameInput').value;
  destDescs[currentLang] = document.getElementById('destDescInput').value;
  destQuotes[currentLang] = document.getElementById('destQuoteInput').value;

  // Switch to new lang
  currentLang = lang;
  document.getElementById('destNameInput').value = destNames[lang] || '';
  document.getElementById('destDescInput').value = destDescs[lang] || '';
  document.getElementById('destQuoteInput').value = destQuotes[lang] || '';

  // Update tab UI
  document.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.lang-tab[data-lang="${lang}"]`)?.classList.add('active');

  // Update label
  document.getElementById('langLabel').textContent = `(${LANG_LABELS[lang] || lang})`;

  // Update badges
  updateLangBadges();
}

function updateLangBadges() {
  SUPPORTED_LANGS.forEach(lang => {
    const badge = document.getElementById(`badge-${lang}`);
    if (badge) {
      const hasContent = destNames[lang] || destDescs[lang];
      badge.className = 'lang-tab-badge' + (hasContent ? '' : ' empty');
    }
  });
}

async function autoTranslateFromVi() {
  const viName = destNames['vi'] || document.getElementById('destNameInput').value;
  const viDesc = destDescs['vi'] || document.getElementById('destDescInput').value;
  const viQuote = destQuotes['vi'] || document.getElementById('destQuoteInput').value;

  if (!viName && !viDesc) {
    alert('Vui lòng nhập tên và mô tả tiếng Việt trước');
    return;
  }

  const btn = document.getElementById('autoTranslateBtn');
  btn.disabled = true;
  btn.innerHTML = '⏳ Đang dịch...';

  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: viName, description: viDesc, quote: viQuote })
    });

    const data = await response.json();
    if (data.success) {
      // Merge translated data
      if (data.data.name) {
        destNames = { ...destNames, ...data.data.name };
      }
      if (data.data.description) {
        destDescs = { ...destDescs, ...data.data.description };
      }
      if (data.data.quote) {
        destQuotes = { ...destQuotes, ...data.data.quote };
      }

      // Refresh current view
      switchLang(currentLang);
      alert('Đã dịch xong! Chuyển tab để xem kết quả.');
    } else {
      alert('Lỗi dịch: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    alert('Lỗi kết nối: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🔄 Dịch tự động từ Tiếng Việt';
  }
}

function resetLangTabs() {
  destNames = {};
  destDescs = {};
  destQuotes = {};
  currentLang = 'vi';
  document.getElementById('destNameInput').value = '';
  document.getElementById('destDescInput').value = '';
  document.getElementById('destQuoteInput').value = '';
  switchLang('vi');
}

// === WINDOW EXPORTS FOR ONCLICK HANDLERS ===
window.showView = showView;
window.handleLogout = handleLogout;
window.openModal = openModal;
window.closeModal = closeModal;
window.saveDestination = saveDestination;
window.editDestination = editDestination;
window.deleteDestination = deleteDestination;
window.approveDestination = approveDestination;
window.approveDeleteDestination = approveDeleteDestination;
window.rejectDestination = rejectDestination;
window.submitDestinationForReview = submitDestinationForReview;
window.switchLang = switchLang;
window.autoTranslateFromVi = autoTranslateFromVi;
window.addVisitorNote = addVisitorNote;
window.openRouteModal = openRouteModal;
window.closeRouteModal = closeRouteModal;
window.toggleDestDropdown = toggleDestDropdown;
window.saveRoute = saveRoute;
window.deleteRoute = deleteRoute;
window.editRoute = editRoute;
window.approveRoute = approveRoute;
window.rejectRoute = rejectRoute;
window.submitRouteForReview = submitRouteForReview;
window.addRouteComment = addRouteComment;
window.addRouteStop = addRouteStop;
window.removeRouteStop = removeRouteStop;
window.updateStopNote = updateStopNote;
window.onStopDragStart = onStopDragStart;
window.onStopDragOver = onStopDragOver;
window.onStopDragLeave = onStopDragLeave;
window.onStopDrop = onStopDrop;
window.onStopDragEnd = onStopDragEnd;
window.openEventModal = openEventModal;
window.closeEventModal = closeEventModal;
window.pickEventIcon = pickEventIcon;
window.saveEvent = saveEvent;
window.deleteEvent = deleteEvent;
window.editEvent = editEvent;
window.approveEvent = approveEvent;
window.rejectEvent = rejectEvent;
window.submitEventForReview = submitEventForReview;
window.addEventComment = addEventComment;
window.updateEventPreview = updateEventPreview;
window.updateEventLocation = updateEventLocation;
window.toggleRecurrence = toggleRecurrence;
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;
window.selectUserRole = selectUserRole;
window.saveUser = saveUser;
window.deleteUser = deleteUser;
window.generatePassword = generatePassword;
window.togglePasswordVisibility = togglePasswordVisibility;
window.updateUserAvatar = updateUserAvatar;
window.loadSettings = loadSettings;
window.saveSettings = saveSettings;
window.toggleMfa = toggleMfa;
window.enableMfa = enableMfa;
window.cancelMfaSetup = cancelMfaSetup;
window.regenerateBackupCodes = regenerateBackupCodes;
window.loadRoutes = loadRoutes;
window.loadEvents = loadEvents;
window.loadUsersList = loadUsersList;
window.openChangePasswordModal = openChangePasswordModal;
window.closeChangePasswordModal = closeChangePasswordModal;
window.handleChangePassword = handleChangePassword;
window.locateGPS = locateGPS;
