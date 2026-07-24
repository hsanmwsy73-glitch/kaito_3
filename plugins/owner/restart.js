const test = async (m, { conn, bot }) => {
  m.react("🔱")

  conn.msgUrl(m.chat, "⛩️ يتم ايقاف البوت...", { 
    title: "تم ايقاف البوت",
    body: "البوت طافي انتضر المطور يعيد تشغيله",
    img: "https://files.catbox.moe/ym6n3g.jpg",
    big: false 
  });

  setTimeout(() => {
    bot.restart();
  }, 1000); 
};

test.usage = ["رستارت"]
test.category = "owner";
test.command = ["رستارت", "restart"];
test.owner = true;
export default test;