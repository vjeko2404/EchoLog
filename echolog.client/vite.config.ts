import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite'

// Force dev-time backend URL (proxy only used in dev mode)
const backendUrl = 'https://localhost:5000';

const isDev = process.env.NODE_ENV !== 'production';

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
        port: isDev ? 52664 : 5001, // dev = 52664, prod = 5001 (or serve ignores this anyway)
        strictPort: true,
        ...(isDev && { https }), // Only include https certs during dev
        proxy: isDev
            ? {
                '/api': {
                    target: backendUrl,
                    changeOrigin: true,
                    secure: false,
                },
            }
            : undefined,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
});
