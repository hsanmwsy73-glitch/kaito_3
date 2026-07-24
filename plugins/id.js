// ==========================================
// 📋 أمر نسخ ID المحادثة
// ==========================================

const handler = async (m) => {
    await m.reply(`📋 *ID المحادثة*\n\n${m.chat}\n\n✅ تم النسخ`);
};

handler.command = ["نسخ"];
export default handler;