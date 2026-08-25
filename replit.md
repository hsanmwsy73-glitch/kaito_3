# KAITO BOT  — WhatsApp Bot

A WhatsApp bot built on the MeowSab framework (Node.js ESM). It supports group management, entertainment, AI, media downloading, and sub-bot management.

## Running the project

```
npm start
```

The bot starts and prints a pairing code. Open WhatsApp → Linked Devices → Link a Device, then enter the code.

A web dashboard is served on port 3000 showing live connection status and the pairing code.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the dashboard listens on |
| `MAX_REPAIR_ATTEMPTS` | `3` | How many times to auto-retry after a session logout before giving up |

## Key files

- `index.js` — entry point; starts dashboard, bot client, and sub-bots
- `dashboard.js` — Express server with SSE-based live status page
- `plugins/` — all bot commands, organized by category
- `system/control.js` — group event handler and access-control messaging
- `system/UltraDB.js` — simple JSON database wrapper
- `sub.js` — sub-bot management with per-bot error isolation and reconnect backoff
- `scripts/post-merge.sh` — runs `npm install` after every task merge

## User preferences

- Keep Arabic reply messages consistent with existing plugin style
- Owner commands use `handler.owner = true`
- All new plugins go in the appropriate `plugins/<category>/` subdirectory
