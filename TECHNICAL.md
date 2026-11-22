# API Pengaduan — technical notes

A JSON API for public complaints (`pengaduan`). Citizens submit complaints by IP with attachments; `petugas` and `admin` staff triage, respond to and manage them. No view engine: every data handler returns `res.json(...)`, `/` is a plain-text probe, and the only HTML is a static placeholder.

## Stack

Exact versions from lockfiles and image tags, not the manifest:

| Item | Version | Evidence |
|---|---|---|
| Express | 4.16.4 | `yarn.lock:2486-2487`; manifest `~4.16.1` at `package.json:19` |
| Sequelize | 6.12.0-alpha.1 | `yarn.lock:4748-4749` |
| pg / pg-hstore | 8.7.1 / 2.3.4 | `yarn.lock`; `package.json:24-25` |
| jsonwebtoken / bcrypt | 8.5.1 / 5.0.1 | `yarn.lock`; `package.json:14-17` |
| csurf / cookie-parser / cors | 1.11.0 / 1.4.6 / 2.8.5 | `yarn.lock`; `package.json:14-17,20` |
| multer | 1.4.4 | `yarn.lock`; `package.json:23` |
| Babel CLI / core / preset-env | 7.16.0 / 7.16.0 / 7.16.4 | `yarn.lock`; `package.json:29-34` |
| jest | 27.5.1 | `yarn.lock`; `package.json:29-34` |

The runtime is Node 24, taken from the image tags only — no JS lockfile pins a runtime version (`Dockerfile:1,9,14`; `Dockerfile:19,26`). Packages install with yarn 1.x through `corepack enable` and `yarn install --frozen-lockfile`.

Manifest versus lockfile disagreements are immaterial. A genuine defect: devDependencies list `superset` (`package.json:36`) while `test/index.test.js:3` imports `supertest`.

## Architecture

Request flow for `GET /api/v1/pengaduan/:id`:

1. Entry point `src/bin/www.js:1` builds the app and calls `http.createServer(app)` (`:79`), then `server.listen(port)` (`:85`). Compiled entry is `dist/bin/www.js`, started with `node dist/bin/www.js`.
2. Port is `process.env.PORT || "3000"` (`src/bin/www.js:72`); the container sets `PORT=8080` and `EXPOSE 8080` (`Dockerfile:19,25`).
3. Middleware runs in order (`src/app.js:10-19`): loopback `trust proxy`, `morgan` dev logger, `cors()`, `express.json()`, `urlencoded`, `cookieParser()`, then routers.
4. The whole `/api/v1` router is wrapped in `csurf({cookie:true})` (`src/routes/api.js:13,16`). Non-safe methods without a valid token get `403 {"status":false,"message":"Invalid CSRF Token"}` (`:17-21`); the token comes from `GET /api/v1/csrf-token` (`:33-41`).
5. `express.static(join(__dirname, "../public"))` is mounted at `/api/v1/public` (`src/app.js:19`); at runtime that serves `/app/public`.
6. Routing is split across `src/routes/{index,api,pengaduan,auth,petugas,admin}.js`; handlers live in `src/controller/*`.

Rendering: none. No `view engine` is set, there is no `views/` directory, and every data handler returns JSON. Background work: none — `queue_scheduler: false` and no queue files (`.opencode/inventory.json:1241-1242`).

Build: `yarn babel ./src --out-dir dist --copy-files` transpiles source into CommonJS under `dist/` (`Dockerfile:6-7`), using a generated Node-targeted `.babelrc` (see Container layout). The repo's `build` script is unusable on Linux because it runs a Windows-only `rmdir /q /s dist` (`package.json:7`). Tests import `../dist/app.js`, so a build must precede `jest` (`test/index.test.js:2-4`).

Boot behaviour: importing `src/database/models/index.js` constructs a Sequelize instance from `config.json` (`:7-21`) but issues no query. Inventory records `boot_side_effects: false`, `boot_files: []` (`.opencode/inventory.json:1243-1244`).

## Data model

Sequelize models in `src/database/models/*`, migrations in `src/database/migrations/*`; `.sequelizerc:3-7` points the CLI at `src/database/config/config.json`. Every table carries implicit `createdAt`/`updatedAt` (`models/index.js:23-41`).

