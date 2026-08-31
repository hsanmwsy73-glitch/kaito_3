let handler = async (m, { conn }) => {
    await conn.circular(m.chat, { vid: "https://litter.catbox.moe/87vk5ifrcoizm82y.mp4", sec: 200 }, m);
}

handler.command = ["تفجير"];
handler.usePrefix = false;

export default handler;