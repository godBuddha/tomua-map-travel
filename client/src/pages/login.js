const API_BASE = '/api';
let pendingMfaUserId = null;

export function initLoginPage() {
  document.body.classList.add('page-fade-in');

  // Init i18n
  if (typeof I18nNew !== 'undefined') {
    I18nNew.init('login');
  }

  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // MFA form
  const mfaFormEl = document.querySelector('#mfaForm form');
  if (mfaFormEl) {
    mfaFormEl.addEventListener('submit', handleMfaVerify);
  }

  // Backup code form
  const backupFormEl = document.querySelector('#backupCodeForm form');
  if (backupFormEl) {
    backupFormEl.addEventListener('submit', handleBackupVerify);
  }

  // Register form
  const registerFormEl = document.querySelector('#registerForm form');
  if (registerFormEl) {
    registerFormEl.addEventListener('submit', handleRegister);
  }

  // Password toggle
  const togglePwBtn = document.querySelector('.toggle-pw');
  if (togglePwBtn) {
    togglePwBtn.addEventListener('click', togglePassword);
  }

  // Clear errors on input
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');
  if (usernameEl) {
    usernameEl.addEventListener('input', () => hideError('formError'));
  }
  if (passwordEl) {
    passwordEl.addEventListener('input', () => hideError('formError'));
  }

  // Load destination count from API
  loadDestinationCount();
}

async function loadDestinationCount() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (data.success && data.data) {
      const el = document.getElementById('destCount');
      if (el) el.textContent = data.data.destinations || 0;
    }
  } catch (e) {}
}

function togglePassword() {
  const pw = document.getElementById('password');
  const icon = document.getElementById('eyeIcon');
  if (!pw || !icon) return;

  if (pw.type === 'password') {
    pw.type = 'text';
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    pw.type = 'password';
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

function showError(elId, msg) {
  const el = document.getElementById(elId);
  const textEl = el?.querySelector('span') || document.getElementById(elId + 'Text');
  if (el && textEl) {
    textEl.textContent = msg;
    el.classList.add('show');
  }
}

function hideError(elId) {
  const el = document.getElementById(elId);
  if (el) el.classList.remove('show');
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const btn = document.getElementById('btnLogin');

  if (!username || !password) {
    showError('formError', typeof I18nNew !== 'undefined' ? I18nNew.get('error_empty', 'Vui lòng điền đầy đủ thông tin') : 'Vui lòng điền đầy đủ thông tin');
    return false;
  }

  hideError('formError');
  btn.classList.add('loading');

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    btn.classList.remove('loading');

    if (data.success) {
      if (data.data.mfa_required) {
        pendingMfaUserId = data.data.user_id;
        showMfaForm();
        return false;
      }

      const { user, accessToken, refreshToken } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tm_user', JSON.stringify(user));
      localStorage.setItem('tm_role', user.role);
      window.location.href = user.role === 'collaborator' ? 'collaborator.html' : 'admin.html';
    } else {
      showError('formError', data.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
    }
  } catch (error) {
    btn.classList.remove('loading');
    showError('formError', 'Lỗi kết nối: ' + error.message);
  }

  return false;
}

function showMfaForm() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('mfaForm').style.display = 'block';
  document.getElementById('backupCodeForm').style.display = 'none';
  document.getElementById('mfaToken').focus();
}

window.showMfaForm = showMfaForm;

function showBackupCodeForm() {
  document.getElementById('mfaForm').style.display = 'none';
  document.getElementById('backupCodeForm').style.display = 'block';
  document.getElementById('backupCode').focus();
}

window.showBackupCodeForm = showBackupCodeForm;

async function handleMfaVerify(e) {
  e.preventDefault();
  const token = document.getElementById('mfaToken').value.trim();
  const btn = document.getElementById('btnMfa');

  if (!token || token.length !== 6) {
    showError('mfaError', 'Vui lòng nhập mã 6 số');
    return false;
  }

  hideError('mfaError');
  btn.classList.add('loading');

  try {
    const response = await fetch(`${API_BASE}/mfa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: pendingMfaUserId, token })
    });

    const data = await response.json();
    btn.classList.remove('loading');

    if (data.success) {
      const { user, accessToken, refreshToken } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tm_user', JSON.stringify(user));
      localStorage.setItem('tm_role', user.role);
      window.location.href = user.role === 'collaborator' ? 'collaborator.html' : 'admin.html';
    } else {
      showError('mfaError', data.message || 'Mã xác thực không đúng');
    }
  } catch (error) {
    btn.classList.remove('loading');
    showError('mfaError', 'Lỗi kết nối: ' + error.message);
  }

  return false;
}

async function handleBackupVerify(e) {
  e.preventDefault();
  const backupCode = document.getElementById('backupCode').value.trim();
  const btn = document.getElementById('btnBackup');

  if (!backupCode) {
    showError('backupError', 'Vui lòng nhập mã dự phòng');
    return false;
  }

  hideError('backupError');
  btn.classList.add('loading');

  try {
    const response = await fetch(`${API_BASE}/mfa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: pendingMfaUserId, backupCode })
    });

    const data = await response.json();
    btn.classList.remove('loading');

    if (data.success) {
      const { user, accessToken, refreshToken } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tm_user', JSON.stringify(user));
      localStorage.setItem('tm_role', user.role);
      window.location.href = user.role === 'collaborator' ? 'collaborator.html' : 'admin.html';
    } else {
      showError('backupError', data.message || 'Mã dự phòng không đúng');
    }
  } catch (error) {
    btn.classList.remove('loading');
    showError('backupError', 'Lỗi kết nối: ' + error.message);
  }

  return false;
}

function showRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.querySelector('.form-header').style.display = 'none';
  document.querySelector('.form-divider').style.display = 'none';
  document.querySelector('.lang-selector').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

window.showRegister = showRegister;

function showLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.querySelector('.form-header').style.display = 'block';
  document.querySelector('.form-divider').style.display = 'block';
  document.querySelector('.lang-selector').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
}

window.showLogin = showLogin;

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;
  const btn = document.getElementById('btnRegister');

  if (!name || !email || !username || !password) {
    showError('registerError', 'Vui lòng điền đầy đủ thông tin');
    return false;
  }

  if (password.length < 6) {
    showError('registerError', 'Mật khẩu phải có tối thiểu 6 ký tự');
    return false;
  }

  hideError('registerError');
  btn.classList.add('loading');

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, username, password })
    });

    const data = await response.json();
    btn.classList.remove('loading');

    if (data.success) {
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      showLogin();
      document.getElementById('username').value = username;
      document.getElementById('password').value = password;
    } else {
      showError('registerError', data.message || 'Đăng ký thất bại');
    }
  } catch (error) {
    btn.classList.remove('loading');
    showError('registerError', 'Lỗi kết nối: ' + error.message);
  }

  return false;
}

// Language change
function changeLang(lang) {
  if (typeof I18nNew !== 'undefined') {
    I18nNew.setLang(lang);
  }
}

window.changeLang = changeLang;

// Init on DOM ready
initLoginPage();
