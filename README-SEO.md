# King Cell: landing page, SEO técnico e publicação no Vercel

Site estático de página única (HTML + CSS + JS, sem framework e sem dependências).
O Vercel roda `node scripts/build.mjs`, que copia o site para `dist/`, minifica o CSS e troca o
marcador `https://TROCAR-PELO-LINK-DO-VERCEL.vercel.app` pelo link de produção
(variável `VERCEL_PROJECT_PRODUCTION_URL`).

## Arquitetura (resumo)

```
GitHub ──push──> Vercel (build: node scripts/build.mjs) ──> dist/ (CDN)
                                     │
                                     └─ troca SITE_URL em index.html, robots.txt e sitemap.xml
Navegador: index.html → style.css (minificado) + script.js (defer)
  · imagens WebP com width/height, srcset e lazy abaixo da dobra
  · vídeos MP4 sem áudio, preload="none": só baixam e tocam quando entram na tela (IntersectionObserver)
  · mapa do Google em iframe criado só quando a seção se aproxima
  · cache de 30 dias para /assets e mídias (vercel.json)
```

Decisões: manter HTML estático (sem framework) porque é uma página única, rápida e fácil de editar.
Os vídeos do carrossel ficam pausados fora da tela para economizar dados e bateria no celular.
Se o site crescer (catálogo com muitos aparelhos, preços que mudam toda semana), vale migrar os
celulares para um arquivo JSON ou um CMS em vez de editar o HTML.

## Estrutura

| Arquivo | Para quê |
|---|---|
| `index.html` | Página (title, description, canonical, Open Graph, Twitter Card, favicons, JSON-LD) |
| `404.html` | Página de erro com a mesma identidade (`noindex`), botão para a home e para o WhatsApp |
| `assets/style.css`, `assets/script.js` | Estilos e interações |
| `assets/img`, `assets/loja`, `assets/celulares`, `assets/produtos`, `assets/perfumes` | Imagens WebP |
| `assets/videos/` | 8 vídeos do carrossel de celulares (MP4 sem áudio + poster WebP) |
| `assets/video/` | Vídeo do cliente com o iPhone novo (WebM + MP4 + poster) |
| `robots.txt`, `sitemap.xml` | Rastreamento e única URL canônica (`/`) |
| `site.webmanifest` | Nome, cores e ícones 192/512 |
| `favicon.ico`, `favicon.svg`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Favicons na **raiz**, gerados da logo |
| `og-image.jpg` | Imagem de compartilhamento 1200x630, na raiz, gerada da logo |
| `scripts/build.mjs` | **SITE_URL central** e build para `dist/` |
| `vercel.json` | Build, pasta de saída, redirecionamento `/index.html` → `/`, cache |

## O que ficou para preencher

| Item | Arquivo e linha | O que fazer |
|---|---|---|
| URL do site (SITE_URL) | `scripts/build.mjs`, linha 16 | **Automático no Vercel.** Só edite se publicar fora do Vercel. |
| Coordenadas da loja (opcional) | `index.html`, linhas 70 a 73 | Adicione o campo `geo` ao JSON-LD com latitude/longitude do pino no Google Maps. |
| Imagem de compartilhamento (opcional) | raiz, `og-image.jpg` | Já existe (gerada da logo). Para outra arte, substitua mantendo nome e 1200x630 px. |
| Favicons (opcional) | raiz do projeto | Já existem. Substitua mantendo nomes e tamanhos, se quiser. |
| Celulares, preços e perfumes | `index.html`, seções `#celulares` e `#perfumes` | Atualize quando o estoque mudar. |

Os marcadores em `index.html` (linhas 8, 14, 29, 30, 37, 48, 50 a 52), `robots.txt` (linha 6) e
`sitemap.xml` (linha 5) **não precisam ser editados**: o build troca tudo.

## Checklist

**a. Publicar no Vercel via GitHub**
1. Suba a pasta inteira para um repositório no GitHub (com `vercel.json` e `scripts/`).
2. No Vercel: *Add New → Project → Import* o repositório.
3. Framework Preset: *Other*. O resto vem do `vercel.json`. Clique em *Deploy*.

**b. Link de produção**
1. Copie o domínio de produção (ex.: `seu-projeto.vercel.app`). A URL é trocada sozinha no build.
2. Abra `https://seu-projeto.vercel.app/robots.txt` e `/sitemap.xml` e confira que aparece o link real.
3. Links de *preview* do Vercel ficam com `noindex` por padrão. Isso é normal; confira sempre no link de produção.

**c. Google Search Console**
1. Adicione a propriedade *Prefixo do URL* com o link de produção.
2. Verifique (método *Tag HTML*: cole a meta tag no `<head>` do `index.html`, faça deploy e clique em verificar).
3. Em *Sitemaps*, envie `sitemap.xml`.
4. Em *Inspeção de URL*, inspecione a home e clique em *Solicitar indexação*.

**d. Domínio próprio no futuro**
1. Vercel → *Settings → Domains*: adicione o domínio e marque como principal; deixe o `.vercel.app` redirecionando para ele.
2. Faça um novo deploy (a URL do build passa a ser o domínio novo).
3. No Search Console, adicione a propriedade do domínio novo e reenvie o sitemap.

> Esta implementação prepara o site para o Google. A indexação depende da avaliação do próprio Google.
