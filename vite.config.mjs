import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, 'data');

function localDataFolderPlugin() {
  return {
    name: 'local-data-folder',
    configureServer(server) {
      server.middlewares.use('/data', (request, response, next) => {
        const requestedFile = decodeURIComponent((request.url || '').split('?')[0]).replace(/^\/+/, '');
        const filePath = path.resolve(dataDir, requestedFile);

        if (!filePath.startsWith(`${dataDir}${path.sep}`) || path.extname(filePath) !== '.json') {
          next();
          return;
        }

        fs.readFile(filePath, 'utf8', (error, content) => {
          if (error) {
            next();
            return;
          }

          response.setHeader('Content-Type', 'application/json; charset=utf-8');
          response.end(content);
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localDataFolderPlugin()],
});
