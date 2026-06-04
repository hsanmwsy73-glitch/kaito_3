import express from 'express';
import { createServer } from 'http';

const app = express();
const server = createServer(app);

export const state = {
  status: 'connecting',
  pairingCode: null,
  phoneNumber: null,
  botName: null,
  commandCount: 0,
  uptime: null,
  connectedAt: null,
};

const clients = new Set();

export function pushUpdate() {
  const data = `data: ${JSON.stringify(state)}\n\n`;
  for (const res of clients) {
    res.write(data);
  }
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KAITO Bot Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0d0d0d;
      color: #e0e0e0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card {
      background: #161616;
      border: 1px solid #2a2a2a;
      border-radius: 20px;
      padding: 48px 40px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.5);
    }

    .logo {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -1px;
      background: linear-gradient(135deg, #25d366, #128c7e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 4px;
    }

    .subtitle {
      font-size: 13px;
      color: #555;
      margin-bottom: 36px;
      letter-spacing: 0.5px;
    }

    .status-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
      transition: background 0.4s;
    }
    .dot.connecting { background: #f59e0b; animation: pulse 1.4s infinite; }
    .dot.connected  { background: #25d366; }
    .dot.disconnected { background: #ef4444; }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .status-label {
      font-size: 15px;
      font-weight: 600;
      text-transform: capitalize;
    }

    .section {
      background: #1e1e1e;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #555;
      margin-bottom: 10px;
    }

    .section-value {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #fff;
      font-family: 'Courier New', monospace;
    }

    .section-value.pairing {
      color: #25d366;
      font-size: 28px;
    }

    .section-value.none {
      font-size: 14px;
      color: #444;
      font-family: inherit;
      letter-spacing: 0;
      font-weight: 400;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .info-item {
      background: #1e1e1e;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 16px 20px;
    }

    .info-item .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #555;
      margin-bottom: 6px;
    }

    .info-item .value {
      font-size: 15px;
      font-weight: 600;
      color: #e0e0e0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .instructions {
      margin-top: 24px;
      font-size: 13px;
      color: #444;
      line-height: 1.7;
      text-align: center;
    }

    .instructions b { color: #777; }

    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: #25d366;
      background: rgba(37,211,102,0.08);
      border: 1px solid rgba(37,211,102,0.2);
      border-radius: 20px;
      padding: 3px 10px;
      margin-left: auto;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #25d366;
      animation: pulse 1.4s infinite;
    }
  </style>
</head>
<body>
  <div class="card">
    <div style="display:flex;align-items:center;margin-bottom:4px;">
      <div class="logo" id="botName">KAITO Bot</div>
      <div class="live-badge"><div class="live-dot"></div> LIVE</div>
    </div>
    <div class="subtitle">WhatsApp Bot Dashboard</div>

    <div class="status-row">
      <div class="dot connecting" id="dot"></div>
      <div class="status-label" id="statusLabel">Connecting...</div>
    </div>

    <div class="section" id="pairingSection">
      <div class="section-title">Pairing Code</div>
      <div class="section-value pairing none" id="pairingCode">Waiting...</div>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <div class="label">Phone Number</div>
        <div class="value" id="phoneNumber">—</div>
      </div>
      <div class="info-item">
        <div class="label">Commands</div>
        <div class="value" id="commandCount">—</div>
      </div>
    </div>

    <div class="instructions" id="instructions">
      Open <b>WhatsApp</b> → <b>Linked Devices</b> → <b>Link a Device</b><br>
      Then enter the pairing code shown above.
    </div>
  </div>

  <script>
    const es = new EventSource('/events');
    const dot = document.getElementById('dot');
    const statusLabel = document.getElementById('statusLabel');
    const pairingCode = document.getElementById('pairingCode');
    const phoneNumber = document.getElementById('phoneNumber');
    const commandCount = document.getElementById('commandCount');
    const botName = document.getElementById('botName');
    const instructions = document.getElementById('instructions');

    es.onmessage = (e) => {
      const s = JSON.parse(e.data);

      botName.textContent = s.botName || 'KAITO Bot';
      phoneNumber.textContent = s.phoneNumber || '—';
      commandCount.textContent = s.commandCount ? s.commandCount + ' loaded' : '—';

      dot.className = 'dot ' + s.status;

      if (s.status === 'connected') {
        statusLabel.textContent = 'Connected ✓';
        pairingCode.textContent = 'Device linked';
        pairingCode.classList.remove('none');
        instructions.textContent = 'Bot is online and ready to receive commands.';
      } else if (s.status === 'disconnected') {
        statusLabel.textContent = 'Disconnected';
        pairingCode.textContent = s.pairingCode || 'Waiting...';
        instructions.innerHTML = 'Session ended. Restart the bot to re-pair.';
      } else {
        statusLabel.textContent = 'Waiting for pairing...';
        if (s.pairingCode) {
          pairingCode.textContent = s.pairingCode;
          pairingCode.classList.remove('none');
        } else {
          pairingCode.textContent = 'Generating...';
          pairingCode.classList.add('none');
        }
        instructions.innerHTML = 'Open <b>WhatsApp</b> → <b>Linked Devices</b> → <b>Link a Device</b><br>Then enter the pairing code shown above.';
      }
    };
  </script>
</body>
</html>`;

app.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(HTML);
});

app.get('/api/status', (_req, res) => {
  res.json(state);
});

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify(state)}\n\n`);
  clients.add(res);

  req.on('close', () => clients.delete(res));
});

export function startDashboard(port = 5000) {
  server.listen(port, '0.0.0.0', () => {
    console.log(`✓ Dashboard running at http://0.0.0.0:${port}`);
  });
}
