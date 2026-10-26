/* Guia de envio passo a passo (página "Como enviar").

   Modal com o Stepper original do React Bits. Os textos vêm da própria
   página como-enviar.html: nenhuma regra, prazo ou preço novo.
   O tema acompanha o alternador do site (atributo data-theme no <html>
   ou, sem escolha salva, a preferência do sistema). */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Tick02Icon, FileEditIcon } from '@hugeicons/core-free-icons';
import Stepper, { Step } from './Stepper.jsx';

export const RESUME_KEY = 'namba-guia-envio';
const TOTAL = 5;
const CARTA_STEP = 2;

/* Cores do site aplicadas às variáveis do Stepper. Só a identidade visual
   muda; estrutura, glider, spring e transições continuam os originais. */
const NAMBA_THEMES = {
  light: {
    '--stepper-frame': '#E7EAE8',
    '--stepper-frame-edge': 'rgba(28, 34, 32, 0.08)',
    '--stepper-frame-highlight': 'rgba(255, 255, 255, 0.9)',
    '--stepper-frame-shadow': '0 1px 0 rgba(255, 255, 255, 0.6), 0 10px 24px -18px rgba(28, 34, 32, 0.45)',
    '--stepper-tile': 'linear-gradient(180deg, #ffffff 0%, #f5f6f5 100%)',
    '--stepper-tile-edge': 'rgba(28, 34, 32, 0.1)',
    '--stepper-tile-highlight': 'rgba(255, 255, 255, 1)',
    '--stepper-tile-shadow': '0 4px 10px -5px rgba(28, 34, 32, 0.3)',
    '--stepper-well': 'rgba(28, 34, 32, 0.06)',
    '--stepper-track': 'rgba(28, 34, 32, 0.1)',
    '--stepper-ink': '#1C2220',
    '--stepper-muted': 'rgba(28, 34, 32, 0.66)',
    '--stepper-faint': 'rgba(28, 34, 32, 0.22)',
    '--stepper-ring': 'rgba(28, 34, 32, 0.3)',
    '--stepper-hover-fill': 'rgba(28, 34, 32, 0.04)'
  },
  dark: {
    '--stepper-frame': '#121715',
    '--stepper-frame-edge': 'rgba(255, 255, 255, 0.07)',
    '--stepper-frame-highlight': 'rgba(255, 255, 255, 0.05)',
    '--stepper-frame-shadow': '0 10px 24px -18px rgba(0, 0, 0, 0.9)',
    '--stepper-tile': 'linear-gradient(180deg, #2b3330 0%, #1f2724 100%)',
    '--stepper-tile-edge': 'rgba(255, 255, 255, 0.08)',
    '--stepper-tile-highlight': 'rgba(255, 255, 255, 0.1)',
    '--stepper-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.75)',
    '--stepper-well': 'rgba(255, 255, 255, 0.06)',
    '--stepper-track': 'rgba(255, 255, 255, 0.1)',
    '--stepper-ink': '#E3E8E5',
    '--stepper-muted': 'rgba(227, 232, 229, 0.64)',
    '--stepper-faint': 'rgba(255, 255, 255, 0.24)',
    '--stepper-ring': 'rgba(227, 232, 229, 0.3)',
    '--stepper-hover-fill': 'rgba(255, 255, 255, 0.04)'
  }
};
/* Vermelho de botão do site (--canon-fill), com contraste AA para texto branco. */
const ACCENT = { light: '#C8161E', dark: '#C42129' };

