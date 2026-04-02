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
import { closeModal, formatDateTime, formatSerieLabel, openModal, showToast } from "./ui.js";

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
  studentTheme: localStorage.getItem("obdip_student_theme") || "light",
  selectedResultadoId: null,
  adminRankingSimuladoId: SIMULADOS_DATA[0]?.id || null,
  adminSection: "home",
  adminTheme: localStorage.getItem("obdip_admin_theme") || "light"
};

function setStudentTheme(theme) {
  state.studentTheme = theme;
  localStorage.setItem("obdip_student_theme", theme);
}

function setAdminTheme(theme) {
  state.adminTheme = theme;
  localStorage.setItem("obdip_admin_theme", theme);
}

let simuladoCleanup = null;
const MAX_DOCUMENT_PDF_SIZE = 2.5 * 1024 * 1024;
const DOCUMENT_REJECTION_REASONS = [
  { value: "ilegivel", label: "PDF ilegivel ou incompleto" },
  { value: "invalido", label: "Documento invalido para a matricula" },
  { value: "divergencia", label: "Dados divergentes do cadastro" },
  { value: "assinatura", label: "Falta assinatura ou confirmacao" },
  { value: "outro", label: "Outro motivo" }
];

const DEFAULT_GROUP_COLORS = {
  EFI: "#2563eb",
  EFII: "#0ea5e9",
  EM: "#f59e0b",
  EF: "#7c3aed",
  ES: "#10b981",
  Senior: "#ef4444",
  NemNem: "#64748b",
  Desempregado: "#64748b"
};

const DEFAULT_ADMIN_GROUPS = [
  { code: "EFI", name: "Fundamental I (4o e 5o ano)", active: true, color: DEFAULT_GROUP_COLORS.EFI },
  { code: "EFII", name: "Fundamental II (6o ao 9o ano)", active: true, color: DEFAULT_GROUP_COLORS.EFII },
  { code: "EM", name: "Ensino Medio", active: true, color: DEFAULT_GROUP_COLORS.EM },
  { code: "EF", name: "Conteudo legado de Ensino Fundamental", active: true, color: DEFAULT_GROUP_COLORS.EF }
];

function normalizeAdminGroup(group, index = 0) {
  const fallbackPalette = ["#2563eb", "#0ea5e9", "#f59e0b", "#7c3aed", "#10b981", "#ef4444", "#64748b"];

  return {
    ...group,
    color: group.color || DEFAULT_GROUP_COLORS[group.code] || fallbackPalette[index % fallbackPalette.length]
  };
}

function getAdminGroups() {
  const saved = JSON.parse(localStorage.getItem("obdip_admin_groups") || "null");
  if (!Array.isArray(saved) || !saved.length) {
    return DEFAULT_ADMIN_GROUPS.map((group, index) => normalizeAdminGroup(group, index));
  }

  const savedCodes = new Set(saved.map((group) => group.code));
  const isLegacyDefault =
    savedCodes.has("EF") &&
    savedCodes.has("EM") &&
    savedCodes.has("ES") &&
    savedCodes.has("NemNem") &&
    savedCodes.has("Senior") &&
    !savedCodes.has("EFI") &&
    !savedCodes.has("EFII");

  const sourceGroups = isLegacyDefault ? DEFAULT_ADMIN_GROUPS : saved;
  return sourceGroups.map((group, index) => normalizeAdminGroup(group, index));
}

function saveAdminGroups(groups) {
  localStorage.setItem(
    "obdip_admin_groups",
    JSON.stringify(groups.map((group, index) => normalizeAdminGroup(group, index)))
  );
}

function showView(name) {
  Object.entries(roots).forEach(([key, root]) => {
    root.classList.toggle("hidden", key !== name);
  });
}

function getCertificates(user, resultados) {
  const completedResults = resultados.filter(Boolean);
  const latestHistorico = getLatestHistorico(user.id);
  const available = completedResults.length > 0;
  const record = Storage.getCertificateRecord(user.id, "participacao");
  const validated = available && record?.status === "validado";
  const issuedAt = record?.validatedAt || latestHistorico?.dataHora || user.criadoEm || new Date().toISOString();

  return [
    {
      id: "cert-participacao",
      titulo: "Certificado oficial de participacao",
      descricao: validated
        ? "Documento validado pela equipe OBDIP e liberado para impressao."
        : available
        ? "Seu certificado esta aguardando validacao da equipe OBDIP."
        : "Este certificado sera liberado assim que sua primeira prova for concluida.",
      status: validated ? "Disponivel" : available ? "Em validacao" : "Pendente",
      tipo: "Participacao",
      data: validated ? formatDateTime(issuedAt) : available ? "Aguardando validacao" : "Aguardando conclusao",
      acao: validated ? "Visualizar certificado" : available ? "Aguardando validacao" : "Aguardando liberacao",
      disponivel: validated,
      emitidoEm: issuedAt,
      codigo: record?.codigo || getCertificateCode(user, issuedAt),
      serieLabel: formatSerieLabel(user.serie),
      provasConcluidas: completedResults.length
    }
  ];
}

function getLatestHistorico(userId) {
  return Storage.getHistorico(userId).sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0] || null;
}

function getAdminCertificateEntries(users) {
  return users
    .map((user) => {
      const historico = Storage.getHistorico(user.id);
      if (!historico.length) {
        return null;
      }

      const latestHistorico = historico.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0] || null;
      const record = Storage.getCertificateRecord(user.id, "participacao");
      const validationBaseDate = record?.validatedAt || latestHistorico?.dataHora || user.criadoEm || new Date().toISOString();

      return {
        id: `cert-admin-${user.id}`,
        userId: user.id,
        nome: user.nome,
        email: user.email,
        escola: user.escola || "Escola nao informada",
        serie: user.serie,
        serieLabel: formatSerieLabel(user.serie),
        provasConcluidas: historico.length,
        ultimoResultadoEm: latestHistorico?.dataHora || null,
        status: record?.status === "validado" ? "validado" : "pendente_validacao",
        validadoEm: record?.validatedAt || null,
        codigo: record?.codigo || getCertificateCode(user, validationBaseDate)
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const statusWeight = (item) => (item.status === "pendente_validacao" ? 0 : 1);
      const statusDelta = statusWeight(a) - statusWeight(b);
      if (statusDelta !== 0) return statusDelta;
      return new Date(b.ultimoResultadoEm || 0) - new Date(a.ultimoResultadoEm || 0);
    });
}

