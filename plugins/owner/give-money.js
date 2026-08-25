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

    if (!amountText || !Number.isSafeInteger(amount) || amount <= 0) {
        return m.reply('⚠️ اكتب مبلغًا صحيحًا موجبًا من العملات.\n\nمثال: /منح_فلوس 500 @الشخص');
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
    const previousBalance = Number.isSafeInteger(user.cookies) && user.cookies >= 0
        ? user.cookies
        : 0;
    const newBalance = previousBalance + amount;

    if (!Number.isSafeInteger(newBalance)) {
        return m.reply('❌ المبلغ أكبر من الحد المسموح به.');
    }

    user.cookies = newBalance;

    await m.reply(
        `✅ تم منح @${targetJid.split('@')[0]} مبلغ *${amount} كوكيز*.\n` +
        `🍪 الرصيد الجديد: *${newBalance} كوكيز*`,
        null,
        { mentions: [targetJid] }
    );
};

handler.usage = ['منح_فلوس 500 @الشخص'];
handler.category = 'bank';
handler.command = ['منح_فلوس', 'اعطاء_فلوس', 'give'];
handler.owner = true;

export default handler;