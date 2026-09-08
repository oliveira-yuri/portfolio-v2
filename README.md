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

## Conteúdo de exemplo

Arquivos com `placeholder: true` no frontmatter **quebram o deploy de produção**
na Vercel. Isso é intencional: impede que conteúdo de exemplo vá ao ar por
esquecimento. Builds locais e deploys de preview continuam funcionando
normalmente; para reproduzir a falha de propósito, rode `STRICT_CONTENT=1 npm run build`.

Antes de publicar, substitua-os por conteúdo real e remova a marcação. Os arquivos
atuais marcados assim são:

- `content/posts/pt/exemplo-limpeza-dados.mdx` e a versão `en`
- `content/posts/pt/exemplo-somente-portugues.mdx`
- `content/projects/pt/exemplo-churn.mdx` e a versão `en`
- `content/projects/pt/exemplo-pipeline.mdx` e a versão `en`
- `content/profile/pt.ts` e `content/profile/en.ts`

Substitua também `public/cv/curriculo-pt.pdf` e `public/cv/curriculo-en.pdf` pelos
currículos reais.

## Variáveis de ambiente

| Variável | Onde | Valor |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Vercel → Settings → Environment Variables | o domínio final, ex. `https://seudominio.dev` |
| `STRICT_CONTENT` | opcional, local | `1` para fazer o build falhar em conteúdo de exemplo, como falharia em produção |

Sem ela, links absolutos no RSS e no sitemap apontam para o domínio `.vercel.app`.

## Design

Direção visual, paleta e regras de tipografia estão em
`docs/superpowers/specs/2026-09-07-portfolio-dados-ia-design.md`. A paleta é
verificada por teste automatizado — alterar cores sem rodar `npm run test` quebra
o contraste WCAG AA.
