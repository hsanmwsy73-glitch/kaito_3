// ==========================================
// 🛡️ حماية جهات الاتصال
// ==========================================

let active = {};

const handler = async (m, { command, isAdmin }) => {
    if (!isAdmin) return m.reply("للمشرفين");

    if (command === "احمي") {
        active[m.chat] = true;
        m.reply("✅ تم التفعيل");
    } else {
        active[m.chat] = false;
        m.reply("❌ تم الإيقاف");
    }
};

handler.command = ["احمي", "وقف"];

// ===== الكشف =====
const before = async (m, { conn }) => {
    if (!active[m.chat]) return;
    if (!m.message?.contactMessage && !m.message?.contactsArrayMessage) return;

    try {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        await conn.groupSettingUpdate(m.chat, 'announcement');
        await conn.sendMessage(m.chat, { delete: m.key });

        setTimeout(async () => {
            await conn.groupSettingUpdate(m.chat, 'not_announcement');
        }, 30000);
    } catch (e) {
        console.log(e.message);
    }
};

export default handler;
export { before };