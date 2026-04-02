import { formatDateTime, formatDuration, formatSerieLabel, getInitials } from "./ui.js";

function getLatestResultado(resultados) {
  return resultados.filter(Boolean).sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0] || null;
}

function renderHome({ user, simulados, resultados, notifications }) {
  const realizados = resultados.filter(Boolean);
  const media = realizados.length
    ? Math.round(realizados.reduce((sum, item) => sum + item.percentual, 0) / realizados.length)
    : 0;
  const latest = getLatestResultado(resultados);
  const nextSimulado = simulados[0];

  return `
    <section class="portal-dashboard-shell">
      <article class="portal-dashboard-header">
        <div>
          <div class="tag-row">
            <span class="badge badge-primary">Portal do participante</span>
            <span class="surface-eyebrow">${formatSerieLabel(user.serie)}</span>
          </div>
          <h3>${user.nome.split(" ")[0]}, esta e a sua mesa de estudos, simulados e acompanhamento diplomático.</h3>
          <p class="muted-copy">
            A partir desta pagina voce acessa os cadernos de estudo, entra nos simulados, acompanha o resultado e visualiza certificados e avisos.
          </p>
        </div>
        <div class="portal-status-card">
          <span>Proximo simulado</span>
          <strong>${nextSimulado ? nextSimulado.nome : "Nenhum publicado"}</strong>
          <p>${nextSimulado ? `${nextSimulado.questoes.length} questoes | ${formatDuration(nextSimulado.tempo)}` : "Aguardando nova liberacao."}</p>
          ${nextSimulado ? `<button class="btn btn-primary mt-4" type="button" data-start-simulado="${nextSimulado.id}">Entrar no simulado</button>` : ""}
        </div>
      </article>

      <section class="dashboard-kpis dashboard-kpis-compact">
        <article class="kpi-card">
          <span>Turma ativa</span>
          <strong>${user.serie}</strong>
          <p class="muted-copy">${formatSerieLabel(user.serie)}</p>
        </article>
        <article class="kpi-card">
          <span>Simulados</span>
          <strong>${simulados.length}</strong>
          <p class="muted-copy">cadernos liberados para este grupo</p>
        </article>
        <article class="kpi-card">
          <span>Media recente</span>
          <strong>${latest ? `${latest.percentual}%` : "--"}</strong>
          <p class="muted-copy">ultimo resultado corrigido</p>
        </article>
        <article class="kpi-card">
          <span>Alertas</span>
          <strong>${notifications.length}</strong>
          <p class="muted-copy">avisos ativos da plataforma</p>
        </article>
      </section>

      <section class="portal-module-grid">
        <button class="portal-module-card" type="button" data-nav-jump="biblioteca">
          <span class="surface-eyebrow">Biblioteca</span>
          <strong>E-books e materiais</strong>
          <p>Baixe os PDFs de estudo organizados para a sua categoria.</p>
        </button>
        <button class="portal-module-card" type="button" data-nav-jump="simulados">
          <span class="surface-eyebrow">Simulados</span>
          <strong>Provas disponiveis</strong>
          <p>Entre no simulado, acompanhe o timer e revise suas respostas.</p>
        </button>
        <button class="portal-module-card" type="button" data-nav-jump="desempenho">
          <span class="surface-eyebrow">Desempenho</span>
          <strong>Resultados e comentarios</strong>
          <p>Veja porcentagem de acerto, gabarito e observacoes pedagogicas.</p>
        </button>
        <button class="portal-module-card" type="button" data-nav-jump="certificados">
          <span class="surface-eyebrow">Certificados</span>
          <strong>Documentos e comprovantes</strong>
          <p>Consulte certificados de participacao, merito e matricula.</p>
        </button>
      </section>

      <section class="portal-home-grid">
        <article class="portal-activity-card">
          <div class="card-header">
            <div>
              <h3>Atividade recente</h3>
              <p class="muted-copy">Resumo academico do seu andamento na plataforma.</p>
            </div>
          </div>
          <div class="card-body portal-activity-list">
            <div class="portal-activity-item">
              <strong>Ultimo resultado</strong>
              <span>${latest ? `${latest.percentual}% em ${formatDateTime(latest.dataHora)}` : "Nenhuma prova finalizada ainda"}</span>
            </div>
            <div class="portal-activity-item">
              <strong>Provas concluidas</strong>
              <span>${realizados.length} tentativa(s) registradas</span>
            </div>
            <div class="portal-activity-item">
              <strong>Status do portal</strong>
              <span>Respostas salvas automaticamente durante o simulado</span>
            </div>
          </div>
        </article>

        <article class="portal-activity-card">
          <div class="card-header">
            <div>
              <h3>Avisos</h3>
              <p class="muted-copy">Comunicacoes e lembretes importantes.</p>
            </div>
          </div>
          <div class="card-body portal-alert-list">
            ${notifications
              .slice(0, 3)
              .map(
                (item) => `
                  <article class="portal-alert-item">
                    <strong>${item.titulo}</strong>
                    <p>${item.texto}</p>
                    <span>${item.tempo}</span>
                  </article>
                `
              )
              .join("")}
          </div>
        </article>
      </section>
    </section>
  `;
}

