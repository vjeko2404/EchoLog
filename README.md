# EchoLog

**EchoLog** is a self-hosted, low-footprint project memory engine built in .NET 8.  
It captures systems, modules, fixes, devices, and operational notes in a structured, queryable format—optimized for personal engineering workflows, not corporate bloat.

## Tech Stack

- **Backend**: .NET 8 Minimal API + SQLite
- **Frontend**: React (WIP)
- **Hosting**: Raspberry Pi / Linux / Windows compatible
- **Auth**: Local-only, role-based access (RBAC-ready)
- **Config**: Stored in DB—no `.env`, no external secrets

## Key Features

- Structured project model: types, statuses, notes, files
- Local-first: all data, including config, stored inside SQLite
- Dynamic API port config via DB (`AppSetting`)
- Optional file upload per project
- Role-based user model (`admin`, `user`, extensible)

## Roadmap

- [x] Backend model + DB architecture
- [x] Seeded roles, settings, user auth
- [ ] Project CRUD API
- [ ] Frontend UI
- [ ] Export/snapshot features
- [ ] Pi deployment script

## License
MIT License — you break it, you fix it.

---

*Created by [Vjeko](https://github.com/vjeko2404) — because every other solution was bloated, fragile, or just wrong.*
