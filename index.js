import { Client } from "meowsab";
import { group, access } from "./system/control.js";
import UltraDB from "./system/UltraDB.js";
import { commandPolicyMiddleware } from "./system/commandPolicy.js";
import sub from "./sub.js";
import { startDashboard, state, pushUpdate } from "./dashboard.js";
import fs from "fs";
import path from "path";
global.isPublic = true;

/* =========== Dashboard ========== */
startDashboard();

/* =========== Intercept stdout to capture pairing code ========== */
const _stripAnsi = (str) =>
  str.replace(/\x1B\[[0-9;]*[mGKHF]/g, "").replace(/\x1B\][^\x07]*\x07/g, "");
const _origWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, ...rest) => {
  const raw = typeof chunk === "string" ? chunk : chunk.toString();
  const line = _stripAnsi(raw);
  const match = line.match(/Pairing\s*Code\s+([A-Z0-9]{4,})/i);
  if (match) {
    state.pairingCode = match[1];
    state.status = "connecting";
    pushUpdate();
  }
  if (/Session logged out/i.test(line)) {
    state.status = "failed";
    state.pairingCode = null;
    state.repairAttempts = 0;
    pushUpdate();
    console.error(
      "[Bot] WhatsApp reported a logged-out session. Saved session files were kept; use the explicit pairing reset only if WhatsApp removed the linked device.",
    );
  }
  return _origWrite(chunk, ...rest);
};

/* =========== Client ========== */
const client = new Client({
  phoneNumber: "963934149274", // Bot number
  prefix: [".", "/", "!"],
  // null lets the bot process messages sent by itself and by other users.
  fromMe: null,
  owners: [
    // Owner 1
    {
      name: "kaito",
      lid: "247579682029763@lid",
      jid: "963934149274@s.whatsapp.net",
    },
    // Owner 2
    { name: "", lid: "221307316789354@lid", jid: "201093036797@s.whatsapp.net" },
    // Owners 3 and 4 are identified by their LIDs and corresponding JIDs.
    {
      name: "",
      lid: "50414477168824@lid",
      jid: "@s.whatsapp.net",
    },
    {
      name: "Aadm",
      lid: "51664513925368@lid",
      jid: "51664513925368@s.whatsapp.net",
    },
  ],
  settings: { noWelcome: false },
  commandsPath: "./plugins",
  onConnected: () => {
    state.status = "connected";
    state.connectedAt = new Date().toISOString();
    state.repairAttempts = 0;
    pushUpdate();
  },
  onDisconnected: () => {
    state.status = "disconnected";
    pushUpdate();
  },
});

client.onGroupEvent(group);
client.onCommandAccess(access);

/* =========== Database ========== */
if (!global.db) {
  global.db = new UltraDB();
}
client.useMiddleware(commandPolicyMiddleware);

/* =========== Config ========== */
const { config } = client;
const persistedOwners = Array.isArray(global.db.owners)
  ? global.db.owners.filter(
      (owner) =>
        owner &&
        typeof owner.jid === "string" &&
        owner.jid.includes("@") &&
        typeof owner.lid === "string" &&
        owner.lid.includes("@"),
    )
  : [];
for (const owner of persistedOwners) {
  if (
    !config.owners.some(
      (configured) => configured.jid === owner.jid || configured.lid === owner.lid,
    )
  ) {
    config.owners.push(owner);
  }
}
config.info = {
  nameBot: "𝑲𝑨𝑰𝑻𝑶​│𝑩𝑳𝑶𝑫〈",
  nameChannel: " 𝑲𝑨𝑰𝑻𝑶​│~ 𝑩𝑳𝑶𝑫 🕷️",
  idChannel: "120363411379664683@newsletter",
  urls: {
    repo: "https://github.com/deveni0/https.catboxxx.moeatboxx://files.moeeatbox.catboxxx.moeAI",
    api: "https://emam-api.web.id",
    channel: "https://whatsapp.com/channel/0029VbDDlh74IBhMBDrE3f3o",
  },
  copyright: {
    pack: "𝑲𝑨𝑰𝑻𝑶 𝑩𝑶𝑻",
    author: "𝑲𝑨𝑰𝑻𝑶 𝑲𝑨𝑰",
  },
  images: [
    "https://files.catbox.moe/sgvgaz.jpg",
    "https://files.catbox.moe/sgvgaz.jpg",
    "https://files.catbox.moe/sgvgaz.jpg",
  ],
};

/* =========== Seed dashboard state ========== */
state.phoneNumber = config.phoneNumber;
state.botName = "KAITO Bot";
pushUpdate();

/* =========== Session management ========== */
function wipeSession() {
  const sessionDir = path.resolve("./session");
  try {
    fs.rmSync(sessionDir, { recursive: true, force: true });
    fs.mkdirSync(sessionDir, { recursive: true });
    return true;
  } catch (error) {
    console.error(`[Bot] Failed to clear session directory: ${error.message}`);
    return false;
  }
}

for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.prependListener(sig, () => {
    wipeSession();
    console.log(`[Bot] Session cleared during ${sig}.`);
    // meowsab handles graceful cleanup for SIGINT/SIGTERM after this listener.
    if (sig === "SIGHUP") process.exit(0);
  });
}

/* =========== Always start with a fresh WhatsApp session ========== */
if (!wipeSession()) {
  console.error("[Bot] Refusing to start because the session could not be cleared.");
  process.exit(1);
}
console.log("[Bot] Session cleared at startup; a new WhatsApp pairing is required.");

/* =========== Validate session before connecting ========== */
(function validateSession() {
  const credsPath = path.resolve("./session/creds.json");
  try {
    if (!fs.existsSync(credsPath)) return;
    const raw = fs.readFileSync(credsPath, "utf8").trim();
    if (!raw) throw new Error("empty");
    JSON.parse(raw);
  } catch (_) {
    console.log(
      "[Bot] Stale or invalid session detected — wiping before connect.",
    );
    wipeSession();
  }
})();

/* =========== Reset-pairing hook (callable from plugins) ========== */
global.resetPairing = () => {
  if (state.status !== "failed") return false;
  state.repairAttempts = 0;
  wipeSession();
  state.status = "re-pairing";
  state.pairingCode = null;
  pushUpdate();
  console.log("[Bot] Owner triggered reset-pairing — retrying...");
  setTimeout(() => client.start(), 1500);
  return true;
};

/* =========== Start ========== */
client.start();

setTimeout(async () => {
  if (client.commandSystem) {
    const cmds = client.commandSystem.getAll();
    state.commandCount = cmds.length;
    pushUpdate();
    sub(client);
  }
}, 2000);

/* =========== Catch Errors ========== */
process.on("uncaughtException", (e) => {
  if (e.message.includes("rate-overlimit")) return;
  console.error("Uncaught Exception:", e.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

/* 
=========== Memory Monitor ========== 

setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024
    if (used > 800) {
        console.log(`🔄 Bot memory full (${used.toFixed(1)}MB), restarting...`)
        process.exit(1) 
    }
}, 300_000) 

*/
