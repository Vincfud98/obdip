import {
  ADMIN_USER,
  EBOOKS_DATA,
  SIMULADOS_DATA,
  Storage,
  getEbooksByTurma,
  getSimuladoById,
  getSimuladosByTurma
} from "./data.js";
import { renderLanding } from "./auth.js";
import { renderStudentDashboard } from "./dashboard.js";
import { renderAdminDashboard } from "./admin.js";
import { mountSimulado } from "./simulado.js";
import { formatDateTime, formatSerieLabel, openModal, showToast } from "./ui.js";

const roots = {
  landing: document.querySelector("#landing-view"),
  student: document.querySelector("#student-view"),
  admin: document.querySelector("#admin-view"),
  simulado: document.querySelector("#simulado-view")
};

const state = {
  currentUser: Storage.getCurrentUser(),
  authMode: "login",
  paymentConfirmed: false,
  studentSection: "home",
  selectedResultadoId: null,
  adminRankingSimuladoId: SIMULADOS_DATA[0]?.id || null
};

let simuladoCleanup = null;

function showView(name) {
  Object.entries(roots).forEach(([key, root]) => {
    root.classList.toggle("hidden", key !== name);
  });
}

function getCertificates(user, resultados) {
  return [
    {
      id: "cert-matricula",
      titulo: "Comprovante de matricula",
      descricao: `Documento vinculado ao cadastro de ${user.nome}.`,
      status: "Validado",
      tipo: "Matricula",
      data: formatDateTime(user.criadoEm || new Date().toISOString()),
      acao: "Visualizar comprovante"
    },
    {
      id: "cert-participacao",
      titulo: "Certificado de participacao",
      descricao: resultados.filter(Boolean).length
        ? "Liberado para alunos com provas concluidas."
        : "Sera liberado depois da primeira prova finalizada.",
      status: resultados.filter(Boolean).length ? "Validado" : "Pendente",
      tipo: "Participacao",
      data: resultados.filter(Boolean).length
        ? formatDateTime(getLatestHistorico(user.id)?.dataHora || new Date().toISOString())
        : "Aguardando conclusao",
      acao: resultados.filter(Boolean).length ? "Baixar certificado" : "Aguardando"
    }
  ];
}

function getLatestHistorico(userId) {
  return Storage.getHistorico(userId).sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0] || null;
}

function getNotifications(user, simulados, resultados) {
  const latest = getLatestHistorico(user.id);
  const items = [
    {
      id: "notif-1",
      tipo: "primary",
      titulo: "Biblioteca atualizada",
      texto: `Novos materiais para ${formatSerieLabel(user.serie)} ja podem ser baixados na biblioteca.`,
      tempo: "Agora"
    },
    {
      id: "notif-2",
      tipo: "warning",
      titulo: "Simulado disponivel",
      texto: simulados[0]
        ? `${simulados[0].nome} esta liberado com visualizacao unica e por rolagem.`
        : "Nenhum simulado novo foi publicado ainda.",
      tempo: "Hoje"
    }
  ];

  if (latest) {
    items.unshift({
      id: "notif-3",
      tipo: "success",
      titulo: "Resultado corrigido",
      texto: `Sua ultima tentativa registrou ${latest.percentual}% de acerto.`,
      tempo: formatDateTime(latest.dataHora)
    });
  }

  if (!resultados.filter(Boolean).length) {
    items.push({
      id: "notif-4",
      tipo: "muted",
      titulo: "Primeira prova",
      texto: "Finalize seu primeiro simulado para liberar a pagina de desempenho e certificados.",
      tempo: "Lembrete"
    });
  }

  return items;
}

function getStudentData(user) {
  const simulados = getSimuladosByTurma(user.serie);
  const ebooks = getEbooksByTurma(user.serie);
  const resultados = simulados.map((simulado) => Storage.getResultado(simulado.id, user.id));
  const selectedResultadoId =
    state.selectedResultadoId ||
    resultados.find(Boolean)?.simuladoId ||
    simulados[0]?.id ||
    null;
  const notifications = getNotifications(user, simulados, resultados);
  const certificates = getCertificates(user, resultados);

  return {
    ebooks,
    simulados,
    resultados,
    notifications,
    certificates,
    ranking: selectedResultadoId ? Storage.getRanking(selectedResultadoId) : [],
    resultadoSelecionado: selectedResultadoId
      ? Storage.getResultado(selectedResultadoId, user.id)
      : null
  };
}