| Table | Key columns | Relationships |
|---|---|---|
| `petugas` | `id`, `name`, `username`, `password`, `role` ENUM(`admin`,`operator`), timestamps | `hasMany(PengaduanTanggapan, {foreignKey:"petugasId", as:"tanggapan"})` (`Petugas.js:5-9`); default scope hides `password`, `withPassword` restores it (`Petugas.js:25-32`) |
| `jwt_tokens` | `id`, `token` TEXT, `expiredAt` BIGINT, `petugasId` INTEGER, timestamps | none declared; `petugasId` conceptually points at `petugas.id` (`JwtToken.js:6,12`; `src/routes/auth.js:23-26`) |
| `pengaduans` | `id`, `isiLaporan` TEXT, `lampiran` TEXT holding a JSON array of `{filename, location}`, timestamps | `hasOne(PengaduanDetail, {as:"detail"})` (`Pengaduan.js:6-9`); `hasMany(PengaduanTanggapan, {as:"tanggapan"})` (`:11-14`); VIRTUAL `laporan` getter truncates `isiLaporan` to 8 words (`:21-29`) |
| `pengaduan_details` | `id`, `pengaduanId` FK CASCADE, `masyarakatIp` TEXT, `status` ENUM(`belumVerif`,`proses`,`selesai`), timestamps; model adds `nama` STRING | `belongsTo(Pengaduan)` (`PengaduanDetail.js:5-9`); `nama`+`masyarakatIp` group complainants into "members" (`PetugasController.js:23-30,206-213`) |
| `pengaduan_tanggapans` | `id`, `pengaduanId` FK CASCADE, `petugasId` FK CASCADE, `tanggapan` TEXT, `detailPerubahan` STRING, `lampiran` TEXT JSON, timestamps | `belongsTo(Pengaduan, {as:"pengaduan"})` and `belongsTo(Petugas, {as:"penanggap"})` (`PengaduanTanggapan.js:5-14`) |

Gaps worth knowing:

- All five queried tables have both a migration and a model; none is queried without one.
- `pengaduan_details.nama` is used by controllers (`PetugasController.js:23-30,206-213`; `PengaduanController.js:80-86`) but its only migration, `20220114093836-alter-pengaduan-detail.js:5`, calls `queryInterface.alterTable(...)`, which is not a standard Sequelize method. Whether `nama` exists in any deployed schema is `UNKNOWN — requires human input`.
- The `test` environment uses `dialect: "mysql"` while `development` and `production` use `"postgres"` (`config.json:7,14,21`).
- `production.database` is `database_production` (`config.json:19`), unrelated to the workspace database `api-pengaduan-db`.
- Seeder `20211129061513-init-petugas.js:19-26` inserts two demo staff rows (one `admin`, one `operator`) with bcrypt password hashes. Values are not recorded here.

## Auth

JWT, signed with a hardcoded literal secret, 24-hour expiry, delivered as an httpOnly cookie named `token` and mirrored into `jwt_tokens` for server-side validation. Sign at `src/routes/auth.js:22-27`, cookie at `:28`, verify at `src/middleware/auth.js:12-16`, token-row lookup at `:13-14`. Passwords compare via bcrypt (`src/routes/auth.js:21`) and hash via bcrypt (`auth.js:75`, `AdminController.js:4-6`).

Guard `verifyToken` (`src/middleware/auth.js:3-21`): missing cookie → `403 A token is required for authentication` (`:5-10`); invalid or unknown token → `401 Invalid Token` (`:17-19`). It covers the `/petugas` and `/admin` groups (`src/routes/api.js:45-46`) and applies per route to `/auth/me`, `/auth/change_password` and `/auth/logout` (`src/routes/auth.js:45,59,86`). The loaded `petugas` object is placed on `req.petugas` (`auth.js:15`).

Role guard `hasRole(role)` (`src/middleware/role.js:1-10`) compares `req.petugas.role`; a mismatch replies `{status:false}` with HTTP 200 rather than 401/403 (`:3-7`). Used on `/admin` (`api.js:46`) and `/petugas/admin` (`petugas.js:34`).

Publicly reachable without auth: `GET /`, `GET /api/v1/`, `GET /api/v1/myip`, `GET /api/v1/csrf-token`, all five `/api/v1/pengaduan` routes, `POST /api/v1/auth/login`, and the `/api/v1/public/*` static files.

Deliberately absent: no public self-registration (staff accounts are created only by an admin via `POST /api/v1/admin` → `createOp`, `src/routes/admin.js:12`, `AdminController.js:22-52`), and no password-reset flow (only the logged-in change at `PUT /api/v1/auth/change_password`, `auth.js:59-85`).

Hardcoded credentials are referenced by file and line only; values are not recorded: `src/routes/auth.js:22`, `src/middleware/auth.js:12`, `src/database/seeders/20211129061513-init-petugas.js:9,15`, `response/index.http:9-12`, and the literal DB settings at `src/database/config/config.json:2-22`.

## External services

- Database: PostgreSQL via Sequelize `dialect: "postgres"` + `pg` 8.7.1, selected by `config.json` per `NODE_ENV` (`config.json:7,21`; consumed at `models/index.js:12-20`).
- CSRF: `csurf` 1.11.0, cookie-based token exposed as `XSRF-TOKEN` (`src/routes/api.js:13-41`).
- File storage: local disk through multer `diskStorage`; complaint attachments go to `./public/files` (`src/routes/pengaduan.js:12-23`), response attachments to `./public/lampiran` (`src/routes/petugas.js:17-28`); absolute paths are JSON-encoded into the `lampiran` TEXT columns.
- Not integrated: cache, session store (JWT + `jwt_tokens` instead), queue, mail, third-party APIs or outbound HTTP clients (`package.json:13-37`; `src/app.js:1-21`).

