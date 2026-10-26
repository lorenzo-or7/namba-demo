/* Ponto de entrada do guia de envio. Compilado pelo Vite em
   assets/stepper/guia-envio.js (script comum, sem módulos), que a página
   como-enviar.html carrega. O resto do site continua em HTML/CSS/JS puro. */
import { createRoot } from 'react-dom/client';
import NambaGuide, { RESUME_KEY } from './NambaGuide.jsx';
import './NambaGuide.css';

/* Lê o marcador deixado ao abrir a carta de envio. Ele guarda só o número
   da etapa e a hora, nada de dados pessoais, e é apagado ao ser lido. */
function readResume() {
  try {
    const raw = sessionStorage.getItem(RESUME_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(RESUME_KEY);
    const data = JSON.parse(raw);
    if (!data || typeof data.step !== 'number' || Date.now() - data.t > 60 * 60 * 1000) return null;
    const nav = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
    const back = nav && nav.type === 'back_forward';
    const fromCarta = /carta-envio\.html/.test(document.referrer || '');
    return back || fromCarta ? data.step : null;
  } catch (e) {
    return null;
  }
}

function start() {
  const trigger = document.getElementById('guiaEnvioBtn');
  if (!trigger) return;
  let mount = document.getElementById('namba-stepper-root');
  if (!mount) {
    mount = document.createElement('div');
    mount.id = 'namba-stepper-root';
    document.body.appendChild(mount);
  }
  createRoot(mount).render(<NambaGuide trigger={trigger} resumeStep={readResume()} />);
  trigger.hidden = false;
}

/* Voltando pelo histórico com a página restaurada da memória (bfcache),
   o guia já está como a pessoa deixou: só descarta o marcador. */
window.addEventListener('pageshow', event => {
  if (event.persisted) {
    try {
      sessionStorage.removeItem(RESUME_KEY);
    } catch (e) {
      /* nada a limpar */
    }
  }
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
