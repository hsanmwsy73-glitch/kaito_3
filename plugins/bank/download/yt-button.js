const handler = async (m, { conn, text }) => {
    if (!text) return m.reply("💙 ~ اكتب نص الفيديو او الاغنيه ~ ❤️");
    
    const res = await fetch(`https://emam-api.web.id/home/sections/Search/api/YouTube/search?q=${text}`);
    const { data } = await res.json();
    const { title, image, timestamp: time, url } = data[0];

    await conn.sendButton(m.chat, {
        imageUrl: image,
        bodyText: `${title} ╎ ${time}`,
        footerText: "🕸️ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 ~ 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 🕸️",
        buttons: [
            { name: "quick_reply", params: { display_text: "🎼 ╎ تـحـمـيـل صـوت", id: `.يوت_اغنيه ${url}` } },
            { name: "quick_reply", params: { display_text: "🎬 ╎ تـحـمـيـل فـيـديـو", id: `.يوتيوب ${url}` } }
        ],
        mentions: [m.sender],
        newsletter: { name: "𝑲𝑨𝑰𝑻𝑶​│𝑩𝑳𝑶𝑫 🕷️", jid: "120363411379664683@newsletter" },
        interactiveConfig: { buttons_limits: 10, list_title: "𝑲𝑨𝑰𝑻𝑶⛩️       ", button_title: "𝑲𝑨𝑰𝑻𝑶 ⛩️", canonical_url: url }
    }, m);
};

handler.usage = ["فيديو", "اغنيه", "شغل"];
handler.category = "downloads";
handler.command = ["اغنيه", "فيديو", "اغنية", "play", "video"];

export default handler;