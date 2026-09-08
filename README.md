# Portfólio + Newsletter — Yuri Oliveira

Site estático bilíngue (pt/en) construído com Next.js e exportado como HTML puro.
Publicar um artigo custa um commit.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:3000/pt
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | gera o site estático em `out/` |
| `npm run test` | testes unitários (Vitest) |
| `npm run test:e2e` | testes de ponta a ponta (Playwright, roda sobre `out/`) |

## Publicar um artigo

1. Crie `content/posts/pt/<slug>.mdx` (e `content/posts/en/<slug>.mdx` se houver tradução).
2. Preencha o frontmatter:

```yaml
---
title: "Título do artigo"
summary: "Uma frase que aparece na listagem."
date: "2026-03-14"
tags: ["dados"]
---
```

3. `git commit && git push`. A Vercel publica sozinha.

Um artigo que existe em um idioma só não aparece na listagem do outro; quem chegar
por link direto vê um aviso com link para a versão existente.

## Guarda de conteúdo de exemplo

Arquivos com `placeholder: true` no frontmatter **quebram o deploy de produção**
na Vercel. Isso é intencional: impede que conteúdo de exemplo vá ao ar por
esquecimento. Builds locais e deploys de preview continuam funcionando
normalmente; para reproduzir a falha de propósito, rode `STRICT_CONTENT=1 npm run build`.

Nenhum arquivo está marcado assim hoje — todo o conteúdo em `content/` é real.
A marcação continua disponível para rascunhos.

## Currículo

Há apenas o currículo em português, em `public/cv/curriculo-pt.pdf`. Os perfis
`pt` e `en` apontam de propósito para o mesmo arquivo: um download em português
é melhor do que um link quebrado. Quando existir a versão em inglês, coloque-a
em `public/cv/curriculo-en.pdf` e ajuste `cvPath` em `content/profile/en.ts`.

O teste em `tests/unit/published-content.test.ts` recusa qualquer PDF menor que
10 KB, para que um arquivo truncado nunca vá ao ar como se fosse um currículo.

## Testes e fixtures

Os testes de artigos leem `tests/fixtures/content`, não `content/`, via a
variável `CONTENT_ROOT_OVERRIDE`. O motivo: asserções sobre ordenação e sobre o
aviso de tradução ausente passam trivialmente quando não há artigos publicados,
e ficariam verdes sem testar nada. As fixtures mantêm o comportamento coberto
independentemente do que está no ar; `tests/unit/published-content.test.ts` é
quem valida o conteúdo real.

## Variáveis de ambiente

| Variável | Onde | Valor |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Vercel → Settings → Environment Variables | o domínio final, ex. `https://seudominio.dev` |
| `STRICT_CONTENT` | opcional, local | `1` para fazer o build falhar em conteúdo de exemplo, como falharia em produção |
| `CONTENT_ROOT_OVERRIDE` | só nos testes | caminho alternativo para `content/`; nada no app ou no build define isso |

Sem ela, links absolutos no RSS e no sitemap apontam para o domínio `.vercel.app`.

## Design

Direção visual, paleta e regras de tipografia estão em
`docs/superpowers/specs/2026-09-07-portfolio-dados-ia-design.md`. A paleta é
verificada por teste automatizado — alterar cores sem rodar `npm run test` quebra
o contraste WCAG AA.
