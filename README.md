# kalinauskas.dev

Meu portfólio, escrito como uma página de manual do Unix: `man kayo`. Cada projeto é um subcomando com página própria, como no Git (`git log` é documentado em `git-log(1)`), e a navegação é a do `less`.

**Endereço:** https://kalinauskas.dev

## Como se usa

| Tecla | O que faz |
|---|---|
| `j` `k` `↓` `↑` | Rola uma linha |
| `espaço` `b` | Rola uma tela |
| `g` `G` | Vai ao começo e ao fim |
| `/` | Busca na página (`n` e `N` para o próximo e o anterior) |
| `t` | Troca o tema (Solarized claro ou Tomorrow Night) |
| `l` | Troca o idioma (português em `/`, inglês em `/en`) |
| `h` | Mostra a ajuda |
| `q` | Abre um prompt: `help`, `ls`, `man kayo-ozamigos`, `open curriculo.pdf`, `mail`, `theme`, `lang en` |

A barra de baixo mostra as teclas com o que cada uma faz, e cada uma é um botão, para quem usa mouse ou celular.

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
npm run build      # build de produção
npm run typecheck  # só os tipos
```

## Onde mexer

| O quê | Onde |
|---|---|
| Todo o texto, das quatro páginas e nas duas línguas | `content/manual.ts` (a marcação está explicada no topo do arquivo) |
| Como uma página de manual é desenhada | `components/Manual.tsx` e `components/manual.module.css` |
| A barra do `less`, as teclas, a busca e o prompt | `components/Sessao.tsx` |
| Cores dos dois temas | `app/globals.css` |
| Currículo | `public/curriculo.pdf` e `public/resume.pdf` |

Cada idioma tem o seu layout raiz (`app/(pt)` e `app/(en)`), para o `<html lang>` sair certo. Por isso o 404 ("No manual entry for…") fica em `app/global-not-found.tsx`.

## Licença

MIT. A fonte em `assets/fontes` segue a SIL Open Font License (`assets/fontes/OFL.txt`).
