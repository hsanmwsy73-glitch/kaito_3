const run = async (m, { conn, bot }) => {
  const sub = global.subBots;
  if (!sub) return m.reply("❌ نـظـام الـبـوتـات الـفـرعـيـه غير متاح");

  const bots = sub.list();
  if (bots.length === 0) return m.reply("📭 لا يوجد بوتات فرعية مثبتة");

  let text = `🤖⤿ الـبـوتـات الـفـرعـيـه 
*╮┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ـ*\n`;
  
  const mentions = [];
  
  bots.forEach((b, i) => {
    const jid = b.phone ? `${b.phone}@s.whatsapp.net` : null;
    if (jid) mentions.push(jid);
    
    text += `🫒 *#${i+1}* \n`;
    text += `📱 — الرقم: ${jid ? `@${b.phone}` : b.phone || 'غير معروف'}\n`;
    text += `📍 — الحالة: ${b.connected ? '🟢 متصل' : '🔴 غير متصل'}\n`;
    text += `📨 — الرسائل: ${b.messages || 0}\n`;
    text += `🆔 — الايدي: ${b.id}\n`;
    text += `╯┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ـ\n`;
  });
  
  text += `\n> *_✓ الـمـجـمـوع: ${bots.length}_*`;

  const { images } = bot.config.info;
  const img = images?.[Math.floor(Math.random() * images.length)] || "https://files.catbox.moe/ym6n3g.jpg";

  await conn.sendMessage(m.chat, {
    text: text,
    mentions: mentions,
    contextInfo: {
      externalAdReply: {
        title: "𝑲𝑨𝑰𝑻𝑶-𝑨𝑰 🎪 | 𝐁𝐨𝐭 𝐢𝐬 𝐛𝐮𝐢𝐥𝐭 𝐨𝐧 𝐭𝐡𝐞 𝐖𝐒/𝐕𝐈𝐈 𝐟𝐫𝐚𝐦𝐞𝐰𝐨𝐫𝐤",
        body: "𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙 𝚋𝚘𝚝 𝚝𝚑𝚊𝚝 𝚒𝚜 𝚎𝚊𝚜𝚢 𝚝𝚘 𝚖𝚘𝚍𝚒𝚏𝚢 𝚊𝚗𝚍 𝚟𝚎𝚛𝚢 𝚏𝚊𝚜𝚝",
        thumbnailUrl: img,
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
};

run.command = ["البوتات", "bots"];
run.noSub = true;
run.usage =  ["تنصيب"];
run.category = "البوتات";
run.owner = true;
export default run;