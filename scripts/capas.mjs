#!/usr/bin/env node
/**
 * Gera capas e galerias para os posts. Node 18+, zero dependências.
 * Roda no GitHub Actions a cada push em _posts/ (ver .github/workflows/imagens.yml).
 *
 * Para cada post em _posts/ SEM `cover:` (e para cada item de `galeria:` sem `src:`):
 *   cover_fonte: foto  -> busca foto real com licença comercial no Openverse (Wikimedia, Flickr CC...)
 *                         usando `imagem_busca`. Se não achar, cai para IA.
 *   cover_fonte: ia    -> (padrão) gera com IA usando `cover_prompt` (ou título):
 *                         1) Cloudflare Workers AI FLUX-1-schnell (se CF_ACCOUNT_ID e CF_API_TOKEN existirem)
 *                         2) Pollinations (sem chave)
 *   Se tudo falhar, o post continua com a capa automática em gradiente (nada quebra).
 *
 * Grava a imagem em assets/img/posts/<slug>.<ext> e escreve no front matter:
 *   cover, cover_credit, cover_credit_url (quando houver).
 *
 * Uso: node scripts/capas.mjs [slug-opcional ...]
 * Saída: uma linha JSON por imagem com engine, file, bytes e fallbackReason.
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "_posts");
const OUT_DIR = "assets/img/posts";
const { CF_ACCOUNT_ID, CF_API_TOKEN } = process.env;
const ONLY = process.argv.slice(2);
const UA = "gtavi-cover-bot/1.0";
const STYLE =
  "cinematic photorealistic film still, Florida tropical city atmosphere, golden hour sunset with pink and orange neon glow, dramatic lighting, anamorphic 35mm look, highly detailed, no text, no letters, no logos, no watermark, no brand names, no recognizable people";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const yamlStr = (s) => '"' + String(s).replace(/\\/g, "").replace(/"/g, "'").replace(/\s+/g, " ").trim() + '"';

function sniff(buf) {
  if (buf.length < 12000) return null; // pequeno demais = erro/placeholder
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50) return "png";
  if (buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP") return "webp";
  return null;
}

async function getBytes(url, opts = {}) {
  const r = await fetch(url, { ...opts, headers: { "User-Agent": UA, ...(opts.headers || {}) }, signal: AbortSignal.timeout(opts.timeout || 120000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > 8 * 1024 * 1024) throw new Error("imagem maior que 8MB");
  return buf;
}

/* ---------- motores de IA ---------- */
async function flux(prompt) {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) throw new Error("sem CF_ACCOUNT_ID/CF_API_TOKEN");
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${CF_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, steps: 8 }),
    signal: AbortSignal.timeout(120000),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j?.result?.image) throw new Error(`Workers AI: HTTP ${r.status} ${JSON.stringify(j?.errors || "").slice(0, 200)}`);
  return Buffer.from(j.result.image, "base64");
}

