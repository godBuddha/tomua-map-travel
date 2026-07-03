# To Mua Tourism Map - Backend API

Backend API for the To Mua Commune Tourism Map application.

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: PostgreSQL 16 with PostGIS
- **ORM**: Knex.js
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer

## Prerequisites

- Node.js 18+ (recommended: 20)
- PostgreSQL 14+ with PostGIS extension
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup Database

Create a PostgreSQL database:

```sql
CREATE DATABASE tomua_tourism;
CREATE USER tomua_admin WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE tomua_tourism TO tomua_admin;
```

Enable PostGIS extension:

```bash
psql -U tomua_admin -d tomua_tourism -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and JWT secrets.

### 4. Run Migrations

```bash
npm run migrate
```

### 5. Seed Initial Data

```bash
npm run seed
```

This creates:
- Admin user: `admin` / `admin123456`
- Collaborator user: `ctv1` / `ctv123456`
- 6 sample destinations
- Basic i18n content

### 6. Start Server

Development (with auto-reload):
```bash
npm run dev
```

Production:
```bash
npm start
```

The API will be available at `http://localhost:5000/api`

## Docker Setup

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f server

# Stop all services
docker-compose down
```

This starts:
- PostgreSQL with PostGIS (port 5432)
- Node.js API server (port 5000)
- Nginx reverse proxy (port 3000)

### Access Points

- Frontend: http://localhost:3000
- API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/change-password` - Change password

### Destinations
- `GET /api/destinations` - List destinations
- `GET /api/destinations/:idOrSlug` - Get destination
- `GET /api/destinations/nearby` - Find nearby destinations
- `POST /api/destinations` - Create destination
- `PUT /api/destinations/:id` - Update destination
- `DELETE /api/destinations/:id` - Delete destination (admin)
- `POST /api/destinations/:id/submit-review` - Submit for review
- `POST /api/destinations/:id/approve` - Approve (admin)
- `POST /api/destinations/:id/reject` - Reject (admin)

### Routes/Tours
- `GET /api/routes` - List routes
- `GET /api/routes/:idOrSlug` - Get route
- `POST /api/routes` - Create route
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route (admin)
- `POST /api/routes/:id/stops` - Add stop
- `PUT /api/routes/:id/stops/:stopId` - Update stop
- `DELETE /api/routes/:id/stops/:stopId` - Delete stop

### Events
- `GET /api/events` - List events
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/:idOrSlug` - Get event
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event (admin)

### Users (Admin Only)
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/status` - Update user status
- `PUT /api/users/:id/role` - Update user role

### i18n Content
- `GET /api/i18n/:page` - Get page translations
- `GET /api/i18n/:page/:lang` - Get page translations for language
- `PUT /api/i18n/:page/:key` - Update translation (admin)
- `POST /api/i18n/bulk` - Bulk update translations (admin)
- `GET /api/i18n/export/:lang` - Export translations (admin)

### File Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images
- `DELETE /api/upload/:filename` - Delete uploaded file

### Comments
- `GET /api/comments/:entityType/:entityId` - Get comments
- `POST /api/comments` - Add comment

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app setup
│   └── index.js         # Entry point
├── migrations/          # Database migrations
├── seeds/               # Seed data
├── uploads/             # Uploaded files
└── tests/               # Test files
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 5000 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_EXPIRES_IN` | Access token expiry | 1h |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | 7d |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `UPLOAD_DIR` | Upload directory | ./uploads |
| `MAX_FILE_SIZE` | Max upload size (bytes) | 5242880 |

## License

Internal use only.
