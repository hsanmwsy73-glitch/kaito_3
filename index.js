import { Client } from "meowsab";
import { group, access } from "./system/control.js";
import UltraDB from "./system/UltraDB.js";
import sub from "./sub.js";
import { startDashboard, state, pushUpdate } from "./dashboard.js";
import fs from "fs";
import path from "path";
global.isPublic = true;

/* =========== Dashboard ========== */
startDashboard();

/* =========== Re-pairing retry config ========== */
const configuredRepairAttempts = Number.parseInt(
  process.env.MAX_REPAIR_ATTEMPTS ?? "3",
  10,
);
const MAX_REPAIR_ATTEMPTS =
  Number.isInteger(configuredRepairAttempts) && configuredRepairAttempts >= 1
    ? configuredRepairAttempts
    : 3;
if (MAX_REPAIR_ATTEMPTS !== configuredRepairAttempts) {
  console.warn(
    `[Bot] Invalid MAX_REPAIR_ATTEMPTS value; using ${MAX_REPAIR_ATTEMPTS}. Set it to a positive integer.`,
  );
}
let repairAttempts = 0;

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
    if (repairAttempts >= MAX_REPAIR_ATTEMPTS) {
      state.status = "failed";
      state.pairingCode = null;
      state.repairAttempts = repairAttempts;
      pushUpdate();
      console.error(
        `[Bot] Re-pairing limit reached (${MAX_REPAIR_ATTEMPTS} attempts). Giving up to prevent endless restart loop.`,
      );
    } else {
      repairAttempts += 1;
      const sessionDir = path.resolve("./session");
      fs.rmSync(sessionDir, { recursive: true, force: true });
      fs.mkdirSync(sessionDir, { recursive: true });
      state.status = "re-pairing";
      state.pairingCode = null;
      state.repairAttempts = repairAttempts;
      pushUpdate();
      console.log(
        `[Bot] Re-pairing attempt ${repairAttempts}/${MAX_REPAIR_ATTEMPTS}...`,
      );
      setTimeout(() => {
        client.start();
      }, 1500);
    }
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
      jid: "50414477168824@s.whatsapp.net",
    },
    {
      name: "",
      lid: "51664513925368@lid",
      jid: "51664513925368@s.whatsapp.net",
    },
  ],
  settings: { noWelcome: false },
  commandsPath: "./plugins",
  onConnected: () => {
    repairAttempts = 0;
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

/* =========== Config ========== */
const { config } = client;
config.info = {
  nameBot: "𝑲𝑨𝑰𝑻𝑶​│𝑩𝑳𝑶𝑫〈",
  nameChannel: " 𝑲𝑨𝑰𝑻𝑶​│~ 𝑩𝑳𝑶𝑫 🕷️",
  idChannel: "120363411379664683@newsletter",
  urls: {
    repo: "https://github.com/deveni0/Pomni-AI",
    api: "https://emam-api.web.id",
    channel: "https://whatsapp.com/channel/0029VbDDlh74IBhMBDrE3f3o",
  },
  copyright: {
    pack: "𝑲𝑨𝑰𝑻𝑶 𝑩𝑶𝑻",
    author: "𝑲𝑨𝑰𝑻𝑶 𝑲𝑨𝑰",
  },
  images: [
    "https://files.catbox.moe/z1lxci.jpg",
    "https://files.catbox.moe/avfavn.jpg",
    "https://files.catbox.moe/sm8sye.jpg",
  ],
};

/* =========== Seed dashboard state ========== */
state.phoneNumber = "963934149274";
state.botName = "KAITO Bot";
pushUpdate();

/* =========== Wipe stale session on exit ========== */
function wipeSession() {
  try {
    const sessionDir = path.resolve("./session");
    fs.rmSync(sessionDir, { recursive: true, force: true });
    fs.mkdirSync(sessionDir, { recursive: true });
  } catch (_) {}
}

for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, () => {
    wipeSession();
    process.exit(0);
  });
}

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
  repairAttempts = 0;
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
  wipeSession();
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  wipeSession();
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
