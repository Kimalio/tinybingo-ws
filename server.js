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

// Подключаем клиентов к Yjs-доку по URL вида /<roomId>
wss.on('connection', (conn, req) => {
    // Можно прокинуть опции, но по умолчанию уже хорошо
    setupWSConnection(conn, req);
});

const PORT = process.env.PORT || 1234;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`y-websocket server listening on ${HOST}:${PORT}`);
});
