// O conteúdo do site: uma página de manual (man page) por assunto, nas duas línguas.
// Mudou uma língua, mude a outra.
//
// Marcação dentro dos textos (lida por components/Texto.tsx):
//   **negrito**          nomes, como num man page
//   ~sublinhado~         argumentos e opções
//   [texto](endereço)    link
//   @{endereço}          link entre < >, a convenção dos manuais
//   @{endereço|texto}    o mesmo, mostrando outro texto
//   {pagina(1)}          referência a outra página: vira link quando ela existe aqui

export type Idioma = "pt" | "en";

export type Bloco =
  | { tipo: "texto"; texto: string }
  | { tipo: "item"; rotulo: string; texto: string }
  | { tipo: "campos"; linhas: [string, string][] }
  | { tipo: "sinopse"; linhas: string[] }
  // um comando da seção EXEMPLOS; o prompt do q executa os mesmos comandos
  | { tipo: "exemplo"; comando: string; texto: string; abre?: string };

export type Secao = { titulo: string; blocos: Bloco[] };

export type Pagina = {
  slug: string;
  titulo: string;
  descricao: string;
  secoes: Secao[];
};

// Um projeto é escrito uma vez só, nas duas línguas. A linha dele na SINOPSE, o item em
// COMANDOS e o VEJA TAMBÉM das outras páginas saem desta lista: para acrescentar um
// projeto, ponha o nome aqui e escreva a página dele em projetosPt e projetosEn (o
// TypeScript não compila sem as duas).
export const PROJETOS = ["kayo-ozamigos", "kayo-finalizadoras", "kayo-acelerato"] as const;
export type Projeto = (typeof PROJETOS)[number];

export const PAGINAS = ["kayo", ...PROJETOS] as const;
export type Slug = (typeof PAGINAS)[number];

// "resumo" é a explicação do projeto em COMANDOS, na página principal.
type PaginaDeProjeto = Pagina & { resumo: string };

export const EMAIL = "kalinauskas@live.com";
export const GITHUB = "https://github.com/kayokalinauskas";
export const LINKEDIN = "https://www.linkedin.com/in/kayokalinauskas";
const OZAMIGOS_WEB = "https://ozamigos.onrender.com/";
const OZAMIGOS_WINDOWS = `${GITHUB}/ozamigos/releases/latest`;
const OZAMIGOS_SITE = "https://kayokalinauskas.github.io/ozamigos/";
const FINALIZADORAS_WEB = "https://kayokalinauskas.github.io/bluesoft-subfinalizadora/";
const WEB_STORE = "https://chromewebstore.google.com/detail/acelerato-helper/lanlcaoldikialljjdbngbpelggnjmab";

// "kayo {ozamigos | finalizadoras | acelerato}", com cada nome levando à página
function sinopseDosProjetos(idioma: Idioma) {
  const nomes = PROJETOS.map((p) => `[${p.slice("kayo-".length)}](${caminho(idioma, p)})`);
  return `**kayo** {${nomes.join(" | ")}}`;
}

// As competências, escritas como as opções do comando kayo. Cada uma aparece em OPÇÕES,
// na SINOPSE (com o link para a explicação) e no prompt do q (kayo --sql mostra o texto).
export type Opcao = { flags: string[]; texto: string };

export const OPCOES: Record<Idioma, Opcao[]> = {
  pt: [
    { flags: ["--java", "--spring-boot"], texto: "APIs REST e WebSocket, JPA/Hibernate e Maven; testes com JUnit e AssertJ." },
    { flags: ["--react", "--typescript"], texto: "React, Next.js, Angular e Vite; testes com Vitest, Jest e Playwright." },
    { flags: ["--sql"], texto: "PostgreSQL e Oracle; consultas para investigar incidentes em produção." },
    { flags: ["--integracoes"], texto: "REST e SOAP, OAuth 2.0, JWT e webhooks; onboarding técnico de parceiros." },
  ],
  en: [
    {
      flags: ["--java", "--spring-boot"],
      texto: "REST and WebSocket APIs, JPA/Hibernate and Maven; tests with JUnit and AssertJ.",
    },
    { flags: ["--react", "--typescript"], texto: "React, Next.js, Angular and Vite; tests with Vitest, Jest and Playwright." },
    { flags: ["--sql"], texto: "PostgreSQL and Oracle; queries to investigate production incidents." },
    { flags: ["--integrations"], texto: "REST and SOAP, OAuth 2.0, JWT and webhooks; partner technical onboarding." },
  ],
};

function itensDasOpcoes(opcoes: Opcao[]): Bloco[] {
  return opcoes.map(({ flags, texto }) => ({ tipo: "item", rotulo: flags.map((f) => `**${f}**`).join(", "), texto }));
}

