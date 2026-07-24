const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('⚠️ ابعت رابط القناة أو كود الدعوة')

  try {
    const invite = text.includes('https')
      ? text.split('/').pop().split('?')[0]
      : text.trim()

    const res = await conn.newsletterMetadata('invite', invite)
    const meta = res.thread_metadata

    const name = meta.name?.text || 'غير معروف'
    const desc = meta.description?.text || 'مفيش وصف'
    const subs = meta.subscribers_count || '0'
    const created = meta.creation_time
      ? new Date(parseInt(meta.creation_time) * 1000).toLocaleString('ar-EG')
      : 'غير معروف'
    const status = res.state?.type || 'غير معروف'
    const verify = meta.verification || 'غير معروف'
    const jid = res.id

    let msg = `📢 *معلومات القناة*\n\n`
    msg += `👤 الاسم: ${name}\n`
    msg += `👥 المشتركين: ${subs}\n`
    msg += `📅 تاريخ الإنشاء: ${created}\n`
    msg += `📡 الحالة: ${status}\n`
    msg += `✔️ التوثيق: ${verify}\n\n`
    msg += `📝 الوصف:\n${desc}`

    const img = meta.preview?.direct_path
      ? 'https://mmg.whatsapp.net' + meta.preview.direct_path
      : null

    await conn.sendButton(m.chat, {
      imageUrl: img,
      bodyText: msg,
      footerText: " 𝑲𝑨𝑰𝑻𝑶​│𝑩𝑳𝑶𝑫 ",
      buttons: [
        {
          name: "cta_copy",
          params: {
            display_text: "📋 Coby JID",
            copy_code: jid
          }
        }
      ],
      mentions: [m.sender],
      newsletter: {
        name: name,
        jid: jid
      },
      interactiveConfig: {
        buttons_limits: 1,
        list_title: name,
        button_title: "Options",
        canonical_url: "https://vxv-profile.vercel.vercel"
      }
    }, global.reply_status)

  } catch (e) {
    m.reply('❌ حصل خطأ، تأكد من الرابط أو الكود')
  }
}

handler.command = ['قناة']
export default handler