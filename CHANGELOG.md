# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- MFA (Multi-Factor Authentication) with TOTP support
- Account lockout after failed login attempts
- Redis caching layer for improved performance
- Swagger API documentation at /api-docs
- Winston logging system
- GitHub Actions CI/CD pipeline
- Docker security hardening (non-root user)
- API response compression (gzip)
- CONTRIBUTING.md guidelines
- SECURITY.md policy
- CHANGELOG.md

### Changed
- Password minimum length increased to 8 characters
- CSP (Content Security Policy) enabled
- Rate limiting improvements

### Fixed
- XSS vulnerabilities (HTML escaping for all user data)
- Path traversal in upload category
- Mass assignment in routes controller
- Hardcoded credentials in seed files

## [1.0.0] - 2026-07-03

### Added
- Initial release
- Full CRUD for destinations, routes, events
- User authentication with JWT
- Role-based access control (Admin/Collaborator)
- Multi-language support (12 languages)
- Interactive map with Leaflet.js
- PostGIS spatial queries
- Image upload with Sharp processing
- Docker Compose deployment
- Nginx reverse proxy

### Features
- **Dashboard**: Statistics overview, recent activity
- **Destinations**: Create, edit, delete, approve/reject workflow
- **Routes**: Multi-stop route planning with OSRM integration
- **Events**: Event management with recurring support
- **Users**: User management with role assignment
- **i18n**: 12 language support (vi, en, ko, ru, th, zh, id, ms, lo, es, fr, de)
- **Map**: Interactive map with markers, routes, events layers
- **Comments**: Comment system for approval workflow
- **Upload**: Image upload with auto-conversion to WebP

### Technical
- Node.js 20 + Express.js backend
- PostgreSQL 16 + PostGIS 3.4 database
- Knex.js ORM with migrations
- JWT authentication (Access + Refresh tokens)
- Docker Compose deployment
- Nginx reverse proxy

## [0.1.0] - 2026-06-01

### Added
- Project initialization
- Basic HTML prototype
- Database schema design
- API structure planning

---

## Release Notes

### v1.0.0 - Initial Release

This is the first stable release of the Tomua Map Travel system, a digital tourism map for Xã Tô Múa, Sơn La, Vietnam.

**Key Features:**
- Interactive map with Leaflet.js
- Multi-language support for international tourists
- Admin panel for content management
- Collaborator workflow with approval process
- Mobile-responsive design

**Security:**
- JWT authentication
- Role-based access control
- Input validation
- SQL injection prevention
- XSS protection

**Performance:**
- PostGIS for spatial queries
- Image optimization with Sharp
- Docker deployment with health checks

---

## Upgrade Guide

### From 0.x to 1.0.0

1. Backup your database
2. Run migrations: `docker exec tomua_server npx knex migrate:latest`
3. Run seeds: `docker exec tomua_server npx knex seed:run`
4. Update environment variables as per `.env.example`

---

## Contributors

- @godBuddha - Initial development and maintenance

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
