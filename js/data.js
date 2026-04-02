/**
 * data.js — Mock Data Store
 * Simula um banco de dados em memória com localStorage para persistência.
 * Em produção, estas funções seriam substituídas por chamadas à API REST.
 */

// ============================================================
// QUESTÕES DE EXEMPLO
// ============================================================

const SIMULADOS_DATA = [
  {
    id: "sim-001",
    nome: "Simulado Bimestral — Ciências da Natureza",
    turmas: ["EM", "ES"],          // Ensino Médio e Ensino Superior
    tempo: 180,                    // minutos
    status: "publicado",           // publicado | rascunho | agendado
    agendamento: null,
    criadoEm: "2025-09-10T09:00:00Z",
    questoes: [
      {
        id: "q-001",
        numero: 1,
        disciplina: "Biologia",
        enunciado: `<p>A organização celular é fundamental para a compreensão dos seres vivos. Sobre as células <strong>procariontes</strong> e <strong>eucariontes</strong>, analise as afirmativas abaixo:</p>
                    <ol type="I">
                      <li>Células procariontes não possuem membrana nuclear.</li>
                      <li>Mitocôndrias estão presentes apenas em células eucariontes.</li>
                      <li>Bactérias são exemplos de organismos eucariontes.</li>
                      <li>O material genético das células procariontes fica disperso no citoplasma.</li>
                    </ol>`,
        comando: "Estão corretas apenas as afirmativas:",
        imagem: null,
        opcoes: [
          { letra: "A", texto: "I e II, apenas." },
          { letra: "B", texto: "I, II e IV, apenas." },
          { letra: "C", texto: "II e III, apenas." },
          { letra: "D", texto: "I, III e IV, apenas." },
          { letra: "E", texto: "I, II, III e IV." }
        ],
        gabarito: "B",
        comentario: "As afirmativas I, II e IV estão corretas. Células procariontes (como bactérias) não possuem membrana nuclear (I) e seu material genético fica livre no citoplasma (IV). Mitocôndrias são organelas exclusivas de células eucariontes (II). A afirmativa III está incorreta: bactérias são procariontes, não eucariontes."
      },
      {
        id: "q-002",
        numero: 2,
        disciplina: "Química",
        enunciado: `<p>A tabela periódica organiza os elementos químicos segundo suas propriedades. Observe o trecho abaixo:</p>`,
        comando: "Com base no trecho da tabela periódica acima, é correto afirmar que o elemento X:",
        imagem: {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sodium_spectrum_visible.png/320px-Sodium_spectrum_visible.png",
          alt: "Espectro de emissão do sódio",
          legenda: "Fig. 1 — Espectro de emissão do sódio (Na)"
        },
        opcoes: [
          { letra: "A", texto: "Pertence ao grupo dos metais alcalinos e possui 1 elétron na camada de valência." },
          { letra: "B", texto: "É um gás nobre e apresenta configuração eletrônica completa." },
          { letra: "C", texto: "Pertence ao grupo dos halogênios com 7 elétrons na última camada." },
          { letra: "D", texto: "É um metal de transição e pode apresentar múltiplos estados de oxidação." },
          { letra: "E", texto: "Pertence ao grupo 2 com 2 elétrons na camada de valência." }
        ],
        gabarito: "A",
        comentario: "O elemento em questão é o Sódio (Na), pertencente ao Grupo 1 (metais alcalinos). Metais alcalinos possuem 1 elétron na camada de valência, o que os torna altamente reativos. O espectro de emissão na cor amarela é característica exclusiva do sódio."
      },
      {
        id: "q-003",
        numero: 3,
        disciplina: "Física",
        enunciado: `<p>Um automóvel parte do repouso e percorre uma estrada reta com aceleração constante de <strong>2,0 m/s²</strong>. Após 10 segundos de movimento:</p>`,
        comando: "Qual é a velocidade do automóvel e a distância percorrida nesse intervalo de tempo?",
        imagem: null,
        opcoes: [
          { letra: "A", texto: "v = 10 m/s e d = 50 m" },
          { letra: "B", texto: "v = 20 m/s e d = 100 m" },
          { letra: "C", texto: "v = 20 m/s e d = 200 m" },
          { letra: "D", texto: "v = 40 m/s e d = 200 m" },
          { letra: "E", texto: "v = 10 m/s e d = 100 m" }
        ],
        gabarito: "B",
        comentario: "Usando as equações cinemáticas do MRUV: v = v₀ + at = 0 + 2×10 = 20 m/s. Para a distância: d = v₀t + ½at² = 0 + ½ × 2 × 100 = 100 m. Portanto, v = 20 m/s e d = 100 m."
      },
      {
        id: "q-004",
        numero: 4,
        disciplina: "Biologia",
        enunciado: `<p>A fotossíntese é o processo pelo qual plantas, algas e cianobactérias convertem energia luminosa em energia química. A equação geral da fotossíntese pode ser representada como:</p>
                    <p style="text-align:center; font-family: monospace; background: #f1f5f9; padding: 12px; border-radius: 6px; margin: 12px 0;">
                      6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂
                    </p>`,
        comando: "Sobre as etapas da fotossíntese, assinale a alternativa CORRETA:",
        imagem: null,
        opcoes: [
          { letra: "A", texto: "A fase clara ocorre no estroma do cloroplasto e produz ATP e NADPH." },
          { letra: "B", texto: "O Ciclo de Calvin ocorre nos tilacoides e utiliza CO₂ para produzir glicose." },
          { letra: "C", texto: "A fase clara ocorre nos tilacoides, onde a água é fotólisada e gás oxigênio é liberado." },
          { letra: "D", texto: "Na fase escura, a clorofila absorve luz para produzir ATP." },
          { letra: "E", texto: "O O₂ liberado na fotossíntese origina-se do CO₂ e não da água." }
        ],
        gabarito: "C",
        comentario: "A fase clara (reações fotoquímicas) ocorre nos tilacoides dos cloroplastos. Nessa fase, a energia luminosa é absorvida pela clorofila, ocorre a fotólise da água (decomposição da H₂O), liberando O₂ como subproduto, e são produzidos ATP e NADPH. O Ciclo de Calvin (fase escura) ocorre no estroma."
      },
      {
        id: "q-005",
        numero: 5,
        disciplina: "Química",
        enunciado: `<p>O pH é uma medida da concentração de íons H⁺ em uma solução. Uma solução com pH = 3 é comparada com uma solução com pH = 7.</p>`,
        comando: "Quantas vezes a solução de pH 3 é mais ácida que a de pH 7?",
        imagem: null,
        opcoes: [
          { letra: "A", texto: "4 vezes" },
          { letra: "B", texto: "10 vezes" },
          { letra: "C", texto: "100 vezes" },
          { letra: "D", texto: "1.000 vezes" },
          { letra: "E", texto: "10.000 vezes" }
        ],
        gabarito: "E",
        comentario: "A escala de pH é logarítmica de base 10. A diferença de pH entre as soluções é 7 - 3 = 4. Portanto, a concentração de H⁺ é 10⁴ = 10.000 vezes maior na solução de pH 3. Quanto menor o pH, maior a acidez."
      },
      {
        id: "q-006",
        numero: 6,
        disciplina: "Física",
        enunciado: `<p>A 2ª Lei de Newton estabelece a relação entre força resultante, massa e aceleração. Um bloco de 5 kg está sobre uma superfície horizontal sem atrito. Uma força horizontal de 20 N é aplicada sobre ele.</p>`,
        comando: "Qual é a aceleração do bloco?",
        imagem: null,
        opcoes: [
          { letra: "A", texto: "1 m/s²" },
          { letra: "B", texto: "2 m/s²" },
          { letra: "C", texto: "4 m/s²" },
          { letra: "D", texto: "5 m/s²" },
          { letra: "E", texto: "100 m/s²" }
        ],
        gabarito: "C",
        comentario: "Pela 2ª Lei de Newton: F = m × a, logo a = F/m = 20/5 = 4 m/s². Como a superfície é sem atrito, não há força de atrito para reduzir a aceleração."
      },
      {
        id: "q-007",
        numero: 7,
        disciplina: "Biologia",
        enunciado: `<p>A hereditariedade estuda como as características são transmitidas de pais para filhos. Considere um cruzamento entre dois indivíduos <strong>heterozigotos</strong> para a cor de olhos, onde <em>B</em> (olhos castanhos) é dominante sobre <em>b</em> (olhos azuis).</p>`,
        comando: "Qual é a proporção esperada de descendentes com olhos azuis no cruzamento Bb × Bb?",
        imagem: null,
        opcoes: [
          { letra: "A", texto: "0% (nenhum)" },
          { letra: "B", texto: "25%" },
          { letra: "C", texto: "50%" },
          { letra: "D", texto: "75%" },
          { letra: "E", texto: "100%" }
        ],
        gabarito: "B",
        comentario: "No cruzamento Bb × Bb, a Quadro de Punnett gera: BB (25%), Bb (50%) e bb (25%). Os indivíduos com olhos azuis são os homozigotos recessivos (bb), portanto 25% da descendência. Os 75% restantes terão olhos castanhos (BB ou Bb)."
      },
      {
        id: "q-008",
        numero: 8,
        disciplina: "Química",
        enunciado: `<p>As reações químicas podem ser classificadas de diversas formas. A reação representada abaixo:</p>
                    <p style="text-align:center; font-family:monospace; background:#f1f5f9; padding:12px; border-radius:6px; margin:12px 0;">
                      Zn + CuSO₄ → ZnSO₄ + Cu
                    </p>`,
        comando: "Esta reação é classificada como:",
        imagem: null,
        opcoes: [
          { letra: "A", texto: "Síntese ou adição" },
          { letra: "B", texto: "Análise ou decomposição" },
          { letra: "C", texto: "Simples troca ou deslocamento" },
          { letra: "D", texto: "Dupla troca ou metátese" },
          { letra: "E", texto: "Combustão" }
        ],
        gabarito: "C",
        comentario: "A reação Zn + CuSO₄ → ZnSO₄ + Cu é uma reação de simples troca (ou deslocamento simples), pois um elemento simples (Zn) desloca outro elemento (Cu) de um composto (CuSO₄). Isso ocorre porque o zinco é mais reativo que o cobre na série de reatividade dos metais."
      },
      {
        id: "q-009",
        numero: 9,
        disciplina: "Física",
        enunciado: `<p>A Lei de Gravitação Universal de Newton descreve a força de atração entre dois corpos com massas m₁ e m₂ separados por uma distância r:</p>
                    <p style="text-align:center; font-family:monospace; background:#f1f5f9; padding:12px; border-radius:6px; margin:12px 0;">
                      F = G × (m₁ × m₂) / r²
                    </p>
                    <p>Se a distância entre os dois corpos é <strong>dobrada</strong>, mantendo as massas constantes:</p>`,
        comando: "O que acontece com a força gravitacional?",
        imagem: null,
        opcoes: [
          { letra: "A", texto: "A força dobra" },
          { letra: "B", texto: "A força quadruplica" },
          { letra: "C", texto: "A força é reduzida à metade" },
          { letra: "D", texto: "A força é reduzida a um quarto" },
          { letra: "E", texto: "A força permanece a mesma" }
        ],
        gabarito: "D",
        comentario: "Como a distância r aparece elevada ao quadrado no denominador, ao dobrar r, a força é dividida por 2² = 4. Portanto, F' = G×m₁×m₂/(2r)² = G×m₁×m₂/4r² = F/4. A força gravitacional é reduzida a um quarto do valor original."
      },
      {
        id: "q-010",
        numero: 10,
        disciplina: "Biologia",
        enunciado: `<p>O sistema nervoso humano é responsável pela recepção, processamento e resposta a estímulos. Ele é dividido em <strong>Sistema Nervoso Central (SNC)</strong> e <strong>Sistema Nervoso Periférico (SNP)</strong>.</p>`,
        comando: "Sobre os neurônios e o sistema nervoso, assinale a alternativa INCORRETA:",
        imagem: null,
        opcoes: [
          { letra: "A", texto: "O neurônio motor transmite impulsos do SNC para os efetores (músculos e glândulas)." },
          { letra: "B", texto: "A bainha de mielina aumenta a velocidade de condução dos impulsos nervosos." },
          { letra: "C", texto: "Os neurônios sensitivos conduzem impulsos dos receptores sensoriais ao SNC." },
          { letra: "D", texto: "As sinapses são os pontos de contato entre dois neurônios onde ocorre a transmissão do impulso nervoso." },
          { letra: "E", texto: "O cerebelo é responsável pela linguagem e pensamento consciente." }
        ],
        gabarito: "E",
        comentario: "A alternativa E é a incorreta. O cerebelo é responsável pelo equilíbrio, coordenação motora e tônus muscular. A linguagem e o pensamento consciente são funções do córtex cerebral (telencéfalo), especificamente de áreas como a área de Broca (fala) e Wernicke (compreensão)."
      }
    ]
  }
];

