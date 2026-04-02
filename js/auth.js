import { renderAnimatedHeroSection } from "./landing-hero.js";

const HERO_IMAGE_URL = "./BANNER.png";

const ICON_EYE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const ICON_EYE_OFF = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`;
const ICON_MAIL = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
const ICON_LOCK = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const ICON_USER = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const ICON_SCHOOL = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
const ICON_PHONE = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.35 1.78.68 2.61a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.47-1.25a2 2 0 0 1 2.11-.45c.83.33 1.71.56 2.61.68A2 2 0 0 1 22 16.92z"/></svg>`;
const ICON_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;

const REGISTER_CATEGORY_OPTIONS = [
  { value: "EFI", label: "4o e 5o ano do Ensino Fundamental I" },
  { value: "EFII", label: "6o ao 9o ano do Ensino Fundamental II" },
  { value: "EM", label: "Ensino Medio" }
];

const GUARDIAN_REQUIRED_SERIES = new Set(["EFI", "EFII"]);

function isGuardianRequired(serie = "") {
  return GUARDIAN_REQUIRED_SERIES.has(serie);
}

function renderCategoryOptions() {
  return REGISTER_CATEGORY_OPTIONS
    .map((option) => `<option value="${option.value}">${option.label}</option>`)
    .join("");
}

function renderGuardianFields() {
  return `
    <div class="lp-guardian-fields hidden" data-guardian-fields>
      <div class="lp-guardian-copy">
        <strong>Dados do responsavel</strong>
        <p>
          Obrigatorio para estudantes do Ensino Fundamental e recomendado para qualquer participante menor de idade.
        </p>
      </div>

      <div class="lp-field-row">
        <div class="lp-field">
          <span class="lp-field-icon">${ICON_USER}</span>
          <input type="text" id="lp-responsavel-nome" name="responsavelNome" placeholder=" ">
          <label for="lp-responsavel-nome">Nome do responsavel</label>
        </div>
        <div class="lp-field">
          <span class="lp-field-icon">${ICON_MAIL}</span>
          <input type="email" id="lp-responsavel-email" name="responsavelEmail" placeholder=" ">
          <label for="lp-responsavel-email">E-mail do responsavel</label>
        </div>
      </div>

      <div class="lp-field">
        <span class="lp-field-icon">${ICON_PHONE}</span>
        <input type="tel" id="lp-responsavel-telefone" name="responsavelTelefone" placeholder=" ">
        <label for="lp-responsavel-telefone">Telefone do responsavel</label>
      </div>

      <div class="lp-upload-card">
        <label class="lp-upload-label" for="lp-autorizacao-pdf">Autorizacao do responsavel em PDF</label>
        <input type="file" id="lp-autorizacao-pdf" name="autorizacaoResponsavelPdf" accept="application/pdf,.pdf">
        <p>Envie o PDF da autorizacao assinada pelo responsavel.</p>
      </div>

      <label class="lp-checkbox-row">
        <input type="checkbox" name="consentimentoResponsavel">
        <span class="lp-checkmark">${ICON_CHECK}</span>
        Confirmo que o responsavel autorizou a inscricao e o contato da equipe OBDIP, se necessario.
      </label>
    </div>
  `;
}

