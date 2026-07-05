// Script to add homepage settings to database
// Run: node server/scripts/add-homepage-settings.js

const db = require('../src/config/database');

async function addHomepageSettings() {
  try {
    console.log('Adding homepage settings...');
    
    // Homepage stats
    const homepageStats = {
      stats: [
        { icon: "📐", number: "181,98", unit: "km²", labelKey: "stats.area" },
        { icon: "👥", number: "14.701", unit: "", labelKey: "stats.population" },
        { icon: "🏘️", number: "3", unit: "", labelKey: "stats.merged" }
      ]
    };
    
    // Event filters
    const eventFilters = {
      filters: [
        { type: "all", labelKey: "filter.all", icon: "" },
        { type: "festival", labelKey: "type.festival", icon: "🎪" },
        { type: "season", labelKey: "type.season", icon: "🌿" },
        { type: "cultural", labelKey: "type.cultural", icon: "🎭" },
        { type: "food", labelKey: "type.food", icon: "🍜" }
      ]
    };
    
    // Route filters
    const routeFilters = {
      filters: [
        { type: "all", labelKey: "filter.all", icon: "" },
        { type: "walk", labelKey: "transport.walk", icon: "🚶" },
        { type: "bike", labelKey: "transport.bike", icon: "🏍️" },
        { type: "car", labelKey: "transport.car", icon: "🚗" }
      ]
    };
    
    // Upsert settings
    const settings = [
      { key: 'homepage_stats', value: homepageStats, description: 'Homepage statistics display' },
      { key: 'event_filters', value: eventFilters, description: 'Event filter buttons configuration' },
      { key: 'route_filters', value: routeFilters, description: 'Route filter buttons configuration' }
    ];
    
    for (const setting of settings) {
      const exists = await db('system_settings').where({ key: setting.key }).first();
      if (exists) {
        await db('system_settings')
          .where({ key: setting.key })
          .update({ value: JSON.stringify(setting.value), description: setting.description });
        console.log(`Updated: ${setting.key}`);
      } else {
        await db('system_settings')
          .insert({ key: setting.key, value: JSON.stringify(setting.value), description: setting.description });
        console.log(`Inserted: ${setting.key}`);
      }
    }
    
    console.log('Homepage settings added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding homepage settings:', error);
    process.exit(1);
  }
}

addHomepageSettings();
