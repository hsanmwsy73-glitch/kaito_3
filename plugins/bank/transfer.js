const normalizeDigits = (value) =>
    String(value)
        .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
        .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));

const getJid = async (m, jid) => {
    if (jid && jid.endsWith('@lid') && typeof m.lid2jid === 'function') {
        return (await m.lid2jid(jid)) || jid;
    }
    return jid;
};

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const rawReceiver = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!rawReceiver) {
        return m.reply(
            `❎ اذكر الشخص المُراد التحويل له.\n\n` +
            `مثال:\n${usedPrefix}${command} @الشخص 1000`
        );
    }

    const amountToken = args
        ?.map((arg) => normalizeDigits(arg).replace(/,/g, ''))
        .find((arg) => /^\d+$/.test(arg));
    const amount = Number(amountToken);

    if (!amountToken || !Number.isInteger(amount) || !Number.isFinite(amount) || amount <= 0) {
        return m.reply(
            `❎ اكتب مبلغًا صحيحًا موجبًا.\n\n` +
            `مثال:\n${usedPrefix}${command} @الشخص 1000`
        );
    }

    const sender = await getJid(m, m.sender);
    const receiver = await getJid(m, rawReceiver);

    if (!sender || !receiver || sender === receiver) {
        return m.reply('❎ لا يمكنك تحويل الفلوس لنفسك.');
    }

    if (!sender.includes('@') || !receiver.includes('@') || receiver.endsWith('@lid')) {
        return m.reply('❎ تعذر تحديد رقم الشخص. استخدم منشن أو رد على رسالته داخل المجموعة.');
    }

    if (!global.db.users[sender]) {
        global.db.users[sender] = {};
    }
    if (!global.db.users[receiver]) {
        global.db.users[receiver] = {};
    }

    const senderData = global.db.users[sender];
    const receiverData = global.db.users[receiver];
    const senderBalance = Number(senderData.money);
    const receiverBalance = Number(receiverData.money);
    const currentSenderBalance =
        Number.isFinite(senderBalance) && senderBalance >= 0 ? senderBalance : 0;
    const currentReceiverBalance =
        Number.isFinite(receiverBalance) && receiverBalance >= 0 ? receiverBalance : 0;

    if (currentSenderBalance < amount) {
        return m.reply(
            `❎ رصيدك غير كافٍ.\n` +
            `💰 رصيدك الحالي: *${currentSenderBalance} فلوس*`
        );
    }

    senderData.money = currentSenderBalance - amount;
    receiverData.money = currentReceiverBalance + amount;

    await conn.sendMessage(
        m.chat,
        {
            text:
                `✅ تم التحويل بنجاح.\n\n` +
                `💸 المبلغ: *${amount} فلوس*\n` +
                `📥 إلى: @${receiver.split('@')[0]}\n` +
                `💰 رصيدك الحالي: *${senderData.money} فلوس*`,
            mentions: [sender, receiver],
        },
        { quoted: m },
    );
};

handler.usage = ['تحويل @الشخص 1000'];
handler.category = 'bank';
handler.command = ['تحويل', 'حول'];
handler.group = true;

export default handler;