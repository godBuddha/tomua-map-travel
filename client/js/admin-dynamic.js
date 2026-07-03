// dynamic functionalities for Settings and I18n Content in Admin Panel

// === SETTINGS MANAGEMENT ===
async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.data) {
      const settings = data.data;
      if (settings.mapCenter) document.getElementById('settingsMapCenter').value = settings.mapCenter.join(', ');
      if (settings.contactPhone) document.getElementById('settingsContactPhone')?.setAttribute('value', settings.contactPhone); // Will add this input if needed
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

async function saveSettings() {
  const btn = document.getElementById('btnSaveSettings');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Đang lưu...';
  btn.disabled = true;

  try {
    const token = localStorage.getItem('accessToken');
    
    // Example: Save map center
    const mapCenterStr = document.getElementById('settingsMapCenter').value;
    const mapCenter = mapCenterStr.split(',').map(s => parseFloat(s.trim()));
    
    if (mapCenter.length === 2 && !isNaN(mapCenter[0]) && !isNaN(mapCenter[1])) {
      await fetch('/api/settings/mapCenter', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ value: mapCenter, description: 'Toạ độ trung tâm bản đồ (Vĩ độ, Kinh độ)' })
      });
    }

    alert('Lưu cài đặt thành công!');
  } catch (error) {
    alert('Lỗi lưu cài đặt: ' + error.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// === OVERRIDE CONTENT_DB BEHAVIOR ===
window.fetchTranslationsFromDB = async function() {
  try {
    const res = await fetch('/api/i18n/export/all');
    const json = await res.json();
    if (json.success && json.data) {
      // Merge json.data into the global CONTENT_DB in memory
      // json.data is formatted as: { "vi": { "key": "value" }, "en": { ... } }
      const dbLangs = Object.keys(json.data);
      
      CONTENT_DB.forEach(item => {
        dbLangs.forEach(lang => {
          if (json.data[lang] && json.data[lang][item.key] !== undefined) {
            item[lang] = json.data[lang][item.key];
          }
        });
      });
    }
  } catch (error) {
    console.error('Failed to load translations from DB:', error);
  }
};

window.saveContentEditToDB = async function(page, key, lang, value) {
  try {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`/api/i18n/${page}/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ lang, value })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
  } catch (error) {
    console.error('Save I18n to DB Error:', error);
    alert('Không thể lưu nội dung vào cơ sở dữ liệu: ' + error.message);
    throw error;
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  if (window.fetchTranslationsFromDB) {
    await window.fetchTranslationsFromDB();
    if (typeof renderContentList === 'function') renderContentList();
  }
  if (typeof loadSettings === 'function') {
    await loadSettings();
  }
});
