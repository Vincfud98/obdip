import { formatDateTime, formatDuration, formatSerieLabel, getInitials } from "./ui.js";

function renderIcon(name) {
  const icons = {
    home: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10.5L12 3l9 7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5.5 9.5V20h13V9.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    simulados: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="3.5" width="16" height="17" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <path d="M8 8h8M8 12h8M8 16h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    ranking: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 18V9m7 9V5m7 13v-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    groups: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 11a3 3 0 100-6 3 3 0 000 6zM16 13a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <path d="M3.5 20a4.5 4.5 0 019 0M13 20a3.5 3.5 0 017 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    users: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <path d="M5 20a7 7 0 0114 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    search: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <path d="M16 16l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    logout: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 17l5-5-5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 12H4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M20 4v16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    moon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 14.5A7.5 7.5 0 119.5 4a6.2 6.2 0 0010.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    sun: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <path d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `
  };

  return icons[name] || "";
}

function buildTrendSeries(historico) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  return days.map((date) => {
    const dayKey = date.toISOString().slice(0, 10);
    const dayResults = historico.filter((item) => item.dataHora?.slice(0, 10) === dayKey);
    const average =
      dayResults.length
        ? Math.round(dayResults.reduce((sum, item) => sum + item.percentual, 0) / dayResults.length)
        : 0;

    return {
      label: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      attempts: dayResults.length,
      average
    };
  });
}

function buildAnalytics(users, simulados, historico, groups) {
  const completedUsers = new Set(historico.map((item) => item.userId)).size;
  const recentCutoff = Date.now() - 1000 * 60 * 60 * 24 * 14;
  const activeUsers = new Set(
    historico
      .filter((item) => new Date(item.dataHora).getTime() >= recentCutoff)
      .map((item) => item.userId)
  ).size;
  const averageScore = historico.length
    ? Math.round(historico.reduce((sum, item) => sum + item.percentual, 0) / historico.length)
    : 0;
  const completionRate = users.length ? Math.round((completedUsers / users.length) * 100) : 0;
  const published = simulados.filter((item) => item.status === "publicado").length;
  const scheduled = simulados.filter((item) => item.status === "agendado").length;
  const draft = simulados.filter((item) => item.status === "rascunho").length;
  const trend = buildTrendSeries(historico);
  const recentResults = [...historico].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora)).slice(0, 6);
  const distribution = groups.map((group) => ({
    label: group.code,
    value: users.filter((user) => user.serie === group.code || (user.serie === "Desempregado" && group.code === "NemNem")).length
  }));

  return {
    trend,
    recentResults,
    distribution,
    kpis: [
      { label: "Total de alunos", value: users.length, meta: "base cadastrada", tone: "primary" },
      { label: "Taxa de conclusao", value: `${completionRate}%`, meta: "alunos com simulados concluidos", tone: "success" },
      { label: "Acessos recentes", value: activeUsers, meta: "atividade nos ultimos 14 dias", tone: "warning" },
      { label: "Media de acerto", value: `${averageScore}%`, meta: "desempenho medio", tone: "neutral" }
    ],
    pipeline: { published, scheduled, draft }
  };
}

function chartConfig(type, labels, data, label, color) {
  return JSON.stringify({
    type,
    labels,
    datasets: [{ label, data, color }]
  }).replace(/"/g, "&quot;");
}

function getKpiIcon(tone) {
  const icons = {
    primary: "simulados",
    success: "ranking",
    warning: "groups",
    neutral: "users"
  };

  return renderIcon(icons[tone] || "home");
}

function renderCardTools(items = []) {
  if (!items.length) return "";

  return `
    <div class="admin-lte-card-tools">
      ${items.map((item) => `<span class="admin-lte-tool-chip">${item}</span>`).join("")}
    </div>
  `;
}

function renderSidebar(section) {
  const items = [
    { key: "home", label: "Home", icon: "home" },
    { key: "simulados", label: "Simulados", icon: "simulados" },
    { key: "ranking", label: "Ranking", icon: "ranking" },
    { key: "grupos", label: "Grupos", icon: "groups" },
    { key: "usuarios", label: "Usuarios", icon: "users" }
  ];

  return `
    <aside class="sidebar admin-lte-sidebar admin-ga-sidebar">
      <a class="admin-lte-brand" href="#" aria-label="OBDIP Admin">
        <div class="sidebar-logo-icon">OB</div>
        <div class="sidebar-logo-text">OBDIP <span>Admin 2026</span></div>
      </a>

      <div class="admin-lte-user-panel">
        <div class="avatar">AD</div>
        <div>
          <strong>Equipe OBDIP</strong>
          <span>Operacao e analytics</span>
        </div>
      </div>

      <div class="admin-lte-sidebar-search">
        <input class="admin-lte-search-input" type="search" placeholder="Buscar no painel">
      </div>

      <nav class="sidebar-nav admin-lte-nav">
        <div class="sidebar-section-title">Navegacao</div>
        ${items
          .map(
            (item) => `
              <button class="nav-item ${section === item.key ? "active" : ""}" type="button" data-admin-nav="${item.key}">
                <span class="nav-item-icon nav-item-icon-svg">${renderIcon(item.icon)}</span>
                <span>${item.label}</span>
              </button>
            `
          )
          .join("")}
      </nav>

      <div class="sidebar-footer">
        <div class="admin-ga-sidebar-note">
          <strong>Edicao 2026</strong>
          <span>Plataforma administrativa da Odisseia Brasileira de Diplomacia e Relacoes Internacionais.</span>
        </div>
        <button class="nav-item admin-lte-logout-item" type="button" data-admin-logout>
          <span class="nav-item-icon nav-item-icon-svg">${renderIcon("logout")}</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  `;
}

function renderTopHeader(section, theme) {
  const titles = {
    home: { title: "Home admin", description: "Estatisticas, leitura analitica e atividade recente." },
    simulados: { title: "Gerenciar simulados", description: "Criacao, importacao, publicacao e biblioteca de simulados." },
    ranking: { title: "Ranking", description: "Ordenacao por simulado com modal de desempenho individual." },
    grupos: { title: "Grupos de alunos", description: "Gerencie os grupos da plataforma e acompanhe a distribuicao da base." },
    usuarios: { title: "Gerenciar usuarios", description: "Permissao de email, suspensao, banimento, troca de senha e perfil." }
  };

  const current = titles[section] || titles.home;

  return `
    <header class="top-header admin-ga-header admin-lte-topbar">
      <div class="admin-lte-topbar-left">
        <button class="header-icon-btn admin-lte-topbar-btn" type="button" aria-label="Menu" data-admin-sidebar-toggle>
          <span class="nav-item-icon nav-item-icon-svg">${renderIcon("simulados")}</span>
        </button>
        <div class="admin-lte-search-shell">
          <span class="nav-item-icon nav-item-icon-svg">${renderIcon("search")}</span>
          <input type="search" placeholder="Buscar aluno, simulado ou grupo">
        </div>
      </div>

      <div class="header-actions admin-lte-topbar-right">
        <button class="header-icon-btn admin-lte-topbar-btn" type="button" aria-label="Alternar tema" data-admin-theme-toggle>
          <span class="nav-item-icon nav-item-icon-svg">${renderIcon(theme === "dark" ? "sun" : "moon")}</span>
        </button>
        <button class="header-icon-btn admin-lte-topbar-btn" type="button" aria-label="Mensagens">3</button>
        <button class="header-icon-btn admin-lte-topbar-btn" type="button" aria-label="Notificacoes">15</button>
        <div class="admin-topbar-user">
          <div class="admin-topbar-user-meta">
            <strong>Equipe OBDIP</strong>
            <span>${formatDateTime(new Date().toISOString())}</span>
          </div>
          <div class="avatar">AD</div>
        </div>
      </div>
    </header>
    <section class="admin-lte-content-header">
      <div>
        <h1>${current.title}</h1>
        <p>${current.description}</p>
      </div>
      <div class="admin-lte-breadcrumb">
        <span>Home</span>
        <span>/</span>
        <strong>${current.title}</strong>
      </div>
    </section>
  `;
}

function renderHero(analytics) {
  return `
    <section class="admin-executive-panel">
      <article class="admin-executive-summary">
        <div class="tag-row">
          <span class="surface-eyebrow">OBDIP 2026</span>
          <span class="badge badge-primary">Centro de comando</span>
        </div>
        <h2>Leitura executiva da operacao administrativa da plataforma.</h2>
        <p>
          Acompanhe base de alunos, progresso de simulados, publicacoes e sinais de atividade recente em um unico painel.
        </p>
      </article>

      <section class="admin-executive-stats">
        <div class="admin-executive-stat">
          <span>Simulados publicados</span>
          <strong>${analytics.pipeline.published}</strong>
        </div>
        <div class="admin-executive-stat">
          <span>Agendados</span>
          <strong>${analytics.pipeline.scheduled}</strong>
        </div>
        <div class="admin-executive-stat">
          <span>Rascunhos</span>
          <strong>${analytics.pipeline.draft}</strong>
        </div>
      </section>

      <section class="admin-executive-list">
        <div class="admin-executive-item">Home com estatisticas e leitura analitica da plataforma.</div>
        <div class="admin-executive-item">Simulados separados em pagina propria para operacao editorial.</div>
        <div class="admin-executive-item">Ranking em pagina dedicada do admin, fora do painel do aluno.</div>
        <div class="admin-executive-item">Gestao de grupos com EF, EM, ES, Nem nem e Senior.</div>
        <div class="admin-executive-item">Usuarios em pagina independente com acoes administrativas.</div>
      </section>
    </section>
  `;
}

function renderKpis(analytics) {
  return `
    <section class="admin-ga-kpi-grid">
      ${analytics.kpis
        .map(
          (item) => `
            <article class="admin-ga-kpi-card admin-ga-kpi-${item.tone}">
              <span>${item.label}</span>
              <strong>${item.value}</strong>
              <p>${item.meta}</p>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderAnalytics(analytics) {
  const trendLabels = analytics.trend.map((item) => item.label);
  const trendAttempts = analytics.trend.map((item) => item.attempts);
  const trendAverage = analytics.trend.map((item) => item.average);
  const distributionLabels = analytics.distribution.map((item) => item.label);
  const distributionValues = analytics.distribution.map((item) => item.value);

  return `
    <section class="admin-analytics-stack">
      <article class="admin-ga-chart-card admin-ga-chart-card-wide admin-chart-hero">
        <div class="card-header">
          <div>
            <h3>Evolucao de tentativas</h3>
            <p class="muted-copy">Serie temporal pronta para integracao com Chart.js.</p>
          </div>
          <span class="badge badge-muted">ultimos 7 dias</span>
        </div>
        <div class="card-body">
          <canvas class="admin-ga-canvas" data-chart-config="${chartConfig("line", trendLabels, trendAttempts, "Tentativas", "#18324B")}"></canvas>
        </div>
      </article>

      <div class="admin-chart-support-grid">
        <article class="admin-ga-chart-card">
          <div class="card-header">
            <div>
              <h3>Base por grupo</h3>
              <p class="muted-copy">Distribuicao de alunos cadastrados.</p>
            </div>
          </div>
          <div class="card-body">
            <canvas class="admin-ga-canvas" data-chart-config="${chartConfig("bar", distributionLabels, distributionValues, "Alunos", "#6E2238")}"></canvas>
          </div>
        </article>

        <article class="admin-ga-chart-card">
          <div class="card-header">
            <div>
              <h3>Media de desempenho</h3>
              <p class="muted-copy">Percentual medio de acerto por dia.</p>
            </div>
          </div>
          <div class="card-body">
            <canvas class="admin-ga-canvas" data-chart-config="${chartConfig("line", trendLabels, trendAverage, "Percentual", "#B89345")}"></canvas>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderHomePage(analytics) {
  return `
    <section class="admin-lte-small-box-grid">
      ${analytics.kpis
        .map(
          (item) => `
            <article class="admin-lte-small-box admin-lte-small-box-${item.tone}">
              <div class="admin-lte-small-box-body">
                <div class="admin-lte-small-box-icon" aria-hidden="true">${getKpiIcon(item.tone)}</div>
                <span class="admin-lte-kpi-label">${item.label}</span>
                <h3>${item.value}</h3>
                <p>${item.meta}</p>
              </div>
            </article>
          `
        )
        .join("")}
    </section>

    <section class="admin-home-layout">
      <article class="admin-ga-surface admin-lte-card-surface admin-lte-card-wide admin-home-primary">
        <div class="card-header admin-lte-card-header">
          <div>
            <h3>Analytics da plataforma</h3>
            <p class="muted-copy">Leitura central da base, desempenho e atividade da OBDIP 2026.</p>
          </div>
          ${renderCardTools(["Chart.js ready", "7 dias"])}
        </div>
        <div class="card-body admin-lte-home-stack">
          ${renderAnalytics(analytics)}
        </div>
      </article>

      <div class="admin-home-rail">
        <article class="admin-ga-surface admin-lte-card-surface">
          <div class="card-header admin-lte-card-header">
            <div>
              <h3>Painel de publicacao</h3>
              <p class="muted-copy">Leitura rapida da esteira editorial de simulados.</p>
            </div>
            ${renderCardTools(["Editorial"])}
          </div>
          <div class="card-body admin-ga-pipeline">
            <div class="admin-ga-pipeline-card">
              <span>Publicados</span>
              <strong>${analytics.pipeline.published}</strong>
            </div>
            <div class="admin-ga-pipeline-card">
              <span>Agendados</span>
              <strong>${analytics.pipeline.scheduled}</strong>
            </div>
            <div class="admin-ga-pipeline-card">
              <span>Rascunhos</span>
              <strong>${analytics.pipeline.draft}</strong>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="admin-home-bottom">
      <article class="admin-ga-surface admin-lte-card-surface admin-home-bottom-main">
        <div class="card-header admin-lte-card-header">
          <div>
            <h3>Atividade recente dos alunos</h3>
            <p class="muted-copy">Resultados mais recentes registrados na plataforma.</p>
          </div>
          ${renderCardTools(["Tempo real"])}
        </div>
        <div class="card-body admin-ga-table">
          ${analytics.recentResults.length
            ? analytics.recentResults
                .map(
                  (item) => `
                    <div class="admin-ga-table-row">
                      <div>
                        <strong>${item.simuladoNome}</strong>
                        <span>${formatDateTime(item.dataHora)}</span>
                      </div>
                      <div class="text-right">
                        <strong>${item.percentual}%</strong>
                        <span>${item.pontuacao} pontos</span>
                      </div>
                    </div>
                  `
                )
                .join("")
            : `
                <div class="empty-state">
                  <strong>Nenhum resultado registrado</strong>
                  <p class="muted-copy">Os primeiros envios aparecerao aqui assim que os alunos concluirem simulados.</p>
                </div>
              `}
        </div>
      </article>
    </section>

    <section class="admin-home-summary">
      <article class="admin-ga-surface admin-lte-card-surface">
        <div class="card-header admin-lte-card-header">
          <div>
            <h3>Resumo executivo</h3>
            <p class="muted-copy">Leitura consolidada da operacao e do painel administrativo.</p>
          </div>
          ${renderCardTools(["OBDIP 2026"])}
        </div>
        <div class="card-body">
          ${renderHero(analytics)}
        </div>
      </article>
    </section>
  `;
}

function renderSimuladosAdmin(simulados) {
  return `
    <section class="admin-ga-list">
      ${simulados
        .map(
          (simulado) => `
            <article class="admin-ga-list-card admin-lte-list-card">
              <div class="admin-ga-list-top">
                <div>
                  <div class="tag-row">
                    <span class="badge badge-primary">${simulado.turmas.join(", ")}</span>
                    <span class="badge ${
                      simulado.status === "publicado"
                        ? "badge-success"
                        : simulado.status === "agendado"
                          ? "badge-warning"
                          : "badge-muted"
                    }">${simulado.status}</span>
                  </div>
                  <h4 class="mt-4">${simulado.nome}</h4>
                  <p class="muted-copy mt-2">${simulado.questoes.length} questoes | ${formatDuration(simulado.tempo)}</p>
                </div>
                <div class="text-right">
                  <span class="surface-eyebrow">${simulado.agendamento || "Sem agendamento"}</span>
                </div>
              </div>

              <div class="simulado-actions admin-lte-list-footer">
                <button class="btn btn-secondary btn-sm" type="button" data-simulado-action="publicar" data-simulado-id="${simulado.id}">
                  Publicar
                </button>
                <button class="btn btn-secondary btn-sm" type="button" data-simulado-action="despublicar" data-simulado-id="${simulado.id}">
                  Despublicar
                </button>
                <button class="btn btn-secondary btn-sm" type="button" data-simulado-action="agendar" data-simulado-id="${simulado.id}">
                  Agendar
                </button>
              </div>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderSimuladosPage(simulados, groups) {
  return `
    <section class="admin-ga-workspace-grid admin-lte-workspace-grid">
      <article class="admin-ga-surface admin-lte-card-surface">
        <div class="card-header admin-lte-card-header">
          <div>
            <h3>Criar simulado</h3>
            <p class="muted-copy">Dados do simulado, questoes objetivas, discursivas e publicacao.</p>
          </div>
          ${renderCardTools(["Formulario"])}
        </div>
        <form id="admin-create-simulado" class="card-body admin-stack">
          <div class="inline-fields">
            <div class="form-group">
              <label class="form-label" for="simulado-nome">Nome do simulado</label>
              <input id="simulado-nome" class="form-control" name="nome" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="simulado-turma">Grupo / turma</label>
              <select id="simulado-turma" class="form-control form-select" name="turma" required>
                ${groups.map((group) => `<option value="${group.code}">${group.name}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="inline-fields">
            <div class="form-group">
              <label class="form-label" for="simulado-tempo">Tempo de prova</label>
              <input id="simulado-tempo" class="form-control" type="number" name="tempo" min="15" value="120" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="simulado-data">Agendar publicacao</label>
              <input id="simulado-data" class="form-control" type="date" name="agendamento">
            </div>
          </div>

          <div class="question-builder-grid">
            <div class="form-group">
              <label class="form-label" for="questao-enunciado">Questao objetiva - enunciado</label>
              <textarea id="questao-enunciado" class="form-control" name="enunciado" placeholder="Digite o enunciado da questao objetiva."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="questao-comando">Comando</label>
              <input id="questao-comando" class="form-control" name="comando" placeholder="Assinale a alternativa correta">
            </div>
            <div class="form-group">
              <label class="form-label" for="questao-imagem">Imagem</label>
              <input id="questao-imagem" class="form-control" name="imagem" placeholder="URL da imagem ou referencia de upload">
            </div>
            <div class="form-group">
              <label class="form-label" for="questao-tipo">Formato de multipla escolha</label>
              <select id="questao-tipo" class="form-control form-select" name="tipo">
                <option value="A-E">A ate E</option>
                <option value="A-D">A ate D com E opcional</option>
                <option value="C-E">C ou E</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="questao-opcoes">Opcoes objetivas</label>
            <textarea id="questao-opcoes" class="form-control" name="opcoes" placeholder="A|Texto da opcao A&#10;B|Texto da opcao B&#10;C|Texto da opcao C"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="questao-discursiva">Questao discursiva</label>
            <textarea id="questao-discursiva" class="form-control" name="discursiva" placeholder="Bloco discursivo da 2a fase, com comando e orientacoes."></textarea>
          </div>

          <button class="btn btn-primary" type="submit">Criar simulado</button>
        </form>
      </article>

      <article class="admin-ga-surface admin-lte-card-surface">
        <div class="card-header admin-lte-card-header">
          <div>
            <h3>Importacao JSON</h3>
            <p class="muted-copy">Suba questoes em lote para acelerar a curadoria.</p>
          </div>
          ${renderCardTools(["Lote", "JSON"])}
        </div>
        <form id="admin-import-json" class="card-body admin-stack">
          <div class="form-group">
            <label class="form-label" for="json-import">JSON</label>
            <textarea id="json-import" class="form-control question-import-box" name="payload" placeholder='[{"numero":1,"enunciado":"...","comando":"..."}]'></textarea>
          </div>
          <div class="admin-ga-import-help">
            <div class="admin-ga-import-chip">Objetivas com imagem</div>
            <div class="admin-ga-import-chip">Formatos A-E, A-D e C-E</div>
            <div class="admin-ga-import-chip">Questoes discursivas</div>
          </div>
          <button class="btn btn-secondary" type="submit">Validar importacao</button>
        </form>
      </article>
    </section>

    <section class="admin-ga-surface admin-lte-card-surface mt-6">
      <div class="card-header admin-lte-card-header">
        <div>
          <h3>Biblioteca de simulados</h3>
          <p class="muted-copy">Controle de publicacao, despublicacao e agendamento.</p>
        </div>
        ${renderCardTools(["Biblioteca"])}
      </div>
      <div class="card-body">
        ${renderSimuladosAdmin(simulados)}
      </div>
    </section>
  `;
}

function renderRankingPage(simulados, rankingSimulado, ranking) {
  return `
    <section class="admin-ga-surface admin-lte-card-surface">
      <div class="card-header admin-lte-card-header">
        <div>
          <h3>Ranking por simulado</h3>
          <p class="muted-copy">Selecione um simulado e abra o desempenho individual em modal.</p>
        </div>
        ${renderCardTools(["Classificacao"])}
      </div>
      <div class="card-body admin-stack">
        <div class="form-group">
          <label class="form-label" for="ranking-simulado">Simulado</label>
          <select id="ranking-simulado" class="form-control form-select">
            ${simulados
              .map(
                (simulado) => `
                  <option value="${simulado.id}" ${rankingSimulado?.id === simulado.id ? "selected" : ""}>
                    ${simulado.nome}
                  </option>
                `
              )
              .join("")}
          </select>
        </div>

        ${
          !rankingSimulado
            ? `
              <div class="empty-state">
                <strong>Nenhum simulado selecionado</strong>
                <p class="muted-copy">Escolha um simulado para abrir o ranking.</p>
              </div>
            `
            : !ranking.length
              ? `
                <div class="empty-state">
                  <strong>Ranking vazio</strong>
                  <p class="muted-copy">Ainda nao ha resultados para ${rankingSimulado.nome}.</p>
                </div>
              `
              : `
                <section class="admin-ga-ranking-list">
                  ${ranking
                    .map(
                      (item, index) => `
                        <article class="admin-ga-ranking-card">
                          <div>
                            <span class="surface-eyebrow">Posicao ${index + 1}</span>
                            <h4 class="mt-4">${item.usuario}</h4>
                            <p class="muted-copy mt-2">${formatDateTime(item.dataHora)}</p>
                          </div>
                          <div class="text-right">
                            <strong>${item.percentual}%</strong>
                            <p class="muted-copy">${item.pontuacao} pontos</p>
                            <button class="btn btn-secondary btn-sm mt-4" type="button" data-open-student-result="${rankingSimulado.id}" data-user-id="${item.userId}">
                              Ver desempenho
                            </button>
                          </div>
                        </article>
                      `
                    )
                    .join("")}
                </section>
              `
        }
      </div>
    </section>
  `;
}

function renderGroupsPage(groups, users) {
  return `
    <section class="admin-ga-workspace-grid admin-lte-workspace-grid">
      <article class="admin-ga-surface admin-lte-card-surface">
        <div class="card-header admin-lte-card-header">
          <div>
            <h3>Grupos cadastrados</h3>
            <p class="muted-copy">Separacao da plataforma por grupos de alunos.</p>
          </div>
          ${renderCardTools(["EF", "EM", "ES", "Senior", "Nem nem"])}
        </div>
        <div class="card-body admin-ga-groups-grid">
          ${groups
            .map((group) => {
              const count = users.filter((user) => user.serie === group.code || (user.serie === "Desempregado" && group.code === "NemNem")).length;
              return `
                <article class="admin-ga-group-card">
                  <div class="tag-row">
                    <span class="badge badge-primary">${group.code}</span>
                    <span class="badge ${group.active ? "badge-success" : "badge-warning"}">${group.active ? "Ativo" : "Inativo"}</span>
                  </div>
                  <h4 class="mt-4">${group.name}</h4>
                  <p class="muted-copy mt-2">${count} aluno(s) vinculados</p>
                  <button class="btn btn-secondary btn-sm mt-4" type="button" data-group-action="toggle" data-group-code="${group.code}">
                    ${group.active ? "Desativar" : "Ativar"}
                  </button>
                </article>
              `;
            })
            .join("")}
        </div>
      </article>

      <article class="admin-ga-surface admin-lte-card-surface">
        <div class="card-header admin-lte-card-header">
          <div>
            <h3>Adicionar grupo</h3>
            <p class="muted-copy">Cadastre novos grupos como EF, EM, ES, Nem nem ou Senior.</p>
          </div>
          ${renderCardTools(["Cadastro"])}
        </div>
        <form id="admin-create-group" class="card-body admin-stack">
          <div class="inline-fields">
            <div class="form-group">
              <label class="form-label" for="group-code">Codigo</label>
              <input id="group-code" class="form-control" name="code" placeholder="Ex.: EF ou NN" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="group-name">Nome do grupo</label>
              <input id="group-name" class="form-control" name="name" placeholder="Ex.: Nem nem" required>
            </div>
          </div>
          <button class="btn btn-primary" type="submit">Adicionar grupo</button>
        </form>
      </article>
    </section>
  `;
}

function renderUsersPage(users) {
  return `
    <section class="admin-ga-surface admin-lte-card-surface">
      <div class="card-header admin-lte-card-header">
        <div>
          <h3>Gerenciar usuarios</h3>
          <p class="muted-copy">Permissao de email, suspensao, banimento, troca de senha e perfil.</p>
        </div>
        ${renderCardTools([`${users.length} usuarios`])}
      </div>
      <div class="card-body admin-stack">
        ${users
          .map(
            (user) => `
              <article class="admin-ga-user-row">
                <div class="flex items-center gap-4">
                  <div class="avatar">${getInitials(user.nome)}</div>
                  <div>
                    <strong>${user.nome}</strong>
                    <p class="muted-copy">${user.email}</p>
                    <p class="muted-copy">${user.escola || "Escola nao informada"} | ${formatSerieLabel(user.serie || "Sem turma")}</p>
                  </div>
                </div>
                <div class="user-actions">
                  <button class="btn btn-secondary btn-sm" type="button" data-user-action="perfil" data-user-id="${user.id}">Perfil</button>
                  <button class="btn btn-secondary btn-sm" type="button" data-user-action="email" data-user-id="${user.id}">Permissao email</button>
                  <button class="btn btn-secondary btn-sm" type="button" data-user-action="suspender" data-user-id="${user.id}">Suspender</button>
                  <button class="btn btn-secondary btn-sm" type="button" data-user-action="banir" data-user-id="${user.id}">Banir</button>
                  <button class="btn btn-secondary btn-sm" type="button" data-user-action="senha" data-user-id="${user.id}">Trocar senha</button>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function mountCanvasCharts(root) {
  const canvases = root.querySelectorAll("[data-chart-config]");

  canvases.forEach((canvas) => {
    const config = JSON.parse(canvas.dataset.chartConfig || "{}");
    const context = canvas.getContext("2d");
    if (!context || !config?.datasets?.[0]) return;

    const width = canvas.clientWidth || 520;
    const height = 220;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.height = `${height}px`;
    context.scale(ratio, ratio);
    context.clearRect(0, 0, width, height);

    const dataset = config.datasets[0];
    const values = dataset.data || [];
    const max = Math.max(...values, 1);
    const padding = { top: 18, right: 20, bottom: 30, left: 20 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    context.strokeStyle = "rgba(24, 50, 75, 0.08)";
    context.lineWidth = 1;
    for (let row = 0; row < 4; row += 1) {
      const y = padding.top + (plotHeight / 3) * row;
      context.beginPath();
      context.moveTo(padding.left, y);
      context.lineTo(width - padding.right, y);
      context.stroke();
    }

    context.fillStyle = "#64748B";
    context.font = "12px Plus Jakarta Sans";
    context.textAlign = "center";

    if (config.type === "bar") {
      const barWidth = plotWidth / Math.max(values.length, 1) - 12;
      values.forEach((value, index) => {
        const x = padding.left + index * (plotWidth / values.length) + 6;
        const barHeight = (value / max) * (plotHeight - 6);
        const y = padding.top + plotHeight - barHeight;

        context.fillStyle = dataset.color || "#18324B";
        context.globalAlpha = 0.88;
        context.fillRect(x, y, Math.max(barWidth, 18), barHeight);
        context.globalAlpha = 1;
        context.fillStyle = "#64748B";
        context.fillText(config.labels[index], x + Math.max(barWidth, 18) / 2, height - 10);
      });
      return;
    }

    const stepX = values.length > 1 ? plotWidth / (values.length - 1) : plotWidth;
    context.beginPath();
    values.forEach((value, index) => {
      const x = padding.left + stepX * index;
      const y = padding.top + plotHeight - (value / max) * (plotHeight - 8);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });

    context.strokeStyle = dataset.color || "#18324B";
    context.lineWidth = 3;
    context.stroke();

    values.forEach((value, index) => {
      const x = padding.left + stepX * index;
      const y = padding.top + plotHeight - (value / max) * (plotHeight - 8);
      context.beginPath();
      context.fillStyle = dataset.color || "#18324B";
      context.arc(x, y, 4, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#64748B";
      context.fillText(config.labels[index], x, height - 10);
    });
  });
}

export function renderAdminDashboard(root, data, handlers) {
  const { users, simulados, historico = [], section, groups, rankingSimuladoId, ranking, theme = "light" } = data;
  const rankingSimulado = simulados.find((item) => item.id === rankingSimuladoId) || simulados[0] || null;
  const analytics = buildAnalytics(users, simulados, historico, groups);
  const activeGroups = groups.filter((group) => group.active);

  const sectionContent = {
    home: renderHomePage(analytics),
    simulados: renderSimuladosPage(simulados, activeGroups.length ? activeGroups : groups),
    ranking: renderRankingPage(simulados, rankingSimulado, ranking),
    grupos: renderGroupsPage(groups, users),
    usuarios: renderUsersPage(users)
  };

  root.innerHTML = `
    <div class="sidebar-overlay"></div>
    <div class="app-shell app-shell-modern admin-ga-shell admin-lte-shell ${theme === "dark" ? "admin-theme-dark" : ""}">
      ${renderSidebar(section)}

      <div class="main-content admin-lte-main">
        ${renderTopHeader(section, theme)}

        <div class="admin-lte-content-wrapper">
          <main class="page-content page-content-modern admin-ga-page admin-lte-page">
            ${sectionContent[section] || sectionContent.home}
          </main>

          <footer class="admin-lte-footer">
            <strong>OBDIP Admin 2026.</strong>
            <span>Painel academico e operacional da plataforma.</span>
          </footer>
        </div>
      </div>
    </div>
  `;

  mountCanvasCharts(root);

  const sidebar = root.querySelector(".admin-lte-sidebar");
  const overlay = root.querySelector(".sidebar-overlay");

  root.querySelector("[data-admin-sidebar-toggle]")?.addEventListener("click", () => {
    sidebar?.classList.toggle("mobile-open");
    overlay?.classList.toggle("visible");
  });

  root.querySelector("[data-admin-theme-toggle]")?.addEventListener("click", handlers.onToggleTheme);

  overlay?.addEventListener("click", () => {
    sidebar?.classList.remove("mobile-open");
    overlay.classList.remove("visible");
  });

  root.querySelector("[data-admin-logout]")?.addEventListener("click", handlers.onLogout);
  root.querySelectorAll("[data-admin-nav]").forEach((button) => {
    button.addEventListener("click", () => handlers.onNavigate(button.dataset.adminNav));
  });

  root.querySelector("#admin-create-simulado")?.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onCreateSimulado(new FormData(event.currentTarget));
  });

  root.querySelector("#admin-import-json")?.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onImportJson(new FormData(event.currentTarget));
  });

  root.querySelector("#ranking-simulado")?.addEventListener("change", (event) => {
    handlers.onChangeRanking(event.target.value);
  });

  root.querySelector("#admin-create-group")?.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onCreateGroup(new FormData(event.currentTarget));
  });

  root.querySelectorAll("[data-group-action]").forEach((button) => {
    button.addEventListener("click", () => handlers.onGroupAction(button.dataset.groupAction, button.dataset.groupCode));
  });

  root.querySelectorAll("[data-simulado-action]").forEach((button) => {
    button.addEventListener("click", () => {
      handlers.onSimuladoAction(button.dataset.simuladoAction, button.dataset.simuladoId);
    });
  });

  root.querySelectorAll("[data-open-student-result]").forEach((button) => {
    button.addEventListener("click", () => {
      handlers.onOpenStudentResult(button.dataset.openStudentResult, button.dataset.userId);
    });
  });

  root.querySelectorAll("[data-user-action]").forEach((button) => {
    button.addEventListener("click", () => {
      handlers.onUserAction(button.dataset.userAction, button.dataset.userId);
    });
  });
}
