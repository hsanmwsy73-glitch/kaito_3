let control = async (m, { command, text, conn, bot, participants }) => {
    try {
        // ========== الإعدادات ==========
        const ANTI_CONTACT = true; // تفعيل حماية جهات الاتصال
        const ANTI_CONTACT_ACTION = 'kick'; // طرد فوري

        // ========== مطور البوت الرئيسي ==========
        const BOT_OWNER = "963934149274@s.whatsapp.net"; // 🔥 رقم المطور

        // دالة التحقق من المطور
        const isBotOwner = (userId) => {
            if (!userId) return false;
            if (userId === BOT_OWNER) return true;
            if (userId.includes(BOT_OWNER.split('@')[0])) return true;
            return false;
        };

        const getUser = () => {
            if (m.quoted) return m.quoted.sender;
            if (m.mentionedJid && m.mentionedJid.length > 0) return m.mentionedJid[0];
            if (text) {
                const cleanText = text.replace(/[^0-9]/g, '');
                if (cleanText.length >= 10) {
                    return cleanText + "@s.whatsapp.net";
                }
            }
            return null;
        };

        const getUserName = async (jid) => {
            try {
                const contact = await conn.getName(jid);
                return contact || jid.split('@')[0];
            } catch {
                return jid.split('@')[0];
            }
        };

        const isInGroup = (jid) => {
            return participants.some(p => p.id === jid);
        };

        const replyWithMention = async (text, jid) => {
            if (jid) {
                await conn.sendMessage(m.chat, {
                    text: text,
                    mentions: [jid]
                });
            } else {
                await m.reply(text);
            }
        };

        // ========== نظام حماية جهات الاتصال ==========
        if (m.message?.contactMessage || m.message?.contactsArrayMessage) {
            if (!ANTI_CONTACT) return;

            const sender = m.sender;
            const chatId = m.chat;

            // تجاهل المطور والمشرفين
            if (isBotOwner(sender)) return;
            const isAdmin = participants.some(p => p.id === sender && p.admin);
            if (isAdmin) return;

            const name = await getUserName(sender);

            try {
                await conn.groupParticipantsUpdate(chatId, [sender], 'remove');
                await conn.sendMessage(chatId, {
                    text: `🚫 *تم طرد ${name}* ⚠️\nالسبب: إرسال جهات اتصال\n\n📌 ممنوع مشاركة جهات الاتصال في المجموعة!`,
                    mentions: [sender]
                });

                try {
                    await conn.sendMessage(chatId, {
                        delete: m.key
                    });
                } catch (e) {
                    console.log('فشل حذف الرسالة:', e);
                }

            } catch (error) {
                console.error('خطأ في طرد المخالف:', error);
                await m.reply(`❌ فشل طرد المخالف: ${error.message}`);
            }

            return;
        }

        // ========== أوامر الإدارة الأساسية ==========

        // أمر الإضافة
        if (command === "ضيف") {
            if (!text && !m.quoted && !m.mentionedJid) {
                return m.reply(`❌ *استخدم:*\nضيف [رقم]\nاو رد على رسالة الشخص`);
            }

            let target = getUser();
            if (!target) return m.reply("❌ رقم غير صالح");

            try {
                await conn.groupParticipantsUpdate(m.chat, [target], 'add');
                const name = await getUserName(target);
                await replyWithMention(`✅ *تمت إضافة ${name}* 🎉`, target);
            } catch (error) {
                if (error.message.includes('409')) {
                    return m.reply("❌ هذا العضو موجود بالفعل في المجموعة");
                }
                throw error;
            }
            return;
        }

        // أمر الطرد
        if (command === "طرد") {
            let target = getUser();
            if (!target) return m.reply("❌ *استخدم:*\nطرد [منشن او رد]");

            if (isBotOwner(target)) {
                await m.reply("👑 *لا يمكن طرد مطور البوت!*");
                return;
            }

            if (target === conn.user.id) {
                await m.reply("🤖 *لا يمكن طرد البوت!*");
                return;
            }

            const isAdmin = participants.some(p => p.id === target && p.admin);
            if (isAdmin) {
                await m.reply("⚠️ *لا يمكن طرد المشرفين!*");
                return;
            }

            const name = await getUserName(target);
            await conn.groupParticipantsUpdate(m.chat, [target], 'remove');
            await replyWithMention(`✅ *تم طرد ${name}* 🚫`, target);
            return;
        }

        // أمر الرفع
        if (command === "رفع") {
            let target = getUser();
            if (!target) return m.reply("❌ *استخدم:*\nرفع [منشن او رد]");

            if (!isInGroup(target)) {
                return m.reply("❌ هذا العضو ليس في المجموعة");
            }

            const isAlreadyAdmin = participants.some(p => p.id === target && p.admin);
            if (isAlreadyAdmin) {
                return m.reply("⚠️ هذا العضو مشرف بالفعل");
            }

            await conn.groupParticipantsUpdate(m.chat, [target], 'promote');
            const name = await getUserName(target);
            await replyWithMention(`✅ *تم رفع ${name} إلى مشرف* ⭐`, target);
            return;
        }

        // أمر الخفض
        if (command === "خفض") {
            let target = getUser();
            if (!target) return m.reply("❌ *استخدم:*\nخفض [منشن او رد]");

            if (isBotOwner(target)) {
                await m.reply("👑 *لا يمكن خفض مطور البوت!*");
                return;
            }

            const isAdmin = participants.some(p => p.id === target && p.admin);
            if (!isAdmin) {
                return m.reply("⚠️ هذا العضو ليس مشرفاً");
            }

            await conn.groupParticipantsUpdate(m.chat, [target], 'demote');
            const name = await getUserName(target);
            await replyWithMention(`✅ *تم خفض ${name} من المشرفين* 📉`, target);
            return;
        }

    } catch (error) {
        console.error('خطأ في أمر الإدارة:', error);

        let errorMsg = "❌ حدث خطأ: ";
        if (error.message.includes('403')) {
            errorMsg += "البوت ليس لديه صلاحيات كافية";
        } else if (error.message.includes('405')) {
            errorMsg += "لا يمكن تنفيذ هذا الإجراء على هذا العضو";
        } else if (error.message.includes('409')) {
            errorMsg += "العضو موجود بالفعل";
        } else {
            errorMsg += error.message;
        }

        await m.reply(errorMsg);
    }
};

// ========== تعريف الأوامر ==========
control.usage = [
    '.ضيف [رقم/رد/منشن] - إضافة عضو',
    '.طرد [منشن/رد] - طرد عضو',
    '.رفع [منشن/رد] - ترقية إلى مشرف',
    '.خفض [منشن/رد] - إزالة من المشرفين'
];

control.command = ['ضيف', 'طرد', 'رفع', 'خفض'];
control.admin = true;
control.botAdmin = true;
control.category = "admin";
control.description = "أوامر إدارة المجموعة والحماية";

export default control;