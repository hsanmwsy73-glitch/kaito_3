const handler = async (m, { conn, command, text }) => {
    if (!global.db?.users[m.sender]) {
        global.db.users[m.sender] = {};
    }
    
    const user = global.db.users[m.sender];
    
    if (command === "تسجيل") {
        if (!text) {
            return m.reply(`*📝 طريقة التسجيل:*\n\nتسجيل الاسم|العمر\n\nمثال:\nتسجيل ڤينوم|20`);
        }
        
        const [name, age] = text.split('|').map(s => s.trim());
        
        if (!name || !age) {
            return m.reply(`*❌ خطأ:* يجب كتابة الاسم والعمر مفصولين بـ |\n\nمثال:\nتسجيل كايتو|20`);
        }
        
        if (isNaN(age) || age < 1 || age > 50) {
            return m.reply(`*❌ خطأ:* العمر يجب أن يكون رقماً بين 1 و 50`);
        }
        
        user.name = name;
        user.age = parseInt(age);
        
        const profilePic = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://files.catbox.moe/sm8sye.jpg');
        
        const msg = `╭─┈─┈─┈─⟞📝⟝─┈─┈─┈─╮
┃ *✅ تـم الـتـسـجـيـل بـنـجـاح*
╰─┈─┈─┈─⟞✨⟝─┈─┈─┈─╯

┃ @${m.sender.split('@')[0]}
┃ 🏷️ *الاسـم:* ${name}
┃ 📅 *الـعـمـر:* ${age} سنة

╭─┈─┈─┈─⛩️⟝─┈─┈─┈─╮
┃ *أهـلاً وسـهـلاً فـي فلمدينه* 🎭
╰─┈─┈─┈─⟞🌁⟝─┈─┈─┈─╯`;

        await conn.sendMessage(m.chat, {
            image: { url: profilePic },
            caption: msg,
            contextInfo: {
                mentionedJid: [m.sender],
                isForwarded: true,
                forwardingScore: 1,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363411379664683@newsletter',
                    newsletterName: '𝑲𝑨𝑰𝑻𝑶​│𝑩𝑳𝑶𝑫 🕷️',
                    serverMessageId: 0
                },
                externalAdReply: {
                    title: "𝑲𝑨𝑰𝑻𝑶-𝐀𝐈 ⛩️ | المدينه المحمصه ",
                    body: "تـسـجـيـل جـديـد فـي المدينه",
                    thumbnailUrl: profilePic,
                    sourceUrl: '',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: reply_status });
    }
    
    else if (command === "حذف_تسجيلي") {
        if (!user.name && !user.age) {
            return m.reply(`*❌ ليس لديك تسجيل لحذفه*\n\nاكتب .تسجيل اسم|عمر للتسجيل`);
        }
        
        delete user.name;
        delete user.age;
        
        const profilePic = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://files.catbox.moe/sm8sye.jpg');
        
        const msg = `╭─┈─┈─┈─⟞🗑️⟝─┈─┈─┈─╮
┃ *✅ تـم حـذف الـتـسـجـيـل*
╰─┈─┈─┈─⟞✨⟝─┈─┈─┈─╯

┃ @${m.sender.split('@')[0]}
┃ 🏷️ تم حذف بياناتك بنجاح

╭─┈─┈─┈─⟞⛩️⟝─┈─┈─┈─╮
┃ *يـمـكـنـك الـتـسـجـيـل مـرة أخـرى* 📝
╰─┈─┈─┈─⟞🌁⟝─┈─┈─┈─╯`;

        await conn.sendMessage(m.chat, {
            image: { url: profilePic },
            caption: msg,
            contextInfo: {
                mentionedJid: [m.sender],
                isForwarded: true,
                forwardingScore: 1,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363411379664683@newsletter',
                    newsletterName: '𝑲𝑨𝑰𝑻𝑶​│𝑩𝑳𝑶𝑫 🕷️',
                    serverMessageId: 0
                },
                externalAdReply: {
                    title: "𝑲𝑨𝑰𝑻𝑶-𝑨𝑰 ⛩️ |المدينه المحمصه ",
                    body: "تـم حـذف الـتـسـجـيـل",
                    thumbnailUrl: profilePic,
                    sourceUrl: '',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: reply_status });
    }
};

handler.usage = ["تسجيل", "حذف_تسجيلي"];
handler.category = "bank";
handler.command = ["تسجيل", "حذف_تسجيلي"];

export default handler;