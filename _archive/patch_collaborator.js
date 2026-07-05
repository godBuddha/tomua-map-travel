const fs = require('fs');
const file = '/Volumes/PortableSSD/tomua-map-travel/client/collaborator.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Routes Patch
const routesRegex = /let routes = \[\];[\s\S]*?(?=\/\/\s*=== OSRM)/;
const newRoutesLogic = `let routes = [];

    async function loadRoutes() {
      try {
        const result = await apiRequest('/routes');
        if (result.success) {
          routes = result.data.items || [];
          renderRouteList();
        }
      } catch (e) {
        console.error('Error loading routes:', e);
      }
    }

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
        const updateId = typeof editingRouteIdx === 'string' ? editingRouteIdx : (editingRouteIdx >= 0 && routes[editingRouteIdx] ? routes[editingRouteIdx].id : null);
        
        if (updateId) {
          result = await apiRequest(\`/routes/\${updateId}\`, {
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
          alert(updateId ? 'Cập nhật lộ trình thành công!' : 'Tạo lộ trình thành công!');
        } else {
          alert(I18nNew.get('alert.error', 'Lỗi: ') + (result.message || 'Không thể lưu'));
        }
      } catch (error) {
        alert(I18nNew.get('alert.error', 'Lỗi: ') + error.message);
      }
    }

    async function deleteRoute(idx) {
      const route = typeof idx === 'string' ? routes.find(r => r.id === idx) : routes[idx];
      const id = route ? route.id : idx;
      
      if (!confirm('Bạn có chắc muốn xóa lộ trình này?')) return;
      
      try {
        const result = await apiRequest(\`/routes/\${id}\`, { method: 'DELETE' });
        if (result.success) {
          loadRoutes();
          alert('Xóa thành công!');
        } else {
          alert('Lỗi: ' + (result.message || 'Không thể xóa'));
        }
      } catch (error) {
        alert('Lỗi: ' + error.message);
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
      const statusLabel = { draft: 'Bản nháp', pending: 'Chờ duyệt', published: 'Đã duyệt', rejected: 'Từ chối' };
      const statusBadge = { draft: 'badge-amber', pending: 'badge-blue', published: 'badge-green', rejected: 'badge-red' };

      list.innerHTML = routes.map((r, i) => {
        let dist = 0;
        // Parse stops safely
        const parsedStops = Array.isArray(r.stops) ? r.stops : [];
        const stopsHtml = parsedStops.map((s, si) => {
          const sName = s.destination?.name?.vi || s.name?.vi || s.name || 'Điểm đến';
          const sColor = s.destination?.color || s.color || '#0e7490';
          return \`<span class="route-card-stop"><span class="dot" style="background:\${sColor}"></span>\${sName.length > 18 ? sName.slice(0, 18) + '…' : sName}</span>\${si < parsedStops.length - 1 ? '<span class="arrow">→</span>' : ''}\`
        }).join('');

        const rName = r.name?.vi || r.name || 'Lộ trình';
        const rDesc = r.description?.vi || r.desc || '';
        
        let rejectReasonHtml = '';
        if (r.status === 'draft' && r.comments && r.comments.length > 0) {
           const rejectedCmt = r.comments.find(c => c.action === 'reject');
           if (rejectedCmt) {
             rejectReasonHtml = \`<div style="color:var(--danger);font-size:12px;margin-top:8px;padding:8px;background:#fee2e2;border-radius:4px;">❌ Bị từ chối: \${rejectedCmt.comment}</div>\`;
           }
        }

        return \`<div class="route-card">
          <div class="route-card-header">
            <div>
              <div class="route-card-title">\${rName}</div>
              <div class="route-card-badges">
                <span class="badge-transport \${transportBadge[r.transport] || ''}">\${transportLabel[r.transport] || r.transport}</span>
                <span class="badge-difficulty \${difficultyBadge[r.difficulty] || ''}">\${difficultyLabel[r.difficulty] || r.difficulty}</span>
                <span class="badge \${statusBadge[r.status] || ''}">\${statusLabel[r.status] || r.status}</span>
              </div>
            </div>
          </div>
          \${rDesc ? \`<div class="route-card-desc">\${rDesc}</div>\` : ''}
          \${rejectReasonHtml}
          <div class="route-card-stops">\${stopsHtml}</div>
          <div class="route-card-footer">
            <div class="route-card-stats">
              <span>📍 \${parsedStops.length} điểm</span>
              <span>⏱ \${durationLabel[r.duration] || r.duration}</span>
            </div>
            <div class="route-card-actions">
              <button class="btn-icon" title="Sửa" onclick="openRouteModal('\${r.id}')">✏️</button>
              <button class="btn-icon" title="Xóa" onclick="deleteRoute('\${r.id}')" style="color:red">🗑️</button>
            </div>
          </div>
        </div>\`;
      }).join('');
    }

    `;

