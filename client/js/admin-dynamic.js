// dynamic functionalities for Settings in Admin Panel

// === SETTINGS MANAGEMENT ===
async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.data) {
      const settings = data.data;
      if (settings.siteName) document.getElementById('settingsSiteName').value = settings.siteName;
      if (settings.defaultLang) document.getElementById('settingsDefaultLang').value = settings.defaultLang;
      if (settings.languages) document.getElementById('settingsLanguages').value = settings.languages;
      if (settings.mapCenter) document.getElementById('settingsMapCenter').value = settings.mapCenter.join(', ');
      if (settings.description) document.getElementById('settingsDescription').value = settings.description;
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
    
    const siteName = document.getElementById('settingsSiteName').value.trim();
    const defaultLang = document.getElementById('settingsDefaultLang').value;
    const languages = document.getElementById('settingsLanguages').value.trim();
    const mapCenterStr = document.getElementById('settingsMapCenter').value;
    const description = document.getElementById('settingsDescription').value.trim();
    
    const mapCenter = mapCenterStr.split(',').map(s => parseFloat(s.trim()));
    
    const settingsToSave = [
      { key: 'siteName', value: siteName, description: 'Tên website' },
      { key: 'defaultLang', value: defaultLang, description: 'Ngôn ngữ mặc định' },
      { key: 'languages', value: languages, description: 'Ngôn ngữ hỗ trợ' },
      { key: 'description', value: description, description: 'Mô tả website' }
    ];
    
    if (mapCenter.length === 2 && !isNaN(mapCenter[0]) && !isNaN(mapCenter[1])) {
      settingsToSave.push({ key: 'mapCenter', value: mapCenter, description: 'Toạ độ trung tâm bản đồ (Vĩ độ, Kinh độ)' });
    }

    for (const setting of settingsToSave) {
      await fetch(`/api/settings/${setting.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ value: setting.value, description: setting.description })
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

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof loadSettings === 'function') {
    await loadSettings();
  }
});
