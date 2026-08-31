const handler = async (m) => {
    // أمر بسيط يوريك حالة مضاد الروابط بالقروب الحالي
    const g = global.db?.groups?.[m.chat];
    const status = g?.antiLink ? "✅ مفعّل" : "❌ متوقف";
    return m.reply(`🔗 حالة مضاد الروابط بهالقروب: ${status}`);
};

handler.before = async (m, { conn, bot }) => {
    try {
        const chatId = m.chat;
        const isGroup = typeof chatId === 'string' && chatId.endsWith('@g.us');
        if (!isGroup) return false;

        const g = global.db?.groups?.[chatId];
        if (!g?.antiLink) return false;

        if (m.isOwner || m.isAdmin) return false;

        const groupLinkRegex = /(https?:\/\/)?(chat\.whatsapp\.com|whatsapp\.com\/channel)\/[A-Za-z0-9]+/gi;

        if (m.text && groupLinkRegex.test(m.text)) {
            try {
                await m.delete();
            } catch (delErr) {
                console.error('[anti-link] فشل حذف الرسالة:', delErr.message);
            }

            try {
                await m.reply(
                    `🚫 *تم حذف الرابط*\n\n@${m.sender.split('@')[0]} ممنوع نشر روابط الجروبات أو القنوات\n\n> يرجى الالتزام بقوانين المجموعة`,
                    { mentions: [m.sender] },
                );
            } catch (sendErr) {
                console.error('[anti-link] فشل إرسال رسالة التنبيه:', sendErr.message);
            }

            return true;
        }

        return false;
    } catch (err) {
        console.error('[anti-link] خطأ غير متوقع:', err.message);
        return false;
    }
};

handler.command = ["حالة_مضاد_الروابط"];
handler.category = "admin";
handler.usage = ["حالة_مضاد_الروابط"];

export default handler;
