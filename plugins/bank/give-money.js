const handler = async (m, { text }) => {
    const amountText = text?.trim()?.split(/\s+/)[0]?.replace(/,/g, '');
    const amount = Number(amountText);
    const target = m.mentionedJid?.[0] || m.quoted?.sender;

    if (!target) {
        return m.reply(
            '⚠️ منشن الشخص أو رد على رسالته.\n\n' +
            'مثال: /منح_فلوس 500 @الشخص'
        );
    }

    if (!amountText || !Number.isInteger(amount) || !Number.isFinite(amount) || amount <= 0) {
        return m.reply(
            '⚠️ اكتب مبلغًا صحيحًا موجبًا من الفلوس.\n\n' +
            'مثال: /منح_فلوس 500 @الشخص'
        );
    }

    let targetJid = target;
    if (typeof m.lid2jid === 'function') {
        try {
            targetJid = m.lid2jid(target) || target;
        } catch {
            targetJid = target;
        }
    }

    if (!global.db.users[targetJid]) {
        global.db.users[targetJid] = {};
    }

    const user = global.db.users[targetJid];
    const previousBalance = Number.isFinite(Number(user.money)) && Number(user.money) >= 0
        ? Number(user.money)
        : 0;
    const newBalance = previousBalance + amount;

    user.money = newBalance;

    await m.reply(
        `✅ تم منح @${targetJid.split('@')[0]} مبلغ *${amount} فلوس*.\n` +
        `💰 الرصيد الجديد: *${newBalance} فلوس*`,
        null,
        { mentions: [targetJid] }
    );
};

handler.usage = ['منح_فلوس 500 @الشخص'];
handler.category = 'bank';
handler.command = ['منح_فلوس', 'اعطاء_فلوس', 'give'];
handler.owner = true;

export default handler;