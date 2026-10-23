import {
  caminho,
  CURRICULO,
  EMAIL,
  GITHUB,
  LINKEDIN,
  MANUAL,
  SESSAO,
  type Bloco,
  type Idioma,
  type Slug,
} from "@/content/manual";
import { SITE } from "./metadados";
import { ancora } from "./ancora";
import { Texto, semMarcacao } from "./Texto";
import Sessao from "./Sessao";
import estilos from "./manual.module.css";

// A data em que o site foi gerado, no rodapé, como a data de uma versão do manual.
const GERADO = new Date().toISOString().slice(0, 10);
const VERSAO = "kalinauskas.dev 2.0";

function BlocoDoManual({ bloco, idioma }: { bloco: Bloco; idioma: Idioma }) {
  switch (bloco.tipo) {
    case "texto":
      return (
        <p className={estilos.paragrafo}>
          <Texto texto={bloco.texto} idioma={idioma} />
        </p>
      );
    case "sinopse":
      return (
        <div className={estilos.sinopse}>
          {bloco.linhas.map((linha) => (
            <p key={linha}>
              <Texto texto={linha} idioma={idioma} />
            </p>
          ))}
        </div>
      );
    case "item":
      // como no man: o rótulo numa linha, a explicação recuada embaixo
      return (
        <div className={estilos.item}>
          <div className={estilos.rotulo}>
            <Texto texto={bloco.rotulo} idioma={idioma} />
          </div>
          <div className={estilos.corpo}>
            <Texto texto={bloco.texto} idioma={idioma} />
          </div>
        </div>
      );
    case "exemplo":
      // o comando, que abre o que ele descreve quando há para onde ir, e a explicação embaixo
      return (
        <div className={estilos.item}>
          <div className={estilos.rotulo}>
            {bloco.abre ? (
              <a href={bloco.abre} {...(/^https?:/.test(bloco.abre) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <b>{bloco.comando}</b>
              </a>
            ) : (
              <b>{bloco.comando}</b>
            )}
          </div>
          <div className={estilos.corpo}>
            <Texto texto={bloco.texto} idioma={idioma} />
          </div>
        </div>
      );
    case "campos": {
      const largura = Math.max(...bloco.linhas.map(([r]) => semMarcacao(r).length)) + 2;
      return (
        <dl className={estilos.campos} style={{ gridTemplateColumns: `${largura}ch minmax(0, 1fr)` }}>
          {bloco.linhas.map(([rotulo, texto]) => (
            <div key={rotulo} className={estilos.campo}>
              <dt>
                <Texto texto={rotulo} idioma={idioma} />
              </dt>
              <dd>
                <Texto texto={texto} idioma={idioma} />
              </dd>
            </div>
          ))}
        </dl>
      );
    }
  }
}

// Os dados da pessoa para os buscadores (schema.org), só na página principal.
function DadosDaPessoa({ idioma }: { idioma: Idioma }) {
  const dados = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Kayo Kalinauskas",
    jobTitle: idioma === "pt" ? "Desenvolvedor full stack" : "Full stack developer",
    url: SITE + caminho(idioma, "kayo"),
    email: `mailto:${EMAIL}`,
    sameAs: [GITHUB, LINKEDIN],
    knowsAbout: ["Java", "Spring Boot", "React", "TypeScript", "SQL", "APIs REST"],
    knowsLanguage: ["pt-BR", "en"],
  };
  // o "<" escapado impede que um texto feche a tag <script> antes da hora
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, "\\u003c") }} />
  );
}

export default function Manual({ idioma, slug }: { idioma: Idioma; slug: Slug }) {
  const pagina = MANUAL[idioma][slug];
  const s = SESSAO[idioma];
  const nome = `${slug.toUpperCase()}(1)`;

  return (
    <Sessao idioma={idioma} slug={slug} curriculo={CURRICULO[idioma]}>
      {slug === "kayo" && <DadosDaPessoa idioma={idioma} />}
      <article className={estilos.manual} id="manual">
        <header className={estilos.cabecalho}>
          <span>{nome}</span>
          <span className={estilos.colecao}>{s.colecao}</span>
          <span>{nome}</span>
        </header>

        {pagina.secoes.map((secao, i) => {
          const id = ancora(secao.titulo);
          return (
            <section key={id} className={estilos.secao} aria-labelledby={id}>
              {/* como no HTML do mandoc: o título é o link da própria seção (/#historico) */}
              <h2 id={id} className={estilos.titulo}>
                <a href={`#${id}`}>{secao.titulo}</a>
              </h2>
              <div className={estilos.blocos}>
                {secao.blocos.map((bloco, j) =>
                  i === 0 && bloco.tipo === "texto" ? (
                    <h1 key={j} className={estilos.paragrafo}>
                      <Texto texto={bloco.texto} idioma={idioma} />
                    </h1>
                  ) : (
                    <BlocoDoManual key={j} bloco={bloco} idioma={idioma} />
                  ),
                )}
              </div>
            </section>
          );
        })}

        <footer className={estilos.rodape}>
          <span>{VERSAO}</span>
          <span>
            <time dateTime={GERADO}>{GERADO}</time>
          </span>
          <span>{nome}</span>
        </footer>
      </article>
    </Sessao>
  );
}
