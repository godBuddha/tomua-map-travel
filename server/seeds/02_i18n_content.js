exports.seed = async function(knex) {
  await knex('i18n_content').del();
  const langs = ['vi', 'en', 'ko', 'ru', 'th', 'zh', 'id', 'ms', 'lo', 'es', 'fr', 'de'];
  function createTranslation(page, key, translations) {
    return langs.map(lang => ({
      page, key, lang,
      value: translations[lang] || translations.en || translations.vi || key
    }));
  }
  const allTranslations = [];


  // === NAVIGATION ===
  allTranslations.push(...createTranslation('navigation', 'nav.home', {
    vi: 'Trang chủ', en: 'Home', ko: '홈', ru: 'Главная', th: 'หน้าแรก', zh: '首页', id: 'Beranda', ms: 'Laman Utama', lo: 'ໜ້າຫຼັກ', es: 'Inicio', fr: 'Accueil', de: 'Startseite'
  }));
  allTranslations.push(...createTranslation('navigation', 'nav.map', {
    vi: 'Bản đồ', en: 'Map', ko: '지도', ru: 'Карта', th: 'แผนที่', zh: '地图', id: 'Peta', ms: 'Peta', lo: 'ແຜນທີ່', es: 'Mapa', fr: 'Carte', de: 'Karte'
  }));
  allTranslations.push(...createTranslation('navigation', 'nav.destinations', {
    vi: 'Điểm đến', en: 'Destinations', ko: '관광지', ru: 'Достопримечательности', th: 'สถานที่ท่องเที่ยว', zh: '景点', id: 'Destinasi', ms: 'Destinasi', lo: 'ສະຖານທີ່ທ່ອງທ່ຽວ', es: 'Destinos', fr: 'Destinations', de: 'Reiseziele'
  }));
  allTranslations.push(...createTranslation('navigation', 'nav.about', {
    vi: 'Giới thiệu', en: 'About', ko: '소개', ru: 'О нас', th: 'เกี่ยวกับ', zh: '关于', id: 'Tentang', ms: 'Tentang', lo: 'ກ່ຽວກັບ', es: 'Acerca de', fr: 'À propos', de: 'Über uns'
  }));
  allTranslations.push(...createTranslation('navigation', 'nav.admin', {
    vi: 'Quản trị', en: 'Admin', ko: '관리', ru: 'Админ', th: 'ผู้ดูแล', zh: '管理', id: 'Admin', ms: 'Admin', lo: 'ບໍລິຫານ', es: 'Admin', fr: 'Admin', de: 'Admin'
  }));

  // === HOMEPAGE ===
  allTranslations.push(...createTranslation('homepage', 'hero.badge', {
    vi: '🏔️ Tỉnh Sơn La', en: '🏔️ Son La Province', ko: '🏔️ 선라省', ru: '🏔️ Провинция Шонла', th: '🏔️ จังหวัดซันลา', zh: '🏔️ 山罗省', id: '🏔️ Provinsi Son La', ms: '🏔️ Wilayah Son La', lo: '🏔️ ແຂວງຊົນລາ', es: '🏔️ Provincia de Son La', fr: '🏔️ Province de Son La', de: '🏔️ Provinz Son La'
  }));
  allTranslations.push(...createTranslation('homepage', 'hero.title', {
    vi: 'Khám phá<br>Tô Múa', en: 'Discover<br>Tô Múa', ko: '또무아를<br>탐험하세요', ru: 'Откройте<br>Томуа', th: 'ค้นพบ<br>โตมัว', zh: '探索<br>托木', id: 'Jelajahi<br>To Mua', ms: 'Terokai<br>To Mua', lo: 'ສຳຫຼວດ<br>ໂຕມົວ', es: 'Descubre<br>To Mua', fr: 'Découvrir<br>To Mua', de: 'Entdecke<br>To Mua'
  }));
  allTranslations.push(...createTranslation('homepage', 'hero.subtitle', {
    vi: 'Vùng đất của hệ thống thác nước hùng vĩ, hang động kỳ bí, chè cổ thụ và khí hậu ôn hoà — mang đậm bản sắc văn hoá Tây Bắc.',
    en: 'Land of majestic waterfalls, mysterious caves, ancient tea trees and cool climate — rich in Northwest culture.',
    ko: '웅대한 폭포, 신비로운 동굴, 차나무, 온화한 기후 — 서북부 문화가 풍부한 땅.',
    ru: 'Земля величественных водопадов, загадочных пещер, чайных деревьев и мягкого климата — богатая культурой Северо-Запада.',
    th: 'ดินแดนน้ำตกมหัศจรรย์ ถ้ำลึกลับ ต้นชาโบราณ และอากาศเย็นสบาย — อุดมด้วยวัฒนธรรมตะวันตกเฉียงเหนือ',
    zh: '雄伟瀑布、神秘洞穴、古茶树和温和气候的土地——充满西北文化特色。',
    id: 'Negeri air terjun megah, gua misterius, pohon teh tua, dan iklim sejuk — kaya budaya Barat Laut.',
    ms: 'Negeri air terjun megah, gua misteri, pokok teh tua, dan iklim sejuk — kaya budaya Barat Laut.',
    lo: 'ດິນແດນນ້ຳຕົກຍິ່ງໃຫຍ່, ຖ້ຳປິດສະໜາ, ຕົ້ນຊາເກົ່າ, ແລະ ອາກາດເຢັນ — ອຸດົມດ້ວຍວັດທະນະທຳຕາເວັນຕົກສ່ຽງເໜືອ.',
    es: 'Tierra de cascadas majestuosas, cuevas misteriosas, árboles de té antiguos y clima templado — rica en cultura del Noroeste.',
    fr: 'Terre de cascades majestueuses, de grottes mystérieuses, d\'arbres à thé centenaires et de climat tempéré — riche en culture du Nord-Ouest.',
    de: 'Land der majestätischen Wasserfälle, geheimnisvollen Höhlen, alten Teebäume und mildem Klima — reich an nordwestlicher Kultur.'
  }));
  allTranslations.push(...createTranslation('homepage', 'hero.cta_map', {
    vi: '🗺️ Khám phá bản đồ', en: '🗺️ Explore map', ko: '🗺️ 지도 탐험', ru: '🗺️ Исследовать карту', th: '🗺️ สำรวจแผนที่', zh: '🗺️ 探索地图', id: '🗺️ Jelajahi peta', ms: '🗺️ Terokai peta', lo: '🗺️ ສຳຫຼວດແຜນທີ່', es: '🗺️ Explorar mapa', fr: '🗺️ Explorer la carte', de: '🗺️ Karte erkunden'
  }));
  allTranslations.push(...createTranslation('homepage', 'hero.cta_dest', {
    vi: '📍 Điểm đến nổi bật', en: '📍 Top destinations', ko: '📍 인기 목적지', ru: '📍 Популярные места', th: '📍 จุดหมายยอดนิยม', zh: '📍 热门目的地', id: '📍 Tujuan utama', ms: '📍 Destinasi utama', lo: '📍 ຈຸດໝາຍຍອດນິຍົມ', es: '📍 Destinos destacados', fr: '📍 Destinations phares', de: '📍 Top-Reiseziele'
  }));
  allTranslations.push(...createTranslation('homepage', 'hero.scroll', {
    vi: 'Cuộn để khám phá', en: 'Scroll to explore', ko: '스크롤하여 탐험', ru: 'Прокрутите для просмотра', th: 'เลื่อนเพื่อสำรวจ', zh: '滚动探索', id: 'Gulir untuk menjelajah', ms: 'Tatal untuk menerokai', lo: 'ເລື່ອນເພື່ອສຳຫຼວດ', es: 'Desplázate para explorar', fr: 'Faites défiler pour explorer', de: 'Scrollen zum Erkunden'
  }));

  // Stats
  allTranslations.push(...createTranslation('homepage', 'stats.area', {
    vi: 'Diện tích tự nhiên', en: 'Natural area', ko: '자연 면적', ru: 'Площадь', th: 'พื้นที่ธรรมชาติ', zh: '自然面积', id: 'Luas alam', ms: 'Keluasan semula jadi', lo: 'ພື້ນທີ່ທຳມະຊາດ', es: 'Área natural', fr: 'Superficie naturelle', de: 'Natürliche Fläche'
  }));
  allTranslations.push(...createTranslation('homepage', 'stats.population', {
    vi: 'Nhân khẩu', en: 'Population', ko: '인구', ru: 'Население', th: 'ประชากร', zh: '人口', id: 'Populasi', ms: 'Populasi', lo: 'ປະຊາກອນ', es: 'Población', fr: 'Population', de: 'Bevölkerung'
  }));
  allTranslations.push(...createTranslation('homepage', 'stats.merged', {
    vi: 'Xã cũ sáp nhập', en: 'Merged communes', ko: '합병된 면', ru: 'Объединённые коммуны', th: 'เทศบาลที่รวม', zh: '合并的公社', id: 'Komune yang digabung', ms: 'Komun yang digabung', lo: 'ບ້ານທີ່ລວມເຂົ້າກັນ', es: 'Comunas fusionadas', fr: 'Communes fusionnées', de: 'Zusammengeschlossene Gemeinden'
  }));

  // Destinations section
  allTranslations.push(...createTranslation('homepage', 'dest.kicker', {
    vi: 'Điểm đến', en: 'Destinations', ko: '관광지', ru: 'Направления', th: 'จุดหมาย', zh: '目的地', id: 'Destinasi', ms: 'Destinasi', lo: 'ຈຸດໝາຍ', es: 'Destinos', fr: 'Destinations', de: 'Reiseziele'
  }));
  allTranslations.push(...createTranslation('homepage', 'dest.title', {
    vi: 'Khám phá {{count}} điểm đến', en: 'Explore {{count}} destinations', ko: '{{count}}개 관광지 탐험', ru: 'Исследуйте {{count}} мест', th: 'สำรวจ {{count}} จุดหมาย', zh: '探索{{count}}个目的地', id: 'Jelajahi {{count}} destinasi', ms: 'Terokai {{count}} destinasi', lo: 'ສຳຫຼວດ {{count}} ຈຸດໝາຍ', es: 'Explorar {{count}} destinos', fr: 'Explorer {{count}} destinations', de: '{{count}} Reiseziele erkunden'
  }));
  allTranslations.push(...createTranslation('homepage', 'dest.subtitle', {
    vi: 'Từ thác nước hùng vĩ đến hang động kỳ bí, mỗi điểm đến là một câu chuyện của vùng đất Tô Múa.',
    en: 'From majestic waterfalls to mysterious caves, each destination tells a story of Tô Múa land.',
    ko: '웅대한 폭포부터 신비로운 동굴까지, 각 관광지는 또무아의 이야기를 담고 있습니다.',
    ru: 'От величественных водопадов до загадочных пещер — каждое место хранит историю земли Томуа.',
    th: 'จากน้ำตกมหัศจรรย์ถึงถ้ำลึกลับ แต่ละจุดหมายเล่าเรื่องราวของดินแดนโตมัว',
    zh: '从雄伟的瀑布到神秘的洞穴，每个目的地都讲述着托木土地的故事。',
    id: 'Dari air terjun megah hingga gua misterius, setiap destinasi menceritakan kisah tanah To Mua.',
    ms: 'Daripada air terjun megah hingga gua misteri, setiap destinasi menceritakan kisah tanah To Mua.',
    lo: 'ຈາກນ້ຳຕົກຍິ່ງໃຫຍ່ຮອດຖ້ຳປິດສະໜາ, ແຕ່ລະຈຸດໝາຍເລົ່າເລື່ອງຂອງດິນແດນໂຕມົວ.',
    es: 'Desde cascadas majestuosas hasta cuevas misteriosas, cada destino cuenta una historia de la tierra de To Mua.',
    fr: 'Des cascades majestueuses aux grottes mystérieuses, chaque destination raconte une histoire de la terre de To Mua.',
    de: 'Von majestätischen Wasserfällen bis zu geheimnisvollen Höhlen — jedes Reiseziel erzählt eine Geschichte des Landes To Mua.'
  }));

  // Map section
  allTranslations.push(...createTranslation('homepage', 'map.kicker', {
    vi: 'Bản đồ', en: 'Map', ko: '지도', ru: 'Карта', th: 'แผนที่', zh: '地图', id: 'Peta', ms: 'Peta', lo: 'ແຜນທີ່', es: 'Mapa', fr: 'Carte', de: 'Karte'
  }));
  allTranslations.push(...createTranslation('homepage', 'map.title', {
    vi: 'Bản đồ du lịch tương tác', en: 'Interactive tourism map', ko: '인터랙티브 관광 지도', ru: 'Интерактивная туристическая карта', th: 'แผนที่ท่องเที่ยวแบบโต้ตอบ', zh: '互动旅游地图', id: 'Peta wisata interaktif', ms: 'Peta pelancongan interaktif', lo: 'ແຜນທີ່ທ່ອງທ່ຽວແບບໂຕ້ຕອບ', es: 'Mapa turístico interactivo', fr: 'Carte touristique interactive', de: 'Interaktive Tourismuskarte'
  }));
  allTranslations.push(...createTranslation('homepage', 'map.subtitle', {
    vi: 'Khám phá ranh giới 3 xã cũ và vị trí các điểm du lịch trên bản đồ số.',
    en: 'Explore the boundaries of 3 former communes and tourist destinations on the digital map.',
    ko: '3개 구 면의 경계와 관광지 위치를 디지털 지도에서 탐험하세요.',
    ru: 'Исследуйте границы 3 бывших коммун и расположение достопримечательностей на цифровой карте.',
    th: 'สำรวจเขตแดน 3 ตำบลเดิมและตำแหน่งสถานที่ท่องเที่ยวบนแผนที่ดิจิทัล',
    zh: '探索3个前公社的边界和旅游景点在数字地图上的位置。',
    id: 'Jelajahi batas 3 komune bekas dan lokasi wisata di peta digital.',
    ms: 'Terokai sempadan 3 komun bekas dan lokasi pelancongan di peta digital.',
    lo: 'ສຳຫຼວດເຂດແດນ 3 ບ້ານເກົ່າ ແລະ ຕຳແໜ່ງສະຖານທີ່ທ່ອງທ່ຽວໃນແຜນທີ່ດິຈິຕອລ.',
    es: 'Explora los límites de 3 comunas anteriores y las ubicaciones turísticas en el mapa digital.',
    fr: 'Explorez les limites de 3 anciennes communes et les emplacements touristiques sur la carte numérique.',
    de: 'Erkunden Sie die Grenzen von 3 ehemaligen Gemeinden und die Lage der Touristenattraktionen auf der digitalen Karte.'
  }));
  allTranslations.push(...createTranslation('homepage', 'map.cta', {
    vi: '🗺️ Mở bản đồ đầy đủ', en: '🗺️ Open full map', ko: '🗺️ 전체 지도 열기', ru: '🗺️ Открыть полную карту', th: '🗺️ เปิดแผนที่เต็ม', zh: '🗺️ 打开完整地图', id: '🗺️ Buka peta lengkap', ms: '🗺️ Buka peta penuh', lo: '🗺️ ເປີດແຜນທີ່ເຕັມ', es: '🗺️ Abrir mapa completo', fr: '🗺️ Ouvrir la carte complète', de: '🗺️ Vollständige Karte öffnen'
  }));

  // Events section
  allTranslations.push(...createTranslation('homepage', 'events.kicker', {
    vi: 'Sự kiện', en: 'Events', ko: '이벤트', ru: 'События', th: 'กิจกรรม', zh: '活动', id: 'Acara', ms: 'Acara', lo: 'ກິດຈະກຳ', es: 'Eventos', fr: 'Événements', de: 'Veranstaltungen'
  }));
  allTranslations.push(...createTranslation('homepage', 'events.title', {
    vi: 'Sự kiện & Lễ hội', en: 'Events & Festivals', ko: '이벤트 & 축제', ru: 'События и фестивали', th: 'กิจกรรม & เทศกาล', zh: '活动与节日', id: 'Acara & Festival', ms: 'Acara & Perayaan', lo: 'ກິດຈະກຳ & ງານບຸນ', es: 'Eventos y Festivales', fr: 'Événements et Festivals', de: 'Veranstaltungen & Feste'
  }));
  allTranslations.push(...createTranslation('homepage', 'events.subtitle', {
    vi: 'Khám phá các sự kiện và lễ hội đặc sắc tại Tô Múa',
    en: 'Discover unique events and festivals in Tô Múa',
    ko: '또무아의 특별한 이벤트와 축제를 발견하세요',
    ru: 'Откройте уникальные события и фестивали в Томуа',
    th: 'ค้นพบกิจกรรมและเทศกาลที่ไม่เหมือนใครในโตมัว',
    zh: '探索托木独特的活动和节日',
    id: 'Temukan acara dan festival unik di To Mua',
    ms: 'Temui acara dan perayaan unik di To Mua',
    lo: 'ຄົ້ນພົບກິດຈະກຳ ແລະ ງານບຸນທີ່ເປັນເອກະລັກໃນໂຕມົວ',
    es: 'Descubre eventos y festivales únicos en To Mua',
    fr: 'Découvrez des événements et festivals uniques à To Mua',
    de: 'Entdecken Sie einzigartige Veranstaltungen und Feste in To Mua'
  }));

  // Routes section
  allTranslations.push(...createTranslation('homepage', 'routes.kicker', {
    vi: 'Lộ trình', en: 'Routes', ko: '경로', ru: 'Маршруты', th: 'เส้นทาง', zh: '路线', id: 'Rute', ms: 'Laluan', lo: 'ເສັ້ນທາງ', es: 'Rutas', fr: 'Itinéraires', de: 'Routen'
  }));
  allTranslations.push(...createTranslation('homepage', 'routes.title', {
    vi: 'Tour gợi ý', en: 'Suggested tours', ko: '추천 투어', ru: 'Рекомендуемые туры', th: 'ทัวร์แนะนำ', zh: '推荐旅游', id: 'Tur yang disarankan', ms: 'Lawatan yang dicadangkan', lo: 'ທົວແນະນຳ', es: 'Tours sugeridos', fr: 'Tours suggérés', de: 'Vorgeschlagene Touren'
  }));
  allTranslations.push(...createTranslation('homepage', 'routes.subtitle', {
    vi: 'Khám phá Tô Múa theo lộ trình được thiết kế sẵn',
    en: 'Explore Tô Múa with pre-designed routes',
    ko: '미리 설계된 경로로 또무아를 탐험하세요',
    ru: 'Исследуйте Томуа по заранее спланированным маршрутам',
    th: 'สำรวจโตมัวตามเส้นทางที่ออกแบบไว้',
    zh: '按照预先设计的路线探索托木',
    id: 'Jelajahi To Mua dengan rute yang sudah dirancang',
    ms: 'Terokai To Mua dengan laluan yang telah direka',
    lo: 'ສຳຫຼວດໂຕມົວຕາມເສັ້ນທາງທີ່ອອກແບບໄວ້',
    es: 'Explora To Mua con rutas prediseñadas',
    fr: 'Explorez To Mua avec des itinéraires préconçus',
    de: 'Erkunden Sie To Mua mit vorgefertigten Routen'
  }));

  // Footer
  allTranslations.push(...createTranslation('homepage', 'footer.copyright', {
    vi: '© 2025 Xã Tô Múa — Tỉnh Sơn La', en: '© 2025 Tô Múa Commune — Son La Province',
    ko: '© 2025 또무아 면 — 선라성', ru: '© 2025 Коммуна То Муа — Провинция Шон Ла',
    th: '© 2025 ตำบลโตมัว — จังหวัดซอนลา', zh: '© 2025 托木阿社 — 山罗省',
    id: '© 2025 Komune To Mua — Provinsi Son La', ms: '© 2025 Komun To Mua — Wilayah Son La',
    lo: '© 2025 ບ້ານໂຕມົວ — ແຂວງຊົນລາ', es: '© 2025 Comuna To Mua — Provincia de Son La',
    fr: '© 2025 Commune To Mua — Province de Son La', de: '© 2025 Gemeinde To Mua — Provinz Son La'
  }));
  allTranslations.push(...createTranslation('homepage', 'footer.brand', {
    vi: 'Xã Tô Múa', en: 'Tô Múa Commune', ko: '또무아 면', ru: 'Коммуна То Муа', th: 'ตำบลโตมัว', zh: '托木阿社', id: 'Komune To Mua', ms: 'Komun To Mua', lo: 'ບ້ານໂຕມົວ', es: 'Comuna To Mua', fr: 'Commune To Mua', de: 'Gemeinde To Mua'
  }));
  allTranslations.push(...createTranslation('homepage', 'footer.desc', {
    vi: 'Bản đồ số du lịch xã Tô Múa, tỉnh Sơn La. Dự án phục vụ phát triển du lịch cộng đồng và giới thiệu bản sắc văn hóa vùng cao.',
    en: 'Digital tourism map of Tô Múa commune, Son La Province. A project for community tourism development.',
    ko: '또무아 면 디지털 관광 지도, 선라성.',
    ru: 'Цифровая туристическая карта коммуны То Муа.',
    th: 'แผนที่ท่องเที่ยวดิจิทัลตำบลโตมัว',
    zh: '托木阿社数字旅游地图。',
    id: 'Peta wisata digital komune To Mua.',
    ms: 'Peta pelancongan digital komun To Mua.',
    lo: 'ແຜນທີ່ທ່ອງທ່ຽວດິຈິຕອລບ້ານໂຕມົວ.',
    es: 'Mapa turístico digital de la comuna To Mua.',
    fr: 'Carte touristique numérique de la commune To Mua.',
    de: 'Digitale Tourismuskarte der Gemeinde To Mua.'
  }));
  allTranslations.push(...createTranslation('homepage', 'footer.nav', {
    vi: 'Điều hướng', en: 'Navigation', ko: '내비게이션', ru: 'Навигация', th: 'นำทาง', zh: '导航', id: 'Navigasi', ms: 'Navigasi', lo: 'ນຳທາງ', es: 'Navegación', fr: 'Navigation', de: 'Navigation'
  }));
  allTranslations.push(...createTranslation('homepage', 'footer.services', {
    vi: 'Dịch vụ', en: 'Services', ko: '서비스', ru: 'Услуги', th: 'บริการ', zh: '服务', id: 'Layanan', ms: 'Perkhidmatan', lo: 'ບໍລິການ', es: 'Servicios', fr: 'Services', de: 'Dienstleistungen'
  }));
  allTranslations.push(...createTranslation('homepage', 'footer.homestay', {
    vi: 'Lưu trú', en: 'Accommodation', ko: '숙박', ru: 'Жильё', th: 'ที่พัก', zh: '住宿', id: 'Akomodasi', ms: 'Penginapan', lo: 'ທີ່ພັກ', es: 'Alojamiento', fr: 'Hébergement', de: 'Unterkunft'
  }));
  allTranslations.push(...createTranslation('homepage', 'footer.food', {
    vi: 'Ẩm thực', en: 'Cuisine', ko: '음식', ru: 'Кухня', th: 'อาหาร', zh: '美食', id: 'Kuliner', ms: 'Kulinari', lo: 'ອາຫານ', es: 'Gastronomía', fr: 'Cuisine', de: 'Kulinarik'
  }));
  allTranslations.push(...createTranslation('homepage', 'footer.tour', {
    vi: 'Tour gợi ý', en: 'Tours', ko: '투어', ru: 'Туры', th: 'ทัวร์', zh: '旅游', id: 'Tur', ms: 'Lawatan', lo: 'ທ່ຽວ', es: 'Tours', fr: 'Circuits', de: 'Touren'
  }));
  allTranslations.push(...createTranslation('homepage', 'footer.event', {
    vi: 'Sự kiện', en: 'Events', ko: '이벤트', ru: 'События', th: 'กิจกรรม', zh: '活动', id: 'Acara', ms: 'Acara', lo: 'ກິດຈະກຳ', es: 'Eventos', fr: 'Événements', de: 'Veranstaltungen'
  }));
  allTranslations.push(...createTranslation('homepage', 'footer.contact', {
    vi: 'Liên hệ', en: 'Contact', ko: '연락처', ru: 'Контакты', th: 'ติดต่อ', zh: '联系', id: 'Kontak', ms: 'Hubungi', lo: 'ຕິດຕໍ່', es: 'Contacto', fr: 'Contact', de: 'Kontakt'
  }));
  allTranslations.push(...createTranslation('homepage', 'footer.ubnd', {
    vi: 'UBND xã Tô Múa', en: 'Tô Múa People\'s Committee', ko: '또무아 인민위원회', ru: 'Народный комитет То Муа', th: 'คณะกรรมการประชาชนตำบลโตมัว', zh: '托木阿人民委员会', id: 'Komite Rakyat To Mua', ms: 'Jawatankuasa Rakyat To Mua', lo: 'ຄະນະກຳມະການປະຊາຊົນໂຕມົວ', es: 'Comité Popular de To Mua', fr: 'Comité Populaire de To Mua', de: 'Volkskomitee To Mua'
  }));
  allTranslations.push(...createTranslation('homepage', 'footer.province', {
    vi: 'Tỉnh Sơn La', en: 'Son La Province', ko: '선라성', ru: 'Провинция Шон Ла', th: 'จังหวัดซอนลา', zh: '山罗省', id: 'Provinsi Son La', ms: 'Wilayah Son La', lo: 'ແຂວງຊົນລາ', es: 'Provincia de Son La', fr: 'Province de Son La', de: 'Provinz Son La'
  }));
  allTranslations.push(...createTranslation('homepage', 'footer.powered', {
    vi: 'Xây dựng bằng công nghệ bản đồ số', en: 'Built with digital map technology', ko: '디지털 지도 기술로 구축', ru: 'Создано с помощью цифровых карт', th: 'สร้างด้วยเทคโนโลยีแผนที่ดิจิทัล', zh: '数字地图技术支持', id: 'Dibangun dengan teknologi peta digital', ms: 'Dibina dengan teknologi peta digital', lo: 'ສ້າງດ້ວຍເທັກໂນໂລຍີແຜນທີ່ດິຈິຕອລ', es: 'Construido con tecnología de mapas digitales', fr: 'Construit avec la technologie de cartes numériques', de: 'Erstellt mit digitaler Kartentechnologie'
  }));

  // === COMMON ===
  allTranslations.push(...createTranslation('common', 'type.waterfall', {
    vi: 'Thác nước', en: 'Waterfall', ko: '폭포', ru: 'Водопад', th: 'น้ำตก', zh: '瀑布', id: 'Air terjun', ms: 'Air terjun', lo: 'ນ້ຳຕົກ', es: 'Cascada', fr: 'Cascade', de: 'Wasserfall'
  }));
  allTranslations.push(...createTranslation('common', 'type.cave', {
    vi: 'Hang động', en: 'Cave', ko: '동굴', ru: 'Пещера', th: 'ถ้ำ', zh: '洞穴', id: 'Gua', ms: 'Gua', lo: 'ຖ້ຳ', es: 'Cueva', fr: 'Grotte', de: 'Höhle'
  }));
  allTranslations.push(...createTranslation('common', 'type.historical', {
    vi: 'Di tích lịch sử', en: 'Historical', ko: '역사 유적', ru: 'Историческое', th: 'แหล่งประวัติศาสตร์', zh: '历史遗迹', id: 'Bersejarah', ms: 'Bersejarah', lo: 'ປະຫວັດສາດ', es: 'Histórico', fr: 'Historique', de: 'Historisch'
  }));
  allTranslations.push(...createTranslation('common', 'type.spiritual', {
    vi: 'Tâm linh', en: 'Spiritual', ko: '영적', ru: 'Духовное', th: 'จิตวิญญาณ', zh: '灵性', id: 'Spiritual', ms: 'Spiritual', lo: 'ຈິດວິນຍານ', es: 'Espiritual', fr: 'Spirituel', de: 'Spirituell'
  }));

  // Transport types
  allTranslations.push(...createTranslation('common', 'transport.walk', {
    vi: 'Đi bộ', en: 'Walking', ko: '도보', ru: 'Пешком', th: 'เดิน', zh: '步行', id: 'Berjalan kaki', ms: 'Berjalan kaki', lo: 'ຍ່າງ', es: 'Caminando', fr: 'Marche', de: 'Zu Fuß'
  }));
  allTranslations.push(...createTranslation('common', 'transport.bike', {
    vi: 'Xe máy', en: 'Motorbike', ko: '오토바이', ru: 'Мотоцикл', th: 'มอเตอร์ไซค์', zh: '摩托车', id: 'Sepeda motor', ms: 'Motosikal', lo: 'ລົດຈັກ', es: 'Motocicleta', fr: 'Moto', de: 'Motorrad'
  }));
  allTranslations.push(...createTranslation('common', 'transport.car', {
    vi: 'Ô tô', en: 'Car', ko: '자동차', ru: 'Автомобиль', th: 'รถยนต์', zh: '汽车', id: 'Mobil', ms: 'Kereta', lo: 'ລົດ', es: 'Coche', fr: 'Voiture', de: 'Auto'
  }));

  // Difficulty levels
  allTranslations.push(...createTranslation('common', 'difficulty.easy', {
    vi: 'Dễ', en: 'Easy', ko: '쉬움', ru: 'Легкий', th: 'ง่าย', zh: '简单', id: 'Mudah', ms: 'Mudah', lo: 'ງ່າຍ', es: 'Fácil', fr: 'Facile', de: 'Leicht'
  }));
  allTranslations.push(...createTranslation('common', 'difficulty.medium', {
    vi: 'Trung bình', en: 'Medium', ko: '보통', ru: 'Средний', th: 'ปานกลาง', zh: '中等', id: 'Sedang', ms: 'Sederhana', lo: 'ປານກາງ', es: 'Medio', fr: 'Moyen', de: 'Mittel'
  }));
  allTranslations.push(...createTranslation('common', 'difficulty.hard', {
    vi: 'Khó', en: 'Hard', ko: '어려움', ru: 'Сложный', th: 'ยาก', zh: '困难', id: 'Sulit', ms: 'Sukar', lo: 'ຍາກ', es: 'Difícil', fr: 'Difficile', de: 'Schwer'
  }));

  // Duration types
  allTranslations.push(...createTranslation('common', 'duration.half_day', {
    vi: 'Nửa ngày', en: 'Half day', ko: '반나절', ru: 'Полдня', th: 'ครึ่งวัน', zh: '半天', id: 'Setengah hari', ms: 'Separuh hari', lo: 'ເຄິ່ງມື້', es: 'Medio día', fr: 'Demi-journée', de: 'Halber Tag'
  }));
  allTranslations.push(...createTranslation('common', 'duration.full_day', {
    vi: '1 ngày', en: 'Full day', ko: '하루', ru: 'Полный день', th: 'เต็มวัน', zh: '一整天', id: 'Sehari penuh', ms: 'Sepenuh hari', lo: 'ໝົດມື້', es: 'Día completo', fr: 'Journée complète', de: 'Ganzer Tag'
  }));
  allTranslations.push(...createTranslation('common', 'duration.two_day', {
    vi: '2 ngày', en: 'Two days', ko: '이틀', ru: 'Два дня', th: 'สองวัน', zh: '两天', id: 'Dua hari', ms: 'Dua hari', lo: 'ສອງມື້', es: 'Dos días', fr: 'Deux jours', de: 'Zwei Tage'
  }));
  allTranslations.push(...createTranslation('common', 'duration.custom', {
    vi: 'Tùy chỉnh', en: 'Custom', ko: '사용자 정의', ru: 'Пользовательский', th: 'กำหนดเอง', zh: '自定义', id: 'Kustom', ms: 'Tersuai', lo: 'ກຳນົດເອງ', es: 'Personalizado', fr: 'Personnalisé', de: 'Benutzerdefiniert'
  }));

  // Event types
  allTranslations.push(...createTranslation('common', 'event.type.festival', {
    vi: 'Lễ hội', en: 'Festival', ko: '축제', ru: 'Фестиваль', th: 'เทศกาล', zh: '节日', id: 'Festival', ms: 'Perayaan', lo: 'ງານບຸນ', es: 'Festival', fr: 'Festival', de: 'Festival'
  }));
  allTranslations.push(...createTranslation('common', 'event.type.season', {
    vi: 'Theo mùa', en: 'Seasonal', ko: '계절', ru: 'Сезонное', th: 'ตามฤดูกาล', zh: '季节性', id: 'Musiman', ms: 'Bermusim', lo: 'ຕາມລະດູການ', es: 'Estacional', fr: 'Saisonnier', de: 'Saisonal'
  }));
  allTranslations.push(...createTranslation('common', 'event.type.experience', {
    vi: 'Trải nghiệm', en: 'Experience', ko: '체험', ru: 'Опыт', th: 'ประสบการณ์', zh: '体验', id: 'Pengalaman', ms: 'Pengalaman', lo: 'ປະສົບການ', es: 'Experiencia', fr: 'Expérience', de: 'Erlebnis'
  }));
  allTranslations.push(...createTranslation('common', 'event.type.cultural', {
    vi: 'Văn hóa', en: 'Cultural', ko: '문화', ru: 'Культурное', th: 'วัฒนธรรม', zh: '文化', id: 'Budaya', ms: 'Budaya', lo: 'ວັດທະນະທຳ', es: 'Cultural', fr: 'Culturel', de: 'Kulturell'
  }));
  allTranslations.push(...createTranslation('common', 'event.type.sport', {
    vi: 'Thể thao', en: 'Sport', ko: '스포츠', ru: 'Спорт', th: 'กีฬา', zh: '体育', id: 'Olahraga', ms: 'Sukan', lo: 'ກິລາ', es: 'Deporte', fr: 'Sport', de: 'Sport'
  }));
  allTranslations.push(...createTranslation('common', 'event.type.food', {
    vi: 'Ẩm thực', en: 'Food', ko: '음식', ru: 'Еда', th: 'อาหาร', zh: '美食', id: 'Makanan', ms: 'Makanan', lo: 'ອາຫານ', es: 'Comida', fr: 'Nourriture', de: 'Essen'
  }));
  allTranslations.push(...createTranslation('common', 'event.type.other', {
    vi: 'Khác', en: 'Other', ko: '기타', ru: 'Другое', th: 'อื่นๆ', zh: '其他', id: 'Lainnya', ms: 'Lain-lain', lo: 'ອື່ນໆ', es: 'Otro', fr: 'Autre', de: 'Andere'
  }));

  // Routes section
  allTranslations.push(...createTranslation('homepage', 'routes.no_stops', {
    vi: 'Chưa có điểm dừng', en: 'No stops yet', ko: '아직 정류장 없음', ru: 'Пока нет остановок', th: 'ยังไม่มีจุดหยุด', zh: '暂无站点', id: 'Belum ada pemberhentian', ms: 'Tiada perhentian lagi', lo: 'ຍັງບໍ່ມີຈຸດຈອດ', es: 'Sin paradas aún', fr: 'Pas encore d\'arrêts', de: 'Noch keine Haltestellen'
  }));
  allTranslations.push(...createTranslation('homepage', 'routes.minutes', {
    vi: 'phút', en: 'minutes', ko: '분', ru: 'минут', th: 'นาที', zh: '分钟', id: 'menit', ms: 'minit', lo: 'ນາທີ', es: 'minutos', fr: 'minutes', de: 'Minuten'
  }));

  // === MAP PAGE ===
  allTranslations.push(...createTranslation('map', 'map.search', {
    vi: 'Tìm kiếm điểm đến...', en: 'Search destinations...', ko: '관광지 검색...', ru: 'Поиск направлений...', th: 'ค้นหาจุดหมาย...', zh: '搜索目的地...', id: 'Cari destinasi...', ms: 'Cari destinasi...', lo: 'ຊອກຫາຈຸດໝາຍ...', es: 'Buscar destinos...', fr: 'Rechercher des destinations...', de: 'Reiseziele suchen...'
  }));
  allTranslations.push(...createTranslation('map', 'map.filter_all', {
    vi: 'Tất cả', en: 'All', ko: '전체', ru: 'Все', th: 'ทั้งหมด', zh: '全部', id: 'Semua', ms: 'Semua', lo: 'ທັງໝົດ', es: 'Todos', fr: 'Tous', de: 'Alle'
  }));
  allTranslations.push(...createTranslation('map', 'legend.title', {
    vi: 'Chú giải', en: 'Legend', ko: '범례', ru: 'Легенда', th: 'คำอธิบาย', zh: '图例', id: 'Legenda', ms: 'Legenda', lo: 'ຄຳອະທິບາຍ', es: 'Leyenda', fr: 'Légende', de: 'Legende'
  }));
  allTranslations.push(...createTranslation('map', 'info.type', {
    vi: 'Loại', en: 'Type', ko: '유형', ru: 'Тип', th: 'ประเภท', zh: '类型', id: 'Tipe', ms: 'Jenis', lo: 'ປະເພດ', es: 'Tipo', fr: 'Type', de: 'Typ'
  }));
  allTranslations.push(...createTranslation('map', 'info.desc', {
    vi: 'Mô tả', en: 'Description', ko: '설명', ru: 'Описание', th: 'คำอธิบาย', zh: '描述', id: 'Deskripsi', ms: 'Penerangan', lo: 'ຄຳອະທິບາຍ', es: 'Descripción', fr: 'Description', de: 'Beschreibung'
  }));
  allTranslations.push(...createTranslation('map', 'info.coords', {
    vi: 'Tọa độ', en: 'Coordinates', ko: '좌표', ru: 'Координаты', th: 'พิกัด', zh: '坐标', id: 'Koordinat', ms: 'Koordinat', lo: 'ພິກັດ', es: 'Coordenadas', fr: 'Coordonnées', de: 'Koordinaten'
  }));
  allTranslations.push(...createTranslation('map', 'info.region', {
    vi: 'Khu vực', en: 'Region', ko: '지역', ru: 'Регион', th: 'ภูมิภาค', zh: '区域', id: 'Wilayah', ms: 'Wilayah', lo: 'ພື້ນທີ່', es: 'Región', fr: 'Région', de: 'Region'
  }));
  allTranslations.push(...createTranslation('map', 'info.directions', {
    vi: '📍 Chỉ đường', en: '📍 Directions', ko: '📍 길찾기', ru: '📍 Маршрут', th: '📍 เส้นทาง', zh: '📍 导航', id: '📍 Arah', ms: '📍 Arah', lo: '📍 ເສັ້ນທາງ', es: '📍 Direcciones', fr: '📍 Itinéraire', de: '📍 Route'
  }));
  allTranslations.push(...createTranslation('map', 'info.detail', {
    vi: 'Chi tiết', en: 'Detail', ko: '상세', ru: 'Подробнее', th: 'รายละเอียด', zh: '详情', id: 'Detail', ms: 'Butiran', lo: 'ລາຍລະອຽດ', es: 'Detalle', fr: 'Détail', de: 'Details'
  }));
  allTranslations.push(...createTranslation('map', 'map.showing', {
    vi: 'Hiển thị', en: 'Showing', ko: '표시', ru: 'Показано', th: 'แสดง', zh: '显示', id: 'Menampilkan', ms: 'Menunjukkan', lo: 'ສະແດງ', es: 'Mostrando', fr: 'Affichage', de: 'Anzeige'
  }));
  allTranslations.push(...createTranslation('map', 'map.destinations_count', {
    vi: 'điểm du lịch', en: 'destinations', ko: '관광지', ru: 'достопримечательности', th: 'สถานที่ท่องเที่ยว', zh: '目的地', id: 'destinasi', ms: 'destinasi', lo: 'ສະຖານທີ່ທ່ອງທ່ຽວ', es: 'destinos', fr: 'destinations', de: 'Reiseziele'
  }));
  allTranslations.push(...createTranslation('map', 'map.layer_boundaries', {
    vi: 'Ranh giới', en: 'Boundaries', ko: '경계', ru: 'Границы', th: 'เขตแดน', zh: '边界', id: 'Batas', ms: 'sempadan', lo: 'ເຂດແດນ', es: 'Límites', fr: 'Frontières', de: 'Grenzen'
  }));
  allTranslations.push(...createTranslation('map', 'map.layer_markers', {
    vi: 'Điểm đến', en: 'Destinations', ko: '관광지', ru: 'Места', th: 'จุดหมาย', zh: '目的地', id: 'Destinasi', ms: 'Destinasi', lo: 'ຈຸດໝາຍ', es: 'Destinos', fr: 'Destinations', de: 'Reiseziele'
  }));
  allTranslations.push(...createTranslation('map', 'map.layer_terrain', {
    vi: 'Địa hình', en: 'Terrain', ko: '지형', ru: 'Рельеф', th: 'ภูมิประเทศ', zh: '地形', id: 'Medan', ms: 'Rupa bumi', lo: 'ພູມີປະເທດ', es: 'Terreno', fr: 'Terrain', de: 'Gelände'
  }));
  allTranslations.push(...createTranslation('map', 'map.before_merge', {
    vi: 'trước sáp nhập', en: 'before merge', ko: '합병 전', ru: 'до объединения', th: 'ก่อนรวม', zh: '合并前', id: 'sebelum merger', ms: 'sebelum penggabungan', lo: 'ກ່ອນລວມເຂົ້າກັນ', es: 'antes de la fusión', fr: 'avant la fusion', de: 'vor der Zusammenlegung'
  }));
  allTranslations.push(...createTranslation('map', 'legend.tomua_old', {
    vi: 'Tô Múa (cũ)', en: 'To Mua (old)', ko: '또무아 (구)', ru: 'Томуа (старая)', th: 'โตมัว (เดิม)', zh: '托木（旧）', id: 'To Mua (lama)', ms: 'To Mua (lama)', lo: 'ໂຕມົວ (ເກົ່າ)', es: 'To Mua (antigua)', fr: 'To Mua (ancien)', de: 'To Mua (alt)'
  }));
  allTranslations.push(...createTranslation('map', 'legend.chiengkhoa_old', {
    vi: 'Chiềng Khoa (cũ)', en: 'Chieng Khoa (old)', ko: '치엥코아 (구)', ru: 'Чиенг Кхоа (старая)', th: 'เจียงข่า (เดิม)', zh: '清化（旧）', id: 'Chieng Khoa (lama)', ms: 'Chieng Khoa (lama)', lo: 'ເຊື່ອງຂ່າ (ເກົ່າ)', es: 'Chieng Khoa (antigua)', fr: 'Chieng Khoa (ancien)', de: 'Chieng Khoa (alt)'
  }));
  allTranslations.push(...createTranslation('map', 'legend.suoibang_old', {
    vi: 'Suối Bàng (cũ)', en: 'Suoi Bang (old)', ko: '수이방 (구)', ru: 'Суой Банг (старая)', th: 'ซ่วยบ่าง (เดิม)', zh: '瑞邦（旧）', id: 'Suoi Bang (lama)', ms: 'Suoi Bang (lama)', lo: 'ຊ້ວຍບາງ (ເກົ່າ)', es: 'Suoi Bang (antigua)', fr: 'Suoi Bang (ancien)', de: 'Suoi Bang (alt)'
  }));
  allTranslations.push(...createTranslation('map', 'legend.tomua_new', {
    vi: 'Tô Múa (mới)', en: 'To Mua (new)', ko: '또무아 (신)', ru: 'Томуа (новая)', th: 'โตมัว (ใหม่)', zh: '托木（新）', id: 'To Mua (baru)', ms: 'To Mua (baru)', lo: 'ໂຕມົວ (ໃໝ່)', es: 'To Mua (nueva)', fr: 'To Mua (nouveau)', de: 'To Mua (neu)'
  }));

  // === DETAIL PAGE ===
  allTranslations.push(...createTranslation('detail', 'detail.gallery', {
    vi: 'Thư viện ảnh', en: 'Photo gallery', ko: '사진 갤러리', ru: 'Фотогалерея', th: 'แกลเลอรี่รูปภาพ', zh: '照片库', id: 'Galeri foto', ms: 'Galeri foto', lo: 'ແກເລີລີຮູບ', es: 'Galería de fotos', fr: 'Galerie photos', de: 'Fotogalerie'
  }));
  allTranslations.push(...createTranslation('detail', 'detail.notes', {
    vi: 'Lưu ý cho du khách', en: 'Visitor notes', ko: '방문자 안내', ru: 'Примечания для посетителей', th: 'บันทึกสำหรับผู้เยี่ยมชม', zh: '游客须知', id: 'Catatan pengunjung', ms: 'Nota pelawat', lo: 'ບັນທຶກສຳລັບນັກທ່ອງທ່ຽວ', es: 'Notas para visitantes', fr: 'Notes pour les visiteurs', de: 'Hinweise für Besucher'
  }));
  allTranslations.push(...createTranslation('detail', 'detail.nearby', {
    vi: 'Điểm đến gần đây', en: 'Nearby destinations', ko: '근처 관광지', ru: 'Ближайшие места', th: 'จุดหมายใกล้เคียง', zh: '附近目的地', id: 'Destinasi terdekat', ms: 'Destinasi berhampiran', lo: 'ຈຸດໝາຍໃກ້ຄຽງ', es: 'Destinos cercanos', fr: 'Destinations à proximité', de: 'Nahegelegene Ziele'
  }));
  allTranslations.push(...createTranslation('detail', 'detail.directions', {
    vi: 'Chỉ đường (Google Maps)', en: 'Directions (Google Maps)', ko: '길찾기 (Google Maps)', ru: 'Маршрут (Google Maps)', th: 'เส้นทาง (Google Maps)', zh: '导航 (Google Maps)', id: 'Arah (Google Maps)', ms: 'Arah (Google Maps)', lo: 'ເສັ້ນທາງ (Google Maps)', es: 'Direcciones (Google Maps)', fr: 'Itinéraire (Google Maps)', de: 'Route (Google Maps)'
  }));
  allTranslations.push(...createTranslation('detail', 'detail.copy_coords', {
    vi: 'Sao chép tọa độ', en: 'Copy coordinates', ko: '좌표 복사', ru: 'Копировать координаты', th: 'คัดลอกพิกัด', zh: '复制坐标', id: 'Salin koordinat', ms: 'Salin koordinat', lo: 'ສຳເນົາພິກັດ', es: 'Copiar coordenadas', fr: 'Copier les coordonnées', de: 'Koordinaten kopieren'
  }));

  // === LOGIN PAGE ===
  allTranslations.push(...createTranslation('login', 'login.kicker', {
    vi: 'Hệ thống quản trị', en: 'Admin system', ko: '관리 시스템', ru: 'Система управления', th: 'ระบบจัดการ', zh: '管理系统', id: 'Sistem admin', ms: 'Sistem pentadbiran', lo: 'ລະບົບຈັດການ', es: 'Sistema administrativo', fr: 'Système d\'administration', de: 'Verwaltungssystem'
  }));
  allTranslations.push(...createTranslation('login', 'login.title', {
    vi: 'Đăng nhập', en: 'Sign in', ko: '로그인', ru: 'Вход', th: 'เข้าสู่ระบบ', zh: '登录', id: 'Masuk', ms: 'Log masuk', lo: 'ເຂົ້າສູ່ລະບົບ', es: 'Iniciar sesión', fr: 'Connexion', de: 'Anmelden'
  }));
  allTranslations.push(...createTranslation('login', 'login.desc', {
    vi: 'Truy cập bảng điều khiển quản lý bản đồ du lịch', en: 'Access the tourism map management dashboard', ko: '관광 지도 관리 대시보드에 접속', ru: 'Доступ к панели управления туристической картой', th: 'เข้าถึงแดชบอร์ดจัดการแผนที่ท่องเที่ยว', zh: '访问旅游地图管理控制面板', id: 'Akses dasbor manajemen peta wisata', ms: 'Akses papan pemuka pengurusan peta pelancongan', lo: 'ເຂົ້າເຖິງແຜງຄວບຄຸມການຈັດການແຜນທີ່ທ່ອງທ່ຽວ', es: 'Accede al panel de gestión del mapa turístico', fr: 'Accéder au tableau de bord de gestion de la carte touristique', de: 'Zugang zum Tourismuskarten-Management-Dashboard'
  }));
  allTranslations.push(...createTranslation('login', 'label_username', {
    vi: 'Tên đăng nhập', en: 'Username', ko: '사용자 이름', ru: 'Имя пользователя', th: 'ชื่อผู้ใช้', zh: '用户名', id: 'Nama pengguna', ms: 'Nama pengguna', lo: 'ຊື່ຜູ້ໃຊ້', es: 'Usuario', fr: 'Nom d\'utilisateur', de: 'Benutzername'
  }));
  allTranslations.push(...createTranslation('login', 'label_password', {
    vi: 'Mật khẩu', en: 'Password', ko: '비밀번호', ru: 'Пароль', th: 'รหัสผ่าน', zh: '密码', id: 'Kata sandi', ms: 'Kata laluan', lo: 'ລະຫັດຜ່ານ', es: 'Contraseña', fr: 'Mot de passe', de: 'Passwort'
  }));
  allTranslations.push(...createTranslation('login', 'ph_username', {
    vi: 'Nhập tên đăng nhập', en: 'Enter your username', ko: '사용자 이름 입력', ru: 'Введите имя пользователя', th: 'กรอกชื่อผู้ใช้', zh: '输入用户名', id: 'Masukkan nama pengguna', ms: 'Masukkan nama pengguna', lo: 'ປ້ອນຊື່ຜູ້ໃຊ້', es: 'Ingresa tu usuario', fr: 'Entrez votre nom d\'utilisateur', de: 'Benutzername eingeben'
  }));
  allTranslations.push(...createTranslation('login', 'ph_password', {
    vi: 'Nhập mật khẩu', en: 'Enter your password', ko: '비밀번호 입력', ru: 'Введите пароль', th: 'กรอกรหัสผ่าน', zh: '输入密码', id: 'Masukkan kata sandi', ms: 'Masukkan kata laluan', lo: 'ປ້ອນລະຫັດຜ່ານ', es: 'Ingresa tu contraseña', fr: 'Entrez votre mot de passe', de: 'Passwort eingeben'
  }));
  allTranslations.push(...createTranslation('login', 'remember_me', {
    vi: 'Ghi nhớ đăng nhập', en: 'Remember me', ko: '로그인 상태 유지', ru: 'Запомнить меня', th: 'จดจำการเข้าสู่ระบบ', zh: '记住登录', id: 'Ingat saya', ms: 'Ingat saya', lo: 'ຈື່ຈຳການເຂົ້າສູ່ລະບົບ', es: 'Recordarme', fr: 'Se souvenir de moi', de: 'Angemeldet bleiben'
  }));
  allTranslations.push(...createTranslation('login', 'forgot_pw', {
    vi: 'Quên mật khẩu?', en: 'Forgot password?', ko: '비밀번호 찾기?', ru: 'Забыли пароль?', th: 'ลืมรหัสผ่าน?', zh: '忘记密码？', id: 'Lupa kata sandi?', ms: 'Lupa kata laluan?', lo: 'ລືມລະຫັດຜ່ານ?', es: '¿Olvidaste tu contraseña?', fr: 'Mot de passe oublié ?', de: 'Passwort vergessen?'
  }));
  allTranslations.push(...createTranslation('login', 'btn_login', {
    vi: 'Đăng nhập', en: 'Sign in', ko: '로그인', ru: 'Войти', th: 'เข้าสู่ระบบ', zh: '登录', id: 'Masuk', ms: 'Log masuk', lo: 'ເຂົ້າສູ່ລະບົບ', es: 'Iniciar sesión', fr: 'Se connecter', de: 'Anmelden'
  }));
  allTranslations.push(...createTranslation('login', 'error_invalid', {
    vi: 'Tên đăng nhập hoặc mật khẩu không đúng', en: 'Invalid username or password', ko: '사용자 이름 또는 비밀번호가 잘못되었습니다', ru: 'Неверное имя пользователя или пароль', th: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', zh: '用户名或密码错误', id: 'Nama pengguna atau kata sandi salah', ms: 'Nama pengguna atau kata laluan salah', lo: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ', es: 'Usuario o contraseña incorrectos', fr: 'Nom d\'utilisateur ou mot de passe incorrect', de: 'Benutzername oder Passwort falsch'
  }));
  allTranslations.push(...createTranslation('login', 'error_empty', {
    vi: 'Vui lòng nhập đầy đủ thông tin', en: 'Please fill in all fields', ko: '모든 필드를 입력하세요', ru: 'Пожалуйста, заполните все поля', th: 'กรุณากรอกข้อมูลให้ครบถ้วน', zh: '请填写所有字段', id: 'Harap isi semua kolom', ms: 'Sila isi semua medan', lo: 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', es: 'Por favor completa todos los campos', fr: 'Veuillez remplir tous les champs', de: 'Bitte alle Felder ausfüllen'
  }));
  allTranslations.push(...createTranslation('login', 'back_home', {
    vi: 'Trang chủ', en: 'Home', ko: '홈', ru: 'Главная', th: 'หน้าแรก', zh: '首页', id: 'Beranda', ms: 'Laman utama', lo: 'ໜ້າຫຼັກ', es: 'Inicio', fr: 'Accueil', de: 'Startseite'
  }));
  allTranslations.push(...createTranslation('login', 'or', {
    vi: 'hoặc', en: 'or', ko: '또는', ru: 'или', th: 'หรือ', zh: '或', id: 'atau', ms: 'atau', lo: 'ຫຼື', es: 'o', fr: 'ou', de: 'oder'
  }));
  allTranslations.push(...createTranslation('login', 'language', {
    vi: 'Ngôn ngữ:', en: 'Language:', ko: '언어:', ru: 'Язык:', th: 'ภาษา:', zh: '语言：', id: 'Bahasa:', ms: 'Bahasa:', lo: 'ພາສາ:', es: 'Idioma:', fr: 'Langue :', de: 'Sprache:'
  }));
  allTranslations.push(...createTranslation('login', 'footer_text', {
    vi: 'Bản đồ Du lịch số Xã Tô Múa', en: 'To Mua Digital Tourism Map', ko: '또무아 디지털 관광 지도', ru: 'Цифровая туристическая карта Томуа', th: 'แผนที่ท่องเที่ยวดิจิทัลตำบลโตมัว', zh: '托木数字旅游地图', id: 'Peta Wisata Digital To Mua', ms: 'Peta Pelancongan Digital To Mua', lo: 'ແຜນທີ່ທ່ອງທ່ຽວດິຈິຕອລບ້ານໂຕມົວ', es: 'Mapa Turístico Digital To Mua', fr: 'Carte Touristique Numérique To Mua', de: 'Digitale Tourismuskarte To Mua'
  }));
  allTranslations.push(...createTranslation('login', 'footer_admin', {
    vi: 'Dành cho Quản trị viên & Cộng tác viên', en: 'For Administrators & Collaborators', ko: '관리자 & 협력자 전용', ru: 'Для администраторов и сотрудников', th: 'สำหรับผู้ดูแลระบบและผู้ร่วมงาน', zh: '管理员和协作者专用', id: 'Untuk Administrator & Kolaborator', ms: 'Untuk Pentadbir & Penyumbang', lo: 'ສຳລັບຜູ້ບໍລິຫານ ແລະ ຜູ້ຮ່ວມງານ', es: 'Para Administradores y Colaboradores', fr: 'Pour les Administrateurs et Collaborateurs', de: 'Für Administratoren & Mitarbeiter'
  }));

    allTranslations.push(...createTranslation('common', 'dest.load_more', {"vi":"Xem thêm","en":"Load more","ko":"더 보기","ru":"Загрузить еще","th":"โหลดเพิ่ม","zh":"加载更多","id":"Muat lebih banyak","ms":"Muat lebih banyak","lo":"ໂຫຼດເພີ່ມ","es":"Cargar más","fr":"Charger plus","de":"Mehr laden"}));
  allTranslations.push(...createTranslation('common', 'dest.no_more', {"vi":"Đã hiển thị tất cả","en":"All items displayed","ko":"모든 항목이 표시되었습니다","ru":"Все элементы отображены","th":"แสดงรายการทั้งหมดแล้ว","zh":"已显示所有项目","id":"Semua item ditampilkan","ms":"Semua item dipaparkan","lo":"ສະແດງທຸກລາຍການແລ້ວ","es":"Todos los elementos mostrados","fr":"Tous les éléments affichés","de":"Alle Artikel angezeigt"}));
  allTranslations.push(...createTranslation('common', 'dest.items', {"vi":"điểm đến","en":"destinations","ko":"관광지","ru":"направления","th":"จุดหมาย","zh":"目的地","id":"destinasi","ms":"destinasi","lo":"ສະຖານທີ່","es":"destinos","fr":"destinations","de":"Reiseziele"}));
  allTranslations.push(...createTranslation('common', 'map.loading', {"vi":"Đang tải...","en":"Loading...","ko":"로딩 중...","ru":"Загрузка...","th":"กำลังโหลด...","zh":"加载中...","id":"Memuat...","ms":"Memuatkan...","lo":"ກຳລັງໂຫຼດ...","es":"Cargando...","fr":"Chargement...","de":"Laden..."}));

  // === ABOUT PAGE ===
  allTranslations.push(...createTranslation('about', 'nav.brand', {"vi":"Tô Múa","en":"Tô Múa","ko":"또무아","ru":"То Муа","th":"โตมัว","zh":"托木阿","id":"To Mua","ms":"To Mua","lo":"ໂຕມົວ","es":"To Mua","fr":"To Mua","de":"To Mua"}));
  allTranslations.push(...createTranslation('about', 'nav.home', {"vi":"Trang chủ","en":"Home","ko":"홈","ru":"Главная","th":"หน้าแรก","zh":"首页","id":"Beranda","ms":"Laman Utama","lo":"ໜ້າຫຼັກ","es":"Inicio","fr":"Accueil","de":"Startseite"}));
  allTranslations.push(...createTranslation('about', 'nav.map', {"vi":"Bản đồ","en":"Map","ko":"지도","ru":"Карта","th":"แผนที่","zh":"地图","id":"Peta","ms":"Peta","lo":"ແຜນທີ່","es":"Mapa","fr":"Carte","de":"Karte"}));
  allTranslations.push(...createTranslation('about', 'nav.about', {"vi":"Giới thiệu","en":"About","ko":"소개","ru":"О нас","th":"เกี่ยวกับ","zh":"关于","id":"Tentang","ms":"Tentang","lo":"ກ່ຽວກັບ","es":"Acerca de","fr":"À propos","de":"Über uns"}));
  allTranslations.push(...createTranslation('about', 'nav.admin', {"vi":"Quản trị","en":"Admin","ko":"관리","ru":"Админ","th":"ผู้ดูแล","zh":"管理","id":"Admin","ms":"Admin","lo":"ບໍລິຫານ","es":"Admin","fr":"Admin","de":"Admin"}));
  allTranslations.push(...createTranslation('about', 'hero.badge', {"vi":"🏔️ Tỉnh Sơn La — Việt Nam","en":"🏔️ Son La Province — Vietnam","ko":"🏔️ 선라성 — 베트남","ru":"🏔️ Провинция Шон Ла — Вьетнам","th":"🏔️ จังหวัดซอนลา — เวียดนาม","zh":"🏔️ 山罗省 — 越南","id":"🏔️ Provinsi Son La — Vietnam","ms":"🏔️ Wilayah Son La — Vietnam","lo":"🏔️ ແຂວງຊົນລາ — ຫວຽດນາມ","es":"🏔️ Provincia de Son La — Vietnam","fr":"🏔️ Province de Son La — Vietnam","de":"🏔️ Provinz Son La — Vietnam"}));
  allTranslations.push(...createTranslation('about', 'hero.title', {"vi":"Giới thiệu<br>Xã Tô Múa","en":"About<br>Tô Múa","ko":"소개<br>또무아","ru":"О<br>То Муа","th":"เกี่ยวกับ<br>โตมัว","zh":"关于<br>托木阿","id":"Tentang<br>To Mua","ms":"Tentang<br>To Mua","lo":"ກ່ຽວກັບ<br>ໂຕມົວ","es":"Acerca de<br>To Mua","fr":"À propos de<br>To Mua","de":"Über<br>To Mua"}));
  allTranslations.push(...createTranslation('about', 'hero.subtitle', {"vi":"Từ ba xã Tô Múa, Chiềng Khoa và Suối Bàng — một vùng đất mới mang đậm bản sắc văn hóa Tây Bắc.","en":"From three communes — Tô Múa, Chiềng Khoa, and Suối Bàng — a new land rich in Northwest cultural identity.","ko":"또무아, 치엥코아, 수이방 — 세 면이 하나로 합쳐진 서북부 문화의 땅.","ru":"Из трёх коммун — То Муа, Тьенг Кхоа и Суой Банг — новая земля, богатая культурой Северо-Запада.","th":"จากสามตำบล — โตมัว, เจืองโคย, และซ่วยบาง — ดินแดนใหม่ที่มีวัฒนธรรมตะวันตกเฉียงเหนืออันอุดม","zh":"从三个社 — 托木阿、琼科和水榜 — 一片承载西北文化的新土地。","id":"Dari tiga komune — To Mua, Chieng Khoa, dan Suoi Bang — tanah baru yang kaya budaya Barat Laut.","ms":"Daripada tiga komun — To Mua, Chieng Khoa, dan Suoi Bang — tanah baharu yang kaya budaya Barat Laut.","lo":"ຈາກສາມບ້ານ — ໂຕມົວ, ຊຽງຂ່າ ແລະ ຊ້ວຍແບ່ງ — ດິນແດນໃໝ່ທີ່ອຸດົມສົມບູນວັດທະນະທຳຕາເວັນຕົກສ່ຽງເໜືອ.","es":"De tres comunas — To Mua, Chieng Khoa y Suoi Bang — una nueva tierra rica en cultura del Noroeste.","fr":"De trois communes — To Mua, Chieng Khoa et Suoi Bang — une nouvelle terre riche en culture du Nord-Ouest.","de":"Aus drei Gemeinden — To Mua, Chieng Khoa und Suoi Bang — ein neues Land, reich an nordwestlicher Kultur."}));
  allTranslations.push(...createTranslation('about', 'merge.kicker', {"vi":"Lịch sử sáp nhập","en":"Merger history","ko":"합병 역사","ru":"История объединения","th":"ประวัติการควบรวม","zh":"合并历史","id":"Riwayat penggabungan","ms":"Sejarah penggabungan","lo":"ປະຫວັດການລວມ","es":"Historia de fusión","fr":"Historique de fusion","de":"Fusionsgeschichte"}));
  allTranslations.push(...createTranslation('about', 'merge.title', {"vi":"Từ 3 xã thành 1","en":"From 3 to 1","ko":"3에서 1로","ru":"Из 3 в 1","th":"จาก 3 เป็น 1","zh":"三社合一","id":"Dari 3 menjadi 1","ms":"Dari 3 kepada 1","lo":"ຈາກ 3 ເປັນ 1","es":"De 3 a 1","fr":"De 3 à 1","de":"Von 3 zu 1"}));
  allTranslations.push(...createTranslation('about', 'merge.subtitle', {"vi":"Năm 2025, ba xã Tô Múa, Chiềng Khoa và Suối Bàng chính thức sáp nhập thành xã Tô Múa mới — giữ gìn bản sắc, hướng tới tương lai.","en":"In 2025, three communes — Tô Múa, Chiềng Khoa, and Suối Bàng — officially merged into the new Tô Múa commune, preserving heritage, building the future.","ko":"2025년, 또무아·치엥코아·수이방 세 면이 새로운 또무아 면으로 공식 합병되었습니다.","ru":"В 2025 году три коммуны официально объединились в новую коммуну То Муа — сохраняя наследие, строя будущее.","th":"ในปี 2025 สามตำบลได้ควบรวมเป็นตำบลโตมัวใหม่ — รักษาเอกลักษณ์ ก้าวสู่อนาคต","zh":"2025年，托木阿、琼科和水榜三个社正式合并为新的托木阿社 — 传承文化，面向未来。","id":"Tahun 2025, tiga komune resmi bergabung menjadi komune To Mua baru — melestarikan warisan, membangun masa depan.","ms":"Pada 2025, tiga komun secara rasmi bergabung menjadi komun To Mua baharu — memelihara warisan, membina masa depan.","lo":"ໃນປີ 2025, ສາມບ້ານໄດ້ລວມເຂົ້າກັນເປັນບ້ານໂຕມົວໃໝ່ — ຮັກສາມູນເຊື້ອ, ກ້າວສູ່ອະນາຄົດ.","es":"En 2025, tres comunas se fusionaron oficialmente en la nueva comuna To Mua — preservando el legado, construyendo el futuro.","fr":"En 2025, trois communes ont officiellement fusionné dans la nouvelle commune To Mua — préservant l'héritage, construisant l'avenir.","de":"2025 fusionierten drei Gemeinden offiziell zur neuen Gemeinde To Mua — Erbe bewahren, Zukunft gestalten."}));
  allTranslations.push(...createTranslation('about', 'merge.1.code', {"vi":"Mã: 04018","en":"Code: 04018","ko":"코드: 04018","ru":"Код: 04018","th":"รหัส: 04018","zh":"代码: 04018","id":"Kode: 04018","ms":"Kod: 04018","lo":"ລະຫັດ: 04018","es":"Código: 04018","fr":"Code : 04018","de":"Code: 04018"}));
  allTranslations.push(...createTranslation('about', 'merge.1.name', {"vi":"Tô Múa","en":"Tô Múa","ko":"또무아","ru":"То Муа","th":"โตมัว","zh":"托木阿","id":"To Mua","ms":"To Mua","lo":"ໂຕມົວ","es":"To Mua","fr":"To Mua","de":"To Mua"}));
  allTranslations.push(...createTranslation('about', 'merge.1.desc', {"vi":"Trung tâm hành chính mới. Nổi tiếng với Thác Nàng Tiên và cảnh quan núi rừng hùng vĩ.","en":"New administrative center. Famous for Nàng Tiên Waterfall and majestic mountain scenery.","ko":"새 행정 중심지. 눝띠엔 폭포와 웅장한 산경치로 유명.","ru":"Новый административный центр. Известен водопадом Нанг Тьен и величественным горным пейзажем.","th":"ศูนย์กลางการปกครองใหม่ มีชื่อเสียงจากน้ำตกนางเทียนและทิวทัศน์ภูเขา","zh":"新行政中心。以仙女瀑布和壮丽山景闻名。","id":"Pusat administrasi baru. Terkenal dengan Air Terjang Nang Tien dan pemandangan pegunungan megah.","ms":"Pusat pentadbiran baharu. Terkenal dengan Air Terjun Nang Tien dan pemandangan pergunungan megah.","lo":"ສູນກາງບໍລິຫານໃໝ່. ມີຊື່ສຽງນ້ຳຕົກນາງເທິນ ແລະ ທິວທັດພູເຂົາ.","es":"Nuevo centro administrativo. Famoso por la cascada Nang Tien y el paisaje montañoso majestuoso.","fr":"Nouveau centre administratif. Célèbre pour la cascade Nang Tien et le paysage montagneux majestueux.","de":"Neues Verwaltungszentrum. Berühmt für den Nang Tien Wasserfall und majestätische Berglandschaft."}));
  allTranslations.push(...createTranslation('about', 'merge.2.code', {"vi":"Mã: 04036","en":"Code: 04036","ko":"코드: 04036","ru":"Код: 04036","th":"รหัส: 04036","zh":"代码: 04036","id":"Kode: 04036","ms":"Kod: 04036","lo":"ລະຫັດ: 04036","es":"Código: 04036","fr":"Code : 04036","de":"Code: 04036"}));
  allTranslations.push(...createTranslation('about', 'merge.2.name', {"vi":"Chiềng Khoa","en":"Chiềng Khoa","ko":"치엥코아","ru":"Тьенг Кхоа","th":"เจืองโคย","zh":"琼科","id":"Chieng Khoa","ms":"Chieng Khoa","lo":"ຊຽງຂ່າ","es":"Chieng Khoa","fr":"Chieng Khoa","de":"Chieng Khoa"}));
  allTranslations.push(...createTranslation('about', 'merge.2.desc', {"vi":"Vùng đất hang động và di tích lịch sử — nơi lưu giữ dấu tích văn hóa Mường cổ.","en":"Land of caves and historical sites — preserving traces of ancient Mường culture.","ko":"동굴과 역사 유적의 땅 — 고대 므엉 문화의 흔적을 간직한 곳.","ru":"Земля пещер и исторических памятников — следы древней культуры Мыонг.","th":"ดินแดนถ้ำและแหล่งประวัติศาสตร์ — ร่องรอยวัฒนธรรมเมืองโบราณ","zh":"洞穴和历史遗迹之地 — 保存着古老芒族文化的痕迹。","id":"Tanah gua dan situs bersejarah — melestarikan jejak budaya Muong kuno.","ms":"Tanah gua dan tapak bersejarah — memelihara jejak budaya Muong kuno.","lo":"ດິນແດນຖ້ຳ ແລະ ສະຖານທີ່ທາງປະຫວັດສາດ — ຮັກສາຮ່ອງຮອຍວັດທະນະທຳເມືອງບູຮານ.","es":"Tierra de cuevas y sitios históricos — preservando vestigios de la antigua cultura Muong.","fr":"Terre de grottes et de sites historiques — préservant les vestiges de l'ancienne culture Muong.","de":"Land der Höhlen und historischen Stätten — Bewahrung der Spuren der alten Muong-Kultur."}));
  allTranslations.push(...createTranslation('about', 'merge.3.code', {"vi":"Mã: 03994","en":"Code: 03994","ko":"코드: 03994","ru":"Код: 03994","th":"รหัส: 03994","zh":"代码: 03994","id":"Kode: 03994","ms":"Kod: 03994","lo":"ລະຫັດ: 03994","es":"Código: 03994","fr":"Code : 03994","de":"Code: 03994"}));
  allTranslations.push(...createTranslation('about', 'merge.3.name', {"vi":"Suối Bàng","en":"Suối Bàng","ko":"수이방","ru":"Суой Банг","th":"ซ่วยบาง","zh":"水榜","id":"Suoi Bang","ms":"Suoi Bang","lo":"ຊ້ວຍແບ່ງ","es":"Suoi Bang","fr":"Suoi Bang","de":"Suoi Bang"}));
  allTranslations.push(...createTranslation('about', 'merge.3.desc', {"vi":"Vùng cao nguyên với Hang mộ Tạng Mè — di tích khảo cổ quý giá của người Thái cổ.","en":"Highland area with Tạng Mè Burial Cave — a precious archaeological site of ancient Thai people.","ko":"땅苠메 매장 동굴이 있는 고원 — 고대 타이족의 귀중한 유적지.","ru":"Нагорье с погребальной пещерой Танг Ме — ценный археологический памятник древних тайцев.","th":"ที่สูงกับถ้ำฝังศพต่างเม — แหล่งโบราณคดีอันล้ำค่าของชาวไทยโบราณ","zh":"拥有葬墓洞的高原 — 古代泰族的珍贵考古遗址。","id":"Dataran tinggi dengan Gua Makam Tange Me — situs arkeologi berharga orang Thai kuno.","ms":"Tanah tinggi dengan Gua Perkuburan Tange Me — tapak arkeologi berharga orang Thai kuno.","lo":"ພູສູງກັບຖ້ຳຝັງສົບຕ່າງເໝ — ສະຖານທີ່ບູຮານຄະດີທີ່ລ້ຳຄ່າຂອງຊາວໄທບູຮານ.","es":"Tierras altas con la Cueva Funeraria Tange Me — sitio arqueológico precioso del antiguo pueblo Thai.","fr":"Hautes terres avec la Grotte Funéraire Tange Me — site archéologique précieux de l'ancien peuple Thai.","de":"Hochland mit der Tange Me Grabhöhle — wertvolle archäologische Stätte der alten Thai."}));
  allTranslations.push(...createTranslation('about', 'diagram.kicker', {"vi":"Sáp nhập","en":"Merger","ko":"합병","ru":"Объединение","th":"การควบรวม","zh":"合并","id":"Penggabungan","ms":"Penggabungan","lo":"ການລວມ","es":"Fusión","fr":"Fusion","de":"Fusion"}));
  allTranslations.push(...createTranslation('about', 'diagram.title', {"vi":"Ba xã — Một tương lai","en":"Three communes — One future","ko":"세 면 — 하나의 미래","ru":"Три коммуны — одно будущее","th":"สามตำบล — หนึ่งอนาคต","zh":"三社 — 一个未来","id":"Tiga komune — Satu masa depan","ms":"Tiga komun — Satu masa depan","lo":"ສາມບ້ານ — ໜຶ່ງອະນາຄົດ","es":"Tres comunas — Un futuro","fr":"Trois communes — Un avenir","de":"Drei Gemeinden — Eine Zukunft"}));
  allTranslations.push(...createTranslation('about', 'diagram.result.name', {"vi":"Tô Múa (mới)","en":"Tô Múa (new)","ko":"또무아 (신규)","ru":"То Муа (новая)","th":"โตมัว (ใหม่)","zh":"托木阿（新）","id":"To Mua (baru)","ms":"To Mua (baharu)","lo":"ໂຕມົວ (ໃໝ່)","es":"To Mua (nueva)","fr":"To Mua (nouvelle)","de":"To Mua (neu)"}));
  allTranslations.push(...createTranslation('about', 'diagram.result.stats', {"vi":"181,98 km² · 14.701 nhân khẩu","en":"181.98 km² · 14,701 population","ko":"181.98km² · 인구 14,701","ru":"181,98 км² · 14 701 жителей","th":"181.98 ตร.กม. · ประชากร 14,701","zh":"181.98平方公里 · 人口14,701","id":"181,98 km² · 14.701 penduduk","ms":"181.98 km² · 14,701 penduduk","lo":"181,98 ກມ² · ປະຊາກອນ 14.701","es":"181,98 km² · 14.701 habitantes","fr":"181,98 km² · 14 701 habitants","de":"181,98 km² · 14.701 Einwohner"}));
  allTranslations.push(...createTranslation('about', 'stats.area', {"vi":"Diện tích tự nhiên","en":"Natural area","ko":"면적","ru":"Площадь","th":"พื้นที่","zh":"面积","id":"Luas wilayah","ms":"Keluasan","lo":"ພື້ນທີ່","es":"Superficie","fr":"Superficie","de":"Fläche"}));
  allTranslations.push(...createTranslation('about', 'stats.population', {"vi":"Nhân khẩu","en":"Population","ko":"인구","ru":"Население","th":"ประชากร","zh":"人口","id":"Penduduk","ms":"Penduduk","lo":"ປະຊາກອນ","es":"Población","fr":"Population","de":"Bevölkerung"}));
  allTranslations.push(...createTranslation('about', 'stats.merged', {"vi":"Xã cũ sáp nhập","en":"Merged communes","ko":"합병된 면","ru":"Объединённые коммуны","th":"ตำบลที่ควบรวม","zh":"合并社","id":"Komune yang digabung","ms":"Komun yang digabung","lo":"ບ້ານທີ່ລວມ","es":"Comunas fusionadas","fr":"Communes fusionnées","de":"Fusionierte Gemeinden"}));
  allTranslations.push(...createTranslation('about', 'map.kicker', {"vi":"Bản đồ","en":"Map","ko":"지도","ru":"Карта","th":"แผนที่","zh":"地图","id":"Peta","ms":"Peta","lo":"ແຜນທີ່","es":"Mapa","fr":"Carte","de":"Karte"}));
  allTranslations.push(...createTranslation('about', 'map.title', {"vi":"Ranh giới hành chính","en":"Administrative boundaries","ko":"행정 경계","ru":"Административные границы","th":"เขตแดนปกครอง","zh":"行政边界","id":"Batas administratif","ms":"Sempadan pentadbiran","lo":"ແຂດແບ່ງການບໍລິຫານ","es":"Límites administrativos","fr":"Limites administratives","de":"Verwaltungsgrenzen"}));
  allTranslations.push(...createTranslation('about', 'map.subtitle', {"vi":"Xem ranh giới 3 xã cũ và xã Tô Múa sau sáp nhập trên bản đồ.","en":"View the boundaries of 3 former communes and merged Tô Múa on the map.","ko":"3개 구 면과 합병 후 또무아의 경계를 지도에서 확인하세요.","ru":"Просмотрите границы 3 бывших коммун и объединённой То Муа на карте.","th":"ดูเขตแดน 3 ตำบลเดิมและตำบลโตมัวหลังควบรวมบนแผนที่","zh":"在地图上查看3个旧社和合并后托木阿的边界。","id":"Lihat batas 3 komune lama dan To Mua setelah penggabungan di peta.","ms":"Lihat sempadan 3 komun lama dan To Mua selepas penggabungan di peta.","lo":"ເບິ່ງແຂດແບ່ງ 3 ບ້ານເກົ່າ ແລະ ບ້ານໂຕມົວຫຼັງລວມເທິງແຜນທີ່.","es":"Ver los límites de 3 comunas antiguas y To Mua fusionada en el mapa.","fr":"Voir les limites des 3 anciennes communes et de To Mua fusionnée sur la carte.","de":"Sehen Sie die Grenzen der 3 ehemaligen Gemeinden und der fusionierten To Mua auf der Karte."}));
  allTranslations.push(...createTranslation('about', 'contact.kicker', {"vi":"Liên hệ","en":"Contact","ko":"연락처","ru":"Контакты","th":"ติดต่อ","zh":"联系","id":"Kontak","ms":"Hubungi","lo":"ຕິດຕໍ່","es":"Contacto","fr":"Contact","de":"Kontakt"}));
  allTranslations.push(...createTranslation('about', 'contact.title', {"vi":"Thông tin liên hệ","en":"Contact information","ko":"연락처 정보","ru":"Контактная информация","th":"ข้อมูลการติดต่อ","zh":"联系信息","id":"Informasi kontak","ms":"Maklumat hubungan","lo":"ຂໍ້ມູນການຕິດຕໍ່","es":"Información de contacto","fr":"Informations de contact","de":"Kontaktinformationen"}));
  allTranslations.push(...createTranslation('about', 'contact.ubnd.title', {"vi":"Ủy ban nhân dân xã Tô Múa","en":"Tô Múa People's Committee"}));
  allTranslations.push(...createTranslation('about', 'contact.ubnd.desc', {"vi":"Trụ sở UBND xã Tô Múa, tỉnh Sơn La","en":"UBND office, Tô Múa commune, Son La Province"}));
  allTranslations.push(...createTranslation('about', 'contact.phone.title', {"vi":"Điện thoại","en":"Phone"}));
  allTranslations.push(...createTranslation('about', 'contact.phone.desc', {"vi":"Liên hệ UBND xã Tô Múa","en":"Contact Tô Múa commune office"}));
  allTranslations.push(...createTranslation('about', 'contact.province.title', {"vi":"Tỉnh Sơn La","en":"Son La Province"}));
  allTranslations.push(...createTranslation('about', 'contact.province.desc', {"vi":"Tỉnh Sơn La, Việt Nam","en":"Son La Province, Vietnam"}));
  allTranslations.push(...createTranslation('about', 'contact.digital.title', {"vi":"Bản đồ số","en":"Digital map"}));
  allTranslations.push(...createTranslation('about', 'contact.digital.desc', {"vi":"Hệ thống quản lý bản đồ du lịch số xã Tô Múa","en":"Digital tourism map management system of Tô Múa"}));
  allTranslations.push(...createTranslation('about', 'footer.brand', {"vi":"Xã Tô Múa","en":"Tô Múa Commune","ko":"또무아 면","ru":"Коммуна То Муа","th":"ตำบลโตมัว","zh":"托木阿社","id":"Komune To Mua","ms":"Komun To Mua","lo":"ບ້ານໂຕມົວ","es":"Comuna To Mua","fr":"Commune To Mua","de":"Gemeinde To Mua"}));
  allTranslations.push(...createTranslation('about', 'footer.desc', {"vi":"Bản đồ số du lịch xã Tô Múa, tỉnh Sơn La. Dự án phục vụ phát triển du lịch cộng đồng và giới thiệu bản sắc văn hóa vùng cao.","en":"Digital tourism map of Tô Múa commune, Son La Province. A project for community tourism development.","ko":"또무아 면 디지털 관광 지도, 선라성.","ru":"Цифровая туристическая карта коммуны То Муа.","th":"แผนที่ท่องเที่ยวดิจิทัลตำบลโตมัว","zh":"托木阿社数字旅游地图。","id":"Peta wisata digital komune To Mua.","ms":"Peta pelancongan digital komun To Mua.","lo":"ແຜນທີ່ທ່ອງທ່ຽວດິຈິຕອລບ້ານໂຕມົວ.","es":"Mapa turístico digital de la comuna To Mua.","fr":"Carte touristique numérique de la commune To Mua.","de":"Digitale Tourismuskarte der Gemeinde To Mua."}));
  allTranslations.push(...createTranslation('about', 'footer.nav', {"vi":"Điều hướng","en":"Navigation","ko":"내비게이션","ru":"Навигация","th":"นำทาง","zh":"导航","id":"Navigasi","ms":"Navigasi","lo":"ນຳທາງ","es":"Navegación","fr":"Navigation","de":"Navigation"}));
  allTranslations.push(...createTranslation('about', 'footer.services', {"vi":"Dịch vụ","en":"Services","ko":"서비스","ru":"Услуги","th":"บริการ","zh":"服务","id":"Layanan","ms":"Perkhidmatan","lo":"ບໍລິການ","es":"Servicios","fr":"Services","de":"Dienstleistungen"}));
  allTranslations.push(...createTranslation('about', 'footer.homestay', {"vi":"Lưu trú","en":"Accommodation","ko":"숙박","ru":"Жильё","th":"ที่พัก","zh":"住宿","id":"Akomodasi","ms":"Penginapan","lo":"ທີ່ພັກ","es":"Alojamiento","fr":"Hébergement","de":"Unterkunft"}));
  allTranslations.push(...createTranslation('about', 'footer.food', {"vi":"Ẩm thực","en":"Cuisine","ko":"음식","ru":"Кухня","th":"อาหาร","zh":"美食","id":"Kuliner","ms":"Kulinari","lo":"ອາຫານ","es":"Gastronomía","fr":"Cuisine","de":"Kulinarik"}));
  allTranslations.push(...createTranslation('about', 'footer.tour', {"vi":"Tour gợi ý","en":"Tours","ko":"투어","ru":"Туры","th":"ทัวร์","zh":"旅游","id":"Tur","ms":"Lawatan","lo":"ທ່ຽວ","es":"Tours","fr":"Circuits","de":"Touren"}));
  allTranslations.push(...createTranslation('about', 'footer.contact', {"vi":"Liên hệ","en":"Contact","ko":"연락처","ru":"Контакты","th":"ติดต่อ","zh":"联系","id":"Kontak","ms":"Hubungi","lo":"ຕິດຕໍ່","es":"Contacto","fr":"Contact","de":"Kontakt"}));
  allTranslations.push(...createTranslation('about', 'footer.ubnd', {"vi":"UBND xã Tô Múa","en":"Tô Múa People's Committee"}));
  allTranslations.push(...createTranslation('about', 'footer.province', {"vi":"Tỉnh Sơn La","en":"Son La Province"}));
  allTranslations.push(...createTranslation('about', 'footer.powered', {"vi":"Xây dựng bằng công nghệ bản đồ số","en":"Built with digital map technology","ko":"디지털 지도 기술로 구축","ru":"Создано с помощью цифровых карт","th":"สร้างด้วยเทคโนโลยีแผนที่ดิจิทัล","zh":"数字地图技术支持","id":"Dibangun dengan teknologi peta digital","ms":"Dibina dengan teknologi peta digital","lo":"ສ້າງດ້ວຍເທັກໂນໂລຍີແຜນທີ່ດິຈິຕອລ","es":"Construido con tecnología de mapas digitales","fr":"Construit avec la technologie de cartes numériques","de":"Erstellt mit digitaler Kartentechnologie"}));

  // === DETAIL PAGE ===
  allTranslations.push(...createTranslation('detail', 'nav.admin', {"vi":"Quản trị","en":"Admin","ko":"관리","ru":"Админ","th":"ผู้ดูแล","zh":"管理","id":"Admin","ms":"Admin","lo":"ບໍລິຫານ","es":"Admin","fr":"Admin","de":"Admin"}));
  allTranslations.push(...createTranslation('detail', 'sidebar.map', {"vi":"Vị trí trên bản đồ","en":"Location on map","ko":"지도 위치","ru":"Местоположение на карте","th":"ตำแหน่งบนแผนที่","zh":"地图位置","id":"Lokasi di peta","ms":"Lokasi di peta","lo":"ຕຳແໜ່ງເທິງແຜນທີ່","es":"Ubicación en el mapa","fr":"Emplacement sur la carte","de":"Standort auf der Karte"}));
  allTranslations.push(...createTranslation('detail', 'sidebar.directions', {"vi":"Chỉ đường (Google Maps)","en":"Directions (Google Maps)","ko":"길찾기 (Google Maps)","ru":"Маршрут (Google Maps)","th":"เส้นทาง (Google Maps)","zh":"导航 (Google Maps)","id":"Arah (Google Maps)","ms":"Arah (Google Maps)","lo":"ເສັ້ນທາງ (Google Maps)","es":"Direcciones (Google Maps)","fr":"Itinéraire (Google Maps)","de":"Route (Google Maps)"}));
  allTranslations.push(...createTranslation('detail', 'sidebar.copy', {"vi":"Sao chép tọa độ","en":"Copy coordinates","ko":"좌표 복사","ru":"Скопировать координаты","th":"คัดลอกพิกัด","zh":"复制坐标","id":"Salin koordinat","ms":"Salin koordinat","lo":"ສຳເນົາພິກັດ","es":"Copiar coordenadas","fr":"Copier les coordonnées","de":"Koordinaten kopieren"}));
  allTranslations.push(...createTranslation('detail', 'sidebar.nearby', {"vi":"Điểm đến gần đây","en":"Nearby destinations","ko":"인근 관광지","ru":"Ближайшие места","th":"สถานที่ใกล้เคียง","zh":"附近景点","id":"Destinasi terdekat","ms":"Destinasi berhampiran","lo":"ສະຖານທີ່ໃກ້ຄຽງ","es":"Destinos cercanos","fr":"Destinations à proximité","de":"Nahegelegene Ziele"}));
  allTranslations.push(...createTranslation('detail', 'notes.title', {"vi":"Lưu ý cho du khách","en":"Visitor notes","ko":"방문자 안내","ru":"Информация для посетителей","th":"ข้อมูลสำหรับผู้เยี่ยมชม","zh":"游客须知","id":"Catatan pengunjung","ms":"Nota pelawat","lo":"ບັນທຸກສຳລັບນັກທ່ອງທ່ຽວ","es":"Notas para visitantes","fr":"Notes pour les visiteurs","de":"Hinweise für Besucher"}));
  allTranslations.push(...createTranslation('detail', 'notes.1', {"vi":"Mang giày dép chống trơn — đường đi có thể trơn trượt vào mùa mưa","en":"Wear non-slip shoes — paths can be slippery during rainy season","ko":"미끄럼 방지 신발 착용 — 우기에는 길이 미끄러울 수 있습니다","ru":"Носите нескользящую обувь — тропы могут быть скользкими в сезон дождей","th":"สวมรองเท้ากันลื่น — ทางเดินอาจลื่นในฤดูฝน","zh":"穿防滑鞋——雨季路面可能湿滑","id":"Gunakan sepatu anti selip — jalanan bisa licin saat musim hujan","ms":"Pakai kasut anti licin — jalan mungkin licin semasa musim hujan","lo":"ໃສ່ເກີບກັນລື່ນ — ທາງອາດຈະລື່ນໃນລະດູຝົນ","es":"Usa zapatos antideslizantes — los caminos pueden estar resbaladizos en temporada de lluvias","fr":"Portez des chaussures antidérapantes — les sentiers peuvent être glissants en saison des pluies","de":"Tragen Sie rutschfeste Schuhe — Wege können in der Regenzeit rutschig sein"}));
  allTranslations.push(...createTranslation('detail', 'notes.2', {"vi":"Nên đi theo nhóm và có hướng dẫn viên địa phương","en":"Go in groups with a local guide","ko":"현지 가이드와 함께 그룹으로 이동하세요","ru":"Ходите группами с местным гидом","th":"เดินทางเป็นกลุ่มกับไกด์ท้องถิ่น","zh":"建议结伴同行并请当地向导","id":"Pergi berkelompok dengan pemandu lokal","ms":"Pergi berkumpulan dengan pemandu tempatan","lo":"ໄປເປັນກຸ່ມກັບໄກ້ທ້ອງຖິ່ນ","es":"Ve en grupo con guía local","fr":"Voyagez en groupe avec un guide local","de":"Gehen Sie in Gruppen mit einem lokalen Führer"}));
  allTranslations.push(...createTranslation('detail', 'notes.3', {"vi":"Giữ gìn vệ sinh, không xả rác","en":"Keep clean, do not litter","ko":"청결 유지, 쓰레기 투기 금지","ru":"Содержите в чистоте, не мусорьте","th":"รักษาความสะอาด ไม่ทิ้งขยะ","zh":"保持清洁，不要乱扔垃圾","id":"Jaga kebersihan, jangan buang sampah","ms":"Jaga kebersihan, jangan buang sampah","lo":"ຮັກສາຄວາມສະອາດ, ຢ່າຖິ້ມຂີ້ເຫຍື້ອ","es":"Mantén la limpieza, no tires basura","fr":"Gardez la propreté, ne jetez pas de déchets","de":"Halten Sie Sauber, werfen Sie keinen Müll"}));
  allTranslations.push(...createTranslation('detail', 'notes.4', {"vi":"Tôn trọng phong tục tập quán địa phương","en":"Respect local customs and traditions","ko":"현지 풍습과 전통을 존중하세요","ru":"Уважайте местные обычаи и традиции","th":"เคารพประเพณีท้องถิ่น","zh":"尊重当地风俗习惯","id":"Hormati adat istiadat setempat","ms":"Hormati adat resam tempatan","lo":"ເຄົາລົບຮີດຄອງປະເພນີທ້ອງຖິ່ນ","es":"Respeta las costumbres locales","fr":"Respectez les coutumes locales","de":"Respektieren Sie die örtlichen Bräuche"}));
  allTranslations.push(...createTranslation('detail', 'gallery.caption', {"vi":"Ảnh minh hoạ — sẽ được cập nhật bởi cộng tác viên","en":"Illustrative photos — to be updated by collaborators","ko":"참고 사진 — 협력자가 업데이트 예정","ru":"Иллюстративные фото — будут обновлены сотрудниками","th":"ภาพประกอบ — จะอัปเดตโดยผู้ร่วมงาน","zh":"示例照片——将由协作者更新","id":"Foto ilustrasi — akan diperbarui oleh kolaborator","ms":"Foto ilustrasi — akan dikemas kini oleh penyumbang","lo":"ພາບປະກອບ — ຈະອັບເດດໂດຍຜູ້ຮ່ວມງານ","es":"Fotos ilustrativas — serán actualizadas por colaboradores","fr":"Photos illustratives — seront mises à jour par les collaborateurs","de":"Illustrative Fotos — werden von Mitarbeitern aktualisiert"}));
  allTranslations.push(...createTranslation('detail', 'footer', {"vi":"© 2025 Xã Tô Múa — Tỉnh Sơn La","en":"© 2025 Tô Múa Commune — Son La Province","ko":"© 2025 또무아 면 — 선라성","ru":"© 2025 Коммуна То Муа — Провинция Шон Ла","th":"© 2025 ตำบลโตมัว — จังหวัดซอนลา","zh":"© 2025 托木阿社 — 山罗省","id":"© 2025 Komune To Mua — Provinsi Son La","ms":"© 2025 Komun To Mua — Wilayah Son La","lo":"© 2025 ບ້ານໂຕມົວ — ແຂວງຊົນລາ","es":"© 2025 Comuna To Mua — Provincia de Son La","fr":"© 2025 Commune To Mua — Province de Son La","de":"© 2025 Gemeinde To Mua — Provinz Son La"}));
  allTranslations.push(...createTranslation('detail', 'copy_alert', {"vi":"Đã sao chép tọa độ!","en":"Coordinates copied!","ko":"좌표가 복사되었습니다!","ru":"Координаты скопированы!","th":"คัดลอกพิกัดแล้ว!","zh":"坐标已复制！","id":"Koordinat tersalin!","ms":"Koordinat disalin!","lo":"ສຳເນົາພິກັດແລ້ວ!","es":"¡Coordenadas copiadas!","fr":"Coordonnées copiées !","de":"Koordinaten kopiert!"}));
  allTranslations.push(...createTranslation('detail', 'type.waterfall', {"vi":"Thác nước","en":"Waterfall","ko":"폭포","ru":"Водопад","th":"น้ำตก","zh":"瀑布","id":"Air Terjun","ms":"Air Terjun","lo":"ນ້ຳຕົກ","es":"Cascada","fr":"Cascade","de":"Wasserfall"}));
  allTranslations.push(...createTranslation('detail', 'type.cave', {"vi":"Hang động","en":"Cave","ko":"동굴","ru":"Пещера","th":"ถ้ำ","zh":"洞穴","id":"Gua","ms":"Gua","lo":"ຖ້ຳ","es":"Cueva","fr":"Grotte","de":"Höhle"}));
  allTranslations.push(...createTranslation('detail', 'type.historical', {"vi":"Di tích lịch sử","en":"Historical site","ko":"역사 유적","ru":"Историческое место","th":"แหล่งประวัติศาสตร์","zh":"历史遗迹","id":"Situs Sejarah","ms":"Tapak Sejarah","lo":"ສະຖານທີ່ທາງປະຫວັດສາດ","es":"Sitio Histórico","fr":"Site Historique","de":"Historische Stätte"}));
  allTranslations.push(...createTranslation('detail', 'type.spiritual', {"vi":"Tâm linh","en":"Spiritual","ko":"영적","ru":"Духовное","th":"จิตวิญญาณ","zh":"灵性","id":"Spiritual","ms":"Spiritual","lo":"ທາງຈິດວິນຍານ","es":"Espiritual","fr":"Spirituel","de":"Spirituell"}));
  allTranslations.push(...createTranslation('detail', 'kicker.waterfall', {"vi":"Thác nước · Khu vực","en":"Waterfall · Area","ko":"폭포 · 지역","ru":"Водопад · Район","th":"น้ำตก · พื้นที่","zh":"瀑布 · 区域","id":"Air Terjun · Wilayah","ms":"Air Terjun · Kawasan","lo":"ນ້ຳຕົກ · ພື້ນທີ່","es":"Cascada · Zona","fr":"Cascade · Zone","de":"Wasserfall · Gebiet"}));
  allTranslations.push(...createTranslation('detail', 'kicker.cave', {"vi":"Hang động · Khu vực","en":"Cave · Area","ko":"동굴 · 지역","ru":"Пещера · Район","th":"ถ้ำ · พื้นที่","zh":"洞穴 · 区域","id":"Gua · Wilayah","ms":"Gua · Kawasan","lo":"ຖ້ຳ · ພື້ນທີ່","es":"Cueva · Zona","fr":"Grotte · Zone","de":"Höhle · Gebiet"}));
  allTranslations.push(...createTranslation('detail', 'kicker.historical', {"vi":"Di tích lịch sử · Khu vực","en":"Historical site · Area","ko":"역사 유적 · 지역","ru":"Историческое место · Район","th":"แหล่งประวัติศาสตร์ · พื้นที่","zh":"历史遗迹 · 区域","id":"Situs Sejarah · Wilayah","ms":"Tapak Sejarah · Kawasan","lo":"ສະຖານທີ່ທາງປະຫວັດສາດ · ພື້ນທີ່","es":"Sitio Histórico · Zona","fr":"Site Historique · Zone","de":"Historische Stätte · Gebiet"}));
  allTranslations.push(...createTranslation('detail', 'kicker.spiritual', {"vi":"Tâm linh · Khu vực","en":"Spiritual · Area","ko":"영적 · 지역","ru":"Духовное · Район","th":"จิตวิญญาณ · พื้นที่","zh":"灵性 · 区域","id":"Spiritual · Wilayah","ms":"Spiritual · Kawasan","lo":"ທາງຈິດວິນຍານ · ພື້ນທີ່","es":"Espiritual · Zona","fr":"Spirituel · Zone","de":"Spirituell · Gebiet"}));
  allTranslations.push(...createTranslation('detail', 'region', {"vi":"Khu vực","en":"Area","ko":"지역","ru":"Район","th":"พื้นที่","zh":"区域","id":"Wilayah","ms":"Kawasan","lo":"ພື້ນທີ່","es":"Zona","fr":"Zone","de":"Gebiet"}));
  allTranslations.push(...createTranslation('detail', 'gallery.main', {"vi":"Ảnh chính — sẽ cập nhật","en":"Main photo — to be updated","ko":"메인 사진 — 업데이트 예정","ru":"Главное фото — будет обновлено","th":"ภาพหลัก — จะอัปเดต","zh":"主图——待更新","id":"Foto utama — akan diperbarui","ms":"Foto utama — akan dikemas kini","lo":"ພາບຫຼັກ — ຈະອັບເດດ","es":"Foto principal — por actualizar","fr":"Photo principale — à mettre à jour","de":"Hauptfoto — wird aktualisiert"}));
  allTranslations.push(...createTranslation('detail', 'd1.name', {"vi":"Thác Nàng Tiên","en":"Nàng Tiên Waterfall","ko":"낭띠엔 폭포","ru":"Водопад Нанг Тьен","th":"น้ำตกนางเทียน","zh":"仙女瀑布","id":"Air Terjun Nang Tien","ms":"Air Terjun Nang Tien","lo":"ນ້ຳຕົກນາງເທິນ","es":"Cascada Nang Tien","fr":"Cascade Nang Tien","de":"Nàng-Tiên-Wasserfall"}));
  allTranslations.push(...createTranslation('detail', 'd1.desc', {"vi":"Thác Nàng Tiên là một trong những thắng cảnh thiên nhiên nổi bật nhất của xã Tô Múa. Thác nước hùng vĩ nằm giữa đại ngàn Tây Bắc, nơi dòng nước trắng xóa đổ từ đỉnh cao xuống những bậc đá rêu phong, tạo nên khung cảnh thơ mộng và kỳ vĩ.","en":"Nàng Tiên Waterfall is one of the most outstanding natural scenic spots in Tô Múa commune. The majestic waterfall lies amid the Northwest mountains, where white water cascades from high above onto mossy stone steps, creating a poetic and magnificent landscape.","ko":"낭띠엔 폭포는 또무아 면에서 가장 뛰어난 자연 경관 중 하나입니다. 웅장한 폭포는 서북부 산속에 자리하며, 하얀 물이 높은 곳에서 이끼 낀 돌 계단으로 쏟아져 내려 시적이고 장관인 풍경을 만듭니다.","ru":"Водопад Нанг Тьен — одна из самых выдающихся природных достопримечательностей коммуны То Муа. Величественный водопад расположен среди гор Северо-Запада, где белая вода низвергается с высоты на мшистые каменные ступени.","th":"น้ำตกนางเทียนเป็นหนึ่งในแหล่งท่องเที่ยวทางธรรมชาติที่โดดเด่นที่สุดของตำบลโตมัว น้ำตกอันยิ่งใหญ่ตั้งอยู่ท่ามกลางขุนเขาตะวันตกเฉียงเหนือ ที่ซึ่งน้ำสีขาวไหลลงมาจากที่สูงลงสู่ขั้นหินที่ปกคลุมด้วยมอส","zh":"仙女瀑布是托木阿社最著名的自然景观之一。壮丽的瀑布坐落在西北山脉之中，白水从高处倾泻而下，流过长满苔藓的石阶，形成如诗如画的壮丽景色。","id":"Air Terjun Nang Tien adalah salah satu pemandangan alam paling menonjol di komune To Mua. Air terjun megah terletak di pegunungan Barat Laut, di mana air putih mengalir dari ketinggian ke undakan batu berlumut.","ms":"Air Terjun Nang Tien adalah salah satu pemandangan alam paling menonjol di komun To Mua. Air terjun megah terletak di pergunungan Barat Laut, di mana air putih mengalir dari ketinggian ke undakan batu berlumut.","lo":"ນ້ຳຕົກນາງເທິນເປັນໜຶ່ງໃນທິວທັດທຳມະຊາດທີ່ໂດດເດັ່ນທີ່ສຸດຂອງບ້ານໂຕມົວ. ນ້ຳຕົກທີ່ຍິ່ງໃຫຍ່ຕັ້ງຢູ່ທ່າມກາງພູເຂົາຕາເວັນຕົກສ່ຽງເໜືອ, ນ້ຳສີຂາວໄຫຼຈາກທີ່ສູງລົງສູ່ຂັ້ນຫີນທີ່ເປັນມໍ.","es":"La Cascada Nang Tien es uno de los paisajes naturales más destacados de la comuna To Mua. La majestuosa cascada se encuentra entre las montañas del Noroeste, donde el agua blanca cae desde lo alto sobre escalones de piedra cubiertos de musgo.","fr":"La Cascade Nang Tien est l'un des paysages naturels les plus remarquables de la commune To Mua. La cascade majestueuse se trouve au milieu des montagnes du Nord-Ouest, où l'eau blanche se déverse depuis les hauteurs sur des marches de pierre moussues.","de":"Der Nàng-Tiên-Wasserfall ist eine der herausragendsten Naturlandschaften der Gemeinde To Mua. Der majestätische Wasserfall liegt inmitten der Berge des Nordwestens, wo weißes Wasser von oben auf moosbewachsene Steinstufen stürzt."}));
  allTranslations.push(...createTranslation('detail', 'd1.quote', {"vi":"Tương truyền rằng xưa kia có một nàng tiên giáng trần, tắm mát tại dòng suối này và để lại vẻ đẹp thiên nhiên tuyệt mỹ cho vùng đất này.","en":"Legend has it that a fairy once descended to earth, bathed in this stream, and left behind the most exquisite natural beauty for this land.","ko":"옛날 선녀가 하강하여 이 시냇물에서 목욕하고 이 땅에 아름다운 자연을 남겼다고 전해집니다.","ru":"Легенда гласит, что когда-то небесная фея спустилась на землю, искупалась в этом ручье и оставила этой земле непревзойдённую природную красоту.","th":"เล่าว่าครั้งหนึ่งนางฟ้าได้ลงมาจากฟ้า มาอาบน้ำที่ลำธารนี้ และทิ้งความงามทางธรรมชาติไว้ให้แผ่นดินนี้","zh":"传说一位仙女下凡，在此溪流中沐浴，为这片土地留下了绝美的自然风光。","id":"Legenda menyebutkan bahwa seorang bidadari pernah turun ke bumi, mandi di sungai ini dan meninggalkan keindahan alam terindah untuk tanah ini.","ms":"Legenda mengatakan seorang bidadari pernah turun ke bumi, mandi di sungai ini dan meninggalkan keindahan alam terindah untuk tanah ini.","lo":"ນິທານເລົ່າວ່າ ນາງຟ້າໄດ້ລົງມາຈາກສະຫວັນ, ອາບນ້ຳທີ່ລ້ອງນ້ຳນີ້ ແລະ ທິ້ງຄວາມງາມທຳມະຊາດທີ່ສວຍງາມທີ່ສຸດໄວ້ໃຫ້ແກ່ດິນແດນນີ້.","es":"La leyenda cuenta que una hada descendió del cielo, se bañó en este arroyo y dejó la belleza natural más exquisita para esta tierra.","fr":"La légende raconte qu'une fée descendit du ciel, se baigna dans ce ruisseau et laissa la plus belle beauté naturelle à cette terre.","de":"Die Legende erzählt, dass eine Fee vom Himmel herabstieg, in diesem Bach badete und die schönste Naturschönheit für dieses Land hinterließ."}));
  allTranslations.push(...createTranslation('detail', 'd1.stats', {"vi":"Chiều cao,~30 m|Độ khó,Trung bình|Đi bộ,~30 phút|Mùa đẹp nhất,Tháng 5–10","en":"Height,~30 m|Difficulty,Medium|Walking,~30 min|Best season,May–Oct","ko":"높이,~30m|난이도,보통|도보,~30분|최적 시기,5월~10월","ru":"Высота,~30 м|Сложность,Средняя|Пешком,~30 мин|Лучший сезон,Май–Окт","th":"ความสูง,~30 ม.|ความยาก,ปานกลาง|เดิน,~30 น.|ฤดูกาลที่ดีที่สุด,พ.ค.–ต.ค.","zh":"高度,~30米|难度,中等|步行,~30分钟|最佳季节,5月–10月","id":"Ketinggian,~30 m|Kesulitan,Sedang|Berjalan,~30 mnt|Musim terbaik,Mei–Okt","ms":"Ketinggian,~30 m|Kesukaran,Sederhana|Berjalan,~30 min|Musim terbaik,Mei–Okt","lo":"ຄວາມສູງ,~30 ມ|ຄວາມຍາກ,ປານກາງ|ຍ່າງ,~30 ນາທີ|ລະດູທີ່ດີທີ່ສຸດ,ພ.ຄ.–ຕ.ຄ.","es":"Altura,~30 m|Dificultad,Moderada|Caminata,~30 min|Mejor temporada,May–Oct","fr":"Hauteur,~30 m|Difficulté,Moyenne|Marche,~30 min|Meilleure saison,Mai–Oct","de":"Höhe,~30 m|Schwierigkeit,Mittel|Wandern,~30 Min|Beste Jahreszeit,Mai–Okt"}));
  allTranslations.push(...createTranslation('detail', 'd1.info', {"vi":"Chiều cao,~30 mét|Địa hình,Nhiều tầng, bậc thang tự nhiên|Thảm thực vật,Rừng nguyên sinh, rêu phong, dương xỉ|Thời điểm đẹp nhất,Tháng 5 — Tháng 10 (mùa mưa)|Độ khó tiếp cận,Trung bình — đi bộ ~30 phút","en":"Height,~30 meters|Terrain,Multi-tiered natural staircase|Vegetation,Primary forest, moss, ferns|Best time,May — October (rainy season)|Access difficulty,Medium — ~30 min walk","ko":"높이,~30미터|지형,다층 자연 계단|식생,원시림·이끼·양치류|최적 시기,5월~10월(우기)|접근 난이도,보통 — 도보 ~30분","ru":"Высота,~30 метров|Рельеф,Многоуровневая лестница|Растительность,Первобытный лес, мох, папоротники|Лучшее время,Май — Октябрь (сезон дождей)|Сложность,Средняя — ~30 мин пешком","th":"ความสูง,~30 เมตร|ภูมิประเทศ,ขั้นบันไดธรรมชาติหลายชั้น|พืชพรรณ,ป่าดิบ มอส เฟิร์น|เวลาที่ดีที่สุด,พฤษภาคม — ตุลาคม (ฤดูฝน)|ความยากในการเข้าถึง,ปานกลาง — เดิน ~30 นาที","zh":"高度,~30米|地形,多层天然阶梯|植被,原始森林、苔藓、蕨类|最佳时间,5月—10月（雨季）|进入难度,中等——步行约30分钟","id":"Ketinggian,~30 meter|Medan,Tangga alam bertingkat|Vegetasi,Hutan primer, lumut, pakis|Waktu terbaik,Mei — Oktober (musim hujan)|Kesulitan akses,Sedang — jalan ~30 menit","ms":"Ketinggian,~30 meter|Medan,Tangga alam berperingkat|Vegetasi,Hutan primer, lumut, pakis|Masa terbaik,Mei — Oktober (musim hujan)|Kesukaran akses,Sederhana — berjalan ~30 minit","lo":"ຄວາມສູງ,~30 ແມັດ|ພູມິປະເທດ,ຂັ້ນບັນໄດທຳມະຊາດຫຼາຍຊັ້ນ|ພືດພັນ,ປ່າດົງ, ມໍ, ເຟີນ|ເວລາທີ່ດີທີ່ສຸດ,ພຶດສະພາ — ຕຸລາ (ລະດູຝົນ)|ຄວາມຍາກໃນການເຂົ້າເຖິງ,ປານກາງ — ຍ່າງ ~30 ນາທີ","es":"Altura,~30 metros|Terreno,Escalera natural multinivel|Vegetación,Bosque primario, musgo, helechos|Mejor época,Mayo — Octubre (temporada de lluvias)|Dificultad de acceso,Moderada — caminata ~30 min","fr":"Hauteur,~30 mètres|Terrain,Escalier naturel à plusieurs niveaux|Végétation,Forêt primaire, mousses, fougères|Meilleure époque,Mai — Octobre (saison des pluies)|Difficulté d'accès,Moyenne — marche ~30 min","de":"Höhe,~30 Meter|Gelände,Mehrstufige Naturtreppe|Vegetation,Urwald, Moos, Farne|Beste Zeit,Mai — Oktober (Regenzeit)|Zugangsschwierigkeit,Mittel — ~30 Min Wanderung"}));
  allTranslations.push(...createTranslation('detail', 'd2.name', {"vi":"Thác 7 Tầng","en":"7-Tier Waterfall","ko":"7단 폭포","ru":"7-уровневый водопад","th":"น้ำตก 7 ชั้น","zh":"七层瀑布","id":"Air Terjun 7 Tingkat","ms":"Air Terjun 7 Tingkat","lo":"ນ້ຳຕົກ 7 ຊັ້ນ","es":"Cascada de 7 Niveles","fr":"Cascade à 7 Niveaux","de":"7-Stufen-Wasserfall"}));
  allTranslations.push(...createTranslation('detail', 'd2.desc', {"vi":"Thác 7 Tầng là thắng cảnh thiên nhiên độc đáo với 7 tầng thác nước nối tiếp nhau, mỗi tầng mang một vẻ đẹp riêng biệt. Từ tầng trên cùng với dòng nước mạnh mẽ đổ xuống, đến tầng dưới với làn nước nhẹ nhàng len lỏi qua những tảng đá rêu phong.","en":"7-Tier Waterfall is a unique natural attraction with 7 cascading levels, each offering its own distinct beauty. From the top tier with powerful water rushing down, to the lower tiers where gentle water flows through mossy rocks.","ko":"7단 폭포는 7개의 연속된 폭포가 있는 독특한 자연 명소로, 각 층마다 고유한 아름다움을 가지고 있습니다.","ru":"7-уровневый водопад — уникальная природная достопримечательность с 7 каскадными уровнями, каждый из которых обладает своей неповторимой красотой.","th":"น้ำตก 7 ชั้นเป็นแหล่งท่องเที่ยวทางธรรมชาติที่เป็นเอกลักษณ์ มี 7 ระดับลดหลั่นกัน แต่ละชั้นมีความงามเฉพาะตัว","zh":"七层瀑布是一处独特的自然景观，有7层连续的瀑布，每一层都有其独特的美丽。","id":"Air Terjun 7 Tingkat adalah objek wisata alam unik dengan 7 tingkat berurutan, masing-masing menawarkan keindahan tersendiri.","ms":"Air Terjun 7 Tingkat adalah tarikan alam unik dengan 7 tingkat berturutan, setiap satu menawarkan keindahan tersendiri.","lo":"ນ້ຳຕົກ 7 ຊັ້ນເປັນສະຖານທີ່ທ່ອງທ່ຽວທຳມະຊາດທີ່ເປັນເອກະລັກ ມີ 7 ຊັ້ນຕິດຕໍ່ກັນ, ແຕ່ລະຊັ້ນມີຄວາມງາມຂອງຕົນເອງ.","es":"La Cascada de 7 Niveles es una atracción natural única con 7 niveles escalonados, cada uno con su propia belleza.","fr":"La Cascade à 7 Niveaux est une attraction naturelle unique avec 7 niveaux en cascade, chacun offrant sa propre beauté.","de":"Der 7-Stufen-Wasserfall ist eine einzigartige Naturattraktion mit 7 Kaskadenstufen, jede mit eigener Schönheit."}));
  allTranslations.push(...createTranslation('detail', 'd2.quote', {"vi":"Bảy tầng nước chảy như bảy nốt nhạc của đại ngàn, tạo nên bản giao hưởng thiên nhiên giữa núi rừng Tây Bắc.","en":"Seven tiers of water flowing like seven notes of the wilderness, creating a natural symphony amid the Northwest mountains.","ko":"7단 물줄기는 대자연의 7개 음표처럼 흘러 서북부 산림 속 자연 교향곡을 만듭니다.","ru":"Семь уровней воды, как семь нот дикой природы, создают симфонию среди гор Северо-Запада.","th":"เจ็ดชั้นน้ำไหลเหมือนเจ็ดโน้ตของป่าใหญ่ สร้างซิมโฟนีธรรมชาติกลางขุนเขาตะวันตกเฉียงเหนือ","zh":"七层流水如七个音符，在西北山林间奏响自然交响曲。","id":"Tujuh tingkat air mengalir seperti tujuh nada hutan belantara, menciptakan simfoni alam di pegunungan Barat Laut.","ms":"Tujuh tingkat air mengalir seperti tujuh nota hutan belantara, mencipta simfoni alam di pergunungan Barat Laut.","lo":"ເຈັດຊັ້ນນ້ຳໄຫຼຄືເຈັດບັນທຽນຂອງປ່າໃຫຍ່, ສ້າງຊິມໂຟນີທຳມະຊາດທ່າມກາງພູເຂົາຕາເວັນຕົກສ່ຽງເໜືອ.","es":"Siete niveles de agua fluyendo como siete notas de la selva, creando una sinfonía natural entre las montañas del Noroeste.","fr":"Sept niveaux d'eau coulant comme sept notes de la forêt, créant une symphonie naturelle au milieu des montagnes du Nord-Ouest.","de":"Sieben Stufen fließenden Wassers wie sieben Noten der Wildnis, die eine natürliche Symphonie in den Bergen des Nordwestens schaffen."}));
  allTranslations.push(...createTranslation('detail', 'd2.stats', {"vi":"Số tầng thác,7 tầng|Độ khó,Trung bình|Đi bộ,~45 phút|Mùa đẹp nhất,Tháng 6–9","en":"Tiers,7 levels|Difficulty,Medium|Walking,~45 min|Best season,Jun–Sep","ko":"단수,7단|난이도,보통|도보,~45분|최적 시기,6월~9월","ru":"Уровни,7|Сложность,Средняя|Пешком,~45 мин|Лучший сезон,Июн–Сен","th":"ชั้น,7 ชั้น|ความยาก,ปานกลาง|เดิน,~45 น.|ฤดูกาลที่ดีที่สุด,มิ.ย.–ก.ย.","zh":"层数,7层|难度,中等|步行,~45分钟|最佳季节,6月–9月","id":"Tingkat,7|Kesulitan,Sedang|Berjalan,~45 mnt|Musim terbaik,Jun–Sep","ms":"Tingkat,7|Kesukaran,Sederhana|Berjalan,~45 min|Musim terbaik,Jun–Sep","lo":"ຊັ້ນ,7|ຄວາມຍາກ,ປານກາງ|ຍ່າງ,~45 ນາທີ|ລະດູທີ່ດີທີ່ສຸດ,ມິ.ຄ.–ກ.ຄ.","es":"Niveles,7|Dificultad,Moderada|Caminata,~45 min|Mejor temporada,Jun–Sep","fr":"Niveaux,7|Difficulté,Moyenne|Marche,~45 min|Meilleure saison,Jun–Sep","de":"Stufen,7|Schwierigkeit,Mittel|Wandern,~45 Min|Beste Jahreszeit,Jun–Sep"}));
  allTranslations.push(...createTranslation('detail', 'd2.info', {"vi":"Số tầng,7 tầng thác nước|Địa hình,Bậc thang đá tự nhiên|Thảm thực vật,Rừng nguyên sinh, tre nứa|Thời điểm đẹp nhất,Tháng 6 — Tháng 9|Độ khó tiếp cận,Trung bình — đi bộ ~45 phút","en":"Tiers,7 waterfall levels|Terrain,Natural stone staircase|Vegetation,Primary forest, bamboo|Best time,June — September|Access difficulty,Medium — ~45 min walk","ko":"단수,7단 폭포|지형,자연석 계단|식생,원시림·대나무|최적 시기,6월~9월|접근 난이도,보통 — 도보 ~45분","ru":"Уровни,7 каскадов|Рельеф,Каменная лестница|Растительность,Первобытный лес, бамбук|Лучшее время,Июнь — Сентябрь|Сложность,Средняя — ~45 мин пешком","th":"ชั้น,7 ชั้นน้ำตก|ภูมิประเทศ,บันไดหินธรรมชาติ|พืชพรรณ,ป่าดิบ ไผ่|เวลาที่ดีที่สุด,มิถุนายน — กันยายน|ความยากในการเข้าถึง,ปานกลาง — เดิน ~45 นาที","zh":"层数,7层瀑布|地形,天然石阶|植被,原始森林、竹林|最佳时间,6月—9月|进入难度,中等——步行约45分钟","id":"Tingkat,7 tingkat air terjun|Medan,Tangga batu alami|Vegetasi,Hutan primer, bambu|Waktu terbaik,Juni — September|Kesulitan akses,Sedang — jalan ~45 menit","ms":"Tingkat,7 peringkat air terjun|Medan,Tangga batu semula jadi|Vegetasi,Hutan primer, buluh|Masa terbaik,Jun — September|Kesukaran akses,Sederhana — berjalan ~45 minit","lo":"ຊັ້ນ,7 ຊັ້ນນ້ຳຕົກ|ພູມິປະເທດ,ຂັ້ນຫີນທຳມະຊາດ|ພືດພັນ,ປ່າດົງ, ໄມ້ໄຜ່|ເວລາທີ່ດີທີ່ສຸດ,ມິຖຸນາ — ກັນຍາ|ຄວາມຍາກໃນການເຂົ້າເຖິງ,ປານກາງ — ຍ່າງ ~45 ນາທີ","es":"Niveles,7 niveles de cascada|Terreno,Escalera de piedra natural|Vegetación,Bosque primario, bambú|Mejor época,Junio — Septiembre|Dificultad de acceso,Moderada — caminata ~45 min","fr":"Niveaux,7 niveaux de cascade|Terrain,Escalier de pierre naturel|Végétation,Forêt primaire, bambou|Meilleure époque,Juin — Septembre|Difficulté d'accès,Moyenne — marche ~45 min","de":"Stufen,7 Wasserfallstufen|Gelände,Natürliche Steintreppe|Vegetation,Urwald, Bambus|Beste Zeit,Juni — September|Zugangsschwierigkeit,Mittel — ~45 Min Wanderung"}));
  allTranslations.push(...createTranslation('detail', 'd3.name', {"vi":"Thác Tạt Cạng","en":"Tạt Cạng Waterfall","ko":"딱짱 폭포","ru":"Водопад Тат Канг","th":"น้ำตกตาดแคง","zh":"塔坎瀑布","id":"Air Terjun Tat Kang","ms":"Air Terjun Tat Kang","lo":"ນ້ຳຕົກຕາດແຄ້ງ","es":"Cascada Tat Kang","fr":"Cascade Tat Kang","de":"Tạt-Cạng-Wasserfall"}));
  allTranslations.push(...createTranslation('detail', 'd3.desc', {"vi":"Thác Tạt Cạng nằm sâu trong vùng rừng nguyên sinh của xã Tô Múa, là điểm đến yêu thích của những du khách ưa khám phá và mạo hiểm. Con đường dẫn đến thác đi qua những tán cổ thụ rợp bóng.","en":"Tạt Cạng Waterfall lies deep within the primary forest of Tô Múa, a favorite destination for adventurous travelers. The path to the waterfall passes through ancient towering trees.","ko":"딱짱 폭포는 옛 치엥코아 면의 원시림 깊숙이 자리하며, 모험을 좋아하는 여행자들의 명소입니다.","ru":"Водопад Тат Канг расположен глубоко в первобытном лесу бывшей коммуны Тьенг Кхоа — любимое место любителей приключений.","th":"น้ำตกตาดแคงตั้งอยู่ลึกในป่าดิบของตำบลเจืองโคยเดิม เป็นจุดหมายที่นักเดินทางผจญภัยชื่นชอบ","zh":"塔坎瀑布位于原琼科社的原始森林深处，是探险旅行者喜爱的目的地。","id":"Air Terjun Tat Kang terletak jauh di dalam hutan primer komune Tô Múa, destinasi favorit wisatawan petualang.","ms":"Air Terjun Tat Kang terletak jauh di dalam hutan primer komun Tô Múa, destinasi kegemaran pengembara.","lo":"ນ້ຳຕົກຕາດແຄ້ງຕັ້ງຢູ່ເລິກໃນປ່າດົງຂອງບ້ານຊຽງຂ່າເກົ່າ, ເປັນສະຖານທີ່ທີ່ນັກທ່ອງທ່ຽວມັກ.","es":"La Cascada Tat Kang se encuentra en lo profundo del bosque primario de la comuna Tô Múa, destino favorito de viajeros aventureros.","fr":"La Cascade Tat Kang se trouve au cœur de la forêt primaire de la commune Tô Múa, destination favorite des voyageurs aventureux.","de":"Der Tạt-Cạng-Wasserfall liegt tief im Urwald der Gemeinde Tô Múa — ein Lieblingsziel abenteuerlustiger Reisender."}));
  allTranslations.push(...createTranslation('detail', 'd3.quote', {"vi":"Tiếng chim hót và tiếng nước chảy rì rào — một trải nghiệm thiên nhiên thuần khiết giữa đại ngàn.","en":"Birdsong and the gentle sound of flowing water — a pure nature experience amid the wilderness.","ko":"새소리와 물소리 — 대자연 속 순수한 자연 체험.","ru":"Пение птиц и мягкий шум воды — чистый опыт природы среди дикой местности.","th":"เสียงนกร้องและเสียงน้ำไหล — ประสบการณ์ธรรมชาติบริสุทธิ์กลางป่าใหญ่","zh":"鸟鸣与流水声——大荒野中的纯粹自然体验。","id":"Kicauan burung dan suara air mengalir — pengalaman alam murni di tengah hutan belantara.","ms":"Kicauan burung dan bunyi air mengalir — pengalaman alam tulen di tengah hutan belantara.","lo":"ສຽງນົກຮ້ອງ ແລະ ສຽງນ້ຳໄຫຼ — ປະສົບການທຳມະຊາດທີ່ບໍລິສຸດທ່າມກາງປ່າໃຫຍ່.","es":"Canto de pájaros y el suave sonido del agua fluyendo — una experiencia de naturaleza pura en medio de la selva.","fr":"Le chant des oiseaux et le doux bruit de l'eau — une expérience de nature pure au cœur de la forêt.","de":"Vogelgezwitscher und das sanfte Rauschen des Wassers — ein reines Naturerlebnis mitten in der Wildnis."}));
  allTranslations.push(...createTranslation('detail', 'd3.stats', {"vi":"Chiều cao,~25 m|Độ khó,Khá khó|Đi bộ,~60 phút|Mùa đẹp nhất,Tháng 5–10","en":"Height,~25 m|Difficulty,Hard|Walking,~60 min|Best season,May–Oct","ko":"높이,~25m|난이도,어려움|도보,~60분|최적 시기,5월~10월","ru":"Высота,~25 м|Сложность,Сложная|Пешком,~60 мин|Лучший сезон,Май–Окт","th":"ความสูง,~25 ม.|ความยาก,ค่อนข้างยาก|เดิน,~60 น.|ฤดูกาลที่ดีที่สุด,พ.ค.–ต.ค.","zh":"高度,~25米|难度,较难|步行,~60分钟|最佳季节,5月–10月","id":"Ketinggian,~25 m|Kesulitan,Sulit|Berjalan,~60 mnt|Musim terbaik,Mei–Okt","ms":"Ketinggian,~25 m|Kesukaran,Sukar|Berjalan,~60 min|Musim terbaik,Mei–Okt","lo":"ຄວາມສູງ,~25 ມ|ຄວາມຍາກ,ຍາກພໍສົມຄວນ|ຍ່າງ,~60 ນາທີ|ລະດູທີ່ດີທີ່ສຸດ,ພ.ຄ.–ຕ.ຄ.","es":"Altura,~25 m|Dificultad,Difícil|Caminata,~60 min|Mejor temporada,May–Oct","fr":"Hauteur,~25 m|Difficulté,Difficile|Marche,~60 min|Meilleure saison,Mai–Oct","de":"Höhe,~25 m|Schwierigkeit,Schwer|Wandern,~60 Min|Beste Jahreszeit,Mai–Okt"}));
  allTranslations.push(...createTranslation('detail', 'd3.info', {"vi":"Chiều cao,~25 mét|Địa hình,Dốc, nhiều đá|Thảm thực vật,Rừng nguyên sinh, cổ thụ|Thời điểm đẹp nhất,Tháng 5 — Tháng 10|Độ khó tiếp cận,Khá khó — đi bộ ~60 phút","en":"Height,~25 meters|Terrain,Steep, rocky|Vegetation,Primary forest, ancient trees|Best time,May — October|Access difficulty,Hard — ~60 min walk","ko":"높이,~25미터|지형,가파르고 바위 많음|식생,원시림·고목|최적 시기,5월~10월|접근 난이도,어려움 — 도보 ~60분","ru":"Высота,~25 метров|Рельеф,Крутой, каменистый|Растительность,Первобытный лес, вековые деревья|Лучшее время,Май — Октябрь|Сложность,Сложная — ~60 мин пешком","th":"ความสูง,~25 เมตร|ภูมิประเทศ,ชัน มีหินมาก|พืชพรรณ,ป่าดิบ ต้นไม้โบราณ|เวลาที่ดีที่สุด,พฤษภาคม — ตุลาคม|ความยากในการเข้าถึง,ค่อนข้างยาก — เดิน ~60 นาที","zh":"高度,~25米|地形,陡峭、多石|植被,原始森林、古树|最佳时间,5月—10月|进入难度,较难——步行约60分钟","id":"Ketinggian,~25 meter|Medan,Curang, berbatu|Vegetasi,Hutan primer, pohon kuno|Waktu terbaik,Mei — Oktober|Kesulitan akses,Sulit — jalan ~60 menit","ms":"Ketinggian,~25 meter|Medan,Curam, berbatu|Vegetasi,Hutan primer, pokok purba|Masa terbaik,Mei — Oktober|Kesukaran akses,Sukar — berjalan ~60 minit","lo":"ຄວາມສູງ,~25 ແມັດ|ພູມິປະເທດ,ຊັນ, ມີຫີນຫຼາຍ|ພືດພັນ,ປ່າດົງ, ໄມ້ໃຫຍ່ບູຮານ|ເວລາທີ່ດີທີ່ສຸດ,ພຶດສະພາ — ຕຸລາ|ຄວາມຍາກໃນການເຂົ້າເຖິງ,ຍາກພໍສົມຄວນ — ຍ່າງ ~60 ນາທີ","es":"Altura,~25 metros|Terreno,Empinado, rocoso|Vegetación,Bosque primario, árboles antiguos|Mejor época,Mayo — Octubre|Dificultad de acceso,Difícil — caminata ~60 min","fr":"Hauteur,~25 mètres|Terrain,Escarpé, rocheux|Végétation,Forêt primaire, arbres anciens|Meilleure époque,Mai — Octobre|Difficulté d'accès,Difficile — marche ~60 min","de":"Höhe,~25 Meter|Gelände,Steil, felsig|Vegetation,Urwald, alte Bäume|Beste Zeit,Mai — Oktober|Zugangsschwierigkeit,Schwer — ~60 Min Wanderung"}));
  allTranslations.push(...createTranslation('detail', 'd4.name', {"vi":"Hang động Mường Khoa","en":"Mường Khoa Cave","ko":"므엉코아 동굴","ru":"Пещера Мыонг Кхоа","th":"ถ้ำเมืองโคย","zh":"芒科洞穴","id":"Gua Muong Khoa","ms":"Gua Muong Khoa","lo":"ຖ້ຳເມືອງຂ່າ","es":"Cueva Muong Khoa","fr":"Grotte Muong Khoa","de":"Mường-Khoa-Höhle"}));
  allTranslations.push(...createTranslation('detail', 'd4.desc', {"vi":"Hang động Mường Khoa là hệ thống hang đá vôi kỳ vĩ với những nhũ đá tự nhiên hình thù đa dạng, được kiến tạo qua hàng triệu năm. Bên trong hang, ánh đèn phản chiếu trên nhũ đá tạo nên khung cảnh lung linh huyền ảo.","en":"Mường Khoa Cave is a magnificent limestone cave system with diverse natural stalactites formed over millions of years. Inside, light reflecting off the stalactites creates a shimmering, mystical landscape.","ko":"므엉코아 동굴은 수백만 년에 걸쳐 형성된 다양한 형태의 종유석이 있는 웅장한 석회 동굴 시스템입니다.","ru":"Пещера Мыонг Кхоа — величественная система известняковых пещер с разнообразными сталактитами, формировавшимися миллионы лет.","th":"ถ้ำเมืองโคยเป็นระบบถ้ำหินปูนอันตระการตาพร้อมหินงอกหินยามตามธรรมชาติที่ก่อตัวมานับล้านปี","zh":"芒科洞穴是一个壮观的石灰岩洞穴系统，拥有数百万年形成的形态各异的天然钟乳石。","id":"Gua Muong Khoa adalah sistem gua batu kapur megah dengan stalaktit alam beragam bentuk yang terbentuk selama jutaan tahun.","ms":"Gua Muong Khoa adalah sistem gua batu kapur megah dengan stalaktit semula jadi pelbagai bentuk yang terbentuk selama jutaan tahun.","lo":"ຖ້ຳເມືອງຂ່າເປັນລະບົບຖ້ຳຫີນປູນທີ່ສວຍງາມພ້ອມຫີນຍ້ອຍທຳມະຊາດຫຼາຍຮູບແບບທີ່ເກີດຂຶ້ນໃນໄລຍະລ້ານປີ.","es":"La Cueva Muong Khoa es un magnífico sistema de cuevas de piedra caliza con diversas estalactitas naturales formadas durante millones de años.","fr":"La Grotte Muong Khoa est un magnifique système de grottes calcaires avec des stalactites naturelles de formes diverses formées sur des millions d'années.","de":"Die Mường-Khoa-Höhle ist ein großartiges Kalksteinhöhlensystem mit vielfältigen natürlichen Tropfsteinen, die über Millionen Jahre entstanden sind."}));
  allTranslations.push(...createTranslation('detail', 'd4.quote', {"vi":"Đây cũng là nơi lưu giữ nhiều dấu tích văn hóa cổ xưa của người Mường.","en":"This is also a place preserving many traces of ancient Mường culture.","ko":"이곳은 또한 고대 므엉 문화의 흔적을 간직한 곳입니다.","ru":"Это также место, хранящее следы древней культуры мыонг.","th":"ที่นี่ยังเป็นสถานที่เก็บร่องรอยวัฒนธรรมเมืองโบราณ","zh":"这里也是保存古老芒族文化痕迹的地方。","id":"Ini juga tempat menyimpan jejak budaya Muong kuno.","ms":"Ini juga tempat menyimpan jejak budaya Muong kuno.","lo":"ນີ້ກໍ່ເປັນສະຖານທີ່ເກັບຮັກສາຮ່ອງຮອຍວັດທະນະທຳເມືອງບູຮານ.","es":"Este es también un lugar que preserva muchos vestigios de la antigua cultura Muong.","fr":"C'est aussi un lieu préservant de nombreux vestiges de l'ancienne culture Muong.","de":"Dies ist auch ein Ort, der viele Spuren der alten Mường-Kultur bewahrt."}));
  allTranslations.push(...createTranslation('detail', 'd4.stats', {"vi":"Chiều dài,~500 m|Độ khó,Dễ|Đi bộ,~15 phút|Thời điểm,Quanh năm","en":"Length,~500 m|Difficulty,Easy|Walking,~15 min|Best time,Year-round","ko":"길이,~500m|난이도,쉬움|도보,~15분|최적 시기,연중","ru":"Длина,~500 м|Сложность,Лёгкая|Пешком,~15 мин|Лучшее время,Круглый год","th":"ความยาว,~500 ม.|ความยาก,ง่าย|เดิน,~15 น.|เวลาที่ดีที่สุด,ตลอดปี","zh":"长度,~500米|难度,容易|步行,~15分钟|最佳时间,全年","id":"Panjang,~500 m|Kesulitan,Mudah|Berjalan,~15 mnt|Waktu terbaik,Sepanjang tahun","ms":"Panjang,~500 m|Kesukaran,Mudah|Berjalan,~15 min|Masa terbaik,Sepanjang tahun","lo":"ຄວາມຍາວ,~500 ມ|ຄວາມຍາກ,ງ່າຍ|ຍ່າງ,~15 ນາທີ|ເວລາທີ່ດີທີ່ສຸດ,ຕະຫຼອດປີ","es":"Longitud,~500 m|Dificultad,Fácil|Caminata,~15 min|Mejor época,Todo el año","fr":"Longueur,~500 m|Difficulté,Facile|Marche,~15 min|Meilleure époque,Toute l'année","de":"Länge,~500 m|Schwierigkeit,Leicht|Wandern,~15 Min|Beste Zeit,Ganzjährig"}));
  allTranslations.push(...createTranslation('detail', 'd4.info', {"vi":"Chiều dài,~500 mét|Loại hình,Hang đá vôi|Đặc điểm,Nhũ đá tự nhiên, dấu tích văn hóa Mường|Thời điểm đẹp nhất,Quanh năm|Độ khó tiếp cận,Dễ — đi bộ ~15 phút","en":"Length,~500 meters|Type,Limestone cave|Features,Natural stalactites, Muong cultural traces|Best time,Year-round|Access difficulty,Easy — ~15 min walk","ko":"길이,~500미터|유형,석회 동굴|특징,천연 종유석·므엉 문화 흔적|최적 시기,연중|접근 난이도,쉬움 — 도보 ~15분","ru":"Длина,~500 метров|Тип,Известняковая пещера|Особенности,Природные сталактиты, следы культуры мыонг|Лучшее время,Круглый год|Сложность,Лёгкая — ~15 мин пешком","th":"ความยาว,~500 เมตร|ประเภท,ถ้ำหินปูน|ลักษณะ,หินงอกธรรมชาติ ร่องรอยวัฒนธรรมเมือง|เวลาที่ดีที่สุด,ตลอดปี|ความยากในการเข้าถึง,ง่าย — เดิน ~15 นาที","zh":"长度,~500米|类型,石灰岩洞|特征,天然钟乳石、芒族文化遗迹|最佳时间,全年|进入难度,容易——步行约15分钟","id":"Panjang,~500 meter|Tipe,Gua batu kapur|Fitur,Stalaktit alami, jejak budaya Muong|Waktu terbaik,Seputar tahun|Kesulitan akses,Mudah — jalan ~15 menit","ms":"Panjang,~500 meter|Jenis,Gua batu kapur|Ciri,Stalaktit semula jadi, jejak budaya Muong|Masa terbaik,Seputar tahun|Kesukaran akses,Mudah — berjalan ~15 minit","lo":"ຄວາມຍາວ,~500 ແມັດ|ປະເພດ,ຖ້ຳຫີນປູນ|ລັກສະນະ,ຫີນຍ້ອຍທຳມະຊາດ, ຮ່ອງຮອຍວັດທະນະທຳເມືອງ|ເວລາທີ່ດີທີ່ສຸດ,ຕະຫຼອດປີ|ຄວາມຍາກໃນການເຂົ້າເຖິງ,ງ່າຍ — ຍ່າງ ~15 ນາທີ","es":"Longitud,~500 metros|Tipo,Cueva de piedra caliza|Características,Estalactitas naturales, vestigios culturales Muong|Mejor época,Todo el año|Dificultad de acceso,Fácil — caminata ~15 min","fr":"Longueur,~500 mètres|Type,Grotte calcaire|Caractéristiques,Stalactites naturelles, vestiges culturels Muong|Meilleure époque,Toute l'année|Difficulté d'accès,Facile — marche ~15 min","de":"Länge,~500 Meter|Typ,Kalksteinhöhle|Merkmale,Natürliche Tropfsteine, Mường-Kulturspuren|Beste Zeit,Ganzjährig|Zugangsschwierigkeit,Leicht — ~15 Min Wanderung"}));
  allTranslations.push(...createTranslation('detail', 'd5.name', {"vi":"Hang mộ Tạng Mè","en":"Tạng Mè Burial Cave","ko":"탕메 매장 동굴","ru":"Погребальная пещера Танг Ме","th":"ถ้ำฝังศพต่างเม","zh":"潭梅墓穴","id":"Gua Makam Tange Me","ms":"Gua Perkuburan Tange Me","lo":"ຖ້ຳຝັງສົບຕ່າງເໝ","es":"Cueva Funeraria Tange Me","fr":"Grotte Funéraire Tange Me","de":"Tạng-Me-Grabhöhle"}));
  allTranslations.push(...createTranslation('detail', 'd5.desc', {"vi":"Hang mộ Tạng Mè là di tích lịch sử — khảo cổ quý giá, nơi phát hiện nhiều mộ táng cổ của người Tạng Mè từ hàng trăm năm trước. Các hiện vật tìm thấy giúp các nhà nghiên cứu hiểu rõ hơn về đời sống, phong tục và tín ngưỡng của người Thái cổ.","en":"Tạng Mè Burial Cave is a precious historical and archaeological site where ancient burials of the Tạng Mè people were discovered. Artifacts found help researchers better understand the lives, customs and beliefs of ancient Thai people.","ko":"탕메 매장 동굴은 수백 년 전 탕메족의 고대 매장지가 발견된 귀중한 역사·고고학 유적지입니다.","ru":"Погребальная пещера Танг Ме — ценный историко-археологический памятник, где были обнаружены древние захоронения народа Танг Ме.","th":"ถ้ำฝังศพต่างเมเป็นแหล่งโบราณคดีและประวัติศาสตร์อันล้ำค่า ที่ซึ่งค้นพบหลุมฝังศพโบราณของชาวต่างเม","zh":"潭梅墓穴是一处珍贵的历史考古遗址，发现了数百年前潭梅族的古代墓葬。","id":"Gua Makam Tange Me adalah situs arkeologi dan bersejarah berharga, tempat ditemukannya makam kuno suku Tange Me.","ms":"Gua Perkuburan Tange Me adalah tapak arkeologi dan bersejarah berharga, tempat penemuan perkuburan kuno suku Tange Me.","lo":"ຖ້ຳຝັງສົບຕ່າງເໝເປັນສະຖານທີ່ບູຮານຄະດີທີ່ລ້ຳຄ່າ, ບ່ອນທີ່ຄົ້ນພົບສຸສານບູຮານຂອງຊາວຕ່າງເໝ.","es":"La Cueva Funeraria Tange Me es un valioso sitio arqueológico e histórico donde se descubrieron antiguas sepulturas del pueblo Tange Me.","fr":"La Grotte Funéraire Tange Me est un site archéologique et historique précieux où ont été découvertes d'anciennes sépultures du peuple Tange Me.","de":"Die Tạng-Me-Grabhöhle ist eine wertvolle historische und archäologische Stätte, wo alte Grabstätten des Tạng-Me-Volkes entdeckt wurden."}));
  allTranslations.push(...createTranslation('detail', 'd5.quote', {"vi":"Một nhánh của dân tộc Thái — nơi ký ức hàng trăm năm vẫn còn lưu giữ trong lòng hang đá.","en":"A branch of the Thai people — where centuries of memories are still preserved within the cave.","ko":"타이족의 한 분파 — 수백 년의 기억이 동굴 속에 보존된 곳.","ru":"Ветвь народа тай — где память веков хранится в глубине пещеры.","th":"สาขาหนึ่งของชาวไทย — ที่ซึ่งความทรงจำหลายร้อยปียังคงเก็บรักษาไว้ในถ้ำ","zh":"泰族的一个分支——数百年记忆仍保存在洞穴之中。","id":"Cabang suku Thai — di mana ingatan berabad-abad masih tersimpan di dalam gua.","ms":"Cabang suku Thai — di mana ingatan berabad-abad masih tersimpan dalam gua.","lo":"ສາຂາໜຶ່ງຂອງຊາວໄທ — ບ່ອນທີ່ຄວາມຈຳຫຼາຍຮ້ອຍປີຍັງເກັບຮັກສາໄວ້ໃນຖ້ຳ.","es":"Una rama del pueblo tailandés — donde siglos de memoria aún se preservan dentro de la cueva.","fr":"Une branche du peuple thaï — où des siècles de mémoire sont encore préservés dans la grotte.","de":"Ein Zweig des Thai-Volkes — wo Jahrhunderte der Erinnerung noch in der Höhle bewahrt sind."}));
  allTranslations.push(...createTranslation('detail', 'd5.stats', {"vi":"Loại hình,Di tích|Độ khó,Trung bình|Đi bộ,~40 phút|Thời điểm,Quanh năm","en":"Type,Site|Difficulty,Medium|Walking,~40 min|Best time,Year-round","ko":"유형,유적|난이도,보통|도보,~40분|최적 시기,연중","ru":"Тип,Памятник|Сложность,Средняя|Пешком,~40 мин|Лучшее время,Круглый год","th":"ประเภท,โบราณสถาน|ความยาก,ปานกลาง|เดิน,~40 น.|เวลาที่ดีที่สุด,ตลอดปี","zh":"类型,遗址|难度,中等|步行,~40分钟|最佳时间,全年","id":"Tipe,Situs|Kesulitan,Sedang|Berjalan,~40 mnt|Waktu terbaik,Seputar tahun","ms":"Jenis,Tapak|Kesukaran,Sederhana|Berjalan,~40 min|Masa terbaik,Seputar tahun","lo":"ປະເພດ,ສະຖານທີ່|ຄວາມຍາກ,ປານກາງ|ຍ່າງ,~40 ນາທີ|ເວລາທີ່ດີທີ່ສຸດ,ຕະຫຼອດປີ","es":"Tipo,Sitio|Dificultad,Moderada|Caminata,~40 min|Mejor época,Todo el año","fr":"Type,Site|Difficulté,Moyenne|Marche,~40 min|Meilleure époque,Toute l'année","de":"Typ,Stätte|Schwierigkeit,Mittel|Wandern,~40 Min|Beste Zeit,Ganzjährig"}));
  allTranslations.push(...createTranslation('detail', 'd5.info', {"vi":"Loại hình,Di tích lịch sử — khảo cổ|Đặc điểm,Mộ táng cổ người Tạng Mè|Hiện vật,Các mộ táng, công cụ, đồ gốm|Thời điểm đẹp nhất,Quanh năm|Độ khó tiếp cận,Trung bình — đi bộ ~40 phút","en":"Type,Historical — archaeological site|Features,Ancient Tạng Mè burials|Artifacts,Burial sites, tools, pottery|Best time,Year-round|Access difficulty,Medium — ~40 min walk","ko":"유형,역사·고고학 유적|특징,탕메족 고대 매장지|유물,매장지·도자기·도구|최적 시기,연중|접근 난이도,보통 — 도보 ~40분","ru":"Тип,Историко-археологический памятник|Особенности,Древние захоронения Танг Ме|Артефакты,Захоронения, орудия, керамика|Лучшее время,Круглый год|Сложность,Средняя — ~40 мин пешком","th":"ประเภท,แหล่งประวัติศาสตร์และโบราณคดี|ลักษณะ,หลุมฝังศพโบราณชาวต่างเม|วัตถุ,หลุมฝังศพ เครื่องมือ เครื่องปั้นดินเผา|เวลาที่ดีที่สุด,ตลอดปี|ความยากในการเข้าถึง,ปานกลาง — เดิน ~40 นาที","zh":"类型,历史考古遗址|特征,潭梅族古代墓葬|文物,墓葬、工具、陶器|最佳时间,全年|进入难度,中等——步行约40分钟","id":"Tipe,Situs bersejarah dan arkeologi|Fitur,Makam kuno suku Tange Me|Artefak,Makam, alat, gerabah|Waktu terbaik,Seputar tahun|Kesulitan akses,Sedang — jalan ~40 menit","ms":"Jenis,Tapak bersejarah dan arkeologi|Ciri,Perkuburan kuno suku Tange Me|Artifak,Perkuburan, alat, tembikar|Masa terbaik,Seputar tahun|Kesukaran akses,Sederhana — berjalan ~40 minit","lo":"ປະເພດ,ສະຖານທີ່ທາງປະຫວັດສາດ ແລະ ບູຮານຄະດີ|ລັກສະນະ,ສຸສານບູຮານຊາວຕ່າງເໝ|ວັດຖຸ,ສຸສານ, ເຄື່ອງມື, ໂຖດິນ|ເວລາທີ່ດີທີ່ສຸດ,ຕະຫຼອດປີ|ຄວາມຍາກໃນການເຂົ້າເຖິງ,ປານກາງ — ຍ່າງ ~40 ນາທີ","es":"Tipo,Sitio histórico y arqueológico|Características,Sepulturas antiguas del pueblo Tange Me|Artefactos,Sepulturas, herramientas, cerámica|Mejor época,Todo el año|Dificultad de acceso,Moderada — caminata ~40 min","fr":"Type,Site historique et archéologique|Caractéristiques,Sépultures anciennes du peuple Tange Me|Artefacts,Sépultures, outils, poterie|Meilleure époque,Toute l'année|Difficulté d'accès,Moyenne — marche ~40 min","de":"Typ,Historische und archäologische Stätte|Merkmale,Alte Grabstätten des Tạng-Me-Volkes|Artefakte,Gräber, Werkzeuge, Keramik|Beste Zeit,Ganzjährig|Zugangsschwierigkeit,Mittel — ~40 Min Wanderung"}));
  allTranslations.push(...createTranslation('detail', 'd6.name', {"vi":"Đền thờ Tiên Chúa Bẳng Mương","en":"Tiên Chúa Bẳng Mương Temple","ko":"띠엔쭈아 빙므엉 사원","ru":"Храм Тьен Тюа Банг Мыонг","th":"วัดเทียนจัวบ่างเมือง","zh":"天主邦芒庙","id":"Kuil Tien Chua Bang Muong","ms":"Kuil Tien Chua Bang Muong","lo":"ວັດທຽນຈົວບັ່ງເມືອງ","es":"Templo Tien Chua Bang Muong","fr":"Temple Tien Chua Bang Muong","de":"Tiên-Chúa-Bằng-Mương-Tempel"}));
  allTranslations.push(...createTranslation('detail', 'd6.desc', {"vi":"Đền thờ Tiên Chúa Bằng Mương là công trình tâm linh linh thiêng, gắn liền với tín ngưỡng dân gian của đồng bào dân tộc thiểu số vùng cao. Hàng năm, vào dịp lễ hội, người dân từ khắp nơi về đây cầu may, cầu phúc.","en":"Tiên Chúa Bằng Mương Temple is a sacred spiritual site linked to folk beliefs of ethnic minority communities in the highlands. Every year during festivals, people from all over come here to pray for luck and blessings.","ko":"띠엔쭈아 빙므엉 사원은 고지대 소수민족의 민간 신앙과 연결된 신성한 영적 장소입니다.","ru":"Храм Тьен Тюа Банг Мыонг — священное духовное место, связанное с народными верованиями меньшинств нагорья.","th":"วัดเทียนจัวบ่างเมืองเป็นสถานที่ศักดิ์สิทธิ์ทางจิตวิญญาณ ผูกพันกับความเชื่อพื้นบ้านของชนกลุ่มน้อยบนที่สูง","zh":"天主邦芒庙是一座神圣的灵性场所，与高地少数民族的民间信仰紧密相连。","id":"Kuil Tien Chua Bang Muong adalah tempat spiritual suci yang terkait dengan kepercayaan rakyat komunitas etnis minoritas dataran tinggi.","ms":"Kuil Tien Chua Bang Muong adalah tempat spiritual suci yang berkaitan dengan kepercayaan rakyat komunitas etnik minoriti tanah tinggi.","lo":"ວັດທຽນຈົວບັ່ງເມືອງເປັນສະຖານທີ່ທາງຈິດວິນຍານສັກສິດ, ກ່ຽວກັບຄວາມເຊື່ອພື້ນບ້ານຂອງຊົນເຜົ່າສ່ຽງນ້ອຍເທິງພູສູງ.","es":"El Templo Tien Chua Bang Muong es un sitio espiritual sagrado vinculado a las creencias populares de las comunidades étnicas minoritarias de tierras altas.","fr":"Le Temple Tien Chua Bang Muong est un site spirituel sacré lié aux croyances populaires des communautés ethniques minoritaires de haute montagne.","de":"Der Tiên-Chúa-Bằng-Mương-Tempel ist eine heilige spirituelle Stätte, verbunden mit dem Volksglauben ethnischer Minderheiten im Hochland."}));
  allTranslations.push(...createTranslation('detail', 'd6.quote', {"vi":"Nơi không gian văn hóa tâm linh đặc sắc hội tụ — cầu may, cầu phúc giữa đại ngàn.","en":"Where unique spiritual and cultural spaces converge — praying for luck and blessings amid the wilderness.","ko":"독특한 영적·문화 공간이 모이는 곳 — 대자연 속에서 복을 빌고 축복을 구합니다.","ru":"Где встречаются уникальные духовные и культурные пространства — молитвы о счастье и благословении среди дикой природы.","th":"ที่ซึ่งพื้นที่ทางวัฒนธรรมและจิตวิญญาณมาบรรจบ — อธิษฐานขอพรท่ามกลางป่าใหญ่","zh":"独特的精神文化空间在此汇聚——在大荒野中祈福许愿。","id":"Di mana ruang budaya dan spiritual yang unik bertemu — berdoa untuk keberkatan di tengah hutan belantara.","ms":"Di mana ruang budaya dan spiritual yang unik bertemu — berdoa untuk keberkatan di tengah hutan belantara.","lo":"ບ່ອນທີ່ພື້ນທີ່ທາງວັດທະນະທຳ ແລະ ຈິດວິນຍານທີ່ເປັນເອກະລັກມາພົບກັນ — ອະທິຖານຂໍພອນທ່າມກາງປ່າໃຫຍ່.","es":"Donde convergen espacios culturales y espirituales únicos — orar por bendiciones en medio de la selva.","fr":"Où convergent des espaces culturels et spirituels uniques — prier pour des bénédictions au cœur de la forêt.","de":"Wo einzigartige kulturelle und spirituelle Räume zusammenkommen — um Segen inmitten der Wildnis zu bitten."}));
  allTranslations.push(...createTranslation('detail', 'd6.stats', {"vi":"Loại hình,Tâm linh|Độ khó,Dễ|Đi bộ,~10 phút|Thời điểm,Lễ hội","en":"Type,Spiritual|Difficulty,Easy|Walking,~10 min|Best time,Festivals","ko":"유형,영적|난이도,쉬움|도보,~10분|최적 시기,축제","ru":"Тип,Духовное|Сложность,Лёгкая|Пешком,~10 мин|Лучшее время,Фестивали","th":"ประเภท,จิตวิญญาณ|ความยาก,ง่าย|เดิน,~10 น.|เวลาที่ดีที่สุด,เทศกาล","zh":"类型,灵性|难度,容易|步行,~10分钟|最佳时间,节庆","id":"Tipe,Spiritual|Kesulitan,Mudah|Berjalan,~10 mnt|Waktu terbaik,Festival","ms":"Jenis,Spiritual|Kesukaran,Mudah|Berjalan,~10 min|Masa terbaik,Festival","lo":"ປະເພດ,ທາງຈິດວິນຍານ|ຄວາມຍາກ,ງ່າຍ|ຍ່າງ,~10 ນາທີ|ເວລາທີ່ດີທີ່ສຸດ,ບຸນປະເພນີ","es":"Tipo,Espiritual|Dificultad,Fácil|Caminata,~10 min|Mejor época,Festivales","fr":"Type,Spirituel|Difficulté,Facile|Marche,~10 min|Meilleure époque,Festivals","de":"Typ,Spirituell|Schwierigkeit,Leicht|Wandern,~10 Min|Beste Zeit,Festivals"}));
  allTranslations.push(...createTranslation('detail', 'd6.info', {"vi":"Loại hình,Di tích tâm linh|Đặc điểm,Tín ngưỡng dân gian, cầu may cầu phúc|Sự kiện,Lễ hội hàng năm|Thời điểm đẹp nhất,Dịp lễ hội|Độ khó tiếp cận,Dễ — đi bộ ~10 phút","en":"Type,Spiritual site|Features,Folk beliefs, prayer for luck|Events,Annual festival|Best time,Festival season|Access difficulty,Easy — ~10 min walk","ko":"유형,영적 유적|특징,민간 신앙·복 비는 곳|행사,연례 축제|최적 시기,축제 시기|접근 난이도,쉬움 — 도보 ~10분","ru":"Тип,Духовное место|Особенности,Народные верения, молитвы|События,Ежегодный фестиваль|Лучшее время,Сезон фестивалей|Сложность,Лёгкая — ~10 мин пешком","th":"ประเภท,สถานที่ศักดิ์สิทธิ์|ลักษณะ,ความเชื่อพื้นบ้าน การขอพร|กิจกรรม,เทศกาลประจำปี|เวลาที่ดีที่สุด,ช่วงเทศกาล|ความยากในการเข้าถึง,ง่าย — เดิน ~10 นาที","zh":"类型,灵性场所|特征,民间信仰、祈福|活动,年度节庆|最佳时间,节庆期间|进入难度,容易——步行约10分钟","id":"Tipe,Situs spiritual|Fitur,Kepercayaan rakyat, doa keberkatan|Acara,Festival tahunan|Waktu terbaik,Musim festival|Kesulitan akses,Mudah — jalan ~10 menit","ms":"Jenis,Tapak spiritual|Ciri,Kepercayaan rakyat, doa keberkatan|Acara,Festival tahunan|Masa terbaik,Musim festival|Kesukaran akses,Mudah — berjalan ~10 minit","lo":"ປະເພດ,ສະຖານທີ່ທາງຈິດວິນຍານ|ລັກສະນະ,ຄວາມເຊື່ອພື້ນບ້ານ, ຂໍພອນ|ງານ,ບຸນປະຈຳປີ|ເວລາທີ່ດີທີ່ສຸດ,ລະດູບຸນ|ຄວາມຍາກໃນການເຂົ້າເຖິງ,ງ່າຍ — ຍ່າງ ~10 ນາທີ","es":"Tipo,Sitio espiritual|Características,Creencias populares, oración por bendiciones|Eventos,Festival anual|Mejor época,Temporada de festivales|Dificultad de acceso,Fácil — caminata ~10 min","fr":"Type,Spirituel|Caractéristiques,Croyances populaires, prières|Événements,Festival annuel|Meilleure époque,Saison des festivals|Difficulté d'accès,Facile — marche ~10 min","de":"Typ,Spirituelle Stätte|Merkmale,Volksglauben, Segensgebete|Veranstaltungen,Jährliches Festival|Beste Zeit,Festivalsaison|Zugangsschwierigkeit,Leicht — ~10 Min Wanderung"}));

  await knex('i18n_content').insert(allTranslations);
  console.log(`Seeded ${allTranslations.length} i18n translations for all 12 languages`);
};



