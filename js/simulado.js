import { calcularResultado, Storage } from "./data.js";
import { closeModal, openModal } from "./ui.js";

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(safeSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function buildQuestaoCard(questao, respostaAtual, marcada, reviewMode = false) {
  return `
    <article class="questao-card" id="questao-${questao.id}" data-questao-card="${questao.numero}">
      <header class="questao-header">
        <div class="questao-num">
          <div class="questao-num-badge">${questao.numero}</div>
          <div>
            <div class="font-semibold">${questao.disciplina}</div>
            <div class="questao-meta">Questao dinamica renderizada via JavaScript</div>
          </div>
        </div>

        <div class="questao-actions">
          <button class="btn-marcar ${marcada ? "active" : ""}" type="button" data-marcar="${questao.id}">
            ${marcada ? "Marcada para revisar" : "Revisar depois"}
          </button>
        </div>
      </header>

      <div class="questao-body">
        <div class="questao-enunciado">${questao.enunciado}</div>
        <div class="questao-comando">${questao.comando}</div>

        ${
          questao.imagem
            ? `
              <figure class="questao-imagem">
                <img src="${questao.imagem.src}" alt="${questao.imagem.alt || "Imagem da questao"}">
                ${questao.imagem.legenda ? `<figcaption>${questao.imagem.legenda}</figcaption>` : ""}
              </figure>
            `
            : ""
        }

        <div class="opcoes-lista">
          ${questao.opcoes
            .map((opcao) => {
              const checked = respostaAtual === opcao.letra ? "checked" : "";
              const reviewClass = reviewMode
                ? opcao.letra === questao.gabarito
                  ? "gabarito-correct"
                  : respostaAtual === opcao.letra
                    ? "gabarito-wrong"
                    : ""
                : "";

              return `
                <div class="opcao-item ${reviewClass}">
                  <input
                    class="opcao-radio"
                    type="radio"
                    id="${questao.id}-${opcao.letra}"
                    name="questao-${questao.id}"
                    value="${opcao.letra}"
                    data-answer-question="${questao.id}"
                    ${checked}
                    ${reviewMode ? "disabled" : ""}
                  >
                  <label class="opcao-label" for="${questao.id}-${opcao.letra}">
                    <span class="opcao-letra">${opcao.letra}</span>
                    <span class="opcao-texto">${opcao.texto}</span>
                  </label>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </article>
  `;
}

function buildEscadinha(simulado, respostas, marcadas, currentIndex) {
  return simulado.questoes
    .map((questao, index) => {
      const classes = ["q-btn"];
      if (respostas[questao.id]) classes.push("answered");
      if (marcadas.includes(questao.id)) classes.push("marked");
      if (index === currentIndex) classes.push("current");

      return `
        <button class="${classes.join(" ")}" type="button" data-jump-question="${index}">
          ${questao.numero}
        </button>
      `;
    })
    .join("");
}

export function mountSimulado(root, { simulado, user, onBack, onFinish }) {
  const state = {
    viewMode: "unico",
    currentIndex: 0,
    respostas: Storage.getRespostas(simulado.id, user.id),
    marcadas: Storage.getMarcadas(simulado.id, user.id),
    remainingSeconds: simulado.tempo * 60
  };

  let timerId = null;

  const getAnsweredCount = () =>
    simulado.questoes.filter((questao) => Boolean(state.respostas[questao.id])).length;

  const getCurrentQuestion = () => simulado.questoes[state.currentIndex];

  const syncTimerAppearance = () => {
    const timer = root.querySelector(".simulado-timer");
    const label = root.querySelector("[data-timer-label]");
    if (!timer || !label) return;

    label.textContent = formatTime(state.remainingSeconds);
    timer.classList.toggle("warning", state.remainingSeconds <= 900 && state.remainingSeconds > 300);
    timer.classList.toggle("danger", state.remainingSeconds <= 300);
  };

  const goToQuestion = (index) => {
    state.currentIndex = Math.max(0, Math.min(simulado.questoes.length - 1, index));
    render();
  };

  const finishSimulado = () => {
    const resultado = calcularResultado(simulado, state.respostas);
    resultado.userId = user.id;
    resultado.userNome = user.nome;
    Storage.saveResultado(resultado);
    Storage.clearRespostas(simulado.id, user.id);
    Storage.clearMarcadas(simulado.id, user.id);
    closeModal();
    cleanup();
    onFinish(resultado);
  };

  const openFinishModal = () => {
    const answered = getAnsweredCount();
    const unanswered = simulado.questoes.length - answered;

    openModal({
      title: "Finalizar simulado",
      body: `
        <p>Confirme para encerrar a prova e calcular o desempenho imediatamente.</p>
        <div class="modal-terminar-stats">
          <article class="modal-stat answered">
            <div class="num">${answered}</div>
            <div class="lbl">Respondidas</div>
          </article>
          <article class="modal-stat unanswered">
            <div class="num">${unanswered}</div>
            <div class="lbl">Em branco</div>
          </article>
          <article class="modal-stat marked">
            <div class="num">${state.marcadas.length}</div>
            <div class="lbl">Marcadas</div>
          </article>
        </div>
      `,
      actions: [
        { label: "Continuar prova", className: "btn-secondary" },
        { label: "Terminar agora", className: "btn-error", onClick: finishSimulado }
      ]
    });
  };

  const bindEvents = () => {
    root.querySelector("[data-back-dashboard]")?.addEventListener("click", () => {
      cleanup();
      onBack();
    });

    root.querySelector("[data-toggle-sidebar]")?.addEventListener("click", () => {
      root.querySelector(".simulado-sidebar")?.classList.toggle("open");
    });

    root.querySelectorAll("[data-view-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        state.viewMode = button.dataset.viewMode;
        render();
      });
    });

    root.querySelectorAll("[data-jump-question]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextIndex = Number(button.dataset.jumpQuestion);
        state.currentIndex = nextIndex;

        if (state.viewMode === "unico") {
          render();
          return;
        }

        render();
        requestAnimationFrame(() => {
          root.querySelector(`#questao-${simulado.questoes[nextIndex].id}`)?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        });
      });
    });

    root.querySelectorAll("[data-answer-question]").forEach((input) => {
      input.addEventListener("change", () => {
        const { answerQuestion } = input.dataset;
        state.respostas[answerQuestion] = input.value;
        Storage.saveResposta(simulado.id, user.id, answerQuestion, input.value);
        state.currentIndex = simulado.questoes.findIndex((questao) => questao.id === answerQuestion);

        if (state.viewMode === "rolagem") {
          const body = root.querySelector(".simulado-body");
          const scrollTop = body ? body.scrollTop : 0;
          render();
          const newBody = root.querySelector(".simulado-body");
          if (newBody) newBody.scrollTop = scrollTop;
        } else {
          render();
        }
      });
    });

    root.querySelectorAll("[data-marcar]").forEach((button) => {
      button.addEventListener("click", () => {
        Storage.toggleMarcada(simulado.id, user.id, button.dataset.marcar);
        state.marcadas = Storage.getMarcadas(simulado.id, user.id);

        if (state.viewMode === "rolagem") {
          const body = root.querySelector(".simulado-body");
          const scrollTop = body ? body.scrollTop : 0;
          render();
          const newBody = root.querySelector(".simulado-body");
          if (newBody) newBody.scrollTop = scrollTop;
        } else {
          render();
        }
      });
    });

    root.querySelector("[data-prev-question]")?.addEventListener("click", () => {
      goToQuestion(state.currentIndex - 1);
    });

    root.querySelector("[data-next-question]")?.addEventListener("click", () => {
      goToQuestion(state.currentIndex + 1);
    });

    root.querySelector("[data-finish-simulado]")?.addEventListener("click", openFinishModal);
  };

  const render = () => {
    const answered = getAnsweredCount();
    const currentQuestion = getCurrentQuestion();
    const questoesHtml =
      state.viewMode === "unico"
        ? buildQuestaoCard(
            currentQuestion,
            state.respostas[currentQuestion.id],
            state.marcadas.includes(currentQuestion.id)
          )
        : simulado.questoes
            .map((questao) =>
              buildQuestaoCard(
                questao,
                state.respostas[questao.id],
                state.marcadas.includes(questao.id)
              )
            )
            .join("");

    root.innerHTML = `
      <div class="simulado-shell ${state.viewMode === "unico" ? "modo-unico" : "modo-rolagem"}">
        <aside class="simulado-sidebar">
          <div class="simulado-sidebar-header">
            <h4>${simulado.nome}</h4>
            <small>${simulado.questoes.length} questoes | turma ${simulado.turmas.join(", ")}</small>
          </div>

          <div class="q-legend">
            <div class="q-legend-item"><span class="q-legend-dot unanswered"></span>Em branco</div>
            <div class="q-legend-item"><span class="q-legend-dot answered"></span>Respondida</div>
            <div class="q-legend-item"><span class="q-legend-dot marked"></span>Revisao</div>
            <div class="q-legend-item"><span class="q-legend-dot current"></span>Atual</div>
          </div>

          <div class="escadinha">
            <div class="escadinha-grid">
              ${buildEscadinha(simulado, state.respostas, state.marcadas, state.currentIndex)}
            </div>
          </div>

          <div class="simulado-sidebar-footer">
            <div class="progress-label">
              <strong>Progresso</strong>
              <span>${answered}/${simulado.questoes.length}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${(answered / simulado.questoes.length) * 100}%"></div>
            </div>
          </div>
        </aside>

        <section class="simulado-main">
          <header class="simulado-header">
            <div class="simulado-header-left">
              <button class="btn-toggle-sidebar-simulado" type="button" data-toggle-sidebar aria-label="Abrir escadinha">
                Menu
              </button>
              <button class="btn btn-secondary btn-sm" type="button" data-back-dashboard>
                Voltar
              </button>
              <div>
                <div class="simulado-title">${simulado.nome}</div>
                <small class="text-muted">
                  ${state.viewMode === "rolagem" ? "Rolagem continua com todas as questoes na mesma tela." : "Questao unica com navegacao lateral e salvamento automatico."}
                </small>
              </div>
            </div>

            <div class="header-actions">
              <div class="view-toggle">
                <button class="view-btn ${state.viewMode === "rolagem" ? "active" : ""}" type="button" data-view-mode="rolagem">
                  Rolagem
                </button>
                <button class="view-btn ${state.viewMode === "unico" ? "active" : ""}" type="button" data-view-mode="unico">
                  Questao unica
                </button>
              </div>
              <div class="simulado-timer">
                <span class="timer-icon">Tempo</span>
                <strong data-timer-label>${formatTime(state.remainingSeconds)}</strong>
              </div>
              <button class="btn btn-terminar" type="button" data-finish-simulado>
                Terminar
              </button>
            </div>
          </header>

          <div class="simulado-body">
            ${questoesHtml}
          </div>

          <footer class="simulado-footer">
            <div class="simulado-nav-info">
              <strong>${state.viewMode === "rolagem" ? "Rolagem continua" : `Questao ${state.currentIndex + 1}`}</strong>
              ${state.viewMode === "rolagem" ? `| ${simulado.questoes.length} questoes exibidas em sequencia` : `de ${simulado.questoes.length}`}
            </div>
            <div class="simulado-nav-btns">
              <button class="btn btn-secondary" type="button" data-prev-question ${state.currentIndex === 0 ? "disabled" : ""}>
                Anterior
              </button>
              <button class="btn btn-primary" type="button" data-next-question ${state.currentIndex === simulado.questoes.length - 1 ? "disabled" : ""}>
                Proxima
              </button>
            </div>
          </footer>
        </section>
      </div>
    `;

    bindEvents();
    syncTimerAppearance();
  };

  const cleanup = () => {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  };

  timerId = window.setInterval(() => {
    state.remainingSeconds -= 1;
    syncTimerAppearance();

    if (state.remainingSeconds <= 0) {
      finishSimulado();
    }
  }, 1000);

  render();
  return cleanup;
}
