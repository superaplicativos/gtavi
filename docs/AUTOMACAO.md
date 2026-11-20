# Automação: 1 post novo por dia

Todas as opções usam o mesmo texto: [`docs/PROMPT-DIARIO.md`](PROMPT-DIARIO.md). A IA lê o `AGENTS.md`, pesquisa, escreve, valida e faz push. O GitHub Pages publica sozinho ~1 min depois.

## Opção A — Rotina na nuvem do Claude (recomendada)

Roda nos servidores da Anthropic, **com o PC desligado**.

1. No Claude Code, peça: *"crie uma rotina diária às 8h para o repositório gtavi usando docs/PROMPT-DIARIO.md"* (ou use `/schedule`).
2. A rotina precisa de acesso ao repositório no GitHub (conecte o GitHub em claude.ai quando pedir).
3. Acompanhe as execuções em claude.ai/code.

## Opção B — Tarefa agendada no app Claude Desktop

Roda no seu computador, **só enquanto o app estiver aberto** (se estiver fechado no horário, roda quando abrir).

Requisitos: Git instalado e autenticado no GitHub, e o repositório clonado numa pasta fixa (ex.: `Documentos\gtavi`).

## Opção C — GitHub Actions + API da Anthropic

Roda no GitHub, 100% independente. Precisa de uma **chave da API da Anthropic** (cobrança por uso — um post/dia custa centavos a poucos dólares por mês).

1. Repositório → Settings → Secrets and variables → Actions → `ANTHROPIC_API_KEY`.
2. Crie `.github/workflows/post-diario.yml` usando a action oficial `anthropics/claude-code-action` com `on: schedule: - cron: "7 11 * * *"` (08:07 em Brasília) e o conteúdo de `PROMPT-DIARIO.md` como prompt, com permissão `contents: write`.

## Boas práticas

- **Revise de vez em quando.** A IA é instruída a nunca inventar, mas dê uma olhada semanal nos posts.
- **Um post por dia é o ideal** para SEO no começo; consistência vale mais que volume.
- Se o build do Pages falhar, veja a aba **Actions** — quase sempre é aspas quebrando o YAML de um post.