function getCertificateCode(user, issuedAt) {
  const normalizedKey = String(user.id || user.email || user.nome || "aluno")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(-8)
    .padStart(8, "0");

  return `OBDIP-2026-${normalizedKey}-${new Date(issuedAt).getFullYear()}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCertificateDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

function getCertificateMarkup(user, certificate) {
  const issueDate = formatCertificateDate(certificate.emitidoEm);

  return `
    <section class="certificate-sheet" aria-label="Certificado de participacao">
      <div class="certificate-frame">
        <div class="certificate-corner certificate-corner-top"></div>
        <div class="certificate-corner certificate-corner-bottom"></div>

        <header class="certificate-header">
          <div>
            <span class="certificate-kicker">Olimpiada cientifica</span>
            <strong>OBDIP 2026</strong>
            <p>2a Olimpiada Brasileira de Diplomacia e Relacoes Internacionais</p>
          </div>
          <div class="certificate-seal">
            <span>Participacao</span>
            <strong>OFICIAL</strong>
          </div>
        </header>

        <div class="certificate-body">
          <span class="certificate-label">Certificado de participacao</span>
          <h2>Certificamos que</h2>
          <h1>${escapeHtml(user.nome)}</h1>
          <p class="certificate-text">
            participou da 2a edicao da Olimpiada Brasileira de Diplomacia e Relacoes Internacionais,
            iniciativa academica voltada ao desenvolvimento do pensamento critico, cientifico e da
            argumentacao sobre politica externa brasileira e temas globais.
          </p>
          <div class="certificate-highlight">
            <div>
              <span>Categoria</span>
              <strong>${escapeHtml(certificate.serieLabel)}</strong>
            </div>
            <div>
              <span>Provas concluidas</span>
              <strong>${certificate.provasConcluidas}</strong>
            </div>
            <div>
              <span>Emissao</span>
              <strong>${escapeHtml(issueDate)}</strong>
            </div>
          </div>
        </div>

        <footer class="certificate-footer">
          <div class="certificate-signature">
            <strong>Coordenacao Geral OBDIP</strong>
            <span>Documento valido para apresentacao academica e institucional.</span>
          </div>
          <div class="certificate-code-block">
            <span>Codigo de validacao</span>
            <strong>${escapeHtml(certificate.codigo)}</strong>
          </div>
        </footer>
      </div>
    </section>
  `;
}

function getPrintableCertificateDocument(user, certificate) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(certificate.titulo)} - ${escapeHtml(user.nome)}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: #eef3fb;
            color: #0f172a;
            font-family: "Segoe UI", Arial, sans-serif;
          }

          body {
            padding: 18px;
          }

          .certificate-print-wrap {
            width: 100%;
          }

          .certificate-sheet {
            width: 100%;
          }

          .certificate-frame {
            position: relative;
            min-height: 180mm;
            padding: 26mm 24mm;
            border-radius: 28px;
            border: 3px solid #b98a2f;
            background:
              radial-gradient(circle at top right, rgba(20, 87, 197, 0.12), transparent 28%),
              radial-gradient(circle at bottom left, rgba(185, 138, 47, 0.12), transparent 30%),
              linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
            box-shadow: 0 18px 60px rgba(15, 23, 42, 0.12);
            overflow: hidden;
          }

          .certificate-frame::before,
          .certificate-frame::after {
            content: "";
            position: absolute;
            inset: 18px;
            border-radius: 22px;
            border: 1px solid rgba(11, 47, 111, 0.14);
            pointer-events: none;
          }

          .certificate-corner {
            position: absolute;
            width: 150px;
            height: 150px;
            border: 2px solid rgba(185, 138, 47, 0.5);
            border-radius: 30px;
          }

          .certificate-corner-top {
            top: 18px;
            left: 18px;
            border-right: 0;
            border-bottom: 0;
          }

          .certificate-corner-bottom {
            right: 18px;
            bottom: 18px;
            border-left: 0;
            border-top: 0;
          }

          .certificate-header,
          .certificate-footer {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            align-items: flex-start;
          }

          .certificate-header strong {
            display: block;
            margin-top: 10px;
            color: #0b2f6f;
            font-size: 24px;
            letter-spacing: 0.14em;
          }

          .certificate-header p,
          .certificate-signature span,
          .certificate-code-block span {
            margin: 8px 0 0;
            color: #52627c;
            font-size: 13px;
            line-height: 1.6;
          }

          .certificate-kicker,
          .certificate-label {
            display: inline-flex;
            align-items: center;
            min-height: 30px;
            padding: 0 14px;
            border-radius: 999px;
            background: rgba(11, 47, 111, 0.08);
            color: #0b2f6f;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }

          .certificate-seal {
            min-width: 160px;
            padding: 18px 16px;
            border-radius: 999px;
            background: linear-gradient(135deg, #0b2f6f 0%, #1457c5 100%);
            color: #ffffff;
            text-align: center;
            box-shadow: 0 12px 24px rgba(11, 47, 111, 0.22);
          }

          .certificate-seal span {
            display: block;
            font-size: 11px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            opacity: 0.8;
          }

          .certificate-seal strong {
            display: block;
            margin-top: 8px;
            color: #ffffff;
            font-size: 20px;
            letter-spacing: 0.08em;
          }

          .certificate-body {
            margin: 22px 0 28px;
            text-align: center;
          }

          .certificate-body h2 {
            margin: 24px 0 10px;
            font-family: Georgia, "Times New Roman", serif;
            color: #17376d;
            font-size: 24px;
            font-weight: 500;
          }

          .certificate-body h1 {
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
            color: #8d6421;
            font-size: 48px;
            line-height: 1.08;
            letter-spacing: 0.04em;
          }

          .certificate-text {
            max-width: 860px;
            margin: 20px auto 0;
            color: #334155;
            font-size: 17px;
            line-height: 1.75;
          }

          .certificate-highlight {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
            margin-top: 28px;
          }

          .certificate-highlight div {
            padding: 16px 18px;
            border-radius: 18px;
            border: 1px solid rgba(11, 47, 111, 0.12);
            background: rgba(255, 255, 255, 0.82);
          }

          .certificate-highlight span,
          .certificate-code-block span {
            display: block;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          .certificate-highlight strong,
          .certificate-code-block strong,
          .certificate-signature strong {
            display: block;
            margin-top: 8px;
            color: #0f172a;
            font-size: 17px;
          }

          .certificate-footer {
            align-items: end;
          }

          .certificate-signature {
            min-width: 320px;
            padding-top: 16px;
            border-top: 1px solid rgba(11, 47, 111, 0.22);
          }

          .certificate-code-block {
            min-width: 250px;
            padding: 16px 18px;
            border-radius: 18px;
            background: rgba(11, 47, 111, 0.05);
            border: 1px solid rgba(11, 47, 111, 0.12);
          }

          @media print {
            html, body {
              background: #ffffff;
            }

            body {
              padding: 0;
            }

            .certificate-frame {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="certificate-print-wrap">
          ${getCertificateMarkup(user, certificate)}
        </div>
      </body>
    </html>
  `;
}

