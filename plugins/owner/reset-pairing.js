const handler = async (m) => {
    if (typeof global.resetPairing !== 'function') {
        return m.reply('❌ ~ وظيفة إعادة الربط غير متاحة.');
    }

    const triggered = global.resetPairing();

    if (!triggered) {
        return m.reply('⚠️ ~ البوت ليس في حالة فشل. لا حاجة لإعادة الربط الآن.');
    }

    await m.reply('🔄 ~ تم إعادة تعيين عداد الربط. جارٍ محاولة الاتصال بواتساب...');
};

handler.command = ['reset-pairing', 'إعادة-الربط', 'resetpairing'];
handler.category = 'owner';
handler.usage = ['reset-pairing'];
handler.owner = true;

export default handler;
