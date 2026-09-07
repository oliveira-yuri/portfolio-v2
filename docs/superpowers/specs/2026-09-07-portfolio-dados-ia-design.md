# Portfólio + Newsletter — Dados & IA

**Data:** 2026-09-07
**Status:** Design aprovado, pronto para plano de implementação

---

## 1. Objetivo

Site pessoal que apresenta o autor como profissional de **Dados & Inteligência Artificial** para recrutadores e pares técnicos, e hospeda uma newsletter própria onde ele publica o que aprende, pesquisa e constrói.

O site precisa cumprir duas funções sem que uma atrapalhe a outra:

1. **Convencer em uma rolagem.** Um recrutador abre, rola uma vez e entende quem é, o que construiu, onde trabalhou e como falar com ele.
2. **Sustentar leitura longa.** Artigos técnicos precisam ser confortáveis de ler até o fim.

### Critérios de sucesso

- Um visitante que nunca ouviu falar do autor entende posicionamento, projetos e como contatá-lo sem sair da home.
- Publicar um artigo novo custa: escrever um arquivo `.mdx`, commitar, dar push. Nada além disso.
- O site funciona em português e inglês, com endereços distintos e conteúdo real em ambos.
- Zero custo mensal de operação. Único custo recorrente é o registro do domínio.
- Nenhuma seção do site aparece vazia por falta de conteúdo.

---

## 2. Decisões tomadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Natureza da "Newsletter" | Blog estático em MDX no repositório | Sem backend, sem banco, sem serviço de e-mail, sem custo. Publicar = commit. |
| Stack | Next.js 15 (App Router) + Tailwind v4 + MDX | Stack mais reconhecida no mercado brasileiro; o próprio repositório vira argumento em entrevista. |
| Renderização | `output: 'export'` (HTML estático) | Sem servidor para manter, sem custo, sem superfície de ataque. |
| Idiomas | Português **e** inglês | Alcance nacional e internacional. Custo assumido: cada texto existe em duas versões. |
| Volume de conteúdo | 1 a 3 projetos, com experiência profissional real | Projetos ganham tratamento profundo em vez de grade grande e vazia. |
| Posicionamento | Dados & IA | Projetos apresentados como estudos com resultado; a newsletter carrega peso como prova de raciocínio. |
| Direção visual | Terminal puro, escuro | Escolhida pelo autor entre quatro direções apresentadas. |
| Tipografia | Recursive, eixo `MONO` variável por contexto | Resolve o cansaço de leitura da monoespaçada sem abandonar a identidade de terminal. |
| Estrutura | Home longa + páginas para projetos e artigos | Recrutador vê tudo em uma rolagem; só ganha rota própria o que precisa de link compartilhável. |
| Hospedagem | Vercel + domínio próprio | Deploy a cada push, plano gratuito, endereço próprio. |

### Alternativas descartadas

- **Captura e envio de e-mail** (Resend/Buttondown): exigiria backend e uma conta a manter. O feed RSS entrega o mesmo valor com custo zero. Pode ser somado depois sem refazer nada.
- **Painel administrativo com banco e login**: escopo de um segundo produto. Publicar por commit é suficiente para um autor único.
- **Plataforma externa (Substack/Beehiiv)**: conteúdo e tráfego viveriam em domínio de terceiros.
- **Astro**: tecnicamente mais adequado a um site de conteúdo, mas aparece em menos vagas que React.
- **Multi-página clássica (14 rotas)**: uma página "Projetos" para 2 ou 3 itens parece vazia, e dobra o texto a manter em dois idiomas.
- **Página única**: perderia o link individual do projeto, que é justamente o que se envia numa candidatura.
- **Monoespaçada em tudo, sem ajuste** e **modo de leitura claro separado**: a primeira cansa a leitura; a segunda parece dois sites colados.
- **Alternador de tema claro/escuro**: a identidade *é* o escuro. Um modo claro seria complexidade sem ganho.

---

## 3. Arquitetura

### 3.1 Rotas

Estrutura `app/[lang]/`, com `generateStaticParams` gerando `pt` e `en`.

```
/                        → redirect para /pt
/[lang]                  → home longa
/[lang]/projects/[slug]  → estudo de caso
/[lang]/newsletter       → lista de artigos
/[lang]/newsletter/[slug]→ artigo
/[lang]/rss.xml          → feed por idioma
/sitemap.xml, /robots.txt
```

Total: 6 rotas de conteúdo × 2 idiomas.

**Segmentos de URL ficam em inglês nos dois idiomas** (`/pt/projects/…`, não `/pt/projetos/…`). Segmentos localizados exigiriam um mapa de rotas paralelas — complexidade desproporcional ao ganho.

**O redirect de `/`** é feito por `vercel.json`. Export estático não executa middleware, então essa é a via correta na Vercel. Um `<meta http-equiv="refresh">` numa página raiz estática fica como alternativa portável caso a hospedagem mude.

