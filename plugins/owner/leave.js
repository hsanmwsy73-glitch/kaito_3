const handler = async (m, { conn, isOwner }) => {
  // التأكد من أن المستخدم هو المطور
  if (!isOwner) {
    return m.reply("❌ هذا الأمر فقط للمطور");
  }

  // التأكد من أن البوت في مجموعة
  if (!m.isGroup) {
    return m.reply("❌ أنا مش في مجموعة");
  }

  // الخروج من المجموعة
  const groupName = await conn.getName(m.chat);
  await m.reply(`👋 *مع السلامة*\nخرجت من مجموعة *${groupName}*`);

  setTimeout(async () => {
    await conn.groupLeave(m.chat);
  }, 1000);
};

handler.usage = ["اخرج"];
handler.category = "group";
handler.command = ["اخرج"];
handler.owner = true;
handler.group = true;

export default handler;