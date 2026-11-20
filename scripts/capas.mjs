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

async function pollinations(prompt, seed) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&nologo=true&model=flux&seed=${seed}`;
  let last;
  for (let i = 0; i < 3; i++) {
    try { return await getBytes(url, { timeout: 180000 }); } catch (e) { last = e; await sleep(5000 * (i + 1)); }
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

/* ---------- fotos reais com licença livre (Openverse) ---------- */
function commonsThumb(url) {
  // https://upload.wikimedia.org/wikipedia/commons/a/ab/Arq.jpg -> .../commons/thumb/a/ab/Arq.jpg/1600px-Arq.jpg
  const m = url.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/([0-9a-f])\/([0-9a-f]{2})\/(.+)$/);
  return m ? `https://upload.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/${m[3]}/1600px-${m[3]}` : url;
}

async function buscarFoto(query, usados) {
  const api = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial&mature=false&page_size=30`;
  const r = await fetch(api, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`Openverse HTTP ${r.status}`);
  const { results = [] } = await r.json();
  const cands = results
    .filter((x) => x.url && !usados.has(x.id) && (x.width || 0) >= 1000 && (!x.height || x.width >= x.height))
    .filter((x) => !/svg|gif/i.test(x.filetype || ""));
  for (const x of cands.slice(0, 6)) {
    try {
      const big = (x.width || 0) > 1600 ? commonsThumb(x.url) : x.url;
      let buf;
      try { buf = await getBytes(big); } catch { buf = await getBytes(x.url); }
      const ext = sniff(buf);
      if (!ext) continue;
      usados.add(x.id);
      const lic = `${(x.license || "").toUpperCase()} ${x.license_version || ""}`.trim();
      const autor = x.creator || "autor desconhecido";
      return { buf, ext, engine: `openverse:${x.source || x.provider}`, credit: `Foto: ${autor} / ${lic}`, creditUrl: x.foreign_landing_url || "", fallbackReason: "" };
    } catch { /* tenta o próximo */ }
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

async function obter({ fonte, busca, prompt, seed, usados }) {
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
        const res = await obter({ fonte: get("prompt") && !get("busca") ? "ia" : "foto", busca: get("busca"), prompt: get("prompt"), seed: (hash(slug) + n + 1) % 100000, usados });
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
