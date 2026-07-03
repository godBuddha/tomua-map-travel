# Contributing to Tomua Map Travel

Thank you for your interest in contributing to the Tomua Map Travel project! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Please be respectful and inclusive in all interactions. We are committed to providing a welcoming and inclusive experience for everyone.

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Git
- Node.js 20+ (for local development)

### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/tomua-map-travel.git
   cd tomua-map-travel
   ```

3. Copy environment file:
   ```bash
   cp server/.env.example .env
   # Edit .env with your configuration
   ```

4. Start with Docker:
   ```bash
   docker compose up -d
   ```

5. Run migrations and seeds:
   ```bash
   docker exec tomua_server npx knex migrate:latest
   docker exec tomua_server npx knex seed:run
   ```

6. Access the application:
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api
   - Swagger Docs: http://localhost:3000/api-docs

## Development Workflow

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes
3. Write tests for new functionality
4. Ensure all tests pass:
   ```bash
   docker exec tomua_server npm test
   ```
5. Commit your changes
6. Push to your fork
7. Create a Pull Request

## Coding Standards

### JavaScript/Node.js

- Use ES6+ features
- Follow existing code style (2 spaces indentation)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### HTML/CSS

- Use semantic HTML5 elements
- Follow BEM naming convention for CSS classes
- Ensure responsive design
- Test across different browsers

### Database

- Use migrations for schema changes
- Add indexes for frequently queried columns
- Use parameterized queries (Knex.js handles this)

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add MFA support with TOTP
fix(upload): prevent path traversal in category
docs(readme): update installation instructions
test(api): add integration tests for destinations
```

## Pull Requests

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] Tests pass locally
- [ ] New features include tests
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventions

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Comments added for complex logic
- [ ] Documentation updated
```

## Reporting Issues

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, browser, Docker version)
- Screenshots if applicable

### Feature Requests

Include:
- Problem statement
- Proposed solution
- Alternative solutions considered
- Impact on existing functionality

## 🏷️ Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed

## 📞 Contact

- GitHub Issues: [Create an issue](https://github.com/godBuddha/tomua-map-travel/issues)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
