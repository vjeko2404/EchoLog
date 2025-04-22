# EchoLog

**EchoLog** is a self-hosted, low-footprint project memory engine developed using .NET 8. It is designed to capture and organize critical information related to systems, modules, fixes, devices, and operational notes in a structured and queryable format. Unlike conventional, feature-heavy project management tools, EchoLog is specifically optimized for personal engineering workflows, prioritizing efficiency and control.

## Key Features

- **Structured Project Model:** Organizes projects with defined types, statuses, associated notes, and file attachments.
- **Local-First Architecture:** All application data, including configuration, is persistently stored within a local SQLite database, ensuring data privacy and portability.
- **Dynamic API Port Configuration:** The API port can be configured directly through the database (`AppSetting`), eliminating the need for external configuration files or secret management.
- **Optional File Upload:** Enables the attachment of relevant files to individual projects for comprehensive documentation.
- **Role-Based Access Control (RBAC):** Implements a local-only user authentication system with predefined roles (`admin`, `user`, extensible) to manage access levels.

## Tech Stack

- **Backend:** .NET 8 Minimal API + SQLite for robust and efficient data management.
- **Frontend:** React (Work in Progress) for a dynamic and responsive user interface.
- **Hosting Compatibility:** Designed for deployment on various platforms, including Raspberry Pi, Linux, and Windows.
- **Authentication:** Local user management with role-based access control, ensuring secure access to project data.
- **Configuration:** Database-driven configuration via the `AppSetting` entity, simplifying deployment and management.

## Roadmap

- [x] Backend model and database architecture established.
- [x] Core user roles, application settings, and user authentication implemented.
- [ ] Development of Project CRUD (Create, Read, Update, Delete) API endpoints.
- [ ] Creation of the frontend user interface using React.
- [ ] Implementation of export and snapshot features for data backup and sharing.
- [ ] Development of a deployment script optimized for Raspberry Pi environments.

## Documentation

- [Overview](docs/overview.md): Provides a comprehensive overview of the EchoLog system, its architecture, and core objectives.
- [Changelog](docs/changelog.md): Details the version history and significant changes made to the EchoLog project.

## License

MIT License — This software is provided "as is," and the user assumes all responsibility for its use and any modifications.

---

*Created by [Vjeko](https://github.com/vjeko2404) — motivated by the need for a streamlined and focused solution for personal engineering knowledge management.*