Env var names only: `PORT` (`src/bin/www.js:72`), `NODE_ENV` (`src/database/models/index.js:7`), `DEBUG` (`src/bin/www.js:10`; `package.json:10`). There is no `.env.example`. `config.use_env_variable` is checked (`models/index.js:12-13`) but no such key exists in `config.json`, so DB settings cannot be overridden by environment variables — they are literal per environment.

## Operational risks

- High: hardcoded JWT signing and verification secret (`src/routes/auth.js:22`, `src/middleware/auth.js:12`); anyone with source access can forge `petugas` tokens.
- High: ephemeral local uploads. Multer writes to `./public/files` (`src/routes/pengaduan.js:13`) and `./public/lampiran` (`src/routes/petugas.js:18`); both are gitignored (`.gitignore:6-7`), and the image creates only `/app/public/files` (`Dockerfile:23`), never `/app/public/lampiran`. Attachment records store absolute filesystem paths (`PengaduanController.js:69-76`, `PetugasController.js:97-99`). A pod restart or a second replica loses files while the database still references them; a volume covering both directories is required.
- Medium: DB config is literal and loopback-bound (`config.json:3-7,17-21`) with no `use_env_variable` key, so `DB_*`-style injection is ignored (`models/index.js:12-20`).
- Medium: global CSRF gate on `/api/v1` — mutating callers must implement the token handshake first (`src/routes/api.js:13-21,33-41`); the shipped examples do not (`response/index.http:1-47` sends `Authorization`, which the code ignores).
- Medium: possibly-invalid alter migration — `20220114093836-alter-pengaduan-detail.js:5` uses non-standard `queryInterface.alterTable`, and its `down` drops `pengaduan_tanggapans` (`:13`) instead of reversing the alter.
- Medium: no upload cleanup on failed transactions (`PengaduanController.js:95`, `PetugasController.js:134-137`), so orphaned files accumulate.
- Low: a NULL `isiLaporan` makes the `laporan` VIRTUAL getter throw and the affected endpoints return 500 (`src/database/models/Pengaduan.js:24`).
- Low: `hasRole` fails with HTTP 200 (`src/middleware/role.js:3-7`), so authorization failures look successful.
- Low: tests need `supertest`, which is not declared; they also expect JSON from `/` while the route sends plain text (`package.json:36`, `test/index.test.js:3,8-9` vs `src/routes/index.js:6`).
- Low: `jwt_tokens.expiredAt` is written (`src/routes/auth.js:26`) but never read for cleanup anywhere in `src/`.
- None: boot-time DB side effects, queue or scheduler usage, file-backed sessions or cache.

Above one replica: local upload directories are not shared, while `jwt_tokens` live in shared PostgreSQL, so auth itself is replica-safe. `PORT` is per container, fine behind a load balancer.

## Container layout

Serving model: one plain Node HTTP process, `http.createServer(app).listen(port)` (`src/bin/www.js:79-87`), with no nginx, FPM, supervisord or PID-1 wrapper (`Dockerfile:26`). Babel-transpiled CommonJS lives in `dist/`.

Image stages (`Dockerfile:1-26`), all `docker.io/library/node:*`:

- `build` (`:1-7`): node:24, writes a Node-targeted `.babelrc`, transpiles `src` to `dist`.
- `deps` (`:9-12`): node:24, production-only `node_modules` via `yarn install --frozen-lockfile --production`.
- `runtime` (`:14-26`): `node:24-slim` plus `curl`, non-root `USER node`, `NODE_ENV=production PORT=8080`, `EXPOSE 8080`, plain Node `CMD`.

This is one of the six never-re-render repositories. Two repo-local fixes must not be lost:

1. Node-targeted `.babelrc` rewrite at `Dockerfile:6`: overwrites the committed `.babelrc` (`.babelrc:1-5`) with `{"presets":[["@babel/preset-env",{"targets":{"node":"current"}}]]}` before `yarn babel`, otherwise the code needs browser regenerator-runtime support at Node runtime. The archived original lacks this line (`.containerize/original/Dockerfile:6`).
2. Multer upload directory at `Dockerfile:23`: `mkdir -p /app/public/files && chown -R node:node /app/public`, so the non-root `node` user can write the path hardcoded at `src/routes/pengaduan.js:13`. The archived original has no such line (`.containerize/original/Dockerfile:22`).

Related: `BUILD_CMD` in `.opencode/overrides.json:12-14` supplies `yarn babel ./src --out-dir dist --copy-files`, replacing the broken Windows `clean` script. Re-rendering from the generic `Dockerfile.node-api` template would drop both fixes and reintroduce an image `HEALTHCHECK` present in the archived template variant (`.containerize/original/Dockerfile:25`).

Smoke limitation: the DB check is skipped (`SMOKE_DB=not verified (no read-only CLI for node-api; health endpoint only)` — `.containerize/validation.env:8`), so a migrated schema is not proven at smoke time even though the workspace database `api-pengaduan-db` exists.
