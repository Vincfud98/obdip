import { renderAnimatedHeroSection } from "./landing-hero.js";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=2940";

/* ─── Ícones inline (Lucide equivalentes) ─── */
const ICON_EYE = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const ICON_EYE_OFF = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`;
const ICON_MAIL = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
const ICON_LOCK = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const ICON_USER = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const ICON_SCHOOL = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
const ICON_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;

/* ─── Partículas canvas ─── */
function initParticles(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let animId;

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement || canvas);

  const GOLD  = [184, 147, 69];
  const WHITE = [255, 255, 255];

  const particles = Array.from({ length: 48 }, () => {
    const useGold = Math.random() > 0.5;
    const [r, g, b] = useGold ? GOLD : WHITE;
    return {
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.8 + 0.4,
      dx:    (Math.random() - 0.5) * 0.35,
      dy:    (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.3 + 0.06,
      color: `${r},${g},${b}`
    };
  });

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x = (p.x + p.dx + canvas.width)  % canvas.width;
      p.y = (p.y + p.dy + canvas.height) % canvas.height;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    }
    animId = requestAnimationFrame(draw);
  };
  draw();

  /* limpar ao desmontar */
  canvas._cleanup = () => {
    cancelAnimationFrame(animId);
    ro.disconnect();
  };
}

/* ─── HTML do formulário de login ─── */
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

/* ─── HTML do formulário de cadastro ─── */
function registerFormHTML(paymentConfirmed) {
  return `
    <div class="lp-payment-box${paymentConfirmed ? " confirmed" : ""}">
      <div class="lp-payment-info">
        <strong>${paymentConfirmed ? "✓ Pagamento confirmado" : "Etapa 1 — Pagamento Greenn"}</strong>
        <p>${
          paymentConfirmed
            ? "Preencha o formulário abaixo para criar seu acesso."
            : "Necessário antes de liberar o formulário de cadastro."
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
      <div class="lp-field-row">
        <div class="lp-field">
          <span class="lp-field-icon">${ICON_USER}</span>
          <input type="text"  id="lp-nome"      name="nome"  placeholder=" " required>
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
          <label for="lp-escola">Escola / Instituição</label>
        </div>
        <div class="lp-field lp-field-select">
          <select id="lp-serie" name="serie" required>
            <option value="">Selecione</option>
            <option value="EF">EF — Fundamental II</option>
            <option value="EM">EM — Ensino Médio</option>
            <option value="ES">ES — Superior</option>
            <option value="Senior">Sênior</option>
            <option value="NemNem">Nem nem</option>
          </select>
          <label for="lp-serie" class="lp-select-label">Categoria</label>
        </div>
      </div>

      <label class="lp-checkbox-row">
        <input type="checkbox" name="menor">
        <span class="lp-checkmark">${ICON_CHECK}</span>
        Autorização de responsável (menor de idade)
      </label>

      <button type="submit" class="lp-submit lp-submit-success">
        Concluir cadastro
      </button>
    </form>
  `;
}

/* ─── Monta o painel de login sobre o hero ─── */
function mountLoginPanel(heroEl, state, handlers) {
  /* Remove painel anterior se houver (re-render) */
  heroEl.querySelector(".login-panel")?.remove();

  const panel = document.createElement("aside");
  panel.className = "login-panel animate-fade-in";
  panel.setAttribute("aria-label", "Acesso ao portal");

  panel.innerHTML = `
    <canvas class="lp-canvas" aria-hidden="true"></canvas>

    <div class="lp-inner">

      <!-- Cabeçalho com logo -->
      <div class="lp-header">
        <div class="lp-brand">
          <div class="lp-brand-mark">OB</div>
          <div class="lp-brand-text">
            <strong>OBDIP 2026</strong>
            <span>Área do Participante</span>
          </div>
        </div>
      </div>

      <!-- Seletor de modo -->
      <div class="lp-switcher" role="tablist">
        <button
          class="lp-pill${state.mode === "login" ? " active" : ""}"
          data-switch-mode="login"
          role="tab"
          aria-selected="${state.mode === "login"}"
        >Já estou cadastrado</button>
        <button
          class="lp-pill${state.mode === "register" ? " active" : ""}"
          data-switch-mode="register"
          role="tab"
          aria-selected="${state.mode === "register"}"
        >Primeiro acesso</button>
      </div>

      <!-- Área do formulário -->
      <div class="lp-body">
        ${state.mode === "login" ? loginFormHTML() : registerFormHTML(state.paymentConfirmed)}
      </div>

    </div>
  `;

  heroEl.appendChild(panel);

  /* Canvas partículas */
  initParticles(panel.querySelector(".lp-canvas"));

  /* ── Listeners ── */

  /* Switcher de modo */
  panel.querySelectorAll("[data-switch-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      handlers.onSwitchMode(btn.dataset.switchMode);
    });
  });

  /* Toggle de senha */
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

  /* Submit: login */
  panel.querySelector("#lp-login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    handlers.onLogin(
      fd.get("email")?.toString().trim().toLowerCase(),
      fd.get("password")?.toString()
    );
  });

  /* Submit: cadastro */
  panel.querySelector("#lp-register-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    handlers.onRegister({
      nome:   fd.get("nome")?.toString().trim(),
      email:  fd.get("email")?.toString().trim().toLowerCase(),
      escola: fd.get("escola")?.toString().trim(),
      serie:  fd.get("serie")?.toString(),
      menor:  fd.get("menor") === "on"
    });
  });

  /* Botão de pagamento */
  panel.querySelector("[data-pay]")?.addEventListener("click", handlers.onConfirmPayment);

  /* Demos */
  panel.querySelectorAll("[data-demo-student]").forEach((btn) => {
    btn.addEventListener("click", handlers.onDemoStudent);
  });
  panel.querySelector("[data-demo-admin]")?.addEventListener("click", handlers.onDemoAdmin);

  /* Animação de entrada sequencial dos campos */
  panel.querySelectorAll(".lp-field, .lp-field-row, .lp-options-row, .lp-submit, .lp-demo-row, .lp-payment-box, .lp-checkbox-row")
    .forEach((el, i) => {
      el.style.animationDelay = `${i * 60}ms`;
    });
}

/* ─── Exportação principal ─── */
export function renderLanding(root, state, handlers) {
  const heroSection = renderAnimatedHeroSection({
    backgroundImageUrl: HERO_IMAGE_URL,
    logoHtml: `
      <div class="landing-hero-brand-mark">OB</div>
      <div class="landing-hero-brand-copy">
        <strong>OBDIP 2026</strong>
        <span>Diplomacia e Relações Internacionais</span>
      </div>
    `,
    navLinks: [
      { label: "Sobre",      href: "#sobre" },
      { label: "Categorias", href: "#categorias" },
      { label: "Fases",      href: "#fases" }
    ],
    topRightActionHtml: "", /* sem botão extra no header */
    title: "Estude, compita e represente o Brasil na diplomacia.",
    description:
      "A plataforma oficial da OBDIP 2026 reúne biblioteca de e-books, simulados, desempenho e certificados em um único portal.",
    /* sem CTAs no hero — login fica no painel lateral */
    ctaButton:    null,
    secondaryCta: null
  });

  /* Apenas o hero — seções da home foram removidas */
  root.innerHTML = heroSection;

  /* Injeta painel de login animado dentro do hero */
  const heroBlock = root.querySelector(".landing-hero-block");
  if (heroBlock) {
    mountLoginPanel(heroBlock, state, handlers);
  }
}
