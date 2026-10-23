const isOwner = (userId, bot) => bot.config?.owners?.some(o => o.jid === userId || o.lid === userId);

const resolveJid = async (m, jid) => {
    if (!jid) return null;
    if (jid.endsWith('@lid') && typeof m.lid2jid === 'function') {
        return (await m.lid2jid(jid)) || jid;
    }
    return jid;
};

const handler = async (m, { conn, command, bot }) => {
    let target = await resolveJid(m, m.mentionedJid?.[0] || m.quoted?.sender);

    if (!target) return m.reply(`*🔇 كتم/فك_كتم @user*\nاو رد على رسالته`);
    if (typeof target !== 'string') return m.reply(`*❌ حدث خطأ في تحديد المستخدم*`);
    if (isOwner(target, bot)) return m.reply(`*❌ لا يمكن كتم المطور*`);

    const group = global.db.groups[m.chat] ||= {};
    const muteList = group.mute ||= [];

    let isMuted = false;
    for (let i = 0; i < muteList.length; i++) {
        if (muteList[i] === target) {
            isMuted = true;
            break;
        }
    }

    if (command === "كتم") {
        if (isMuted) {
            await conn.sendMessage(m.chat, { text: `*❌ @${target.split('@')[0]} مكتوم*`, mentions: [target] });
            return;
        }
        // Assign a new array so UltraDB's group proxy persists the mutation.
        group.mute = [...muteList, target];

        const executor = m.pushName || 'المشرف';
        const member = target.split('@')[0];

        await conn.sendMessage(m.chat, {
            text: `*〘 تـم كـتـم الـعـضـو 🔇 ۪ ۫۫ 〙*
*˚.𖦹 ⋅━ׄ━ׄ━ׄ━ׄ┄ׅ━ׄ ˹🪷˼‏ ━ׄ┄ׅ━ׄ━ׄ━ׄ━ׄ⋅ 𖦹.˚*

*🝮︎︎︎︎︎︎︎ الـمـنـفـذ ˼‏👤˹ ⇣*
* *•「 ${executor} 」•*

*🝮︎︎︎︎︎︎︎ الـعـضـو ˼‏👤˹ ⇣*
* *•「 @${member} 」•*

*🝮︎︎︎︎︎︎︎ مـده الـكـتـم ˼‏⏱️˹ ⇣*
* *•「 دائـم 」•*

*˚.𖦹 ⋅━ׄ━ׄ━ׄ━ׄ┄ׅ━ׄ ˹🪷˼‏ ━ׄ┄ׅ━ׄ━ׄ━ׄ━ׄ⋅ 𖦹.˚*

* *♢ •┆˹🪸╵ \`KAITO\`╷⇊˼*`,
            mentions: [target]
        }, { quoted: m });

    } else if (command === "فك_كتم") {
        if (!isMuted) {
            await conn.sendMessage(m.chat, { text: `*❌ @${target.split('@')[0]} ليس مكتوماً*`, mentions: [target] });
            return;
        }
        let newList = [];
        for (let i = 0; i < muteList.length; i++) {
            if (muteList[i] !== target) {
                newList.push(muteList[i]);
            }
        }
        group.mute = newList;
        await conn.sendMessage(m.chat, { text: `*✅ تم فك كتم @${target.split('@')[0]}*\n🔓 يمكنه الكلام الآن`, mentions: [target] });
    }
};

handler.before = async (m, { conn, bot }) => {
    if (!m.isGroup) return;
    if (m.isOwner || m.isAdmin || isOwner(m.sender, bot)) return;

    const muteList = global.db?.groups[m.chat]?.mute;
    if (!muteList) return;
    if (muteList.length === 0) return;

    const sender = await resolveJid(m, m.sender);
    const isMuted = muteList.includes(sender) || muteList.includes(m.sender);

    if (isMuted) {
        try {
            await m.delete();
        } catch (err) {
            console.error('[mute] فشل حذف رسالة المكتوم:', err.message);
        }
        return true;
    }
};

handler.command = ["كتم", "فك_كتم"];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;