function siteTheme() {
  const t = document.documentElement.getAttribute('data-theme');
  if (t === 'dark' || t === 'light') return t;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function useSiteTheme() {
  const [theme, setTheme] = useState(siteTheme);
  useEffect(() => {
    const update = () => setTheme(siteTheme());
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    media?.addEventListener?.('change', update);
    return () => {
      observer.disconnect();
      media?.removeEventListener?.('change', update);
    };
  }, []);
  return theme;
}

function reducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function prazo(nome, padrao) {
  const p = (window.NAMBA_CONFIG && window.NAMBA_CONFIG.prazos) || {};
  return p[nome] || padrao;
}

function waEnvio() {
  const N = window.NAMBA;
  return N && typeof N.wa === 'function' ? N.wa('envio') : 'https://whats.link/namba';
}

export default function NambaGuide({ trigger, resumeStep = null }) {
  const base = document.body.getAttribute('data-base') || '';
  const theme = useSiteTheme();
  const dialogRef = useRef(null);
  const headingRef = useRef(null);
  const savedOverflow = useRef(null);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [step, setStep] = useState(1);

  const openGuide = useCallback(atStep => {
    setStep(current => (typeof atStep === 'number' ? atStep : current > TOTAL ? 1 : current));
    setOpen(true);
  }, []);

  const closeGuide = useCallback(() => setOpen(false), []);

  /* Botão da página abre o guia. */
  useEffect(() => {
    if (!trigger) return;
    const onClick = () => openGuide();
    trigger.addEventListener('click', onClick);
    return () => trigger.removeEventListener('click', onClick);
  }, [trigger, openGuide]);

  /* Volta da carta de envio: reabre na etapa em que a pessoa estava. */
  useEffect(() => {
    if (typeof resumeStep === 'number') openGuide(Math.min(Math.max(1, resumeStep), TOTAL));
  }, [resumeStep, openGuide]);

  /* Abre/fecha o <dialog> nativo: o fundo fica inerte, Esc fecha e o foco
     fica preso no modal. A rolagem da página é travada enquanto ele está aberto. */
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const root = document.documentElement;
    if (open && !dialog.open) {
      savedOverflow.current = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
      const gap = window.innerWidth - root.clientWidth;
      root.style.overflow = 'hidden';
      if (gap > 0) root.style.paddingRight = `${gap}px`;
      dialog.showModal();
      dialog.scrollTop = 0;
      setShown(true);
      headingRef.current?.focus({ preventScroll: true });
    } else if (!open && dialog.open) {
      dialog.close();
    }
    if (!open && savedOverflow.current) {
      root.style.overflow = savedOverflow.current.overflow;
      root.style.paddingRight = savedOverflow.current.paddingRight;
      savedOverflow.current = null;
      if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
    }
  }, [open, trigger]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = event => {
      event.preventDefault();
      setOpen(false);
    };
    const onClose = () => setOpen(false);
    const onBackdrop = event => {
      if (event.target === dialog) setOpen(false);
    };
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('close', onClose);
    dialog.addEventListener('click', onBackdrop);
    return () => {
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('click', onBackdrop);
    };
  }, []);

  /* Etapas longas no celular: ao trocar, volta ao topo do conteúdo. */
  const goTo = next => {
    setStep(next);
    const dialog = dialogRef.current;
    if (dialog && dialog.scrollTop > 0) dialog.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  const toggleTheme = () => {
    const button = document.getElementById('themeBtn');
    if (button) {
      button.click();
      return;
    }
    const next = siteTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('namba-theme', next);
    } catch (e) {
      /* sem armazenamento: o tema vale só para esta visita */
    }
  };

  const rememberStep = () => {
    try {
      sessionStorage.setItem(RESUME_KEY, JSON.stringify({ step: CARTA_STEP, t: Date.now() }));
    } catch (e) {
      /* sem sessionStorage o guia apenas não reabre sozinho */
    }
  };

  const themeIcons = document.getElementById('themeBtn')?.innerHTML || '';
  const orcamento = prazo('orcamento', '2 a 3 dias úteis');

  const completed = (
    <div className="guide-step guide-done">
      <span className="guide-done-mark" aria-hidden="true">
        <HugeiconsIcon icon={Tick02Icon} size={26} strokeWidth={2.4} />
      </span>
      <h3>Tudo pronto para preparar seu envio!</h3>
      <p>Agora você já conhece as orientações para enviar seu equipamento à Cine Camera Service.</p>
      <div className="actions">
        <button type="button" className="btn btn-red" onClick={closeGuide}>
          Fechar guia
        </button>
        <button type="button" className="btn btn-line" onClick={() => goTo(1)}>
          Revisar etapas
        </button>
      </div>
      <a className="guide-wa" href={waEnvio()} target="_blank" rel="noopener">
        Dúvida sobre o envio? WhatsApp
      </a>
    </div>
  );

  return (
    <dialog
      ref={dialogRef}
      className="guide-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      aria-describedby="guide-desc"
    >
      <div className="guide-head">
        <div className="guide-head-text">
          <p className="guide-kicker">Como enviar</p>
          <h2 id="guide-title" ref={headingRef} tabIndex={-1}>
            Guia de envio passo a passo
          </h2>
          <p id="guide-desc" className="sr-only">
            Cinco etapas: preparação, carta de envio, embalagem, conferência e postagem. Use Continuar e Voltar ou os
            números das etapas para navegar. Esc fecha o guia.
          </p>
        </div>
        <div className="guide-head-tools">
          {themeIcons && (
            <button
              type="button"
              className="icon-btn theme-btn"
              aria-label="Alternar tema claro ou escuro"
              onClick={toggleTheme}
              dangerouslySetInnerHTML={{ __html: themeIcons }}
            />
          )}
          <button type="button" className="icon-btn guide-close" aria-label="Fechar guia" onClick={closeGuide}>
            <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="guide-body">
        {shown && (
          <Stepper
            className="namba-guide"
            step={step}
            onStepChange={goTo}
            onFinalStepCompleted={() => goTo(TOTAL + 1)}
            indicator="numbers"
            orientation="horizontal"
            transition="slide"
            linear={false}
            theme={theme}
            accentColor={ACCENT[theme]}
            radius={12}
            width="100%"
            stepLabel="Etapa"
            backButtonText="Voltar"
            nextButtonText="Continuar"
            completeButtonText="Concluir guia"
            completedContent={completed}
            style={NAMBA_THEMES[theme]}
          >
            <Step title="Preparação">
              <div className="guide-step">
                <p className="guide-count">Etapa 1 de {TOTAL}</p>
                <h3>Antes de começar</h3>
                <h4>Só equipamentos fotográficos Canon</h4>
                <p>
                  Reparamos apenas câmeras, objetivas e flashes, e apenas da marca <strong>Canon</strong>.
                </p>
                <h4>Retire os acessórios</h4>
                <p>
                  Tire capa, alça, bateria, cartão de memória, filtro, manuais e CD, e guarde com você. Mande um
                  acessório só se ele tiver relação com o defeito: com aviso de bateria fraca, mande bateria e
                  carregador; com erro de cartão, mande o cartão depois de baixar as fotos. Envie o equipamento apenas
                  com as tampas de proteção da câmera e da objetiva.
                </p>
                <div className="callout">
                  <strong>Equipamento na garantia?</strong> Se ainda estiver na garantia do fabricante, ligue antes
                  para o SAC Canon, <a href="tel:08002022666">0800-202-2666</a>, para receber as instruções.
                </div>
              </div>
            </Step>

            <Step title="Carta">
              <div className="guide-step">
                <p className="guide-count">Etapa 2 de {TOTAL}</p>
                <h3>Preencha e imprima a carta de envio</h3>
                <p>Preencha a carta de envio com seus dados, imprima e coloque junto com o equipamento.</p>
                <div className="callout">
                  <strong>Não mande a carta por e-mail.</strong> Ela vai impressa, dentro da caixa, junto com o
                  equipamento.
                </div>
                <h4>Enviando em nome de empresa</h4>
                <p>
                  Se for <strong>pessoa jurídica</strong>, mande também a nota fiscal de remessa para conserto e
                  informe o nome e o celular da pessoa de contato.
                </p>
                <div className="guide-carta">
                  <a className="btn btn-line" href={`${base}carta-envio.html`} onClick={rememberStep}>
                    <HugeiconsIcon icon={FileEditIcon} size={18} strokeWidth={1.8} />
                    Preencher minha carta de envio
                  </a>
                  <p className="guide-hint">
                    Abre o formulário da carta. Ao voltar para esta página, o guia reabre nesta etapa. Você também pode
                    seguir o guia e preencher a carta depois.
                  </p>
                </div>
              </div>
            </Step>

            <Step title="Embalagem">
              <div className="guide-step">
                <p className="guide-count">Etapa 3 de {TOTAL}</p>
                <h3>Embale bem</h3>
                <figure className="guide-figure">
                  <img
                    src={`${base}assets/img/camera-embalada.jpg`}
                    width="960"
                    height="640"
                    decoding="async"
                    alt="Câmera Canon EOS dentro de uma caixa com plástico-bolha, com a carta de envio impressa ao lado"
                  />
                  <figcaption>
                    É assim que o equipamento deve chegar: bem no meio da caixa, cercado de plástico-bolha, com a carta
                    de envio impressa dentro do saquinho.
                  </figcaption>
                </figure>
                <p>
                  Coloque o equipamento e a carta num saquinho plástico vedado com fita. Se estiver na garantia, inclua
                  a cópia da nota fiscal de compra. Use uma caixa pequena com bastante jornal amassado ou plástico-bolha,
                  deixando o equipamento bem no meio, como a gema de um ovo.
                </p>
                <div className="callout">
                  <strong>Não use a caixa original:</strong> ela será descartada, porque não temos onde guardá-la.
                </div>
              </div>
            </Step>

            <Step title="Conferência">
              <div className="guide-step">
                <p className="guide-count">Etapa 4 de {TOTAL}</p>
                <h3>Antes de fechar a caixa, confira</h3>
                <ul className="guide-list">
                  <li>
                    Acessórios retirados. Vai só o equipamento, com as tampas de proteção da câmera e da objetiva (e
                    bateria, carregador ou cartão apenas se tiverem relação com o defeito).
                  </li>
                  <li>Carta de envio preenchida, impressa e dentro do saquinho plástico, junto com o equipamento.</li>
                  <li>
                    Se for empresa: nota fiscal de remessa para conserto e nome e celular da pessoa de contato.
                  </li>
                  <li>Se estiver na garantia: cópia da nota fiscal de compra no saquinho.</li>
                  <li>
                    Equipamento bem no meio de uma caixa pequena, com jornal amassado ou plástico-bolha. Não a caixa
                    original.
                  </li>
                </ul>
              </div>
            </Step>

            <Step title="Postagem">
              <div className="guide-step">
                <p className="guide-count">Etapa 5 de {TOTAL}</p>
                <h3>Envie com seguro</h3>
                <p>
                  Mande pelo meio que preferir. Indicamos o SEDEX dos Correios com o seguro opcional contra perda, furto
                  e danos. Os custos e riscos do envio, ida e volta, são do cliente. Você pode rastrear o SEDEX no site
                  dos Correios.
                </p>
                <h4>Depois do envio</h4>
                <p>
                  Conte {orcamento} para análise e orçamento, se estiver fora da garantia. Ele chega por e-mail com
                  todas as informações do reparo. A aprovação ou recusa é feita por telefone ou e-mail. Acompanhe cada
                  etapa em <a href={`${base}consultar-os.html`}>Acompanhar O.S.</a>
                </p>
              </div>
            </Step>
          </Stepper>
        )}
      </div>
    </dialog>
  );
}