### 3.2 Separação conteúdo / código

Conteúdo vive fora de `app/`, para que publicar nunca signifique mexer em código:

```
content/
  posts/
    pt/*.mdx
    en/*.mdx
  projects/
    pt/*.mdx
    en/*.mdx
  profile/
    pt.ts        experiência, formação, certificações,
    en.ts        habilidades, links, textos da interface
public/
  cv/curriculo-pt.pdf
  cv/curriculo-en.pdf
```

### 3.3 Camada de conteúdo

Um módulo único (`lib/content/`) é a **única** porta de entrada para conteúdo. Páginas nunca leem o disco diretamente. Interface pública:

```ts
getPosts(lang)              → PostMeta[]   // ordenado por data, desc
getPost(lang, slug)         → Post | TranslationMissing
getProjects(lang)           → ProjectMeta[]
getProject(lang, slug)      → Project | TranslationMissing
getProfile(lang)            → Profile
getAllSlugs(kind)           → { lang, slug }[]  // para generateStaticParams
```

Isso mantém as páginas finas e torna a lógica testável sem renderizar nada.

**Validação:** todo frontmatter e todo arquivo de perfil passa por um esquema Zod no momento do build. Campo obrigatório ausente, data inválida ou slug duplicado **quebram o build**. É preferível falhar na publicação a publicar uma página torta.

### 3.4 Tradução ausente — regra explícita

Escrever tudo em dois idiomas é o custo real do bilinguismo. A regra abaixo torna esse custo opcional por artigo:

- Um artigo ou projeto que existe só em um idioma **não aparece** na listagem do outro.
- Acessado por link direto no idioma inexistente, a página responde com um aviso — *"Este artigo está disponível apenas em português"* — e um link para a versão existente. Retorna 200 com conteúdo útil, não erro.
- Não há tradução automática em nenhuma hipótese.

O `profile` e os textos de interface, ao contrário, **são obrigatórios nos dois idiomas** — o build falha se faltar. Sem isso a home ficaria pela metade em um dos idiomas.

### 3.5 Bibliotecas

| Uso | Escolha |
|---|---|
| MDX | `next-mdx-remote` (RSC) + `gray-matter` |
| Markdown estendido | `remark-gfm` |
| Código com destaque de sintaxe | `rehype-pretty-code` |
| Validação | `zod` |
| Fonte | `next/font` carregando Recursive com os eixos variáveis |
| Métricas | `@vercel/analytics` |

Nenhuma biblioteca de animação: CSS puro cobre o movimento previsto.

---

## 4. Design system

### 4.1 Cores

```
fundo         #0A0C0B
superfície    #0D1110
borda         #1C2421
texto         #E6F2EB
secundário    #8FA39A
terciário     #5B6B64
acento        #4ADE80
```

Estes valores são **ponto de partida, não definitivos**: a medição de contraste (abaixo) tem precedência sobre eles e pode alterá-los.

**Requisito de contraste:** todo texto deve atingir **WCAG AA (4.5:1)** contra o fundo em que assenta; texto grande, 3:1. `terciário` e `acento` são os pares limítrofes — se a medição reprovar, os valores acima devem ser clareados até passarem, e o design system atualizado com os tons corrigidos. Contraste baixo em verde sobre preto é o defeito mais comum dessa estética. A verificação é obrigatória, não opcional.

### 4.2 Tipografia

Família única: **Recursive**, com o eixo `MONO` ajustado por contexto. É essa variação que preserva a identidade de terminal sem cansar quem lê.

| Contexto | MONO | CASL | Peso | Observação |
|---|---|---|---|---|
| Navegação, metadados, etiquetas, stack | 1.0 | 0 | 500 | maiúsculas, entreletra +0.14em |
| Blocos e trechos de código | 1.0 | 0 | 400 | mono puro |
| Títulos | 0.5 | 0.2 | 620 | entreletra −0.02em |
| Texto de artigo e descrições | 0.3 | 0.3 | 380 | — |

**Corpo de texto de artigo:** 17px, entrelinha 1.8, largura máxima ~64 caracteres. Esses três valores, somados à escolha do eixo, são o que resolve a fadiga de leitura — nenhum deles é opcional.

Caso algum eixo do Recursive não seja carregável por `next/font/google`, o plano de implementação deve tratar o auto-hospedamento da fonte variável como caminho alternativo; a solução não pode degradar para uma monoespaçada comum no corpo do texto.

### 4.3 Movimento

Discreto e funcional: cursor piscando no hero, seções surgindo suavemente ao entrar na tela, transições curtas em foco e hover. Tudo desativado sob `prefers-reduced-motion: reduce`.

### 4.4 Acessibilidade

