# AGENTS.md: manual operacional para IAs que atualizam o GTA VI Detona BR

Este arquivo é a **fonte da verdade** para qualquer agente de IA (Claude, etc.) que publique ou edite conteúdo neste repositório. Leia inteiro antes de mexer em qualquer coisa.

---

## 1. O que é o site

- Portal de fãs **brasileiro, não oficial**, 100% sobre GTA VI (e rumores sobre GTA VII).
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
| `date` | ✅ | `2026-11-21 09:00:00 -0300`, **sempre fuso -0300** e hora **no passado** (Jekyll não publica posts no futuro). |
| `categoria` | ✅ | Uma das chaves de `_data/categories.yml`: `noticias`, `cheats`, `dicas`, `easter-eggs`, `descobertas`, `gta-vii`, `videos`. |
| `description` | ✅ | 140 a 200 caracteres. Vira o resumo do card e a meta description (SEO). |
| `cover_text` | ✅* | 1 a 2 palavras GIGANTES na capa automática (ex.: `"Patch"`, `"99"`). *Obrigatório se não houver `cover`. |
| `tags` | ✅ | Lista `[tag-um, tag-dois]`, minúsculas, sem acento. 3 a 6 tags. |
| `fontes` | ✅ | Lista de `- nome: / url:` com **todas** as fontes consultadas. |
| `featured` | opcional | `true` para ir aos Destaques. No máximo **1 post featured por dia**; os destaques mostram os 5 mais recentes marcados. |
| `especulacao` | opcional | `true` em qualquer rumor/teoria. Mostra selo amarelo + aviso. **Obrigatório na categoria `gta-vii`.** |
| `cover_fonte` / `imagem_busca` / `cover_prompt` / `galeria` | ✅ | Ver seção 3.1, imagens automáticas. |
| `youtube` | opcional | Só o ID do vídeo (ex.: `dQw4w9WgXcQ`). Embute o player e usa a thumb como capa. Use para vídeos do canal. |
| `cover` | opcional | `/assets/img/posts/arquivo.jpg`, **somente imagens próprias** (prints do próprio dono, thumbs do canal) ou com licença clara. |
| `cover_alt` | opcional | Texto alternativo da imagem. |
| `last_modified_at` | opcional | Ao atualizar um post antigo: `2026-11-22 10:00:00 -0300`. |

## 3.1 Imagens (OBRIGATÓRIO em todo post)

Todo post precisa de imagem de verdade. **A IA não baixa imagens manualmente**: ela só preenche os campos abaixo, e o GitHub Action `.github/workflows/imagens.yml` (script `scripts/capas.mjs`) gera/baixa as imagens automaticamente após o push, salva em `assets/img/posts/` e grava `cover`, `cover_credit` e `src` no próprio post.

**Ordem de prioridade da capa:** 1) imagem do jogo vinda da fonte (`imagem_pagina`/`imagem_url`) → 2) foto real de local (`imagem_busca`) → 3) IA (`cover_prompt`). Se uma falhar, o script cai para a próxima.

| Campo | Uso |
|---|---|
| `imagem_pagina` | **Prioridade 1 para tudo que é do jogo.** Link da matéria de um portal especializado ou da comunidade gamer (IGN, GameSpot, Kotaku, Dexerto, Eurogamer, VGC, TechRadar, Insider Gaming, Omelete, TecMundo, Critical Hits, GTAForums, r/GTA6 etc.). **Nunca use páginas oficiais da Rockstar** (rockstargames.com, Newswire, redes oficiais). O script pega a imagem principal (og:image), salva no repositório e credita com link. |
| `imagem_url` | Alternativa: link direto de uma imagem específica (ex.: uma imagem de dentro da matéria de um portal). |
| `imagem_fonte` | Nome da fonte para o crédito: `"IGN"`, `"GameSpot"`, `"Kotaku"`... |
| `cover_fonte` | `foto` = foto REAL com licença livre (Wikimedia Commons, uso comercial permitido, crédito automático). `ia` = imagem gerada por IA (Cloudflare FLUX, com Pollinations de reserva). |
| `imagem_busca` | Termo de busca **em inglês** para a foto real. Use locais reais que inspiram Leonida: `"Miami Beach Ocean Drive"`, `"Everglades airboat"`, `"Florida Keys bridge"`, `"Miami skyline night"`. |
| `cover_prompt` | Descrição **em inglês** da cena para IA (sempre preencha: é o plano B se a foto falhar). Cena original, cinematográfica. |
| `galeria` | 2 a 4 imagens: itens com `pagina:` ou `url:` + `fonte:` (imagem do jogo vinda de uma fonte), `busca:` (foto real de local) ou `prompt:` (IA), sempre com `legenda:` em português. |

Exemplo:

```yaml
imagem_pagina: "https://www.ign.com/articles/..."
imagem_fonte: "IGN"
cover_fonte: foto
imagem_busca: "Miami Beach Ocean Drive night"
cover_prompt: "neon-lit art deco hotels on a beach avenue at night, palm trees, wet street reflections"
galeria:
  - pagina: "https://www.ign.com/articles/..."
    fonte: "IGN"
    legenda: "O local do easter egg no jogo"
  - busca: "Everglades airboat"
    legenda: "Os pântanos da Flórida, inspiração para Leonida"
```

