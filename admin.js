import { formatDateTime, formatDuration, getInitials } from "./ui.js";

const OBDIP_2025_CATEGORIES = [
  {
    id: "consul",
    nome: "Consul Junior",
    escolaridade: "8º e 9º anos do Ensino Fundamental II",
    foco: "Base introdutoria para diplomacia, cidadania global e linguas.",
    cor: "orange"
  },
  {
    id: "embaixador",
    nome: "Embaixador Junior",
    escolaridade: "Ensino Medio, incluindo EJA",
    foco: "Aprofundamento analitico e argumentativo com repertorio internacional.",
    cor: "blue"
  },
  {
    id: "chanceler",
    nome: "Chanceler Junior",
    escolaridade: "Ensino Superior",
    foco: "Alto rigor conceitual, clareza textual e articulacao diplomatica.",
    cor: "green"
  }
];

const OBDIP_2025_PHASES = [
  {
    etapa: "Inscricoes",
    data: "11 ago a 6 out 2025",
    detalhe: "Participacao aberta a estudantes de todo o pais, de instituicoes publicas e privadas reconhecidas pelo MEC.",
    meta: "Captacao nacional"
  },
  {
    etapa: "1ª fase",
    data: "10 out 2025",
    detalhe: "Prova objetiva com 40 questoes de multipla escolha, acesso entre 7h e 21h e ate 2 horas para conclusao.",
    meta: "Etapa eliminatoria"
  },
  {
    etapa: "2ª fase",
    data: "31 out 2025",
    detalhe: "Os 50 melhores de cada categoria responderam 5 questoes discursivas, cada uma com itens A e B, em ate 2 horas.",
    meta: "Etapa classificatoria"
  },
  {
    etapa: "Resultados",
    data: "20 nov 2025",
    detalhe: "Divulgacao dos vencedores, certificados por faixa de desempenho e encerramento da edicao inaugural.",
    meta: "Premiacao e certificacao"
  }
];

const OBDIP_2025_WINNERS = [
  {
    categoria: "Consul Junior",
    primeiro: "Pedro Henrique Rodrigues de Morais",
    segundo: "Alicia Mont' Alto Rodrigues",
    terceiro: "Maria Eduarda Sales Batista"
  },
  {
    categoria: "Embaixador Junior",
    primeiro: "Milena Reiff do Carmo",
    segundo: "Henrique Peres Vieira",
    terceiro: "Marina Silva Leal"
  },
  {
    categoria: "Chanceler Junior",
    primeiro: "Maria Luiza Bussulo Passuelo",
    segundo: "Stefany Santos Ferreira Zhao",
    terceiro: "Wilma Rodrigues da Silva"
  }
];

const OBDIP_2025_CERTIFICATES = [
  { titulo: "Ouro", faixa: "10 primeiros de cada categoria", destaque: "top-tier" },
  { titulo: "Prata", faixa: "11º ao 20º lugar", destaque: "mid-tier" },
  { titulo: "Bronze", faixa: "21º ao 30º lugar", destaque: "base-tier" },
  { titulo: "Mencao Honrosa", faixa: "31º ao 50º lugar", destaque: "neutral-tier" },
  { titulo: "Alto Rendimento", faixa: "Nota superior a 30 pontos na 1ª fase", destaque: "neutral-tier" },
  { titulo: "Participacao", faixa: "Todos os inscritos", destaque: "neutral-tier" }
];

function renderControlCards(stats, simulados) {
  const publicados = simulados.filter((item) => item.status === "publicado").length;
  const agendados = simulados.filter((item) => item.status === "agendado").length;

  return `
    <section class="dashboard-kpis dashboard-kpis-compact">
      <article class="kpi-card admin-kpi-card">
        <span>Base de alunos</span>
        <strong>${stats.alunos}</strong>
        <p class="muted-copy">cadastros ativos na plataforma OBDIP 2026</p>
      </article>
      <article class="kpi-card admin-kpi-card">
        <span>Simulados realizados</span>
        <strong>${stats.realizados}</strong>
        <p class="muted-copy">tentativas finalizadas no ambiente atual</p>
      </article>
      <article class="kpi-card admin-kpi-card">
        <span>Simulados publicados</span>
        <strong>${publicados}</strong>
        <p class="muted-copy">cadernos ja visiveis para os participantes</p>
      </article>
      <article class="kpi-card admin-kpi-card">
        <span>Agendamentos</span>
        <strong>${agendados}</strong>
        <p class="muted-copy">publicacoes futuras em fila</p>
      </article>
    </section>
  `;
}

