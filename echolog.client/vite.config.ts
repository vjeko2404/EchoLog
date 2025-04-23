import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite'

// Force dev-time backend URL (proxy only used in dev mode)
const backendUrl = 'https://localhost:5000';

// mkcert - install
// mkcert - key - file localhost - key.pem - cert - file localhost.pem localhost
// SSL certificates (for Vite HTTPS)
const certPath = path.resolve(__dirname, 'certs');
const keyPath = path.join(certPath, 'localhost-key.pem');
const certPathFull = path.join(certPath, 'localhost.pem');

let https = undefined;
if (fs.existsSync(keyPath) && fs.existsSync(certPathFull)) {
    https = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPathFull),
    };
}

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: true,
        port: 52664,
        strictPort: true,
        https,
        proxy: {
            '/api': {
                target: backendUrl,
                changeOrigin: true,
                secure: false
            }
        }
    }
});