function openStudentProfile(user) {
  openModal({
    title: "Perfil do aluno",
    body: `
      <div class="admin-stack">
        <div class="tag-row">
          <span class="badge badge-primary">${formatSerieLabel(user.serie)}</span>
          <span class="badge ${user.menor ? "badge-warning" : "badge-success"}">
            ${user.menor ? "Menor autorizado" : "Maior de idade"}
          </span>
        </div>
        <div class="info-callout">
          <strong>Dados do formulario</strong>
          <p class="muted-copy"><strong>Nome:</strong> ${user.nome}</p>
          <p class="muted-copy"><strong>Email:</strong> ${user.email}</p>
          <p class="muted-copy"><strong>Escola:</strong> ${user.escola}</p>
          <p class="muted-copy"><strong>Serie:</strong> ${user.serie}</p>
        </div>
        <div class="info-callout">
          <strong>Certificados</strong>
          <p class="muted-copy">Area pronta para exibir matricula, participacao e comprovantes enviados.</p>
        </div>
      </div>
    `,
    actions: [{ label: "Fechar", className: "btn-secondary" }]
  });
}

function renderLandingView() {
  showView("landing");
  renderLanding(
    roots.landing,
    {
      mode: state.authMode,
      paymentConfirmed: state.paymentConfirmed
    },
    {
      onSwitchMode: (mode) => {
        state.authMode = mode;
        renderLandingView();
      },
      onConfirmPayment: () => {
        state.authMode = "register";
        state.paymentConfirmed = true;
        showToast("Pagamento simulado liberado. O formulario de cadastro foi habilitado.");
        renderLandingView();
      },
      onLogin: (email) => {
        const normalizedEmail = email?.toString().trim().toLowerCase();

        if (!normalizedEmail) {
          showToast("Informe um email valido para entrar.", "error");
          return;
        }

        if (normalizedEmail === ADMIN_USER.email) {
          state.currentUser = ADMIN_USER;
          state.studentSection = "home";
          state.selectedResultadoId = null;
          Storage.setCurrentUser(ADMIN_USER);
          renderCurrentSession();
          return;
        }

        const user = Storage.getUsers().find((item) => item.email.toLowerCase() === normalizedEmail);
        if (!user) {
          showToast("Nao encontramos esse email. Use o cadastro ou um demo disponivel.", "error");
          return;
        }

        if (user.status && user.status !== "ativo") {
          showToast("Este usuario nao esta com acesso ativo.", "error");
          return;
        }

        state.currentUser = user;
        state.studentSection = "home";
        state.selectedResultadoId = null;
        Storage.setCurrentUser(user);
        renderCurrentSession();
      },
      onRegister: (payload) => {
        if (!payload.nome || !payload.email || !payload.escola || !payload.serie) {
          showToast("Preencha todos os campos obrigatorios.", "error");
          return;
        }

        const users = Storage.getUsers();
        const alreadyExists = users.some((item) => item.email.toLowerCase() === payload.email);
        if (alreadyExists) {
          showToast("Este email ja esta cadastrado. Use o login direto.", "error");
          return;
        }

        const newUser = {
          id: `user-${Date.now()}`,
          nome: payload.nome,
          email: payload.email,
          escola: payload.escola,
          serie: payload.serie,
          menor: payload.menor,
          role: "aluno",
          status: "ativo",
          criadoEm: new Date().toISOString()
        };

        users.push(newUser);
        Storage.saveUsers(users);
        Storage.setCurrentUser(newUser);
        state.currentUser = newUser;
        state.paymentConfirmed = false;
        state.authMode = "login";
        state.studentSection = "home";
        state.selectedResultadoId = null;
        showToast("Cadastro concluido com sucesso.");
        renderCurrentSession();
      },
      onDemoStudent: () => {
        const user = Storage.getUsers()[0];
        Storage.setCurrentUser(user);
        state.currentUser = user;
        state.studentSection = "home";
        state.selectedResultadoId = null;
        renderCurrentSession();
      },
      onDemoAdmin: () => {
        Storage.setCurrentUser(ADMIN_USER);
        state.currentUser = ADMIN_USER;
        state.studentSection = "home";
        state.selectedResultadoId = null;
        renderCurrentSession();
      }
    }
  );
}

