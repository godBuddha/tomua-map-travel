    // === AUTH CHECK ===
    (function checkAuth() {
      const token = localStorage.getItem('accessToken');
      const role = localStorage.getItem('tm_role');
      if (!token || role !== 'collaborator') {
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
          if (avatarEl) avatarEl.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'C';
          if (nameEl) nameEl.textContent = user.name || 'Collaborator';
          if (roleEl) roleEl.textContent = 'Cộng tác viên';
        }
      } catch (e) {}
    })();

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

    // === LOAD DASHBOARD STATS ===
    async function loadDashboard() {
      try {
        const statsResult = await apiRequest('/stats');
        if (statsResult.success) {
          const stats = statsResult.data;
          const statVals = document.querySelectorAll('.stat-val');
          if (statVals[0]) statVals[0].textContent = stats.destinations;
          if (statVals[1]) statVals[1].textContent = stats.routes;
          if (statVals[2]) statVals[2].textContent = stats.events;
        }

        // Load my contributions
        const destResult = await apiRequest('/destinations');
        if (destResult.success) {
          const myDests = destResult.data.items;
          const created = document.getElementById('ctvStatCreated');
          const pending = document.getElementById('ctvStatPending');
          const published = document.getElementById('ctvStatPublished');
          const rejected = document.getElementById('ctvStatRejected');
          
          if (created) created.textContent = myDests.length;
          if (pending) pending.textContent = myDests.filter(d => ['pending', 'pending_edit', 'pending_delete'].includes(d.status)).length;
          if (published) published.textContent = myDests.filter(d => d.status === 'published').length;
          if (rejected) rejected.textContent = myDests.filter(d => d.status === 'draft' && d.rejection_reason).length;
        }

        // Load my routes
        const routeResult = await apiRequest('/routes');
        if (routeResult.success) {
          const myRoutes = routeResult.data.items;
          const routeCreated = document.getElementById('ctvStatRouteCreated');
          if (routeCreated) routeCreated.textContent = myRoutes.length;
        }

        // Load my events
        const eventResult = await apiRequest('/events');
        if (eventResult.success) {
          const myEvents = eventResult.data.items;
          const eventCreated = document.getElementById('ctvStatEventCreated');
          if (eventCreated) eventCreated.textContent = myEvents.length;
        }

        // Load recent activity (approval comments)
        loadRecentActivity();
      } catch (error) {
        console.error('Error loading dashboard:', error);
      }
    }

    async function loadRecentActivity() {
      try {
        const container = document.getElementById('recentActivityList');
        if (!container) return;

        // Get my destinations and their comments
        const destResult = await apiRequest('/destinations');
        if (!destResult.success) return;

        const activities = [];
        for (const dest of destResult.data.items.slice(0, 5)) {
          try {
            const commentsResult = await apiRequest(`/destinations/${dest.id}/comments`);
            if (commentsResult.success) {
              commentsResult.data.forEach(c => {
                activities.push({
                  type: c.action || 'comment',
                  user: c.user_name || 'Ẩn danh',
                  target: dest.name?.vi || dest.name?.en || 'Unknown',
                  time: new Date(c.created_at),
                  comment: c.comment
                });
              });
            }
          } catch (e) {}
        }

        // Sort by time
        activities.sort((a, b) => b.time - a.time);

        if (activities.length === 0) {
          container.innerHTML = '<div style="padding:24px; text-align:center; color:var(--muted);">Chưa có hoạt động nào</div>';
          return;
        }

        const icons = { approve: '✅', reject: '❌', comment: '💬', submit: '📤' };
        const timeAgo = (date) => {
          const diff = Date.now() - date.getTime();
          const mins = Math.floor(diff / 60000);
          if (mins < 60) return `${mins} phút trước`;
          const hours = Math.floor(mins / 60);
          if (hours < 24) return `${hours} giờ trước`;
          return `${Math.floor(hours / 24)} ngày trước`;
        };

        container.innerHTML = activities.slice(0, 5).map(a => `
          <div class="activity-item">
            <div class="activity-icon">${icons[a.type] || '💬'}</div>
            <div class="activity-text">
              <p><strong>${escapeHtml(a.user)}</strong> ${a.type === 'approve' ? 'phê duyệt' : a.type === 'reject' ? 'từ chối' : 'bình luận'} <strong>${escapeHtml(a.target)}</strong></p>
              ${a.comment ? `<div style="font-size:12px; color:var(--muted); margin-top:2px;">"${escapeHtml(a.comment.substring(0, 50))}"</div>` : ''}
              <div class="activity-time">${timeAgo(a.time)}</div>
            </div>
          </div>
        `).join('');
      } catch (error) {
        console.error('Error loading activity:', error);
      }
    }

    // === LOAD DESTINATIONS ===
    async function loadDestinations() {
      try {
        const result = await apiRequest('/destinations');
        if (result.success) {
          const tbody = document.getElementById('destTable');
          if (tbody) {
            tbody.innerHTML = result.data.items.map(d => {
              const lat = d.lat || 0;
              const lng = d.lng || 0;
              const name = escapeHtml(d.name.vi || d.name.en);
              const typeLabels = { 
                waterfall: I18nNew.getCommon('type.waterfall', 'Thác nước'), 
                cave: I18nNew.getCommon('type.cave', 'Hang động'), 
                historical: I18nNew.getCommon('type.historical', 'Di tích lịch sử'), 
                spiritual: I18nNew.getCommon('type.spiritual', 'Tâm linh') 
              };
              const typeColors = { waterfall: '#0e7490', cave: '#78716c', historical: '#57534e', spiritual: '#9f1239' };
              const statusLabels = { 
                draft: I18nNew.getCommon('status.draft', 'Bản nháp'), 
                pending: I18nNew.getCommon('status.pending', 'Chờ duyệt'), 
                pending_edit: 'Chờ duyệt sửa',
                pending_delete: 'Chờ duyệt xóa',
                published: I18nNew.getCommon('status.published', 'Đã xuất bản'), 
                archived: I18nNew.getCommon('status.archived', 'Lưu trữ') 
              };
              const statusClasses = { draft: 'badge-gray', pending: 'badge-amber', pending_edit: 'badge-amber', pending_delete: 'badge-red', published: 'badge-green', archived: 'badge-gray' };
              
              const isRejected = d.status === 'draft' && d.rejection_reason;
              const badgeClass = d.status === 'pending_delete' ? 'badge-red' : (isRejected ? 'badge-red' : (statusClasses[d.status] || 'badge-gray'));
              const badgeLabel = d.status === 'pending_delete' ? 'Chờ duyệt xóa' : (isRejected ? 'Từ chối' : (statusLabels[d.status] || d.status));
              const rejectNote = isRejected ? `<div style="font-size:11px;color:var(--danger);margin-top:4px;">Lý do: ${d.rejection_reason}</div>` : '';

              return `<tr>
                <td><div class="dest-name"><div class="dest-dot" style="background:${typeColors[d.type] || '#666'};"></div>${name}</div></td>
                <td><span class="badge badge-blue">${typeLabels[d.type] || d.type}</span></td>
                <td>${d.region || 'Tô Múa'}</td>
                <td style="font-family:ui-monospace,monospace;font-size:12px;color:var(--muted);">${lat.toFixed(4)}, ${lng.toFixed(4)}</td>
                <td>
                  <span class="badge ${badgeClass}">${badgeLabel}</span>
                  ${rejectNote}
                </td>
                <td><div class="actions">
                  ${d.status !== 'pending_delete' ? `<button class="btn-icon" title="Sửa" onclick="editDestination('${d.id}')">✏️</button>` : ''}
                  <button class="btn-icon" title="Xem" onclick="window.open('detail.html?slug=${d.slug}', '_blank')">👁️</button>
                  ${d.status !== 'pending_delete' && d.status !== 'pending' && d.status !== 'pending_edit' ? `<button class="btn-icon" title="Yêu cầu xóa" onclick="requestDeleteDestination('${d.id}')" style="color:var(--danger);">🗑️</button>` : ''}
                </div></td>
              </tr>`;
            }).join('');
          }
          
          // Update route builder destinations
          window.ROUTE_DESTINATIONS = result.data.items.map(d => ({
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
        console.error('Error loading destinations:', error);
      }
    }

    // === VIEW NAVIGATION ===
    function showView(id, el) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-' + id).classList.add('active');
      document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
      if (el) el.classList.add('active');
      const titles = {
        dashboard: I18nNew.get('collab.dashboard', 'Bảng điều khiển'),
        destinations: I18nNew.get('collab.destinations', 'Điểm du lịch'),
        tours: I18nNew.get('collab.tours', 'Lộ trình / Tour'),
        events: I18nNew.get('collab.events', 'Sự kiện')
      };
      document.getElementById('pageTitle').textContent = titles[id] || id;
    }

    // === MODAL: Destination ===
    let modalMap = null;
    let tempMarker = null;
    
    function addVisitorNote(icon = '💡', vi = '', en = '') {
      const div = document.createElement('div');
      div.className = 'visitor-note-item';
      div.style = 'display:flex; gap:8px; margin-bottom:8px;';
      div.innerHTML = `
        <input type="text" class="note-icon-input" value="${icon}" style="width:40px; text-align:center;" />
        <input type="text" class="note-text-vi" value="${vi}" placeholder="Lưu ý (Tiếng Việt)" style="flex:1;" />
        <input type="text" class="note-text-en" value="${en}" placeholder="Note (English)" style="flex:1;" />
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">✕</button>
      `;
      document.getElementById('visitorNotesContainer').appendChild(div);
    }

    function openModal(destId = null) {
      document.getElementById('modalOverlay').classList.add('open');
      document.getElementById('destId').value = destId || '';
      document.getElementById('modalTitle').textContent = destId ? 'Sửa điểm du lịch' : 'Thêm điểm du lịch mới';
      
      const statusGroup = document.getElementById('destStatusGroup');
      const editNotice = document.getElementById('editWorkflowNotice');
      const saveBtn = document.getElementById('btnSaveDest');
      
      if (!destId) {
        // Create mode: show status dropdown, hide edit notice
        statusGroup.style.display = '';
        editNotice.style.display = 'none';
        saveBtn.textContent = '📤 Gửi duyệt';
        
        // Reset form for new destination
        document.getElementById('destNameVi').value = '';
        document.getElementById('destType').value = 'waterfall';
        document.getElementById('destRegion').value = 'Tô Múa';
        document.getElementById('destLat').value = '';
        document.getElementById('destLng').value = '';
        document.getElementById('destDescVi').value = '';
        document.getElementById('destDescEn').value = '';
        document.getElementById('destColor').value = '#0e7490';
        document.getElementById('destStatus').value = 'draft';
        document.getElementById('visitorNotesContainer').innerHTML = '';
      } else {
        // Edit mode: hide status dropdown (auto-managed), show workflow notice
        statusGroup.style.display = 'none';
        editNotice.style.display = 'block';
        saveBtn.textContent = '📤 Gửi sửa đổi';
      }
      
      setTimeout(() => initModalMap(), 300);
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
      modalMap.on('click', function(e) {
        if (tempMarker) modalMap.removeLayer(tempMarker);
        tempMarker = L.marker(e.latlng).addTo(modalMap);
        document.getElementById('destLat').value = e.latlng.lat.toFixed(15);
        document.getElementById('destLng').value = e.latlng.lng.toFixed(15);
      });
      
      setTimeout(() => modalMap.invalidateSize(), 200);
    }

    function closeModal() {
      document.getElementById('modalOverlay').classList.remove('open');
    }
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });

    // === DESTINATION CRUD ===
    async function saveDestination() {
      const id = document.getElementById('destId').value;
      const nameVi = document.getElementById('destNameVi').value.trim();
      const type = document.getElementById('destType').value;
      const region = document.getElementById('destRegion').value.trim();
      const lat = parseFloat(document.getElementById('destLat').value);
      const lng = parseFloat(document.getElementById('destLng').value);
      const descVi = document.getElementById('destDescVi').value.trim();
      const descEn = document.getElementById('destDescEn').value.trim();
      const color = document.getElementById('destColor').value;

      if (!nameVi || isNaN(lat) || isNaN(lng)) {
        alert(I18nNew.get('alert.fill_required', 'Vui lòng điền tên và chọn vị trí trên bản đồ'));
        return;
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

      const data = {
        name: { vi: nameVi },
        type,
        region,
        lat,
        lng,
        description: { vi: descVi, en: descEn || descVi },
        color,
        visitor_notes: visitor_notes.length > 0 ? visitor_notes : null
      };

      // Create mode: include status from dropdown
      // Edit mode: don't send status (backend auto-sets to pending_edit)
      if (!id) {
        data.status = document.getElementById('destStatus').value;
      }

      try {
        let result;
        if (id) {
          result = await apiRequest(`/destinations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
          });
        } else {
          result = await apiRequest('/destinations', {
            method: 'POST',
            body: JSON.stringify(data)
          });
        }

        if (result.success) {
          closeModal();
          loadDestinations();
          loadRoutes();
          loadEvents();
          if (id) {
            alert('Đã gửi yêu cầu sửa đổi đến admin để phê duyệt!');
          } else if (data.status === 'pending') {
            alert('Tạo mới thành công! Đã gửi đến admin để phê duyệt.');
          } else {
            alert('Tạo mới thành công! Đã lưu bản nháp.');
          }
        } else {
          alert(I18nNew.get('alert.error', 'Lỗi: ') + (result.message || I18nNew.get('alert.cannot_save', 'Không thể lưu')));
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
          document.getElementById('destNameVi').value = d.name.vi || '';
          document.getElementById('destType').value = d.type;
          document.getElementById('destRegion').value = d.region || 'Tô Múa';
          document.getElementById('destLat').value = lat;
          document.getElementById('destLng').value = lng;
          document.getElementById('destDescVi').value = d.description?.vi || '';
          document.getElementById('destDescEn').value = d.description?.en || '';
          document.getElementById('destColor').value = d.color || '#0e7490';
          
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
          
          // Store existing metadata
          window.currentDestMetadata = d.metadata || {};
          
          openModal(id);
        }
      } catch (error) {
        alert(I18nNew.get('alert.error', 'Lỗi: ') + error.message);
      }
    }

    async function requestDeleteDestination(id) {
      if (!confirm('Gửi yêu cầu xóa điểm đến này đến admin để phê duyệt?')) return;
      try {
        const result = await apiRequest(`/destinations/${id}/request-delete`, {
          method: 'POST'
        });
        if (result.success) {
          loadDestinations();
          alert('Đã gửi yêu cầu xóa đến admin để phê duyệt!');
        } else {
          alert(I18nNew.get('alert.error', 'Lỗi: ') + (result.message || 'Không thể gửi yêu cầu xóa'));
        }
      } catch (error) {
        alert(I18nNew.get('alert.error', 'Lỗi: ') + error.message);
      }
    }

    // Load data on page load
    document.addEventListener('DOMContentLoaded', () => {
      loadDashboard();
      loadDestinations();
      loadRoutes();
      loadEvents();
    });

    // === MODAL: Route Builder ===
    function getDestinations() { return window.ROUTE_DESTINATIONS || []; }

    let routeMap;
    let routeStopsData = [];
    let routeSegments = [];
    let routeMarkers = [];

    const SEGMENT_COLORS = [
      '#0e7490', '#2d6a4f', '#b45309', '#9f1239', '#6d28d9',
      '#0369a1', '#15803d', '#c2410c', '#7e22ce', '#0f766e'
    ];
    const TRANSPORT_SPEEDS = { walk: 4, bike: 30, car: 40 };
    const OSRM_PROFILES = { walk: 'foot', bike: 'car', car: 'car' };
    let routes = [];
    let editingRouteIdx = -1;
    let draggedIdx = null;
    let osrmRouteCache = {};
    let osrmRouteData = null;

    async function openRouteModal(id) {
      if (typeof id === 'string') {
        // Fetch via API
        try {
          const result = await apiRequest(`/routes/${id}`);
          if (result.success) {
            const r = result.data;
            editingRouteIdx = id;
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
                const dest = getDestinations().find(d => d.id === s.destination_id);
                if (dest) {
                  routeStopsData.push({ ...dest, note: s.description?.vi || '' });
                }
              }
            }
            
            document.getElementById('routeModalOverlay').classList.add('open');
            renderRouteStops();
            setTimeout(() => { routeMap.invalidateSize(); updateRouteMap(); }, 150);
          }
        } catch (e) {
          alert('Lỗi tải lộ trình: ' + e.message);
        }
      } else {
        // New Route
        editingRouteIdx = -1;
        document.getElementById('routeModalTitle').textContent = 'Tạo lộ trình mới';
        document.getElementById('routeName').value = '';
        document.getElementById('routeDesc').value = '';
        document.getElementById('routeStatus').value = 'draft';
        routeStopsData = [];
        
        document.getElementById('routeModalOverlay').classList.add('open');
        renderRouteStops();
        setTimeout(() => { routeMap.invalidateSize(); updateRouteMap(); }, 150);
      }
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
      dd.innerHTML = getDestinations().map(d => {
        const disabled = usedIds.has(d.id);
        return `<div class="rb-dropdown-item${disabled ? ' disabled' : ''}" onclick="${disabled ? '' : `addRouteStop(${d.id})`}">
          <span class="dest-dot" style="background:${d.color}"></span>
          <span>${d.name}</span>
          <span style="margin-left:auto;font-size:11px;color:var(--muted);">${d.area}</span>
        </div>`;
      }).join('');
    }

    function addRouteStop(destId) {
      const dest = getDestinations().find(d => d.id === destId);
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
        ul.innerHTML = '<li style="padding:24px;text-align:center;color:var(--muted);font-size:13px;border:2px dashed var(--border);border-radius:10px;">Chưa có điểm đến nào. Nhấn "Thêm điểm đến" bên dưới.</li>';
        document.getElementById('rbStatStops').textContent = '0';
        document.getElementById('rbStatDist').textContent = '—';
        return;
      }
      ul.innerHTML = routeStopsData.map((s, i) => {
        const segColor = i < routeStopsData.length - 1 ? SEGMENT_COLORS[i % SEGMENT_COLORS.length] : 'var(--border)';
        let dist = 0;
        let timeMin = 0;
        if (i < routeStopsData.length - 1) {
          if (osrmRouteData && osrmRouteData[i]) {
            dist = osrmRouteData[i].distance;
            timeMin = osrmRouteData[i].duration;
          } else {
            dist = haversine(s.lat, s.lng, routeStopsData[i+1].lat, routeStopsData[i+1].lng);
            const speed = TRANSPORT_SPEEDS[document.getElementById('routeTransport').value] || 30;
            timeMin = (dist / speed) * 60;
          }
        }
        const distText = dist > 0 ? formatDist(dist) : '';
        const timeText = timeMin > 0 ? ` · ~${formatTime(timeMin)}` : '';
        const connector = i < routeStopsData.length - 1 ? `<div class="rb-connector" style="--seg-color:${segColor};">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${segColor};flex-shrink:0;"></span>
          <span>${distText}${timeText}</span>
        </div>` : '';
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
      }).join('');
      document.getElementById('rbStatStops').textContent = routeStopsData.length;
      calcRouteDistance();
    }

    function renderRouteStopsOnly() {
      const ul = document.getElementById('routeStops');
      if (routeStopsData.length === 0) return;
      ul.innerHTML = routeStopsData.map((s, i) => {
        const segColor = i < routeStopsData.length - 1 ? SEGMENT_COLORS[i % SEGMENT_COLORS.length] : 'var(--border)';
        let dist = 0;
        let timeMin = 0;
        if (i < routeStopsData.length - 1) {
          if (osrmRouteData && osrmRouteData[i]) {
            dist = osrmRouteData[i].distance;
            timeMin = osrmRouteData[i].duration;
          } else {
            dist = haversine(s.lat, s.lng, routeStopsData[i+1].lat, routeStopsData[i+1].lng);
            const speed = TRANSPORT_SPEEDS[document.getElementById('routeTransport').value] || 30;
            timeMin = (dist / speed) * 60;
          }
        }
        const distText = dist > 0 ? formatDist(dist) : '';
        const timeText = timeMin > 0 ? ` · ~${formatTime(timeMin)}` : '';
        const connector = i < routeStopsData.length - 1 ? `<div class="rb-connector" style="--seg-color:${segColor};">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${segColor};flex-shrink:0;"></span>
          <span>${distText}${timeText}</span>
        </div>` : '';
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
      }).join('');
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
          coords: [[from.lat, from.lng], [to.lat, to.lng]],
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

    // Map update — with real road routing
    async function updateRouteMap() {
      if (!routeMap) return;
      routeMarkers.forEach(m => routeMap.removeLayer(m));
      routeMarkers = [];
      routeSegments.forEach(s => routeMap.removeLayer(s));
      routeSegments = [];

      if (routeStopsData.length === 0) return;

      const transport = document.getElementById('routeTransport').value;
      const osrmProfile = OSRM_PROFILES[transport] || 'car';

      // Show loading indicator
      const loadingDiv = L.divIcon({
        html: '<div style="background:rgba(14,116,144,0.9);color:#fff;padding:6px 14px;border-radius:8px;font-size:13px;font-weight:600;white-space:nowrap;">Đang tìm đường...</div>',
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

        // Glow line
        const glow = L.polyline(coords, {
          color: color, weight: 14, opacity: 0.12, lineCap: 'round', lineJoin: 'round'
        }).addTo(routeMap);
        routeSegments.push(glow);

        // Main road line
        const seg = L.polyline(coords, {
          color: color, weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round'
        }).addTo(routeMap);
        routeSegments.push(seg);

        // Midpoint label
        const midIdx = Math.floor(coords.length / 2);
        const labelIcon = L.divIcon({
          html: `<div class="seg-label" style="border-color:${color};">
            <span class="seg-label-dist">${formatDist(dist)}</span>
            <span class="seg-label-sep">·</span>
            <span class="seg-label-time">~${formatTime(timeMin)}</span>
          </div>`,
          className: '', iconSize: [0, 0], iconAnchor: [40, 14]
        });
        const labelMarker = L.marker([coords[midIdx][0], coords[midIdx][1]], { icon: labelIcon, interactive: false }).addTo(routeMap);
        routeMarkers.push(labelMarker);

        // Direction arrows
        const arrowSpacing = Math.max(3, Math.floor(coords.length / 4));
        for (let j = arrowSpacing; j < coords.length - 1; j += arrowSpacing) {
          const p1 = coords[j];
          const p2 = coords[Math.min(j + 1, coords.length - 1)];
          const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180 / Math.PI;
          const arrowIcon = L.divIcon({
            html: `<div class="seg-arrow" style="transform:rotate(${angle}deg);color:${color};">▸</div>`,
            className: '', iconSize: [12, 12], iconAnchor: [6, 6]
          });
          const arrowMarker = L.marker([p1[0], p1[1]], { icon: arrowIcon, interactive: false }).addTo(routeMap);
          routeMarkers.push(arrowMarker);
        }
      }

      // Draw numbered stop markers
      routeStopsData.forEach((s, i) => {
        const icon = L.divIcon({
          html: `<div class="stop-marker" style="background:${s.color};"><span>${i + 1}</span></div>`,
          className: '', iconSize: [34, 34], iconAnchor: [17, 17]
        });
        const m = L.marker([s.lat, s.lng], { icon }).addTo(routeMap)
          .bindPopup(`<strong>#${i + 1} ${s.name}</strong><br><span style="color:#6b7b6b;font-size:12px;">${s.area}</span>`);
        routeMarkers.push(m);
      });

      // Fit bounds
      const allCoords = segmentResults.flatMap(r => r.coords);
      if (allCoords.length > 0) {
        routeMap.fitBounds(L.latLngBounds(allCoords).pad(0.15));
      } else {
        routeMap.fitBounds(L.latLngBounds(routeStopsData.map(s => [s.lat, s.lng])).pad(0.15));
      }

      // Update stats
      updateRouteStatsOSRM();
      renderRouteStopsOnly();
    }

    function updateRouteStatsOSRM() {
      if (!osrmRouteData || osrmRouteData.length === 0) { calcRouteDistance(); return; }
      let totalDist = 0, totalTime = 0;
      osrmRouteData.forEach(r => { totalDist += r.distance; totalTime += r.duration; });
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
        total += haversine(routeStopsData[i - 1].lat, routeStopsData[i - 1].lng, routeStopsData[i].lat, routeStopsData[i].lng);
      }
      document.getElementById('rbStatDist').textContent = formatDist(total);
    }

    function haversine(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Save route
    async function saveRoute() {
      const name = document.getElementById('routeName').value.trim();
      if (!name) { alert('Vui lòng nhập tên lộ trình.'); return; }
      if (routeStopsData.length === 0) { alert('Vui lòng thêm ít nhất 1 điểm đến.'); return; }

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
        const updateId = typeof editingRouteIdx === 'string' ? editingRouteIdx : null;

        if (updateId) {
          result = await apiRequest(`/routes/${updateId}`, {
            method: 'PUT',
            body: JSON.stringify(routeData)
          });
        } else {
          result = await apiRequest('/routes', {
            method: 'POST',
            body: JSON.stringify(routeData)
          });
        }

        if (result.success) {
          closeRouteModal();
          loadRoutes();
          alert(updateId ? 'Đã gửi yêu cầu sửa đổi đến admin để phê duyệt!' : 'Tạo lộ trình mới thành công! Đang chờ duyệt.');
        } else {
          alert('Lỗi: ' + (result.message || 'Không thể lưu lộ trình'));
        }
      } catch (error) {
        alert('Lỗi: ' + error.message);
      }
    }

    async function loadRoutes() {
      try {
        const result = await apiRequest('/routes');
        if (result.success) {
          routes = result.data.items.map(r => ({
            id: r.id,
            name: r.name?.vi || r.name?.en || 'Unknown',
            desc: r.description?.vi || r.description?.en || '',
            transport: r.transport || 'bike',
            duration: r.duration || 'full',
            difficulty: r.difficulty || 'medium',
            status: r.status || 'draft',
            stops: (r.stops || []).map(s => ({
              id: s.destination_id,
              name: s.destination_name?.vi || s.destination_name?.en || 'Unknown',
              lat: 0,
              lng: 0,
              color: '#0e7490'
            }))
          }));
          renderRouteList();
        }
      } catch (error) {
        console.error('Error loading routes:', error);
      }
    }

    function deleteRoute(idx) {
      if (!confirm('Xóa lộ trình "' + routes[idx].name + '"?')) return;
      routes.splice(idx, 1);
      renderRouteList();
    }

    async function requestDeleteRoute(id) {
      if (!confirm('Gửi yêu cầu xóa lộ trình này đến admin để phê duyệt?')) return;
      try {
        const result = await apiRequest(`/routes/${id}/request-delete`, { method: 'POST' });
        if (result.success) {
          loadRoutes();
          alert('Đã gửi yêu cầu xóa đến admin để phê duyệt!');
        } else {
          alert('Lỗi: ' + (result.message || 'Không thể gửi yêu cầu xóa'));
        }
      } catch (error) {
        alert('Lỗi: ' + error.message);
      }
    }
    window.requestDeleteRoute = requestDeleteRoute;

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
      const statusLabel = { draft: 'Bản nháp', pending: 'Gửi duyệt', pending_edit: 'Chờ duyệt sửa', pending_delete: 'Chờ duyệt xóa' };
      const statusBadge = { draft: 'badge-amber', pending: 'badge-blue', pending_edit: 'badge-amber', pending_delete: 'badge-red' };

      list.innerHTML = routes.map((r, i) => {
        let dist = 0;
        for (let j = 1; j < r.stops.length; j++) {
          dist += haversine(r.stops[j - 1].lat, r.stops[j - 1].lng, r.stops[j].lat, r.stops[j].lng);
        }
        const distStr = dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
        const stopsHtml = r.stops.map((s, si) =>
          `<span class="route-card-stop"><span class="dot" style="background:${s.color}"></span>${s.name.length > 18 ? s.name.slice(0, 18) + '…' : s.name}</span>${si < r.stops.length - 1 ? '<span class="arrow">→</span>' : ''}`
        ).join('');

        return `<div class="route-card">
          <div class="route-card-header">
            <div>
              <div class="route-card-title">${r.name}</div>
              <div class="route-card-badges">
                <span class="badge-transport ${transportBadge[r.transport]}">${transportLabel[r.transport]}</span>
                <span class="badge-difficulty ${difficultyBadge[r.difficulty]}">${difficultyLabel[r.difficulty]}</span>
                <span class="badge ${r.status === 'draft' && r.rejection_reason ? 'badge-red' : statusBadge[r.status]}">${r.status === 'draft' && r.rejection_reason ? 'Từ chối' : statusLabel[r.status]}</span>
              </div>
              ${r.status === 'draft' && r.rejection_reason ? `<div style="font-size:11px;color:var(--danger);margin-top:4px;">Lý do: ${r.rejection_reason}</div>` : ''}
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
              ${r.status !== 'pending_delete' ? `<button class="btn-icon" title="Sửa" onclick="openRouteModal('${r.id}')">✏️</button>` : ''}
              ${r.status !== 'pending_delete' && r.status !== 'pending' && r.status !== 'pending_edit' ? `<button class="btn-icon" title="Yêu cầu xóa" onclick="requestDeleteRoute('${r.id}')" style="color:var(--danger);">🗑️</button>` : ''}
            </div>
          </div>
        </div>`;
      }).join('');
    }

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

    const DEST_COORDS = {
      '1': { lat: 20.8440, lng: 104.8250, name: 'Thác Nàng Tiên' },
      '2': { lat: 20.8402, lng: 104.8424, name: 'Thác 7 Tầng' },
      '3': { lat: 20.8158, lng: 104.8124, name: 'Thác Tạt Cạng' },
      '4': { lat: 20.8190, lng: 104.8085, name: 'Hang động Mường Khoa' },
      '5': { lat: 20.9443, lng: 104.8328, name: 'Hang mộ Tạng Mè' },
      '6': { lat: 20.8323, lng: 104.8313, name: 'Đền thờ Tiên Chúa Bẳng Mương' }
    };

    async function loadEventDestinations() {
      try {
        const result = await apiRequest('/destinations');
        if (result.success) {
          const select = document.getElementById('eventDestId');
          const currentVal = select.value;
          select.innerHTML = '<option value="">— Chọn điểm du lịch —</option>';
          result.data.items.forEach(d => {
            const name = d.name?.vi || d.name?.en || d.name;
            select.innerHTML += `<option value="${d.id}">${name}</option>`;
          });
          select.innerHTML += '<option value="custom">📍 Địa điểm khác...</option>';
          if (currentVal) select.value = currentVal;
        }
      } catch (e) {
        console.error('Error loading event destinations:', e);
      }
    }

    async function openEventModal(eventId) {
      if (typeof eventId === 'string') {
         try {
           const result = await apiRequest(`/events/${eventId}`);
           if (result.success) {
             const e = result.data;
             editingEventId = eventId;
             document.getElementById('eventName').value = e.name?.vi || e.name?.en || '';
             document.getElementById('eventType').value = e.type || 'festival';
             document.getElementById('eventStatus').value = e.status || 'draft';
             document.getElementById('eventStartDate').value = e.start_date || '';
             document.getElementById('eventEndDate').value = e.end_date || '';
             document.getElementById('eventDestId').value = e.destination_id || '';
             document.getElementById('eventLocation').value = e.location || '';
             
             if (e.recurring) {
               document.getElementById('eventRecurring').checked = true;
               document.getElementById('eventFrequency').value = e.recurring_type || 'yearly';
               document.getElementById('eventFrequency').style.display = 'inline-block';
             } else {
               document.getElementById('eventRecurring').checked = false;
               document.getElementById('eventFrequency').style.display = 'none';
             }
             
             selectedEventIcon = e.icon || '🎪';
             document.querySelectorAll('.icon-pick').forEach(btn => {
               btn.classList.toggle('active', btn.dataset.icon === selectedEventIcon);
             });
             
              document.getElementById('eventFormError').style.display = 'none';
              loadEventDestinations();
              document.getElementById('eventModalOverlay').classList.add('open');
              updateEventPreview();
           }
         } catch (err) {
           alert('Lỗi tải sự kiện');
         }
      } else {
         editingEventId = null;
         document.getElementById('eventName').value = '';
         document.getElementById('eventType').value = 'festival';
         document.getElementById('eventStatus').value = 'draft';
         document.getElementById('eventStartDate').value = '';
         document.getElementById('eventEndDate').value = '';
         document.getElementById('eventDestId').value = '';
         document.getElementById('eventLocation').value = '';
         document.getElementById('eventRecurring').checked = false;
         document.getElementById('eventFrequency').style.display = 'none';
         selectedEventIcon = '🎪';
         
         document.querySelectorAll('.icon-pick').forEach(btn => {
           btn.classList.toggle('active', btn.dataset.icon === '🎪');
         });
         
         document.getElementById('eventFormError').style.display = 'none';
         loadEventDestinations();
         document.getElementById('eventModalOverlay').classList.add('open');
         updateEventPreview();
      }
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
      document.getElementById('eventPreviewBanner').style.background = `linear-gradient(135deg, ${meta.color}, ${meta.color}dd)`;

      // Date display
      let dateStr = 'Chọn ngày bên dưới';
      if (startDate) {
        const fmt = d => { const p = d.split('-'); return p[2]+'/'+p[1]+'/'+p[0]; };
        dateStr = endDate ? `${fmt(startDate)} — ${fmt(endDate)}` : fmt(startDate);
      }
      document.getElementById('eventPreviewDate').textContent = dateStr;

      // Status
      const statusMap = { draft: 'Bản nháp', pending: 'Gửi duyệt' };
      document.getElementById('eventPreviewStatus').textContent = statusMap[status] || 'Bản nháp';
    }

    async function loadEvents() {
      try {
        const result = await apiRequest('/events');
        if (result.success) {
          const tbody = document.getElementById('eventsTableBody');
          if (tbody) {
            const typeIcons = { festival: '🎪', season: '🌿', experience: '⛰️', cultural: '🎭', sport: '⚽', food: '🍜', other: '📅' };
            const typeLabels = { festival: 'Lễ hội', season: 'Theo mùa', experience: 'Trải nghiệm', cultural: 'Văn hóa', sport: 'Thể thao', food: 'Ẩm thực', other: 'Khác' };
            const statusLabels = { draft: 'Bản nháp', pending: 'Chờ duyệt', pending_edit: 'Chờ duyệt sửa', pending_delete: 'Chờ duyệt xóa', published: 'Đã xuất bản', archived: 'Lưu trữ', rejected: 'Từ chối' };
            const statusClasses = { draft: 'badge-gray', pending: 'badge-amber', pending_edit: 'badge-amber', pending_delete: 'badge-red', published: 'badge-green', archived: 'badge-gray', rejected: 'badge-red' };
            
            tbody.innerHTML = result.data.items.map(event => {
              const name = event.name.vi || event.name.en || 'Unknown';
              const icon = event.icon || typeIcons[event.type] || '📅';
              const location = event.location || 'Chưa xác định';
              
              const isRejected = event.status === 'draft' && event.rejection_reason;
              const badgeClass = event.status === 'pending_delete' ? 'badge-red' : (isRejected ? 'badge-red' : (statusClasses[event.status] || 'badge-gray'));
              const badgeLabel = event.status === 'pending_delete' ? 'Chờ duyệt xóa' : (isRejected ? 'Từ chối' : (statusLabels[event.status] || event.status));
              const rejectReasonHtml = isRejected ? `<div style="color:var(--danger);font-size:11px;margin-top:4px;">❌ Lý do: ${event.rejection_reason}</div>` : '';
              
              return `<tr>
                <td>
                  <div class="dest-name"><span style="font-size:20px;margin-right:8px;">${icon}</span><span>${name}</span></div>
                </td>
                <td><span class="badge badge-blue">${typeLabels[event.type] || event.type}</span></td>
                <td><span style="font-size:13px;">${event.start_date} — ${event.end_date}</span></td>
                <td><span style="font-size:13px;">${location}</span></td>
                <td>
                  <span class="badge ${badgeClass}">${badgeLabel}</span>
                  ${rejectReasonHtml}
                </td>
                <td><div class="actions">
                  ${event.status !== 'pending_delete' ? `<button class="btn-icon" title="Sửa" onclick="openEventModal('${event.id}')">✏️</button>` : ''}
                  ${event.status !== 'pending_delete' && event.status !== 'pending' && event.status !== 'pending_edit' ? `<button class="btn-icon" title="Yêu cầu xóa" onclick="requestDeleteEvent('${event.id}')" style="color:var(--danger);">🗑️</button>` : ''}
                </div></td>
              </tr>`;
            }).join('');
          }
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
    }

    async function saveEvent() {
      const name = document.getElementById('eventName').value.trim();
      const errorEl = document.getElementById('eventFormError');

      if (!name) {
        errorEl.textContent = 'Vui lòng nhập tên sự kiện.';
        errorEl.style.display = 'block';
        return;
      }

      const eventData = {
        name: { vi: name, en: name },
        type: document.getElementById('eventType').value,
        icon: selectedEventIcon,
        status: document.getElementById('eventStatus').value,
        start_date: document.getElementById('eventStartDate').value,
        end_date: document.getElementById('eventEndDate').value,
        location: document.getElementById('eventLocation').value,
        destination_id: document.getElementById('eventDestId').value || null,
        recurring: document.getElementById('eventRecurring').checked,
        recurring_type: document.getElementById('eventFrequency').value
      };

      try {
        let result;
        if (editingEventId && typeof editingEventId === 'string') {
          result = await apiRequest(`/events/${editingEventId}`, {
            method: 'PUT',
            body: JSON.stringify(eventData)
          });
        } else {
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
          alert('Lỗi: ' + (result.message || 'Không thể lưu'));
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
          alert('Xóa thành công!');
        } else {
          alert('Lỗi: ' + (result.message || 'Không thể xóa'));
        }
      } catch (error) {
        alert('Lỗi: ' + error.message);
      }
    }

    async function requestDeleteEvent(id) {
      if (!confirm('Gửi yêu cầu xóa sự kiện này đến admin để phê duyệt?')) return;
      try {
        const result = await apiRequest(`/events/${id}/request-delete`, { method: 'POST' });
        if (result.success) {
          loadEvents();
          alert('Đã gửi yêu cầu xóa đến admin để phê duyệt!');
        } else {
          alert('Lỗi: ' + (result.message || 'Không thể gửi yêu cầu xóa'));
        }
      } catch (error) {
        alert('Lỗi: ' + error.message);
      }
    }
    window.requestDeleteEvent = requestDeleteEvent;

// Close route modal on overlay click
    document.getElementById('routeModalOverlay').addEventListener('click', function(e) {
      if (e.target === this) closeRouteModal();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.rb-add-dest')) {
        document.getElementById('destDropdown').classList.remove('open');
      }
    });

    // Close event modal on overlay click
    document.getElementById('eventModalOverlay').addEventListener('click', function(e) {
      if (e.target === this) closeEventModal();
    });

    // Close change password modal on overlay click
    document.getElementById('changePasswordOverlay').addEventListener('click', function(e) {
      if (e.target === this) closeChangePasswordModal();
    });

    // === LOGOUT ===
    function handleLogout() {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tm_user');
      localStorage.removeItem('tm_role');
      sessionStorage.clear();
      window.location.href = 'login.html';
    }

// === WINDOW EXPORTS FOR ONCLICK HANDLERS ===
window.showView = showView;
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

window.handleLogout = handleLogout;
window.openModal = openModal;
window.closeModal = closeModal;
window.saveDestination = saveDestination;
window.editDestination = editDestination;
window.requestDeleteDestination = requestDeleteDestination;
window.openRouteModal = openRouteModal;
window.closeRouteModal = closeRouteModal;
window.toggleDestDropdown = toggleDestDropdown;
window.saveRoute = saveRoute;
window.deleteRoute = deleteRoute;
window.openEventModal = openEventModal;
window.closeEventModal = closeEventModal;
window.pickEventIcon = pickEventIcon;
window.saveEvent = saveEvent;
window.deleteEvent = deleteEvent;
window.addVisitorNote = addVisitorNote;
window.addRouteStop = addRouteStop;
window.removeRouteStop = removeRouteStop;
window.updateStopNote = updateStopNote;
window.onStopDragStart = onStopDragStart;
window.onStopDragOver = onStopDragOver;
window.onStopDragLeave = onStopDragLeave;
window.onStopDrop = onStopDrop;
window.onStopDragEnd = onStopDragEnd;
window.updateEventPreview = updateEventPreview;
window.updateEventLocation = updateEventLocation;
window.toggleRecurrence = toggleRecurrence;
window.loadRoutes = loadRoutes;
window.loadEvents = loadEvents;
window.openChangePasswordModal = openChangePasswordModal;
window.closeChangePasswordModal = closeChangePasswordModal;
window.handleChangePassword = handleChangePassword;
