# Plano do painel de TV (versão em revisão)

Estado: **nada disso foi implementado**. Só entra em código depois da sua aprovação.
Premissas confirmadas por você: TV vertical (LG ~42"), ligada **das 7h às 18h** (11 h/dia), podendo chegar a 4K; stack Next.js + TypeScript + Tailwind + lucide; segurança fica para **depois**; `site/` antigo só sai depois da aprovação final do design.

## 1. Mapa: 5 cenas de 7 segundos (transição suave de ~1 s entre elas)

| # | Cena | Fonte | Situação |
|---|---|---|---|
| 1 | Calor de **vendas** sobre o mapa | GEDOC (orçamentos por cidade) | Bloqueada: hoje 0 de 908 orçamentos têm cidade. Depende da parte 3 |
| 2 | Calor de **temperatura** | Previsão do INMET por município (temperatura máxima do dia) **ou** camada `temp_new` do OpenWeather | **Decidir a fonte.** INMET é oficial e por cidade, mas é previsão. OpenWeather é só uma mancha suave, sem valor por cidade |
| 3 | **Nuvens** reais sobre o mapa | OpenWeather `clouds_new` (chave já funciona) | Funciona, mas cobre o mapa com um véu branco. **Decidir a opacidade** |
| 4 | **Satélite real** tela cheia | NOAA GOES-19, setor `nsa` | Viável. Sem sobrepor nada, então não precisa georreferenciar |
| 5 | **Fluxo de vento** animado (partículas coloridas pela velocidade, no estilo da referência que você enviou) | NOAA GFS (componentes U e V do vento a 10 m) + biblioteca leaflet-velocity | Viável pelo teste dos dados; **falta decidir como decodificar** (ver abaixo) |

Ciclo total: 5 cenas x 7 s = 35 s no mapa, mais o slide de dados (hoje 20 s).

### Cena 4: detalhes
- **Status: implementada** (primeira versão): é o 4º slide do rodízio (7 s). Rota `GET /api/satelite` acha o quadro mais novo na lista da NOAA (cache de 5 min) e o navegador baixa a imagem 7200x4320 direto da NOAA, em segundo plano, a cada 10 min (só troca quando termina de baixar). O recorte vertical do Nordeste é feito no próprio navegador (CSS), então não há processamento de imagem no servidor. Consumo estimado: 18,5 MB por quadro, ~1,2 GB por dia com a TV ligada 11 h; trocar para 3600x2160 (5,9 MB) reduz para ~0,4 GB/dia, mudando só a constante `TAMANHO` no servidor.
- Quadro novo a cada 10 min; o mais novo tinha ~2 min de atraso quando medi.
- Servidor baixa o arquivo (7200x4320 tem 18,5 MB; 3600x2160 tem 5,9 MB), recorta o Nordeste na vertical, remove a faixa de legenda preta e guarda em cache por 10 min.
- Pela conta (estimativa minha), um recorte 9:16 de 7200x4320 dá ~2430x4320, o que cobre 4K vertical sem ampliar.
- Laço animado dos quadros recentes: possível, não testado. Termos de uso da NOAA: não verificados.

### Cena 5: fluxo de vento (detalhes)
- **Status: implementada** (primeira versão): é o 3º slide do rodízio (dados 20 s, mapa 15 s, **vento 7 s**). Decodificação: `@mattnucc/gribberish` (validada: Fortaleza deu 6,1 m/s de 107° contra 6,4 m/s de 106° na Open-Meteo/GFS). Animação: `leaflet-velocity`. Rota `GET /api/vento` com cache de 20 min no servidor, janela lon -54 a -28 e lat -26 a 12, atualização no navegador a cada 30 min. As outras cenas do plano ainda não foram implementadas.
- **Referência:** a imagem que você enviou: linhas curtas animadas seguindo o vento, coloridas do azul ao verde pela velocidade, sobre o Brasil.
- **Camada do OpenWeather não serve:** a `wind_new` é descrita só como "velocidade do vento" e não há camada animada nas páginas que li.
- **Dados (testado):** o filtro do NOMADS (NOAA) devolveu o vento a 10 m (U e V) do GFS 0,25° só do Nordeste (lon -48 a -32, lat 2 a -12): **~10 KB** por horário, HTTP 200 nos ciclos 00z, 06z e 12z de hoje, arquivo GRIB válido. Os ciclos saem 4 vezes por dia.
- **Desenho:** servidor busca o recorte, converte para o formato da biblioteca e entrega JSON pequeno ao navegador, que anima as partículas num canvas.
- **leaflet-velocity:** desenha direção e intensidade num canvas do Leaflet. Licença CSIRO, "variação de BSD/MIT". Aceita Leaflet 1.x. Formato de entrada: saída do `grib2json`. A página não detalha os campos; precisa abrir os arquivos de demonstração do repositório.
- **Em aberto:** (1) como decodificar o GRIB no servidor: não há `eccodes`, `wgrib2` nem Java nesta máquina; precisaria escolher uma biblioteca para Node, ou uma etapa em Python, ou o `grib2json` (Java). Nada disso foi testado. (2) Alternativa: vento em grade pela Open-Meteo (JSON, até ~1000 pontos por pedido segundo fontes de terceiros), mas com o problema de licença não comercial. (3) Desempenho da animação em 4K no computador da TV: não testado. (4) Termos e limites de uso do NOMADS: não verifiquei.
- **Referência visual aprovada por você (2ª imagem):** o mapa do próprio OpenWeather (openweathermap.org). Traços a reproduzir: partículas brancas curtas com rastro; cor por velocidade em m/s (escala de 0 a 40: azul/verde nas fracas, amarelo/rosa/roxo nas fortes); densidade configurável (na imagem, 16 mil partículas) e velocidade configurável (0,20); fundo escuro com contorno de países. Opcional que aparece lá: linha do tempo de dias, ciclones e raios; **não estão no plano**.
- **Importante (corrige o que eu disse antes):** esse efeito do site do OpenWeather **não é uma camada da API gratuita**. A API grátis (Weather Maps 1.0) só tem `wind_new` = velocidade. A camada `WND` (cor da velocidade + setas da direção, previsão de até 10 dias em passos de 3 h) é do **Weather Maps 2.0, que pelo FAQ do OpenWeather não está no plano grátis** (erro 401). Mesmo a `WND` seria imagem com setas, não partículas em movimento: a animação é feita no navegador. Por isso o plano segue com dados da NOAA + animação própria, que dá o mesmo visual.
- **Alternativas de biblioteca achadas na busca (não testadas):** `ol-owm` (OpenLayers/Leaflet, anima o vento) e `maplibre-gl-wind` (partículas em deck.gl). Não verifiquei se usam as camadas do OpenWeather ou outra fonte.
- **Atraso:** o ciclo de 12z já estava disponível às ~16:35 UTC; o vento "de agora" será do horário de previsão mais próximo, não uma medição.

### Mapa base
**Decidir:** mapa oficial do Google (chave + cobrança; uso suportado; estilização) ou manter o endereço atual de blocos (funciona hoje; termos não confirmados).

## 2. Design

**Rodada 1 (implementada, a pedido do usuário):** em vez de trocar de identidade visual, melhorar o que já existe. Mantido o visual claro com vermelho da marca. Novidades: barras que crescem em sequência, brilho que passa, números que sobem de 0 até o valor; quem bateu a meta (>= 100% no ranking, venda >= meta na positivação) ganha barra dourada com brilho pulsando, troféu, aro dourado na foto e faíscas; o líder do ranking e do pódio leva coroa; cards de meta batida com faíscas e número animado. Respeita a preferência do sistema por menos movimento. **Layout fluido (implementado):** o palco 1080x1920 se ajusta sozinho a qualquer tela (1080p a 4K e outras proporções) por escala; mapas e partículas ficam mais suaves em 4K porque são desenhados em 1080.

### Layout fluido, de 1080p a 4K (pendente)
- Trocar o palco fixo 1080x1920 escalado por layout que usa a tela inteira; texto e espaços proporcionais à largura.
- Converter os valores em pixel do Tailwind para unidades proporcionais (maior trabalho da parte visual).
- **Decidir:** direção visual (posso trazer 2 ou 3 propostas antes).

## 3. GEDOC: região do cliente pelo CNPJ
- Cadastro do cliente passa a guardar município, UF e código IBGE, preenchidos pelo CNPJ (BrasilAPI, uma consulta por CNPJ).
- Formulário de orçamento pede CNPJ e deixa de pedir o resto.
- Foco no cliente **empresa** (você confirmou).
- Orçamentos antigos: só 10 de 908 têm CNPJ. Preencher por busca do nome do cliente no cadastro e gerar uma lista para você revisar o que não casar.
- Mexe em outro projeto: só depois do seu desenho aprovado.

## 4. Consumo do OpenWeather (plano grátis: 60 chamadas/min, 1.000.000/mês)
Pior caso: 1 bloco = 1 chamada (a página não diz se conta). TV ligada 11 h/dia, 30 dias.

| Cenário | Blocos por atualização | Por dia | Por mês | % do limite |
|---|---|---|---|---|
| Só nuvens, a cada 10 min (hoje) | 77 | 5.082 | 152.460 | 15% |
| Nuvens + temperatura, 10 min | 154 | 10.164 | 304.920 | 30% |
| 3 camadas, 10 min | 231 | 15.246 | 457.380 | 46% |
| Nuvens + temperatura, 30 min | 154 | 3.388 | 101.640 | 10% |
| Só nuvens em 4K fluido (blocos x4, estimativa), 10 min | 308 | 20.328 | 609.840 | 61% |
| 4K fluido, 30 min | 308 | 6.776 | 203.280 | 20% |

**Correção ao que eu disse antes:** "carregar a camada só quando está visível" pode piorar. Se os blocos forem pedidos de novo a cada passagem de 48 s, o pior caso é cerca de 1,9 milhão por mês. O caminho seguro é manter as camadas carregadas (escondidas por opacidade) e atualizar por relógio, ou usar o cache no servidor, que entra na fase de segurança.

## 5. Ordem sugerida
1. Mapa: cenas 2 a 4 funcionando (a 1 fica "vazia" até o GEDOC).
2. Design vertical fluido.
3. GEDOC e, com ele, a cena 1.
4. Segurança (chave no servidor, cache de blocos) e limpeza do `site/`.

## 6. Decisões em aberto
- Mapa base: Google oficial ou manter como está.
- Fonte da temperatura: INMET (previsão) ou OpenWeather.
- Opacidade das nuvens.
- Direção visual do design.
- Tempo do slide de dados (hoje 20 s): manter?
- Vento: como decodificar o GRIB (biblioteca Node, Python ou grib2json) ou usar Open-Meteo.
- Vento: o vento fica em cena própria ou também sobre a cena de nuvens?
- Vento: biblioteca de animação (leaflet-velocity, que combina com o mapa atual, ou maplibre-gl-wind, que pediria trocar o mapa).

## 7. O que não sei
- Se cada bloco do OpenWeather conta como chamada.
- Limites de uso e atribuição da NOAA.
- Se o VIIRS (alta definição) pode ser usado: retornou 0 blocos nos testes.
- Termos de uso e limites do NOMADS (vento) e a decodificação do GRIB.
