# EchoLog Changelog

Date: 22.04.2025
**Backend Core Security & Infrastructure Finalized**

Completed: JWT Authentication Integrated
   - Configured JwtBearer for secure authentication using symmetric key validation.
   - Embedded claims for UserId, Username, and Role within the JWT.
   - Implemented fully operational token issuance and validation processes.

Completed: AuthController Operational
   - Implements a secure login flow utilizing BCrypt for password verification.
   - Returns a signed JWT token containing expiration information and the user's role claim upon successful authentication.

Completed: RBAC (Role-Based Access Control) Enforced
   - **Admin:** Granted unrestricted access to all resources and system settings.
   - **User:** Possesses full control over resources they own, including Projects, Files, Notes, and Details.
   - **Observer:** Provides read-only access to all publicly available data within the system.
   - Controllers have been enhanced with `UserContextService` and `OwnerId` checks to ensure proper authorization.

Completed: Swagger Security Integration
   - Enabled Bearer Token authentication support within Swagger UI for secure endpoint testing.
   - Swagger interface is conditionally enabled only in Development environments for security.

Completed: Program.cs Refactored
   - Improved code organization with a clear separation of configuration, services, middleware, and application startup logic.
   - Implemented dynamic loading of the API port from the `AppSettings` database table.
   - Integrated JWT authentication and Swagger before the application build lifecycle.

Completed: All Controllers Audited
   - Comprehensive review and refactoring of access control mechanisms across all controllers.
   - Removed anonymous access from protected resources.
   - Implemented ownership-based validation for Project, Detail, Note, and File entities.

Completed: BCrypt Seeding Fixed
   - Resolved issue with initial admin user seeding to ensure a valid BCrypt hash is generated.
   - Login functionality is operational immediately upon first run without manual post-migration steps.

Completed: EF Core Migration Pipeline Validated
   - Confirmed that the database schema is correctly generated based on the defined data models.
   - Implemented automatic database migration upon application startup.
   - Dynamic application port and seed values are read and applied during the migration process.

---

Date 21.04.2025
**Initial Development Phase**

Completed: Model Architecture Created
   - Defined core entities: `User`, `UserRole`, `Project`, `ProjectDetail`, `ProjectNote`, `ProjectFile`, `ProjectType`, `ProjectStatus`, and `AppSetting`.
   - Established relationships between entities, including one-to-one, one-to-many, and many-to-one associations.
   - Implemented constraints such as unique usernames and cascade deletes for child collections.

Completed: DbContext Created
   - Developed `ApplicationDbContext.cs` with `DbSet<>` properties for all defined entities.
   - Utilized Fluent API for configuring entity relationships and constraints.
   - Separated seed logic into `Seed.cs` for better organization.

Completed: Seed System Implemented
   - Implemented initial data seeding for `AppSettings` (default API port), `UserRole` (admin, user, observer), `User` (default admin account with BCrypt hash), `ProjectStatus`, and `ProjectType`.

Completed: JWT Authentication System Implemented
   - Created `AuthService.cs` responsible for user login and JWT issuance.
   - Developed `AuthController.cs` exposing the `/api/auth/login` endpoint.
   - Implemented JWT token generation including `UserId`, `Username`, and `Role` claims.
   - Ensured stateless authentication without reliance on sessions or cookies.

Completed: User Context Service Created
   - Developed `IUserContextService` and its implementation `UserContextService`.
   - Implemented logic to extract user claims (UserId, Role) from the JWT within the `HttpContext.User`.
   - Exposed an `IsAdmin` boolean property for simplified role checks.

Completed: RBAC Enforcement Completed
   - Applied role-based authorization using the `[Authorize]` attribute on relevant controllers and endpoints.
   - Implemented ownership-based logic in controller actions to restrict data access and modification based on user roles and ownership.
   - Secured specific controllers with precise access rules:
     - `ProjectController`: RBAC and `OwnerId` validation.
     - `ProjectDetailController`: Ownership check.
     - `ProjectNoteController`: Ownership check and project association validation.
     - `ProjectFileController`: Ownership check and project linkage validation.
     - `AppSettingsController`: Admin-only access.
     - `UserController`: Admin-only access.
     - `ProjectTypeController`: Admin-only write access.
     - `ProjectStatusController`: Pattern established for future enforcement.

Completed: Swagger Integration with JWT Support
   - Enabled Swagger UI in Development environments.
   - Configured JWT Bearer security definition to allow authorization via token input in the UI.
   - Verified the integration by successfully accessing protected routes using valid JWT tokens.

Completed: Migration & Runtime Setup
   - Utilized `dotnet ef` to generate the initial database migration ("Init").
   - Configured automatic database migration on application startup.
   - Implemented dynamic reading of the API port from the `AppSettings` table during runtime.
   - Organized `Program.cs` with a clear sequence: Configuration, Services, Middleware, and Runtime.

Completed: Manual Git Versioning Setup
   - Initialized Git repository after the core project structure was established.
   - Created and standardized `.gitignore` file.
   - Structured the repository for cross-platform compatibility (development PC and target Raspberry Pi deployment).
   - Hosted the project on GitHub at [https://github.com/vjeko2404/EchoLog](https://github.com/vjeko2404/EchoLog).