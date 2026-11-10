# Graph Report - dash-tv-2.0  (2026-11-10)

## Corpus Check
- Corpus is ~10,371 words - fits in a single context window. You may not need a graph.

## Summary
- 256 nodes · 492 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Dependencias do package.json
- Cards e secoes do ranking
- Mapa: camadas e calor
- Casca do app e slides
- Dashboard antigo (script.js)
- Dados de planilhas e noticias
- Config TypeScript
- API de orcamentos (GEDOC)
- Docker Compose
- PostCSS
- Tipos leaflet.heat

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `RankingSection()` - 15 edges
3. `PodioSection()` - 13 edges
4. `isNomeValido()` - 10 edges
5. `react` - 10 edges
6. `useAsync()` - 9 edges
7. `DataSlide()` - 8 edges
8. `formatarNome()` - 8 edges
9. `Dashboard()` - 7 edges
10. `CardMeta()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `PositivacaoSection()` --indirect_call--> `buscarPositivacao()`  [INFERRED]
  components/dashboard/PositivacaoSection.tsx → lib/sheets.ts
- `RankingSection()` --indirect_call--> `buscarRanking()`  [INFERRED]
  components/dashboard/RankingSection.tsx → lib/sheets.ts
- `Page()` --calls--> `Dashboard()`  [EXTRACTED]
  app/page.tsx → components/Dashboard.tsx
- `NewsTicker()` --calls--> `useAsync()`  [EXTRACTED]
  components/dashboard/NewsTicker.tsx → hooks/useAsync.ts
- `buscarPodioCompleto()` --calls--> `buscarCampeoes()`  [EXTRACTED]
  components/dashboard/PodioSection.tsx → lib/sheets.ts

## Import Cycles
- None detected.

## Communities (11 total, 2 thin omitted)

### Community 0 - "Dependencias do package.json"
Cohesion: 0.05
Nodes (42): dependencies, leaflet@^1.9.4, leaflet.heat@^1.0.0, lucide-react@^1.70.0, next@^15.5.29, react@^19.3.1, react-dom@^19.3.1, @supabase/supabase-js@^2.119.0 (+34 more)

### Community 1 - "Cards e secoes do ranking"
Cohesion: 0.13
Nodes (31): CardMeta(), CardSemMetaPrimeiraSemana(), escolherTamanho(), Props, Tamanho, TAMANHO_LISTA, TAMANHO_LISTA_UNICO, TAMANHOS_PRIMEIRA_SEMANA (+23 more)

### Community 2 - "Mapa: camadas e calor"
Cohesion: 0.09
Nodes (31): GRADIENTE, iniciarCalor(), paraPontos(), Ponto, adicionarCidadesERotas(), adicionarMarcadores(), adicionarRotas(), desenharLigacao() (+23 more)

### Community 3 - "Casca do app e slides"
Cohesion: 0.09
Nodes (22): metadata, poppins, Page(), Dashboard(), DataSlide(), Props, FotoProps, MapSlide (+14 more)

### Community 4 - "Dashboard antigo (script.js)"
Cohesion: 0.19
Nodes (19): adicionarRadarClima(), atualizarData(), atualizarNoticias(), carregarPodioCompleto(), carregarPositivacao(), carregarRanking(), estaNaPrimeiraSemanaDoMes(), formatarNome() (+11 more)

### Community 5 - "Dados de planilhas e noticias"
Cohesion: 0.16
Nodes (16): buscarNoticias(), extrairImagem(), ItemIbge, Props, parseNumber(), buscarCampeoes(), buscarPositivacao(), buscarRanking() (+8 more)

### Community 6 - "Config TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "API de orcamentos (GEDOC)"
Cohesion: 0.24
Nodes (11): dynamic, GET(), calcular(), carregarLinhas(), ConfigAusenteError, consultarMunicipio(), dormir(), Linha (+3 more)

### Community 8 - "Docker Compose"
Cohesion: 0.15
Nodes (12): container_name, healthcheck, image, ports, restart, volumes, interval, retries (+4 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@supabase/supabase-js` connect `Dependencias do package.json` to `API de orcamentos (GEDOC)`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Should `Dependencias do package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05102040816326531 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Cards e secoes do ranking` to `Dependencias do package.json`, `Mapa: camadas e calor`, `Casca do app e slides`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Should `Cards e secoes do ranking` be split into smaller, more focused modules?**
  _Cohesion score 0.1329268292682927 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Casca do app e slides` to `Dependencias do package.json`, `API de orcamentos (GEDOC)`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `Mapa: camadas e calor` be split into smaller, more focused modules?**
  _Cohesion score 0.08974358974358974 - nodes in this community are weakly interconnected._
- **Should `Casca do app e slides` be split into smaller, more focused modules?**
  _Cohesion score 0.08739495798319327 - nodes in this community are weakly interconnected._