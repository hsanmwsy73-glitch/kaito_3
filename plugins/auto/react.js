export default async function before(m, { conn , bot }) {
  try {
    const triggers = {
      "كايتو": ["📂", "🗃️", "☕", "🪐", "🐍"],
      "كيت": ["🎼", "🎪", "🎨", "🎯", "🎲"]
    };

    const emojis = triggers[m.text];
    if (emojis) {
      const random = emojis[Math.floor(Math.random() * emojis.length)];
      await m.react(random);
    }

    return false;
  } catch (err) {
    console.error('[react] خطأ غير متوقع:', err.message);
    return false;
  }
}
