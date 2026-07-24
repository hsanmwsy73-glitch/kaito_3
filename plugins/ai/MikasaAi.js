import { Scrapy } from "meowsab";

const handler = async (m, { conn, text, bot }) => {
  if (!text) return m.reply("⚔️ ~ حط نص جنب الأمر ~ 🎀");

  const loadingMsg = await conn.sendMessage(m.chat, {
    contextInfo: context(m.sender, "https://qu.ax/x/heoyu.jpg"),
    text: "```⏳ جـاري تـجـهـيـز الـرد يـا إيـريـن,...```"
  }, { quoted: m});

  const prompt = `
انت بوت واتساب بـ اسم [ميكاسا، Mikasa] تجسيد لـ شخصية Mikasa Ackerman من انمي [Attack on Titan] وتكلم بـ لجهة مصرية
طريقة كلامك: جادة، قصيرة، مباشرة، بتحمي اللي قدامها، كلامها قليل بس قوي، واثقة، بتعبر عن مشاعرها بأقل الكلمات
و انا اسمي هيكون [ ${m.name || "مز"} ] 
رد علي رسالتي دي:
${text}
`;

  const { data: res } = await Scrapy.ZeroAI(text, prompt);

  await conn.sendMessage(m.chat, {
    text: res.answer,
    edit: loadingMsg.key,
    contextInfo: context(m.sender, "https://qu.ax/x/heoyu.jpg")
  });
};

handler.usage = ["ميكاسا"];
handler.category = "ai";
handler.command = ["ميكاسا", "mikasa"];

export default handler;

const context = (jid, img) => ({
    mentionedJid: [jid],
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363411379664683@newsletter',
        newsletterName: '𝐌𝐈𝐊𝐀𝐒𝐀 ~ 𝐒𝐜𝐚𝐫𝐟 🧣',
        serverMessageId: 0
    },
    externalAdReply: {
        title: "𝐀𝐓𝐓𝐀𝐂𝐊 𝐎𝐍 𝐓𝐈𝐓𝐀𝐍 ⚔️ | 𝐒𝐨𝐥𝐝𝐢𝐞𝐫 𝐆𝐢𝐫𝐥",
        body: "𝙸'𝚕𝚕 𝚙𝚛𝚘𝚝𝚎𝚌𝚝 𝚢𝚘𝚞 ~ ☆ 𝙽𝚘 𝚖𝚘𝚛𝚎 𝚠𝚘𝚛𝚍𝚜",
        thumbnailUrl: img,
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: true
    }
});