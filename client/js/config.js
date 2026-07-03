// Shared configuration for Tomua Map Travel
const TomuaConfig = {
  // Destination type colors
  typeColors: {
    waterfall: '#0e7490',
    cave: '#78716c',
    historical: '#57534e',
    spiritual: '#9f1239',
    other: '#4b5563' // Fallback for database 'other' enum
  },

  // Destination type emojis
  typeEmoji: {
    waterfall: '💧',
    cave: '🕳️',
    historical: '🏛️',
    spiritual: '⛩️',
    other: '📍' // Fallback for database 'other' enum
  },

  // GeoJSON boundary files
  geoFiles: [
    { file: 'Tô Múa - 63.geojson', name: 'Tô Múa (cũ)', color: '#2d6a4f' },
    { file: 'Chiềng Khoa - 63.geojson', name: 'Chiềng Khoa (cũ)', color: '#0e7490' },
    { file: 'Suối Bàng - 63.geojson', name: 'Suối Bàng (cũ)', color: '#d97706' }
  ],

  // Merged boundary file
  mergedBoundary: 'Tô Múa (phường xã) - 34.geojson',

  // Default map center (Tô Múa)
  mapCenter: [20.844, 104.825],
  mapZoom: 13,

  // Event type icons
  eventTypeIcons: {
    festival: '🎪',
    season: '🌿',
    experience: '⛰️',
    cultural: '🎭',
    sport: '⚽',
    food: '🍜',
    other: '📅'
  },

  // Route segment colors
  segmentColors: [
    '#0e7490', '#2d6a4f', '#b45309', '#9f1239', '#6d28d9',
    '#0369a1', '#15803d', '#c2410c', '#7e22ce', '#0f766e'
  ],

  // Transport speeds (km/h)
  transportSpeeds: {
    walk: 4,
    bike: 30,
    car: 40
  },

  // OSRM profiles
  osrmProfiles: {
    walk: 'foot',
    bike: 'bike',
    car: 'car'
  }
};

// Initialize dynamic settings from API
TomuaConfig.initSettings = async function() {
  try {
    const res = await fetch('/api/settings');
    const json = await res.json();
    if (json.success && json.data) {
      if (json.data.mapCenter) TomuaConfig.mapCenter = json.data.mapCenter;
      Object.assign(TomuaConfig, json.data); // merge other settings dynamically
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
};

// User role names
TomuaConfig.roleNames = {
  admin: 'Quản trị viên',
  collaborator: 'Cộng tác viên'
};

// === GLOBAL PAGE TRANSITIONS ===
(function initGlobalTransitions() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Add initial fade in
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-fade-in');
  });
  
  // Also add it directly in case DOMContentLoaded already fired
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    document.body.classList.add('page-fade-in');
  }

  // Intercept links for fade out
  window.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    // Ignore external links, new tabs, anchor links, and downloads
    if (
      link.hostname !== window.location.hostname ||
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      link.href.includes('#') && link.pathname === window.location.pathname
    ) {
      return;
    }

    e.preventDefault();
    const href = link.href;
    document.body.classList.remove('page-fade-in');
    document.body.classList.add('page-fade-out');
    
    setTimeout(() => {
      window.location.href = href;
    }, 350); // Match CSS transition duration
  });
})();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TomuaConfig;
}
