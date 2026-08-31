const normalizeDigits = (value) =>
    String(value)
        .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
        .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));

const handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    if (!isOwner) {
        return m.reply('❎ هذا الأمر خاص بمالك البوت فقط.');
    }

    const rawReceiver = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!rawReceiver) {
        return m.reply(
            `❎ اذكر الشخص المُراد منحه الفلوس.\n\n` +
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

    let receiver = rawReceiver;
    if (typeof m.lid2jid === 'function') {
        receiver = (await m.lid2jid(rawReceiver)) || rawReceiver;
    }

    if (!receiver.includes('@') || receiver.endsWith('@lid')) {
        return m.reply('❎ تعذر تحديد رقم الشخص. استخدم منشن أو رد على رسالته داخل المجموعة.');
    }

    if (!global.db.users[receiver]) {
        global.db.users[receiver] = {};
    }

    const receiverData = global.db.users[receiver];
    const currentMoney = Number(receiverData.money);
    const balance = Number.isFinite(currentMoney) && currentMoney >= 0 ? currentMoney : 0;
    receiverData.money = balance + amount;

    await conn.sendMessage(
        m.chat,
        {
            text:
                `✅ تم منح @${receiver.split('@')[0]} مبلغ *${amount} فلوس* بدون خصم.\n\n` +
                `💰 رصيده الحالي: *${receiverData.money} فلوس*`,
            mentions: [receiver],
        },
        { quoted: m },
    );
};

handler.usage = ['تحويل مطور'];
handler.category = 'bank';
handler.command = ['تحويل مطور', 'تحويل_ادمن', 'اضافه_رصيد'];
handler.owner = true;
handler.group = true;

export default handler;
