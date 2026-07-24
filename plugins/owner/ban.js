import fs from 'fs';
import path from 'path';

const ff = async (m, { conn, text, command }) => {
    let target = m.mentionedJid?.[0] || m.quoted?.sender;
    
    if (!target && text?.includes('@')) {
        target = text.replace('@', '') + '@s.whatsapp.net';
    }
    
    if (!target) {
        return m.reply(`*~ 💙 منشن شخص مثل /${command} @${m.sender.split('@')[0]} ❤️ ~*`);
    }
    
    const jid = await m.lid2jid(target);
    const user = global.db.users[jid] || {};
    
    const isUnban = command === "فك_تشفير" || command === "فك_التشفير";
    
    if (isUnban) {
        if (user.banned) {
            delete user.banned;
            await conn.sendMessage(m.chat, { 
                text: `*✅ ~الغاء فك تشفيرو @${target.split('@')[0]}*\n> *_دلوقت يقدر يكلم البوت عادي_*`, 
                mentions: [target] 
            });
        } else {
            m.reply(`*❌ ~هذا المستخدم ليس مشفر*`);
        }
        return;
    }
    
    user.banned = true;
    await conn.sendMessage(m.chat, { 
        text: `*✅ ~ تم تشفيرو  @${target.split('@')[0]}*\n> *_مش هيعرف يكلم البوت تاني_*`, 
        mentions: [target] 
    });
};

ff.usage = ["فك_تشفير", "تشفير"];
ff.category = "owner";
ff.command = ["فك_تشفير", "فك_التشفير", "تشفير"];
ff.owner = true;

export default ff;