const handler = async (m, { conn }) => {
  if (!m.isGroup) {
    return m.reply("❌ استخدم الأمر داخل مجموعة فقط.");
  }

  if (!m.isBotAdmin) {
    return m.reply("❌ لازم يكون البوت مشرفًا في المجموعة حتى يرفعك.");
  }

  if (m.isAdmin) {
    return m.reply("✅ أنت مشرف بالفعل في هذه المجموعة.");
  }

  try {
    const result = await conn.groupParticipantsUpdate(
      m.chat,
      [m.sender],
      "promote",
    );

    const failed = Array.isArray(result)
      ? result.find(
          (entry) =>
            entry?.status && ![200, "200"].includes(entry.status),
        )
      : null;
    if (failed) {
      const status = String(failed.status);
      const reason = String(failed.message || failed.error || "");
      if (status === "403" || /forbidden|not.?authorized/i.test(reason)) {
        throw new Error("forbidden");
      }
      throw new Error(reason || `WhatsApp returned status ${status}.`);
    }

    return m.reply("*تم رفعك ادمن يا مطوري 🌹⁦(⁠≧⁠▽⁠≦⁠)⁩*");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[owner/I'm_admin] Promotion failed:", errorMessage);

    if (/forbidden|403|not.?authorized/i.test(errorMessage)) {
      return m.reply(
        "❌ رفض واتساب ترقية العضو. تأكد أن البوت مشرف وأن حسابك ما زال عضوًا في المجموعة.",
      );
    }

    return m.reply(`❌ فشل رفعك إلى مشرف: ${errorMessage}`);
  }
};

handler.usage = ["ا"];
handler.category = "owner";
handler.command = ["ا"];
handler.owner = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
 