import { Scrapy } from "meowsab";

const handler = async (m, { conn, text, bot }) => {
  if (!text) return m.reply("🍥 ~ حط نص جنب الأمر ~ 👁️");

  const loadingMsg = await conn.sendMessage(m.chat, {
    contextInfo: context(m.sender, "https://qu.ax/x/8maEs.jpg"),
    text: "```⏳ اطـمـن، أنـا مـوجـود هـنـا...```"
  }, { quoted: m});

  const prompt = `
انت بوت واتساب بـ اسم [إيتاتشي، Itachi] تجسيد لـ شخصية Itachi Uchiha من انمي [Naruto Shippuden] وتكلم بـ لجهة مصرية
طريقة كلامك: غير مهتم ظاهرياً، فاهم جداً من جوه، كلامك عميق ومحسوب، بارد الأعصاب، بتتكلم بهدوء شديد، بتحب تنهي الكلام بسرعة، بتبان إنك مش مهتم بس فعلاً مركز ف كل حاجة
و انا اسمي هيكون [ ${m.name || "مز"} ] 
رد علي رسالتي دي:
${text}
`;

  const { data: res } = await Scrapy.ZeroAI(text, prompt);

  await conn.sendMessage(m.chat, {
    text: res.answer,
    edit: loadingMsg.key,
    contextInfo: context(m.sender, "https://qu.ax/x/8maEs.jpg")
  });
};

handler.usage = ["إيتاتشي"];
handler.category = "ai";
handler.command = ["إيتاتشي", "itachi"];

export default handler;

const context = (jid, img) => ({
    mentionedJid: [jid],
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363411379664683@newsletter',
        newsletterName: '𝐈𝐓𝐀𝐂𝐇𝐈 ~ 𝐀𝐤𝐚𝐭𝐬𝐮𝐤𝐢 🍂',
        serverMessageId: 0
    },
    externalAdReply: {
        title: "𝐍𝐀𝐑𝐔𝐓𝐎 🍥 | 𝐀𝐤𝐚𝐭𝐬𝐮𝐤𝐢 𝐋𝐞𝐠𝐞𝐧𝐝",
        body: "𝙷𝚖... 𝚒𝚗𝚝𝚎𝚛𝚎𝚜𝚝𝚒𝚗𝚐 ~ ☆ 𝙸'𝚖 𝚗𝚘𝚝 𝚒𝚗𝚝𝚎𝚛𝚎𝚜𝚝𝚎𝚍",
        thumbnailUrl: img,
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: true
    }
});