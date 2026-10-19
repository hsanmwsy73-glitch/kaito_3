async function test(m, { conn, bot, text }) {
  try {
    if (!text) return m.reply("*💙 ~ اكتب اسم البحث انجلش عشان يطلع لك الصور ~ ❤️*");
    
    const res = await bot.Api.search.pinterestImages({ q: text });
    const arr = res.data;
    
    if (!arr || arr.length === 0) {
      return m.reply("*⚠️ ~ لا توجد نتائج للبحث ~*");
    }
    
    const start = Math.floor(Math.random() * (arr.length - 10));
    const selectedImages = arr.slice(start, start + 10);

    const cards = selectedImages.map((item, index) => {
      const title = item.title && item.title !== 'No title' ? item.title : `Image ~ ${index + 1}`;
      
      return {
        imageUrl: item.url,
        bodyText: `*${title}*`,
        footerText: item.owner ? `👤 ${item.owner} • Pinterest` : '📌 Pinterest Image',
        buttons: [
          { name: 'cta_url', params: { display_text: '🔗╎ رؤيـتـهـا', url: item.pinUrl || item.url } },
          { name: 'cta_copy', params: { display_text: '📋╎ نـسـخ الـرابــط', copy_code: item.url } }
        ]
      };
    });

    return await conn.sendCarousel(m.chat, {
      headerText: `📸 البحث الخاص بك → *[ ${text} ]* `,
      globalFooterText: 'Swipe to see more images →',
      cards: cards,
      mentions: [m.sender],
      newsletter: {
      name: '𝑲𝑨𝑰𝑻𝑶​│𝑩𝑳𝑶𝑫 🕷️',
      jid: '120363411379664683@newsletter'
    },
    }, reply_status);
    
  } catch (error) {
    console.error("[pinterest search] Failed:", error?.message || error);
    try {
      await m.react("❌");
    } catch (reactionError) {
      console.error("[pinterest search] Failed to react:", reactionError.message);
    }
    return m.reply("❌ تعذر البحث في Pinterest الآن. حاول مرة أخرى لاحقًا.");
  }
}

test.category = "search";
test.usage = ["بين", "بينترست", "بحث_بينترست"];
test.command = ["بين", "بينترست", "بحث_بينترست"];
export default test;