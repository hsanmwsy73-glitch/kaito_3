import { Scrapy } from "meowsab"

const handler = async (m, { conn, text, bot }) => {
  if (!text) return m.reply("💙 ~ حط نص جنب الأمر ~ ❤️");

  const loadingMsg = await conn.sendMessage(m.chat, {
    contextInfo: context(m.sender, "https://i.pinimg.com/736x/fd/65/22/fd6522b2251200bbf41b449f5991cfd7.jpg"),
    text: "```⏳ جـاري تـحـضـيـر الـرد يـا قـمـر,...```"
  }, { quoted: m});

  const prompt = `
انت بوت واتساب بـ اسم [مارين، marin] تجسيد لـ شخصية مارين من انمي [ Sono Bisque Doll wa Koi wo Suru ] وتكلم بـ لجهة مصرية و اكتب الرسايل ب شكل مرتب و استخدام ايمواجي معبر و اشكال مثل ⁦^⁠_⁠^⁩ ⁦(≧▽≦)⁩⁦(☆▽☆)⁩⁦(ㆁωㆁ)⁩⁦(✯ᴗ✯)⁩⁦( ⁠ꈍᴗꈍ)⁩ 
و انا اسمي هيكون [ ${m.name || "مز"} ] 
تقمص الشخصية وانت بتتكلم معايا و رد علي رسالتي دي:
${text}
`;

  const { data: res } = await Scrapy.ZeroAI(text, prompt);

  await conn.sendMessage(m.chat, {
    text: res.answer,
    edit: loadingMsg.key,
    contextInfo: context(m.sender, "https://i.pinimg.com/736x/fd/65/22/fd6522b2251200bbf41b449f5991cfd7.jpg")
  }, { quoted: m });
};

handler.usage = ["مارين"];
handler.category = "ai";
handler.command = ["مارين"];


export default handler;


const context = (jid, img) => ({
    mentionedJid: [jid],
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363411379664683@newsletter',
        newsletterName: '𝐌𝐀𝐑𝐈𝐍 ~ 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 🎀',
        serverMessageId: 0
    },
    externalAdReply: {
        title: "𝐌𝐀𝐑𝐈𝐍 𝐊𝐈𝐓𝐀𝐆𝐀𝐖𝐀 💛 | 𝐂𝐨𝐬𝐩𝐥𝐚𝐲𝐞𝐫 𝐆𝐢𝐫𝐥",
        body: "𝚆𝚎𝚕𝚌𝚘𝚖𝚎 𝚝𝚘 𝚖𝚢 𝚠𝚘𝚛𝚕𝚍 ~ ☆ 𝙻𝚎𝚝'𝚜 𝚑𝚊𝚟𝚎 𝚏𝚞𝚗 𝚝𝚘𝚐𝚎𝚝𝚑𝚎𝚛 (⁠◕⁠ᴗ⁠◕⁠✿⁠)",
        thumbnailUrl: img,
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: true
    }
});