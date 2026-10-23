import { CURRICULO, MANUAL, SESSAO, type Bloco, type Idioma, type Slug } from "@/content/manual";
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

export default function Manual({ idioma, slug }: { idioma: Idioma; slug: Slug }) {
  const pagina = MANUAL[idioma][slug];
  const s = SESSAO[idioma];
  const nome = `${slug.toUpperCase()}(1)`;
  const [primeira, ...resto] = pagina.secoes;

  return (
    <Sessao idioma={idioma} slug={slug} curriculo={CURRICULO[idioma]}>
      <article className={estilos.manual} id="manual">
        <header className={estilos.cabecalho}>
          <span>{nome}</span>
          <span className={estilos.colecao}>{s.colecao}</span>
          <span>{nome}</span>
        </header>

        <section className={estilos.secao} aria-labelledby="nome">
          <h2 className={estilos.titulo}>{primeira.titulo}</h2>
          <div className={estilos.blocos}>
            {primeira.blocos.map((bloco, i) =>
              bloco.tipo === "texto" ? (
                <h1 key={i} id="nome" className={estilos.paragrafo}>
                  <Texto texto={bloco.texto} idioma={idioma} />
                </h1>
              ) : (
                <BlocoDoManual key={i} bloco={bloco} idioma={idioma} />
              ),
            )}
          </div>
        </section>

        {resto.map((secao) => (
          <section key={secao.titulo} className={estilos.secao}>
            <h2 className={estilos.titulo}>{secao.titulo}</h2>
            <div className={estilos.blocos}>
              {secao.blocos.map((bloco, i) => (
                <BlocoDoManual key={i} bloco={bloco} idioma={idioma} />
              ))}
            </div>
          </section>
        ))}

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
