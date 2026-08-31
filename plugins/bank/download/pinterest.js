import { pinterest as pinterestDL } from "btch-downloader";

const pinterest = async (m, { text, conn }) => {
  if (!text) return m.reply("❌: حط الرابط جنب الامر");

  if (!/pinterest\.com|pin\.it/i.test(text)) {
    return m.reply("❌: هذا مو رابط بنترست صحيح");
  }

  try {
    const result = await pinterestDL(text);

    // المكتبة ترجع غالبًا { url: "..." } أو مصفوفة، نتعامل مع الاحتمالين
    const item = Array.isArray(result) ? result[0] : result;
    const mediaUrl = item?.url || item?.video || item?.image;

    if (!mediaUrl) {
      console.log("Pinterest result:", JSON.stringify(result));
      return m.reply("❌ ما لقيت صورة أو فيديو بهالرابط");
    }

    const isVideo = /\.mp4($|\?)/i.test(mediaUrl) || item?.type === "video";

    if (isVideo) {
      await conn.sendMessage(m.chat, {
        video: { url: mediaUrl },
        caption: "```📥 Pinterest video downloaded successfully```",
      });
    } else {
      await conn.sendMessage(m.chat, {
        image: { url: mediaUrl },
        caption: "```📥 Pinterest image downloaded successfully```",
      });
    }
  } catch (error) {
    console.error(error.message);
    m.reply(error.message);
  }
};

pinterest.usage = ["بنترست"];
pinterest.category = "downloads";
pinterest.command = ["بنترست", "pinterest", "pin"];
pinterest.admin = false;

export default pinterest;