// O plano gratuito da Pollinations limita pedidos seguidos (HTTP 402/429): espaçamos as chamadas.
let lastPoll = 0;
async function pollinations(prompt, seed) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&nologo=true&model=flux&seed=${seed}`;
  let last;
  for (let i = 0; i < 4; i++) {
    const wait = lastPoll + 20000 - Date.now();
    if (wait > 0) await sleep(wait);
    lastPoll = Date.now();
    try { return await getBytes(url, { timeout: 180000 }); } catch (e) { last = e; await sleep(30000 * (i + 1)); }
  }
  throw new Error(`Pollinations: ${last?.message}`);
}

async function gerarIA(prompt, seed) {
  const full = `${prompt}. ${STYLE}`;
  const reasons = [];
  for (const [engine, fn] of [["flux-1-schnell", () => flux(full)], ["pollinations", () => pollinations(full, seed)]]) {
    try {
      const buf = await fn();
      const ext = sniff(buf);
      if (!ext) throw new Error("resposta não é imagem válida");
      return { buf, ext, engine, credit: "Imagem ilustrativa gerada por IA", creditUrl: "", fallbackReason: reasons.join(" | ") };
    } catch (e) { reasons.push(`${engine}: ${e.message}`); }
  }
  throw new Error(reasons.join(" | "));
}

/* ---------- fotos reais com licença livre (Wikimedia Commons) ----------
   O Commons só aceita licenças livres que permitem uso comercial (CC0, domínio público, CC BY, CC BY-SA, FAL...).
   Guardamos autor + licença + link da página da foto para o crédito obrigatório. */
const LIC_OK = /^(cc0|public domain|pd|cc[ -]by(-sa)?( \d(\.\d)?)?|fal|attribution|no restrictions)/i;
const clean = (html) => String(html || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 80);

async function buscarFoto(query, usados) {
  const api = "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=20" +
    `&gsrsearch=${encodeURIComponent("filetype:bitmap " + query)}` +
    "&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1600&iiextmetadatafilter=LicenseShortName|Artist";
  const r = await fetch(api, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`Commons HTTP ${r.status}`);
  const pages = Object.values((await r.json())?.query?.pages || {}).sort((a, b) => a.index - b.index);
  const cands = pages
    .map((p) => ({ id: p.pageid, info: p.imageinfo?.[0] }))
    .filter(({ id, info }) => info && !usados.has(id) && /jpeg|png|webp/.test(info.mime || "") &&
      info.width >= 1200 && info.width >= info.height * 1.2 && LIC_OK.test(info.extmetadata?.LicenseShortName?.value || ""));
  for (const { id, info } of cands.slice(0, 6)) {
    try {
      const buf = await getBytes(info.thumburl || info.url);
      const ext = sniff(buf);
      if (!ext) continue;
      usados.add(id);
      const lic = info.extmetadata.LicenseShortName.value;
      const autor = clean(info.extmetadata?.Artist?.value) || "autor desconhecido";
      return { buf, ext, engine: "wikimedia-commons", credit: `Foto: ${autor} / ${lic} via Wikimedia Commons`, creditUrl: info.descriptionurl || "", fallbackReason: "" };
    } catch { /* tenta a próxima */ }
  }
  throw new Error(`nenhuma foto livre utilizável para "${query}"`);
}

/* ---------- front matter ---------- */
function splitFM(txt) {
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  return { fm: m[1], body: txt.slice(m[0].length), eol: txt.includes("\r\n") ? "\r\n" : "\n" };
}
const field = (fm, k) => {
  const m = fm.match(new RegExp(`^${k}:\\s*(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
};

async function salvar(res, nome) {
  await fs.mkdir(path.join(ROOT, OUT_DIR), { recursive: true });
  const rel = `${OUT_DIR}/${nome}.${res.ext}`;
  await fs.writeFile(path.join(ROOT, rel), res.buf);
  console.log(JSON.stringify({ engine: res.engine, file: rel, bytes: res.buf.length, fallbackReason: res.fallbackReason || null }));
  return "/" + rel;
}

/* ---------- imagem da própria fonte (Rockstar, sites de notícia) ----------
   imagem_url: link direto da imagem. imagem_pagina: link da matéria; pegamos o og:image/twitter:image dela.
   O crédito mostra o nome da fonte com link para a página original. */
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };

