import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite'

// Force dev-time backend URL (proxy only used in dev mode)
const backendUrl = 'https://localhost:5000';

// SSL certificates (for Vite HTTPS)
const certPath = path.resolve(__dirname, 'certs');
const https = {
    key: fs.readFileSync(path.join(certPath, 'localhost-key.pem')),
    cert: fs.readFileSync(path.join(certPath, 'localhost.pem')),
};

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
