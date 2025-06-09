import http from 'http';
import net from 'net';
import { WebSocketServer } from 'ws';

const VPS_HOST = '34.176.21.72'; // <--- pon tu IP
const VPS_PORT = 22;          // o el puerto SSH o backend personalizado

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Servidor WebSocket funcionando\n');
});

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  if (req.url !== '/app53') return socket.destroy();

  wss.handleUpgrade(req, socket, head, (ws) => {
    const tunnel = net.connect(VPS_PORT, VPS_HOST, () => {
      console.log('Conectado al VPS');
    });

    ws.on('message', (msg) => {
      tunnel.write(msg);
    });

    tunnel.on('data', (data) => {
      ws.send(data);
    });

    ws.on('close', () => tunnel.end());
    tunnel.on('close', () => ws.close());
    tunnel.on('error', () => ws.close());
  });
});

server.listen(process.env.PORT || 8080, () => {
  console.log('Servidor WebSocket listo');
});
