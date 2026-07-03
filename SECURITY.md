# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Yes             |
| < 1.0   | ❌ No              |

## Reporting a Vulnerability

We take the security of our project seriously. If you discover a security vulnerability, please report it responsibly.

### 🔒 How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security vulnerabilities by emailing:

📧 **security@tomua-map-travel.example.com**

### 📝 What to Include

Please include the following information in your report:

1. **Description**: A clear description of the vulnerability
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Impact**: Potential impact of the vulnerability
4. **Affected Versions**: Which versions are affected
5. **Suggested Fix**: If you have a suggestion for fixing the issue

### ⏱️ Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Release**: Within 30 days (depending on complexity)

### 🏆 Recognition

We appreciate security researchers who responsibly disclose vulnerabilities. With your permission, we will:

- Credit you in the release notes
- Add you to our security acknowledgments

## Security Measures

### Authentication & Authorization

- ✅ JWT-based authentication (Access + Refresh tokens)
- ✅ Multi-Factor Authentication (MFA) with TOTP
- ✅ Role-based access control (Admin / Collaborator)
- ✅ Account lockout after failed attempts
- ✅ Password hashing with bcrypt (12 rounds)

### Input Validation

- ✅ Express-validator for API inputs
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (HTML escaping)
- ✅ Path traversal protection
- ✅ Mass assignment protection (field whitelisting)

### Network Security

- ✅ HTTPS enforcement (via reverse proxy)
- ✅ CORS configuration
- ✅ Security headers (Helmet.js)
- ✅ Content Security Policy (CSP)
- ✅ Rate limiting

### Data Protection

- ✅ Environment variables for secrets
- ✅ .gitignore for sensitive files
- ✅ Database connection encryption
- ✅ File upload validation

### Infrastructure Security

- ✅ Docker container isolation
- ✅ Non-root container user
- ✅ .dockerignore for build context
- ✅ Health checks for services

## Security Best Practices for Deployment

### Environment Variables

Always set the following in production:

```bash
# Required
JWT_SECRET=<strong-random-secret-min-32-chars>
JWT_REFRESH_SECRET=<strong-random-secret-min-32-chars>
DB_PASSWORD=<strong-database-password>
ADMIN_PASSWORD=<strong-admin-password>

# Recommended
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

### Database Security

- Use strong passwords
- Restrict network access
- Enable SSL connections
- Regular backups

### Container Security

- Keep base images updated
- Scan for vulnerabilities
- Use minimal base images
- Don't run as root

## Known Security Considerations

### 1. Token Storage

JWT tokens are stored in localStorage, which is vulnerable to XSS attacks. For enhanced security:

- Use HttpOnly cookies for refresh tokens
- Implement short-lived access tokens (5-15 minutes)
- Add token rotation on each refresh

### 2. Content Security Policy

CSP is configured but may need adjustment for:

- Third-party integrations
- CDN resources
- Inline styles (currently using 'unsafe-inline')

### 3. Rate Limiting

Current rate limits:
- General API: 1000 requests/minute
- Auth endpoints: 20 requests/15 minutes
- Registration: 5 requests/hour

Adjust based on your traffic patterns.

## Security Updates

We regularly update dependencies to patch known vulnerabilities:

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Contact

For security-related questions or concerns:

- **Security Email**: security@tomua-map-travel.example.com
- **GitHub Security Advisories**: [Create Advisory](https://github.com/godBuddha/tomua-map-travel/security/advisories/new)

---

**Last Updated**: 2026-07-03