function printCertificate(user, certificate) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1280,height=900");

  if (!printWindow) {
    showToast("Nao foi possivel abrir a janela de impressao.", "error");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(getPrintableCertificateDocument(user, certificate));
  printWindow.document.close();
  printWindow.focus();

  window.setTimeout(() => {
    printWindow.print();
  }, 300);
}

function openStudentCertificateModal(user, certificate) {
  if (!certificate?.disponivel) {
    showToast("Finalize sua primeira prova para liberar o certificado.", "warning");
    return;
  }

  openModal({
    title: "Certificado de participacao",
    size: "modal-xl",
    body: `
      <div class="certificate-modal-shell">
        <div class="certificate-modal-toolbar">
          <div>
            <strong>Pronto para impressao em A4 horizontal</strong>
            <p class="muted-copy">Confira o nome, a categoria e o codigo antes de imprimir.</p>
          </div>
          <span class="badge badge-success">Disponivel</span>
        </div>
        ${getCertificateMarkup(user, certificate)}
      </div>
    `,
    actions: [
      { label: "Fechar", className: "btn-secondary" },
      {
        label: "Imprimir certificado",
        className: "btn-primary",
        closeOnClick: false,
        onClick: () => printCertificate(user, certificate)
      }
    ]
  });
}

function getNotifications(user, simulados, resultados) {
  const latest = getLatestHistorico(user.id);
  const inboxNotifications = Storage.getNotificationsByUser(user.id).map((item) => ({
    id: item.id,
    tipo: item.tipo || "warning",
    titulo: item.titulo,
    texto: item.texto,
    tempo: formatDateTime(item.dataHora)
  }));
  const items = [
    {
      id: `notif-biblioteca-${user.serie}`,
      tipo: "primary",
      titulo: "Biblioteca atualizada",
      texto: `Novos materiais para ${formatSerieLabel(user.serie)} ja podem ser baixados na biblioteca.`,
      tempo: "Agora"
    },
    {
      id: `notif-simulado-${simulados[0]?.id || "nenhum"}`,
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
      id: `notif-resultado-${latest.simuladoId}-${latest.dataHora}`,
      tipo: "success",
      titulo: "Resultado corrigido",
      texto: `Sua ultima tentativa registrou ${latest.percentual}% de acerto.`,
      tempo: formatDateTime(latest.dataHora)
    });
  }

  if (!resultados.filter(Boolean).length) {
    items.push({
      id: `notif-primeira-prova-${user.id}`,
      tipo: "muted",
      titulo: "Primeira prova",
      texto: "Finalize seu primeiro simulado para liberar a pagina de desempenho e certificados.",
      tempo: "Lembrete"
    });
  }

  return [...inboxNotifications, ...items];
}

function getStudentData(user) {
  const simulados = getSimuladosByTurma(user.serie);
  const ebooks = getEbooksByTurma(user.serie);
  const documents = Storage.getDocumentsByUser(user.id)
    .sort((a, b) => new Date(b.atualizadoEm || b.enviadoEm || 0) - new Date(a.atualizadoEm || a.enviadoEm || 0));
  const resultados = simulados.map((simulado) => Storage.getResultado(simulado.id, user.id));
  const selectedResultadoId =
    state.selectedResultadoId ||
    resultados.find(Boolean)?.simuladoId ||
    simulados[0]?.id ||
    null;
  const notifications = getNotifications(user, simulados, resultados);
  const readNotificationIds = Storage.getReadNotificationIds(user.id);
  const unreadNotificationCount = notifications.filter((item) => !readNotificationIds.includes(item.id)).length;
  const certificates = getCertificates(user, resultados);

  return {
    documents,
    ebooks,
    simulados,
    resultados,
    notifications,
    unreadNotificationCount,
    certificates,
    resultadoSelecionado: selectedResultadoId
      ? Storage.getResultado(selectedResultadoId, user.id)
      : null
  };
}

