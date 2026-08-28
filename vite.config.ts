import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';
import type { IncomingMessage, ServerResponse } from 'http';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'sheets-sync-api',
      configureServer(server) {
        server.middlewares.use('/api/sync', (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
          });

          const send = (msg: string) => res.write(`data: ${JSON.stringify({ msg })}\n\n`);

          send('Iniciando sincronización con Google Sheets...');

          const py = spawn('python', ['build_json.py'], {
            cwd: process.cwd(),
            env: { ...process.env }
          });

          py.stdout.on('data', (data: Buffer) => {
            data.toString().split('\n').filter(Boolean).forEach(line => send(line));
          });

          py.stderr.on('data', (data: Buffer) => {
            send(`ERROR: ${data.toString().trim()}`);
          });

          py.on('close', (code: number) => {
            if (code === 0) {
              send('✅ Sync completado exitosamente');
              res.write(`data: ${JSON.stringify({ done: true, success: true })}\n\n`);
            } else {
              send(`❌ Error en sync (código ${code})`);
              res.write(`data: ${JSON.stringify({ done: true, success: false })}\n\n`);
            }
            res.end();
          });

          req.on('close', () => py.kill());
        });
      }
    }
  ],
  server: {
    port: 3000,
    open: true
  }
});
