# AGENTS.md — manual operacional para IAs que atualizam o GTA VI Detona BR

Este arquivo é a **fonte da verdade** para qualquer agente de IA (Claude, etc.) que publique ou edite conteúdo neste repositório. Leia inteiro antes de mexer em qualquer coisa.

---

## 1. O que é o site

- Portal de fãs **brasileiro, não oficial**, 100% sobre GTA VI (e especulação sobre GTA VII).
- Idioma: **português do Brasil**, tom jovem, empolgado, mas jornalístico e correto.
- Stack: **Jekyll puro no GitHub Pages** (sem build próprio, sem Node). O GitHub compila sozinho a cada push na branch `main`.
- URL: `https://<usuario>.github.io/gtavi/` (configurada em `_config.yml` → `url` + `baseurl`).

## 2. Mapa do repositório

| Caminho | Para que serve | A IA edita? |
|---|---|---|
| `_posts/AAAA-MM-DD-slug.md` | **As matérias.** Um arquivo por post. | ✅ Sempre |
| `_data/ticker.yml` | Faixa "URGENTE" do topo | ✅ Todo dia |
| `_data/categories.yml` | Lista de categorias (nome, cores, ícone) | ⚠️ Só ao criar categoria |
| `categorias/<slug>.html` | Página de cada categoria | ⚠️ Só ao criar categoria |
| `_config.yml` | Título, links sociais, anúncios, analytics | ⚠️ Só se o dono pedir |
| `assets/img/posts/` | Imagens próprias das matérias | ✅ Quando houver imagem própria/licenciada |
| `_layouts/`, `_includes/`, `assets/css`, `assets/js` | Visual do site | ❌ Não, salvo pedido explícito |
| `index.html` | Home (monta tudo automaticamente) | ❌ Não precisa |
| `docs/` | Documentação (monetização, automação, template) | Só para manter atualizada |

**A home se monta sozinha**: destaques = posts com `featured: true` (os 5 mais recentes); "Últimas do dia" = 9 posts mais recentes; faixa GTA VII = posts com `categoria: gta-vii`. Não é preciso editar HTML para publicar.

## 3. Como criar um post (passo a passo)

1. Nome do arquivo: `_posts/AAAA-MM-DD-slug-em-minusculas-sem-acento.md`
   - slug curto (3 a 8 palavras), com palavras-chave: `gta-vi-patch-1-02-notas`.
2. Copie o modelo de `docs/TEMPLATE-POST.md`.
3. Preencha o **front matter** (tabela abaixo).
4. Escreva o corpo em Markdown (regras na seção 5).
5. Atualize `_data/ticker.yml` (seção 6).
6. Rode a checagem: `powershell -File scripts/validar-posts.ps1` (se disponível no ambiente).
7. Commit com mensagem `post: <título curto>` e push em `main`.

### Front matter

| Campo | Obrigatório | Exemplo / regra |
|---|---|---|
| `title` | ✅ | Até ~90 caracteres. Use aspas. Sem clickbait mentiroso. |
| `date` | ✅ | `2026-11-21 09:00:00 -0300` — **sempre fuso -0300** e hora **no passado** (Jekyll não publica posts no futuro). |
| `categoria` | ✅ | Uma das chaves de `_data/categories.yml`: `noticias`, `cheats`, `dicas`, `easter-eggs`, `descobertas`, `gta-vii`, `videos`. |
| `description` | ✅ | 140–200 caracteres. Vira o resumo do card e a meta description (SEO). |
| `cover_text` | ✅* | 1–2 palavras GIGANTES na capa automática (ex.: `"Patch"`, `"99"`). *Obrigatório se não houver `cover`. |
| `tags` | ✅ | Lista `[tag-um, tag-dois]`, minúsculas, sem acento. 3 a 6 tags. |
| `fontes` | ✅ | Lista de `- nome: / url:` com **todas** as fontes consultadas. |
| `featured` | opcional | `true` para ir aos Destaques. No máximo **1 post featured por dia**; os destaques mostram os 5 mais recentes marcados. |
| `especulacao` | opcional | `true` em qualquer rumor/teoria. Mostra selo amarelo + aviso. **Obrigatório na categoria `gta-vii`.** |
| `youtube` | opcional | Só o ID do vídeo (ex.: `dQw4w9WgXcQ`). Embute o player e usa a thumb como capa. Use para vídeos do canal. |
| `cover` | opcional | `/assets/img/posts/arquivo.jpg` — **somente imagens próprias** (prints do próprio dono, thumbs do canal) ou com licença clara. |
| `cover_alt` | opcional | Texto alternativo da imagem. |
| `last_modified_at` | opcional | Ao atualizar um post antigo: `2026-11-22 10:00:00 -0300`. |

## 4. Fluxo diário de pesquisa (1 post novo por dia)

