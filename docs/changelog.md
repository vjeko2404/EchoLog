# EchoLog Changelog

### Date: 23.04.2025 – Frontend Functionality Finalized

**Architecture & Structure**
- React + Vite project scaffolded for lightweight, modular SPA
- Implemented centralized `api.ts` with Axios + JWT interceptor logic
- Fully typed interfaces for all DTOs matching backend schema
- File structure aligned with logical module separation (`dashboard`, `detail`, `admin`, `auth`)

**Authentication Flow**
- JWT-based login with `localStorage` persistence
- Role-aware rendering via `UserContext` using claim-based decoding
- Topbar dynamically adapts per-role: Admin, User, Observer

**Role-Based Access UI Enforcement**
- `Admin`: Full access to all views, controls, and management
- `User`: Can only view/edit own projects
- `Observer`: Fully restricted to readonly views (no inputs, buttons, or uploads)

**Dashboard & Project Flow**
- Dynamic project list per role (filtered on backend)
- Project creation supports title, description, type, and status
- Detailed view split into tabbed layout:
  - Summary, Edit, Detail, Notes, Files
- Tabs dynamically rendered based on user role

**Project Detail & File System**
- Full CRUD for `ProjectDetails` and `ProjectNotes`
- **Advanced FileTab**:
  - Drag & drop multi-file upload
  - Category selection (mandatory)
  - Description applied across batch
  - Category-based filtering
  - Single + multi-file download (ZIP bundling)
  - File-level delete (role restricted)
  - Polished table layout with tooltip previews

**Admin Panel**
- **User management**: full CRUD with live role lookup
- **File category management**: inline edit/delete
- **New**: Global Project Management panel
  - Admins can reassign ownership of any project
  - View includes project ID, title, owner selector
- App settings editor with key/value inline update

**Visual Enhancements**
- TailwindCSS with consistent dark theme
- Subtle transitions and hover states
- Logo integration in header + favicon
- Tooltips for long descriptions
- Animations: button groups, tab transitions, modals

**Reliability**
- All requests honor token auth with graceful 401 handling
- Frontend failsafe fallback for role validation + token expiration
- Observer logic cleanly isolates UI restrictions
- Form validation and submission guards applied

**Deployment-Ready**
- `public` folder structured with favicon and static assets
- Build script verified for production
- GitHub-ready with consistent linting and structure

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