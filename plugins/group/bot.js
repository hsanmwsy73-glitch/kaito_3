let handler = async (m, { conn }) => {
    await conn.circular(m.chat, { vid: "https://files.catbox.moe/coh5kg.jpg", sec: 200 }, m);
}

handler.command = ["ارسال"];
handler.usePrefix = false;

export default handler;