function openStudentProfile(user) {
  const hasGuardianInfo = user.responsavelNome || user.responsavelEmail || user.responsavelTelefone;

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
          <p class="muted-copy"><strong>Categoria:</strong> ${formatSerieLabel(user.serie)}</p>
        </div>
        <div class="info-callout">
          <strong>Responsavel</strong>
          <p class="muted-copy"><strong>Status:</strong> ${user.menor ? "Cadastro com responsavel" : "Nao obrigatorio"}</p>
          <p class="muted-copy"><strong>Nome:</strong> ${hasGuardianInfo ? user.responsavelNome || "Nao informado" : "Nao informado"}</p>
          <p class="muted-copy"><strong>Email:</strong> ${hasGuardianInfo ? user.responsavelEmail || "Nao informado" : "Nao informado"}</p>
          <p class="muted-copy"><strong>Telefone:</strong> ${hasGuardianInfo ? user.responsavelTelefone || "Nao informado" : "Nao informado"}</p>
        </div>
        <div class="info-callout">
          <strong>Certificados</strong>
          <p class="muted-copy">Area pronta para exibir o certificado oficial de participacao e os comprovantes enviados.</p>
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
      onLogin: (email, password) => {
        const normalizedEmail = email?.toString().trim().toLowerCase();

        if (!normalizedEmail) {
          showToast("Informe um email valido para entrar.", "error");
          return;
        }

        /* Acesso admin */
        if (normalizedEmail === ADMIN_USER.email) {
          state.currentUser = ADMIN_USER;
          state.studentSection = "home";
          state.adminSection = "home";
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

        /* Validacao de senha (opcional - so verifica se o usuario tiver senha cadastrada) */
        const passwordProvided = password?.toString().trim();
        if (user.senha && passwordProvided && user.senha !== passwordProvided) {
          showToast("Senha incorreta. Tente novamente.", "error");
          return;
        }

        state.currentUser = user;
        state.studentSection = "home";
        state.selectedResultadoId = null;
        Storage.setCurrentUser(user);
        renderCurrentSession();
      },
      onRegister: async (payload) => {
        if (!payload.nome || !payload.email || !payload.escola || !payload.serie) {
          showToast("Preencha todos os campos obrigatorios.", "error");
          return;
        }

        const registrationPdfError = validatePdfFile(payload.comprovanteMatriculaPdf, "Comprovante de matricula");
        if (registrationPdfError) {
          showToast(registrationPdfError, "error");
          return;
        }

        const guardianRequired = ["EFI", "EFII"].includes(payload.serie) || payload.menor;
        if (
          guardianRequired &&
          (
            !payload.responsavelNome ||
            !payload.responsavelEmail ||
            !payload.responsavelTelefone ||
            !payload.consentimentoResponsavel
          )
        ) {
          showToast("Preencha os dados do responsavel e confirme a autorizacao.", "error");
          return;
        }

        if (guardianRequired) {
          const guardianPdfError = validatePdfFile(payload.autorizacaoResponsavelPdf, "Autorizacao do responsavel");
          if (guardianPdfError) {
            showToast(guardianPdfError, "error");
            return;
          }
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
          menor: guardianRequired,
          responsavelNome: guardianRequired ? payload.responsavelNome : "",
          responsavelEmail: guardianRequired ? payload.responsavelEmail : "",
          responsavelTelefone: guardianRequired ? payload.responsavelTelefone : "",
          consentimentoResponsavel: guardianRequired ? payload.consentimentoResponsavel : false,
          role: "aluno",
          status: "ativo",
          criadoEm: new Date().toISOString()
        };

        users.push(newUser);
        Storage.saveUsers(users);
        try {
          await storeEnrollmentDocuments(newUser, payload);
        } catch (error) {
          Storage.saveUsers(users.filter((item) => item.id !== newUser.id));
          showToast("Nao foi possivel processar os PDFs enviados. Tente novamente.", "error");
          return;
        }
        ensureRequiredDocumentsForUser(newUser);
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
        state.adminSection = "home";
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

function buildRequiredDocumentsForUser(user) {
  const now = new Date().toISOString();
  const documents = [
    {
      id: `doc-${user.id}-matricula`,
      userId: user.id,
      tipo: "matricula",
      nome: "Comprovante de matricula",
      status: "pendente",
      referencia: user.escola ? `Matricula vinculada a ${user.escola}.` : "Aguardando recebimento do comprovante de matricula.",
      observacoes: "Documento recebido no processo de matricula do estudante.",
      origem: "matricula",
      enviadoEm: user.criadoEm || now,
      atualizadoEm: user.criadoEm || now
    }
  ];

  if (user.menor || user.responsavelNome || user.responsavelEmail || user.responsavelTelefone) {
    documents.push({
      id: `doc-${user.id}-autorizacao`,
      userId: user.id,
      tipo: "autorizacao",
      nome: "Autorizacao do responsavel",
      status: user.consentimentoResponsavel ? "em_analise" : "pendente",
      referencia: user.responsavelNome
        ? `Responsavel informado: ${user.responsavelNome}.`
        : "Aguardando recebimento da autorizacao do responsavel.",
      observacoes: "Documento recebido no processo de matricula para estudantes menores de idade.",
      origem: "matricula",
      enviadoEm: user.criadoEm || now,
      atualizadoEm: user.criadoEm || now
    });
  }

  return documents;
}

function hasUploadedFile(file) {
  return Boolean(file && typeof file === "object" && file.name && file.size > 0);
}

function validatePdfFile(file, fieldLabel) {
  if (!hasUploadedFile(file)) {
    return `${fieldLabel}: envie um arquivo PDF.`;
  }

  const isPdfMime = file.type === "application/pdf";
  const isPdfExtension = file.name.toLowerCase().endsWith(".pdf");
  if (!isPdfMime && !isPdfExtension) {
    return `${fieldLabel}: o arquivo precisa estar em PDF.`;
  }

  if (file.size > MAX_DOCUMENT_PDF_SIZE) {
    return `${fieldLabel}: o PDF excede o limite de 2,5 MB.`;
  }

  return null;
}

function getRejectionReasonLabel(reasonCode) {
  return DOCUMENT_REJECTION_REASONS.find((item) => item.value === reasonCode)?.label || reasonCode || "Motivo nao informado";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
    reader.readAsDataURL(file);
  });
}

async function storeEnrollmentDocuments(user, payload) {
  const now = user.criadoEm || new Date().toISOString();
  const matriculaPdf = payload.comprovanteMatriculaPdf;
  const documentsToSave = [];

  if (hasUploadedFile(matriculaPdf)) {
    documentsToSave.push({
      id: `doc-${user.id}-matricula`,
      userId: user.id,
      tipo: "matricula",
      nome: "Comprovante de matricula",
      status: "em_analise",
      referencia: `PDF recebido na matricula: ${matriculaPdf.name}`,
      observacoes: "Comprovante recebido no formulario de matricula.",
      origem: "matricula",
      arquivoNome: matriculaPdf.name,
      arquivoTipo: matriculaPdf.type || "application/pdf",
      arquivoTamanho: matriculaPdf.size,
      arquivoDataUrl: await readFileAsDataUrl(matriculaPdf),
      enviadoEm: now,
      atualizadoEm: now
    });
  }

  const autorizacaoPdf = payload.autorizacaoResponsavelPdf;
  if (hasUploadedFile(autorizacaoPdf)) {
    documentsToSave.push({
      id: `doc-${user.id}-autorizacao`,
      userId: user.id,
      tipo: "autorizacao",
      nome: "Autorizacao do responsavel",
      status: "em_analise",
      referencia: `PDF recebido na matricula: ${autorizacaoPdf.name}`,
      observacoes: "Autorizacao do responsavel recebida no formulario de matricula.",
      origem: "matricula",
      arquivoNome: autorizacaoPdf.name,
      arquivoTipo: autorizacaoPdf.type || "application/pdf",
      arquivoTamanho: autorizacaoPdf.size,
      arquivoDataUrl: await readFileAsDataUrl(autorizacaoPdf),
      enviadoEm: now,
      atualizadoEm: now
    });
  }

  documentsToSave.forEach((document) => Storage.addDocument(document));
}

async function reuploadStudentDocument(user, documentId, file) {
  const documentRecord = Storage.getDocuments().find((item) => item.id === documentId && item.userId === user.id);
  if (!documentRecord) {
    throw new Error("Documento nao encontrado.");
  }

  const fileError = validatePdfFile(file, documentRecord.nome);
  if (fileError) {
    throw new Error(fileError);
  }

  const dataUrl = await readFileAsDataUrl(file);
  Storage.updateDocument(documentId, {
    status: "em_analise",
    referencia: `PDF reenviado pelo aluno: ${file.name}`,
    observacoes: "Documento reenviado pelo aluno para nova analise.",
    arquivoNome: file.name,
    arquivoTipo: file.type || "application/pdf",
    arquivoTamanho: file.size,
    arquivoDataUrl: dataUrl,
    rejectionReasonCode: "",
    rejectionReasonText: ""
  });
}

function ensureRequiredDocumentsForUser(user) {
  if (!user?.id || user.role === "admin") return;

  const existing = Storage.getDocumentsByUser(user.id);
  const existingTypes = new Set(existing.map((item) => item.tipo));

  buildRequiredDocumentsForUser(user)
    .filter((document) => !existingTypes.has(document.tipo))
    .forEach((document) => Storage.addDocument(document));
}

function syncRequiredDocumentsForUsers(users) {
  users.forEach((user) => ensureRequiredDocumentsForUser(user));
}

function renderStudentView() {
  showView("student");
  const user = state.currentUser;

  if (state.studentSection === "notificacoes") {
    const currentSimulados = getSimuladosByTurma(user.serie);
    const currentResults = currentSimulados.map((simulado) => Storage.getResultado(simulado.id, user.id));
    const currentNotifications = getNotifications(user, currentSimulados, currentResults);
    Storage.markNotificationsAsRead(
      user.id,
      currentNotifications.map((item) => item.id)
    );
  }

  const data = getStudentData(user);

  renderStudentDashboard(
    roots.student,
    {
      user,
      section: state.studentSection,
      theme: state.studentTheme,
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
        const certificate = data.certificates.find((item) => item.id === certificateId);
        if (!certificate) {
          showToast("Certificado nao encontrado.", "error");
          return;
        }

        openStudentCertificateModal(user, certificate);
      },
      onSaveAccount: (formData) => {
        const nextEmail = formData.get("email")?.toString().trim().toLowerCase();
        const nextPassword = formData.get("senha")?.toString().trim();
        const users = Storage.getUsers();
        const emailAlreadyInUse = users.some(
          (item) => item.id !== state.currentUser.id && item.email.toLowerCase() === nextEmail
        );

        if (!nextEmail) {
          showToast("Informe um email valido.", "error");
          return;
        }

        if (emailAlreadyInUse) {
          showToast("Este email ja esta em uso por outro cadastro.", "error");
          return;
        }

        const updates = {
          nome: formData.get("nome")?.toString().trim(),
          email: nextEmail
        };

        if (nextPassword) {
          updates.senha = nextPassword;
        }

        persistCurrentUser(updates);
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
      onReuploadDocument: async (documentId, formData) => {
        try {
          await reuploadStudentDocument(user, documentId, formData.get("arquivo"));
          Storage.addNotification(user.id, {
            id: `notif-doc-reupload-${Date.now()}`,
            tipo: "primary",
            titulo: "Documento reenviado",
            texto: "Recebemos seu novo PDF. A equipe OBDIP vai analisar o documento novamente.",
            dataHora: new Date().toISOString()
          });
          showToast("Documento reenviado com sucesso.");
          state.studentSection = "documentos";
          renderStudentView();
        } catch (error) {
          showToast(error.message || "Nao foi possivel reenviar o documento.", "error");
        }
      },
      onToggleTheme: () => {
        setStudentTheme(state.studentTheme === "dark" ? "light" : "dark");
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
  const documents = Storage.getDocumentsByUser(user.id);

  openModal({
    title: `Perfil de ${user.nome}`,
    body: `
      <div class="admin-stack">
        <div class="info-callout">
          <strong>Dados do formulario</strong>
          <p class="muted-copy"><strong>Email:</strong> ${user.email}</p>
          <p class="muted-copy"><strong>Escola:</strong> ${user.escola || "Nao informada"}</p>
          <p class="muted-copy"><strong>Categoria:</strong> ${formatSerieLabel(user.serie || "Nao informada")}</p>
          <p class="muted-copy"><strong>Status:</strong> ${user.status || "ativo"}</p>
          <p class="muted-copy"><strong>Responsavel:</strong> ${user.responsavelNome || "Nao informado"}</p>
          <p class="muted-copy"><strong>Documentos:</strong> ${documents.length} registro(s)</p>
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

function openDocumentModal(doc) {
  const user = Storage.getUsers().find((item) => item.id === doc.userId);
  const actions = [];
  const documentUrl = doc.arquivoDataUrl || doc.arquivoUrl;

  if (documentUrl) {
    actions.push({
      label: "Abrir PDF",
      className: "btn-primary",
      closeOnClick: false,
      onClick: () => {
        window.open(documentUrl, "_blank", "noopener,noreferrer");
      }
    });
    actions.push({
      label: "Baixar PDF",
      className: "btn-secondary",
      closeOnClick: false,
      onClick: () => {
        const link = window.document.createElement("a");
        link.href = documentUrl;
        link.download = doc.arquivoNome || `${doc.nome}.pdf`;
        window.document.body.appendChild(link);
        link.click();
        link.remove();
      }
    });
  }

  actions.push({ label: "Fechar", className: "btn-secondary" });

  openModal({
    title: doc.nome,
    body: `
      <div class="admin-stack">
        <div class="info-callout">
          <strong>Participante</strong>
          <p class="muted-copy"><strong>Nome:</strong> ${user?.nome || "Nao encontrado"}</p>
          <p class="muted-copy"><strong>Email:</strong> ${user?.email || "Nao informado"}</p>
          <p class="muted-copy"><strong>Categoria:</strong> ${formatSerieLabel(user?.serie || "Nao informada")}</p>
        </div>
        <div class="info-callout">
          <strong>Documento</strong>
          <p class="muted-copy"><strong>Tipo:</strong> ${doc.tipo}</p>
          <p class="muted-copy"><strong>Status:</strong> ${doc.status}</p>
          <p class="muted-copy"><strong>Origem:</strong> ${doc.origem || "manual"}</p>
          <p class="muted-copy"><strong>Referencia:</strong> ${doc.referencia || "Nao informada"}</p>
          <p class="muted-copy"><strong>Arquivo:</strong> ${doc.arquivoNome || "Sem PDF anexado"}</p>
          <p class="muted-copy"><strong>Tamanho:</strong> ${doc.arquivoTamanho ? `${(doc.arquivoTamanho / 1024).toFixed(0)} KB` : "Nao informado"}</p>
          <p class="muted-copy"><strong>Enviado em:</strong> ${formatDateTime(doc.enviadoEm)}</p>
          <p class="muted-copy"><strong>Atualizado em:</strong> ${formatDateTime(doc.atualizadoEm)}</p>
        </div>
        <div class="info-callout">
          <strong>Observacoes</strong>
          <p class="muted-copy">${doc.observacoes || "Sem observacoes."}</p>
        </div>
        ${doc.rejectionReasonText ? `
          <div class="info-callout">
            <strong>Motivo da recusa</strong>
            <p class="muted-copy">${doc.rejectionReasonText}</p>
          </div>
        ` : ""}
      </div>
    `,
    actions
  });
}

function openRejectDocumentModal(doc, onConfirm) {
  const options = DOCUMENT_REJECTION_REASONS
    .map((item) => `<option value="${item.value}">${item.label}</option>`)
    .join("");

  openModal({
    title: `Recusar ${doc.nome}`,
    body: `
      <div class="admin-stack">
        <div class="form-group">
          <label class="form-label" for="reject-reason">Motivo da recusa</label>
          <select id="reject-reason" class="form-control form-select">
            ${options}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="reject-other-reason">Detalhamento</label>
          <textarea id="reject-other-reason" class="form-control" placeholder="Se necessario, explique a recusa. Use este campo obrigatoriamente quando escolher Outro."></textarea>
        </div>
      </div>
    `,
    actions: [
      { label: "Cancelar", className: "btn-secondary" },
      {
        label: "Confirmar recusa",
        className: "btn-primary",
        closeOnClick: false,
        onClick: () => {
          const reasonSelect = window.document.querySelector("#reject-reason");
          const otherReasonField = window.document.querySelector("#reject-other-reason");
          const reasonCode = reasonSelect?.value || "";
          const otherReason = otherReasonField?.value?.trim() || "";

          if (!reasonCode) {
            showToast("Selecione o motivo da recusa.", "error");
            return;
          }

          if (reasonCode === "outro" && !otherReason) {
            showToast("Descreva o motivo da recusa no campo Outro.", "error");
            return;
          }

          const reasonText =
            reasonCode === "outro"
              ? otherReason
              : `${getRejectionReasonLabel(reasonCode)}${otherReason ? `: ${otherReason}` : ""}`;

          onConfirm({ reasonCode, reasonText });
        }
      }
    ]
  });
}

function doesSerieBelongToGroup(serie, groupCode) {
  const aliasMap = {
    EFI: ["EFI", "EF"],
    EFII: ["EFII", "EF"],
    EF: ["EF", "EFI", "EFII"],
    EM: ["EM"],
    ES: ["ES"],
    Senior: ["Senior"],
    NemNem: ["NemNem", "Desempregado"],
    Desempregado: ["Desempregado", "NemNem"]
  };

  const serieAliases = aliasMap[serie] || [serie];
  const groupAliases = aliasMap[groupCode] || [groupCode];
  return serieAliases.some((item) => groupAliases.includes(item));
}

function openAdminNotificationModal(users, groups, onConfirm) {
  const students = users.filter((item) => item.role !== "admin");
  const groupOptions = groups
    .map(
      (group) => `
        <label class="checkbox-group admin-notification-option">
          <input type="checkbox" value="${group.code}" data-admin-notification-group>
          <span>
            <strong>${group.name}</strong>
            <small>${group.code}</small>
          </span>
        </label>
      `
    )
    .join("");
  const studentOptions = students
    .map(
      (student) => `
        <label class="checkbox-group admin-notification-option">
          <input type="checkbox" value="${student.id}" data-admin-notification-student>
          <span>
            <strong>${student.nome}</strong>
            <small>${student.email} | ${formatSerieLabel(student.serie)}</small>
          </span>
        </label>
      `
    )
    .join("");

  openModal({
    title: "Enviar notificacao",
    size: "modal-lg",
    body: `
      <div class="admin-stack admin-notification-compose">
        <div class="info-callout">
          <strong>Alcance da mensagem</strong>
          <p class="muted-copy">Escolha se o comunicado sera geral, por grupos ou para alunos especificos. A notificacao aparecera na aba Notificacoes do aluno.</p>
        </div>

        <div class="form-group">
          <label class="form-label" for="admin-notification-title">Titulo da notificacao</label>
          <input id="admin-notification-title" class="form-control" type="text" maxlength="90" placeholder="Ex.: Cronograma oficial atualizado">
        </div>

        <div class="form-group">
          <label class="form-label" for="admin-notification-message">Mensagem</label>
          <textarea id="admin-notification-message" class="form-control" rows="5" placeholder="Escreva o aviso que os alunos vao receber."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="admin-notification-scope">Enviar para</label>
          <select id="admin-notification-scope" class="form-control form-select">
            <option value="geral">Todos os alunos</option>
            <option value="grupos">Grupos especificos</option>
            <option value="individual">Alunos especificos</option>
          </select>
        </div>

        <section class="admin-notification-target admin-notification-target-hidden" data-admin-notification-panel="grupos">
          <div class="admin-notification-target-head">
            <strong>Grupos destinatarios</strong>
            <span class="muted-copy">Selecione um ou mais grupos.</span>
          </div>
          <div class="admin-notification-option-grid">
            ${groupOptions || `<div class="empty-state"><strong>Nenhum grupo cadastrado</strong></div>`}
          </div>
        </section>

        <section class="admin-notification-target admin-notification-target-hidden" data-admin-notification-panel="individual">
          <div class="admin-notification-target-head">
            <strong>Alunos destinatarios</strong>
            <span class="muted-copy">Selecione um ou mais alunos.</span>
          </div>
          <div class="admin-notification-option-grid admin-notification-student-grid">
            ${studentOptions || `<div class="empty-state"><strong>Nenhum aluno cadastrado</strong></div>`}
          </div>
        </section>
      </div>
    `,
    actions: [
      { label: "Cancelar", className: "btn-secondary" },
      {
        label: "Enviar notificacao",
        className: "btn-primary",
        closeOnClick: false,
        onClick: () => {
          const titleField = window.document.querySelector("#admin-notification-title");
          const messageField = window.document.querySelector("#admin-notification-message");
          const scopeField = window.document.querySelector("#admin-notification-scope");
          const title = titleField?.value?.trim() || "";
          const message = messageField?.value?.trim() || "";
          const scope = scopeField?.value || "geral";
          const selectedGroups = Array.from(window.document.querySelectorAll("[data-admin-notification-group]:checked")).map((input) => input.value);
          const selectedStudents = Array.from(window.document.querySelectorAll("[data-admin-notification-student]:checked")).map((input) => input.value);

          if (!title) {
            showToast("Informe o titulo da notificacao.", "error");
            return;
          }

          if (!message) {
            showToast("Escreva a mensagem da notificacao.", "error");
            return;
          }

          if (scope === "grupos" && !selectedGroups.length) {
            showToast("Selecione pelo menos um grupo.", "error");
            return;
          }

          if (scope === "individual" && !selectedStudents.length) {
            showToast("Selecione pelo menos um aluno.", "error");
            return;
          }

          onConfirm({
            title,
            message,
            scope,
            groupCodes: selectedGroups,
            studentIds: selectedStudents
          });
        }
      }
    ]
  });

  const scopeField = window.document.querySelector("#admin-notification-scope");
  const panels = Array.from(window.document.querySelectorAll("[data-admin-notification-panel]"));
  const syncPanels = () => {
    const scope = scopeField?.value || "geral";
    panels.forEach((panel) => {
      panel.classList.toggle("admin-notification-target-hidden", panel.dataset.adminNotificationPanel !== scope);
    });
  };

  scopeField?.addEventListener("change", syncPanels);
  syncPanels();
}

function resolveAdminNotificationRecipients(payload, users) {
  const students = users.filter((item) => item.role !== "admin");

  if (payload.scope === "geral") {
    return students;
  }

  if (payload.scope === "grupos") {
    return students.filter((student) =>
      payload.groupCodes.some((groupCode) => doesSerieBelongToGroup(student.serie, groupCode))
    );
  }

  if (payload.scope === "individual") {
    return students.filter((student) => payload.studentIds.includes(student.id));
  }

  return [];
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
  if (state.adminSection === "usuarios") {
    state.adminSection = "alunos";
  }
  const users = Storage.getUsers();
  syncRequiredDocumentsForUsers(users);
  const documents = Storage.getDocuments();
  const certificates = getAdminCertificateEntries(users);
  const historico = users.flatMap((user) => Storage.getHistorico(user.id));
  const ultimoResultado = historico.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];
  const rankingId = state.adminRankingSimuladoId || SIMULADOS_DATA[0]?.id || null;
  const groups = getAdminGroups();

  renderAdminDashboard(
    roots.admin,
    {
      users,
      simulados: SIMULADOS_DATA,
      historico,
      documents,
      certificates,
      section: state.adminSection,
      groups,
      rankingSimuladoId: rankingId,
      ranking: rankingId ? Storage.getRanking(rankingId) : [],
      theme: state.adminTheme,
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
        state.adminSection = "home";
        state.selectedResultadoId = null;
        renderLandingView();
      },
      onNavigate: (section) => {
        state.adminSection = section;
        renderAdminView();
      },
      onCreateSimulado: (formData) => {
        try {
          const simulado = createSimuladoFromForm(formData);
          SIMULADOS_DATA.unshift(simulado);
          state.adminRankingSimuladoId = simulado.id;
          state.adminSection = "simulados";
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
        state.adminSection = "ranking";
        renderAdminView();
      },
      onToggleTheme: () => {
        setAdminTheme(state.adminTheme === "dark" ? "light" : "dark");
        renderAdminView();
      },
      onOpenAdminNotification: () => {
        openAdminNotificationModal(users, groups, (payload) => {
          const recipients = resolveAdminNotificationRecipients(payload, Storage.getUsers());

          if (!recipients.length) {
            showToast("Nenhum aluno encontrado para esse envio.", "error");
            return;
          }

          const timestamp = new Date().toISOString();
          recipients.forEach((recipient, index) => {
            Storage.addNotification(recipient.id, {
              id: `notif-admin-${Date.now()}-${index}-${recipient.id}`,
              tipo: "primary",
              titulo: payload.title,
              texto: payload.message,
              dataHora: timestamp,
              origem: "admin"
            });
          });

          showToast(`Notificacao enviada para ${recipients.length} aluno(s).`);
          closeModal();
        });
      },
      onCreateGroup: (formData) => {
        const code = formData.get("code")?.toString().trim();
        const name = formData.get("name")?.toString().trim();
        const color = formData.get("color")?.toString().trim() || "#2563eb";

        if (!code || !name) {
          showToast("Preencha codigo e nome do grupo.", "error");
          return;
        }

        const normalizedCode = code.replace(/\s+/g, "").trim();
        const groupsSnapshot = getAdminGroups();
        if (groupsSnapshot.some((group) => group.code.toLowerCase() === normalizedCode.toLowerCase())) {
          showToast("Ja existe um grupo com esse codigo.", "error");
          return;
        }

        const nextGroups = [...groupsSnapshot, { code: normalizedCode, name, active: true, color }];
        saveAdminGroups(nextGroups);
        state.adminSection = "grupos";
        showToast(`Grupo "${name}" adicionado com sucesso.`);
        renderAdminView();
      },
      onGroupAction: (action, groupCode) => {
        if (action !== "toggle" || !groupCode) return;
        const nextGroups = getAdminGroups().map((group) =>
          group.code === groupCode ? { ...group, active: !group.active } : group
        );
        saveAdminGroups(nextGroups);
        state.adminSection = "grupos";
        renderAdminView();
      },
      onGroupColorChange: (groupCode, color) => {
        if (!groupCode || !color) return;
        const nextGroups = getAdminGroups().map((group) =>
          group.code === groupCode ? { ...group, color } : group
        );
        saveAdminGroups(nextGroups);
        state.adminSection = "grupos";
        showToast(`Cor do grupo ${groupCode} atualizada.`);
        renderAdminView();
      },
      onDocumentAction: (action, documentId) => {
        const document = Storage.getDocuments().find((item) => item.id === documentId);
        if (!document) {
          showToast("Documento nao encontrado.", "error");
          return;
        }

        if (action === "visualizar") {
          openDocumentModal(document);
          return;
        }

        const nextStatusMap = {
          validar: "validado",
          analise: "em_analise",
          reprovar: "reprovado"
        };

        const nextStatus = nextStatusMap[action];
        if (!nextStatus) return;

        if (action === "reprovar") {
          openRejectDocumentModal(document, ({ reasonCode, reasonText }) => {
            Storage.updateDocument(documentId, {
              status: "reprovado",
              rejectionReasonCode: reasonCode,
              rejectionReasonText: reasonText,
              observacoes: `Documento recusado: ${reasonText}`
            });
            Storage.addNotification(document.userId, {
              id: `notif-doc-${Date.now()}`,
              tipo: "warning",
              titulo: "Documento recusado",
              texto: `O documento "${document.nome}" foi recusado. Motivo: ${reasonText}. Reenvie um novo PDF na aba Documentos.`,
              dataHora: new Date().toISOString()
            });
            showToast(`Documento "${document.nome}" recusado.`);
            renderAdminView();
            closeModal();
          });
          return;
        }

        Storage.updateDocument(documentId, {
          status: nextStatus,
          rejectionReasonCode: "",
          rejectionReasonText: "",
          observacoes: action === "validar"
            ? "Documento aprovado pela equipe OBDIP."
            : "Documento encaminhado para nova analise."
        });
        if (action === "validar") {
          Storage.addNotification(document.userId, {
            id: `notif-doc-${Date.now()}`,
            tipo: "success",
            titulo: "Documento aprovado",
            texto: `O documento "${document.nome}" foi aprovado pela equipe OBDIP.`,
            dataHora: new Date().toISOString()
          });
        }
        showToast(`Documento "${document.nome}" atualizado para ${nextStatus}.`);
        renderAdminView();
      },
      onCertificateAction: (action, userId) => {
        if (action !== "validar") return;

        const user = Storage.getUsers().find((item) => item.id === userId);
        if (!user) {
          showToast("Aluno nao encontrado.", "error");
          return;
        }

        const latestHistorico = getLatestHistorico(user.id);
        if (!latestHistorico) {
          showToast("Este aluno ainda nao concluiu provas para emitir certificado.", "error");
          return;
        }

        const existingRecord = Storage.getCertificateRecord(user.id, "participacao");
        if (existingRecord?.status === "validado") {
          showToast(`O certificado de ${user.nome} ja foi validado.`);
          return;
        }

        const validatedAt = new Date().toISOString();
        const codigo = getCertificateCode(user, validatedAt);

        Storage.saveCertificate({
          id: `cert-participacao-${user.id}`,
          userId: user.id,
          type: "participacao",
          status: "validado",
          titulo: "Certificado oficial de participacao",
          codigo,
          validatedAt
        });
        Storage.addNotification(user.id, {
          id: `notif-cert-${Date.now()}`,
          tipo: "success",
          titulo: "Certificado validado",
          texto: 'Seu certificado oficial de participacao foi validado pela equipe OBDIP e ja pode ser acessado na aba "Certificados".',
          dataHora: validatedAt
        });
        showToast(`Certificado de ${user.nome} validado com sucesso.`);
        state.adminSection = "certificados";
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
          showToast("Aluno nao encontrado.", "error");
          return;
        }

        if (action === "perfil") {
          openAdminUserModal(user);
          return;
        }

        if (action === "documentos") {
          state.adminSection = "documentos";
          renderAdminView();
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
