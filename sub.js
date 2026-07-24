import { SubBots } from "meowsab";
import { Level } from "level";
import fs from "fs";
import path from "path";

async function sub(client) {
  global.subBots = new SubBots(client.commandSystem);

  SubBots.pariCode("KAIT1234");

  const { config } = client;

  await global.subBots.setConfig({
    commandsPath: config.commandsPath || "./plugins",
    owners: config.owners,
    prefix: config.prefix,
    info: config.info,
    printQR: false,
  });

  global.subBots.on("error", (uid, error) => {
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
        db = new Level(shardPath, { valueEncoding: "utf8" });
        await db.open();
        for await (const [key, value] of db.iterator()) {
          if (key.endsWith("::phone")) {
            botConfigs.push({
              uid: key.slice(0, -"::phone".length),
              phone: value.replace(/^\+/, ""),
            });
          }
        }
      } catch (readErr) {
        console.error(
          `⚠️ Failed to scan shard ${entry}:`,
          readErr?.message || readErr,
        );
      } finally {
        if (db) {
          try {
            await db.close();
          } catch {}
        }
      }
    }
  }

  let ver, gCfg;
  try {
    [ver, gCfg] = await Promise.all([
      global.subBots.ver_(),
      global.subBots.gCfg_(),
    ]);
  } catch (err) {
    console.error(
      "❌ [SubBots] Failed to initialise load parameters:",
      err?.message || err,
    );
    return global.subBots;
  }

  global.subBotRegistry = new Map();

  const reconnectInProgress = new Set();

  let successCount = 0;
  let failedCount = 0;
  for (const { uid, phone } of botConfigs) {
    try {
      await global.subBots.spawn_(uid, phone, gCfg, ver);
      global.subBotRegistry.set(uid, phone);
      successCount++;
    } catch (error) {
      failedCount++;
      console.error(
        `❌ [SubBot ${uid}] Failed to load (skipping):`,
        error?.message || error,
      );
    }
  }
  console.log(
    `✅ SubBots load complete — ${successCount} succeeded, ${failedCount} failed`,
  );

  global.subBots.on("ready", async (uid, sock) => {
    console.log(`✅ [SubBot ${uid}] Connected!`);
  });

  global.subBots.on("pair", (uid, code) => {
    console.log(`🔐 [SubBot ${uid}] Pairing code: ${code}`);
  });

  global.subBots.on("message", async (uid, msg) => {
    if (msg.key.id.includes("3EB0")) return;

    const bot = global.subBots.get(uid);
    const sock = bot?.sock;
    if (!sock) return;

    const chatJid = msg.key.remoteJid;
    const isGroup = chatJid.endsWith("@g.us");

    if (isGroup) {
      const isVcard =
        msg.message?.contactMessage || msg.message?.contactsArrayMessage;
      if (isVcard) {
        try {
          const groupMetadata = await sock.groupMetadata(chatJid);
          const participants = groupMetadata.participants;
          const sender = msg.key.participant || msg.participant;

          const isSenderAdmin = participants.find(
            (p) => p.id === sender,
          )?.admin;
          const isBotAdmin = participants.find(
            (p) => p.id === sock.user.id.split(":")[0] + "@s.whatsapp.net",
          )?.admin;

          if (!isSenderAdmin && isBotAdmin) {
            await sock.groupParticipantsUpdate(chatJid, [sender], "remove");
            await sock.sendMessage(chatJid, {
              text: `🚨 @${sender.split("@")[0]}`,
              mentions: [sender],
            });
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    const body = getMessageText(msg);
    if (!body) return;

    try {
      if (body === "تست") {
        await sock.sendMessage(chatJid, {
          react: { text: "✅", key: msg.key },
        });
      }
    } catch (error) {
      console.error(`❌ [SubBot ${uid}] Send error:`, error?.message || error);
    }
  });

  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 5000;

  async function attemptReconnect(uid, attempt) {
    const phone = global.subBotRegistry.get(uid);
    if (!phone) {
      console.error(
        `❌ [SubBot ${uid}] Cannot reconnect — phone not found in registry`,
      );
      reconnectInProgress.delete(uid);
      return;
    }

    if (attempt > MAX_RETRIES) {
      console.error(
        `❌ [SubBot ${uid}] Permanent failure — gave up after ${MAX_RETRIES} reconnect attempts`,
      );
      reconnectInProgress.delete(uid);
      return;
    }

    const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
    console.log(
      `🔄 [SubBot ${uid}] Reconnect attempt ${attempt}/${MAX_RETRIES} in ${delay / 1000}s…`,
    );

    setTimeout(async () => {
      try {
        await global.subBots.spawn_(uid, phone, gCfg, ver);
        console.log(
          `✅ [SubBot ${uid}] Reconnected successfully (attempt ${attempt})`,
        );
        reconnectInProgress.delete(uid);
      } catch (err) {
        console.error(
          `⚠️ [SubBot ${uid}] Reconnect attempt ${attempt} failed:`,
          err?.message || err,
        );
        await attemptReconnect(uid, attempt + 1);
      }
    }, delay);
  }

  global.subBots.on("close", (uid) => {
    console.log(`🔌 [SubBot ${uid}] Disconnected`);
    if (reconnectInProgress.has(uid)) {
      console.log(
        `⏩ [SubBot ${uid}] Reconnect already in progress, skipping duplicate`,
      );
      return;
    }
    reconnectInProgress.add(uid);
    attemptReconnect(uid, 1);
  });

  global.subBots.on("badSession", (uid) => {
    console.log(`⚠️ [SubBot ${uid}] Bad session, removed`);
  });

  return global.subBots;
}

function getMessageText(msg) {
  if (!msg.message) return null;
  if (msg.message.conversation) return msg.message.conversation;
  if (msg.message.extendedTextMessage?.text)
    return msg.message.extendedTextMessage.text;
  if (msg.message.imageMessage?.caption)
    return msg.message.imageMessage.caption;
  if (msg.message.videoMessage?.caption)
    return msg.message.videoMessage.caption;
  return msg.body || null;
}

export default sub;