content = content.replace(routesRegex, newRoutesLogic);


// 2. Events Patch
const eventsRegex = /function saveEvent\(\) \{[\s\S]*?\}\s*(?=\/\/\s*Close route modal)/;
const newEventsLogic = `async function loadEvents() {
      try {
        const result = await apiRequest('/events');
        if (result.success) {
          const tbody = document.getElementById('eventsTableBody');
          if (tbody) {
            const typeIcons = { festival: '🎪', season: '🌿', experience: '⛰️', cultural: '🎭', sport: '⚽', food: '🍜', other: '📅' };
            const typeLabels = { festival: 'Lễ hội', season: 'Theo mùa', experience: 'Trải nghiệm', cultural: 'Văn hóa', sport: 'Thể thao', food: 'Ẩm thực', other: 'Khác' };
            const statusLabels = { draft: 'Bản nháp', pending: 'Chờ duyệt', published: 'Đã xuất bản', archived: 'Lưu trữ', rejected: 'Từ chối' };
            const statusClasses = { draft: 'badge-gray', pending: 'badge-amber', published: 'badge-green', archived: 'badge-gray', rejected: 'badge-red' };
            
            tbody.innerHTML = result.data.items.map(event => {
              const name = event.name.vi || event.name.en || 'Unknown';
              const icon = event.icon || typeIcons[event.type] || '📅';
              const location = event.location || 'Chưa xác định';
              
              let rejectReasonHtml = '';
              if (event.status === 'draft' && event.comments && event.comments.length > 0) {
                 const rejectedCmt = event.comments.find(c => c.action === 'reject');
                 if (rejectedCmt) {
                   rejectReasonHtml = \`<div style="color:var(--danger);font-size:11px;margin-top:4px;">❌ Lý do: \${rejectedCmt.comment}</div>\`;
                 }
              }
              
              return \`<tr>
                <td>
                  <div class="dest-name"><span style="font-size:20px;margin-right:8px;">\${icon}</span><span>\${name}</span></div>
                  \${rejectReasonHtml}
                </td>
                <td><span class="badge badge-blue">\${typeLabels[event.type] || event.type}</span></td>
                <td><span style="font-size:13px;">\${event.start_date} — \${event.end_date}</span></td>
                <td><span style="font-size:13px;">\${location}</span></td>
                <td><span class="badge \${statusClasses[event.status] || 'badge-gray'}">\${statusLabels[event.status] || event.status}</span></td>
                <td><div class="actions">
                  <button class="btn-icon" title="Sửa" onclick="openEventModal('\${event.id}')">✏️</button>
                  <button class="btn-icon" title="Xóa" onclick="deleteEvent('\${event.id}')" style="color:red">🗑️</button>
                </div></td>
              </tr>\`;
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
          result = await apiRequest(\`/events/\${editingEventId}\`, {
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
        const result = await apiRequest(\`/events/\${id}\`, { method: 'DELETE' });
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
`;
content = content.replace(eventsRegex, newEventsLogic);

// 3. openRouteModal Fix - Need to fetch via API if it's a string ID
const openRouteRegex = /function openRouteModal\(idx\) \{[\s\S]*?(?=function closeRouteModal)/;
const newOpenRouteLogic = `async function openRouteModal(id) {
      if (typeof id === 'string') {
        // Fetch via API
        try {
          const result = await apiRequest(\`/routes/\${id}\`);
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
                const dest = DESTINATIONS.find(d => d.id === s.destination_id);
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

    `;
content = content.replace(openRouteRegex, newOpenRouteLogic);

// 4. openEventModal Fix
const openEventRegex = /function openEventModal\(eventId\) \{[\s\S]*?(?=function closeEventModal)/;
const newOpenEventLogic = `async function openEventModal(eventId) {
      if (typeof eventId === 'string') {
         try {
           const result = await apiRequest(\`/events/\${eventId}\`);
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
         document.getElementById('eventModalOverlay').classList.add('open');
         updateEventPreview();
      }
    }

    `;
content = content.replace(openEventRegex, newOpenEventLogic);

// 5. Add to DOMContentLoaded
const domLoadRegex = /loadDestinations\(\);\s*\n/;
const domLoadReplacement = `loadDestinations();
      loadRoutes();
      loadEvents();
`;
content = content.replace(domLoadRegex, domLoadReplacement);


fs.writeFileSync(file, content);
console.log('Successfully patched collaborator.html');