function initParticles(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let animId;

  const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement || canvas);

  const GOLD = [184, 147, 69];
  const WHITE = [255, 255, 255];

  const particles = Array.from({ length: 48 }, () => {
    const useGold = Math.random() > 0.5;
    const [r, g, b] = useGold ? GOLD : WHITE;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.3 + 0.06,
      color: `${r},${g},${b}`
    };
  });

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const particle of particles) {
      particle.x = (particle.x + particle.dx + canvas.width) % canvas.width;
      particle.y = (particle.y + particle.dy + canvas.height) % canvas.height;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particle.color},${particle.alpha})`;
      ctx.fill();
    }
    animId = requestAnimationFrame(draw);
  };
  draw();

  canvas._cleanup = () => {
    cancelAnimationFrame(animId);
    ro.disconnect();
  };
}

function loginFormHTML() {
  return `
    <form id="lp-login-form" class="lp-form" novalidate>
      <div class="lp-field">
        <span class="lp-field-icon">${ICON_MAIL}</span>
        <input
          type="email"
          id="lp-email"
          name="email"
          placeholder=" "
          autocomplete="email"
          required
        >
        <label for="lp-email">E-mail autorizado</label>
      </div>

      <div class="lp-field">
        <span class="lp-field-icon">${ICON_LOCK}</span>
        <input
          type="password"
          id="lp-password"
          name="password"
          placeholder=" "
          autocomplete="current-password"
        >
        <label for="lp-password">Senha (se houver)</label>
        <button type="button" class="lp-eye-btn" aria-label="Mostrar senha">
          ${ICON_EYE}
        </button>
      </div>

      <div class="lp-options-row">
        <label class="lp-remember">
          <input type="checkbox" name="remember">
          <span class="lp-checkmark">${ICON_CHECK}</span>
          Lembrar acesso
        </label>
        <a href="#" class="lp-forgot">Esqueceu a senha?</a>
      </div>

      <button type="submit" class="lp-submit">Entrar no portal</button>

      <div class="lp-demo-row">
        <button type="button" class="lp-demo-btn" data-demo-student>Demo participante</button>
        <button type="button" class="lp-demo-btn" data-demo-admin>Demo admin</button>
      </div>
    </form>
  `;
}

function registerFormHTML(paymentConfirmed) {
  return `
    <div class="lp-payment-box${paymentConfirmed ? " confirmed" : ""}">
      <div class="lp-payment-info">
        <strong>${paymentConfirmed ? "Pagamento confirmado" : "Etapa 1 - Pagamento Greenn"}</strong>
        <p>${
          paymentConfirmed
            ? "Preencha o formulario abaixo para criar seu acesso."
            : "Necessario antes de liberar o formulario de cadastro."
        }</p>
      </div>
      <button type="button" class="lp-pay-btn${paymentConfirmed ? " done" : ""}" data-pay>
        ${paymentConfirmed ? "Confirmado" : "Ir para pagamento"}
      </button>
    </div>

    <form
      id="lp-register-form"
      class="lp-form${paymentConfirmed ? "" : " hidden"}"
      novalidate
    >
      <div class="lp-form-note">
        <strong>Inscricoes OBDIP 2026</strong>
        <p>A participacao agora comeca a partir do 4o ano do Ensino Fundamental I.</p>
      </div>

      <div class="lp-field-row">
        <div class="lp-field">
          <span class="lp-field-icon">${ICON_USER}</span>
          <input type="text" id="lp-nome" name="nome" placeholder=" " required>
          <label for="lp-nome">Nome completo</label>
        </div>
        <div class="lp-field">
          <span class="lp-field-icon">${ICON_MAIL}</span>
          <input type="email" id="lp-reg-email" name="email" placeholder=" " required>
          <label for="lp-reg-email">E-mail</label>
        </div>
      </div>

      <div class="lp-field-row">
        <div class="lp-field">
          <span class="lp-field-icon">${ICON_SCHOOL}</span>
          <input type="text" id="lp-escola" name="escola" placeholder=" " required>
          <label for="lp-escola">Escola / Instituicao</label>
        </div>
        <div class="lp-field lp-field-select">
          <select id="lp-serie" name="serie" required>
            <option value="">Selecione</option>
            ${renderCategoryOptions()}
          </select>
          <label for="lp-serie" class="lp-select-label">Faixa de participacao</label>
        </div>
      </div>

      <p class="lp-field-help">
        Selecione a faixa correta para liberar a trilha de conteudo e a comunicacao da OBDIP 2026.
      </p>

      <div class="lp-upload-card">
        <label class="lp-upload-label" for="lp-matricula-pdf">Comprovante de matricula em PDF</label>
        <input type="file" id="lp-matricula-pdf" name="comprovanteMatriculaPdf" accept="application/pdf,.pdf" required>
        <p>Recebemos os documentos da matricula por aqui. Aceitamos apenas arquivos em PDF.</p>
      </div>

      <label class="lp-checkbox-row">
        <input type="checkbox" name="menor">
        <span class="lp-checkmark">${ICON_CHECK}</span>
        Sou menor de idade e preciso registrar os dados do responsavel.
      </label>

      ${renderGuardianFields()}

      <button type="submit" class="lp-submit lp-submit-success">
        Concluir cadastro
      </button>
    </form>
  `;
}

function syncGuardianFields(panel) {
  const serie = panel.querySelector("#lp-serie")?.value || "";
  const menorCheckbox = panel.querySelector('input[name="menor"]');
  const guardianBlock = panel.querySelector("[data-guardian-fields]");
  const shouldShow = isGuardianRequired(serie) || Boolean(menorCheckbox?.checked);

  if (!guardianBlock) return;

  if (isGuardianRequired(serie) && menorCheckbox) {
    menorCheckbox.checked = true;
  }

  guardianBlock.classList.toggle("hidden", !shouldShow);
  guardianBlock.querySelectorAll("input").forEach((input) => {
    input.required = shouldShow;
  });
}

function mountLoginPanel(heroEl, state, handlers) {
  heroEl.querySelector(".login-panel")?.remove();

  const panel = document.createElement("aside");
  panel.className = "login-panel animate-fade-in";
  panel.setAttribute("aria-label", "Acesso ao portal");

  panel.innerHTML = `
    <canvas class="lp-canvas" aria-hidden="true"></canvas>

    <div class="lp-inner">
      <div class="lp-header">
        <div class="lp-brand">
          <div class="lp-brand-mark">OB</div>
          <div class="lp-brand-text">
            <strong>OBDIP 2026</strong>
            <span>Area do Participante</span>
          </div>
        </div>
      </div>

      <div class="lp-switcher" role="tablist">
        <button
          class="lp-pill${state.mode === "login" ? " active" : ""}"
          data-switch-mode="login"
          role="tab"
          aria-selected="${state.mode === "login"}"
        >Ja estou cadastrado</button>
        <button
          class="lp-pill${state.mode === "register" ? " active" : ""}"
          data-switch-mode="register"
          role="tab"
          aria-selected="${state.mode === "register"}"
        >Primeiro acesso</button>
      </div>

      <div class="lp-body">
        ${state.mode === "login" ? loginFormHTML() : registerFormHTML(state.paymentConfirmed)}
      </div>
    </div>
  `;

  heroEl.appendChild(panel);
  initParticles(panel.querySelector(".lp-canvas"));

  panel.querySelectorAll("[data-switch-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      handlers.onSwitchMode(btn.dataset.switchMode);
    });
  });

  const eyeBtn = panel.querySelector(".lp-eye-btn");
  if (eyeBtn) {
    eyeBtn.addEventListener("click", () => {
      const input = panel.querySelector("#lp-password");
      if (!input) return;
      const isText = input.type === "text";
      input.type = isText ? "password" : "text";
      eyeBtn.innerHTML = isText ? ICON_EYE : ICON_EYE_OFF;
      eyeBtn.setAttribute("aria-label", isText ? "Mostrar senha" : "Ocultar senha");
    });
  }

  panel.querySelector("#lp-login-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    handlers.onLogin(
      fd.get("email")?.toString().trim().toLowerCase(),
      fd.get("password")?.toString()
    );
  });

  panel.querySelector("#lp-register-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    await handlers.onRegister({
      nome: fd.get("nome")?.toString().trim(),
      email: fd.get("email")?.toString().trim().toLowerCase(),
      escola: fd.get("escola")?.toString().trim(),
      serie: fd.get("serie")?.toString(),
      menor: fd.get("menor") === "on",
      comprovanteMatriculaPdf: fd.get("comprovanteMatriculaPdf"),
      responsavelNome: fd.get("responsavelNome")?.toString().trim(),
      responsavelEmail: fd.get("responsavelEmail")?.toString().trim().toLowerCase(),
      responsavelTelefone: fd.get("responsavelTelefone")?.toString().trim(),
      autorizacaoResponsavelPdf: fd.get("autorizacaoResponsavelPdf"),
      consentimentoResponsavel: fd.get("consentimentoResponsavel") === "on"
    });
  });

  panel.querySelector("[data-pay]")?.addEventListener("click", handlers.onConfirmPayment);
  panel.querySelectorAll("[data-demo-student]").forEach((btn) => {
    btn.addEventListener("click", handlers.onDemoStudent);
  });
  panel.querySelector("[data-demo-admin]")?.addEventListener("click", handlers.onDemoAdmin);

  panel.querySelector("#lp-serie")?.addEventListener("change", () => syncGuardianFields(panel));
  panel.querySelector('input[name="menor"]')?.addEventListener("change", () => syncGuardianFields(panel));
  syncGuardianFields(panel);

  panel
    .querySelectorAll(".lp-field, .lp-field-row, .lp-options-row, .lp-submit, .lp-demo-row, .lp-payment-box, .lp-checkbox-row, .lp-form-note, .lp-guardian-fields")
    .forEach((element, index) => {
      element.style.animationDelay = `${index * 60}ms`;
    });
}

export function renderLanding(root, state, handlers) {
  const heroSection = renderAnimatedHeroSection({
    backgroundImageUrl: HERO_IMAGE_URL,
    logoHtml: `
      <div class="landing-hero-brand-mark">OB</div>
      <div class="landing-hero-brand-copy">
        <strong>OBDIP 2026</strong>
        <span>Diplomacia e Relacoes Internacionais</span>
      </div>
    `,
    navLinks: [
      { label: "Sobre", href: "#sobre" },
      { label: "Categorias", href: "#categorias" },
      { label: "Fases", href: "#fases" }
    ],
    topRightActionHtml: "",
    title: "A 2a edicao da OBDIP esta confirmada.",
    description:
      "Uma olimpiada cientifica para desenvolver pensamento critico e cientifico sobre politica externa brasileira e os grandes temas globais, agora aberta a estudantes a partir do 4o ano do Ensino Fundamental I. Acompanhe o cronograma oficial e prepare sua inscricao.",
    ctaButton: null,
    secondaryCta: null
  });

  root.innerHTML = heroSection;

  const heroBlock = root.querySelector(".landing-hero-block");
  if (heroBlock) {
    mountLoginPanel(heroBlock, state, handlers);
  }
}
