const fs = require('fs');
const path = require('path');

const adminFile = path.join(__dirname, '../client/admin.html');
let html = fs.readFileSync(adminFile, 'utf8');

// We will find all lines in CONTENT_DB that have `page: 'other'` and change their page and section based on key.
const lines = html.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("page: 'other'") && lines[i].includes("key:")) {
    // Extract key
    const match = lines[i].match(/key:\s*'([^']+)'/);
    if (match) {
      const key = match[1];
      let newPage = 'other';
      let newSection = 'Nội dung bổ sung';

      if (key.startsWith('merge.') || key.startsWith('diagram.') || key.startsWith('stats.') || key.startsWith('contact.') || key.startsWith('about.hero')) {
        newPage = 'about';
        newSection = 'Giới thiệu (About)';
      } else if (key.startsWith('nav.') || key.startsWith('footer.') || key.startsWith('hero.')) {
        newPage = 'index';
        newSection = 'Thành phần chung';
      } else if (key.startsWith('admin.') || key.startsWith('collab.') || key.startsWith('gallery.') || key.startsWith('notes.') || key.startsWith('sidebar.')) {
        newPage = 'admin'; // Note: admin is not typically in pageLabels but let's use it
        newSection = 'Giao diện Quản trị';
      } else if (key.startsWith('map.') || key.startsWith('type.') || key.startsWith('legend.') || key.startsWith('info.')) {
        newPage = 'map';
        newSection = 'Bản đồ';
      } else if (key.startsWith('login') || key.startsWith('label_') || key.startsWith('btn_') || key.startsWith('error_') || key === 'remember_me' || key === 'forgot_pw' || key === 'or') {
        newPage = 'login';
        newSection = 'Đăng nhập';
      } else if (key.startsWith('events.') || key.startsWith('routes.')) {
        newPage = 'index';
        newSection = 'Trang chủ';
      }

      if (newPage !== 'other') {
        lines[i] = lines[i].replace(/page:\s*'other'/, `page: '${newPage}'`);
        lines[i] = lines[i].replace(/section:\s*'Nội dung bổ sung'/, `section: '${newSection}'`);
      }
    }
  }
}

fs.writeFileSync(adminFile, lines.join('\n'), 'utf8');
console.log('Fixed pages and sections in admin.html');
