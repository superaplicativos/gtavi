# Monetização com banners (sem anúncio intrusivo)

Pesquisa feita em 20/11/2026. Políticas mudam, confirme no site de cada rede antes de aplicar.

## Resumo da estratégia

| Fase | Quando | O que fazer |
|---|---|---|
| **0. Base** | Agora | Comprar domínio próprio, apontar para o GitHub Pages, publicar 1 post/dia, cadastrar no Google Search Console |
| **1. AdSense** | Com ~20 a 30 posts originais (3 a 4 semanas) | Solicitar AdSense, de preferência **usando a mesma conta AdSense do YouTube** |
| **2. Plano B** | Se o AdSense recusar ou demorar | Adsterra **somente no formato Banner** |
| **3. Escala** | Com tráfego consistente (10 mil+ visitas/mês) | Testar redes premium (Ezoic, Journey by Mediavine) e comparar RPM |

## 1. Google AdSense: a melhor opção para começar

- **Não exige número mínimo de visitas.** O que conta é conteúdo original, útil e um site com páginas de Sobre, Contato e Privacidade (já existem aqui).
- **Paga certo**, todo mês, em reais, por transferência bancária. Limite de pagamento equivalente a ~US$ 100.
- **Seu trunfo: o canal do YouTube.** Se o canal já está (ou entrar) no Programa de Parcerias, você já tem uma conta AdSense. Uma pessoa só pode ter **uma** conta, então adicione o site nessa mesma conta (AdSense → Sites → Adicionar site). Contas já verificadas costumam ter análise mais tranquila.
- Formatos não intrusivos: blocos de **display** nas posições que o site já tem (topo, entre cards, fim do artigo, barra lateral). **Não ative** anúncios automáticos de "vinheta" (tela cheia) nem "âncora" se quiser manter a experiência limpa.

### ⚠️ Problema importante: endereço github.io

O AdSense exige que você seja **dono do domínio raiz** e que o arquivo `ads.txt` fique na raiz (`https://seudominio.com.br/ads.txt`). Num endereço `usuario.github.io/gtavi`, a raiz é do GitHub, e o AdSense costuma recusar.

**Solução (barata):** compre um domínio próprio e conecte ao GitHub Pages.
- `.com.br` no Registro.br: cerca de R$ 40/ano. `.com`: cerca de US$ 10 a 15/ano.
- Sugestões: `gtavidetonabr.com.br`, `detonagta.com.br`, `gta6detona.com`.
- Passo a passo: repositório → Settings → Pages → Custom domain → digite o domínio; no Registro.br crie os registros `A` apontando para `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` e um `CNAME` de `www` para `usuario.github.io`. Marque **Enforce HTTPS**.
- Depois: em `_config.yml` troque `url` pelo domínio e `baseurl: ""`, e crie o arquivo `ads.txt` na raiz com a linha que o AdSense fornecer.

### Ativar no site

Em `_config.yml`:

```yaml
ads:
  enabled: true
  provider: "adsense"        # troque aqui para mudar de rede
  socialbar: false           # Social Bar só existe na Adsterra; desligue no AdSense
  adsense_client: "ca-pub-XXXXXXXXXXXXXXXX"
  slots: { top: "111", infeed: "222", article: "333", sidebar: "444" }
```

Cada slot é o ID de um bloco "Display" criado no painel do AdSense.

### Como o sistema de anúncios funciona (desde 23/11/2026)

As posições (slots) são fixas nos layouts e não mudam quando você troca de rede.
Desde 23/11/2026 (3ª rodada) os banners são imagens próprias de afiliado (proporção ~300×250, funciona bem no celular):

| Slot | Onde aparece | Formato atual |
|---|---|---|
| `top` | Logo abaixo do cabeçalho grande — hero da home, cabeçalho do post e da categoria (**1 banner no celular, 3 lado a lado no PC**) | 3× banner imagem Mercado Livre (fila) |
| `footer` | Rodapé de TODAS as páginas — **3 lado a lado no PC, 1 no celular** | 3× banner imagem Mercado Livre (fila) |
| `article` | Fim do texto de cada post | 1 banner imagem Mercado Livre (aleatório entre os 3) |
| `sidebar` | Barra lateral de cada post | 1 banner imagem Mercado Livre (aleatório entre os 3) |
| `infeed` | Meio dos cards da home — **3 lado a lado no PC, 1 no celular** | 3× banner imagem Mercado Livre (fila) |

- Códigos por rede: `_includes/ads/custom.html` (banners Mercado Livre, **em uso**), `_includes/ads/adsterra.html` (Adsterra, desligada) e o AdSense usa os IDs de `site.ads.slots`.
- Social Bar (barra flutuante global): **desligada em 23/11/2026 a pedido do dono** (era invasiva). Para voltar: `socialbar: true` em `_config.yml` (o código continua em `_includes/ads/socialbar.html`).
- Banner horizontal 728×90 original está guardado em comentário no fim de `_includes/ads/adsterra.html` (ficava cortado no celular; para restaurar é só colar o bloco no slot desejado).
- Trocar de empresa: gere os códigos no painel da rede nova, cole no arquivo correspondente e mude `provider`. Ou apenas `enabled: false` para tirar tudo.
- Os banners de imagem são responsivos por natureza (`width:100%; height:auto`), sem depender de `assets/js/ads.js` (esse script só escala iframes, útil se voltar uma rede que injeta iframe).
- **Filas (topo, meio da home e rodapé — 3 no PC / 1 no celular)**: com banners de imagem os 3 itens já vão no HTML e o CSS esconde os extras no celular (regras embutidas no include, imunes a cache; espelhadas em `assets/css/ads.css`). Em janela estreita os 3 encolhem juntos (flex nowrap — **nunca empilham**). No celular o JS do include sorteia 1 dos 3 banners a cada pageview; sem JavaScript fica o 1º.
- Posts novos publicados pela automação recebem os banners automaticamente (os slots moram nos layouts, não nos posts).

