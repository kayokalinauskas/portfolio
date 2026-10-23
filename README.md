# kalinauskas.dev

Meu portfólio, escrito como uma página de manual do Unix: `man kayo`. Cada projeto é um subcomando com página própria, como no Git (`git log` é documentado em `git-log(1)`), e a navegação é a do `less`.

**Endereço:** https://kalinauskas.dev

## Como se usa

| Tecla           | O que faz                                                                                                                                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `j` `k` `↓` `↑` | Rola uma linha                                                                                                                                                                                                  |
| `espaço` `b`    | Rola uma tela                                                                                                                                                                                                   |
| `g` `G`         | Vai ao começo e ao fim                                                                                                                                                                                          |
| `/`             | Busca na página (`n` e `N` para o próximo e o anterior)                                                                                                                                                         |
| `t`             | Troca o tema (Solarized claro ou Tomorrow Night)                                                                                                                                                                |
| `l`             | Troca o idioma (português em `/`, inglês em `/en`)                                                                                                                                                              |
| `h`             | Mostra a ajuda                                                                                                                                                                                                  |
| `q`             | Abre o prompt do shell: `help`, `ls`, `man kayo-ozamigos`, os exemplos das páginas (`kayo ozamigos --web`), `open curriculo.pdf`, `mail`, `theme`, `lang en`. Tab completa e ↑ ↓ voltam aos comandos anteriores |

Cada título de seção é um link para ela (`/#historico`, `/kayo-ozamigos#exemplos`). A barra de baixo mostra as teclas com o que cada uma faz, e cada uma é um botão, para quem usa mouse ou celular.

## Tecnologias

- Next.js 16 (App Router, tudo estático) e React 19
- TypeScript
- CSS Modules; o layout é medido em `ch`, como as colunas de um terminal
- IBM Plex Mono pelo `next/font`
- Busca com a CSS Custom Highlight API, sem mexer no HTML
- Imagem de prévia (Open Graph) gerada no build com `next/og`
- Vercel Analytics

## Como rodar

```bash
npm install
npm run dev
```

```bash
npm run check      # tipos, lint (ESLint com as regras do Next), formatação (Prettier) e testes de unidade
npm run format     # formata tudo com o Prettier
npm run build      # build de produção
npm run test:e2e   # testes no navegador, contra o build (na primeira vez: npx playwright install chromium)
```

### Testes

- **Unidade** (Vitest, `tests/unidade`): o conteúdo nas duas línguas (as mesmas seções, os mesmos exemplos, referências que existem), a marcação dos textos e o shell do prompt (os comandos, o Tab e o histórico).
- **Navegador** (Playwright, `tests/navegador`): no computador e num celular emulado, as oito páginas abrem, nada passa da largura em 320 px, e a ajuda, a busca e o prompt funcionam.

O GitHub Actions roda tudo isso a cada push e em cada pull request (`.github/workflows/ci.yml`), e o Dependabot abre um pull request quando sai versão nova das dependências. A Vercel publica o `master`. O Node é o 24 (`engines` no `package.json` e `.nvmrc`).

## Onde mexer

| O quê                                                               | Onde                                                               |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Todo o texto, das quatro páginas e nas duas línguas                 | `content/manual.ts` (a marcação está explicada no topo do arquivo) |
| Os comandos do prompt (`man`, `kayo`, `history`…), o Tab e as setas | `components/sessao/shell.ts`                                       |
| Como uma página de manual é desenhada                               | `components/Manual.tsx` e `components/manual.module.css`           |
| A barra do `less`, as teclas, a busca e a tela do prompt            | `components/Sessao.tsx` e `components/sessao/`                     |
| Cores dos dois temas                                                | `app/globals.css`                                                  |
| Currículo                                                           | `public/curriculo.pdf` e `public/resume.pdf`                       |

### Acrescentar um projeto

1. Ponha o nome em `PROJETOS` (`content/manual.ts`), por exemplo `"kayo-novo"`.
2. Escreva a página em `projetosPt` e em `projetosEn`, com o `resumo` (a linha dele em COMANDOS). O TypeScript não compila sem as duas línguas.

A sinopse da página principal, o item em COMANDOS, o VEJA TAMBÉM das outras páginas, o Tab do prompt, o sitemap, a página e a imagem de prévia saem disso sozinhos. Os testes avisam se as duas línguas ficarem com seções diferentes.

Cada idioma tem o seu layout raiz (`app/(pt)` e `app/(en)`), para o `<html lang>` sair certo. Por isso o 404 ("No manual entry for…") fica em `app/global-not-found.tsx`.

## Licença

MIT. A fonte em `assets/fontes` segue a SIL Open Font License (`assets/fontes/OFL.txt`).
