import { defineConfig } from 'vite';

/* O site é estático e publicado pelo GitHub Pages direto do branch main.
   O Vite compila só o guia de envio (React) em dois arquivos fixos,
   versionados no repositório e carregados por como-enviar.html:
     assets/stepper/guia-envio.js   (script IIFE, funciona sem servidor)
     assets/stepper/guia-envio.css
   Depois de mudar algo em src/stepper/, rode `npm run build` e faça o
   commit dos dois arquivos gerados. */
export default defineConfig({
  // Subdiretório do GitHub Pages (https://lorenzo-or7.github.io/namba-demo/).
  // Vale para o servidor local (`npm run serve`); o pacote gerado não usa
  // caminhos absolutos, então funciona também aberto direto do disco.
  base: '/namba-demo/',
  publicDir: false,
  // React lê process.env.NODE_ENV; no modo biblioteca o Vite não substitui.
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  oxc: { jsx: { runtime: 'automatic' } },
  build: {
    outDir: 'assets/stepper',
    emptyOutDir: true,
    copyPublicDir: false,
    sourcemap: false,
    rollupOptions: {
      // O Stepper do React Bits começa com 'use client' (diretiva do Next.js);
      // fora do Next ela não tem efeito e pode ser ignorada.
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      }
    },
    lib: {
      entry: 'src/stepper/main.jsx',
      name: 'NambaGuiaEnvio',
      formats: ['iife'],
      fileName: () => 'guia-envio.js',
      cssFileName: 'guia-envio'
    }
  }
});
