async function handler(m, { conn, command, args }) {
    const chatId = m.chat;
    const subCmd = args[0]?.toLowerCase();
    const isGroup = typeof chatId === 'string' && chatId.endsWith('@g.us');

    const groupOnlySubCommands = [
        'ايقاف_الترحيب', 'تشغيل_الترحيب',
        'تشغيل_الادمن', 'ايقاف_الادمن',
        'تشغيل_مضاد_الروابط', 'ايقاف_مضاد_الروابط',
    ];

    if (subCmd && groupOnlySubCommands.includes(subCmd) && !isGroup) {
        return m.reply('*❌ هذا الأمر يشتغل بس داخل القروبات*\n> جرّبه داخل قروب فيه البوت، مو هنا');
    }

    if (isGroup) {
        try {
            if (!global.db.groups) global.db.groups = {};
            if (!global.db.groups[chatId]) global.db.groups[chatId] = {};
        } catch (dbErr) {
            console.error('[settings] فشل تهيئة قاعدة بيانات القروب:', dbErr.message);
            return m.reply('*❌ صار خطأ بقاعدة البيانات، حاول مرة ثانية بعد شوي*');
        }
    }

    const g = isGroup ? global.db.groups[chatId] : {};
    const welcomeOn = !g?.noWelcome;
    const adminOn = !!g?.adminOnly;
    const antiLinkOn = !!g?.antiLink;
    const devOn = !!global.db.dev;
    const ownerOnlyOn = !!global.db.ownerOnly;

    const status = (on) => on ? "✅" : "❌";

    const menu = `
╭─┈─┈─┈─⟞🕸️⟝─┈─┈─┈─╮
│ *نظام التفعيل والتشغيل*
│
│ ${status(welcomeOn)} *الترحيب بالأعضاء*
│ *.تفعيل ايقاف_الترحيب* / *.تفعيل تشغيل_الترحيب*
│
│ ${status(adminOn)} *وضع المشرفين فقط*
│ *.تفعيل تشغيل_الادمن* / *.تفعيل ايقاف_الادمن*
│
│ ${status(ownerOnlyOn)} *وضع المطور فقط (عام)*
│ *.تفعيل مطور_فقط* / *.تفعيل مطور_عام*
│
│ ${status(antiLinkOn)} *مضاد الروابط*
│ *.تفعيل تشغيل_مضاد_الروابط* / *.تفعيل ايقاف_مضاد_الروابط*
│
│ ${status(devOn)} *الخاص للمطورين فقط*
│ *.تفعيل ايقاف_خاص* / *.تفعيل تشغيل_خاص*
╰─┈─┈─┈─⟞🕸️⟝─┈─┈─┈─╯
`;
    if (!subCmd) {
        await conn.sendButton(m.chat, {
            bodyText:  menu,
            footerText: "𝑲𝑨𝑰𝑻𝑶​│𝑩𝑳𝑶𝑫 🕷️",
            buttons: [
    { name: "quick_reply", params: { display_text: "🪐 ايقاف التنصيب (البوتات الفرعي)", id: ".تفعيل ايقاف_الفرعي" } },
    { name: "quick_reply", params: { display_text: "🚀 تشغيل التنصيب", id: ".تفعيل تشغيل_الفرعي" } },
    { name: "quick_reply", params: { display_text: "🔇 ايقاف الترحيب", id: ".تفعيل ايقاف_الترحيب" } },
    { name: "quick_reply", params: { display_text: "🔊 تشغيل الترحيب", id: ".تفعيل تشغيل_الترحيب" } },
    { name: "quick_reply", params: { display_text: "👑 تشغيل الادمن", id: ".تفعيل تشغيل_الادمن" } },
    { name: "quick_reply", params: { display_text: "👥 ايقاف الادمن", id: ".تفعيل ايقاف_الادمن" } },
    { name: "quick_reply", params: { display_text: "⭐ مطور فقط", id: ".تفعيل مطور_فقط" } },
    { name: "quick_reply", params: { display_text: "🌍 مطور عام", id: ".تفعيل مطور_عام" } },
    { name: "quick_reply", params: { display_text: "🚫 تشغيل مضاد الروابط", id: ".تفعيل تشغيل_مضاد_الروابط" } },
    { name: "quick_reply", params: { display_text: "✅ ايقاف مضاد الروابط", id: ".تفعيل ايقاف_مضاد_الروابط" } },
    { name: "quick_reply", params: { display_text: "🌟 تشغيل خاص لـ المطورين فقط", id: ".تفعيل ايقاف_خاص" } },
    { name: "quick_reply", params: { display_text: "💔 ايقاف التشغيل خاص لـ المطورين فقط", id: ".تفعيل تشغيل_خاص" } }
],
          mentions: [m.sender],
  newsletter: {
      name: '𝑲𝑨𝑰𝑻𝑶​│𝑩𝑳𝑶𝑫 🕷️',
      jid: '120363411379664683@newsletter'
    },
  interactiveConfig: {
    buttons_limits: 1, // لازم تبقي واحد
    list_title: "Available Options",
    button_title: "Click Here",
    canonical_url: "https://example.com"
  }
        }, m);
        return;
    }

    let result;
    
    switch (subCmd) {
    case 'ايقاف_الفرعي':
            if (!m.isOwner) {
                result = '*❌ الأمر ده بس لـ المطور*';
                break;
            }
            global.db.noSub = true;
            result = '*✅ تم ايقاف تنصيب البوتات الفرعيه*\n> ماحدش هيعرف يستخدم امر تنصيب تاني';
            break;
            
        case 'تشغيل_الفرعي':
            if (!m.isOwner) {
                result = '*❌ الأمر ده بس لـ المطور*';
                break;
            }
            global.db.noSub = false;
            result = '*✅ تم تشغيل تنصيب البوتات الفرعيه*\n> دلوقتي الكل يقدر يستخدم البوتات الفرعيه';
            break;
        case 'ايقاف_الترحيب':
            if (!m.isOwner && !m.isAdmin) {
                result = '*❌ هذا الأمر للمشرفين فقط*';
                break;
            }
            global.db.groups[chatId].noWelcome = true;
            result = '*✅ تم تفعيل وضع عدم الترحيب*\n> البوت هيبطل يرحب بالاعضاء';
            break;
            
        case 'تشغيل_الترحيب':
            if (!m.isOwner && !m.isAdmin) {
                result = '*❌ هذا الأمر للمشرفين فقط*';
                break;
            }
            global.db.groups[chatId].noWelcome = false;
            result = '*✅ تم تفعيل وضع الترحيب*\n> البوت يرحب بالاعضاء';
            break;
            
        case 'تشغيل_الادمن':
            if (!m.isOwner && !m.isAdmin) {
                result = '*❌ هذا الأمر للمشرفين فقط*';
                break;
            }
            global.db.groups[chatId].adminOnly = true;
            result = '*✅ تم تفعيل وضع الادمن*\n> البوت سيتفاعل مع المشرفين فقط';
            break;
            
        case 'ايقاف_الادمن':
            if (!m.isOwner && !m.isAdmin) {
                result = '*❌ هذا الأمر للمشرفين فقط*';
                break;
            }
            global.db.groups[chatId].adminOnly = false;
            result = '*✅ تم فك وضع الادمن*\n> البوت سيتفاعل مع جميع الأعضاء';
            break;
            
        case 'مطور_فقط':
            if (!m.isOwner) {
                result = '*❌ هذا الأمر للمطور فقط*';
                break;
            }
            global.db.ownerOnly = true;
            result = '*✅ تم تفعيل وضع المطور فقط*\n> البوت سيتفاعل مع المطورين فقط';
            break;
            
        case 'مطور_عام':
            if (!m.isOwner) {
                result = '❌ هذا الأمر* للمطور فقط ';
                break;
            }
            global.db.ownerOnly = false;
            result = '*✅ تم تفعيل وضع المطور العام*\n> البوت سيتفاعل مع الجميع';
            break;
            
        case 'تشغيل_مضاد_الروابط':
            if (!m.isOwner && !m.isAdmin) {
                result = '*❌ هذا الأمر للمشرفين فقط*';
                break;
            }
            global.db.groups[chatId].antiLink = true;
            result = '*✅ تم تفعيل مضاد الروابط*\n> البوت هيحذف أي رابط';
            break;
            
        case 'ايقاف_مضاد_الروابط':
            if (!m.isOwner && !m.isAdmin) {
                result = '*❌ هذا الأمر للمشرفين فقط*';
                break;
            }
            global.db.groups[chatId].antiLink = false;
            result = '*✅ تم ايقاف مضاد الروابط*\n> البوت مايحذفش الروابط';
            break;
            case 'ايقاف_خاص':
            if (!m.isOwner) {
                result = '*❌ هذا الأمر للمطورين فقط*';
                break;
            }
            global.db.dev = true;
            result = '*✅ تم ايقاف الخاص للمستخدمين*\n> فقط المطورين يقدروا يستحدموه خاص';
            break;
            case 'تشغيل_خاص':
            if (!m.isOwner) {
                result = '*❌ هذا الأمر للمطورين فقط*';
                break;
            }
            global.db.dev = false;
            result = '*✅ تم تشغيل البوت خاص ل الكل*\n> كله دلوقت يقدر يستخدم البوت خاص';
            break;
        default:
            return m.reply("╭─┈─┈─┈─⟞🕸️⟝─┈─┈─┈─╮\n│ *نظام التفعيل والتشغيل*\n│\n│ 🔇 ايقاف_الترحيب\n│ 🔊 تشغيل_الترحيب\n│ 👑 تشغيل_الادمن\n│ 👥 ايقاف_الادمن\n│ ⭐ مطور_فقط\n│ 🌍 مطور_عام\n│ 🚫 تشغيل_مضاد_الروابط\n│ ✅ ايقاف_مضاد_الروابط\n╰─┈─┈─┈─⟞🕸️⟝─┈─┈─┈─╮\n");
    }
    
    if (result) {
        m.reply(result);
    }
};

handler.usage = ['تفعيل'];
handler.category = 'admin';
handler.command = ['تفعيل'];

export default handler;
