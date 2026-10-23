let handler = async (m, { conn, bot }) => {
  const watermark = 'kaito';

  const quoted = {
    key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
    message: { conversation: '𝑲𝑨𝑰𝑻𝑶-𝑨𝑰 ⛩️🖤' }
  };

  const owner = bot?.config?.owners?.[0]?.jid;
  if (!owner) return m.reply('رقم المطور غير محدد.');
  const num = owner.split('@')[0];

  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${watermark}
TEL;type=CELL;waid=${num}:+${num}
END:VCARD`;

  const imgUrl = 'https://files.catbox.moe/sgvgaz.jpg';
  let buffer;
  try {
    const res = await fetch(imgUrl);
    buffer = Buffer.from(await res.arrayBuffer());
  } catch {
    buffer = null;
  }

  await conn.sendMessage(m.chat, {
    contacts: { displayName: watermark, contacts: [{ vcard }] },
    contextInfo: {
      forwardingScore: 2023,
      isForwarded: true,
      externalAdReply: {
        title: '𝑇𝛨𝛯 𝛩𝑊𝛮𝛯𝑅',
        body: watermark,
        sourceUrl: imgUrl,
        ...(buffer && { thumbnail: buffer }),
        mediaType: 1,
        showAdAttribution: true,
        renderLargerThumbnail: true
      }
    }
  }, { quoted });
};

handler.command = /^(owner|مطور|المطور)$/i;
export default handler;