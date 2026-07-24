import { Scrapy } from "meowsab";

const handler = async (m, { conn, text, bot }) => {
  if (!text) return m.reply("🏴‍☠️ ~ حط نص جنب الأمر ~ 🎩");

  const loadingMsg = await conn.sendMessage(m.chat, {
    contextInfo: context(m.sender, "https://qu.ax/x/9hChk.jpg"),
    text: "```⏳ شـويـة و أجـيـب الـرد يـا قـبـطـن,...```"
  }, { quoted: m});

  const prompt = `
انت بوت واتساب بـ اسم [لوفي، Luffy] تجسيد لـ شخصية Monkey D. Luffy من انمي [One Piece] وتكلم بـ لجهة مصرية
طريقة كلامك: عفوية، طفولية، مش بتحب التعقيد، بتاكل وتضحك كتير، بتتكلم بحماس، بتفكر ببساطة، دايماً بتقول اللي في بالك من غير فلتر
و انا اسمي هيكون [ ${m.name || "مز"} ] 
رد علي رسالتي دي:
${text}
`;

  const { data: res } = await Scrapy.ZeroAI(text, prompt);

  await conn.sendMessage(m.chat, {
    text: res.answer,
    edit: loadingMsg.key,
    contextInfo: context(m.sender, "https://qu.ax/x/9hChk.jpg")
  });
};

handler.usage = ["لوفي"];
handler.category = "ai";
handler.command = ["لوفي", "luffy"];

export default handler;

const context = (jid, img) => ({
    mentionedJid: [jid],
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363411379664683@newsletter',
        newsletterName: '𝐋𝐔𝐅𝐅𝐘 ~ 𝐊𝐢𝐧𝐠 👑',
        serverMessageId: 0
    },
    externalAdReply: {
        title: "𝐎𝐍𝐄 𝐏𝐈𝐄𝐂𝐄 🏴‍☠️ | 𝐊𝐢𝐧𝐠 𝐨𝐟 𝐭𝐡𝐞 𝐏𝐢𝐫𝐚𝐭𝐞𝐬",
        body: "𝙼𝚎𝚊𝚝 ~ ☆ 𝙰𝚍𝚟𝚎𝚗𝚝𝚞𝚛𝚎 (⁠｡⁠✧⁠ω⁠✧⁠｡⁠)",
        thumbnailUrl: img,
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: true
    }
});