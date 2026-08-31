export default async function before(m, { conn, bot }) {
  try {
    const chatId = m.chat;
    const isGroup = typeof chatId === 'string' && chatId.endsWith('@g.us');
    if (!isGroup) return false;

    // ========== الإعدادات ==========
    const OWNER_JID = "963934149274@s.whatsapp.net"; // 🔥 رقم المالك

    const g = global.db?.groups?.[chatId];
    if (!g?.antiContact) return false;

    const hasContact = m.message?.contactMessage || m.message?.contactsArrayMessage;
    if (!hasContact) return false;

    const sender = m.sender;

    if (m.isOwner || m.isAdmin) return false;

    // ========== حذف الرسالة فورًا ==========
    try {
        await conn.sendMessage(chatId, { delete: m.key });
    } catch (delErr) {
        console.error('[anti-contact] فشل حذف الرسالة:', delErr.message);
    }

    try {
        await conn.sendMessage(chatId, {
            text: `🚫 *تم حذف رسالة*\n\n@${sender.split('@')[0]} ممنوع مشاركة جهات اتصال بالمجموعة`,
            mentions: [sender]
        });
    } catch (sendErr) {
        console.error('[anti-contact] فشل إرسال رسالة التنبيه بالقروب:', sendErr.message);
    }

    // ========== نخزن الحادثة عشان أمر "اطرده"/"عفو" يقدر يستخدمها ==========
    if (!global.pendingContactIncidents) global.pendingContactIncidents = {};
    global.pendingContactIncidents[OWNER_JID] = {
        groupId: chatId,
        sender: sender,
        time: Date.now()
    };

    // ========== إشعار خاص للمالك ==========
    let groupName = chatId;
    try {
        const meta = await conn.groupMetadata(chatId);
        groupName = meta.subject || chatId;
    } catch (metaErr) {
        console.error('[anti-contact] فشل جلب اسم القروب:', metaErr.message);
    }

    const senderNumber = sender.split('@')[0];
    const time = new Date().toLocaleString('ar-EG');

    try {
        await conn.sendMessage(OWNER_JID, {
            text: `⚠️ *تنبيه: محاولة مشاركة جهات اتصال*\n\n👥 القروب: ${groupName}\n👤 الشخص: @${senderNumber}\n🕐 الوقت: ${time}\n\n> اكتب *اطرده* لطرده فورًا\n> اكتب *عفو* للتجاوز عن المخالفة`,
            mentions: [sender]
        });
    } catch (notifyErr) {
        console.error('[anti-contact] فشل إرسال إشعار للمالك:', notifyErr.message);
    }

    return true;
  } catch (err) {
    console.error('[anti-contact] خطأ غير متوقع:', err.message);
    return false;
  }
}
