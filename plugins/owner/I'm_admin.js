const handler = async (m, { conn, text }) => {
  m.reply("*تم رفعك ادمن يا مطوري 🌹⁦(⁠≧⁠▽⁠≦⁠)⁩*")
  await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
  
};

handler.usage = ["ا"];
handler.category = "owner";
handler.command = ["ا"];
handler.owner = true 
handler.botAdmin = true 

export default handler;
 