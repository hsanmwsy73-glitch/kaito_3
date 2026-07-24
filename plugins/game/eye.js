/*
code: game eye anime
by: 𝐓𝐨𝐣𝐢 
*/

const MAX_ROUNDS = 10;

const NAMES = [
  "ايرين","نيزوكو","سوكونا","موازن","كيلوا","غون","ايتاتشي","ساسكي","دابي","اوبيتو",
  "نوبارا","ليفاي","يوتا","فريدا","شيده","ياماتو","نامي","ايمو","انيا","جينبي",
  "بوروتو","شانكس","لاو","لوفي","زورو","اكازا","ميكاسا","رين","دوما","كانيكي",
  "غوجو","ساي","نيجي","انمي","ساكورا","اوريتشمارو","ماهيتو","جيرايا","روبين",
  "سانجي","ميهوك","كايدو","مايكي","كورابيكا","شيغاراكي","تينغن","تانجيرو",
  "ميدوريا","كونان","الكيورا","شوتو","غاتارو","بارو","غارا","باكوغو","ماكيما",
  "توجا","باين","كوراما"
];

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const getPrize = (rank) => {
  if (rank === 0) return { xp: 500, cookies: 10, emoji: "🎉" };
  if (rank === 1) return { xp: 300, cookies: 5, emoji: "🎖" };
  return { xp: 100, cookies: 2, emoji: "⭐" };
};

const handler = async (m, { conn }) => {
  const chatId = m.chat;
  if (!global.gameEye) global.gameEye = {};

  const g = global.gameEye[chatId];
  // التحقق من وجود لعبة جارية
  if (g?.current) {
    return await conn.sendMessage(chatId, {
      image: { url: g.current.img },
      caption: g.current.caption
    });
  }

  // بدء لعبة جديدة أو إنهاء الجولة الحالية
  if (!g || g.round >= MAX_ROUNDS) {
    if (g && g.scores && Object.keys(g.scores).length > 0) {
      const sorted = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
      const prizes = [];

      for (let i = 0; i < sorted.length; i++) {
        const [id, score] = sorted[i];
        const prize = getPrize(i);
        if (global.db?.users && global.db.users[id]) {
          global.db.users[id].xp = (global.db.users[id].xp || 0) + prize.xp;
          global.db.users[id].cookies = (global.db.users[id].cookies || 0) + prize.cookies;
        }
        prizes.push(`${prize.emoji} @${id.split('@')[0]} - ${score} نقطة (+${prize.xp} XP)`);
      }

      await conn.sendMessage(chatId, {
        text: `🏆 *انتهت اللعبة*\n\n${prizes.join('\n')}`,
        mentions: sorted.map(s => s[0])
      });
    }

    // إعادة تعيين اللعبة
    global.gameEye[chatId] = { 
      round: 0, 
      scores: {}, 
      current: null 
    };
  }

  // جلب البيانات
  const g2 = global.gameEye[chatId];
  g2.round++;

  try {
    const response = await fetch("https://raw.githubusercontent.com/fjfilhfjjg-boop/Pomni-AI/refs/heads/main/%D8%B9%D9%8A%D9%86.md");
    if (!response.ok) throw new Error('فشل جلب البيانات');
    const data = await response.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('بيانات غير صالحة');
    }

    const char = data[Math.floor(Math.random() * data.length)];

    // إنشاء الخيارات
    const filteredNames = NAMES.filter(n => n !== char.name);
    const shuffledNames = shuffle(filteredNames);
    const wrong = shuffledNames.slice(0, 3);
    const opts = shuffle([char.name, ...wrong]);

    const caption = `👁 *خمن الشخصية* (${g2.round}/${MAX_ROUNDS})\n\n1️⃣ ${opts[0]}\n2️⃣ ${opts[1]}\n3️⃣ ${opts[2]}\n4️⃣ ${opts[3]}\n\n⚠️ أرسل رقم الإجابة أو اسم الشخصية`;

    const msg = await conn.sendMessage(chatId, {
      image: { url: char.img },
      caption: caption
    });

    g2.current = {
      answer: char.name.toLowerCase(),
      opts: opts.map(o => o.toLowerCase()),
      img: char.img,
      caption: caption,
      id: msg.key.id,
      timer: setTimeout(async () => {
        if (global.gameEye[chatId]?.current) {
          const ans = global.gameEye[chatId].current.answer;
          global.gameEye[chatId].current = null;
          await conn.sendMessage(chatId, { 
            text: `⏰ *الوقت انتهى!*\nالاجابة الصحيحة: *${ans}*\n\nاكتب .عين للبدء من جديد` 
          });
        }
      }, 30000)
    };

  } catch (error) {
    console.error('خطأ في جلب البيانات:', error);
    await conn.sendMessage(chatId, {
      text: '❌ حدث خطأ في تحميل البيانات. حاول مرة أخرى.'
    });
    // إعادة تعيين الجولة الحالية
    global.gameEye[chatId].current = null;
  }
};

handler.before = async (m, { conn }) => {
  const g = global.gameEye?.[m.chat];
  if (!g?.current) return;

  const cur = g.current;

  // التحقق من أن الرسالة هي رد على رسالة اللعبة أو تحتوي على الإجابة الصحيحة
  const isReplyToGame = m.quoted?.id === cur.id;
  const containsAnswer = cur.opts.some(opt => m.text?.toLowerCase().trim() === opt);

  if (!isReplyToGame && !containsAnswer) return;

  // التأكد من أن الرسالة تحتوي على نص
  if (!m.text) return;

  const answer = m.text.toLowerCase().trim();

  // تحويل الأرقام إلى الخيارات
  let selectedOption = answer;
  if (['1', '2', '3', '4'].includes(answer)) {
    const index = parseInt(answer) - 1;
    if (index >= 0 && index < cur.opts.length) {
      selectedOption = cur.opts[index];
    }
  }

  // التحقق من صحة الإجابة
  if (!cur.opts.includes(selectedOption)) {
    return m.reply("❌ *غلط!*\nاختر من الخيارات المتاحة.");
  }

  // إلغاء المؤقت
  clearTimeout(cur.timer);
  g.current = null;

  if (selectedOption === cur.answer) {
    // إجابة صحيحة
    g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;
    await conn.sendMessage(m.chat, {
      text: `✅ *صح!* 🎉\nعندك ${g.scores[m.sender]} نقطة\n\n⏳ انتظر الجولة القادمة...`,
      mentions: [m.sender]
    });
    // بدء الجولة التالية
    setTimeout(() => handler(m, { conn }), 200);
  } else {
    // إجابة خاطئة
    await m.reply(`❌ *غلط!*\nالإجابة الصحيحة: *${cur.answer}*`);
    // بدء الجولة التالية
    setTimeout(() => handler(m, { conn }), 200);
  }

  return true;
};

handler.command = ['عين', 'eye'];
handler.category = "games";
export default handler;