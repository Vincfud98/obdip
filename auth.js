export function renderLanding(root, state, handlers) {
  root.innerHTML = `
    <header class="landing-header home-portal-header">
      <div class="brand-lockup">
        <div class="brand-badge">OB</div>
        <div class="brand-copy">
          <strong>Olimpiada Brasileira de Diplomacia e Relacoes Internacionais</strong>
          <span>Portal oficial do participante | Edicao 2026</span>
        </div>
      </div>

      <div class="hero-top-actions">
        <button class="btn btn-ghost" type="button" data-switch-mode="register">Primeiro acesso</button>
        <button class="btn btn-secondary" type="button" data-auth-cta>Entrar</button>
      </div>
    </header>

    <main class="diplomatic-home">
      <section class="diplomatic-hero animate-slide-left">
        <div class="diplomatic-hero-copy">
          <span class="eyebrow">Portal institucional</span>
          <h1 class="diplomatic-hero-title">Plataforma oficial da OBDIP para estudo, acompanhamento e realizacao das provas.</h1>
          <p class="diplomatic-hero-text">
            A Odisseia Brasileira de Diplomacia e Relacoes Internacionais reune neste ambiente o percurso do participante:
            cadernos de estudo, simulados, resultados, certificados e comunicacoes da edicao 2026.
          </p>

          <div class="diplomatic-hero-actions">
            <button class="btn btn-primary btn-xl" type="button" data-auth-cta>Entrar no portal</button>
            <button class="btn btn-secondary btn-xl" type="button" data-switch-mode="register">Solicitar primeiro acesso</button>
          </div>
        </div>

        <aside class="diplomatic-dossier">
          <div class="diplomatic-dossier-head">
            <span class="surface-eyebrow">Edicao 2026</span>
            <strong>Ambiente do participante</strong>
          </div>
          <div class="diplomatic-dossier-body">
            <div class="diplomatic-dossier-item">
              <span>Biblioteca</span>
              <p>E-books e materiais em PDF por categoria e fase.</p>
            </div>
            <div class="diplomatic-dossier-item">
              <span>Simulados</span>
              <p>Questao unica, rolagem, escadinha lateral, imagem e timer.</p>
            </div>
            <div class="diplomatic-dossier-item">
              <span>Desempenho</span>
              <p>Percentual de acerto, gabarito, comentarios e historico.</p>
            </div>
            <div class="diplomatic-dossier-item">
              <span>Certificados</span>
              <p>Participacao, alto rendimento, merito e comprovantes.</p>
            </div>
          </div>
        </aside>
      </section>

      <section class="diplomatic-grid">
        <article class="diplomatic-card diplomatic-card-wide">
          <span class="surface-eyebrow">Sobre a OBDIP</span>
          <h2>Uma olimpiada nacional dedicada a Diplomacia e Relacoes Internacionais.</h2>
          <p>
            A OBDIP foi concebida como instrumento de formacao critica e cidada, com enfoque em analise,
            interpretacao, argumentacao, idiomas, cultura internacional, CACD e Objetivos de Desenvolvimento Sustentavel.
          </p>
          <div class="diplomatic-topic-grid">
            <div class="diplomatic-topic">
              <strong>Eixos de estudo</strong>
              <span>Direito, Economia, Historia, Geografia, RI, Portugues, Ingles, Frances e Espanhol.</span>
            </div>
            <div class="diplomatic-topic">
              <strong>Objetivo formativo</strong>
              <span>Preparar liderancas globais e ampliar a compreensao das dinamicas internacionais contemporaneas.</span>
            </div>
            <div class="diplomatic-topic">
              <strong>Alcance</strong>
              <span>Participacao nacional, com estudantes da educacao basica ao ensino superior.</span>
            </div>
          </div>
        </article>

        <article class="diplomatic-card">
          <span class="surface-eyebrow">Categorias</span>
          <div class="diplomatic-list">
            <div class="diplomatic-list-item">
              <strong>Consul Junior</strong>
              <span>8º e 9º anos do Ensino Fundamental II</span>
            </div>
            <div class="diplomatic-list-item">
              <strong>Embaixador Junior</strong>
              <span>Ensino Medio, incluindo EJA</span>
            </div>
            <div class="diplomatic-list-item">
              <strong>Chanceler Junior</strong>
              <span>Ensino Superior</span>
            </div>
          </div>
        </article>

        <article class="diplomatic-card">
          <span class="surface-eyebrow">Etapas</span>
          <div class="diplomatic-list">
            <div class="diplomatic-list-item">
              <strong>1ª fase objetiva</strong>
              <span>40 questoes, acesso online e tempo maximo de 2 horas.</span>
            </div>
            <div class="diplomatic-list-item">
              <strong>2ª fase discursiva</strong>
              <span>5 questoes com itens A e B para os melhores colocados por categoria.</span>
            </div>
            <div class="diplomatic-list-item">
              <strong>Certificacao</strong>
              <span>Participacao, alto rendimento, ouro, prata, bronze e mencao honrosa.</span>
            </div>
          </div>
        </article>
      </section>

      <section class="diplomatic-grid diplomatic-grid-secondary">
        <article class="diplomatic-card">
          <span class="surface-eyebrow">Fluxo de acesso</span>
          <div class="diplomatic-steps">
            <div class="diplomatic-step">
              <span class="diplomatic-step-index">1</span>
              <div>
                <strong>Participante cadastrado</strong>
                <p>Entrada direta com o email permitido e inserido pelo usuario na plataforma.</p>
              </div>
            </div>
            <div class="diplomatic-step">
              <span class="diplomatic-step-index">2</span>
              <div>
                <strong>Participante sem cadastro</strong>
                <p>Redirecionamento para a pagina de pagamento na Greenn antes da habilitacao do formulario.</p>
              </div>
            </div>
            <div class="diplomatic-step">
              <span class="diplomatic-step-index">3</span>
              <div>
                <strong>Habilitacao</strong>
                <p>Preenchimento de nome, email, escola, serie e autorizacao para menor de idade.</p>
              </div>
            </div>
          </div>
        </article>

        <aside class="diplomatic-access-card animate-scale-in">
          <div class="diplomatic-access-head">
            <div>
              <span class="badge badge-primary">Acesso ao portal</span>
              <h2>${state.mode === "login" ? "Entrar com email autorizado" : "Habilitar primeiro acesso"}</h2>
              <p class="muted-copy">
                ${state.mode === "login"
                  ? "Participantes ja cadastrados acessam o portal diretamente pelo email autorizado."
                  : "Novos participantes passam pela etapa de pagamento e depois concluem o cadastro."}
              </p>
            </div>
            <div class="auth-switcher">
              <button class="switch-pill ${state.mode === "login" ? "active" : ""}" type="button" data-switch-mode="login">
                Ja estou cadastrado
              </button>
              <button class="switch-pill ${state.mode === "register" ? "active" : ""}" type="button" data-switch-mode="register">
                Primeiro acesso
              </button>
            </div>
          </div>

          <div class="diplomatic-access-body">
            <section class="auth-stage ${state.mode === "login" ? "active" : ""}">
              <form id="login-form" class="stack-fields">
                <div class="form-group">
                  <label class="form-label" for="login-email">Email autorizado</label>
                  <input id="login-email" class="form-control" type="email" name="email" placeholder="participante@instituicao.org" required>
                  <span class="form-hint">O acesso de participantes cadastrados e realizado com o email permitido na plataforma.</span>
                </div>

                <button class="btn btn-primary btn-lg" type="submit">Entrar no portal</button>
                <div class="inline-action-row">
                  <button class="btn btn-secondary" type="button" data-demo-student>Demo participante</button>
                  <button class="btn btn-ghost" type="button" data-demo-admin>Demo admin</button>
                </div>
              </form>
            </section>

            <section class="auth-stage ${state.mode === "register" ? "active" : ""}">
              <div class="payment-box payment-box-highlight">
                <div>
                  <strong>Etapa 1. Pagamento</strong>
                  <p class="muted-copy">
                    Nesta demonstracao, o botao abaixo representa o redirecionamento para a Greenn.
                    Apos a confirmacao, o formulario de cadastro e liberado.
                  </p>
                </div>
                <button class="btn btn-primary" type="button" data-pay>
                  ${state.paymentConfirmed ? "Pagamento confirmado" : "Ir para a pagina de pagamento"}
                </button>
              </div>

              <form id="register-form" class="stack-fields ${state.paymentConfirmed ? "" : "hidden"}">
                <div class="inline-fields">
                  <div class="form-group">
                    <label class="form-label" for="register-name">Nome</label>
                    <input id="register-name" class="form-control" name="nome" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="register-email">Email</label>
                    <input id="register-email" class="form-control" type="email" name="email" required>
                  </div>
                </div>

                <div class="inline-fields">
                  <div class="form-group">
                    <label class="form-label" for="register-school">Escola</label>
                    <input id="register-school" class="form-control" name="escola" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="register-serie">Serie</label>
                    <select id="register-serie" class="form-control form-select" name="serie" required>
                      <option value="">Selecione</option>
                      <option value="EF">EF</option>
                      <option value="EM">EM</option>
                      <option value="ES">ES</option>
                      <option value="Senior">Senior</option>
                      <option value="Desempregado">Desempregado</option>
                    </select>
                  </div>
                </div>

                <label class="checkbox-group">
                  <input type="checkbox" name="menor">
                  <span>Autorizacao para menor de idade</span>
                </label>

                <button class="btn btn-success btn-lg" type="submit">Concluir cadastro</button>
              </form>

              <div class="auth-hint-box">
                <strong>Observacao tecnica</strong>
                <p class="muted-copy">
                  Nesta demonstracao, os dados ficam no navegador e podem ser conectados depois a uma API.
                </p>
              </div>
            </section>
          </div>
        </aside>
      </section>
    </main>
  `;

  root.querySelectorAll("[data-auth-cta]").forEach((button) => {
    button.addEventListener("click", () => handlers.onSwitchMode("login"));
  });

  root.querySelectorAll("[data-switch-mode]").forEach((button) => {
    button.addEventListener("click", () => handlers.onSwitchMode(button.dataset.switchMode));
  });

  root.querySelectorAll("[data-demo-student]").forEach((button) => {
    button.addEventListener("click", handlers.onDemoStudent);
  });

  root.querySelector("[data-demo-admin]")?.addEventListener("click", handlers.onDemoAdmin);
  root.querySelector("[data-pay]")?.addEventListener("click", handlers.onConfirmPayment);

  root.querySelector("#login-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    handlers.onLogin(formData.get("email"));
  });

  root.querySelector("#register-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    handlers.onRegister({
      nome: formData.get("nome")?.toString().trim(),
      email: formData.get("email")?.toString().trim().toLowerCase(),
      escola: formData.get("escola")?.toString().trim(),
      serie: formData.get("serie")?.toString(),
      menor: formData.get("menor") === "on"
    });
  });
}