function persistCurrentUser(updates) {
  const users = Storage.getUsers();
  const index = users.findIndex((item) => item.id === state.currentUser.id);
  if (index === -1) return;

  users[index] = { ...users[index], ...updates };
  Storage.saveUsers(users);
  state.currentUser = users[index];
  Storage.setCurrentUser(users[index]);
}

function renderStudentView() {
  showView("student");
  const user = state.currentUser;
  const data = getStudentData(user);

  renderStudentDashboard(
    roots.student,
    {
      user,
      section: state.studentSection,
      ...data
    },
    {
      onNavigate: (section) => {
        state.studentSection = section;
        renderStudentView();
      },
      onStartSimulado: (simuladoId) => {
        const simulado = getSimuladoById(simuladoId);
        if (!simulado) {
          showToast("Nao foi possivel abrir esse simulado.", "error");
          return;
        }

        if (simuladoCleanup) {
          simuladoCleanup();
        }

        showView("simulado");
        simuladoCleanup = mountSimulado(roots.simulado, {
          simulado,
          user,
          onBack: () => {
            simuladoCleanup = null;
            showView("student");
            renderStudentView();
          },
          onFinish: (resultado) => {
            simuladoCleanup = null;
            state.selectedResultadoId = resultado.simuladoId;
            state.studentSection = "desempenho";
            showToast("Simulado finalizado. A pagina de desempenho ja esta disponivel.");
            showView("student");
            renderStudentView();
          }
        });
      },
      onViewResult: (simuladoId) => {
        state.selectedResultadoId = simuladoId;
        state.studentSection = "desempenho";
        renderStudentView();
      },
      onDownloadEbook: (ebookId) => {
        const ebook = EBOOKS_DATA.find((item) => item.id === ebookId);
        showToast(`Download simulado de "${ebook?.titulo || "e-book"}".`);
      },
      onOpenCertificate: (certificateId) => {
        showToast(`Acao simulada para o certificado ${certificateId}.`);
      },
      onSaveAccount: (formData) => {
        persistCurrentUser({
          nome: formData.get("nome")?.toString().trim(),
          escola: formData.get("escola")?.toString().trim(),
          serie: formData.get("serie")?.toString(),
          menor: formData.get("menor") === "on"
        });
        showToast("Conta atualizada com sucesso.");
        renderStudentView();
      },
      onSendContact: (formData) => {
        const mensagem = formData.get("mensagem")?.toString().trim();
        if (!mensagem) {
          showToast("Escreva uma mensagem antes de enviar.", "error");
          return;
        }
        showToast("Mensagem enviada para a equipe.");
        state.studentSection = "home";
        renderStudentView();
      },
      onOpenProfile: () => openStudentProfile(user),
      onLogout: () => {
        if (simuladoCleanup) {
          simuladoCleanup();
          simuladoCleanup = null;
        }

        Storage.logout();
        state.currentUser = null;
        state.studentSection = "home";
        state.selectedResultadoId = null;
        renderLandingView();
      }
    }
  );
}

function openAdminUserModal(user) {
  openModal({
    title: `Perfil de ${user.nome}`,
    body: `
      <div class="admin-stack">
        <div class="info-callout">
          <strong>Dados do formulario</strong>
          <p class="muted-copy"><strong>Email:</strong> ${user.email}</p>
          <p class="muted-copy"><strong>Escola:</strong> ${user.escola || "Nao informada"}</p>
          <p class="muted-copy"><strong>Serie:</strong> ${user.serie || "Nao informada"}</p>
          <p class="muted-copy"><strong>Status:</strong> ${user.status || "ativo"}</p>
        </div>
        <div class="info-callout">
          <strong>Certificados enviados</strong>
          <p class="muted-copy">Espaco pronto para matricula, comprovante e certificados de participacao.</p>
        </div>
      </div>
    `,
    actions: [{ label: "Fechar", className: "btn-secondary" }]
  });
}

