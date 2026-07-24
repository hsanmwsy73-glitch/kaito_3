import { Scrapy } from "meowsab";

const handler = async (m, { conn, command, text }) => {
  if (!text) throw '*❲ ❤️ ❳ ~ حط رابط جنب الامر ~ ❲ 💙 ❳ *';
  
  if (!text.match(/youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\//)) {
    throw '*❌ ~ الرابط مش صحيح ~ حط رابط يوتيوب صحيح*';
  }
  
  const isAudio = command === "يوت_اغنيه" || command === "ytmp3";
  const res = await (isAudio ? Scrapy.ytmp3(text) : Scrapy.ytmp4(text));
  
  if (!res?.status) throw '❌ فشل في جلب البيانات من الرابط';
  
  const type = isAudio ? 'اغـانـي' : 'فيـديـوز';
  let caption = `*🐞 YouTube | يـوتـيـوب ${type} 🐞*\n\n`;
  caption += `╭─┈─┈─┈─⟞🍧⟝─┈─┈─┈─╮\n`;
  caption += `*❲ 📽️ ❳ الـعـنـون:* ${res.title}\n`;
  caption += `*❲ 📢 ❳ الـقـنـاة:* ${res.channel}\n`;
  caption += `*❲ ⏳ ❳ الـجـوده:* ${res.quality}\n`;
  caption += `╰─┈─┈─┈─⟞🍬⟝─┈─┈─┈─╯\n`;
  caption += `> _*❲ ⏱️ ❳ الرجاء الانتظار قليلاً...*_`;
  
  await conn.sendMessage(m.chat, { 
    text: caption,
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
        title: res.title,
        body: res.channel,
        thumbnailUrl: res.thumbnail,
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  });
  
  await conn.sendMessage(m.chat, isAudio ? { 
    audio: { url: res.downloadUrl }, 
    mimetype: 'audio/mpeg',
    fileName: res.filename
  } : { 
    video: { url: res.downloadUrl }, 
    caption: `*${res.title}*`
  }, { quoted: m });
};

handler.usage = ["يوتيوب", "يوت_اغنيه"];
handler.category = "downloads";
handler.command = ['يوت_اغنيه', 'يوتيوب', "ytmp3", "ytmp4"];

export default handler;