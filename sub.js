import { SubBots } from "meowsab";
import { Level } from "level";
import fs from "fs";
import path from "path";

async function sub(client) {

  global.subBots = new SubBots(client.commandSystem)
  
  SubBots.pariCode("KAIT1234") // Pairing
 
  const { config } = client;

 
  await global.subBots.setConfig({
    commandsPath: config.commandsPath || './plugins',
    owners: config.owners,
    prefix: config.prefix,
    info: config.info,
    printQR: false
  });

  global.subBots.on('error', (uid, error) => {
    console.error(`❌ [SubBot ${uid}] Error:`, error?.message || error);
  });

  const subDir = path.resolve("sub");
  const botConfigs = [];

  if (fs.existsSync(subDir)) {
    for (const entry of fs.readdirSync(subDir)) {
      if (!/^shard-/.test(entry)) continue;
      const shardPath = path.join(subDir, entry);

      const lockFile = path.join(shardPath, "LOCK");
      if (fs.existsSync(lockFile)) fs.rmSync(lockFile);

      let db;
      try {
        db = new Level(shardPath, { valueEncoding: 'utf8' });
        await db.open();
        for await (const [key, value] of db.iterator()) {
          if (key.endsWith('::phone')) {
            botConfigs.push({
              uid: key.slice(0, -'::phone'.length),
              phone: value.replace(/^\+/, '')
            });
          }
        }
      } catch (readErr) {
        console.error(`⚠️ Failed to scan shard ${entry}:`, readErr?.message || readErr);
      } finally {
        if (db) { try { await db.close(); } catch {} }
      }
    }
  }

  // Resolve internal params required by spawn_ before the per-bot loop
  let ver, gCfg;
  try {
    [ver, gCfg] = await Promise.all([
      global.subBots.ver_(),
      global.subBots.gCfg_()
    ]);
  } catch (err) {
    console.error('❌ [SubBots] Failed to initialise load parameters:', err?.message || err);
    return global.subBots;
  }

  // Load each bot individually so one failure cannot stop the others
  let successCount = 0;
  let failedCount = 0;
  for (const { uid, phone } of botConfigs) {
    try {
      await global.subBots.spawn_(uid, phone, gCfg, ver);
      successCount++;
    } catch (error) {
      failedCount++;
      console.error(`❌ [SubBot ${uid}] Failed to load (skipping):`, error?.message || error);
    }
  }
  console.log(`✅ SubBots load complete — ${successCount} succeeded, ${failedCount} failed`);

  global.subBots.on('ready', async (uid, sock) => {
    console.log(`✅ [SubBot ${uid}] Connected!`);
  });

  global.subBots.on('pair', (uid, code) => {
    console.log(`🔐 [SubBot ${uid}] Pairing code: ${code}`);
  });


  global.subBots.on('message', async (uid, msg) => {
    if (msg.key.id.includes("3EB0")) return;

    const body = getMessageText(msg);
    const bot = global.subBots.get(uid);
    const sock = bot?.sock;

    if (!sock || !body) return;

    try {
      if (body === "تست") {
    await sock.sendMessage(msg.key.
        remoteJid, {
        react: { text: "✅", key: msg.key }
       });
      }

    } catch (error) {
      console.error(`❌ [SubBot ${uid}] Send error:`, error?.message || error);
    }
  });

  global.subBots.on('close', (uid) => {
    console.log(`🔌 [SubBot ${uid}] Disconnected`);
  });

  global.subBots.on('badSession', (uid) => {
    console.log(`⚠️ [SubBot ${uid}] Bad session, removed`);
  });

  return global.subBots;
}

function getMessageText(msg) {
  if (!msg.message) return null;
  if (msg.message.conversation) return msg.message.conversation;
  if (msg.message.extendedTextMessage?.text) return msg.message.extendedTextMessage.text;
  if (msg.message.imageMessage?.caption) return msg.message.imageMessage.caption;
  if (msg.message.videoMessage?.caption) return msg.message.videoMessage.caption;
  return msg.body || null;
}

export default sub;
