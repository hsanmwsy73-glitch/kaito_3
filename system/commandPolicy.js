export async function commandPolicyMiddleware(message, next) {
    if (message.isOwner) {
        await next();
        return;
    }

    const db = globalThis.db;
    let user = db?.users?.[message.sender];

    if (
        !user &&
        message.isGroup &&
        message.sender?.endsWith('@lid') &&
        typeof message.lid2jid === 'function'
    ) {
        const jid = await message.lid2jid(message.sender);
        if (jid) user = db?.users?.[jid];
    }

    const group = message.isGroup ? db?.groups?.[message.chat] : undefined;
    const isBlocked =
        user?.banned ||
        (group?.adminOnly && !message.isAdmin) ||
        (db?.dev && !message.isGroup) ||
        db?.ownerOnly;

    if (!isBlocked) {
        await next();
    }
}
