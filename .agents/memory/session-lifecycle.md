---
name: WhatsApp session lifecycle
description: User-requested behavior for clearing the WhatsApp session on each bot stop and start.
---

Preserve the local WhatsApp session directory across normal shutdowns, restarts, and unrelated runtime errors so the linked device remains paired. Do not automatically clear saved credentials after a "Session logged out" message or retry by creating a new pairing.

**Why:** The user's latest request is to keep WhatsApp paired across bot restarts, superseding the earlier request to clear the session every time.

**How to apply:** Keep saved session credentials on startup, graceful shutdown, and unrelated crashes. Clear them only for an explicit owner-requested pairing reset or when the credential file is invalid and cannot be parsed. If WhatsApp has actually revoked the link, report the logged-out state and require an intentional re-pair rather than silently wiping credentials.
