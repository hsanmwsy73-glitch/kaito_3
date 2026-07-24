const cooldown = new Map();

const handler = async (m, { conn }) => {
    const target = await m.lid2jid(m.quoted?.sender) || m.mentionedJid?.[0];
    
    if (!target) return m.reply(`*🕊️ رد على رسالة العضو أو منشن العضو*\nمثال: .سرقة @user`);
    if (target === m.sender) return m.reply(`*❌ لا يمكنك سرقة نفسك*`);
    
    const userTarget = global.db?.users[target];
    if (!userTarget?.xp) return m.reply(`*❌ هذا العضو ليس لديه نقاط*`);
    if (userTarget.xp < 50) return m.reply(`*🤲 حرام ده فقير! عنده بس ${userTarget.xp} نقطة*\n> خليه يجمع شوية الأول`);
    
    const now = Date.now();
    const lastSteal = cooldown.get(m.sender) || 0;
    if (now - lastSteal < 3600000) {
        const remaining = Math.ceil((3600000 - (now - lastSteal)) / 60000);
        return m.reply(`*⏳ انتظر ${remaining} دقيقة قبل السرقة مرة أخرى*`);
    }
    
    const userSender = global.db.users[m.sender] || {};
    const stealAmount = Math.floor(Math.random() * 201) + 100;
    const success = Math.random() < 0.7;
    
    cooldown.set(m.sender, now);
    
    if (!success) {
        const penalty = Math.floor(stealAmount / 2);
        userSender.xp = Math.max(0, (userSender.xp || 0) - penalty);
        const pic = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://files.catbox.moe/sm8sye.jpg');
        await conn.sendMessage(m.chat, {
            image: { url: pic },
            caption: `╭─┈─┈─⟞🚨⟝─┈─┈─╮
┃ ❌ فـشـلـت الـسـرقـة
╰─┈─┈─⟞💔⟝─┈─┈─╯

┃ @${m.sender.split('@')[0]}
┃ 😭 تم اكتشافك!
┃ 💸 خسرت ${penalty} نقطة

╭─┈─┈─⟞🎪⟝─┈─┈─╮
┃ *حـاول بـعـد سـاعـة* ⏳
╰─┈─┈─⟞🤡⟝─┈─┈─╯`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: reply_status });
        return;
    }
    
    if (userTarget.xp < stealAmount) {
        const available = userTarget.xp;
        userSender.xp = (userSender.xp || 0) + available;
        userTarget.xp = 0;
        const pic = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://files.catbox.moe/sm8sye.jpg');
        await conn.sendMessage(m.chat, {
            image: { url: pic },
            caption: `╭─┈─┈─⟞💰⟝─┈─┈─╮
┃ ✅ نـجـحـت الـسـرقـة
╰─┈─┈─⟞✨⟝─┈─┈─╯

┃ @${m.sender.split('@')[0]}
┃ سرقت من @${target.split('@')[0]}
┃ 💰 +${available} نقطة
┃ ⚠️ سلبته كل اللي عنده!

╭─┈─┈─⟞🎪⟝─┈─┈─╮
┃ *اسـتـمـر ولا تـتـوقـف* 🔥
╰─┈─┈─⟞🤡⟝─┈─┈─╯`,
            contextInfo: { mentionedJid: [m.sender, target] }
        }, { quoted: reply_status });
        return;
    }
    
    userTarget.xp -= stealAmount;
    userSender.xp = (userSender.xp || 0) + stealAmount;
    
    const pic = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://files.catbox.moe/sm8sye.jpg');
    await conn.sendMessage(m.chat, {
        image: { url: pic },
        caption: `╭─┈─┈─⟞💰⟝─┈─┈─╮
┃ ✅ نـجـحـت الـسـرقـة
╰─┈─┈─⟞✨⟝─┈─┈─╯

┃ @${m.sender.split('@')[0]}
┃ سرقت من @${target.split('@')[0]}
┃ 💰 +${stealAmount} نقطة

╭─┈─┈─⟞🎪⟝─┈─┈─╮
┃ *اسـتـمـر ولا تـتـوقـف* 🔥
╰─┈─┈─⟞🤡⟝─┈─┈─╯`,
        contextInfo: { mentionedJid: [m.sender, target] }
    }, { quoted: reply_status });
};

handler.usage = ["سرقة"];
handler.category = "games";
handler.command = ["سرقة", "steal"];

export default handler;