function renderBiblioteca(ebooks) {
  if (!ebooks.length) {
    return `
      <div class="empty-state">
        <strong>Biblioteca vazia para este perfil</strong>
        <p class="muted-copy">Assim que novos e-books forem publicados para a turma, a grade sera atualizada.</p>
      </div>
    `;
  }

  return `
    <section class="ebook-stage">
      ${ebooks
        .map(
          (ebook) => `
            <article class="card ebook-card ebook-card-modern">
              <div class="ebook-cover" style="background:${ebook.gradiente}">
                <span class="ebook-cover-placeholder">${ebook.emoji || "PDF"}</span>
                <span class="ebook-badge">${ebook.formato}</span>
              </div>
              <div class="ebook-info">
                <div class="tag-row">
                  <span class="badge badge-primary">${ebook.paginas} pags</span>
                  <span class="badge badge-muted">${ebook.tamanho}</span>
                </div>
                <h4>${ebook.titulo}</h4>
                <p>${ebook.autor}</p>
                <p>${ebook.descricao}</p>
                <button class="btn btn-secondary mt-4" type="button" data-ebook-download="${ebook.id}">
                  Download do PDF
                </button>
              </div>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderSimulados(simulados, resultados) {
  if (!simulados.length) {
    return `
      <div class="empty-state">
        <strong>Nenhum simulado disponivel agora</strong>
        <p class="muted-copy">O administrador ainda nao publicou provas para esta turma.</p>
      </div>
    `;
  }

  return `
    <section class="simulado-stage">
      ${simulados
        .map((simulado) => {
          const resultado = resultados.find((item) => item?.simuladoId === simulado.id);

          return `
            <article class="simulado-stage-card">
              <div class="simulado-stage-head">
                <div>
                  <div class="tag-row">
                    <span class="badge badge-primary">${simulado.turmas.join(", ")}</span>
                    <span class="badge ${resultado ? "badge-success" : "badge-warning"}">
                      ${resultado ? "Resultado liberado" : "Nao iniciado"}
                    </span>
                  </div>
                  <h3 class="mt-4">${simulado.nome}</h3>
                  <p class="muted-copy mt-2">
                    ${simulado.questoes.length} questoes | ${formatDuration(simulado.tempo)} | escadinha lateral | questao unica
                  </p>
                </div>
                <div class="simulado-score-chip">
                  <strong>${resultado ? `${resultado.percentual}%` : "--"}</strong>
                  <span>${resultado ? "acerto" : "aguardando prova"}</span>
                </div>
              </div>

              <div class="simulado-meta-grid">
                <div class="surface-mini-card">
                  <span>Status</span>
                  <strong>${simulado.status}</strong>
                </div>
                <div class="surface-mini-card">
                  <span>Visualizacoes</span>
                  <strong>Rolagem e unica</strong>
                </div>
                <div class="surface-mini-card">
                  <span>Recursos</span>
                  <strong>Imagem, timer e revisao</strong>
                </div>
              </div>

              <div class="simulado-actions">
                <button class="btn btn-primary" type="button" data-start-simulado="${simulado.id}">
                  Entrar no simulado
                </button>
                <button class="btn btn-secondary" type="button" data-view-result="${simulado.id}" ${resultado ? "" : "disabled"}>
                  Ver resultado
                </button>
              </div>
            </article>
          `;
        })
        .join("")}
    </section>
  `;
}

function renderRanking(ranking) {
  if (!ranking.length) {
    return `
      <div class="empty-state">
        <strong>Ranking ainda vazio</strong>
        <p class="muted-copy">Assim que alunos finalizarem o simulado, a ordenacao por percentual aparece aqui.</p>
      </div>
    `;
  }

  return `
    <section class="ranking-board">
      ${ranking
        .map(
          (item, index) => `
            <article class="ranking-board-card ${index === 0 ? "ranking-board-card-top" : ""}">
              <div>
                <span class="surface-eyebrow">Posicao ${index + 1}</span>
                <h4 class="mt-4">${item.usuario}</h4>
                <p class="muted-copy mt-2">${formatDateTime(item.dataHora)}</p>
              </div>
              <div class="text-right">
                <strong>${item.percentual}%</strong>
                <p class="muted-copy">${item.pontuacao} pontos</p>
              </div>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderResultado(resultado) {
  if (!resultado) {
    return `
      <div class="empty-state">
        <strong>Nenhum resultado selecionado</strong>
        <p class="muted-copy">Finalize um simulado para liberar a pagina de desempenho com comentarios pedagogicos.</p>
      </div>
    `;
  }

  return `
    <section class="result-shell">
      <article class="resultado-hero resultado-hero-modern">
        <div class="tag-row">
          <span class="badge badge-muted">Pagina de desempenho</span>
          <button class="btn btn-secondary btn-sm" type="button" data-nav-jump="home">Voltar para home</button>
        </div>
        <h2 class="mt-4">${resultado.simuladoNome}</h2>
        <p class="mt-2">Tentativa concluida em ${formatDateTime(resultado.dataHora)}</p>
        <div class="result-grid mt-6">
          <div class="result-pill">
            <strong>${resultado.percentual}%</strong>
            <span>porcentagem de acerto</span>
          </div>
          <div class="result-pill">
            <strong>${resultado.acertos}</strong>
            <span>questoes corretas</span>
          </div>
          <div class="result-pill">
            <strong>${resultado.brancos}</strong>
            <span>questoes em branco</span>
          </div>
        </div>
      </article>

      <section class="review-list">
        ${resultado.detalhes
          .map(
            (questao) => `
              <article class="review-item review-item-modern">
                <header>
                  <div>
                    <span class="badge ${questao.acertou ? "badge-success" : "badge-error"}">
                      Questao ${questao.numero}
                    </span>
                    <h4 class="mt-4">${questao.disciplina}</h4>
                  </div>
                  <div class="tag-row">
                    <span class="option-badge ${questao.acertou ? "correct" : "wrong"}">
                      Sua resposta: ${questao.escolha || "Em branco"}
                    </span>
                    <span class="option-badge correct">Gabarito: ${questao.gabarito}</span>
                  </div>
                </header>
                <div class="review-item-body">
                  <div class="questao-enunciado">${questao.enunciado}</div>
                  <div class="questao-comentario">
                    <h6>Comentario pedagogico</h6>
                    <p>${questao.comentario}</p>
                  </div>
                </div>
              </article>
            `
          )
          .join("")}
      </section>
    </section>
  `;
}

function renderCertificates(certificates) {
  return `
    <section class="certificate-grid">
      ${certificates
        .map(
          (item) => `
            <article class="certificate-card">
              <div class="tag-row">
                <span class="badge ${item.status === "Validado" ? "badge-success" : "badge-warning"}">${item.status}</span>
                <span class="badge badge-muted">${item.tipo}</span>
              </div>
              <h3 class="mt-4">${item.titulo}</h3>
              <p class="muted-copy mt-2">${item.descricao}</p>
              <p class="muted-copy mt-4">Atualizado em ${item.data}</p>
              <button class="btn btn-secondary mt-6" type="button" data-certificate="${item.id}">
                ${item.acao}
              </button>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderNotifications(notifications) {
  return `
    <section class="notification-feed">
      ${notifications
        .map(
          (item) => `
            <article class="notification-card notification-card-${item.tipo}">
              <div class="notification-card-top">
                <strong>${item.titulo}</strong>
                <span>${item.tempo}</span>
              </div>
              <p>${item.texto}</p>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderConta(user) {
  return `
    <section class="settings-layout">
      <article class="settings-card">
        <div class="card-header">
          <div>
            <h3>Conta e configuracoes</h3>
            <p class="muted-copy">Atualize informacoes basicas do aluno e mantenha o cadastro em dia.</p>
          </div>
        </div>
        <form id="account-form" class="card-body admin-stack">
          <div class="inline-fields">
            <div class="form-group">
              <label class="form-label" for="account-name">Nome</label>
              <input id="account-name" class="form-control" name="nome" value="${user.nome}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="account-email">Email</label>
              <input id="account-email" class="form-control" name="email" value="${user.email}" disabled>
            </div>
          </div>

          <div class="inline-fields">
            <div class="form-group">
              <label class="form-label" for="account-school">Escola</label>
              <input id="account-school" class="form-control" name="escola" value="${user.escola || ""}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="account-serie">Serie</label>
              <select id="account-serie" class="form-control form-select" name="serie" required>
                <option value="EF" ${user.serie === "EF" ? "selected" : ""}>EF</option>
                <option value="EM" ${user.serie === "EM" ? "selected" : ""}>EM</option>
                <option value="ES" ${user.serie === "ES" ? "selected" : ""}>ES</option>
                <option value="Senior" ${user.serie === "Senior" ? "selected" : ""}>Senior</option>
                <option value="Desempregado" ${user.serie === "Desempregado" ? "selected" : ""}>Desempregado</option>
              </select>
            </div>
          </div>

          <label class="checkbox-group">
            <input type="checkbox" name="menor" ${user.menor ? "checked" : ""}>
            <span>Autorizacao para menor de idade</span>
          </label>

          <button class="btn btn-primary" type="submit">Salvar configuracoes</button>
        </form>
      </article>

      <article class="settings-side-card">
        <span class="surface-eyebrow">Conta</span>
        <h4>O que existe aqui</h4>
        <p class="muted-copy">
          Ajuste nome, escola, serie e autorizacao. O email permanece como identificador liberado pela plataforma.
        </p>
      </article>
    </section>
  `;
}

function renderContato(user) {
  return `
    <section class="contact-layout">
      <article class="contact-side-card">
        <span class="surface-eyebrow">Contato</span>
        <h3>Fale com a equipe da plataforma</h3>
        <p class="muted-copy">
          Use este formulario para suporte, duvidas sobre acesso, certificados, resultado ou publicacao de novos simulados.
        </p>
      </article>

      <article class="card">
        <div class="card-header">
          <div>
            <h3>Enviar mensagem</h3>
            <p class="muted-copy">Nome, email e mensagem.</p>
          </div>
        </div>
        <form id="contact-form" class="card-body admin-stack">
          <div class="inline-fields">
            <div class="form-group">
              <label class="form-label" for="contact-name">Nome</label>
              <input id="contact-name" class="form-control" name="nome" value="${user.nome}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="contact-email">Email</label>
              <input id="contact-email" class="form-control" type="email" name="email" value="${user.email}" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-message">Mensagem</label>
            <textarea id="contact-message" class="form-control" name="mensagem" placeholder="Escreva sua mensagem aqui." required></textarea>
          </div>
          <button class="btn btn-primary" type="submit">Enviar mensagem</button>
        </form>
      </article>
    </section>
  `;
}

export function renderStudentDashboard(root, data, handlers) {
  const {
    user,
    section,
    ebooks,
    simulados,
    resultados,
    ranking,
    resultadoSelecionado,
    notifications,
    certificates
  } = data;

  const pageTitles = {
    home: "Home",
    biblioteca: "Biblioteca de e-books",
    simulados: "Biblioteca de simulados",
    ranking: "Ranking do simulado",
    desempenho: "Pagina de desempenho",
    certificados: "Certificados",
    notificacoes: "Notificacoes",
    conta: "Conta",
    contato: "Contato"
  };

  const pageDescriptions = {
    home: "Resumo da jornada do aluno, atalhos e proximas acoes.",
    biblioteca: "PDFs disponiveis para download conforme o grupo do aluno.",
    simulados: "Lista de simulados do grupo com acesso, resultado e resolucao.",
    ranking: "Ordenacao por pontuacao e horario de envio.",
    desempenho: "Questoes completas com resposta do aluno, gabarito e comentario.",
    certificados: "Certificados e comprovantes ligados ao cadastro.",
    notificacoes: "Avisos da plataforma, lembretes e atualizacoes recentes.",
    conta: "Configuracoes do usuario e dados principais do cadastro.",
    contato: "Canal direto para nome, email e mensagem."
  };

  const sectionContent = {
    home: renderHome({ user, simulados, resultados, notifications }),
    biblioteca: renderBiblioteca(ebooks),
    simulados: renderSimulados(simulados, resultados),
    ranking: renderRanking(ranking),
    desempenho: renderResultado(resultadoSelecionado),
    certificados: renderCertificates(certificates),
    notificacoes: renderNotifications(notifications),
    conta: renderConta(user),
    contato: renderContato(user)
  };

  root.innerHTML = `
    <div class="sidebar-overlay"></div>
    <div class="app-shell app-shell-modern">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="sidebar-logo-icon">OB</div>
          <div class="sidebar-logo-text">OBDIP <span>Edu</span></div>
          <button class="sidebar-toggle" type="button" data-sidebar-toggle aria-label="Recolher menu">
            <span><</span>
          </button>
        </div>

        <nav class="sidebar-nav">
          <div class="sidebar-section-title">Aluno</div>
          <button class="nav-item ${section === "home" ? "active" : ""}" type="button" data-nav="home">
            <span class="nav-item-icon">HM</span>
            <span>Home</span>
          </button>
          <button class="nav-item ${section === "biblioteca" ? "active" : ""}" type="button" data-nav="biblioteca">
            <span class="nav-item-icon">BK</span>
            <span>Biblioteca</span>
          </button>
          <button class="nav-item ${section === "simulados" ? "active" : ""}" type="button" data-nav="simulados">
            <span class="nav-item-icon">SM</span>
            <span>Simulados</span>
            <span class="nav-item-badge">${simulados.length}</span>
          </button>
          <button class="nav-item ${section === "desempenho" ? "active" : ""}" type="button" data-nav="desempenho">
            <span class="nav-item-icon">RS</span>
            <span>Desempenho</span>
          </button>
          <button class="nav-item ${section === "certificados" ? "active" : ""}" type="button" data-nav="certificados">
            <span class="nav-item-icon">CT</span>
            <span>Certificados</span>
          </button>
          <button class="nav-item ${section === "notificacoes" ? "active" : ""}" type="button" data-nav="notificacoes">
            <span class="nav-item-icon">NT</span>
            <span>Notificacoes</span>
          </button>
          <button class="nav-item ${section === "conta" ? "active" : ""}" type="button" data-nav="conta">
            <span class="nav-item-icon">AC</span>
            <span>Conta</span>
          </button>
          <button class="nav-item ${section === "contato" ? "active" : ""}" type="button" data-nav="contato">
            <span class="nav-item-icon">CO</span>
            <span>Contato</span>
          </button>
          <button class="nav-item ${section === "ranking" ? "active" : ""}" type="button" data-nav="ranking">
            <span class="nav-item-icon">RK</span>
            <span>Ranking</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user" data-open-profile>
            <div class="avatar">${getInitials(user.nome)}</div>
            <div class="sidebar-user-info">
              <strong>${user.nome}</strong>
              <span>${user.email}</span>
            </div>
          </div>
          <button class="btn btn-secondary mt-4" type="button" data-logout>Logoff</button>
        </div>
      </aside>

      <div class="main-content">
        <header class="top-header top-header-modern">
          <div class="flex items-center gap-4">
            <button class="header-icon-btn mobile-menu-btn" type="button" data-mobile-sidebar>
              <span>MN</span>
            </button>
            <div>
              <div class="page-title">${pageTitles[section]}</div>
              <div class="text-sm text-muted">${pageDescriptions[section]}</div>
            </div>
          </div>

          <div class="header-actions">
            <div class="top-status-pill">${formatSerieLabel(user.serie)}</div>
            <button class="header-icon-btn" type="button" data-open-profile aria-label="Abrir perfil">
              <span>PF</span>
            </button>
          </div>
        </header>

        <main class="page-content page-content-modern">
          <div class="page-header page-header-modern">
            <div>
              <h2>${pageTitles[section]}</h2>
              <p>${pageDescriptions[section]}</p>
            </div>
          </div>
          ${sectionContent[section]}
        </main>
      </div>
    </div>
  `;

  const sidebar = root.querySelector(".sidebar");
  const overlay = root.querySelector(".sidebar-overlay");
  const toggleSidebar = () => sidebar.classList.toggle("collapsed");
  const toggleMobileSidebar = () => {
    sidebar.classList.toggle("mobile-open");
    overlay.classList.toggle("visible");
  };

  root.querySelector("[data-sidebar-toggle]")?.addEventListener("click", toggleSidebar);
  root.querySelector("[data-mobile-sidebar]")?.addEventListener("click", toggleMobileSidebar);
  overlay?.addEventListener("click", toggleMobileSidebar);

  root.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => handlers.onNavigate(button.dataset.nav));
  });

  root.querySelectorAll("[data-nav-jump]").forEach((button) => {
    button.addEventListener("click", () => handlers.onNavigate(button.dataset.navJump));
  });

  root.querySelectorAll("[data-start-simulado]").forEach((button) => {
    button.addEventListener("click", () => handlers.onStartSimulado(button.dataset.startSimulado));
  });

  root.querySelectorAll("[data-view-result]").forEach((button) => {
    button.addEventListener("click", () => handlers.onViewResult(button.dataset.viewResult));
  });

  root.querySelectorAll("[data-ebook-download]").forEach((button) => {
    button.addEventListener("click", () => handlers.onDownloadEbook(button.dataset.ebookDownload));
  });

  root.querySelectorAll("[data-certificate]").forEach((button) => {
    button.addEventListener("click", () => handlers.onOpenCertificate(button.dataset.certificate));
  });

  root.querySelectorAll("[data-open-profile]").forEach((button) => {
    button.addEventListener("click", handlers.onOpenProfile);
  });

  root.querySelector("#account-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onSaveAccount(new FormData(event.currentTarget));
  });

  root.querySelector("#contact-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onSendContact(new FormData(event.currentTarget));
  });

  root.querySelector("[data-logout]")?.addEventListener("click", handlers.onLogout);
}
