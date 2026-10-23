import { describe, expect, it } from "vitest";
import { ancora } from "@/components/ancora";
import { MANUAL, PAGINAS, PROJETOS, type Bloco, type Pagina } from "@/content/manual";

// As duas línguas são escritas à mão: estes testes garantem que uma não fique para trás.

// A forma de uma página: as seções e, em cada uma, os tipos de bloco e quantos campos há.
function forma(pagina: Pagina) {
  return pagina.secoes.map((secao) =>
    secao.blocos.map((b: Bloco) =>
      b.tipo === "campos" ? `campos:${b.linhas.length}` : b.tipo === "sinopse" ? `sinopse:${b.linhas.length}` : b.tipo,
    ),
  );
}

const referencias = (texto: string) => [...texto.matchAll(/\{([a-z0-9-]+)\(\d\)\}/g)].map((m) => m[1]);

describe("conteúdo", () => {
  it.each(PAGINAS)("%s tem as mesmas seções e blocos em português e em inglês", (slug) => {
    expect(forma(MANUAL.en[slug])).toEqual(forma(MANUAL.pt[slug]));
  });

  it.each(PAGINAS)("%s tem os mesmos exemplos, abrindo os mesmos endereços, nas duas línguas", (slug) => {
    const abre = (p: Pagina) => p.secoes.flatMap((s) => s.blocos).flatMap((b) => (b.tipo === "exemplo" ? [b.abre ?? null] : []));
    expect(abre(MANUAL.en[slug])).toEqual(abre(MANUAL.pt[slug]));
  });

  it.each(["pt", "en"] as const)("cada página em %s tem título, descrição e o slug certo", (idioma) => {
    for (const slug of PAGINAS) {
      const p = MANUAL[idioma][slug];
      expect(p.slug).toBe(slug);
      expect(p.titulo).toMatch(new RegExp(`· ${slug}\\(1\\)$`));
      // o tamanho que os buscadores mostram
      expect(p.descricao.length).toBeGreaterThanOrEqual(70);
      expect(p.descricao.length).toBeLessThanOrEqual(160);
    }
  });

  it.each(["pt", "en"] as const)("as seções de cada página em %s têm endereços únicos", (idioma) => {
    for (const slug of PAGINAS) {
      const ids = MANUAL[idioma][slug].secoes.map((s) => ancora(s.titulo));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("a página principal lista todos os projetos em COMANDOS e na sinopse", () => {
    for (const idioma of ["pt", "en"] as const) {
      const [, sinopse, , comandos] = MANUAL[idioma].kayo.secoes;
      expect(comandos.blocos.map((b) => (b.tipo === "item" ? b.rotulo : ""))).toEqual(PROJETOS.map((p) => `{${p}(1)}`));
      const linha = sinopse.blocos[0].tipo === "sinopse" ? sinopse.blocos[0].linhas[0] : "";
      for (const p of PROJETOS) expect(linha).toContain(`[${p.slice("kayo-".length)}](`);
    }
  });

  it("cada projeto termina com o VEJA TAMBÉM das outras páginas", () => {
    for (const p of PROJETOS) {
      const ultima = MANUAL.pt[p].secoes.at(-1)!;
      expect(ultima.titulo).toBe("VEJA TAMBÉM");
      const texto = ultima.blocos[0].tipo === "texto" ? ultima.blocos[0].texto : "";
      expect(referencias(texto).sort()).toEqual(PAGINAS.filter((x) => x !== p).sort());
      expect(MANUAL.en[p].secoes.at(-1)!.titulo).toBe("SEE ALSO");
    }
  });

  it("toda referência a uma página do manual aponta para uma página que existe", () => {
    const todas = (["pt", "en"] as const).flatMap((idioma) =>
      Object.values(MANUAL[idioma]).flatMap((p) => p.secoes.flatMap((s) => s.blocos)),
    );
    const textos = todas.flatMap((b) =>
      b.tipo === "texto"
        ? [b.texto]
        : b.tipo === "item"
          ? [b.rotulo, b.texto]
          : b.tipo === "campos"
            ? b.linhas.flat()
            : b.tipo === "sinopse"
              ? b.linhas
              : [b.comando, b.texto],
    );
    for (const ref of textos.flatMap(referencias)) expect(PAGINAS).toContain(ref);
  });

  it("todo exemplo é um comando kayo, que o prompt sabe executar", () => {
    for (const idioma of ["pt", "en"] as const) {
      for (const p of Object.values(MANUAL[idioma])) {
        for (const b of p.secoes.flatMap((s) => s.blocos)) {
          if (b.tipo === "exemplo") expect(b.comando).toMatch(/^kayo( |$)/);
        }
      }
    }
  });
});

describe("ancora", () => {
  it("tira os acentos e troca os espaços por hífen", () => {
    expect(ancora("VEJA TAMBÉM")).toBe("veja-tambem");
    expect(ancora("DESCRIÇÃO")).toBe("descricao");
    expect(ancora("SEE ALSO")).toBe("see-also");
  });
});
