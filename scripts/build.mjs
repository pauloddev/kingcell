// Build de SEO para o deploy no Vercel (sem dependências: só Node).
// Copia o site para dist/ e troca o marcador de URL pelo link de produção.
//
// ============================================================
// SITE_URL: URL CENTRAL DO SITE (canonical, og:url, og:image,
// JSON-LD, robots.txt e sitemap.xml usam este valor)
//
// No Vercel ela é preenchida sozinha com VERCEL_PROJECT_PRODUCTION_URL
// (o link de produção, ex.: seu-projeto.vercel.app, ou o seu domínio
// próprio quando você conectar um).
//
// TODO: PREENCHER só se quiser fixar a URL manualmente: troque o texto
// da linha 16 (SITE_URL_MANUAL) pelo seu link (ex.: "https://kingcell.vercel.app"), sem barra no final.
// ============================================================
const PLACEHOLDER = "https://TROCAR-PELO-LINK-DO-VERCEL.vercel.app";
const SITE_URL_MANUAL = "https://TROCAR-PELO-LINK-DO-VERCEL.vercel.app";

const SITE_URL = (
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : SITE_URL_MANUAL
).replace(/\/+$/, "");

import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "dist");

// Arquivos e pastas públicos do site
const PUBLIC = [
  "index.html", "404.html", "assets", "robots.txt", "sitemap.xml", "site.webmanifest",
  "favicon.ico", "favicon.svg", "favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png",
  "icon-192.png", "icon-512.png", "og-image.jpg",
];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const item of PUBLIC) {
  if (existsSync(join(ROOT, item))) cpSync(join(ROOT, item), join(OUT, item), { recursive: true });
  else if (item === "og-image.jpg") console.warn("[seo] AVISO: og-image.jpg ainda não existe (crie em 1200x630 px na raiz).");
}

// Troca o marcador pela URL real nos arquivos de texto
const today = new Date().toISOString().slice(0, 10);
for (const f of ["index.html", "robots.txt", "sitemap.xml"]) {
  const p = join(OUT, f);
  let txt = readFileSync(p, "utf8").split(PLACEHOLDER).join(SITE_URL);
  if (f === "sitemap.xml") txt = txt.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${today}</lastmod>`);
  writeFileSync(p, txt);
}

// Minifica o CSS em dist/ (sem dependências: remove comentários e espaços extras)
{
  const cssPath = join(OUT, "assets", "style.css");
  const css = readFileSync(cssPath, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
  writeFileSync(cssPath, css);
}

if (SITE_URL === PLACEHOLDER) {
  console.warn("[seo] AVISO: SITE_URL ainda é o marcador. Fora do Vercel, defina SITE_URL_MANUAL em scripts/build.mjs.");
}
console.log(`[seo] Build pronto em dist/ com SITE_URL = ${SITE_URL}`);
