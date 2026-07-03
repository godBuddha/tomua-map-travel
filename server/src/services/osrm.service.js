const axios = require('axios');

const OSRM_URL = process.env.OSRM_URL || 'http://router.project-osrm.org';

const OsrmService = {
  async getRoute(coordinates, profile = 'foot') {
    try {
      if (coordinates.length < 2) {
        return null;
      }

      const coordString = coordinates.map(c => c.join(',')).join(';');
      const url = `${OSRM_URL}/route/v1/${profile}/${coordString}`;

      const response = await axios.get(url, {
        params: {
          overview: 'full',
          geometries: 'geojson'
        },
        timeout: 10000
      });

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        return response.data.routes[0];
      }

      return null;
    } catch (error) {
      console.error('OSRM API error:', error.message);
      return null;
    }
  },

  async getDistanceMatrix(coordinates, profile = 'foot') {
    try {
      if (coordinates.length < 2) {
        return null;
      }

      const coordString = coordinates.map(c => c.join(',')).join(';');
      const url = `${OSRM_URL}/table/v1/${profile}/${coordString}`;

      const response = await axios.get(url, {
        params: {
          annotations: 'distance,duration'
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('OSRM API error:', error.message);
      return null;
    }
  }
};

module.exports = OsrmService;