**Regras de imagem:**
- Toda imagem vinda de outro site **sempre** leva crédito com o nome da fonte e link para a página original (o script faz isso automaticamente).
- Imagens sempre de portais especializados e da comunidade gamer. **Nunca** de páginas oficiais da Rockstar.
- Vídeos: use `youtube:` com o ID (trailer oficial ou vídeo do canal) para embutir o player no topo do post.
- Prompts de IA: cena original, sem logos e sem textos.
- Prints do próprio dono do canal (capturas de PS5/Xbox): salve em `assets/img/posts/`, use `cover: "/assets/img/posts/arquivo.jpg"` e `cover_credit: "Captura: GTA VI Detona BR"`.
- Não preencha `cover`, `cover_credit` nem `src` à mão (exceto prints próprios): o Action faz isso. Para trocar uma imagem já gerada, apague essas linhas e o Action gera de novo.

## 4. Fluxo diário de pesquisa (no mínimo 1 post novo por dia)

1. **Checar o que já existe**: liste `_posts/` e leia títulos/tags dos últimos 15 posts para **não repetir pauta**.
2. **Pesquisar** (buscas na web das últimas 24 a 48h), priorizando:
   - **Não use páginas oficiais da Rockstar como fonte ou imagem.** Quando houver anúncio oficial, cite a cobertura dos portais especializados.
   - Imprensa grande: IGN, GameSpot, Kotaku, Eurogamer, Polygon, VGC, TechRadar, Forbes (Paul Tassi), Bloomberg (Jason Schreier), Insider Gaming, Dexerto, PowerPyx (troféus/guias).
   - Brasil: Omelete, TecMundo/Voxel, Critical Hits, Adrenaline, The Enemy.
   - Comunidade: r/GTA6, GTAForums, GTAVice.net (sempre como "relatos da comunidade").
3. **Escolher a pauta** pela ordem de prioridade:
   1. Notícia oficial nova (patch, anúncio, GTA Online, PC, números de vendas, prêmio).
   2. Descoberta/easter egg viral confirmado por 2+ fontes.
   3. Cheat/guia com informação nova ou corrigida.
   4. Rumores sobre GTA VII **com gatilho real** (declaração de executivo, vaga de emprego, vazamento noticiado por veículo grande). Ritmo ideal: **1 post GTA VII por semana**.
   5. Sem novidade forte? Guia evergreen (ex.: "melhores carros", "como ganhar dinheiro rápido", "mapa de colecionáveis") baseado em fontes confiáveis.
4. **Checar fatos**: todo número, data ou nome precisa bater em **pelo menos 2 fontes**, ou ser de fonte oficial. Se só uma fonte grande deu, escreva "segundo o site X".
5. **Escrever** (seção 5), **atualizar ticker** (seção 6), **commit + push**.
6. Se surgir algo que **corrige** um post antigo: edite o antigo, adicione `last_modified_at` e uma linha "**Atualização (dd/mm):** ...". Não apague histórico.

## 5. Regras de escrita (não negociáveis)

- **Nunca copie** texto de outros sites. Leia, entenda e **reescreva do zero** com palavras próprias, para o texto nunca ficar parecido com o original. Citação direta: no máximo 1 frase curta, entre aspas, com crédito.
- **Linguagem simples e fácil de entender**: frases curtas, sem termos técnicos sem explicação, como se estivesse explicando para um amigo que joga.
- **Proibido usar travessão** (os caracteres de traço longo e traço médio). Use vírgula, dois-pontos ou ponto final.
- **Proibido usar a palavra especulação** (e variações) no site. Para algo não confirmado, use rumor, teoria ou ainda não confirmado.
- **Fato ≠ rumor.** Rumor sempre com `especulacao: true` (é só um campo interno; o site mostra o selo RUMOR) e linguagem condicional ("segundo rumores", "ainda não confirmado").
- **Nunca invente** cheats, botões, datas, números de vendas ou locais. Na dúvida, escreva que ainda não foi confirmado.
- **Nada de** links para pirataria, mods em console, "download para PC", geradores de dinheiro, vazamentos com material roubado.
- **Imagens:** sempre via seção 3.1 (imagem da fonte com crédito, foto real ou IA, automáticas). A capa em gradiente + `cover_text` é só o plano de emergência.
- Estrutura: lide de 2 a 3 frases → seções `##` → listas/tabelas quando ajudar → fechamento com chamada para o canal (`[canal]({{ site.social.youtube }})`).
- Tamanho: **500 a 1.000 palavras** para notícias e guias; mínimo 400.
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

Para criar uma categoria nova (raro, evite inflar o menu):
1. Adicione a chave em `_data/categories.yml` (nome, short, description, color, color2, icon).
2. Crie `categorias/<chave>.html` copiando um existente e trocando `categoria`, `title` e `permalink`.
3. Ícones disponíveis em `_includes/icons.html`: `i-news i-cheat i-tip i-egg i-scope i-crystal i-play`.

## 8. Anúncios

Configuração em `_config.yml` → `ads`. Detalhes completos em `docs/MONETIZACAO.md`. A IA **não** ativa anúncios nem cola códigos de rede sem pedido explícito do dono.

## 9. Checklist antes do commit

- [ ] Nome do arquivo `AAAA-MM-DD-slug.md` e `date` no mesmo dia, fuso `-0300`, hora já passada
- [ ] `categoria` existe em `_data/categories.yml`
- [ ] `description`, `tags`, `fontes`, `cover_text` preenchidos
- [ ] `cover_fonte` + `cover_prompt` (e `imagem_busca` se for `foto`) preenchidos; galeria quando o post fala de lugares
- [ ] Rumor? → especulacao: true$([Environment]::NewLine)- [ ] Nenhum travessão e nenhuma palavra especulação no texto
- [ ] Imagem de portal especializado/comunidade, nunca da Rockstar oficial
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
