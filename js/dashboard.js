import { Storage } from "./data.js";
import { formatDateTime, formatDuration, formatSerieLabel, getInitials } from "./ui.js";

function renderIcon(name) {
  const icons = {
    home: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10.5L12 3l9 7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5.5 9.5V20h13V9.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    books: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3V4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M8 7h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    simulados: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="3.5" width="16" height="17" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <path d="M8 8h8M8 12h8M8 16h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    resultados: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 18V9m7 9V5m7 13v-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    certificados: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4h10v8a5 5 0 01-10 0V4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M10 16l-1 4 3-2 3 2-1-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>
    `,
    notifications: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4a4 4 0 014 4v2.4c0 .8.25 1.59.71 2.25L18 14.5H6l1.29-1.85A4 4 0 008 10.4V8a4 4 0 014-4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M10 18a2 2 0 004 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    conta: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <path d="M5 19a7 7 0 0114 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    contato: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16v12H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M5 7l7 6 7-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    logout: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 17l5-5-5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 12H4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M20 4v16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    menu: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    perfil: `
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

function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getLatestResultado(resultados) {
  return resultados.filter(Boolean).sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0] || null;
}

function getProgressStats(simulados, resultados) {
  const completed = resultados.filter(Boolean);
  const completedCount = completed.length;
  const total = simulados.length;
  const completionPercent = total ? Math.round((completedCount / total) * 100) : 0;
  const averageScore = completed.length
    ? Math.round(completed.reduce((sum, item) => sum + item.percentual, 0) / completed.length)
    : 0;

  return {
    total,
    completedCount,
    completionPercent,
    averageScore
  };
}

function getMaterialCategory(ebook) {
  const title = (ebook.titulo || "").toLowerCase();

  if (title.includes("biologia")) return "Biologia";
  if (title.includes("quim")) return "Quimica";
  if (title.includes("fis")) return "Fisica";
  if (title.includes("matem")) return "Matematica";
  if (title.includes("reda")) return "Redacao";
  if (title.includes("hist")) return "Historia";
  return "Estudos gerais";
}

function getSimuladoStatus(simulado, user, resultado) {
  if (resultado) return { label: "Concluido", tone: "success" };

  const respostas = Storage.getRespostas(simulado.id, user.id);
  if (Object.keys(respostas || {}).length) {
    return { label: "Em andamento", tone: "warning" };
  }

  return { label: "Nao iniciado", tone: "neutral" };
}

function renderProgressBar(value) {
  return `
    <div class="student-progress-track" aria-hidden="true">
      <div class="student-progress-fill" style="width: ${Math.max(0, Math.min(100, value))}%"></div>
    </div>
  `;
}

function renderHome({ user, simulados, resultados, notifications }) {
  const stats = getProgressStats(simulados, resultados);
  const latest = getLatestResultado(resultados);
  const nextSimulado =
    simulados.find((simulado) => !resultados.find((item) => item?.simuladoId === simulado.id)) ||
    simulados[0] ||
    null;
  const topNotice = notifications[0] || null;

  return `
    <section class="student-home-grid">
      <article class="student-card student-card-accent student-home-progress">
        <div class="student-card-head">
          <div>
            <span class="student-eyebrow">Progresso geral</span>
            <h3>Seu percurso de estudo</h3>
          </div>
          <strong class="student-metric-inline">${stats.completionPercent}%</strong>
        </div>
        <p class="student-copy">
          ${stats.completedCount} de ${stats.total || 0} simulados concluidos para ${formatSerieLabel(user.serie)}.
        </p>
        ${renderProgressBar(stats.completionPercent)}
        <div class="student-mini-metrics">
          <div>
            <span>Media geral</span>
            <strong>${stats.averageScore || 0}%</strong>
          </div>
          <div>
            <span>Perfil</span>
            <strong>${formatSerieLabel(user.serie)}</strong>
          </div>
        </div>
      </article>

      <article class="student-card student-summary-card" data-searchable data-search="${escapeAttribute(latest?.simuladoNome || "ultimo simulado")}">
        <div class="student-card-head">
          <div>
            <span class="student-eyebrow">Ultimo simulado</span>
            <h3>${latest ? latest.simuladoNome : "Nenhum simulado finalizado"}</h3>
          </div>
        </div>
        <p class="student-copy">
          ${latest ? `${latest.percentual}% de acerto em ${formatDateTime(latest.dataHora)}.` : "Quando voce concluir a primeira prova, o resumo aparecera aqui."}
        </p>
        ${latest ? `<button class="btn btn-secondary mt-4" type="button" data-view-result="${latest.simuladoId}">Ver detalhes</button>` : ""}
      </article>

      <article class="student-card student-summary-card" data-searchable data-search="${escapeAttribute(nextSimulado?.nome || "proximo simulado")}">
        <div class="student-card-head">
          <div>
            <span class="student-eyebrow">Proximo simulado</span>
            <h3>${nextSimulado ? nextSimulado.nome : "Nenhum simulado disponivel"}</h3>
          </div>
        </div>
        <p class="student-copy">
          ${nextSimulado ? `${nextSimulado.questoes.length} questoes | ${formatDuration(nextSimulado.tempo)} | visualizacao unica e por rolagem.` : "A equipe ainda nao publicou uma nova prova para o seu grupo."}
        </p>
        ${nextSimulado ? `<button class="btn btn-primary mt-4" type="button" data-start-simulado="${nextSimulado.id}">Iniciar simulado</button>` : ""}
      </article>

      <article class="student-card student-summary-card" data-searchable data-search="${escapeAttribute(topNotice?.titulo || "avisos importantes")}">
        <div class="student-card-head">
          <div>
            <span class="student-eyebrow">Avisos importantes</span>
            <h3>${topNotice ? topNotice.titulo : "Sem novos avisos"}</h3>
          </div>
        </div>
        <p class="student-copy">
          ${topNotice ? topNotice.texto : "As comunicacoes da plataforma aparecerao aqui."}
        </p>
        <button class="btn btn-secondary mt-4" type="button" data-nav-jump="notificacoes">Abrir notificacoes</button>
      </article>
    </section>
  `;
}

function renderBiblioteca(ebooks) {
  if (!ebooks.length) {
    return `
      <div class="empty-state student-empty">
        <strong>Nenhum e-book disponivel</strong>
        <p class="muted-copy">Os materiais em PDF serao liberados conforme a sua categoria.</p>
      </div>
    `;
  }

  return `
    <section class="student-ebook-grid">
      ${ebooks
        .map((ebook) => {
          const category = getMaterialCategory(ebook);
          return `
            <article class="student-card student-ebook-card" data-searchable data-search="${escapeAttribute(`${ebook.titulo} ${category} ${ebook.autor}`)}">
              <div class="student-ebook-top">
                <div class="student-ebook-badge">${ebook.formato}</div>
                <div class="student-ebook-cover" style="background:${ebook.gradiente}">
                  <span>${ebook.emoji || "PDF"}</span>
                </div>
              </div>
              <div class="student-ebook-body">
                <span class="student-chip">${category}</span>
                <h3>${ebook.titulo}</h3>
                <p class="student-copy">${ebook.descricao}</p>
                <div class="student-inline-meta">
                  <span>${ebook.paginas} pags</span>
                  <span>${ebook.tamanho}</span>
                </div>
                <button class="btn btn-secondary mt-4" type="button" data-ebook-download="${ebook.id}">Baixar PDF</button>
              </div>
            </article>
          `;
        })
        .join("")}
    </section>
  `;
}

function renderSimulados(simulados, resultados, user) {
  if (!simulados.length) {
    return `
      <div class="empty-state student-empty">
        <strong>Nenhum simulado disponivel</strong>
        <p class="muted-copy">Assim que novas provas forem publicadas para seu grupo, elas aparecerao aqui.</p>
      </div>
    `;
  }

  const availableFilters = ["Todos", ...new Set(simulados.flatMap((simulado) => simulado.turmas))];

  return `
    <section class="student-simulado-page">
      <div class="student-filter-bar">
        <span class="student-filter-label">Filtrar por nivel</span>
        <div class="student-filter-pills">
          ${availableFilters
            .map(
              (filter, index) => `
                <button class="student-filter-pill ${index === 0 ? "active" : ""}" type="button" data-simulado-filter="${filter}">
                  ${filter === "Todos" ? "Todos" : formatSerieLabel(filter)}
                </button>
              `
            )
            .join("")}
        </div>
      </div>

      <section class="student-simulado-grid">
        ${simulados
          .map((simulado) => {
            const resultado = resultados.find((item) => item?.simuladoId === simulado.id);
            const status = getSimuladoStatus(simulado, user, resultado);
            return `
              <article
                class="student-card student-simulado-card"
                data-searchable
                data-levels="${escapeAttribute(simulado.turmas.join(","))}"
                data-search="${escapeAttribute(`${simulado.nome} ${simulado.turmas.join(" ")} ${status.label}`)}"
              >
                <div class="student-card-head">
                  <div>
                    <div class="student-chip-row">
                      <span class="student-chip">${simulado.turmas.map(formatSerieLabel).join(" / ")}</span>
                      <span class="student-status-badge student-status-${status.tone}">${status.label}</span>
                    </div>
                    <h3>${simulado.nome}</h3>
                  </div>
                  <div class="student-score-pill">
                    <strong>${resultado ? `${resultado.percentual}%` : "--"}</strong>
                    <span>${resultado ? "acerto" : "status"}</span>
                  </div>
                </div>

                <div class="student-inline-meta">
                  <span>${simulado.questoes.length} questoes</span>
                  <span>${formatDuration(simulado.tempo)}</span>
                  <span>${simulado.status}</span>
                </div>

                <p class="student-copy">
                  Prova com questoes objetivas, imagens, modo por rolagem continua e visualizacao unica com escadinha lateral.
                </p>

                <div class="student-action-row">
                  <button class="btn btn-primary" type="button" data-start-simulado="${simulado.id}">Iniciar simulado</button>
                  <button class="btn btn-secondary" type="button" data-view-result="${simulado.id}" ${resultado ? "" : "disabled"}>Ver resultado</button>
                </div>
              </article>
            `;
          })
          .join("")}
      </section>
    </section>
  `;
}

function renderReviewOptions(questao) {
  return `
    <div class="opcoes-lista review-opcoes">
      ${questao.opcoes
        .map((opcao) => {
          const isCorrect = opcao.letra === questao.gabarito;
          const isSelected = opcao.letra === questao.escolha;
          const classes = [
            "opcao-item",
            isCorrect ? "gabarito-correct" : "",
            isSelected && !isCorrect ? "gabarito-wrong" : "",
            isSelected ? "review-selected" : ""
          ]
            .filter(Boolean)
            .join(" ");

          return `
            <div class="${classes}">
              <div class="opcao-label opcao-label-static">
                <span class="opcao-letra">${opcao.letra}</span>
                <span class="opcao-texto">${opcao.texto}</span>
              </div>
              <div class="review-option-tags">
                ${isSelected ? `<span class="badge ${questao.acertou ? "badge-success" : "badge-warning"}">Marcada pelo aluno</span>` : ""}
                ${isCorrect ? `<span class="badge badge-success">Gabarito</span>` : ""}
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderResultadoDetail(resultado) {
  if (!resultado) return "";

  return `
    <section class="student-results-detail">
      <article class="student-card student-results-hero">
        <div class="student-card-head">
          <div>
            <span class="student-eyebrow">Detalhes do resultado</span>
            <h3>${resultado.simuladoNome}</h3>
          </div>
          <strong class="student-metric-inline">${resultado.percentual}%</strong>
        </div>
        <p class="student-copy">Tentativa concluida em ${formatDateTime(resultado.dataHora)}.</p>
        <div class="student-mini-metrics">
          <div>
            <span>Acertos</span>
            <strong>${resultado.acertos}</strong>
          </div>
          <div>
            <span>Erros</span>
            <strong>${resultado.erros}</strong>
          </div>
          <div>
            <span>Brancos</span>
            <strong>${resultado.brancos}</strong>
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
                    <span class="badge ${questao.acertou ? "badge-success" : "badge-error"}">Questao ${questao.numero}</span>
                    <h4 class="mt-4">${questao.disciplina}</h4>
                  </div>
                  <div class="tag-row">
                    <span class="option-badge ${questao.acertou ? "correct" : "wrong"}">Sua resposta: ${questao.escolha || "Em branco"}</span>
                    <span class="option-badge correct">Gabarito: ${questao.gabarito}</span>
                  </div>
                </header>
                <div class="review-item-body">
                  <div class="questao-enunciado">${questao.enunciado}</div>
                  ${renderReviewOptions(questao)}
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

function renderResultados(resultados, resultadoSelecionado) {
  const completed = resultados.filter(Boolean).sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

  if (!completed.length) {
    return `
      <div class="empty-state student-empty">
        <strong>Nenhum resultado disponivel</strong>
        <p class="muted-copy">Finalize seu primeiro simulado para liberar esta pagina.</p>
      </div>
    `;
  }

  return `
    <section class="student-results-page">
      <section class="student-results-list">
        ${completed
          .map(
            (resultado) => `
              <article
                class="student-card student-result-card ${resultadoSelecionado?.simuladoId === resultado.simuladoId ? "selected" : ""}"
                data-searchable
                data-search="${escapeAttribute(`${resultado.simuladoNome} ${resultado.percentual}`)}"
              >
                <div class="student-result-main">
                  <div>
                    <span class="student-eyebrow">Simulado concluido</span>
                    <h3>${resultado.simuladoNome}</h3>
                    <p class="student-copy">${formatDateTime(resultado.dataHora)}</p>
                  </div>
                  <div class="student-result-score">
                    <strong>${resultado.percentual}%</strong>
                    <span>${resultado.acertos}/${resultado.total}</span>
                  </div>
                </div>
                <button class="btn btn-secondary mt-4" type="button" data-view-result="${resultado.simuladoId}">
                  Ver detalhes
                </button>
              </article>
            `
          )
          .join("")}
      </section>

      ${renderResultadoDetail(resultadoSelecionado || completed[0])}
    </section>
  `;
}

function renderCertificates(certificates) {
  if (!certificates.length) {
    return `
      <div class="empty-state student-empty">
        <strong>Nenhum certificado disponivel</strong>
        <p class="muted-copy">Seu certificado oficial de participacao aparecera aqui assim que for liberado.</p>
      </div>
    `;
  }

  const certificate = certificates[0];
  const statusMeta = getCertificateStatusMeta(certificate.status);

  return `
    <section class="certificate-hub">
      <article class="certificate-hub-hero">
        <div class="certificate-hub-copy">
          <span class="certificate-hub-kicker">OBDIP 2026</span>
          <h3>Certificado oficial de participacao</h3>
          <p>
            Esta area reune exclusivamente o seu certificado de participacao na 2a edicao da OBDIP,
            com emissao institucional e layout pronto para impressao em A4 horizontal.
          </p>
        </div>
        <div class="certificate-hub-stamp">
          <span>Status</span>
          <strong>${statusMeta.label}</strong>
        </div>
      </article>

      <div class="certificate-hub-layout">
        <article
          class="student-card certificate-hub-card"
          data-searchable
          data-search="${escapeAttribute(`${certificate.titulo} ${certificate.tipo} ${certificate.status}`)}"
        >
          <div class="certificate-hub-card-main">
            <span class="student-eyebrow">${certificate.tipo}</span>
            <h3>${certificate.titulo}</h3>
            <p class="student-copy">${certificate.descricao}</p>

            <div class="certificate-hub-meta">
              <div>
                <span>Liberacao</span>
                <strong>${certificate.data}</strong>
              </div>
              <div>
                <span>Categoria</span>
                <strong>${certificate.serieLabel}</strong>
              </div>
              <div>
                <span>Codigo</span>
                <strong>${certificate.codigo}</strong>
              </div>
            </div>
          </div>

          <div class="certificate-hub-actions">
            <span class="student-status-badge ${statusMeta.className}">${statusMeta.label}</span>
            ${
              certificate.disponivel
                ? `<button class="btn btn-primary" type="button" data-certificate="${certificate.id}">${certificate.acao}</button>`
                : `<button class="btn btn-secondary" type="button" disabled>${certificate.acao}</button>`
            }
            <p class="certificate-hub-note-text">
              ${certificate.disponivel
                ? "Abra o preview para revisar e imprimir o documento."
                : "Finalize sua primeira prova para liberar o certificado."}
            </p>
          </div>
        </article>

        <aside class="student-card certificate-hub-aside">
          <span class="certificate-hub-aside-kicker">Impressao recomendada</span>
          <h3>Pronto para reuniao, secretaria e arquivo</h3>
          <p class="student-copy">
            O certificado foi pensado para impressao em folha A4 horizontal, com acabamento institucional,
            codigo de validacao e composicao visual mais elegante para apresentacao fisica.
          </p>
          <div class="certificate-hub-tips">
            <div>
              <span>Formato</span>
              <strong>A4 horizontal</strong>
            </div>
            <div>
              <span>Papel indicado</span>
              <strong>Couche ou sulfite 180g</strong>
            </div>
            <div>
              <span>Uso</span>
              <strong>Impressao e apresentacao</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  `;
}

function getCertificateStatusMeta(status) {
  if (status === "Disponivel") {
    return { label: "Disponivel", className: "student-status-success" };
  }

  if (status === "Em validacao") {
    return { label: "Em validacao", className: "student-status-neutral" };
  }

  return { label: "Pendente", className: "student-status-warning" };
}

function renderNotifications(notifications) {
  if (!notifications.length) {
    return `
      <div class="empty-state student-empty">
        <strong>Sem notificacoes no momento</strong>
        <p class="muted-copy">Novos avisos e atualizacoes aparecerao neste feed.</p>
      </div>
    `;
  }

  return `
    <section class="student-notification-feed">
      ${notifications
        .map(
          (item) => {
            const notificationMeta = getNotificationTypeMeta(item.tipo);

            return `
            <article class="student-card student-notification-card" data-searchable data-search="${escapeAttribute(`${item.titulo} ${item.texto}`)}">
              <div class="student-card-head">
                <div>
                  <span class="student-eyebrow">${item.tempo}</span>
                  <h3>${item.titulo}</h3>
                </div>
                <span class="student-status-badge ${notificationMeta.className}">${notificationMeta.label}</span>
              </div>
              <p class="student-copy">${item.texto}</p>
            </article>
          `;
          }
        )
        .join("")}
    </section>
  `;
}

function getNotificationTypeMeta(type) {
  const meta = {
    success: { label: "Sucesso", className: "student-status-success" },
    warning: { label: "Aviso", className: "student-status-warning" },
    primary: { label: "Informacao", className: "student-status-neutral" },
    muted: { label: "Atualizacao", className: "student-status-neutral" }
  };

  return meta[type] || { label: "Notificacao", className: "student-status-neutral" };
}

function getDocumentStatusMeta(status) {
  const meta = {
    pendente: { label: "Pendente", badge: "badge-warning" },
    em_analise: { label: "Em analise", badge: "badge-primary" },
    validado: { label: "Validado", badge: "badge-success" },
    reprovado: { label: "Recusado", badge: "badge-error" }
  };

  return meta[status] || { label: status || "Sem status", badge: "badge-muted" };
}

function renderStudentDocuments(documents) {
  if (!documents.length) {
    return `
      <div class="empty-state student-empty">
        <strong>Nenhum documento recebido ainda</strong>
        <p class="muted-copy">Os comprovantes da sua matricula aparecerao aqui para acompanhamento.</p>
      </div>
    `;
  }

  const counts = {
    total: documents.length,
    approved: documents.filter((item) => item.status === "validado").length,
    analysis: documents.filter((item) => item.status === "em_analise").length,
    rejected: documents.filter((item) => item.status === "reprovado").length
  };

  return `
    <section class="student-docs-shell">
      <article class="student-docs-hero">
        <div class="student-docs-hero-copy">
          <span class="student-docs-hero-kicker">Central do aluno</span>
          <h3>Documentos da matricula</h3>
          <p>
            Acompanhe a analise dos PDFs recebidos pela equipe OBDIP, confira aprovacoes,
            veja motivos de recusa e reenvie o documento quando necessario.
          </p>
        </div>
        <div class="student-docs-hero-mark">
          <strong>OBDIP</strong>
          <span>2026</span>
        </div>
      </article>

      <section class="student-docs-summary">
        <article class="student-docs-stat">
          <span>Total</span>
          <strong>${counts.total}</strong>
          <p>Documentos vinculados a sua matricula</p>
        </article>
        <article class="student-docs-stat">
          <span>Aprovados</span>
          <strong>${counts.approved}</strong>
          <p>PDFs validados pela equipe</p>
        </article>
        <article class="student-docs-stat">
          <span>Em analise</span>
          <strong>${counts.analysis}</strong>
          <p>Arquivos aguardando conferencia</p>
        </article>
        <article class="student-docs-stat">
          <span>Recusados</span>
          <strong>${counts.rejected}</strong>
          <p>Itens que exigem novo envio</p>
        </article>
      </section>

      <section class="student-docs-layout">
        <div class="student-docs-main">
          <div class="student-docs-table-head">
            <div>
              <span class="student-docs-table-label">Documento</span>
              <strong>Situacao da sua documentacao</strong>
            </div>
            <span class="student-docs-table-meta">Atualizado automaticamente pela secretaria</span>
          </div>

          <section class="student-docs-list">
            ${documents
              .map((document) => {
                const statusMeta = getDocumentStatusMeta(document.status);
                return `
                  <article class="student-docs-row" data-searchable data-search="${escapeAttribute(`${document.nome} ${document.status} ${document.rejectionReasonText || ""}`)}">
                    <div class="student-docs-row-main">
                      <div class="student-docs-row-top">
                        <div>
                          <span class="student-docs-type">${document.tipo}</span>
                          <h3>${document.nome}</h3>
                        </div>
                        <span class="badge ${statusMeta.badge}">${statusMeta.label}</span>
                      </div>

                      <div class="student-docs-meta">
                        <span>${document.arquivoNome || "PDF recebido na matricula"}</span>
                        <span>${formatDateTime(document.atualizadoEm || document.enviadoEm)}</span>
                      </div>

                      <p class="student-copy">${document.referencia || "Documento recebido no fluxo de matricula."}</p>

                      ${document.rejectionReasonText ? `
                        <div class="student-docs-rejection-box">
                          <strong>Motivo da reprovacao</strong>
                          <p>${document.rejectionReasonText}</p>
                        </div>
                      ` : ""}

                      ${document.status === "reprovado" ? `
                        <form class="student-docs-reupload" data-document-reupload-form="${document.id}">
                          <div class="form-group">
                            <label class="form-label" for="reupload-${document.id}">Reenviar PDF corrigido</label>
                            <input id="reupload-${document.id}" class="form-control" type="file" name="arquivo" accept="application/pdf,.pdf" required>
                          </div>
                          <button class="btn btn-primary" type="submit">Reenviar documento</button>
                        </form>
                      ` : ""}
                    </div>
                  </article>
                `;
              })
              .join("")}
          </section>
        </div>

        <aside class="student-docs-aside">
          <article class="student-card student-docs-note">
            <span class="student-eyebrow">Orientacoes</span>
            <h3>Como manter sua documentacao regular</h3>
            <p class="student-copy">
              Envie sempre PDFs legiveis, com todas as paginas necessarias e informacoes consistentes com o cadastro.
            </p>
            <ul class="student-docs-guidelines">
              <li>Use somente arquivos em PDF.</li>
              <li>Confira nome completo e instituicao antes do envio.</li>
              <li>Se houver recusa, corrija o arquivo e reenvie nesta mesma pagina.</li>
              <li>Aprovacoes e recusas chegam tambem na aba de notificacoes.</li>
            </ul>
          </article>

          <article class="student-card student-docs-note student-docs-contact">
            <span class="student-eyebrow">Atendimento</span>
            <h3>Precisa de ajuda?</h3>
            <p class="student-copy">
              Se tiver duvidas sobre a documentacao da matricula, fale com a equipe pela aba Contato.
            </p>
            <button class="btn btn-secondary" type="button" data-nav-jump="contato">Abrir contato</button>
          </article>
        </aside>
      </section>
    </section>
  `;
}

function renderConta(user) {
  return `
    <section class="student-form-layout">
      <article class="student-card student-form-card">
        <div class="student-card-head">
          <div>
            <span class="student-eyebrow">Conta</span>
            <h3>Atualize seus dados</h3>
          </div>
        </div>
        <form id="account-form" class="student-form-stack">
          <div class="inline-fields">
            <div class="form-group">
              <label class="form-label" for="account-name">Nome</label>
              <input id="account-name" class="form-control" name="nome" value="${user.nome}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="account-email">Email</label>
              <input id="account-email" class="form-control" type="email" name="email" value="${user.email}" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="account-password">Senha</label>
            <input id="account-password" class="form-control" type="password" name="senha" placeholder="Digite uma nova senha">
          </div>

          <button class="btn btn-primary" type="submit">Salvar alteracoes</button>
        </form>
      </article>

      <article class="student-card student-aside-note">
        <span class="student-eyebrow">Acesso</span>
        <h3>Informacoes da sua conta</h3>
        <p class="student-copy">
          Mantenha nome, email e senha atualizados para acessar a plataforma, receber notificacoes e acompanhar seus resultados.
        </p>
      </article>
    </section>
  `;
}

function renderContato(user) {
  return `
    <section class="student-form-layout">
      <article class="student-card student-form-card">
        <div class="student-card-head">
          <div>
            <span class="student-eyebrow">Contato</span>
            <h3>Fale com a equipe</h3>
          </div>
        </div>
        <form id="contact-form" class="student-form-stack">
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
          <button class="btn btn-primary" type="submit">Enviar</button>
        </form>
      </article>

      <article class="student-card student-aside-note">
        <span class="student-eyebrow">Suporte</span>
        <h3>Duvidas sobre estudo e provas</h3>
        <p class="student-copy">
          Use este canal para falar sobre acesso, e-books, simulados, certificados ou qualquer duvida sobre a plataforma.
        </p>
      </article>
    </section>
  `;
}

export function renderStudentDashboard(root, data, handlers) {
  const {
    user,
    section,
    documents = [],
    ebooks,
    simulados,
    resultados,
    resultadoSelecionado,
    notifications,
    unreadNotificationCount = 0,
    certificates,
    theme = "light"
  } = data;
  const pageTitles = {
    home: "Home",
    biblioteca: "E-books",
    simulados: "Simulados",
    desempenho: "Resultados",
    certificados: "Certificados",
    documentos: "Documentos",
    notificacoes: "Notificacoes",
    conta: "Conta",
    contato: "Contato"
  };

  const pageDescriptions = {
    home: "Resumo rapido da sua jornada, progresso e proximas acoes.",
    biblioteca: "Materiais organizados em PDF para estudo e revisao.",
    simulados: "Provas disponiveis com status, filtros e acesso imediato.",
    desempenho: "Historico de simulados concluidos e analise detalhada das questoes.",
    certificados: "Certificado oficial de participacao pronto para visualizacao e impressao.",
    documentos: "Acompanhe aprovacoes, recusas e reenvio dos PDFs da sua matricula.",
    notificacoes: "Feed de avisos e comunicacoes da plataforma.",
    conta: "Dados principais de acesso e configuracoes da conta.",
    contato: "Canal direto com a equipe de suporte."
  };

  const sectionContent = {
    home: renderHome({ user, simulados, resultados, notifications }),
    biblioteca: renderBiblioteca(ebooks),
    simulados: renderSimulados(simulados, resultados, user),
    desempenho: renderResultados(resultados, resultadoSelecionado),
    certificados: renderCertificates(certificates),
    documentos: renderStudentDocuments(documents),
    notificacoes: renderNotifications(notifications),
    conta: renderConta(user),
    contato: renderContato(user)
  };

  const navItems = [
    { key: "home", label: "Home", icon: "home" },
    { key: "biblioteca", label: "E-books", icon: "books" },
    { key: "simulados", label: "Simulados", icon: "simulados", badge: simulados.length },
    { key: "desempenho", label: "Resultados", icon: "resultados" },
    { key: "certificados", label: "Certificados", icon: "certificados" },
    { key: "documentos", label: "Documentos", icon: "certificados", badge: documents.filter((item) => item.status === "reprovado").length || null },
    { key: "notificacoes", label: "Notificacoes", icon: "notifications", badge: unreadNotificationCount || null },
    { key: "conta", label: "Conta", icon: "conta" },
    { key: "contato", label: "Contato", icon: "contato" }
  ];

  root.innerHTML = `
    <div class="sidebar-overlay"></div>
    <div class="app-shell app-shell-modern student-shell ${theme === "dark" ? "student-theme-dark" : ""}">
      <aside class="sidebar student-sidebar">
        <div class="sidebar-logo student-sidebar-logo">
          <div class="sidebar-logo-icon">OB</div>
          <div class="sidebar-logo-text">OBDIP <span>Aluno</span></div>
        </div>

        <nav class="sidebar-nav student-sidebar-nav">
          <div class="sidebar-section-title">Area do aluno</div>
          ${navItems
            .map(
              (item) => `
                <button class="nav-item student-nav-item ${section === item.key ? "active" : ""}" type="button" data-nav="${item.key}">
                  <span class="nav-item-icon nav-item-icon-svg">${renderIcon(item.icon)}</span>
                  <span>${item.label}</span>
                  ${item.badge ? `<span class="nav-item-badge">${item.badge}</span>` : ""}
                </button>
              `
            )
            .join("")}
        </nav>

        <div class="sidebar-footer student-sidebar-footer">
          <div class="sidebar-user student-sidebar-user" data-open-profile>
            <div class="avatar">${getInitials(user.nome)}</div>
            <div class="sidebar-user-info">
              <strong>${user.nome}</strong>
              <span>${formatSerieLabel(user.serie)}</span>
            </div>
          </div>
          <button class="nav-item student-nav-item student-logout-item" type="button" data-logout>
            <span class="nav-item-icon nav-item-icon-svg">${renderIcon("logout")}</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <div class="main-content student-main">
        <header class="top-header top-header-modern student-topbar">
          <div class="student-topbar-left">
            <button class="header-icon-btn mobile-menu-btn student-mobile-menu" type="button" data-mobile-sidebar aria-label="Abrir menu">
              <span class="nav-item-icon nav-item-icon-svg">${renderIcon("menu")}</span>
            </button>
            <div class="student-search">
              <span class="student-search-icon nav-item-icon-svg">${renderIcon("search")}</span>
              <input type="search" placeholder="Buscar materiais, simulados, resultados..." data-student-search>
            </div>
          </div>

          <div class="header-actions student-topbar-right">
            <button class="header-icon-btn student-theme-btn" type="button" data-student-theme-toggle aria-label="Alternar tema">
              <span class="nav-item-icon nav-item-icon-svg">${renderIcon(theme === "dark" ? "sun" : "moon")}</span>
            </button>
            <button class="header-icon-btn student-bell-btn" type="button" data-nav="notificacoes" aria-label="Abrir notificacoes">
              <span class="nav-item-icon nav-item-icon-svg">${renderIcon("notifications")}</span>
              ${unreadNotificationCount ? '<span class="dot"></span>' : ""}
              ${unreadNotificationCount ? `<span class="student-bell-badge">${unreadNotificationCount}</span>` : ""}
            </button>
            <button class="student-topbar-user" type="button" data-open-profile>
              <div class="student-topbar-user-meta">
                <strong>${user.nome}</strong>
                <span>${user.email}</span>
              </div>
              <div class="avatar">${getInitials(user.nome)}</div>
            </button>
          </div>
        </header>

        <main class="page-content page-content-modern student-page-content">
          <div class="page-header page-header-modern student-page-header">
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

  const sidebar = root.querySelector(".student-sidebar");
  const overlay = root.querySelector(".sidebar-overlay");
  const searchInput = root.querySelector("[data-student-search]");
  let currentSearch = "";
  let currentFilter = "Todos";

  const applySectionFilters = () => {
    root.querySelectorAll("[data-searchable]").forEach((item) => {
      const text = (item.dataset.search || "").toLowerCase();
      const levels = (item.dataset.levels || "").split(",").filter(Boolean);
      const matchesSearch = !currentSearch || text.includes(currentSearch);
      const matchesFilter = currentFilter === "Todos" || !levels.length || levels.includes(currentFilter);
      item.classList.toggle("is-hidden-by-search", !(matchesSearch && matchesFilter));
    });
  };

  const closeMobileSidebar = () => {
    sidebar?.classList.remove("mobile-open");
    overlay?.classList.remove("visible");
  };

  root.querySelector("[data-mobile-sidebar]")?.addEventListener("click", () => {
    sidebar?.classList.toggle("mobile-open");
    overlay?.classList.toggle("visible");
  });

  root.querySelector("[data-student-theme-toggle]")?.addEventListener("click", handlers.onToggleTheme);

  overlay?.addEventListener("click", closeMobileSidebar);

  root.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      closeMobileSidebar();
      handlers.onNavigate(button.dataset.nav);
    });
  });

  root.querySelectorAll("[data-nav-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      closeMobileSidebar();
      handlers.onNavigate(button.dataset.navJump);
    });
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

  root.querySelectorAll("[data-simulado-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.simuladoFilter;
      root.querySelectorAll("[data-simulado-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      applySectionFilters();
    });
  });

  searchInput?.addEventListener("input", (event) => {
    currentSearch = event.target.value.toLowerCase().trim();
    applySectionFilters();
  });

  applySectionFilters();

  root.querySelector("#account-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onSaveAccount(new FormData(event.currentTarget));
  });

  root.querySelector("#contact-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    handlers.onSendContact(new FormData(event.currentTarget));
  });

  root.querySelectorAll("[data-document-reupload-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handlers.onReuploadDocument(form.dataset.documentReuploadForm, new FormData(event.currentTarget));
    });
  });

  root.querySelector("[data-logout]")?.addEventListener("click", handlers.onLogout);
}
