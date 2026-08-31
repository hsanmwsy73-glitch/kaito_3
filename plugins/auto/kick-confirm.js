const handler = async (m, { conn, command }) => {
    // ✅ الأمر يشتغل بس بالخاص، ومن المالك نفسه
    if (m.isGroup) return; // نتجاهله لو انكتب بقروب
    if (!m.isOwner) return m.reply('❌ هذا الأمر للمطور فقط');

    const OWNER_JID = m.sender; // المرسل نفسه بالخاص

    const incident = global.pendingContactIncidents?.[OWNER_JID];
    if (!incident) {
        return m.reply('ℹ️ ما فيه حادثة معلقة حاليًا');
    }

    // ========== عفو: نلغي الحادثة بدون أي إجراء ==========
    if (command === 'عفو') {
        delete global.pendingContactIncidents[OWNER_JID];
        return m.reply(`✅ تم العفو عن @${incident.sender.split('@')[0]}، ما راح يصير أي إجراء`);
    }

    // ========== اطرده ==========
    if (command === 'اطرده') {
        // ✅ الحادثة تنتهي صلاحيتها بعد 30 دقيقة تفاديًا لطرد شخص غلط بعد وقت طويل
        const THIRTY_MIN = 30 * 60 * 1000;
        if (Date.now() - incident.time > THIRTY_MIN) {
            delete global.pendingContactIncidents[OWNER_JID];
            return m.reply('⌛ انتهت صلاحية هالحادثة (مر أكثر من 30 دقيقة)، ما راح أطرد حد');
        }

        try {
            await conn.groupParticipantsUpdate(incident.groupId, [incident.sender], 'remove');

            await conn.sendMessage(incident.groupId, {
                text: `🚫 تم طرد @${incident.sender.split('@')[0]} من المجموعة`,
                mentions: [incident.sender]
            });

            await m.reply(`✅ تم طرد @${incident.sender.split('@')[0]} بنجاح`);

            delete global.pendingContactIncidents[OWNER_JID];
        } catch (err) {
            console.error('[اطرده] خطأ أثناء الطرد:', err.message);
            m.reply(`❌ فشل الطرد: ${err.message}`);
        }
    }
};

handler.command = ['اطرده', 'عفو'];
handler.usage = ['اطرده', 'عفو'];
handler.category = 'admin';

export default handler;
