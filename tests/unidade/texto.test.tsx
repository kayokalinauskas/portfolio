import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { semMarcacao, Texto } from "@/components/Texto";

const html = (texto: string, idioma: "pt" | "en" = "pt") => renderToStaticMarkup(<Texto texto={texto} idioma={idioma} />);

describe("a marcação dos textos", () => {
  it("negrito e sublinhado", () => {
    expect(html("**kayo** [~--web~]")).toBe("<b>kayo</b> [<u>--web</u>]");
  });

  it("um endereço entre < >, como nos manuais, abrindo fora numa aba nova", () => {
    expect(html("@{https://github.com/kayokalinauskas|github.com/kayokalinauskas}")).toBe(
      '&lt;<a href="https://github.com/kayokalinauskas" target="_blank" rel="noopener noreferrer">github.com/kayokalinauskas</a>&gt;',
    );
  });

  it("o e-mail aparece sem o mailto:", () => {
    expect(html("@{mailto:kalinauskas@live.com}")).toContain(">kalinauskas@live.com</a>");
  });

  it("um link dentro de colchetes, como numa sinopse", () => {
    expect(html("[[--web](https://ozamigos.onrender.com/)]")).toBe(
      '[<a href="https://ozamigos.onrender.com/" target="_blank" rel="noopener noreferrer">--web</a>]',
    );
  });

  it("o PDF abre na mesma aba, e as páginas do site navegam sem recarregar", () => {
    expect(html("[--curriculo](/curriculo.pdf)")).toBe('<a href="/curriculo.pdf">--curriculo</a>');
    expect(html("[ozamigos](/en/kayo-ozamigos)")).toBe('<a href="/en/kayo-ozamigos">ozamigos</a>');
  });

  it("uma página do manual vira link, na língua da página; uma ferramenta, não", () => {
    expect(html("{kayo-ozamigos(1)}", "en")).toBe('<a href="/en/kayo-ozamigos"><b>kayo-ozamigos</b>(1)</a>');
    expect(html("{git(1)}")).toBe("<span><b>git</b>(1)</span>");
  });

  it("sem marcação, o texto fica como está", () => {
    expect(semMarcacao("**--java**, **--spring-boot**")).toBe("--java, --spring-boot");
    expect(semMarcacao("{kayo(1)} @{mailto:a@b.c|a@b.c}")).toBe("kayo(1) <a@b.c>");
  });
});
