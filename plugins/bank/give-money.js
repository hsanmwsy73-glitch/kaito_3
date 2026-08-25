/*
 * أمر: تحويل
 * الاستخدام: تحويل @شخص المبلغ
 * مثال: تحويل @user 250
 *
 * ⚠️ ملاحظة مهمة قبل الاستخدام:
 * هذا الكود مبني على افتراض أن رصيد العضو مخزّن في:
 *   global.db.data.users[jid].money
 * وهذا الشكل شائع جدًا في بوتات JSON/lowdb.
 * لو نظام البنك عندك يستخدم اسم متغيّر مختلف (مثلاً balance
 * أو coin أو rasid) بدّل كلمة "money" في كل مكان بنفس الاسم
 * المستخدم في أوامر "يومي" و"بروفايل" عندك حتى يتوافق الرصيد.
 */

let handler = async (m, { conn, participants, isAdmin, isOwner, args, usedPrefix, command }) => {
  // 1) تحديد المستقبل (سواء بمنشن أو بالرد على رسالته)
  let receiver = m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : m.quoted
      ? m.quoted.sender
      : null;

  if (!receiver) {
    throw `❎ اذكر الشخص المُراد التحويل له.\n\nمثال:\n${usedPrefix + command} @الشخص 250`;
  }

  // 2) استخراج المبلغ من الأرقام الموجودة في النص
  let amount = parseInt(args.find(a => /^\d+$/.test(a)));
  if (!amount || amount <= 0) {
    throw `❎ اكتب مبلغ صحيح.\n\nمثال:\n${usedPrefix + command} @الشخص 250`;
  }

  let sender = m.sender;

  if (receiver === sender) {
    throw `❎ لا يمكنك التحويل لنفسك.`;
  }

  // 3) التأكد أن الطرفين مسجلين في نظام البنك
  if (!global.db.data.users[sender]) global.db.data.users[sender] = {};
  if (!global.db.data.users[receiver]) global.db.data.users[receiver] = {};

  let senderData = global.db.data.users[sender];
  let receiverData = global.db.data.users[receiver];

  if (!senderData.money) senderData.money = 0;
  if (!receiverData.money) receiverData.money = 0;

  // 4) التحقق أن الرصيد كافي
  if (senderData.money < amount) {
    throw `❎ رصيدك غير كافٍ.\nرصيدك الحالي: ${senderData.money}`;
  }

  // 5) تنفيذ عملية التحويل (خصم + إضافة)
  senderData.money -= amount;
  receiverData.money += amount;

  await conn.reply(
    m.chat,
    `✅ تم التحويل بنجاح!\n\n` +
    `💸 المبلغ: ${amount}\n` +
    `👤 من: @${sender.split('@')[0]}\n` +
    `📥 إلى: @${receiver.split('@')[0]}\n` +
    `💰 رصيدك الحالي: ${senderData.money}`,
    m,
    { mentions: [sender, receiver] }
  );
};

handler.command = ['تحويل', 'حول'];
handler.group = true; // يعمل داخل الجروب فقط (مناسب لجروب البنك)

export default handler;
