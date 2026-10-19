const resolveParticipant = async (m, conn, rawTarget) => {
  if (!rawTarget) return null;
  const targetJid = rawTarget.endsWith("@lid")
    ? await m.lid2jid(rawTarget)
    : rawTarget;
  const participants = (await conn.groupMetadata(m.chat)).participants;
  return participants.find(
    (participant) =>
      participant.id === rawTarget ||
      participant.id === targetJid ||
      participant.phoneNumber === targetJid,
  ) || null;
};

const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply("❌ هذا الأمر يعمل داخل المجموعات فقط.");
  const targetLid = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!targetLid) return m.reply('⚠️ *يرجى منشن الشخص أو الرد على رسالته* ⚠️');

  const user = await resolveParticipant(m, conn, targetLid);

  if (!user) return m.reply("❌ المستخدم غير موجود في الجروب");

  const group = global.db.groups[m.chat];
  const warnings = { ...(group.warnings || {}) };
  const id = user.phoneNumber || targetLid;
  const warnCount = (Number(warnings[id]) || 0) + 1;
  warnings[id] = warnCount;
  group.warnings = warnings;

  await conn.sendMessage(m.chat, {
    text: `⚠️ تم إعطاء إنذار

👤: @${id.split("@")[0]}
📊 عدد الإنذارات: ${warnCount}`,
    mentions: [user.id || targetLid]
  }, { quoted: global.reply_status });
};

handler.before = async (m, { conn }) => {
  if (!m.isGroup || m.isAdmin || m.isOwner) return false;
  const group = global.db?.groups?.[m.chat];
  const warnings = group?.warnings;
  if (!warnings) return false;

  const userJid = m.sender?.endsWith("@lid")
    ? (await m.lid2jid(m.sender)) || m.sender
    : m.sender;
  const warningKey = Object.hasOwn(warnings, userJid)
    ? userJid
    : Object.hasOwn(warnings, m.sender)
      ? m.sender
      : null;
  if (!warningKey || Number(warnings[warningKey]) < 3) return false;

  if (Number(warnings[warningKey]) >= 3) {
    await conn.sendMessage(m.chat, {
      text: `🚫 @${userJid.split("@")[0]} انت خالفت القوانين، دلوقتي هنطردك`,
      mentions: [userJid]
    }, { quoted: global.reply_status });

    await conn.groupParticipantsUpdate(m.chat, [userJid], "remove");
    const updatedWarnings = { ...warnings };
    delete updatedWarnings[warningKey];
    group.warnings = updatedWarnings;
    return true;
  }

  return false;
};

handler.command = ["انذار", "تحذير", "warn"];
handler.usage = ['انذار'];
handler.category = "admin";
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;