function renderMissionPanel(stats) {
  return `
    <section class="admin-analytics-hero">
      <article class="admin-analytics-primary">
        <div class="tag-row">
          <span class="surface-eyebrow">OBDIP 2026</span>
          <span class="badge badge-primary">Painel de operacao</span>
        </div>
        <h2>Centro de controle da plataforma da Odisseia Brasileira de Diplomacia e Relacoes Internacionais.</h2>
        <p>
          Este dashboard administra simulados, usuarios, certificados, ranking e publicacoes da OBDIP 2026.
          A linguagem visual combina leitura analitica, blocos modulares e foco operacional.
        </p>
        <div class="admin-analytics-highlight-row">
          <div class="admin-highlight-card">
            <span>Ultimo resultado</span>
            <strong>${stats.ultimoResultado || "--"}</strong>
          </div>
          <div class="admin-highlight-card">
            <span>Atualizacao</span>
            <strong>${formatDateTime(new Date().toISOString())}</strong>
          </div>
        </div>
      </article>

      <article class="admin-analytics-side">
        <span class="surface-eyebrow">Memoria institucional</span>
        <h3>O que foi a OBDIP 2025</h3>
        <p>
          A edicao inaugural se consolidou como competicao educacional nacional em Diplomacia e Relacoes Internacionais,
          com base em CACD, ODS, e-books semanais e formacao critica para liderancas globais.
        </p>
        <div class="admin-side-metrics">
          <div>
            <strong>3</strong>
            <span>categorias oficiais</span>
          </div>
          <div>
            <strong>40</strong>
            <span>questoes na 1ª fase</span>
          </div>
          <div>
            <strong>50</strong>
            <span>classificados por categoria</span>
          </div>
        </div>
      </article>
    </section>
  `;
}

