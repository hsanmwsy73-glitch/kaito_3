import { Client } from 'meowsab';
import { group, access } from "./system/control.js";
import UltraDB from "./system/UltraDB.js";
import sub from './sub.js';
import { startDashboard, state, pushUpdate } from './dashboard.js';

/* =========== Dashboard ========== */
startDashboard(5000);

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
    state.status = 'disconnected';
    pushUpdate();
  }
  return _origWrite(chunk, ...rest);
};

/* =========== Client ========== */
const client = new Client({
  phoneNumber: '201093036797', // Bot number
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
    state.status = 'connected';
    state.connectedAt = new Date().toISOString();
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
  nameChannel: "𝐕𝐈𝐈7 ~ 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 🕷️", 
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
state.phoneNumber = '201093036797';
state.botName = 'KAITO Bot';
pushUpdate();

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
    if (e.message.includes('rate-overlimit')) {}
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
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
