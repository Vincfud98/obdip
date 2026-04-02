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

const DEFAULT_ADMIN_GROUPS = [
  { code: "EFI", name: "Fundamental I (4o e 5o ano)", active: true },
  { code: "EFII", name: "Fundamental II (6o ao 9o ano)", active: true },
  { code: "EM", name: "Ensino Medio", active: true },
  { code: "EF", name: "Conteudo legado de Ensino Fundamental", active: true }
];

function getAdminGroups() {
  const saved = JSON.parse(localStorage.getItem("obdip_admin_groups") || "null");
  if (!Array.isArray(saved) || !saved.length) {
    return DEFAULT_ADMIN_GROUPS;
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

  return isLegacyDefault ? DEFAULT_ADMIN_GROUPS : saved;
}

function saveAdminGroups(groups) {
  localStorage.setItem("obdip_admin_groups", JSON.stringify(groups));
}

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
  const inboxNotifications = Storage.getNotificationsByUser(user.id).map((item) => ({
    id: item.id,
    tipo: item.tipo || "warning",
    titulo: item.titulo,
    texto: item.texto,
    tempo: formatDateTime(item.dataHora)
  }));
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
  const certificates = getCertificates(user, resultados);

  return {
    documents,
    ebooks,
    simulados,
    resultados,
    notifications,
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

        /* Validacao de senha (opcional — so verifica se o usuario tiver senha cadastrada) */
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
        showToast(`Acao simulada para o certificado ${certificateId}.`);
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
  syncRequiredDocumentsForUsers(users);
  const documents = Storage.getDocuments();
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
      onCreateGroup: (formData) => {
        const code = formData.get("code")?.toString().trim();
        const name = formData.get("name")?.toString().trim();

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

        const nextGroups = [...groupsSnapshot, { code: normalizedCode, name, active: true }];
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
