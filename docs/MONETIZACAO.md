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
Desde 23/11/2026 (2ª rodada) TODOS os banners são 300×250, formato que funciona bem no celular:

| Slot | Onde aparece | Formato atual |
|---|---|---|
| `top` | Topo de TODAS as páginas (abaixo do menu) | 300×250 Adsterra |
| `footer` | Rodapé de TODAS as páginas | 300×250 Adsterra |
| `article` | Fim do texto de cada post | 300×250 Adsterra |
| `sidebar` | Barra lateral de cada post | 300×250 Adsterra |
| `infeed` | Meio dos cards da home | 300×250 Adsterra |

- Códigos por rede: `_includes/ads/adsterra.html` (um bloco por slot), `_includes/ads/custom.html` (outra rede) e o AdSense usa os IDs de `site.ads.slots`.
- Social Bar (barra flutuante global): **desligada em 23/11/2026 a pedido do dono** (era invasiva). Para voltar: `socialbar: true` em `_config.yml` (o código continua em `_includes/ads/socialbar.html`).
- Banner horizontal 728×90 original está guardado em comentário no fim de `_includes/ads/adsterra.html` (ficava cortado no celular; para restaurar é só colar o bloco no slot desejado).
- Trocar de empresa: gere os códigos no painel da rede nova, cole no arquivo correspondente e mude `provider`. Ou apenas `enabled: false` para tirar tudo.
- Os banners viram responsivos no celular via `assets/js/ads.js` (escala proporcional, funciona mesmo quando a rede injeta o banner depois da página carregada).
- Posts novos publicados pela automação recebem os banners automaticamente (os slots moram nos layouts, não nos posts).

## 2. Adsterra: rede em uso desde 23/11/2026

- **Sem exigência de tráfego** e aprovação rápida (costuma sair em minutos ou horas).
- Pagamento a partir de valores baixos (cerca de US$ 5 em alguns métodos; PayPal/transferência têm mínimos maiores), quinzenal.
- **Ativa hoje**: banners 300×250 no topo, rodapé, fim do artigo, sidebar e meio da home. **Social Bar desligada** (invasiva). Códigos em `_includes/ads/adsterra.html`.
- **Teste A/B de redes**: para comparar com outra rede, mude `provider` e `enabled` em `_config.yml`. Para medir, use o GA4 (`analytics.ga4_id`) + o relatório de ganhos da rede.
- **Boa notícia**: com a Social Bar desligada, o site usa só Banner (formato não intrusivo), o que ajuda numa futura aprovação no AdSense.
- Paga bem menos que o AdSense por mil visualizações.
- Para usar outra rede: `ads.provider: "custom"` e cole o código em `_includes/ads/custom.html`.

## 2.1 Indexação (ferramentas já instaladas)

- `robots.txt` e `sitemap.xml` já são gerados automaticamente (jekyll-sitemap).
- **IndexNow (Bing, Yandex, Seznam)**: o workflow `.github/workflows/indexar.yml` roda todo dia às 09:23 (Brasília), lê o sitemap e envia todas as URLs para `api.indexnow.org`. A chave do site fica em `<chave>.txt` na raiz. Para rodar manualmente: aba **Actions → Indexar → Run workflow**.
- **Google**: não tem ping automático (foi descontinuado). Faça 1 vez: cadastre o site no [Search Console](https://search.google.com/search-console), cole o código de verificação em `_config.yml → webmaster_verifications.google` e envie o sitemap `sitemap.xml`.
- Verificação do Bing/Yandex: mesma coisa, em `webmaster_verifications.bing/yandex`.
- A IA de posts não precisa fazer nada para a indexação: tudo roda sozinho no GitHub.

## 3. Outras redes (para depois)

| Rede | Observação |
|---|---|
| **Media.net** | Alternativa do Yahoo/Bing. Seletiva e paga melhor para tráfego dos EUA, pouco indicada para público brasileiro no início. |
| **Ezoic** | Informações conflitantes sobre requisito mínimo; confira no site. Faz sentido quando houver volume. |
| **Journey by Mediavine** | Programa para sites menores da Mediavine; exige tráfego mínimo mensal. Ótimo RPM quando chegar lá. |
| **Infolinks** | Anúncios dentro do texto, mais intrusivo. Evitar. |
| **Monetag / PropellerAds** | Focados em pop-under e push. Evitar. |

## 4. Renda extra não intrusiva

- **Programa de Associados da Amazon Brasil:** links para consoles, controles, headsets e edições físicas de GTA VI dentro de guias ("melhor headset para jogar GTA VI"). Sem banner piscando, só link.
- **YouTube:** cada post pode embutir um vídeo do canal (`youtube:` no front matter), o site passa a gerar views para o canal, que já é monetizado à parte.

## 5. Sobre o GitHub Pages

Os termos do GitHub Pages dizem que ele não deve ser usado como hospedagem principal de um **negócio online / e-commerce**. Um blog de fãs com alguns banners é um uso comum e, na prática, tolerado, mas, se o site crescer muito, migre o mesmo repositório para **Cloudflare Pages** ou **Netlify** (grátis, também compilam Jekyll) sem mudar nada no conteúdo.