function render2025Context() {
  return `
    <section class="admin-overview-grid">
      <article class="admin-overview-card">
        <div class="card-header">
          <div>
            <h3>Resumo da edicao 2025</h3>
            <p class="muted-copy">Base conceitual para a operacao da plataforma em 2026.</p>
          </div>
        </div>
        <div class="card-body admin-stack">
          <p class="muted-copy">
            A OBDIP 2025 foi a 1ª edicao da competicao, organizada pela Ubique Junior em parceria com Grupo Ubique,
            Laboratorio de Diplomacia da USP e Instituto Recria.AI, com foco em democratizar o acesso ao conhecimento
            diplomatico desde a educacao basica.
          </p>
          <div class="admin-text-columns">
            <div>
              <strong>Eixos de conteudo</strong>
              <p class="muted-copy">Direito, Economia, Historia do Brasil e Mundial, Geografia, Relacoes Internacionais e linguas.</p>
            </div>
            <div>
              <strong>Competencias formadas</strong>
              <p class="muted-copy">Analise, interpretacao, argumentacao, cidadania ativa, dialogo internacional e lideranca global.</p>
            </div>
          </div>
        </div>
      </article>

      <article class="admin-overview-card">
        <div class="card-header">
          <div>
            <h3>Categorias oficiais</h3>
            <p class="muted-copy">Estrutura de publico mantida como referencia da plataforma.</p>
          </div>
        </div>
        <div class="card-body admin-category-grid">
          ${OBDIP_2025_CATEGORIES.map((item) => `
            <article class="admin-category-card admin-category-card-${item.cor}">
              <span class="surface-eyebrow">${item.nome}</span>
              <strong>${item.escolaridade}</strong>
              <p>${item.foco}</p>
            </article>
          `).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderTimelineAndCertificates() {
  return `
    <section class="admin-overview-grid">
      <article class="admin-overview-card">
        <div class="card-header">
          <div>
            <h3>Jornada competitiva 2025</h3>
            <p class="muted-copy">Cronograma que orienta a governanca da edicao 2026.</p>
          </div>
        </div>
        <div class="card-body admin-timeline">
          ${OBDIP_2025_PHASES.map((item, index) => `
            <article class="admin-timeline-item">
              <div class="admin-timeline-index">${index + 1}</div>
              <div>
                <div class="tag-row">
                  <span class="badge badge-primary">${item.etapa}</span>
                  <span class="badge badge-muted">${item.data}</span>
                </div>
                <p class="mt-4">${item.detalhe}</p>
                <small class="text-muted">${item.meta}</small>
              </div>
            </article>
          `).join("")}
        </div>
      </article>

      <article class="admin-overview-card">
        <div class="card-header">
          <div>
            <h3>Mapa de certificados</h3>
            <p class="muted-copy">Faixas de reconhecimento adotadas na primeira edicao.</p>
          </div>
        </div>
        <div class="card-body admin-certificate-map">
          ${OBDIP_2025_CERTIFICATES.map((item) => `
            <article class="admin-certificate-item ${item.destaque}">
              <strong>${item.titulo}</strong>
              <span>${item.faixa}</span>
            </article>
          `).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderWinners() {
  return `
    <article class="admin-overview-card">
      <div class="card-header">
        <div>
          <h3>Hall da edicao inaugural</h3>
          <p class="muted-copy">Vencedores da OBDIP 2025 por categoria.</p>
        </div>
      </div>
      <div class="card-body admin-winners-grid">
        ${OBDIP_2025_WINNERS.map((item) => `
          <article class="admin-winner-card">
            <span class="surface-eyebrow">${item.categoria}</span>
            <div class="admin-winner-line"><strong>1º</strong><span>${item.primeiro}</span></div>
            <div class="admin-winner-line"><strong>2º</strong><span>${item.segundo}</span></div>
            <div class="admin-winner-line"><strong>3º</strong><span>${item.terceiro}</span></div>
          </article>
        `).join("")}
      </div>
    </article>
  `;
}

function renderSimuladosAdmin(simulados) {
  return `
    <section class="admin-list-grid">
      ${simulados
        .map(
          (simulado) => `
            <article class="simulado-admin-card">
              <div class="simulado-admin-top">
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

              <div class="simulado-actions">
                <button class="btn btn-secondary btn-sm" type="button" data-simulado-action="publicar" data-simulado-id="${simulado.id}">
                  Publicar
                </button>
                <button class="btn btn-secondary btn-sm" type="button" data-simulado-action="despublicar" data-simulado-id="${simulado.id}">
                  Despublicar
                </button>
                <button class="btn btn-secondary btn-sm" type="button" data-simulado-action="agendar" data-simulado-id="${simulado.id}">
                  Agendar
                </button>
                <button class="btn btn-primary btn-sm" type="button" data-open-ranking="${simulado.id}">
                  Ranking
                </button>
              </div>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderRanking(simulado, ranking) {
  if (!simulado) {
    return `
      <div class="empty-state">
        <strong>Nenhum simulado selecionado</strong>
        <p class="muted-copy">Escolha um simulado para abrir o ranking.</p>
      </div>
    `;
  }

  if (!ranking.length) {
    return `
      <div class="empty-state">
        <strong>Ranking vazio</strong>
        <p class="muted-copy">Ainda nao ha resultados para ${simulado.nome}.</p>
      </div>
    `;
  }

  return `
    <section class="admin-ranking-list">
      ${ranking
        .map(
          (item, index) => `
            <article class="admin-ranking-card">
              <div>
                <span class="surface-eyebrow">Posicao ${index + 1}</span>
                <h4 class="mt-4">${item.usuario}</h4>
                <p class="muted-copy mt-2">${formatDateTime(item.dataHora)}</p>
              </div>
              <div class="text-right">
                <strong>${item.percentual}%</strong>
                <p class="muted-copy">${item.pontuacao} pontos</p>
                <button class="btn btn-secondary btn-sm mt-4" type="button" data-open-student-result="${simulado.id}" data-user-id="${item.userId}">
                  Ver desempenho
                </button>
              </div>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderUsers(users) {
  return users
    .map(
      (user) => `
        <article class="admin-user-row">
          <div class="flex items-center gap-4">
            <div class="avatar">${getInitials(user.nome)}</div>
            <div>
              <strong>${user.nome}</strong>
              <p class="muted-copy">${user.email}</p>
              <p class="muted-copy">${user.escola || "Escola nao informada"} | ${user.serie || "Sem turma"}</p>
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
    .join("");
}

export function renderAdminDashboard(root, data, handlers) {
  const { users, stats, simulados, rankingSimuladoId, ranking } = data;
  const rankingSimulado = simulados.find((item) => item.id === rankingSimuladoId) || simulados[0] || null;

  root.innerHTML = `
    <div class="sidebar-overlay"></div>
    <div class="app-shell app-shell-modern">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="sidebar-logo-icon">OB</div>
          <div class="sidebar-logo-text">OBDIP <span>Admin</span></div>
        </div>

        <nav class="sidebar-nav">
          <div class="sidebar-section-title">Operacao</div>
          <div class="nav-item active">
            <span class="nav-item-icon">GA</span>
            <span>Analytics e Gestao</span>
          </div>
        </nav>

        <div class="sidebar-footer">
          <button class="btn btn-secondary" type="button" data-admin-logout>Logoff</button>
        </div>
      </aside>

      <div class="main-content">
        <header class="top-header top-header-modern">
          <div>
            <div class="page-title">Admin OBDIP 2026</div>
            <div class="text-sm text-muted">Painel de leitura analitica, memoria 2025 e operacao da proxima edicao.</div>
          </div>
          <div class="header-actions">
            <div class="top-status-pill">Analytics mode</div>
          </div>
        </header>

        <main class="page-content page-content-modern">
          ${renderMissionPanel(stats)}
          ${renderControlCards(stats, simulados)}
          ${render2025Context()}
          ${renderTimelineAndCertificates()}
          ${renderWinners()}

          <section class="admin-surface-grid">
            <article class="admin-surface">
              <div class="card-header">
                <div>
                  <h3>Gerenciar simulados 2026</h3>
                  <p class="muted-copy">Criacao, importacao, publicacao, despublicacao e agendamento.</p>
                </div>
              </div>
              <form id="admin-create-simulado" class="card-body admin-stack">
                <div class="inline-fields">
                  <div class="form-group">
                    <label class="form-label" for="simulado-nome">Nome do simulado</label>
                    <input id="simulado-nome" class="form-control" name="nome" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="simulado-turma">Categoria / turma</label>
                    <select id="simulado-turma" class="form-control form-select" name="turma" required>
                      <option value="EF">Consul Junior</option>
                      <option value="EM">Embaixador Junior</option>
                      <option value="ES">Chanceler Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Desempregado">Desempregado</option>
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
                  <textarea id="questao-discursiva" class="form-control" name="discursiva" placeholder="Bloco discursivo da 2ª fase, com comando e orientacoes de resposta."></textarea>
                </div>

                <button class="btn btn-primary" type="submit">Criar simulado</button>
              </form>
            </article>

            <article class="admin-surface">
              <div class="card-header">
                <div>
                  <h3>Importar questoes em JSON</h3>
                  <p class="muted-copy">Suba lotes objetivos e discursivos para acelerar a curadoria.</p>
                </div>
              </div>
              <form id="admin-import-json" class="card-body admin-stack">
                <div class="form-group">
                  <label class="form-label" for="json-import">JSON</label>
                  <textarea
                    id="json-import"
                    class="form-control question-import-box"
                    name="payload"
                    placeholder='[{"numero":1,"enunciado":"...","comando":"...","opcoes":[{"letra":"A","texto":"..."}]}]'
                  ></textarea>
                </div>
                <button class="btn btn-secondary" type="submit">Validar importacao</button>
              </form>
            </article>
          </section>

          <section class="admin-surface-grid">
            <article class="admin-surface">
              <div class="card-header">
                <div>
                  <h3>Biblioteca de simulados</h3>
                  <p class="muted-copy">Leitura operacional dos cadernos em producao e ja publicados.</p>
                </div>
              </div>
              <div class="card-body">
                ${renderSimuladosAdmin(simulados)}
              </div>
            </article>

            <article class="admin-surface">
              <div class="card-header">
                <div>
                  <h3>Ranking e desempenho</h3>
                  <p class="muted-copy">Escolha um simulado e abra o desempenho individual em modal.</p>
                </div>
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
                ${renderRanking(rankingSimulado, ranking)}
              </div>
            </article>
          </section>

          <section class="admin-surface">
            <div class="card-header">
              <div>
                <h3>Gerenciar usuarios</h3>
                <p class="muted-copy">Permissao de email, suspensao, banimento, troca de senha e perfil com certificados.</p>
              </div>
            </div>
            <div class="card-body admin-stack">
              ${renderUsers(users)}
            </div>
          </section>
        </main>
      </div>
    </div>
  `;

  root.querySelector("[data-admin-logout]")?.addEventListener("click", handlers.onLogout);

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

  root.querySelectorAll("[data-simulado-action]").forEach((button) => {
    button.addEventListener("click", () => {
      handlers.onSimuladoAction(button.dataset.simuladoAction, button.dataset.simuladoId);
    });
  });

  root.querySelectorAll("[data-open-ranking]").forEach((button) => {
    button.addEventListener("click", () => handlers.onChangeRanking(button.dataset.openRanking));
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
