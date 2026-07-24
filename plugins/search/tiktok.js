async function test(m, { conn, bot, text }) {
  if (!text) return m.reply("#🫯: اكتب نص جنب الأمر")
  try {
  const res = await fetch(`https://www.emam-api.web.id/home/sections/Search/api/tiktok/videos?q=${text}`)
const { data } = await res.json()

if (data && data.length > 0) {
    const { title, no_watermark: video, music } = data[0]

    await conn.sendButtonNormal(m.chat, {
        media: { url: video },
        mediaType: 'video',
        caption: `${title || "no title"}`,
        buttons: [
            { 
                name: "cta_copy", 
                params: { 
                    display_text: "💟╎ My Channel", 
                    copy_code: "https://whatsapp.com/channel/0029VbDDlh74IBhMBDrE3f3o" 
                } 
            },
        ],
        mentions: [m.sender],
        newsletter: {
            name: '𝑲𝑨𝑰𝑻𝑶​│𝑩𝑳𝑶𝑫 🕷️',
            jid: '120363411379664683@newsletter'
        },
    }, global.reply_status)
} else {
    await conn.sendMessage(m.chat, { text: `لا يوجد "${text}"` })
}
    
  } catch (error) {
    console.error(error.messsage);
    m.react("❌")
  }
}

test.category = "search";
test.usage = ["بحث_تيك"];
test.command = ["بحث_تيك"];
export default test;