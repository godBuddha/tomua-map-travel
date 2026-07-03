const db = require('./src/config/database');
const Settings = require('./src/models/settings.model');

const initialSettings = [
  {
    key: 'mapCenter',
    value: [20.82513945413156, 104.83688523315758],
    description: 'Toạ độ trung tâm bản đồ (Vĩ độ, Kinh độ)'
  },
  {
    key: 'contactPhone',
    value: '0212 3848 111',
    description: 'Số điện thoại liên hệ'
  },
  {
    key: 'contactEmail',
    value: 'ubnd@tomua.sonla.gov.vn',
    description: 'Email liên hệ'
  },
  {
    key: 'socialFacebook',
    value: 'https://facebook.com/tomuasonla',
    description: 'Link Fanpage Facebook'
  }
];

async function seed() {
  try {
    for (const s of initialSettings) {
      await Settings.update(s.key, s.value, s.description, null);
    }
    console.log('Seed settings successfully');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    process.exit(0);
  }
}

seed();
