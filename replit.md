# Pomni AI — WhatsApp Bot

A WhatsApp bot built on the MeowSab framework. It connects via pairing code, serves commands to users, and includes a web dashboard for monitoring status.

## Running the bot

```bash
npm start
```

The dashboard runs on port 5000.

## Configuration

Environment variables can be set in Replit's Secrets panel (or in a local `.env` file — see `.env.example`).

| Variable | Default | Description |
|---|---|---|
| `MAX_REPAIR_ATTEMPTS` | `3` | How many times the bot will automatically re-pair after a "Session logged out" event before giving up. Increase for flaky networks; decrease for strict environments. |

## User preferences

<!-- Record explicit user preferences here -->