// ============================================================
// E-BOOKS DE EXEMPLO
// ============================================================

const EBOOKS_DATA = [
  {
    id: "eb-001",
    titulo: "Biologia Celular e Molecular",
    autor: "Prof. Carlos Mendes",
    turmas: ["EM", "ES"],
    capa: null,
    emoji: "🧬",
    gradiente: "linear-gradient(135deg, #667eea, #764ba2)",
    formato: "PDF",
    tamanho: "4.2 MB",
    paginas: 186,
    descricao: "Guia completo sobre estrutura celular, organelas e processos moleculares.",
    downloadUrl: "#simulado-ebook-download"
  },
  {
    id: "eb-002",
    titulo: "Fundamentos de Química Orgânica",
    autor: "Profa. Ana Lima",
    turmas: ["EM", "ES", "EF"],
    capa: null,
    emoji: "⚗️",
    gradiente: "linear-gradient(135deg, #f093fb, #f5576c)",
    formato: "PDF",
    tamanho: "3.8 MB",
    paginas: 210,
    descricao: "Funções orgânicas, isomeria, reações e exercícios resolvidos.",
    downloadUrl: "#simulado-ebook-download"
  },
  {
    id: "eb-003",
    titulo: "Física: Mecânica e Termodinâmica",
    autor: "Prof. Roberto Alves",
    turmas: ["EM", "ES"],
    capa: null,
    emoji: "⚡",
    gradiente: "linear-gradient(135deg, #4facfe, #00f2fe)",
    formato: "PDF",
    tamanho: "5.1 MB",
    paginas: 248,
    descricao: "Cinemática, dinâmica, leis de Newton, energia e calor.",
    downloadUrl: "#simulado-ebook-download"
  },
  {
    id: "eb-004",
    titulo: "Matemática Básica e Intermediária",
    autor: "Profa. Julia Santos",
    turmas: ["EF", "EM"],
    capa: null,
    emoji: "📐",
    gradiente: "linear-gradient(135deg, #43e97b, #38f9d7)",
    formato: "PDF",
    tamanho: "6.3 MB",
    paginas: 320,
    descricao: "Álgebra, geometria, trigonometria e funções com exercícios.",
    downloadUrl: "#simulado-ebook-download"
  },
  {
    id: "eb-005",
    titulo: "Redação: Do Rascunho à Nota 1000",
    autor: "Profa. Mariana Costa",
    turmas: ["EF", "EM", "ES", "Senior", "Desempregado"],
    capa: null,
    emoji: "✍️",
    gradiente: "linear-gradient(135deg, #fa709a, #fee140)",
    formato: "PDF",
    tamanho: "2.1 MB",
    paginas: 94,
    descricao: "Técnicas de dissertação argumentativa e textos de opinião.",
    downloadUrl: "#simulado-ebook-download"
  },
  {
    id: "eb-006",
    titulo: "História do Brasil: República",
    autor: "Prof. Eduardo Nunes",
    turmas: ["EF", "EM"],
    capa: null,
    emoji: "🏛️",
    gradiente: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
    formato: "PDF",
    tamanho: "3.5 MB",
    paginas: 175,
    descricao: "Era Vargas, ditadura militar, redemocratização e atualidades.",
    downloadUrl: "#simulado-ebook-download"
  }
];

