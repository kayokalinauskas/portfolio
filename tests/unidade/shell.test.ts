import { describe, expect, it } from "vitest";
import { formatarData, formatarLogin, formatarUptime } from "@/components/sessao/formatos";
import { andarNoHistorico, completar, completaveis, interpretar, type Contexto } from "@/components/sessao/shell";
import { CURRICULO } from "@/content/manual";

const ctx = (extra: Partial<Contexto> = {}): Contexto => ({
  idioma: "pt",
  curriculo: CURRICULO.pt,
  historico: [],
  agora: new Date(2026, 9, 23, 16, 13, 26),
  ...extra,
});

describe("interpretar", () => {
  it("man abre uma página que existe e avisa quando não existe", () => {
    expect(interpretar("man kayo-ozamigos", ctx()).efeito).toEqual({ tipo: "manual", pagina: "kayo-ozamigos" });
    expect(interpretar("man nada", ctx()).linhas).toEqual(["Nenhuma entrada de manual para nada"]);
    expect(interpretar("man", ctx()).linhas).toEqual(["Qual página do manual você quer?"]);
  });

  it("os exemplos das páginas abrem o que descrevem", () => {
    expect(interpretar("kayo ozamigos --web", ctx()).efeito).toEqual({
      tipo: "abrir",
      endereco: "https://ozamigos.onrender.com/",
    });
    // um exemplo sem endereço responde com a própria explicação
    expect(interpretar("kayo acelerato 4821", ctx()).linhas[0]).toMatch(/número do chamado/);
  });

  it("kayo sozinho abre o manual; com o nome de um projeto sem exemplo, a página dele", () => {
    expect(interpretar("kayo", ctx()).efeito).toEqual({ tipo: "manual", pagina: "kayo" });
    expect(interpretar("kayo finalizadoras", ctx()).efeito).toEqual({ tipo: "manual", pagina: "kayo-finalizadoras" });
    expect(interpretar("kayo xyz", ctx()).linhas[0]).toMatch(/^uso: kayo/);
  });

  it("o currículo é o da língua da página", () => {
    expect(interpretar("kayo --curriculo", ctx()).efeito).toEqual({ tipo: "abrir", endereco: "/curriculo.pdf" });
    expect(interpretar("open resume.pdf", ctx({ idioma: "en", curriculo: CURRICULO.en })).efeito).toEqual({
      tipo: "abrir",
      endereco: "/resume.pdf",
    });
  });

  it("espaços a mais não mudam o comando", () => {
    expect(interpretar("  man   kayo  ", ctx()).efeito).toEqual({ tipo: "manual", pagina: "kayo" });
  });

  it("os comandos clássicos respondem como no terminal", () => {
    expect(interpretar("pwd", ctx()).linhas).toEqual(["/Users/kayo"]);
    expect(interpretar("sudo rm -rf /", ctx()).linhas[0]).toBe(
      "kayo is not in the sudoers file. This incident will be reported.",
    );
    expect(interpretar("history", ctx({ historico: ["ls", "history"] })).linhas).toEqual([
      { preservado: "    1  ls" },
      { preservado: "    2  history" },
    ]);
    expect(interpretar("xyz", ctx()).linhas).toEqual(["zsh: comando não encontrado: xyz"]);
    expect(interpretar("xyz", ctx({ idioma: "en" })).linhas).toEqual(["zsh: command not found: xyz"]);
  });

  it("lang só aceita pt e en", () => {
    expect(interpretar("lang en", ctx()).efeito).toEqual({ tipo: "idioma", idioma: "en" });
    expect(interpretar("lang fr", ctx()).linhas).toEqual(["uso: lang pt|en"]);
  });
});

describe("Tab", () => {
  const opcoes = completaveis("pt", "curriculo.pdf");

  it("completa uma opção única, com um espaço no fim", () => {
    expect(completar("man kayo-oz", opcoes)).toEqual({ entrada: "man kayo-ozamigos " });
  });

  it("completa até onde as opções concordam", () => {
    expect(completar("kayo ozamigos --w", opcoes)).toEqual({ sugestoes: ["--web", "--windows"] });
    expect(completar("man k", opcoes)).toEqual({ entrada: "man kayo" });
  });

  it("não completa o que não existe, nem o sudo", () => {
    expect(completar("xyz", opcoes)).toBeNull();
    expect(completar("sud", opcoes)).toBeNull();
  });

  it("cada comando completável é entendido pelo shell", () => {
    for (const c of opcoes) {
      const { linhas } = interpretar(c, ctx());
      expect(linhas).not.toContainEqual(expect.stringMatching(/comando não encontrado|^uso:/));
    }
  });
});

describe("↑ e ↓", () => {
  const historico = ["ls", "pwd", "date"];

  it("↑ volta do mais novo para o mais antigo e para no primeiro", () => {
    let estado = { posicao: null as number | null, rascunho: "" };
    const vistos: string[] = [];
    for (let i = 0; i < 4; i++) {
      const passo = andarNoHistorico(historico, estado, -1, "rascunho")!;
      estado = passo.estado;
      vistos.push(passo.entrada);
    }
    expect(vistos).toEqual(["date", "pwd", "ls", "ls"]);
  });

  it("↓ depois do último devolve o que estava sendo digitado", () => {
    const cima = andarNoHistorico(historico, { posicao: null, rascunho: "" }, -1, "man ka")!;
    const baixo = andarNoHistorico(historico, cima.estado, 1, cima.entrada)!;
    expect(baixo.entrada).toBe("man ka");
    expect(baixo.estado.posicao).toBeNull();
  });

  it("sem histórico, as setas não fazem nada", () => {
    expect(andarNoHistorico([], { posicao: null, rascunho: "" }, -1, "")).toBeNull();
  });
});

describe("formatos", () => {
  const data = new Date(2026, 9, 3, 9, 4, 7);

  it("o Last login e o date seguem o formato do macOS", () => {
    expect(formatarLogin(data)).toBe("Sat Oct 03 09:04:07");
    expect(formatarData(data)).toMatch(/^Sat Oct {2}3 09:04:07 \S+ 2026$/);
  });

  it("o uptime conta os dias desde janeiro de 2015", () => {
    expect(formatarUptime(new Date(2015, 0, 11, 8, 30))).toBe("08:30  up 10 days, 1 user");
  });
});
