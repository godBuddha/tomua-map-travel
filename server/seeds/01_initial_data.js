const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Security: Use environment variables for default passwords
  const adminPassword = process.env.ADMIN_PASSWORD || 'CHANGE_ME_ON_FIRST_LOGIN';
  const ctvPassword = process.env.CTV_PASSWORD || 'CHANGE_ME_ON_FIRST_LOGIN';

  // Clear existing data
  await knex('approval_comments').del();
  await knex('route_stops').del();
  await knex('destination_images').del();
  await knex('events').del();
  await knex('routes').del();
  await knex('destinations').del();
  await knex('i18n_content').del();
  await knex('refresh_tokens').del();
  await knex('users').del();

  // Create admin user
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  const [admin] = await knex('users').insert({
    name: 'Administrator',
    email: 'admin@tomua.vn',
    username: 'admin',
    password_hash: adminPasswordHash,
    role: 'admin',
    status: 'active'
  }).returning('id');

  // Create collaborator user
  const ctvPasswordHash = await bcrypt.hash(ctvPassword, 12);
  const [collaborator] = await knex('users').insert({
    name: 'Cộng tác viên 1',
    email: 'ctv1@tomua.vn',
    username: 'ctv1',
    password_hash: ctvPasswordHash,
    role: 'collaborator',
    status: 'active'
  }).returning('id');

  // Create destinations
  const destinations = [
    {
      slug: 'thac-nang-tien',
      name: JSON.stringify({
        vi: 'Thác Nàng Tiên', en: 'Fairy Waterfall', ko: '요정 폭포', ru: 'Водопад Фея',
        th: 'น้ำตกนางฟ้า', zh: '仙女瀑布', id: 'Air Terjun Peri', ms: 'Air Terjun Fairy',
        lo: 'ນ້ຳຕົກນາງຟ້າ', es: 'Cascada del Hada', fr: 'Cascade de la Fée', de: 'Feenwasserfall'
      }),
      type: 'waterfall',
      region: 'Tô Múa',
      description: JSON.stringify({
        vi: 'Thác Nàng Tiên là một trong những thác nước đẹp nhất của xã Tô Múa, với làn nước trong xanh và khung cảnh thiên nhiên hùng vĩ.',
        en: 'Fairy Waterfall is one of the most beautiful waterfalls in To Mua commune, with crystal clear water and magnificent natural scenery.',
        ko: '요정 폭포는 또무아 면에서 가장 아름다운 폭포 중 하나로, 맑은 물과 장엄한 자연 경관을 자랑합니다.',
        ru: 'Водопад Фея — один из самых красивых водопадов коммуны То Муа с кристально чистой водой и величественным природным пейзажем.',
        th: 'น้ำตกนางฟ้าเป็นหนึ่งในน้ำตกที่สวยที่สุดของตำบลโตมัว ด้วยน้ำใสและทิวทัศน์ธรรมชาติที่ยิ่งใหญ่',
        zh: '仙女瀑布是托木阿社最美丽的瀑布之一，拥有清澈的水质和壮丽的自然景观。',
        id: 'Air Terjun Peri adalah salah satu air terjun terindah di komune To Mua, dengan air jernih dan pemandangan alam yang megah.',
        ms: 'Air Terjun Fairy adalah salah satu air terjun terindah di komun To Mua, dengan air jernih dan pemandangan alam yang megah.',
        lo: 'ນ້ຳຕົກນາງຟ້າແມ່ນໜຶ່ງໃນນ້ຳຕົກທີ່ສວຍງາມທີ່ສຸດຂອງບ້ານໂຕມົວ, ມີນ້ຳໃສ ແລະ ທິວທັດທຳມະຊາດທີ່ຍິ່ງໃຫຍ່.',
        es: 'Cascada del Hada es una de las cascadas más bellas de la comuna To Mua, con agua cristalina y un paisaje natural magnífico.',
        fr: 'Cascade de la Fée est l\'une des plus belles cascades de la commune To Mua, avec une eau cristalline et un paysage naturel magnifique.',
        de: 'Feenwasserfall ist einer der schönsten Wasserfälle der Gemeinde To Mua mit kristallklarem Wasser und herrlicher Naturkulisse.'
      }),
      quote: JSON.stringify({
        vi: 'Nơi thiên nhiên giao hòa với con người',
        en: 'Where nature meets humanity',
        ko: '자연과 인간이 조화를 이루는 곳',
        ru: 'Место, где природа встречается с человеком',
        th: 'ที่ที่ธรรมชาติและมนุษย์อยู่ร่วมกัน',
        zh: '自然与人类和谐共处之地',
        id: 'Di mana alam dan manusia bersatu',
        ms: 'Di mana alam dan manusia bersatu',
        lo: 'ບ່ອນທີ່ທຳມະຊາດ ແລະ ມະນຸດຢູ່ຮ່ວມກັນ',
        es: 'Donde la naturaleza y la humanidad se encuentran',
        fr: 'Où la nature et l\'humanité se rencontrent',
        de: 'Wo Natur und Mensch sich begegnen'
      }),
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      stats: JSON.stringify({
        vi: { height: '30m', visitors: '1,200/năm' },
        en: { height: '30m', visitors: '1,200/year' }
      }),
      info: JSON.stringify({
        vi: { best_season: 'Mùa mưa (Tháng 5-10)', difficulty: 'Dễ' },
        en: { best_season: 'Rainy Season (May-Oct)', difficulty: 'Easy' }
      }),
      location: knex.raw("ST_SetSRID(ST_MakePoint(104.8249853, 20.8440075), 4326)"),
      status: 'published',
      created_by: admin.id,
      approved_by: admin.id,
      approved_at: new Date()
    },
    {
      slug: 'hang-dong-son',
      name: JSON.stringify({
        vi: 'Hang Động Sơn', en: 'Son Cave', ko: '동굴', ru: 'Пещера Шон',
        th: 'ถ้ำซอน', zh: '松洞', id: 'Gua Son', ms: 'Gua Son',
        lo: 'ຖ້ຳຊອນ', es: 'Cueva Son', fr: 'Grotte Son', de: 'Son-Höhle'
      }),
      type: 'cave',
      region: 'Tô Múa',
      description: JSON.stringify({
        vi: 'Hang Động Sơn là một hang động tự nhiên với nhiều nhũ đá kỳ vĩ, thu hút du khách khám phá.',
        en: 'Son Cave is a natural cave with magnificent stalactites, attracting visitors to explore.',
        ko: '동굴은 장엄한 종유석이 있는 천연 동굴로, 탐험객들을 끌어들입니다.',
        ru: 'Пещера Шон — природная пещера с величественными сталактитами, привлекающая туристов.',
        th: 'ถ้ำซอนเป็นถ้ำธรรมชาติที่มีหินงอกหินย้อยที่สวยงาม ดึงดูดนักท่องเที่ยวมาสำรวจ',
        zh: '松洞是一个天然洞穴，拥有壮丽的钟乳石，吸引游客前来探索。',
        id: 'Gua Son adalah gua alami dengan stalaktit megah, menarik pengunjung untuk menjelajah.',
        ms: 'Gua Son adalah gua semula jadi dengan stalaktit yang megah, menarik pelawat untuk meneroka.',
        lo: 'ຖ້ຳຊອນແມ່ນຖ້ຳທຳມະຊາດທີ່ມີຫີນຍ້ອຍທີ່ສວຍງາມ, ດຶງດູດນັກທ່ອງທ່ຽວ.',
        es: 'Cueva Son es una cueva natural con magníficas estalactitas, que atrae a visitantes para explorar.',
        fr: 'Grotte Son est une grotte naturelle aux magnifiques stalactites, attirant les visiteurs.',
        de: 'Son-Höhle ist eine natürliche Höhle mit prächtigen Stalaktiten, die Besucher anlockt.'
      }),
      quote: JSON.stringify({
        vi: 'Bên trong lòng đất, một thế giới kỳ diệu chờ đón',
        en: 'Inside the earth, a magical world awaits',
        ko: '대지 속에 마법 같은 세계가 기다립니다',
        ru: 'Внутри земли ждёт волшебный мир',
        th: 'ภายในโลกมีโลกมหัศจรรย์รออยู่',
        zh: '地下有一个神奇的世界在等待',
        id: 'Di dalam bumi, dunia ajaib menunggu',
        ms: 'Di dalam bumi, dunia ajaib menunggu',
        lo: 'ພາຍໃນແຜ່ນດິນ, ໂລກທີ່ມະຫັດສະຈັນກຳລັງລໍຖ້າ',
        es: 'Dentro de la tierra, un mundo mágico espera',
        fr: 'Sous la terre, un monde magique attend',
        de: 'Unter der Erde wartet eine magische Welt'
      }),
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      stats: JSON.stringify({
        vi: { depth: '150m', temperature: '18°C' },
        en: { depth: '150m', temperature: '18°C' }
      }),
      info: JSON.stringify({
        vi: { best_season: 'Quanh năm', difficulty: 'Trung bình' },
        en: { best_season: 'Year-round', difficulty: 'Medium' }
      }),
      location: knex.raw("ST_SetSRID(ST_MakePoint(104.8312456, 20.8523456), 4326)"),
      status: 'published',
      created_by: admin.id,
      approved_by: admin.id,
      approved_at: new Date()
    },
    {
      slug: 'di-tich-lich-su',
      name: {"vi":"Di tích Lịch sử","en":"Historical Site","ko":"역사 유적","ru":"Историческое место","th":"แหล่งประวัติศาสตร์","zh":"历史遗迹","id":"Situs Bersejarah","ms":"Tapak Bersejarah","lo":"ສະຖານທີ່ທາງປະຫວັດສາດ","es":"Sitio Histórico","fr":"Site Historique","de":"Historische Stätte"},
      type: 'historical',
      region: 'Tô Múa',
      description: JSON.stringify({
        vi: 'Di tích lịch sử Tô Múa ghi dấu những sự kiện quan trọng trong quá khứ của vùng đất này.',
        en: 'To Mua Historical Site marks important events in the past of this land.',
        ko: '또무아 역사 유적지는 이 지역의 과거 중요한 사건들을 기록하고 있습니다.',
        ru: 'Историческое место То Муа хранит память о важных событиях прошлого.',
        th: 'แหล่งประวัติศาสตร์โตมัวจดจำเหตุการณ์สำคัญในอดีตของดินแดนนี้',
        zh: '托木阿历史遗迹记录了这片土地过去的重要事件。',
        id: 'Situs Bersejarah To Mua menandai peristiwa penting di masa lalu.',
        ms: 'Tapak Bersejarah To Mua menandakan peristiwa penting pada masa lalu.',
        lo: 'ສະຖານທີ່ທາງປະຫວັດສາດໂຕມົວບັນທຶກເຫດການສຳຄັນໃນອະດີດ.',
        es: 'El Sitio Histórico de To Mua marca eventos importantes del pasado.',
        fr: 'Le Site Historique de To Mua marque des événements importants du passé.',
        de: 'Der historische Ort To Mua markiert wichtige Ereignisse der Vergangenheit.'
      }),
      quote: JSON.stringify({
        vi: 'Lịch sử là nền tảng cho tương lai',
        en: 'History is the foundation for the future'
      }),
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      stats: JSON.stringify({
        vi: { year: 'Thế kỷ XIX', area: '2,000 m²' },
        en: { year: '19th Century', area: '2,000 m²' }
      }),
      info: JSON.stringify({
        vi: { best_season: 'Quanh năm', difficulty: 'Dễ' },
        en: { best_season: 'Year-round', difficulty: 'Easy' }
      }),
      location: knex.raw("ST_SetSRID(ST_MakePoint(104.8198765, 20.8398765), 4326)"),
      status: 'published',
      created_by: admin.id,
      approved_by: admin.id,
      approved_at: new Date()
    },
    {
      slug: 'den-linh-thieng',
      name: {"vi":"Đền Linh Thiêng","en":"Sacred Temple","ko":"신성한 사원","ru":"Священный храм","th":"วัดศักดิ์สิทธิ์","zh":"神圣寺庙","id":"Kuil Suci","ms":"Kuil Suci","lo":"ວັດສັກສິດ","es":"Templo Sagrado","fr":"Temple Sacré","de":"Heiliger Tempel"},
      type: 'spiritual',
      region: 'Tô Múa',
      description: JSON.stringify({
        vi: 'Đền Linh Thiêng là nơi tâm linh quan trọng của người dân địa phương, với kiến trúc truyền thống độc đáo.',
        en: 'Sacred Temple is an important spiritual place for local people, with unique traditional architecture.'
      }),
      quote: JSON.stringify({
        vi: 'Nơi con người tìm về với cội nguồn',
        en: 'Where people find their roots'
      }),
      color: '#EF4444',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      stats: JSON.stringify({
        vi: { year: 'Thế kỷ XVIII', visitors: '5,000/năm' },
        en: { year: '18th Century', visitors: '5,000/year' }
      }),
      info: JSON.stringify({
        vi: { best_season: 'Quanh năm', difficulty: 'Dễ' },
        en: { best_season: 'Year-round', difficulty: 'Easy' }
      }),
      location: knex.raw("ST_SetSRID(ST_MakePoint(104.8276543, 20.8467890), 4326)"),
      status: 'published',
      created_by: admin.id,
      approved_by: admin.id,
      approved_at: new Date()
    },
    {
      slug: 'thac-bac',
      name: {"vi":"Thác Bạc","en":"Silver Waterfall","ko":"은폭포","ru":"Серебряный водопад","th":"น้ำตกเงิน","zh":"银瀑布","id":"Air Terjun Perak","ms":"Air Terjun Perak","lo":"ນ້ຳຕົກເງິນ","es":"Cascada de Plata","fr":"Cascade d'Argent","de":"Silberwasserfall"},
      type: 'waterfall',
      region: 'Tô Múa',
      description: JSON.stringify({
        vi: 'Thác Bạc với làn nước trắng xóa như bạc, tạo nên khung cảnh tuyệt đẹp giữa núi rừng.',
        en: 'Silver Waterfall with white water like silver, creating a beautiful scenery among mountains.'
      }),
      quote: JSON.stringify({
        vi: 'Dòng nước trắng xóa giữa đại ngàn',
        en: 'White water stream in the wilderness'
      }),
      color: '#6366F1',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      stats: JSON.stringify({
        vi: { height: '45m', visitors: '800/năm' },
        en: { height: '45m', visitors: '800/year' }
      }),
      info: JSON.stringify({
        vi: { best_season: 'Mùa mưa (Tháng 5-10)', difficulty: 'Trung bình' },
        en: { best_season: 'Rainy Season (May-Oct)', difficulty: 'Medium' }
      }),
      location: knex.raw("ST_SetSRID(ST_MakePoint(104.8354321, 20.8512345), 4326)"),
      status: 'published',
      created_by: admin.id,
      approved_by: admin.id,
      approved_at: new Date()
    },
    {
      slug: 'lang-van-hoa',
      name: {"vi":"Làng Văn hóa","en":"Cultural Village","ko":"문화 마을","ru":"Культурная деревня","th":"หมู่บ้านวัฒนธรรม","zh":"文化村","id":"Desa Budaya","ms":"Kampung Budaya","lo":"ບ້ານວັດທະນະທຳ","es":"Pueblo Cultural","fr":"Village Culturel","de":"Kulturelles Dorf"},
      type: 'historical',
      region: 'Tô Múa',
      description: JSON.stringify({
        vi: 'Làng Văn hóa Tô Múa là nơi bảo tồn và phát huy các giá trị văn hóa truyền thống của đồng bào dân tộc.',
        en: 'To Mua Cultural Village is a place to preserve and promote traditional cultural values of ethnic minorities.'
      }),
      quote: JSON.stringify({
        vi: 'Văn hóa là linh hồn của dân tộc',
        en: 'Culture is the soul of the nation'
      }),
      color: '#14B8A6',
      gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
      stats: JSON.stringify({
        vi: { houses: '20 nhà truyền thống', events: 'Lễ hội hàng năm' },
        en: { houses: '20 traditional houses', events: 'Annual festivals' }
      }),
      info: JSON.stringify({
        vi: { best_season: 'Quanh năm', difficulty: 'Dễ' },
        en: { best_season: 'Year-round', difficulty: 'Easy' }
      }),
      location: knex.raw("ST_SetSRID(ST_MakePoint(104.8223456, 20.8434567), 4326)"),
      status: 'published',
      created_by: admin.id,
      approved_by: admin.id,
      approved_at: new Date()
    }
  ];

  await knex('destinations').insert(destinations);

  // Create i18n content
  const i18nContent = [
    // Homepage
    { page: 'homepage', key: 'hero_title', lang: 'vi', value: 'Khám phá Tô Múa' },
    { page: 'homepage', key: 'hero_title', lang: 'en', value: 'Explore Tô Múa' },
    { page: 'homepage', key: 'hero_subtitle', lang: 'vi', value: 'Vùng đất của những thác nước hùng vĩ và văn hóa đặc sắc' },
    { page: 'homepage', key: 'hero_subtitle', lang: 'en', value: 'Land of majestic waterfalls and unique culture' },
    { page: 'homepage', key: 'stats_area', lang: 'vi', value: '181.98 km²' },
    { page: 'homepage', key: 'stats_area', lang: 'en', value: '181.98 km²' },
    { page: 'homepage', key: 'stats_population', lang: 'vi', value: '14,701' },
    { page: 'homepage', key: 'stats_population', lang: 'en', value: '14,701' },
    { page: 'homepage', key: 'stats_communes', lang: 'vi', value: '3 xã hợp nhất' },
    { page: 'homepage', key: 'stats_communes', lang: 'en', value: '3 merged communes' },

    // Navigation
    { page: 'navigation', key: 'home', lang: 'vi', value: 'Trang chủ' },
    { page: 'navigation', key: 'home', lang: 'en', value: 'Home' },
    { page: 'navigation', key: 'map', lang: 'vi', value: 'Bản đồ' },
    { page: 'navigation', key: 'map', lang: 'en', value: 'Map' },
    { page: 'navigation', key: 'about', lang: 'vi', value: 'Giới thiệu' },
    { page: 'navigation', key: 'about', lang: 'en', value: 'About' },
    { page: 'navigation', key: 'login', lang: 'vi', value: 'Đăng nhập' },
    { page: 'navigation', key: 'login', lang: 'en', value: 'Login' },

    // Footer
    { page: 'footer', key: 'copyright', lang: 'vi', value: '© 2024 Bản đồ Du lịch Tô Múa' },
    { page: 'footer', key: 'copyright', lang: 'en', value: '© 2024 To Mua Tourism Map' }
  ];

  await knex('i18n_content').insert(i18nContent);

  console.log('Seed data created successfully');
};
