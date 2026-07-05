export function renderFooter(containerId = 'footer') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <footer>
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3>🏛️ Xã Tô Múa</h3>
            <p>Bản đồ số du lịch xã Tô Múa. Dự án phục vụ phát triển du lịch cộng đồng.</p>
          </div>
          <div class="footer-col">
            <h4>Điều hướng</h4>
            <a href="index.html">Trang chủ</a>
            <a href="map.html">Bản đồ</a>
            <a href="about.html">Giới thiệu</a>
          </div>
          <div class="footer-col">
            <h4>Liên hệ</h4>
            <a href="#">UBND xã Tô Múa</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Xã Tô Múa</span>
        </div>
      </div>
    </footer>
  `;
}
