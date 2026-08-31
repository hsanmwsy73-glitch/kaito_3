export default async function before(m, { conn }) {
    if (!global.db?.users[m.sender]) return false;
    
    const user = global.db.users[m.sender];
    let xp = user.xp || 0;
    let level = user.level || 0;
    let nameLevel = user.nameLevel || '⛩️ مواطن';
    
    const levels = [
        { min: 0, max: 99, name: '🎪 ' },
        { min: 100, max: 249, name: '🎭 متدرب سيرك' },
        { min: 250, max: 499, name: '🤡 مهرج صغير' },
        { min: 500, max: 799, name: '🎪 لاعب أكروبات' },
        { min: 800, max: 1199, name: '🎭 ساحر مبتدئ' },
        { min: 1200, max: 1699, name: '🤹 لاعب نار' },
        { min: 1700, max: 2299, name: '🎪 مروض أسود' },
        { min: 2300, max: 2999, name: '🎭 ساحر الظل' },
        { min: 3000, max: 3799, name: '🤡 مهرج الأكاذيب' },
        { min: 3800, max: 4699, name: '🎪 نجم السيرك' },
        { min: 4700, max: 5699, name: '🎭 وهمي' },
        { min: 5700, max: 6799, name: '🤹 سيد الألعاب' },
        { min: 6800, max: 7999, name: '🎪 مدير الحلبة' },
        { min: 8000, max: 9299, name: '🎭 أسطورة السيرك' },
        { min: 9300, max: 10699, name: '🤡 كابوس المهرج' },
        { min: 10700, max: 12199, name: '🎪 ساحر الأوهام' },
        { min: 12200, max: 13799, name: '🎭 مخرج العجائب' },
        { min: 13800, max: 15499, name: '🤹 سيد الخواتم' },
        { min: 15500, max: 17499, name: '🎪 إمبراطور السيرك' },
        { min: 17500, max: 19999, name: '🎭 حارس البوابة' },
        { min: 20000, max: Infinity, name: '🌀 الرقمي الأوحد' }
    ];
    
    let newLevel = level;
    let newNameLevel = nameLevel;
    let levelUp = false;
    let oldLevel = level;
    
    for (const lvl of levels) {
        if (xp >= lvl.min && xp <= lvl.max) {
            const currentLevelNum = levels.findIndex(l => l.min === lvl.min);
            if (currentLevelNum !== level) {
                newLevel = currentLevelNum;
                newNameLevel = lvl.name;
                levelUp = true;
                oldLevel = level;
            }
            break;
        }
    }
    
    if (levelUp) {
        user.level = newLevel;
        user.nameLevel = newNameLevel;
        
        const msg = `╭─┈─┈─┈─⟞🎪⟝─┈─┈─┈─╮
┃ *🎭 تـرقـيـة فـي الـسـيـرك 🎪*
╰─┈─┈─┈─⟞🎭⟝─┈─┈─┈─╯

┃ @${m.sender.split('@')[0]}
┃ المستوى السابق: *${oldLevel}*
┃ المستوى الجديد: *${newLevel}*

┃ 🏷️ *لقبك الجديد:*
┃ ✦ ${newNameLevel} ✦

╭─┈─┈─┈─⟞🎭⟝─┈─┈─┈─╮
┃ *العرض لسه مخلصش يا بطل* 🎪
╰─┈─┈─┈─⟞🤡⟝─┈─┈─┈─╯`;
        
        await conn.sendMessage(m.chat, {
            text: msg,
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
                    title: "𝑲𝑨𝑰𝑻𝑶-𝑨𝑰 🎪 | السيرك الرقمي",
                    body: "تـرقـيـة فـي الـسـيـرك",
                    thumbnailUrl: "https://files.catbox.moe/sm8sye.jpg",
                    sourceUrl: '',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: reply_status });
    }
    
    return false;
}