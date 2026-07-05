import api from '../services/api.js';

export function renderNavbar(containerId = 'navbar', options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { activePage = '', showAuth = true } = options;
  const isLoggedIn = api.isAuthenticated();
  const user = JSON.parse(localStorage.getItem('tm_user') || '{}');

  const navLinks = [
    { href: 'index.html', label: 'Trang chủ', page: 'home' },
    { href: 'map.html', label: 'Bản đồ', page: 'map' },
    { href: 'about.html', label: 'Giới thiệu', page: 'about' },
  ];

  if (isLoggedIn) {
    navLinks.push({ href: 'admin.html', label: 'Quản trị', page: 'admin' });
  }

  container.innerHTML = `
    <nav class="navbar" id="mainNav">
      <div class="nav-inner">
        <a href="index.html" class="nav-logo">
          <img src="/mqr19fer-logo-to_-mu_a.jpg" alt="Logo" />
          <span>Tô Múa</span>
        </a>
        <div class="nav-links">
          ${navLinks.map(link => `
            <a href="${link.href}" class="${link.page === activePage ? 'active' : ''}">${link.label}</a>
          `).join('')}
        </div>
        <div class="nav-right">
          ${isLoggedIn ? `
            <span class="nav-user">${user.name || 'User'}</span>
            <button class="btn btn-sm btn-outline" onclick="handleLogout()">Đăng xuất</button>
          ` : `
            <a href="login.html" class="btn btn-sm btn-primary">Đăng nhập</a>
          `}
        </div>
      </div>
    </nav>
  `;

  // Scroll effect
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

function handleLogout() {
  api.logout();
  window.location.href = 'login.html';
}

window.handleLogout = handleLogout;
