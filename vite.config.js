import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function adminApiPlugin() {
  const sessionsFilePath = path.resolve(__dirname, 'src/data/student_sessions.json');

  const readSessions = () => {
    try {
      if (fs.existsSync(sessionsFilePath)) {
        const raw = fs.readFileSync(sessionsFilePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading student sessions file:', e);
    }
    return [];
  };

  const writeSessions = (data) => {
    try {
      fs.writeFileSync(sessionsFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing student sessions file:', e);
    }
  };

  return {
    name: 'admin-api-plugin',
    configureServer(server) {
      // Obscure path /anskey SPA routing fallback
      server.middlewares.use((req, res, next) => {
        if (req.url === '/anskey' || req.url === '/anskey/') {
          req.url = '/index.html';
        }
        next();
      });

      server.middlewares.use((req, res, next) => {
        // Handle /api/sessions
        if (req.url === '/api/sessions' || req.url?.startsWith('/api/sessions')) {
          res.setHeader('Content-Type', 'application/json');

          if (req.method === 'GET') {
            const data = readSessions();
            res.statusCode = 200;
            res.end(JSON.stringify(data));
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const newRecord = JSON.parse(body);
                // Extract client remote IP
                const remoteIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
                if (!newRecord.location) newRecord.location = {};
                if (!newRecord.location.ip || newRecord.location.ip === 'Unknown IP') {
                  newRecord.location.ip = remoteIp.toString().replace('::ffff:', '');
                }

                const current = readSessions();
                const updated = [newRecord, ...current.filter(s => s.id !== newRecord.id)];
                writeSessions(updated);
                res.statusCode = 201;
                res.end(JSON.stringify(newRecord));
              } catch (err) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON body' }));
              }
            });
            return;
          }

          if (req.method === 'DELETE') {
            const parts = req.url.split('/');
            const id = parts[3]; // /api/sessions/:id
            if (id) {
              const current = readSessions();
              const filtered = current.filter(s => s.id !== id);
              writeSessions(filtered);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, deleted: id }));
            } else {
              // clear all
              writeSessions([]);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, cleared: true }));
            }
            return;
          }
        }

        next();
      });
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), adminApiPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