// "kayo [--java] [--spring-boot] …", cada opção levando à seção OPÇÕES ("#opcoes")
function sinopseDasOpcoes(opcoes: Opcao[], secao: string) {
  return `**kayo** ${opcoes.flatMap((o) => o.flags.map((f) => `[[${f}](#${secao})]`)).join(" ")}`;
}

function comandos(projetos: Record<Projeto, PaginaDeProjeto>): Bloco[] {
  return PROJETOS.map((p) => ({ tipo: "item", rotulo: `{${p}(1)}`, texto: projetos[p].resumo }));
}

// O VEJA TAMBÉM de cada projeto: a página principal e os outros projetos.
function comVejaTambem(projetos: Record<Projeto, PaginaDeProjeto>, titulo: string) {
  return Object.fromEntries(
    PROJETOS.map((p) => {
      const outras = ["kayo", ...PROJETOS.filter((x) => x !== p)].map((x) => `{${x}(1)}`).join(", ");
      const { slug, titulo: tituloDaPagina, descricao, secoes } = projetos[p];
      const vejaTambem: Secao = { titulo, blocos: [{ tipo: "texto", texto: outras }] };
      return [p, { slug, titulo: tituloDaPagina, descricao, secoes: [...secoes, vejaTambem] }];
    }),
  ) as Record<Projeto, Pagina>;
}

export const CURRICULO: Record<Idioma, { arquivo: string; url: string }> = {
  pt: { arquivo: "curriculo.pdf", url: "/curriculo.pdf" },
  en: { arquivo: "resume.pdf", url: "/resume.pdf" },
};

const projetosPt: Record<Projeto, PaginaDeProjeto> = {
  "kayo-ozamigos": {
    slug: "kayo-ozamigos",
    resumo:
      "Transmissão de tela de jogos entre amigos, com voz e chat. Vídeo P2P via WebRTC, servidor em Spring Boot, app em Electron e captura nativa em C#.",
    titulo: "Ozamigos: transmissão de tela entre amigos · kayo-ozamigos(1)",
    descricao:
      "Ozamigos: transmissão de tela de jogos entre amigos, com voz e chat. WebRTC peer-to-peer, Spring Boot, React, Electron e captura nativa em C#.",
    secoes: [
      {
        titulo: "NOME",
        blocos: [{ tipo: "texto", texto: "**kayo-ozamigos** - transmissão de tela de jogos entre amigos, com voz e chat" }],
      },
      {
        titulo: "SINOPSE",
        blocos: [
          { tipo: "sinopse", linhas: [`**kayo ozamigos** [[--web](${OZAMIGOS_WEB}) | [--windows](${OZAMIGOS_WINDOWS})]`] },
        ],
      },
      {
        titulo: "DESCRIÇÃO",
        blocos: [
          {
            tipo: "texto",
            texto:
              "Projeto pessoal e open source. Transmite a tela de um PC direto para os amigos, sem servidor de mídia no meio, com voz, chat e salas protegidas por senha. Tem app para Windows e versão web.",
          },
        ],
      },
      {
        titulo: "EXEMPLOS",
        blocos: [
          {
            tipo: "exemplo",
            comando: "kayo ozamigos",
            texto: "Abre o site do Ozamigos, com as telas e o que o app faz.",
            abre: OZAMIGOS_SITE,
          },
          {
            tipo: "exemplo",
            comando: "kayo ozamigos --web",
            texto: "Abre a versão no navegador: crie um grupo com nome e senha e transmita a tela para quem entrar nele.",
            abre: OZAMIGOS_WEB,
          },
          {
            tipo: "exemplo",
            comando: "kayo ozamigos --windows",
            texto: "Baixa o instalador do app para Windows, com a captura de tela própria e o som do PC sem eco.",
            abre: OZAMIGOS_WINDOWS,
          },
        ],
      },
      {
        titulo: "ARQUITETURA",
        blocos: [
          {
            tipo: "campos",
            linhas: [
              ["**backend**", "Java 25 e Spring Boot 4.1. Salas e signaling por WebSocket; o servidor nunca recebe vídeo."],
              ["**frontend**", "React 19, TypeScript e Vite."],
              [
                "**vídeo**",
                "WebRTC peer-to-peer. H.265 codificado na GPU, com fallback para H.264 quando um dos lados não suporta.",
              ],
              ["**voz**", "Opus, com redução de ruído por RNNoise (WebAssembly) num AudioWorklet."],
              [
                "**desktop**",
                "Electron 44 e dois módulos nativos em C# (.NET 10): captura de tela pelo Windows Graphics Capture com Direct3D 11, e captura do áudio de cada processo.",
              ],
            ],
          },
        ],
      },
      {
        titulo: "DECISÕES",
        blocos: [
          {
            tipo: "item",
            rotulo: "**Vídeo direto entre os PCs**",
            texto:
              "O servidor só coordena as conexões. Sem tráfego de mídia, ele roda em um plano gratuito e não vira gargalo quando mais gente transmite.",
          },
          {
            tipo: "item",
            rotulo: "**Captura de tela própria**",
            texto:
              "A captura do navegador limitava o FPS em jogos pesados. O módulo em C# captura pela GPU e envia os quadros ao Electron por um canal dedicado, com controle de fluxo.",
          },
          {
            tipo: "item",
            rotulo: "**Medir antes de mudar**",
            texto: "Métricas do WebRTC a cada segundo e benchmarks reproduzíveis guiaram as mudanças de captura, codec e rede.",
          },
        ],
      },
      {
        titulo: "SEGURANÇA",
        blocos: [
          {
            tipo: "texto",
            texto:
              "Hash de senhas com PBKDF2 e salt; rate limiting por IP; preview de links só de domínios de uma allowlist, contra SSRF; Electron com contextIsolation e sandbox.",
          },
        ],
      },
      {
        titulo: "TESTES",
        blocos: [
          {
            tipo: "texto",
            texto:
              "Cinco camadas no GitHub Actions a cada push: backend (JUnit), frontend (Vitest), áudio, E2E (Playwright) e app. Os releases saem por pipeline de CI/CD, com auto-update do instalador.",
          },
        ],
      },
      { titulo: "SITE", blocos: [{ tipo: "texto", texto: `@{${OZAMIGOS_SITE}}` }] },
      { titulo: "REPOSITÓRIO", blocos: [{ tipo: "texto", texto: `@{${GITHUB}/ozamigos}` }] },
    ],
  },

  "kayo-finalizadoras": {
    slug: "kayo-finalizadoras",
    resumo:
      "Ferramenta interna da Bluesoft: mapeamentos em lote pela API REST do ERP, com as planilhas processadas num Web Worker.",
    titulo: "Mapeamento de Finalizadoras pela API do ERP Bluesoft · kayo-finalizadoras(1)",
    descricao: "Mapeamento de Finalizadoras: ferramenta interna da Bluesoft para mapeamentos em lote pela API REST do ERP.",
    secoes: [
      {
        titulo: "NOME",
        blocos: [
          { tipo: "texto", texto: "**kayo-finalizadoras** - mapeamento de subfinalizadoras em lote pela API do ERP Bluesoft" },
        ],
      },
      {
        titulo: "SINOPSE",
        blocos: [
          {
            tipo: "sinopse",
            linhas: [`**kayo finalizadoras** [[--web](${FINALIZADORAS_WEB})] [~planilha.xlsx~ | ~planilha.csv~]`],
          },
        ],
      },
      {
        titulo: "DESCRIÇÃO",
        blocos: [
          {
            tipo: "texto",
            texto:
              "Ferramenta interna da Bluesoft. O time de implantação passou a fazer os mapeamentos sozinho, em lote, pela API REST do ERP, sem abrir pedido na fila de outra equipe.",
          },
        ],
      },
      {
        titulo: "EXEMPLOS",
        blocos: [
          {
            tipo: "exemplo",
            comando: "kayo finalizadoras --web",
            texto: "Abre a ferramenta, publicada no GitHub Pages.",
            abre: FINALIZADORAS_WEB,
          },
          {
            tipo: "exemplo",
            comando: "kayo finalizadoras planilha.xlsx",
            texto: "Lê a planilha num Web Worker, aponta as linhas inválidas e mostra um preview antes do envio.",
          },
        ],
      },
      {
        titulo: "FUNCIONAMENTO",
        blocos: [
          {
            tipo: "campos",
            linhas: [
              ["**entrada**", "Planilhas .xlsx, .xls e .csv, com preview antes do envio."],
              ["**validação**", "Linhas inválidas são apontadas antes do envio, não durante."],
              ["**envio**", "Progresso linha a linha e relatório de erros exportável em CSV."],
              ["**histórico**", "Os envios ficam guardados no navegador entre as sessões."],
            ],
          },
        ],
      },
      {
        titulo: "ARQUITETURA",
        blocos: [
          {
            tipo: "texto",
            texto:
              "JavaScript modular, sem framework, com Vite e Tailwind CSS. As planilhas são lidas pelo SheetJS e pelo PapaParse num Web Worker, sem travar a interface. As chamadas passam por um proxy de CORS numa função serverless; o site é publicado no GitHub Pages.",
          },
        ],
      },
      { titulo: "REPOSITÓRIO", blocos: [{ tipo: "texto", texto: `@{${GITHUB}/bluesoft-subfinalizadora}` }] },
    ],
  },

  "kayo-acelerato": {
    slug: "kayo-acelerato",
    resumo: "Extensão do Chrome (Manifest V3) usada no atendimento da Bluesoft, com mais de 60 usuários.",
    titulo: "Acelerato Helper, extensão do Chrome · kayo-acelerato(1)",
    descricao:
      "Acelerato Helper: extensão do Chrome usada por mais de 60 pessoas no atendimento da Bluesoft. Abre um chamado pelo número e evita perder comentários.",
    secoes: [
      {
        titulo: "NOME",
        blocos: [{ tipo: "texto", texto: "**kayo-acelerato** - extensão do Chrome para o atendimento no Acelerato" }],
      },
      { titulo: "SINOPSE", blocos: [{ tipo: "sinopse", linhas: ["**kayo acelerato** [~numero-do-chamado~]"] }] },
      {
        titulo: "DESCRIÇÃO",
        blocos: [
          {
            tipo: "texto",
            texto:
              "Extensão publicada na Chrome Web Store e usada pela equipe de atendimento da Bluesoft, com mais de 60 usuários. Reduz o tempo de navegação entre chamados e evita a perda de comentários.",
          },
        ],
      },
      {
        titulo: "EXEMPLOS",
        blocos: [
          { tipo: "exemplo", comando: "kayo acelerato", texto: "Instala a extensão pela Chrome Web Store.", abre: WEB_STORE },
          {
            tipo: "exemplo",
            comando: "kayo acelerato 4821",
            texto: "Com a extensão aberta, o número do chamado e Enter abrem a página dele direto.",
          },
        ],
      },
      {
        titulo: "RECURSOS",
        blocos: [
          {
            tipo: "campos",
            linhas: [
              ["**chamados**", "O número do chamado e Enter abrem a página dele direto."],
              ["**atalho**", "Um atalho de teclado abre a extensão sem tirar a pessoa do fluxo."],
              ["**proteção**", "Pede confirmação antes de sair de uma página com o editor de comentário aberto."],
              ["**etiquetas**", "Destaca as etiquetas que a equipe precisa localizar rápido."],
            ],
          },
        ],
      },
      {
        titulo: "ARQUITETURA",
        blocos: [{ tipo: "texto", texto: "Manifest V3, JavaScript sem dependências, apenas com as APIs nativas do navegador." }],
      },
      {
        titulo: "REPOSITÓRIO",
        blocos: [
          { tipo: "texto", texto: `@{${GITHUB}/acelerato-extension}` },
          { tipo: "texto", texto: `@{${WEB_STORE}|Chrome Web Store}` },
        ],
      },
    ],
  },
};

const kayoPt: Pagina = {
  slug: "kayo",
  titulo: "Kayo Kalinauskas, desenvolvedor full stack · kayo(1)",
  descricao:
    "Kayo Kalinauskas, desenvolvedor full stack com Java, Spring Boot, React e TypeScript, e dez anos de experiência em ERP e integrações de APIs.",
  secoes: [
    { titulo: "NOME", blocos: [{ tipo: "texto", texto: "**kayo** - Kayo Kalinauskas, desenvolvedor full stack" }] },
    {
      titulo: "SINOPSE",
      blocos: [
        {
          tipo: "sinopse",
          linhas: [
            sinopseDosProjetos("pt"),
            sinopseDasOpcoes(OPCOES.pt, "opcoes"),
            `**kayo** {[--curriculo](/curriculo.pdf) | [--email](mailto:${EMAIL}) | [--github](${GITHUB}) | [--linkedin](${LINKEDIN})}`,
          ],
        },
      ],
    },
    {
      titulo: "DESCRIÇÃO",
      blocos: [
        {
          tipo: "texto",
          texto:
            "Desenvolvedor full stack com Java, Spring Boot, React e TypeScript, e dez anos de experiência em ERP, suporte e integrações de APIs. Atualmente acompanha projetos de integração na Bluesoft e desenvolve projetos próprios de ponta a ponta.",
        },
        { tipo: "texto", texto: "Português nativo, inglês avançado. Fuso de São Paulo (UTC-3)." },
      ],
    },
    { titulo: "COMANDOS", blocos: comandos(projetosPt) },
    { titulo: "OPÇÕES", blocos: itensDasOpcoes(OPCOES.pt) },
    {
      titulo: "HISTÓRICO",
      blocos: [
        {
          tipo: "campos",
          linhas: [
            [
              "**2023-atual**",
              "Analista de Suporte de API e Integrações, Bluesoft. Integrações com parceiros, do kick-off ao pós-release, e investigação de incidentes nas APIs do ERP.",
            ],
            [
              "**2021-2023**",
              "Desenvolvedor Full Stack, OCTO. React, Redux, Angular, C# e ASP.NET em um ERP com mais de 30 clientes.",
            ],
            ["**2020-2021**", "Líder de Suporte Técnico, OCTO."],
            ["**2015-2019**", "Analista de Suporte Técnico, Hipertec Sistemas."],
          ],
        },
      ],
    },
    {
      titulo: "FORMAÇÃO",
      blocos: [
        {
          tipo: "texto",
          texto: "Bacharelado em Ciência da Computação, Universidade Anhembi Morumbi, conclusão prevista em 2027.",
        },
        { tipo: "texto", texto: "Cursos: Java Programming (Universidade de Helsinque), Ignite (Rocketseat) e CS50 (Harvard)." },
      ],
    },
    {
      titulo: "AUTOR",
      blocos: [
        { tipo: "texto", texto: "Kayo Kalinauskas." },
        {
          tipo: "campos",
          linhas: [
            ["e-mail", `@{mailto:${EMAIL}|${EMAIL}}`],
            ["GitHub", `@{${GITHUB}|github.com/kayokalinauskas}`],
            ["LinkedIn", `@{${LINKEDIN}|linkedin.com/in/kayokalinauskas}`],
            ["currículo", "@{/curriculo.pdf|kalinauskas.dev/curriculo.pdf}"],
          ],
        },
      ],
    },
  ],
};

const projetosEn: Record<Projeto, PaginaDeProjeto> = {
  "kayo-ozamigos": {
    slug: "kayo-ozamigos",
    resumo:
      "Game screen sharing between friends, with voice and chat. P2P video over WebRTC, a Spring Boot server, an Electron app and native capture in C#.",
    titulo: "Ozamigos: screen sharing between friends · kayo-ozamigos(1)",
    descricao:
      "Ozamigos: game screen sharing between friends, with voice and chat. Peer-to-peer WebRTC, Spring Boot, React, Electron and native capture in C#.",
    secoes: [
      {
        titulo: "NAME",
        blocos: [{ tipo: "texto", texto: "**kayo-ozamigos** - game screen sharing between friends, with voice and chat" }],
      },
      {
        titulo: "SYNOPSIS",
        blocos: [
          { tipo: "sinopse", linhas: [`**kayo ozamigos** [[--web](${OZAMIGOS_WEB}) | [--windows](${OZAMIGOS_WINDOWS})]`] },
        ],
      },
      {
        titulo: "DESCRIPTION",
        blocos: [
          {
            tipo: "texto",
            texto:
              "Open source personal project. Streams a PC screen straight to friends, with no media server in between, plus voice, chat and password-protected rooms. Available as a Windows app and on the web.",
          },
        ],
      },
      {
        titulo: "EXAMPLES",
        blocos: [
          {
            tipo: "exemplo",
            comando: "kayo ozamigos",
            texto: "Opens the Ozamigos website, with screenshots and what the app does.",
            abre: OZAMIGOS_SITE,
          },
          {
            tipo: "exemplo",
            comando: "kayo ozamigos --web",
            texto:
              "Opens the browser version: create a group with a name and password and stream your screen to whoever joins it.",
            abre: OZAMIGOS_WEB,
          },
          {
            tipo: "exemplo",
            comando: "kayo ozamigos --windows",
            texto: "Downloads the Windows app installer, with its own screen capture and PC audio without echo.",
            abre: OZAMIGOS_WINDOWS,
          },
        ],
      },
      {
        titulo: "ARCHITECTURE",
        blocos: [
          {
            tipo: "campos",
            linhas: [
              [
                "**backend**",
                "Java 25 and Spring Boot 4.1. Rooms and signaling over WebSocket; the server never receives video.",
              ],
              ["**frontend**", "React 19, TypeScript and Vite."],
              ["**video**", "Peer-to-peer WebRTC. H.265 encoded on the GPU, falling back to H.264 when one side lacks support."],
              ["**voice**", "Opus, with RNNoise noise suppression (WebAssembly) in an AudioWorklet."],
              [
                "**desktop**",
                "Electron 44 and two native C# modules (.NET 10): screen capture through Windows Graphics Capture with Direct3D 11, and per-process audio capture.",
              ],
            ],
          },
        ],
      },
      {
        titulo: "DECISIONS",
        blocos: [
          {
            tipo: "item",
            rotulo: "**Video straight between PCs**",
            texto:
              "The server only coordinates connections. With no media traffic, it runs on a free plan and does not become a bottleneck as more people stream.",
          },
          {
            tipo: "item",
            rotulo: "**Custom screen capture**",
            texto:
              "The browser capture capped the frame rate in heavy games. The C# module captures on the GPU and sends frames to Electron through a dedicated channel with flow control.",
          },
          {
            tipo: "item",
            rotulo: "**Measure before changing**",
            texto: "Per-second WebRTC metrics and reproducible benchmarks guided the changes to capture, codec and network.",
          },
        ],
      },
      {
        titulo: "SECURITY",
        blocos: [
          {
            tipo: "texto",
            texto:
              "Password hashing with PBKDF2 and salt; per-IP rate limiting; link previews only from an allowlist of domains, against SSRF; Electron with contextIsolation and sandbox.",
          },
        ],
      },
      {
        titulo: "TESTING",
        blocos: [
          {
            tipo: "texto",
            texto:
              "Five layers on GitHub Actions on every push: backend (JUnit), frontend (Vitest), audio, E2E (Playwright) and app. Releases ship through a CI/CD pipeline, with installer auto-updates.",
          },
        ],
      },
      { titulo: "WEBSITE", blocos: [{ tipo: "texto", texto: `@{${OZAMIGOS_SITE}}` }] },
      { titulo: "REPOSITORY", blocos: [{ tipo: "texto", texto: `@{${GITHUB}/ozamigos}` }] },
    ],
  },

  "kayo-finalizadoras": {
    slug: "kayo-finalizadoras",
    resumo: "Internal tool at Bluesoft: bulk mappings through the ERP REST API, with spreadsheets parsed in a Web Worker.",
    titulo: "Payment method mapping through the Bluesoft ERP API · kayo-finalizadoras(1)",
    descricao: "Payment method mapping: an internal Bluesoft tool for bulk mappings through the ERP REST API.",
    secoes: [
      {
        titulo: "NAME",
        blocos: [{ tipo: "texto", texto: "**kayo-finalizadoras** - bulk payment method mapping through the Bluesoft ERP API" }],
      },
      {
        titulo: "SYNOPSIS",
        blocos: [
          { tipo: "sinopse", linhas: [`**kayo finalizadoras** [[--web](${FINALIZADORAS_WEB})] [~sheet.xlsx~ | ~sheet.csv~]`] },
        ],
      },
      {
        titulo: "DESCRIPTION",
        blocos: [
          {
            tipo: "texto",
            texto:
              "Internal tool at Bluesoft. The implementation team now runs the mappings on their own, in bulk, through the ERP REST API, without filing a request in another team's queue.",
          },
        ],
      },
      {
        titulo: "EXAMPLES",
        blocos: [
          {
            tipo: "exemplo",
            comando: "kayo finalizadoras --web",
            texto: "Opens the tool, published on GitHub Pages.",
            abre: FINALIZADORAS_WEB,
          },
          {
            tipo: "exemplo",
            comando: "kayo finalizadoras sheet.xlsx",
            texto: "Parses the spreadsheet in a Web Worker, flags invalid rows and shows a preview before sending.",
          },
        ],
      },
      {
        titulo: "OPERATION",
        blocos: [
          {
            tipo: "campos",
            linhas: [
              ["**input**", ".xlsx, .xls and .csv spreadsheets, with a preview before sending."],
              ["**validation**", "Invalid rows are flagged before sending, not during."],
              ["**sending**", "Row-by-row progress and an error report exportable as CSV."],
              ["**history**", "Past runs are kept in the browser between sessions."],
            ],
          },
        ],
      },
      {
        titulo: "ARCHITECTURE",
        blocos: [
          {
            tipo: "texto",
            texto:
              "Modular JavaScript with no framework, built with Vite and Tailwind CSS. Spreadsheets are parsed by SheetJS and PapaParse in a Web Worker, so the interface never freezes. Requests go through a CORS proxy in a serverless function; the site is published on GitHub Pages.",
          },
        ],
      },
      { titulo: "REPOSITORY", blocos: [{ tipo: "texto", texto: `@{${GITHUB}/bluesoft-subfinalizadora}` }] },
    ],
  },

  "kayo-acelerato": {
    slug: "kayo-acelerato",
    resumo: "Chrome extension (Manifest V3) used by the Bluesoft support team, with 60+ users.",
    titulo: "Acelerato Helper, a Chrome extension · kayo-acelerato(1)",
    descricao:
      "Acelerato Helper: a Chrome extension used by 60+ people on the Bluesoft support team. It opens a ticket by its number and prevents lost comments.",
    secoes: [
      {
        titulo: "NAME",
        blocos: [{ tipo: "texto", texto: "**kayo-acelerato** - Chrome extension for support work in Acelerato" }],
      },
      { titulo: "SYNOPSIS", blocos: [{ tipo: "sinopse", linhas: ["**kayo acelerato** [~ticket-number~]"] }] },
      {
        titulo: "DESCRIPTION",
        blocos: [
          {
            tipo: "texto",
            texto:
              "Extension published on the Chrome Web Store and used by the Bluesoft support team, with 60+ users. It cuts the time spent moving between tickets and prevents lost comments.",
          },
        ],
      },
      {
        titulo: "EXAMPLES",
        blocos: [
          {
            tipo: "exemplo",
            comando: "kayo acelerato",
            texto: "Installs the extension from the Chrome Web Store.",
            abre: WEB_STORE,
          },
          {
            tipo: "exemplo",
            comando: "kayo acelerato 4821",
            texto: "With the extension open, a ticket number and Enter open that ticket directly.",
          },
        ],
      },
      {
        titulo: "FEATURES",
        blocos: [
          {
            tipo: "campos",
            linhas: [
              ["**tickets**", "Type a ticket number and press Enter to open it directly."],
              ["**shortcut**", "A keyboard shortcut opens the extension without breaking the flow."],
              ["**protection**", "Asks for confirmation before leaving a page with the comment editor open."],
              ["**labels**", "Highlights the labels the team needs to find quickly."],
            ],
          },
        ],
      },
      {
        titulo: "ARCHITECTURE",
        blocos: [{ tipo: "texto", texto: "Manifest V3, dependency-free JavaScript, using only native browser APIs." }],
      },
      {
        titulo: "REPOSITORY",
        blocos: [
          { tipo: "texto", texto: `@{${GITHUB}/acelerato-extension}` },
          { tipo: "texto", texto: `@{${WEB_STORE}|Chrome Web Store}` },
        ],
      },
    ],
  },
};

const kayoEn: Pagina = {
  slug: "kayo",
  titulo: "Kayo Kalinauskas, full stack developer · kayo(1)",
  descricao:
    "Kayo Kalinauskas, full stack developer working with Java, Spring Boot, React and TypeScript, with ten years of experience in ERP systems and API integrations.",
  secoes: [
    { titulo: "NAME", blocos: [{ tipo: "texto", texto: "**kayo** - Kayo Kalinauskas, full stack developer" }] },
    {
      titulo: "SYNOPSIS",
      blocos: [
        {
          tipo: "sinopse",
          linhas: [
            sinopseDosProjetos("en"),
            sinopseDasOpcoes(OPCOES.en, "options"),
            `**kayo** {[--resume](/resume.pdf) | [--email](mailto:${EMAIL}) | [--github](${GITHUB}) | [--linkedin](${LINKEDIN})}`,
          ],
        },
      ],
    },
    {
      titulo: "DESCRIPTION",
      blocos: [
        {
          tipo: "texto",
          texto:
            "Full stack developer working with Java, Spring Boot, React and TypeScript, with ten years of experience in ERP systems, support and API integrations. Currently supports integration projects at Bluesoft and builds personal projects end to end.",
        },
        { tipo: "texto", texto: "Native Portuguese, advanced English. São Paulo time zone (UTC-3)." },
      ],
    },
    { titulo: "COMMANDS", blocos: comandos(projetosEn) },
    { titulo: "OPTIONS", blocos: itensDasOpcoes(OPCOES.en) },
    {
      titulo: "HISTORY",
      blocos: [
        {
          tipo: "campos",
          linhas: [
            [
              "**2023-present**",
              "API and Integrations Support Analyst, Bluesoft. Partner integrations from kick-off to post-release, and incident investigation in the ERP APIs.",
            ],
            ["**2021-2023**", "Full Stack Developer, OCTO. React, Redux, Angular, C# and ASP.NET on an ERP with 30+ clients."],
            ["**2020-2021**", "Technical Support Lead, OCTO."],
            ["**2015-2019**", "Technical Support Analyst, Hipertec Sistemas."],
          ],
        },
      ],
    },
    {
      titulo: "EDUCATION",
      blocos: [
        {
          tipo: "texto",
          texto: "B.S. in Computer Science, Anhembi Morumbi University, expected 2027.",
        },
        { tipo: "texto", texto: "Courses: Java Programming (University of Helsinki), Ignite (Rocketseat) and CS50 (Harvard)." },
      ],
    },
    {
      titulo: "AUTHOR",
      blocos: [
        { tipo: "texto", texto: "Kayo Kalinauskas." },
        {
          tipo: "campos",
          linhas: [
            ["email", `@{mailto:${EMAIL}|${EMAIL}}`],
            ["GitHub", `@{${GITHUB}|github.com/kayokalinauskas}`],
            ["LinkedIn", `@{${LINKEDIN}|linkedin.com/in/kayokalinauskas}`],
            ["resume", "@{/resume.pdf|kalinauskas.dev/resume.pdf}"],
          ],
        },
      ],
    },
  ],
};

export const MANUAL: Record<Idioma, Record<Slug, Pagina>> = {
  pt: { kayo: kayoPt, ...comVejaTambem(projetosPt, "VEJA TAMBÉM") },
  en: { kayo: kayoEn, ...comVejaTambem(projetosEn, "SEE ALSO") },
};

// Os textos da própria sessão de terminal (barra do less, ajuda, prompt).
export const SESSAO = {
  pt: {
    lang: "pt-BR",
    colecao: "Portfólio",
    data: "pt-BR",
    outroIdioma: "English",
    teclas: {
      ajuda: "ajuda",
      buscar: "buscar",
      proximo: "próximo",
      anterior: "anterior",
      tema: "tema",
      idioma: "English",
      sair: "prompt",
      voltar: "voltar ao manual",
    },
    fim: "fim",
    pularParaOConteudo: "Pular para o conteúdo",
    dicaDoPrompt: "Digite help para ver os comandos, ou man kayo para voltar.",
    padrao: "Padrão",
    resultados: (n: number) => (n === 1 ? "1 resultado" : `${n} resultados`),
    semResultados: "Padrão não encontrado",
    semManual: (p: string) => `Nenhuma entrada de manual para ${p}`,
    naoEncontrado: (c: string) => `zsh: comando não encontrado: ${c}`,
    qualPagina: "Qual página do manual você quer?",
    semArquivo: (a: string) => `O arquivo ${a} não existe.`,
    usoDoLang: "uso: lang pt|en",
    usoDoKayo:
      "uso: kayo {ozamigos | finalizadoras | acelerato}, kayo [opções] ou kayo {--curriculo | --email | --github | --linkedin}",
    opcaoDesconhecida: (o: string) => `kayo: opção desconhecida: ${o}`,
    ajuda: {
      titulo: "RESUMO DOS COMANDOS DO LESS",
      rodape: "Aperte q ou h para voltar.",
      linhas: [
        ["h  H", "Mostra esta ajuda."],
        ["q  Q", "Abre o prompt do shell."],
        ["j  ↓  Enter", "Desce uma linha."],
        ["k  ↑", "Sobe uma linha."],
        ["espaço  f", "Desce uma tela."],
        ["b", "Sobe uma tela."],
        ["g  <", "Vai para o começo."],
        ["G  >", "Vai para o fim."],
        ["/padrão", "Busca o padrão na página."],
        ["n  N", "Vai para o resultado seguinte ou o anterior."],
        ["t", "Troca entre o tema claro e o escuro."],
        ["l", "Muda para inglês."],
      ] as [string, string][],
    },
    ajudaPrompt: [
      ["man kayo", "volta ao manual"],
      ["man kayo-ozamigos", "abre a página de um projeto (ls lista todas)"],
      ["ls", "lista as páginas e arquivos"],
      ["open curriculo.pdf", "baixa o currículo"],
      ["mail", "escreve um e-mail"],
      ["theme", "troca o tema"],
      ["lang en", "muda para inglês"],
      ["kayo ozamigos --web", "roda um exemplo das páginas dos projetos"],
      ["clear", "limpa a tela"],
      ["Tab", "completa o comando ou o nome da página"],
      ["history", "lista os comandos desta visita"],
      ["↑ ↓", "volta aos comandos anteriores"],
    ] as [string, string][],
  },
  en: {
    lang: "en",
    colecao: "Portfolio",
    data: "en-US",
    outroIdioma: "português",
    teclas: {
      ajuda: "help",
      buscar: "search",
      proximo: "next",
      anterior: "previous",
      tema: "theme",
      idioma: "português",
      sair: "shell",
      voltar: "back to the manual",
    },
    fim: "END",
    pularParaOConteudo: "Skip to content",
    dicaDoPrompt: "Type help to see the commands, or man kayo to go back.",
    padrao: "Pattern",
    resultados: (n: number) => (n === 1 ? "1 match" : `${n} matches`),
    semResultados: "Pattern not found",
    semManual: (p: string) => `No manual entry for ${p}`,
    naoEncontrado: (c: string) => `zsh: command not found: ${c}`,
    qualPagina: "What manual page do you want?",
    semArquivo: (a: string) => `The file ${a} does not exist.`,
    usoDoLang: "usage: lang pt|en",
    usoDoKayo:
      "usage: kayo {ozamigos | finalizadoras | acelerato}, kayo [options] or kayo {--resume | --email | --github | --linkedin}",
    opcaoDesconhecida: (o: string) => `kayo: unknown option: ${o}`,
    ajuda: {
      titulo: "SUMMARY OF LESS COMMANDS",
      rodape: "Press q or h to return.",
      linhas: [
        ["h  H", "Display this help."],
        ["q  Q", "Open the shell prompt."],
        ["j  ↓  RETURN", "Forward one line."],
        ["k  ↑", "Backward one line."],
        ["SPACE  f", "Forward one window."],
        ["b", "Backward one window."],
        ["g  <", "Go to the first line."],
        ["G  >", "Go to the last line."],
        ["/pattern", "Search forward for the pattern."],
        ["n  N", "Repeat the search, forward or backward."],
        ["t", "Toggle the light and dark theme."],
        ["l", "Switch to Portuguese."],
      ] as [string, string][],
    },
    ajudaPrompt: [
      ["man kayo", "back to the manual"],
      ["man kayo-ozamigos", "open a project page (ls lists them all)"],
      ["ls", "list pages and files"],
      ["open resume.pdf", "download the resume"],
      ["mail", "write an email"],
      ["theme", "toggle the theme"],
      ["lang pt", "switch to Portuguese"],
      ["kayo ozamigos --web", "run an example from the project pages"],
      ["clear", "clear the screen"],
      ["Tab", "complete the command or page name"],
      ["history", "list the commands from this visit"],
      ["↑ ↓", "go back to previous commands"],
    ] as [string, string][],
  },
};

export function caminho(idioma: Idioma, slug: string) {
  const base = idioma === "pt" ? "" : "/en";
  return slug === "kayo" ? base || "/" : `${base}/${slug}`;
}