// ============================================================
// USUÁRIOS MOCK
// ============================================================

const ADMIN_USER = {
  id: "admin-001",
  nome: "Administrador",
  email: "admin@obdip.com.br",
  role: "admin",
  avatar: null
};

// ============================================================
// PERSISTÊNCIA COM LOCALSTORAGE
// ============================================================

const Storage = {
  /** Retorna todos os usuários cadastrados */
  getUsers() {
    return JSON.parse(localStorage.getItem("obdip_users") || "[]");
  },

  /** Salva array de usuários */
  saveUsers(users) {
    localStorage.setItem("obdip_users", JSON.stringify(users));
  },

  /** Retorna usuário logado atual */
  getCurrentUser() {
    return JSON.parse(localStorage.getItem("obdip_current_user") || "null");
  },

  /** Define usuário logado */
  setCurrentUser(user) {
    localStorage.setItem("obdip_current_user", JSON.stringify(user));
  },

  /** Remove sessão */
  logout() {
    localStorage.removeItem("obdip_current_user");
  },

  /** Retorna respostas salvas de um simulado */
  getRespostas(simuladoId, userId) {
    const key = `obdip_respostas_${simuladoId}_${userId}`;
    return JSON.parse(localStorage.getItem(key) || "{}");
  },

  /** Salva resposta individual em tempo real */
  saveResposta(simuladoId, userId, questaoId, letra) {
    const key = `obdip_respostas_${simuladoId}_${userId}`;
    const respostas = this.getRespostas(simuladoId, userId);
    respostas[questaoId] = letra;
    localStorage.setItem(key, JSON.stringify(respostas));
  },

  /** Remove respostas de um simulado (ao finalizar) */
  clearRespostas(simuladoId, userId) {
    const key = `obdip_respostas_${simuladoId}_${userId}`;
    localStorage.removeItem(key);
  },

  /** Salva resultado final de um simulado */
  saveResultado(resultado) {
    const key = `obdip_resultado_${resultado.simuladoId}_${resultado.userId}`;
    resultado.dataHora = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(resultado));
    // Adiciona ao histórico geral
    const hist = this.getHistorico(resultado.userId);
    hist.push(resultado);
    localStorage.setItem(`obdip_historico_${resultado.userId}`, JSON.stringify(hist));
  },

  /** Retorna resultado de um simulado */
  getResultado(simuladoId, userId) {
    const key = `obdip_resultado_${simuladoId}_${userId}`;
    return JSON.parse(localStorage.getItem(key) || "null");
  },

  /** Retorna histórico de simulados do usuário */
  getHistorico(userId) {
    return JSON.parse(localStorage.getItem(`obdip_historico_${userId}`) || "[]");
  },

  /** Retorna respostas marcadas para revisão */
  getMarcadas(simuladoId, userId) {
    const key = `obdip_marcadas_${simuladoId}_${userId}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  },

  /** Alterna marcação de revisão */
  toggleMarcada(simuladoId, userId, questaoId) {
    const marcadas = this.getMarcadas(simuladoId, userId);
    const idx = marcadas.indexOf(questaoId);
    if (idx === -1) marcadas.push(questaoId);
    else marcadas.splice(idx, 1);
    localStorage.setItem(`obdip_marcadas_${simuladoId}_${userId}`, JSON.stringify(marcadas));
    return marcadas.includes(questaoId); // false = desmarcada, true = marcada
  },

  /** Remove todas as marcacoes de revisao do simulado */
  clearMarcadas(simuladoId, userId) {
    localStorage.removeItem(`obdip_marcadas_${simuladoId}_${userId}`);
  },

  /** Retorna ranking de um simulado */
  getRanking(simuladoId) {
    const users = this.getUsers();
    const ranking = [];
    users.forEach(u => {
      const r = this.getResultado(simuladoId, u.id);
      if (r) ranking.push({ userId: u.id, usuario: u.nome, pontuacao: r.pontuacao, percentual: r.percentual, dataHora: r.dataHora });
    });
    // Ordena por percentual decrescente, desempate por data (mais cedo primeiro)
    return ranking.sort((a, b) =>
      b.percentual - a.percentual || new Date(a.dataHora) - new Date(b.dataHora)
    );
  }
};

// ============================================================
// HELPERS DE ACESSO AOS DADOS
// ============================================================

/**
 * Retorna o simulado pelo ID
 * @param {string} id
 * @returns {Object|null}
 */
function getSimuladoById(id) {
  return SIMULADOS_DATA.find(s => s.id === id) || null;
}

/**
 * Retorna simulados disponíveis para a turma do usuário
 * @param {string} turma — ex: "EM", "EF", "ES", "Senior", "Desempregado"
 * @returns {Array}
 */
function getSimuladosByTurma(turma) {
  const turmaAliases = turma === "NemNem"
    ? ["NemNem", "Desempregado"]
    : turma === "Desempregado"
      ? ["Desempregado", "NemNem"]
      : [turma];
  return SIMULADOS_DATA.filter(
    s => s.status === "publicado" && (turmaAliases.some((alias) => s.turmas.includes(alias)) || s.turmas.includes("Todos"))
  );
}

/**
 * Retorna e-books disponíveis para a turma do usuário
 * @param {string} turma
 * @returns {Array}
 */
function getEbooksByTurma(turma) {
  const turmaAliases = turma === "NemNem"
    ? ["NemNem", "Desempregado"]
    : turma === "Desempregado"
      ? ["Desempregado", "NemNem"]
      : [turma];
  return EBOOKS_DATA.filter(e => turmaAliases.some((alias) => e.turmas.includes(alias)) || e.turmas.includes("Todos"));
}

/**
 * Calcula o resultado do simulado dado o mapa de respostas
 * @param {Object} simulado — objeto completo do simulado
 * @param {Object} respostas — { questaoId: "A" | "B" | ... }
 * @returns {Object} resultado com pontuação, percentual e detalhes por questão
 */
function calcularResultado(simulado, respostas) {
  let acertos = 0;
  const detalhes = simulado.questoes.map(q => {
    const escolha = respostas[q.id] || null;
    const acertou = escolha === q.gabarito;
    if (acertou) acertos++;
    return {
      questaoId:   q.id,
      numero:      q.numero,
      escolha,
      gabarito:    q.gabarito,
      acertou,
      enunciado:   q.enunciado,
      disciplina:  q.disciplina,
      comentario:  q.comentario,
      opcoes:      q.opcoes
    };
  });

  const total     = simulado.questoes.length;
  const erros     = total - acertos - simulado.questoes.filter(q => !respostas[q.id]).length;
  const brancos   = simulado.questoes.filter(q => !respostas[q.id]).length;
  const percentual = Math.round((acertos / total) * 100);

  return {
    simuladoId: simulado.id,
    simuladoNome: simulado.nome,
    total,
    acertos,
    erros,
    brancos,
    percentual,
    pontuacao: acertos,
    detalhes
  };
}

// Inicializa dados de demonstração se localStorage estiver vazio
(function initDemoData() {
  if (!Storage.getUsers().length) {
    const demoUsers = [
      {
        id: "user-001",
        nome: "Maria Silva",
        email: "maria@demo.com",
        senha: "demo123",
        escola: "Escola Estadual Dom Pedro II",
        serie: "EM",
        menor: false,
        role: "aluno",
        status: "ativo",
        criadoEm: "2025-08-01T00:00:00Z"
      },
      {
        id: "user-002",
        nome: "João Souza",
        email: "joao@demo.com",
        senha: "demo123",
        escola: "Colégio Municipal",
        serie: "EF",
        menor: true,
        role: "aluno",
        status: "ativo",
        criadoEm: "2025-08-05T00:00:00Z"
      }
    ];
    Storage.saveUsers(demoUsers);
  }
})();

export {
  SIMULADOS_DATA,
  EBOOKS_DATA,
  ADMIN_USER,
  Storage,
  getSimuladoById,
  getSimuladosByTurma,
  getEbooksByTurma,
  calcularResultado
};
