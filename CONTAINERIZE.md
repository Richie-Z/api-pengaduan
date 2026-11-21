# CONTAINERIZE - Solo/api-pengaduan

Archetype: node-api. Generated 2026-11-20T22:42:20+07:00 by .opencode/scripts/render.sh on branch chore/containerize (uncommitted).

## Generated files
- Dockerfile (template: Dockerfile.node-api)
- Jenkinsfile (CI only; parameters REGISTRY, HARBOR_PROJECT, HARBOR_CRED_ID)
- .dockerignore

## Local run
```sh
bash .opencode/scripts/build.sh Solo/api-pengaduan
bash .opencode/scripts/smoke.sh Solo/api-pengaduan
```
Manual run: podman run --rm --network=host --env-file /home/richie/Documents/Programming/Projects/.smoke.env -e PORT=<free-port> containerize/api-pengaduan:local

## Required env var NAMES (values never stored here)
unknown - inspect app config (do not print secret values)

## DB smoke
eligible for read-only DB check (needs per-repo DB_DATABASE in overrides.json smoke section). db_driver: pgsql. Never migrate/seed/modify; DBs are live.

## Flags
- render override applied: BUILD_CMD (from overrides.json)
- agent label 'node' unverified on k3s Jenkins (only bun/buildah proven by BenchCheck) - confirm with user

Smoke results: 2026-11-21T02:21:09+07:00 boot=PASS http=200 db=not verified (no read-only CLI for node-api; health endpoint only)
Smoke results: 2026-11-21T15:05:18+07:00 boot=PASS http=200 db=not verified (no read-only CLI for node-api; health endpoint only)
Smoke results: 2026-11-21T21:32:38+07:00 boot=PASS http=200 db=not verified (no read-only CLI for node-api; health endpoint only)
