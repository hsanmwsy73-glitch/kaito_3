const FALLBACK = 'https://files.catbox.moe/sm8sye.jpg';

const getBuf = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return Buffer.from(await r.arrayBuffer());
};

const getPic = async (conn, jid) => {
  try { return await getBuf(await conn.profilePictureUrl(jid, 'image')); }
  catch { return await getBuf(FALLBACK); }
};

const handler = async (m, { conn, command, text }) => {
  global.db.users[m.sender] ??= {};
  const user = global.db.users[m.sender];
  const tag = '@' + m.sender.split('@')[0];

  const send = async (caption) => {
    try {
      const pic = await getPic(conn, m.sender);
      await conn.sendMessage(m.chat, { image: pic, caption, mentions: [m.sender] }, { quoted: m });
    } catch (e) {
      console.error('send image failed:', e);
      await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m });
    }
  };

  if (command === 'تسجيل') {
    if (!text) return m.reply('*📝 طريقة التسجيل:*\n\n.تسجيل الاسم|العمر\n\nمثال:\n.تسجيل كايتو|20');

    const [name, age] = text.split('|').map(s => s.trim());
    if (!name || !age) return m.reply('*❌ اكتب الاسم والعمر مفصولين بـ |*');
    if (isNaN(age) || age < 1 || age > 50) return m.reply('*❌ العمر لازم رقم بين 1 و 50*');

    user.name = name;
    user.age = parseInt(age);

    return send(`*✅ تم التسجيل بنجاح*\n\n${tag}\n🏷️ الاسم: ${name}\n📅 العمر: ${age} سنة`);
  }

  if (command === 'حذف_تسجيلي') {
    if (!user.name && !user.age) return m.reply('*❌ ما عندك تسجيل لحذفه*');

    delete user.name;
    delete user.age;

    return send(`*✅ تم حذف التسجيل*\n\n${tag}\nتقدر تسجل مرة ثانية.`);
  }
};

handler.usage = ['تسجيل', 'حذف_تسجيلي'];
handler.category = 'bank';
handler.command = ['تسجيل', 'حذف_تسجيلي'];

export default handler;