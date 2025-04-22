# EchoLog Changelog

### Date: 22.04.2025 – Backend Core Completed

**Architecture & Models**
- Defined all core entities with enforced relationships: `User`, `UserRole`, `Project`, `ProjectDetail`, `ProjectNote`, `ProjectFile`, `ProjectType`, `ProjectStatus`, `AppSetting`
- Implemented normalization and cascade deletion where needed
- OwnerId-based access control introduced at the schema level

**Security Layer**
- Integrated full JWT authentication (symmetric key)
- Claims: `UserId`, `Username`, `Role`
- Stateless login via `/api/auth/login` using `AuthService`
- Passwords secured using BCrypt hashing

**RBAC Enforcement**
- Role matrix applied across all endpoints:
  - `Admin`: Full access to everything
  - `User`: Access only to owned resources
  - `Observer`: Global read-only access
- `UserContextService` implemented for claim-based identity extraction

**Controller Hardening**
- Ownership checks applied on: `Project`, `Detail`, `Note`, `File`
- Anonymous access removed from protected endpoints
- Admin-only access enforced on: `AppSettingsController`, `UserController`
- Write operations restricted on `ProjectTypeController`, `ProjectStatusController`

**Migration & Boot**
- Created and applied initial EF migration (`Init`)
- Automatic database migration on startup
- Default port dynamically read from seeded `AppSettings`
- Seeding includes:
  - Roles: `Admin`, `User`, `Observer`
  - Default admin credentials (valid BCrypt hash)
  - Status/Type normalization tables

**Swagger Integration**
- Swagger UI available only in Development mode
- Bearer token support enabled
- JWT testing functional across protected routes

**Repository & Project Structure**
- Git initialized with full structure:
  - `echolog.server` backend
  - `docs/` and `README.md` introduced
- Project pushed to GitHub: [https://github.com/vjeko2404/EchoLog](https://github.com/vjeko2404/EchoLog)