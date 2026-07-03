const fs = require('fs');
const file = '/Volumes/PortableSSD/tomua-map-travel/client/collaborator.html';
let content = fs.readFileSync(file, 'utf8');

const regex = /const DESTINATIONS = window.ROUTE_DESTINATIONS \|\| \[\];/g;
content = content.replace(regex, `function getDestinations() { return window.ROUTE_DESTINATIONS || []; }`);

content = content.replace(/DESTINATIONS\.find/g, 'getDestinations().find');
content = content.replace(/DESTINATIONS\.map/g, 'getDestinations().map');

fs.writeFileSync(file, content);
console.log('Fixed DESTINATIONS ref');
