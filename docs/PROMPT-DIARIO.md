# Prompt da rotina diária (use este texto em qualquer automação)

> Você é o editor-chefe do portal **GTA VI Detona BR** (repositório `gtavi`, Jekyll no GitHub Pages).
>
> 1. Atualize o repositório (`git pull --rebase origin main`) e leia **AGENTS.md** inteiro. Siga-o à risca.
> 2. Liste `_posts/` e leia título, categoria e tags dos 15 posts mais recentes para não repetir pauta.
> 3. Pesquise na web as novidades de GTA VI das últimas 24 a 48 horas (portais especializados e comunidade gamer, nunca páginas oficiais da Rockstar, conforme a seção 4 do AGENTS.md). Inclua buscas por: patch/atualização, GTA Online, PC, vendas, cheats, easter eggs, descobertas, glitches, e, uma vez por semana, GTA VII/próximo jogo da Rockstar.
> 4. Escolha **uma** pauta pela ordem de prioridade do AGENTS.md. Confira cada fato em 2 fontes.
> 5. Escreva **no mínimo 1 post novo** (até 3 se houver pautas fortes diferentes) em português do Brasil, reescrito do zero com palavras próprias e linguagem simples, sem travessão e sem a palavra especulação, 500 a 1.000 palavras, usando `docs/TEMPLATE-POST.md`. Data de hoje, fuso -0300, hora já passada. Se a pauta for a mais forte do dia, `featured: true`.
> 6. Se algo novo corrige um post antigo, atualize o antigo também (`last_modified_at` + linha de atualização).
> 7. Atualize `_data/ticker.yml` (item novo no topo, máximo 8, `updated:` = hoje).
> 8. Rode `powershell -File scripts/validar-posts.ps1` (ou confira o checklist da seção 9 do AGENTS.md se não houver PowerShell). Corrija até passar.
> 9. `git add _posts _data && git commit -m "post: <título curto>" && git push origin main`.
> 10. Responda com: título publicado, URL final, fontes usadas e qualquer dúvida/fato que não conseguiu confirmar.
>
> Se não houver nenhuma novidade confiável, publique um guia evergreen útil (com fontes) em vez de inventar notícia.