async function imagemDaFonte({ url, pagina, nome }) {
  let img = url, page = pagina || url;
  if (!img && pagina) {
    const r = await fetch(pagina, { headers: { "User-Agent": BROWSER_UA, Accept: "text/html" }, redirect: "follow", signal: AbortSignal.timeout(45000) });
    if (!r.ok) throw new Error(`página HTTP ${r.status}`);
    const html = await r.text();
    const tag = (p) => {
      const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${p}["'][^>]*>`, "i"));
      return m && (m[0].match(/content=["']([^"']+)["']/i) || [])[1];
    };
    img = tag("og:image:secure_url") || tag("og:image") || tag("twitter:image") || tag("twitter:image:src");
    if (!img) throw new Error("página sem og:image");
    img = new URL(img.replace(/&amp;/g, "&"), pagina).href;
  }
  const buf = await getBytes(img, { headers: { "User-Agent": BROWSER_UA, Referer: page } });
  const ext = sniff(buf);
  if (!ext) throw new Error("arquivo da fonte não é imagem válida");
  return { buf, ext, engine: `fonte:${host(page)}`, credit: `Imagem: ${nome || host(page)}`, creditUrl: page, fallbackReason: "" };
}

async function obter({ fonte, busca, prompt, seed, usados, origem }) {
  if (origem && (origem.url || origem.pagina)) {
    try { return await imagemDaFonte(origem); }
    catch (e) {
      const r = await obter({ fonte, busca, prompt, seed, usados });
      r.fallbackReason = `fonte: ${e.message}${r.fallbackReason ? " | " + r.fallbackReason : ""}`;
      return r;
    }
  }
  if (fonte === "foto" && busca) {
    try { return await buscarFoto(busca, usados); }
    catch (e) { const r = await gerarIA(prompt || busca, seed); r.fallbackReason = `foto: ${e.message}${r.fallbackReason ? " | " + r.fallbackReason : ""}`; return r; }
  }
  return gerarIA(prompt || busca, seed);
}

async function processar(file) {
  const full = path.join(POSTS_DIR, file);
  const txt = await fs.readFile(full, "utf8");
  const parts = splitFM(txt);
  if (!parts) return false;
  const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
  if (ONLY.length && !ONLY.includes(slug)) return false;
  let lines = parts.fm.split(/\r?\n/);
  let changed = false;
  const usados = new Set();
  const fm = parts.fm;

  /* capa */
  if (!/^cover:/m.test(fm) && !/^youtube:/m.test(fm) && field(fm, "cover_auto") !== "false") {
    const title = field(fm, "title");
    try {
      const res = await obter({
        fonte: field(fm, "cover_fonte") || "ia",
        busca: field(fm, "imagem_busca"),
        prompt: field(fm, "cover_prompt") || `dramatic scene illustrating: ${title}`,
        seed: hash(slug) % 100000,
        usados,
        origem: { url: field(fm, "imagem_url"), pagina: field(fm, "imagem_pagina"), nome: field(fm, "imagem_fonte") },
      });
      const src = await salvar(res, slug);
      const add = [`cover: ${yamlStr(src)}`, `cover_credit: ${yamlStr(res.credit)}`];
      if (res.creditUrl) add.push(`cover_credit_url: ${yamlStr(res.creditUrl)}`);
      const i = lines.findIndex((l) => /^categoria:/.test(l));
      lines.splice(i >= 0 ? i + 1 : lines.length, 0, ...add);
      changed = true;
    } catch (e) {
      console.log(JSON.stringify({ engine: null, file: null, post: slug, fallbackReason: e.message }));
    }
  }

  /* galeria: itens "  - busca: ..." ou "  - prompt: ..." sem src */
  const gi = lines.findIndex((l) => /^galeria:\s*$/.test(l));
  if (gi >= 0) {
    const items = [];
    for (let i = gi + 1; i < lines.length && /^\s/.test(lines[i]); i++) {
      if (/^\s*-\s/.test(lines[i])) items.push({ start: i, end: i });
      else if (items.length) items[items.length - 1].end = i;
    }
    for (let n = items.length - 1; n >= 0; n--) {
      const it = items[n];
      const block = lines.slice(it.start, it.end + 1).map((l) => l.replace(/^\s*-?\s*/, ""));
      const get = (k) => { const l = block.find((b) => b.startsWith(k + ":")); return l ? l.slice(k.length + 1).trim().replace(/^["']|["']$/g, "") : ""; };
      if (get("src")) continue;
      try {
        const res = await obter({ fonte: get("prompt") && !get("busca") ? "ia" : "foto", busca: get("busca"), prompt: get("prompt"), seed: (hash(slug) + n + 1) % 100000, usados,
          origem: { url: get("url"), pagina: get("pagina"), nome: get("fonte") } });
        const src = await salvar(res, `${slug}-${n + 1}`);
        const add = [`    src: ${yamlStr(src)}`, `    credito: ${yamlStr(res.credit)}`];
        if (res.creditUrl) add.push(`    credito_url: ${yamlStr(res.creditUrl)}`);
        lines.splice(it.end + 1, 0, ...add);
        changed = true;
      } catch (e) {
        console.log(JSON.stringify({ engine: null, file: null, post: slug, item: n + 1, fallbackReason: e.message }));
      }
    }
  }

  if (changed) await fs.writeFile(full, `---${parts.eol}${lines.join(parts.eol)}${parts.eol}---${parts.body}`);
  return changed;
}

const files = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith(".md")).sort().reverse();
let n = 0;
for (const f of files) if (await processar(f)) n++;
console.log(`posts atualizados: ${n}`);
