const createPoint = (lng, lat) => {
  // BUG-01 FIX: Validate numbers to prevent SQL Injection
  const lngNum = parseFloat(lng);
  const latNum = parseFloat(lat);
  if (isNaN(lngNum) || isNaN(latNum)) {
    throw new Error('Invalid coordinates: lng and lat must be valid numbers');
  }
  if (lngNum < -180 || lngNum > 180) {
    throw new Error('Invalid longitude: must be between -180 and 180');
  }
  if (latNum < -90 || latNum > 90) {
    throw new Error('Invalid latitude: must be between -90 and 90');
  }
  return `ST_SetSRID(ST_MakePoint(${lngNum}, ${latNum}), 4326)`;
};

const createLineString = (coordinates) => {
  // BUG-01 FIX: Validate all coordinate pairs to prevent SQL Injection
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error('Invalid coordinates: must be an array with at least 2 points');
  }
  const coordString = coordinates.map(c => {
    const lng = parseFloat(c[0]);
    const lat = parseFloat(c[1]);
    if (isNaN(lng) || isNaN(lat)) {
      throw new Error('Invalid coordinate pair: values must be valid numbers');
    }
    return `${lng} ${lat}`;
  }).join(',');
  return `ST_SetSRID(ST_GeomFromText('LINESTRING(${coordString})'), 4326)`;
};

const parsePoint = (point) => {
  if (!point) return null;
  // Extract coordinates from PostGIS point string
  const match = point.match(/POINT\(([^)]+)\)/);
  if (match) {
    const [lng, lat] = match[1].split(' ').map(Number);
    return { lat, lng };
  }
  return null;
};

const parseGeoJSON = (geom) => {
  if (!geom) return null;
  try {
    if (typeof geom === 'string') {
      return JSON.parse(geom);
    }
    return geom;
  } catch (e) {
    return null;
  }
};

module.exports = {
  createPoint,
  createLineString,
  parsePoint,
  parseGeoJSON
};