1. **Checar o que já existe**: liste `_posts/` e leia títulos/tags dos últimos 15 posts para **não repetir pauta**.
2. **Pesquisar** (buscas na web das últimas 24–48h), priorizando:
   - Oficiais: rockstargames.com/newswire, @RockstarGames, comunicados e resultados da Take-Two (take2games.com, sec.gov), Xbox Wire, PlayStation Blog.
   - Imprensa grande: IGN, GameSpot, Kotaku, Eurogamer, Polygon, VGC, TechRadar, Forbes (Paul Tassi), Bloomberg (Jason Schreier), Insider Gaming, Dexerto, PowerPyx (troféus/guias).
   - Brasil: Omelete, TecMundo/Voxel, Critical Hits, Adrenaline, The Enemy.
   - Comunidade: r/GTA6, GTAForums, GTAVice.net (sempre como "relatos da comunidade").
3. **Escolher a pauta** pela ordem de prioridade:
   1. Notícia oficial nova (patch, anúncio, GTA Online, PC, números de vendas, prêmio).
   2. Descoberta/easter egg viral confirmado por 2+ fontes.
   3. Cheat/guia com informação nova ou corrigida.
   4. Especulação GTA VII **com gatilho real** (declaração de executivo, vaga de emprego, vazamento noticiado por veículo grande). Ritmo ideal: **1 post GTA VII por semana**.
   5. Sem novidade forte? Guia evergreen (ex.: "melhores carros", "como ganhar dinheiro rápido", "mapa de colecionáveis") baseado em fontes confiáveis.
4. **Checar fatos**: todo número, data ou nome precisa bater em **pelo menos 2 fontes**, ou ser de fonte oficial. Se só uma fonte grande deu, escreva "segundo o site X".
5. **Escrever** (seção 5), **atualizar ticker** (seção 6), **commit + push**.
6. Se surgir algo que **corrige** um post antigo: edite o antigo, adicione `last_modified_at` e uma linha "**Atualização (dd/mm):** ...". Não apague histórico.

## 5. Regras de escrita (não negociáveis)

- **Nunca copie** texto de outros sites. Leia, entenda e escreva com palavras próprias. Citação direta: no máximo 1 frase curta, entre aspas, com crédito.
- **Fato ≠ rumor.** Rumor sempre com `especulacao: true` e linguagem condicional ("segundo rumores", "ainda não confirmado").
- **Nunca invente** cheats, botões, datas, números de vendas ou locais. Na dúvida, escreva que ainda não foi confirmado.
- **Nada de** links para pirataria, mods em console, "download para PC", geradores de dinheiro, vazamentos com material roubado.
- **Imagens:** não use arte oficial da Rockstar nem imagens de outros sites. A capa automática (gradiente + `cover_text`) é o padrão.
- Estrutura: lide de 2–3 frases → seções `##` → listas/tabelas quando ajudar → fechamento com chamada para o canal (`[canal]({{ site.social.youtube }})`).
- Tamanho: **500–1.000 palavras** para notícias e guias; mínimo 400.
- Links internos: sempre com `{{ '/AAAA/MM/DD/slug/' | relative_url }}`. Coloque **pelo menos 1 link interno** para outro post relevante.
- Callouts disponíveis no corpo:
  - `<div class="callout callout--info">texto</div>` (informação/status)
  - `<div class="callout callout--warn">texto</div>` (alerta)
- Use `> citação` para destacar uma frase importante.

## 6. Ticker (`_data/ticker.yml`)

- Mantenha **4 a 8 itens**, os mais recentes no topo, até ~90 caracteres cada.
- Ao publicar, adicione 1 item do post novo no topo e remova o mais velho se passar de 8.
- Atualize `updated:` com a data do dia.
- `url` é o caminho do post **sem** baseurl: `/AAAA/MM/DD/slug/`.

## 7. Categorias

Para criar uma categoria nova (raro — evite inflar o menu):
1. Adicione a chave em `_data/categories.yml` (nome, short, description, color, color2, icon).
2. Crie `categorias/<chave>.html` copiando um existente e trocando `categoria`, `title` e `permalink`.
3. Ícones disponíveis em `_includes/icons.html`: `i-news i-cheat i-tip i-egg i-scope i-crystal i-play`.

## 8. Anúncios

Configuração em `_config.yml` → `ads`. Detalhes completos em `docs/MONETIZACAO.md`. A IA **não** ativa anúncios nem cola códigos de rede sem pedido explícito do dono.

## 9. Checklist antes do commit

- [ ] Nome do arquivo `AAAA-MM-DD-slug.md` e `date` no mesmo dia, fuso `-0300`, hora já passada
- [ ] `categoria` existe em `_data/categories.yml`
- [ ] `description`, `tags`, `fontes`, `cover_text` preenchidos
- [ ] Rumor? → `especulacao: true`
- [ ] Nenhum texto copiado; números conferidos em 2 fontes
- [ ] Pelo menos 1 link interno e chamada para o canal
- [ ] Ticker atualizado
- [ ] Aspas duplas dentro de `title`/`description` foram trocadas por “aspas curvas” (evita quebrar o YAML)

## 10. Comandos git

```bash
git pull --rebase origin main
git add _posts _data
git commit -m "post: <título curto>"
git push origin main
```

Depois do push, o GitHub Pages leva ~1 minuto para publicar. Se o build falhar, a aba **Actions** do repositório mostra o erro (geralmente YAML inválido no front matter).
