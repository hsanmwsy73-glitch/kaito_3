export default async function before(m, { conn, bot }) {
  try {
    const g = global.db?.groups[m.chat];
    const u = global.db?.users[m.sender];

    if (u?.banned && !m.isOwner) return true;

    if (g?.adminOnly && !m.isOwner && !m.isAdmin) return true;

    if (global.db?.dev && !m.isOwner && !m.isGroup) return true;

    if (global.db?.ownerOnly && !m.isOwner) return true;

    return false;
  } catch (err) {
    console.error('[atuo] خطأ غير متوقع:', err.message);
    return false;
  }
};
