## EchoLog

EchoLog is a self-hosted, role-secure project memory engine designed for engineers, tinkerers, and builders who prefer control over complexity. Developed in .NET 8 with a tightly integrated React frontend, it enables personal or small-team project tracking with full file management, detailed notes, and RBAC (Role-Based Access Control).

It’s not a PM tool. It doesn’t sync with Slack. And it won’t pretend your chaos is collaborative. EchoLog is for when the system must be yours—local, fast, traceable, and surgical.

### Key Features

**Structured Project Lifecycle**

Track systems, devices, modules, or experiments with typed status, ownership, notes, and versioned metadata.

**Role-Based Access Control (RBAC)**

Admins manage users and projects. Users own their space. Observers see everything—without touching a thing.

**Responsive UI Layer**

Tab-based navigation for summary, detail, notes, and files. Zero-fluff. Full context. Fast switching.

**Secure File Management**

Drag-and-drop multi-file uploads, metadata tagging, categorization, download (ZIP or single), and batch deletion.

**Admin Console**

Manage users, reassign project ownership, edit file categories, and live-update backend config—all via browser.

**Local-First Architecture**

SQLite as the single source of truth. No cloud. No external services. Fully offline capable.

**API Port Binding via Database**

Deployment-ready via internal AppSettings. No .env files. No container secrets.

### Tech Stack

**Backend**: .NET 8 Minimal API, SQLite, Entity Framework Core
**Frontend**: React + TypeScript + TailwindCSS
**Auth**: Local-only JWT, bcrypt-hashed credentials, role-aware claims
**Files**: Server-stored files with category mapping and access constraints
**Hosting**: Compatible with Windows, Linux, and Raspberry Pi environments

### Repository Structure

echolog
├── echolog.server         # .NET 8 Backend
│   ├── Controllers        # RESTful APIs with full RBAC
│   ├── DTOs               # Data transfer contracts
│   ├── Models             # EF Core entities
│   └── Services           # Auth, Context, File Access
│
├── echolog.client         # React Frontend
│   ├── pages              # Role-secured dashboard, admin, detail views
│   ├── components         # Tabs, file tables, forms, JWT hooks
│   └── api.ts             # Axios instance with token injection

### Roadmap

- [x] Project CRUD with ownership enforcement
- [x] Auth system with admin, user, and observer roles
- [x] File upload with drag-and-drop + metadata
- [x] Batch file download, batch deletion
- [x] Full frontend with role-reactive layout
- [x] App settings editor via UI
- [x] Admin-controlled project ownership reassignment
- [ ] Export/snapshot system (TBD)
- [ ] Audit logging layer (optional future)

### Live Preview

Note: EchoLog is designed for LAN or isolated usage. It is not intended for open/public deployment unless wrapped with external auth and proxy layers.

### Philosophy

EchoLog is not another SaaS wrapper. It doesn’t track team velocity.

It tracks projects that matter. Systems with state. Decisions with memory.

If it was once true, it should still be queryable. That’s the core.

## Documentation

- [Overview](docs/overview.md): Provides a comprehensive overview of the EchoLog system, its architecture, and core objectives.
- [Changelog](docs/changelog.md): Details the version history and significant changes made to the EchoLog project.

## License

MIT License — This software is provided "as is," and the user assumes all responsibility for its use and any modifications.

---

*Created by [Vjeko](https://github.com/vjeko2404) — born from the need to control complexity, eliminate noise, and build a personal engineering system that actually remembers what matters built for engineers who prefer memory over meetings*