## 2. Banners Mercado Livre (afiliados): em uso desde 23/11/2026

- **Por quê trocou**: a Adsterra exibia anúncios de **bet (apostas)**, publicidade proibida/restrita no Brasil — a pedido do dono, a rede foi desligada no mesmo dia em que entrou.
- **O que é**: 3 banners oficiais do Mercado Livre com links de afiliado curtos (`meli.la`), comissionado por compra atribuída ao link. Comissão rastreada na conta de afiliado do Mercado Livre (nada para configurar no site).
- **Banners** (imagens em `assets/banners/`, 600px de largura, ~55-70 KB cada):
  1. `ps5-vr.jpg` → `https://meli.la/1YkssQF` — PlayStation VR2 Bundle Horizon
  2. `ps5.jpg` → `https://meli.la/29Y8p6s` — PlayStation 5 Bundle Astro Bot + GT7
  3. `disco.jpg` → `https://meli.la/1YXALkX` — Leitor de disco para PS5 Digital Edition (Slim)
- **Para trocar link ou imagem**: edite o bloco `meli_items` em `_includes/ads/custom.html` (href = link de afiliado, src = imagem). Novo banner: salve o arquivo em `assets/banners/` (ideal 600px de largura).
- **Sorteio**: nos slots únicos (article, sidebar) e no celular (filas) o banner mostrado é sorteado a cada pageview entre os 3 — distribui cliques entre os produtos. Sem JavaScript fica o 1º.
- **Boa notícia**: banner próprio não depende de rede de terceiros, não tem bet e não atrapalha uma futura aprovação no AdSense.

## 2.1 Adsterra: usada em 23/11/2026, desligada no mesmo dia

- **Motivo do desligamento**: o criativo do banner exibia casas de apostas (bet), proibido pelo dono por ser publicidade de bet no Brasil.
- **Sem exigência de tráfego** e aprovação rápida (costuma sair em minutos ou horas); paga bem menos que o AdSense por mil visualizações.
- Os códigos continuam guardados em `_includes/ads/adsterra.html` (banner 300×250 por slot e o 728×90 em comentário no fim). **Para voltar (não recomendado): `ads.provider: "adsterra"` em `_config.yml`** — mas os criativos da rede podem incluir bet de novo.
- **Teste A/B de redes**: para comparar com outra rede, mude `provider` e `enabled` em `_config.yml`. Para medir, use o GA4 (`analytics.ga4_id`) + o relatório de ganhos da rede.

## 3. Indexação (ferramentas já instaladas)

- `robots.txt` e `sitemap.xml` já são gerados automaticamente (jekyll-sitemap).
- **IndexNow (Bing, Yandex, Seznam)**: o workflow `.github/workflows/indexar.yml` roda todo dia às 09:23 (Brasília), lê o sitemap e envia todas as URLs para `api.indexnow.org`. A chave do site fica em `<chave>.txt` na raiz. Para rodar manualmente: aba **Actions → Indexar → Run workflow**.
- **Google**: não tem ping automático (foi descontinuado). Faça 1 vez: cadastre o site no [Search Console](https://search.google.com/search-console), cole o código de verificação em `_config.yml → webmaster_verifications.google` e envie o sitemap `sitemap.xml`.
- Verificação do Bing/Yandex: mesma coisa, em `webmaster_verifications.bing/yandex`.
- A IA de posts não precisa fazer nada para a indexação: tudo roda sozinho no GitHub.

## 4. Outras redes (para depois)

| Rede | Observação |
|---|---|
| **Media.net** | Alternativa do Yahoo/Bing. Seletiva e paga melhor para tráfego dos EUA, pouco indicada para público brasileiro no início. |
| **Ezoic** | Informações conflitantes sobre requisito mínimo; confira no site. Faz sentido quando houver volume. |
| **Journey by Mediavine** | Programa para sites menores da Mediavine; exige tráfego mínimo mensal. Ótimo RPM quando chegar lá. |
| **Infolinks** | Anúncios dentro do texto, mais intrusivo. Evitar. |
| **Monetag / PropellerAds** | Focados em pop-under e push. Evitar. |

## 5. Renda extra não intrusiva

- **Programa de Associados da Amazon Brasil:** links para consoles, controles, headsets e edições físicas de GTA VI dentro de guias ("melhor headset para jogar GTA VI"). Sem banner piscando, só link.
- **YouTube:** cada post pode embutir um vídeo do canal (`youtube:` no front matter), o site passa a gerar views para o canal, que já é monetizado à parte.

## 6. Sobre o GitHub Pages

Os termos do GitHub Pages dizem que ele não deve ser usado como hospedagem principal de um **negócio online / e-commerce**. Um blog de fãs com alguns banners é um uso comum e, na prática, tolerado, mas, se o site crescer muito, migre o mesmo repositório para **Cloudflare Pages** ou **Netlify** (grátis, também compilam Jekyll) sem mudar nada no conteúdo.
