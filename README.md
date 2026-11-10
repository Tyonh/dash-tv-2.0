# Dashboard TV

Painel de TV da equipe de vendas (TV na vertical, ligada das 7h às 18h). Next.js 15, TypeScript, Tailwind v4 e ícones lucide.

## O que o painel mostra

O painel gira entre quatro telas:

| Tela | Tempo | Conteúdo |
|---|---|---|
| Dados | 20 s | Ranking de meta individual, positivação (meta x realizado), pódio do mês, clima de Fortaleza e notícias do IBGE. Quem bate a meta ganha barra dourada, troféu e faíscas |
| Mapa | 15 s | Mapa do Nordeste com rotas, nuvens e radar de chuva |
| Vento | 7 s | Fluxo de vento a 10 m (NOAA GFS), mapa colorido pela velocidade com partículas brancas |
| Satélite | 7 s | Imagem real do GOES-19 (NOAA) em cores reais, recortada sobre o Nordeste |

O painel portuário aparece no topo de todas as telas de mapa. Sem contêineres na lista, mostra o aviso de que todos chegaram ao destino.

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev                  # http://localhost:3000
npm test                     # testes das regras de dados
npm run lint                 # checagem de tipos (tsc)
npm run build && npm start   # produção
```

Variáveis (`.env.local`, veja `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`: Supabase do GEDOC (só no servidor; a chave de serviço nunca vai ao navegador). Usadas por `/api/orcamentos`.
- `DIAS_JANELA`: janela de orçamentos em dias (padrão 90).
- `OPENWEATHER_API_KEY`: camada de nuvens, só no servidor (o navegador pede os blocos a `/api/nuvens`, que cacheia 10 min). Sem chave, o mapa usa um simulador desenhado.

## Estrutura

- `app/`: página e rotas de API (`/api/orcamentos`, `/api/vento`, `/api/satelite`).
- `app/fonts/`: fonte Poppins (licença OFL) servida pelo próprio projeto, então o build não depende do Google Fonts.
- `components/`: `Dashboard.tsx` (rodízio de telas), `dashboard/` (ranking, positivação, pódio, notícias, clima) e `map/` (mapa, vento, satélite).
- `lib/`: constantes, formatação, regras de meta (`meta.ts`), semana do mês, recarga diária e `server/` (código que só roda no servidor).
- `hooks/`: busca de dados com estado de falha, contagem animada, recarga diária.
- `tests/`: testes com o executor nativo do Node (`node:test`), sem pacote extra.

## Fontes de dados

- Planilhas Google (CSV público): ranking, positivação, pódio e campeões das semanas.
- NOAA GFS via NOMADS: vento a 10 m, decodificado no servidor com `@mattnucc/gribberish`.
- NOAA GOES-19 (setor `nsa`): imagem do satélite; o navegador baixa direto da NOAA.
- OpenWeather (nuvens) e RainViewer (radar de chuva).
- IBGE: notícias do rodapé.

## Comportamentos para saber

- **Tamanho de tela:** o painel é desenhado em 1080x1920 e o palco se ajusta sozinho a qualquer tela (1080p, 4K ou outra proporção), mantendo a proporção e centralizando; em telas que não são 9:16 sobram faixas pretas. É uma escala do desenho inteiro, não um layout que se reorganiza. No 4K o texto e as barras ficam nítidos, mas os mapas (blocos do Google) e as partículas do vento são desenhados em 1080 e ampliados, então ficam mais suaves.

- A página **recarrega sozinha todo dia às 6h30** (horário do computador) para liberar memória e pegar versão nova.
- Se uma planilha não responde, a seção mostra um aviso e mantém o último dado bom.
- Cada quadro de satélite tem ~18,5 MB; com a TV ligada 11 h, são cerca de 1,2 GB por dia no computador que exibe o painel. Para reduzir, troque `TAMANHO` em `lib/server/satelite.ts` para `3600x2160`.

## Implantação (VPS)

Este projeto roda como servidor Node (não é mais site estático). Atenção:

- O decodificador do vento só tem binário para **Linux x64 com glibc** (use imagem Debian, por exemplo `node:22-bookworm-slim`; **não** Alpine) e para Windows e macOS. Não há versão para ARM.
- Os dados do GEDOC, do NOMADS e da NOAA são buscados a partir do IP da VPS.
- `docker compose up -d --build` sobe o Next (`Dockerfile`, imagem Debian) em 127.0.0.1:3000, lendo `.env.local`. O Nginx da VPS (`deploy/nginx/dash-tv.conf`) faz proxy para essa porta; falta só o HTTPS (certbot).

## Pendências

- Calor de vendas por cidade: depende do GEDOC registrar a cidade do cliente (preenchida pelo CNPJ).
- Calor de temperatura no mapa: fonte ainda não escolhida.
- Segurança: faltam CSP e limite de requisições nas rotas `/api`.

Planos e referências de pesquisa: `referencias/`.
