const handler = async (m, { conn, bot }) => {
  const rawTarget = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!m.isGroup) {
    return m.reply("❌ استخدم الأمر داخل المجموعة مع منشن أو رد على رسالة الشخص.");
  }
  if (!rawTarget) {
    return m.reply("⚠️ منشن الشخص أو رد على رسالته لإضافته كمطور.");
  }

  const targetJid = rawTarget.endsWith("@lid")
    ? await m.lid2jid(rawTarget)
    : rawTarget;
  if (!targetJid) {
    return m.reply("❌ تعذر معرفة رقم الشخص. جرّب منشنه داخل المجموعة.");
  }

  const metadata = await conn.groupMetadata(m.chat);
  const participant = metadata.participants.find(
    (item) =>
      item.id === rawTarget ||
      item.id === targetJid ||
      item.phoneNumber === targetJid,
  );
  if (!participant?.phoneNumber || !participant?.id) {
    return m.reply("❌ لم أجد هذا الشخص ضمن أعضاء المجموعة.");
  }

  const owner = {
    name: "Owner",
    jid: participant.phoneNumber,
    lid: participant.id,
  };
  const persistedOwners = Array.isArray(global.db.owners) ? global.db.owners : [];
  const alreadyOwner = [...persistedOwners, ...bot.config.owners].some(
    (item) => item.jid === owner.jid || item.lid === owner.lid,
  );
  if (alreadyOwner) {
    return m.reply("ℹ️ هذا الشخص مضاف كمطور بالفعل.");
  }

  global.db.owners = [...persistedOwners, owner];
  bot.config.owners.push(owner);
  await m.reply("✅ تمت إضافة المطور وحفظه، وسيبقى بعد إعادة تشغيل البوت.");
};

handler.usage = ["اضافه-مطور"];
handler.category = "owner";
handler.command = ["ضيف_مطور", "اضافه_مطور"];
handler.group = true;
handler.owner = true;

export default handler;