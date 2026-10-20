---
name: WhatsApp session lifecycle
description: User-requested behavior for clearing the WhatsApp session on each bot stop and start.
---

The project must delete and recreate the local WhatsApp session directory both during graceful shutdown and before every process startup. Each launch intentionally requires a fresh WhatsApp pairing; do not preserve session credentials across restarts.

**Why:** The user explicitly requested a clean session whenever the bot is stopped and started.

**How to apply:** Keep session removal before `client.start()` and in shutdown signal handlers. `meowsab` registers SIGINT/SIGTERM listeners in its Client constructor that exit after cleanup, so prepend the app's synchronous session-removal listener to ensure it runs first. If startup removal fails, stop rather than silently connecting with old credentials.
