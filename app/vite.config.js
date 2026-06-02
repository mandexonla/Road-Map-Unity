import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: './',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
  plugins: [
    {
      name: 'serve-unity-docs',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          let reqPath = req.url.split('?')[0]; // strip query params
          reqPath = decodeURIComponent(reqPath);

          const prefix = '/UnityDocumentation/';
          const index = reqPath.indexOf(prefix);

          if (index !== -1) {
            const relativePart = reqPath.substring(index + prefix.length);
            const filePath = resolve(__dirname, '..', 'UnityDocumentation', relativePart);
            
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              let contentType = 'text/html';
              const ext = path.extname(filePath).toLowerCase();
              if (ext === '.css') contentType = 'text/css';
              else if (ext === '.js') contentType = 'application/javascript';
              else if (ext === '.json') contentType = 'application/json';
              else if (ext === '.png') contentType = 'image/png';
              else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
              else if (ext === '.gif') contentType = 'image/gif';
              else if (ext === '.svg') contentType = 'image/svg+xml';
              else if (ext === '.ico') contentType = 'image/x-icon';

              res.setHeader('Content-Type', contentType);
              res.setHeader('Cache-Control', 'max-age=3600');
              const stream = fs.createReadStream(filePath);
              stream.pipe(res);
              return;
            }
          }
          next();
        });
      }
    }
  ]
});