function openStudentResultModal(simuladoId, userId) {
  const user = Storage.getUsers().find((item) => item.id === userId);
  const resultado = Storage.getResultado(simuladoId, userId);

  if (!user || !resultado) {
    showToast("Nao foi possivel abrir o desempenho desse aluno.", "error");
    return;
  }

  openModal({
    title: `Desempenho de ${user.nome}`,
    size: "modal-lg",
    body: `
      <div class="admin-stack">
        <div class="info-callout">
          <strong>Resumo</strong>
          <p class="muted-copy"><strong>Simulado:</strong> ${resultado.simuladoNome}</p>
          <p class="muted-copy"><strong>Percentual:</strong> ${resultado.percentual}%</p>
          <p class="muted-copy"><strong>Acertos:</strong> ${resultado.acertos}</p>
          <p class="muted-copy"><strong>Enviado em:</strong> ${formatDateTime(resultado.dataHora)}</p>
        </div>
        <div class="review-list">
          ${resultado.detalhes
            .slice(0, 4)
            .map(
              (questao) => `
                <article class="review-item">
                  <header>
                    <div>
                      <span class="badge ${questao.acertou ? "badge-success" : "badge-error"}">Questao ${questao.numero}</span>
                    </div>
                    <div class="tag-row">
                      <span class="option-badge">Aluno: ${questao.escolha || "Em branco"}</span>
                      <span class="option-badge correct">Gabarito: ${questao.gabarito}</span>
                    </div>
                  </header>
                  <div class="review-item-body">
                    <div class="questao-comentario">
                      <h6>Comentario</h6>
                      <p>${questao.comentario}</p>
                    </div>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    `,
    actions: [{ label: "Fechar", className: "btn-secondary" }]
  });
}

function mutateUserStatus(userId, status) {
  const users = Storage.getUsers();
  const index = users.findIndex((item) => item.id === userId);
  if (index === -1) return null;
  users[index] = { ...users[index], status };
  Storage.saveUsers(users);
  return users[index];
}

function createSimuladoFromForm(formData) {
  const nome = formData.get("nome")?.toString().trim();
  const turma = formData.get("turma")?.toString();
  const tempo = Number(formData.get("tempo") || 90);
  const enunciado = formData.get("enunciado")?.toString().trim();
  const comando = formData.get("comando")?.toString().trim() || "Assinale a alternativa correta:";
  const imagem = formData.get("imagem")?.toString().trim();
  const tipo = formData.get("tipo")?.toString() || "A-E";
  const discursiva = formData.get("discursiva")?.toString().trim();
  const agendamento = formData.get("agendamento")?.toString() || null;
  const rawOpcoes = formData.get("opcoes")?.toString().trim() || "";

  if (!nome || !turma) {
    throw new Error("Dados principais obrigatorios");
  }

  const opcoes = rawOpcoes
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [letra, ...rest] = line.split("|");
      return {
        letra: (letra || "").trim().toUpperCase(),
        texto: rest.join("|").trim()
      };
    })
    .filter((item) => item.letra && item.texto);

  const questoes = [];

  if (enunciado) {
    questoes.push({
      id: `q-${Date.now()}`,
      numero: 1,
      disciplina: "Questao objetiva",
      enunciado: `<p>${enunciado}</p>`,
      comando,
      imagem: imagem
        ? {
            src: imagem,
            alt: "Imagem da questao",
            legenda: "Imagem vinculada pelo admin"
          }
        : null,
      opcoes: opcoes.length
        ? opcoes
        : [
            { letra: "A", texto: "Opcao A" },
            { letra: "B", texto: "Opcao B" },
            { letra: "C", texto: "Opcao C" },
            { letra: tipo === "C-E" ? "E" : "D", texto: tipo === "C-E" ? "Opcao E" : "Opcao D" }
          ],
      gabarito: opcoes[0]?.letra || "A",
      comentario: "Comentario pedagogico inicial para esta questao criada no painel admin."
    });
  }

  if (discursiva) {
    questoes.push({
      id: `q-${Date.now()}-disc`,
      numero: questoes.length + 1,
      disciplina: "Questao discursiva",
      enunciado: `<p>${discursiva}</p>`,
      comando: "Resposta discursiva",
      imagem: null,
      opcoes: [
        { letra: "A", texto: "Campo reservado para avaliacao manual." }
      ],
      gabarito: "A",
      comentario: "Esta questao discursiva esta representada em formato simplificado nesta demo."
    });
  }

  return {
    id: `sim-${Date.now()}`,
    nome,
    turmas: [turma],
    tempo,
    status: agendamento ? "agendado" : "rascunho",
    agendamento,
    criadoEm: new Date().toISOString(),
    questoes
  };
}

function renderAdminView() {
  showView("admin");
  const users = Storage.getUsers();
  const historico = users.flatMap((user) => Storage.getHistorico(user.id));
  const ultimoResultado = historico.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];
  const rankingId = state.adminRankingSimuladoId || SIMULADOS_DATA[0]?.id || null;

  renderAdminDashboard(
    roots.admin,
    {
      users,
      simulados: SIMULADOS_DATA,
      rankingSimuladoId: rankingId,
      ranking: rankingId ? Storage.getRanking(rankingId) : [],
      stats: {
        alunos: users.length,
        realizados: historico.length,
        ultimoResultado: ultimoResultado ? `${ultimoResultado.percentual}%` : null
      }
    },
    {
      onLogout: () => {
        Storage.logout();
        state.currentUser = null;
        state.studentSection = "home";
        state.selectedResultadoId = null;
        renderLandingView();
      },
      onCreateSimulado: (formData) => {
        try {
          const simulado = createSimuladoFromForm(formData);
          SIMULADOS_DATA.unshift(simulado);
          state.adminRankingSimuladoId = simulado.id;
          showToast(`Simulado "${simulado.nome}" criado com sucesso.`);
          renderAdminView();
        } catch (error) {
          showToast("Revise os dados obrigatorios do simulado.", "error");
        }
      },
      onImportJson: (formData) => {
        const payload = formData.get("payload")?.toString().trim();
        if (!payload) {
          showToast("Cole um JSON antes de validar.", "error");
          return;
        }

        try {
          const parsed = JSON.parse(payload);
          if (!Array.isArray(parsed)) {
            throw new Error("Formato invalido");
          }
          showToast(`${parsed.length} questoes validadas para importacao.`);
        } catch (error) {
          showToast("JSON invalido. Revise a estrutura e tente novamente.", "error");
        }
      },
      onChangeRanking: (simuladoId) => {
        state.adminRankingSimuladoId = simuladoId;
        renderAdminView();
      },
      onSimuladoAction: (action, simuladoId) => {
        const simulado = SIMULADOS_DATA.find((item) => item.id === simuladoId);
        if (!simulado) {
          showToast("Simulado nao encontrado.", "error");
          return;
        }

        if (action === "publicar") simulado.status = "publicado";
        if (action === "despublicar") simulado.status = "rascunho";
        if (action === "agendar") {
          simulado.status = "agendado";
          simulado.agendamento = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
        }

        showToast(`Status do simulado "${simulado.nome}" atualizado para ${simulado.status}.`);
        renderAdminView();
      },
      onOpenStudentResult: (simuladoId, userId) => {
        openStudentResultModal(simuladoId, userId);
      },
      onUserAction: (action, userId) => {
        const user = Storage.getUsers().find((item) => item.id === userId);
        if (!user) {
          showToast("Usuario nao encontrado.", "error");
          return;
        }

        if (action === "perfil") {
          openAdminUserModal(user);
          return;
        }

        if (action === "suspender") {
          mutateUserStatus(userId, "suspenso");
          showToast(`${user.nome} foi suspenso.`);
          renderAdminView();
          return;
        }

        if (action === "banir") {
          mutateUserStatus(userId, "banido");
          showToast(`${user.nome} foi banido.`);
          renderAdminView();
          return;
        }

        if (action === "email") {
          showToast(`Permissao de email revisada para ${user.nome}.`);
          return;
        }

        if (action === "senha") {
          showToast(`Fluxo de troca de senha preparado para ${user.nome}.`);
        }
      }
    }
  );
}

function renderCurrentSession() {
  if (!state.currentUser) {
    renderLandingView();
    return;
  }

  if (state.currentUser.role === "admin") {
    renderAdminView();
    return;
  }

  renderStudentView();
}

SIMULADOS_DATA.forEach((simulado) => {
  simulado.questoes.forEach((questao, index) => {
    if (!questao.numero) {
      questao.numero = index + 1;
    }
  });
});

renderCurrentSession();
