# CLAUDE.md

Leia e siga **AGENTS.md**, é o manual completo para publicar e editar conteúdo neste site.

Resumo rápido:
- Posts em `_posts/AAAA-MM-DD-slug.md` (modelo em `docs/TEMPLATE-POST.md`).
- Ticker em `_data/ticker.yml`; categorias em `_data/categories.yml`.
- Fato ≠ rumor (`especulacao: true`). Nunca copiar texto de outros sites. Fontes sempre no front matter.
- Validar com `powershell -File scripts/validar-posts.ps1`, depois commit `post: ...` e push em `main`.
- Rotina diária automática: `docs/AUTOMACAO.md`.
