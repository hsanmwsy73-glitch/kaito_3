const handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('❌ ~ هذا الأمر يعمل فقط  المجموعات');

    const jid = m.chat;
    await m.reply(`🆔 *Group JID*\n\n\`\`\`${jid}\`\`\``);
};

handler.command = ["jid", "id", "groupid"];
handler.category = "tools";
handler.usage = ["jid"];
handler.group = true;

export default handler;
