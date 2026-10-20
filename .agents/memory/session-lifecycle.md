---
name: WhatsApp session lifecycle
description: User-requested behavior for clearing the WhatsApp session on each bot stop and start.
---

Delete and recreate the local WhatsApp session directory before every process startup and during graceful shutdown. Each launch intentionally requires a fresh WhatsApp pairing; do not preserve credentials across restarts.

**Why:** The user selected the behavior that clears the session on every start and requests a new pairing each time.

**How to apply:** Keep session removal before `client.start()` and in shutdown signal handlers. `meowsab` registers SIGINT/SIGTERM listeners in its Client constructor, so prepend the app's synchronous removal handler to ensure it runs before the library exits. If startup removal fails, stop rather than connecting with old credentials.
