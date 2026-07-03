# Environment Variables

This document describes all environment variables used in the Tomua Map Travel project.

## Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DB_PASSWORD` | PostgreSQL database password | `your_secure_password` | ✅ |
| `JWT_SECRET` | Secret for signing access tokens (min 32 chars) | `your_jwt_secret_key_min_32_chars` | ✅ |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (min 32 chars) | `your_refresh_secret_key` | ✅ |

## Optional Variables

### Server Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | ❌ |
| `PORT` | Server port | `5000` | ❌ |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` | ❌ |
| `LOG_LEVEL` | Logging level | `info` | ❌ |

### Database Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | Full PostgreSQL connection URL | - | ❌* |
| `DB_USER` | Database username | `tomua_admin` | ❌ |
| `DB_NAME` | Database name | `tomua_tourism` | ❌ |

*If `DATABASE_URL` is not set, individual variables are used.

### Redis Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` | ❌ |

### JWT Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_EXPIRES_IN` | Access token expiration | `24h` | ❌ |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `30d` | ❌ |

### File Upload Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `UPLOAD_DIR` | Upload directory path | `./uploads` | ❌ |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `5242880` (5MB) | ❌ |

### Admin Seed Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ADMIN_EMAIL` | Admin user email | `admin@tomua.vn` | ❌ |
| `ADMIN_PASSWORD` | Admin user password | - | ❌ |
| `ADMIN_NAME` | Admin user display name | `Administrator` | ❌ |

### External Services

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OSRM_URL` | OSRM routing server URL | `http://router.project-osrm.org` | ❌ |

## Environment Files

### `.env` (Root)

Used by Docker Compose for container environment variables.

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
DB_PASSWORD=your_secure_password
DB_USER=tomua_admin
DB_NAME=tomua_tourism

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

# CORS
CORS_ORIGIN=http://localhost:3000

# Admin
ADMIN_EMAIL=admin@tomua.vn
ADMIN_PASSWORD=your_admin_password
```

### `server/.env` (Server)

Used by the Node.js application directly.

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://tomua_admin:your_password@localhost:5432/tomua_tourism

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Redis
REDIS_URL=redis://localhost:6379

# Admin
ADMIN_EMAIL=admin@tomua.vn
ADMIN_PASSWORD=your_admin_password
ADMIN_NAME=Administrator

# OSRM
OSRM_URL=http://router.project-osrm.org
```

## Security Best Practices

### 1. Generate Strong Secrets

Use the following commands to generate secure secrets:

```bash
# Generate JWT secret (64 characters)
openssl rand -hex 32

# Generate database password (24 characters)
openssl rand -base64 24 | tr -d '/+=' | head -c 24

# Generate refresh token secret
openssl rand -hex 32
```

### 2. Never Commit .env Files

The `.gitignore` file should include:
```
.env
.env.local
.env.*.local
server/.env
```

### 3. Use Different Secrets per Environment

- Development: Use development-specific secrets
- Staging: Use staging-specific secrets
- Production: Use strong, unique secrets

### 4. Rotate Secrets Regularly

- JWT secrets: Rotate every 90 days
- Database passwords: Rotate every 180 days
- After any security incident

## Docker Environment

When using Docker Compose, environment variables are passed from the root `.env` file:

```yaml
services:
  server:
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      DATABASE_URL: postgresql://${DB_USER:-tomua_admin}:${DB_PASSWORD}@db:5432/${DB_NAME:-tomua_tourism}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
```

## Production Checklist

Before deploying to production:

- [ ] All required variables are set
- [ ] Passwords are strong (min 16 characters)
- [ ] JWT secrets are unique and random
- [ ] `.env` files are not committed to git
- [ ] Different secrets than development
- [ ] CORS_ORIGIN points to production domain
- [ ] NODE_ENV is set to `production`

## Troubleshooting

### JWT_SECRET not set error

```
Error: JWT_SECRET and JWT_REFRESH_SECRET must be set in environment
```

**Solution**: Set the environment variables in `.env` file.

### Database connection failed

```
Error: Database connection failed
```

**Solution**: 
1. Check `DB_PASSWORD` is correct
2. Ensure PostgreSQL container is running
3. Verify network connectivity

### Redis connection failed

```
Redis connection failed: connect ECONNREFUSED
```

**Solution**:
1. Ensure Redis container is running
2. Check `REDIS_URL` is correct
3. Redis is optional - app works without it

---

**Last Updated**: 2026-07-03
