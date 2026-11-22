# API Pengaduan

This is a complaint (`pengaduan`) intake and response service for the public.
A citizen lodges a complaint with a description and up to six attachments, identified only by an IP address, without creating an account.
Staff (`petugas`) review what arrives, reply, and move each complaint from `belumVerif` through `proses` to `selesai`.
Administrators manage the staff accounts.
It removes the paper-and-phone trail from lodging and following up on a public complaint.

This is an HTTP JSON service, not a website: a separate client calls it, and this repo contains no login page or dashboard.
Every write must first fetch a CSRF token from `GET /api/v1/csrf-token`.

## What you can do

- Submit a `pengaduan` with a report text and up to six attachments; it opens at `belumVerif`.
  `POST /api/v1/pengaduan`
- List the complaints tied to your own IP and name, open any one in detail, and edit or delete one you submitted.
  `GET /api/v1/pengaduan`, `GET`, `PUT` and `DELETE /api/v1/pengaduan/:id`
- Sign in as staff with a username and password and receive an httpOnly session cookie.
  `POST /api/v1/auth/login`
- Read every incoming complaint and a dashboard counting complaints, staff and distinct members.
  `GET /api/v1/petugas/pengaduan/all`, `GET /api/v1/petugas/dashboard`
- Reply to a complaint, attach files and move its status from `belumVerif` through `proses` to `selesai` in one action.
  `PUT /api/v1/petugas/pengaduan/:id`
- Revise or remove an earlier staff response and its attachments.
  `PUT` and `DELETE /api/v1/petugas/tanggapan/:id`
- Group complainants into "members" by IP and name and pull a member's complaint history.
  `GET /api/v1/petugas/members`, `GET /api/v1/petugas/members/pengaduan`
- Create, rename and remove staff accounts if you are an administrator.
  `GET`, `POST`, `PUT` and `DELETE /api/v1/admin`

## How it works

A plain Node server is the whole backend.
Its entry point `dist/bin/www.js` calls `http.createServer(app)` and listens on `process.env.PORT || 3000`, with the container setting 8080.
Source under `src/` is Babel-transpiled into CommonJS in `dist/` before launch.
Sequelize reads and writes PostgreSQL; there is no cache, queue or mail service.

Requests pass through CORS, JSON and cookie parsing, then a CSRF guard applied to the whole `/api/v1` router.
Safe GETs pass, but POST/PUT/DELETE without a valid token are rejected.
Staff sessions are JWTs delivered as an httpOnly cookie and mirrored into a `jwt_tokens` table so each request can be checked server-side.
Complaint state lives in `pengaduan_details.status`.
Attachments are stored on local disk and their paths recorded as JSON in `pengaduans.lampiran`.
There is no separate web server or client app here — Express also serves a small public folder, and every data endpoint answers with JSON.

## Running it

Install dependencies and build before starting.
The repo's `build` script contains a Windows-only `rmdir`, so use the direct Babel command the container image uses.

```
corepack enable
yarn install --frozen-lockfile
yarn babel ./src --out-dir dist --copy-files
node dist/bin/www.js
```

The process binds to port 3000 unless `PORT` is set, and a running instance answers `GET /` with the plain text `ok`.
The API lives under `/api/v1`; mutating calls must echo the `XSRF-TOKEN` cookie, obtained from `GET /api/v1/csrf-token`, as a header.
For local development the repo defines `nodemon ./src/bin/www.js --exec babel-node`.
Database settings are literal in `src/database/config/config.json`, so a PostgreSQL database matching them must exist — there is no environment-variable override.

## Limitations

- Citizens are identified by client IP and a supplied name rather than an account (`src/controller/PengaduanController.js:12-25`); people behind a shared or NAT connection cannot be told apart.
- The database name (`src/database/config/config.json:5,19`) and JWT signing secret (`src/routes/auth.js:22`, `src/middleware/auth.js:12`) are hardcoded in source rather than read from the environment; no values are given here.
- `jwt_tokens.expiredAt` is written (`src/routes/auth.js:26`) but nothing in `src/` removes expired token rows.
- Attachments land in `/app/public/files` and `/app/public/lampiran` (`src/routes/pengaduan.js:13`, `src/routes/petugas.js:18`); both need a persistent volume or uploads vanish on restart.
- The dedicated status-change endpoint is deprecated and always returns failure (`src/routes/petugas.js:41-51`), but it is still present and may have live callers; status changes go through the response route instead.
- The `nama` column used to group complainants is declared in the model but its only alter migration is non-standard; whether it exists in a deployed database is `UNKNOWN — requires human input`.
- Staff logins come from a seeder that inserts two demo accounts; a fresh database has none until that seeder is run.

Developer notes, exact versions, the data model, and operational risks are in [TECHNICAL.md](TECHNICAL.md).
