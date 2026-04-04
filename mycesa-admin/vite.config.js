import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [],  // Pas d'assets Vite - on utilise CDN Bootstrap
            refresh: true,
        }),
    ],
});