HTML semântico, `lang` correto por idioma, foco visível em todo elemento interativo, navegação completa por teclado, imagens com texto alternativo, contraste AA verificado.

---

## 5. Telas

### 5.1 Home (rolagem única)

1. **Hero** — nome, frase de posicionamento, stack principal, botão para o currículo em PDF, indicador de disponibilidade.
2. **Projetos em destaque** — 1 a 3 cartões grandes. Cada um traz *problema → abordagem → resultado*, stack e link para o estudo de caso. Cartões grandes, e não grade, porque o volume é baixo: profundidade em vez de quantidade.
3. **Experiência** — linha do tempo enxuta: cargo, organização, período, o que foi feito.
4. **Formação e certificações** — instituição, título, ano, link do certificado quando houver.
5. **Habilidades** — agrupadas por finalidade (linguagens, análise, dados, ferramentas). **Sem barras de percentual** — "85% de Python" não informa nada e enfraquece o conjunto.
6. **Últimos 3 artigos** — título, data, tempo de leitura, link para a newsletter completa.
7. **Contato** — e-mail, LinkedIn, GitHub, currículo.

### 5.2 Estudo de caso

Contexto e problema; decisões técnicas **com o porquê de cada uma**; resultado, de preferência mensurável; stack; links para repositório e demonstração. Para Dados & IA, o raciocínio registrado vale mais que a captura de tela.

### 5.3 Lista da newsletter

Lista cronológica: título, resumo, data, tempo de leitura, etiquetas. Sem paginação enquanto o volume for baixo.

### 5.4 Artigo

Coluna única na largura de leitura definida em 4.2. Metadados em mono puro no topo, blocos de código com destaque de sintaxe, link para o RSS ao final.

---

## 6. Testes

**Unitários (Vitest)** — sobre `lib/content/`, que é onde falhas passariam despercebidas:

- Leitura de frontmatter e validação Zod, incluindo os casos de falha.
- Ordenação de artigos por data, decrescente.
- Filtragem por idioma na listagem.
- Detecção de tradução ausente e o objeto retornado nesse caso.
- Cálculo de tempo de leitura.
- Geração do XML do RSS.
- Detecção de slug duplicado.

**Ponta a ponta (Playwright)** — smoke test curto:

- Home renderiza em `/pt` e `/en` com as sete seções presentes.
- O seletor de idioma mantém o visitante na página equivalente.
- Um artigo abre a partir da listagem.
- Artigo sem tradução exibe o aviso e o link para a versão existente.
- O PDF do currículo é acessível.

**Portão de build** — `next build` precisa passar. O export estático quebra em situações que passam em modo de desenvolvimento, então build limpo é condição de conclusão, não formalidade.

**Verificação de contraste** — medição dos pares de cor definidos em 4.1 contra o limite AA, antes de considerar o design pronto.

---

## 7. Publicação

- `git init` no diretório (hoje não é repositório), `.gitignore` cobrindo `node_modules`, `.next`, `out` e `.superpowers/`.
- Repositório: <https://github.com/oliveira-yuri/portfolio-v2>. Vercel conectada a ele, publicando a cada push na branch `main`.
- Domínio próprio apontado para a Vercel.
- `sitemap.xml`, `robots.txt`, metadados por página e imagem de compartilhamento gerada no build — o link precisa ficar apresentável quando compartilhado no LinkedIn.
- Vercel Analytics, sem cookies.

---

## 8. Fora de escopo

Deliberadamente ausentes desta versão:

- Captura e envio de e-mail — o RSS cobre a necessidade; pode ser somado depois sem retrabalho.
- Painel administrativo, banco de dados, autenticação.
- Comentários nos artigos.
- Busca no blog — não se justifica com poucos artigos; reavaliar por volta de 20 publicações.
- Modo claro.
- Bibliotecas de animação.
- Tradução automática de conteúdo.

---

## 9. Conteúdo a ser fornecido pelo autor

O design não depende destes itens para começar a implementação, mas o site não vai ao ar sem eles:

1. Nome como quer aparecer e frase de posicionamento.
2. De 1 a 3 projetos: problema, o que fez, resultado, stack, links de repositório e demonstração.
3. Experiência profissional: cargo, organização, período, atividades.
4. Formação e certificações.
5. LinkedIn, GitHub e e-mail de contato.
6. Currículo em PDF, versões PT e EN.
7. Domínio a ser registrado.

Enquanto não chegam, a implementação usa conteúdo de exemplo, que **não pode** ir para produção. O mecanismo é explícito: todo conteúdo de exemplo carrega o campo `placeholder: true` no frontmatter (ou na entrada correspondente do `profile`), e a validação Zod **rejeita `placeholder: true` quando `NODE_ENV === 'production'`**, quebrando o build. Assim é impossível publicar por esquecimento, e não depende de ninguém lembrar de conferir.
