const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '../client');
const adminFile = path.join(clientDir, 'admin.html');

// 1. Scan all HTML files for data-i18n keys
const keysFound = new Set();
const files = fs.readdirSync(clientDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(clientDir, file), 'utf8');
  // Match data-i18n="key"
  const regex = /data-i18n="([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keysFound.add(match[1]);
  }
});

console.log(`Found ${keysFound.size} keys in HTML files.`);

// 2. Parse admin.html to find existing keys in CONTENT_DB
let adminHtml = fs.readFileSync(adminFile, 'utf8');
const existingKeys = new Set();
const existingRegex = /{ key: '([^']+)'/g;
let match2;
while ((match2 = existingRegex.exec(adminHtml)) !== null) {
  existingKeys.add(match2[1]);
}

console.log(`Found ${existingKeys.size} keys in CONTENT_DB.`);

// 3. Find missing keys
const missingKeys = [...keysFound].filter(k => !existingKeys.has(k));
console.log(`Missing keys (${missingKeys.length}):`, missingKeys);

// 4. If missing keys exist, append them to CONTENT_DB
if (missingKeys.length > 0) {
  // We'll insert them right before "    ];" which ends CONTENT_DB
  const insertIndex = adminHtml.indexOf('    ];\n\n    const CONTENT_DB');
  if (insertIndex > -1) {
    // Actually, CONTENT_DB is defined as const CONTENT_DB = [ ... ];
    // We should find the end of CONTENT_DB array.
    const startIdx = adminHtml.indexOf('const CONTENT_DB = [');
    const endIdx = adminHtml.indexOf('    ];', startIdx);
    
    let injectedString = '';
    missingKeys.forEach(k => {
      // Basic formatting for new items
      injectedString += `      { key: '${k}', page: 'other', section: 'Nội dung bổ sung', type: 'short', vi: '${k}' },\n`;
    });

    const newAdminHtml = adminHtml.slice(0, endIdx) + injectedString + adminHtml.slice(endIdx);
    fs.writeFileSync(adminFile, newAdminHtml, 'utf8');
    console.log('Successfully injected missing keys into admin.html');
  } else {
    // Try to find the exact end index
    const endIdx = adminHtml.lastIndexOf('    ];');
    let injectedString = '';
    missingKeys.forEach(k => {
      injectedString += `      { key: '${k}', page: 'other', section: 'Nội dung bổ sung', type: 'short', vi: '${k}', en: '${k}', ko: '${k}', ru: '${k}', th: '${k}', zh: '${k}', id: '${k}', ms: '${k}', lo: '${k}', es: '${k}', fr: '${k}', de: '${k}' },\n`;
    });
    const newAdminHtml = adminHtml.slice(0, endIdx) + injectedString + adminHtml.slice(endIdx);
    fs.writeFileSync(adminFile, newAdminHtml, 'utf8');
    console.log('Successfully injected missing keys into admin.html');
  }
}
