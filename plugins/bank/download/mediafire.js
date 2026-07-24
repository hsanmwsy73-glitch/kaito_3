import axios from 'axios';

const handler = async (m, { conn, text, command }) => {
  if (!text) throw `*❲ 📁 ❳ ~ ضع رابط ميديا فاير بعد الأمر ~ ❲ 🔹 ❳ *\n\nمثال:\n/${command} https://www.mediafire.com/file/xxxxx/file`;

  m.react('📥');

  try {
    const apiUrl = `https://emam-api.web.id/home/sections/Download/api/api/mediafire?url=${encodeURIComponent(text)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data.status) throw '❌ فشل في جلب المعلومات';

    const fileInfo = data.data;

    await conn.sendMessage(m.chat, {
      document: { url: fileInfo.downloadUrl },
      mimetype: fileInfo.mimetype,
      fileName: fileInfo.filename,
      caption: `${fileInfo.filename} ~ (${fileInfo.type})`
    }, { quoted: m });

  } catch (e) {
    console.log(e.message);
  }
};
handler.usage = ["ميديافاير"]
handler.category = "downloads";
handler.command = /^(mf|mediafire|ميديافاير)$/i;

export default handler;