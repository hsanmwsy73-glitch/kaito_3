---
name: MeowSab before hooks
description: سلوك تشغيل before وحذف رسائل WhatsApp في نسخة MeowSab المستخدمة بالمشروع.
---

في نسخة MeowSab الحالية، الدالة المصدّرة مباشرة من ملف plugin تُسجّل كـ before عام، بينما `handler.before` يُسجّل كـ before مرتبط بالأمر. كلا الشكلين مدعومان، وأخطاء كل hook تُلتقط وتُسجّل ثم تستمر السلسلة.

**Why:** ظهور `Before handler error` لا يعني أن بقية hooks توقفت؛ غالبًا يكون الفشل داخل تأثير جانبي مثل إرسال رد أو حذف رسالة.

**How to apply:** استخدم helper الرسالة `m.delete()` لحذف الرسالة بدل بناء payload حذف يدويًا، ووحّد JID/LID قبل مقارنة المرسل بقوائم المجموعة. اعتبر `rate-overlimit` خطأ إرسال من Baileys، وخفّف الردود والتفاعلات الآلية بدل تغيير طريقة تسجيل الـhooks.