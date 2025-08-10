// CommonJS-версия (без ES-модулей), чтобы точно работало на Render
const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
// В CJS правильный путь без .js на конце:
const { setupWSConnection } = require('y-websocket/bin/utils');

const app = express();

// простые проверки доступности
app.get('/', (_req, res) => res.send('tinybingo y-websocket: ok'));
app.get('/healthz', (_req, res) => res.send('ok'));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// --- Heartbeat: держим соединения живыми и чистим "мертвые" ---
function heartbeat() { this.isAlive = true }

// Подключаем клиентов к Yjs-доку по URL вида /<roomId>
wss.on('connection', (conn, req) => {
  // помечаем как живое и ждём pong
  conn.isAlive = true
  conn.on('pong', heartbeat)

  // стандартная интеграция с y-websocket
  setupWSConnection(conn, req)
})

// каждые 30 сек пингуем всех; кто не ответил — закрываем
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      try { ws.terminate() } catch {}
      return
    }
    ws.isAlive = false
    try { ws.ping() } catch {}
  })
}, 30000)

wss.on('close', () => clearInterval(interval))

const PORT = process.env.PORT || 1234;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`y-websocket server listening on ${HOST}:${PORT}`);
});
