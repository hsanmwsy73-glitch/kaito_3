import { Client } from 'meowsab';
import { group, access } from "./system/control.js";
import UltraDB from "./system/UltraDB.js";
import sub from './sub.js';
import { startDashboard, state, pushUpdate } from './dashboard.js';
import fs from 'fs';
import path from 'path';

/* =========== Dashboard ========== */
startDashboard();

/* =========== Re-pairing retry config ========== */
const MAX_REPAIR_ATTEMPTS = parseInt(process.env.MAX_REPAIR_ATTEMPTS ?? '3', 10);
let repairAttempts = 0;

/* =========== Intercept stdout to capture pairing code ========== */
const _stripAnsi = (str) => str.replace(/\x1B\[[0-9;]*[mGKHF]/g, '').replace(/\x1B\][^\x07]*\x07/g, '');
const _origWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, ...rest) => {
  const raw = typeof chunk === 'string' ? chunk : chunk.toString();
  const line = _stripAnsi(raw);
  const match = line.match(/Pairing\s*Code\s+([A-Z0-9]{4,})/i);
  if (match) {
    state.pairingCode = match[1];
    state.status = 'connecting';
    pushUpdate();
  }
  if (/Session logged out/i.test(line)) {
    if (repairAttempts >= MAX_REPAIR_ATTEMPTS) {
      state.status = 'failed';
      state.pairingCode = null;
      state.repairAttempts = repairAttempts;
      pushUpdate();
      console.error(`[Bot] Re-pairing limit reached (${MAX_REPAIR_ATTEMPTS} attempts). Giving up to prevent endless restart loop.`);
    } else {
      repairAttempts += 1;
      const sessionDir = path.resolve('./session');
      fs.rmSync(sessionDir, { recursive: true, force: true });
      fs.mkdirSync(sessionDir, { recursive: true });
      state.status = 're-pairing';
      state.pairingCode = null;
      state.repairAttempts = repairAttempts;
      pushUpdate();
      console.log(`[Bot] Re-pairing attempt ${repairAttempts}/${MAX_REPAIR_ATTEMPTS}...`);
      setTimeout(() => {
        client.start();
      }, 1500);
    }
  }
  return _origWrite(chunk, ...rest);
};

/* =========== Client ========== */
const client = new Client({
  phoneNumber: '9647844320011', // Bot number
  prefix: [".", "/", "!"],
  fromMe: false, 
  owners: [
  // Owner 1
    { name:"kaito", lid: "247579682029763@lid", jid: "963934149274@s.whatsapp.net" },
  // Owner 2
    { name: "", lid: "221307316789354@lid", jid: "@s.whatsapp.net" },
  // Owner 3
    { name: "", jid: "@s.whatsapp.net", lid: "50414477168824@lid" },
  // Owner 4 
   { name: "", jid: "@s.whatsapp.net", lid: "51664513925368@lid" }
  ],
  settings: { noWelcome: false },
  commandsPath: './plugins',
  onConnected: () => {
    repairAttempts = 0;
    state.status = 'connected';
    state.connectedAt = new Date().toISOString();
    state.repairAttempts = 0;
    pushUpdate();
  },
  onDisconnected: () => {
    state.status = 'disconnected';
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
  idChannel: "120363225356834044@newsletter",
  urls: {
    repo: "https://github.com/deveni0/Pomni-AI",
    api: "https://emam-api.web.id",
    channel: "https://whatsapp.com/channel/0029VaQim2bAu3aPsRVaDq3v"
  },
  copyright: { 
    pack: 'ڤـ ـ VA ـ ـا', 
    author: 'VA'
  },
  images: [
    "https://i.pinimg.com/originals/11/26/97/11269786cdb625c60213212aa66273a9.png",
    "https://i.pinimg.com/originals/e2/21/20/e221203f319df949ee65585a657501a2.jpg",
    "https://i.pinimg.com/originals/bb/77/0f/bb770fad66a634a6b3bf93e9c00bf4e5.jpg"
  ]
};

/* =========== Seed dashboard state ========== */
state.phoneNumber = '9647844320011';
state.botName = 'KAITO Bot';
pushUpdate();

/* =========== Wipe stale session on exit ========== */
function wipeSession() {
  try {
    const sessionDir = path.resolve('./session');
    fs.rmSync(sessionDir, { recursive: true, force: true });
    fs.mkdirSync(sessionDir, { recursive: true });
  } catch (_) {}
}

for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(sig, () => {
    wipeSession();
    process.exit(0);
  });
}

/* =========== Validate session before connecting ========== */
(function validateSession() {
  const credsPath = path.resolve('./session/creds.json');
  try {
    if (!fs.existsSync(credsPath)) return;
    const raw = fs.readFileSync(credsPath, 'utf8').trim();
    if (!raw) throw new Error('empty');
    JSON.parse(raw);
  } catch (_) {
    console.log('[Bot] Stale or invalid session detected — wiping before connect.');
    wipeSession();
  }
})();

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
process.on('uncaughtException', (e) => {
    if (e.message.includes('rate-overlimit')) return;
    console.error('Uncaught Exception:', e.message);
    wipeSession();
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
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
