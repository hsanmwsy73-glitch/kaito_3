let handler = async (m, { conn }) => {
    await conn.circular(m.chat, { vid: "https://files.catbox.moe/uafh25.mp4", sec: 200 }, m);
}

handler.command = ["تفجير"];
handler.usePrefix = false;

export default handler;