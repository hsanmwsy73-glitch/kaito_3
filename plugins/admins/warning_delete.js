const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply("❌ هذا الأمر يعمل داخل المجموعات فقط.");
  const targetLid = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!targetLid) return m.reply('⚠️ *يرجى منشن الشخص أو الرد على رسالته* ⚠️');

  const targetJid = targetLid.endsWith("@lid")
    ? await m.lid2jid(targetLid)
    : targetLid;
  const user = (await conn.groupMetadata(m.chat)).participants.find(
    (participant) =>
      participant.id === targetLid ||
      participant.id === targetJid ||
      participant.phoneNumber === targetJid,
  );

  if (!user) return m.reply("❌ المستخدم غير موجود في الجروب");

  const group = global.db.groups[m.chat];
  const warnings = { ...(group.warnings || {}) };
  const id = user.phoneNumber || targetLid;
  const currentWarn = Number(warnings[id]) || 0;

  if (currentWarn === 0) {
    return await conn.sendMessage(m.chat, {
      text: `ℹ️ @${id.split("@")[0]} ليس لديه أي إنذارات لحذفها.`,
      mentions: [user.id || targetLid]
    }, { quoted: m });
  }

  const newWarn = currentWarn - 1;
  
  if (newWarn === 0) {
    delete warnings[id];
  } else {
    warnings[id] = newWarn;
  }
  group.warnings = warnings;

  await conn.sendMessage(m.chat, {
    text: `✅ *تم حذف إنذار واحد*

👤: @${id.split("@")[0]}
📊 عدد الإنذارات المتبقي: ${newWarn}`,
    mentions: [user.id || targetLid]
  }, { quoted: m });
};

handler.command = ["حذف_انذار", "حذف_الانذار"];
handler.usage = ['حذف_انذار @مستخدم', 'حذف_الانذار @مستخدم'];
handler.category = "admin";
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;