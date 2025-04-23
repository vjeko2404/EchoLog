import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

// Load .env manually because Vite doesn't do it in config
dotenv.config();

const backendUrl = process.env.VITE_API_URL;
const isDev = process.env.NODE_ENV !== 'production';

if (!process.env.VITE_PORT) {
    throw new Error("VITE_PORT is not defined in .env");
}

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: true,
        port: Number(process.env.VITE_PORT),
        strictPort: true,
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
