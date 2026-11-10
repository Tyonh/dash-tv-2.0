# Referência: o que a NASA disponibiliza (para o painel de TV)

Gerado em 2026-11-10 15:56 UTC a partir do catálogo público do GIBS (projeção Web Mercator, a mesma do Leaflet) e de testes de leitura. Nenhuma chave foi usada.

## 1. GIBS: imagens de satélite como tiles de mapa

- **O que é:** serviço da NASA que entrega imagem de satélite já recortada em blocos de mapa. Gratuito, sem cadastro nos testes. A NASA pede crédito (atribuição) ao usar.
- **Catálogo:** 1330 camadas em `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml`
- **Padrão do endereço de um bloco (REST):**
  `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{CAMADA}/default/{DATA_HORA}/{MATRIZ}/{ZOOM}/{LINHA}/{COLUNA}.{png|jpg}`
  - Camadas diárias: `AAAA-MM-DD`. Camadas de intervalo menor: `AAAA-MM-DDTHH:MM:00Z`.
  - Para as camadas GOES testadas, a matriz é `GoogleMapsCompatible_Level7` (zoom máximo 7) e o formato é PNG.
- **Projeções disponíveis:** EPSG:4326, 3857, 3413 (Ártico), 3031 (Antártica). Cada endereço serve uma só.
- **Funciona com Leaflet** (documentação oficial): https://nasa-gibs.github.io/gibs-api-docs/access-basics

### Resumo do catálogo (contagem por palavra no nome; uma camada pode cair em mais de um grupo)
GOES: 12 · Himawari: 3 · Temperatura: 301 · Precipitação: 35 · Nuvens: 103 · Aerossol/Poeira: 81 · Fogo: 22 · Umidade/Vapor: 47 · Vento: 48 · Raios: 13 · Temperatura do mar: 81

### Satélite geoestacionário (cobre o Nordeste: GOES-East)
| Camada (identificador) | Descrição | Passo | Último dado no catálogo |
|---|---|---|---|
| `GOES-East_ABI_Air_Mass` | Air Mass (ABI, GOES-East) | PT10M | 2026-11-10T15:10:00Z |
| `GOES-East_ABI_Band13_Clean_Infrared` | Clean Infrared (10.3 µm, Band 13, ABI, GOES-East) | PT10M | 2026-11-10T15:20:00Z |
| `GOES-East_ABI_Dust` | Dust (ABI, GOES-East) | PT10M | 2026-11-10T15:10:00Z |
| `GOES-East_ABI_FireTemp` | Fire Temperature ( ABI, GOES-East) | PT10M | 2026-11-10T15:10:00Z |
| `GOES-East_ABI_GeoColor` | Geo Color ( ABI, GOES-East) | PT10M | 2026-11-10T15:10:00Z |
| `GOES-East_ABI_Band2_Red_Visible_1km` | Red Visible (0.64 µm, Band 2, ABI, GOES-East) | PT10M | 2026-11-10T15:20:00Z |

**Atraso medido hoje:** às 15:24 UTC o bloco mais novo da GeoColor era das 14:20 (cerca de 1 hora). Os blocos de 10 e 30 minutos atrás deram 404.

### Chuva estimada por satélite
| Camada (identificador) | Descrição | Passo | Último dado no catálogo |
|---|---|---|---|
| `AIRS_Precipitation_Day` | Precipitation (Day, AIRS, Aqua) | P1D | 2026-11-10 |
| `AIRS_Precipitation_Night` | Precipitation (Night, AIRS, Aqua) | P1D | 2026-11-10 |
| `GMI_Precipitation_Rate_Asc` | Precipitation Rate (Ascending,  GMI, GPM) | P1D | 2026-11-10 |
| `GMI_Precipitation_Rate_Dsc` | Precipitation Rate (Descending,  GMI, GPM) | P1D | 2026-11-10 |
| `IMERG_Precipitation_Rate` | Precipitation Rate (IMERG) | P1D | 2026-11-09 |
| `IMERG_Precipitation_Rate_30min` | Precipitation Rate, 30-minute avg. (IMERG)  | PT30M | 2026-11-10T10:00:00Z |

**Atenção:** a camada de 30 minutos tinha o último dado das 10:00 UTC quando consultei, ou seja, bem atrás do relógio. Confirmar o atraso antes de depender dela.

### Temperatura do ar (não é tempo real)
| Camada (identificador) | Descrição | Passo | Último dado no catálogo |
|---|---|---|---|
| `MERRA2_2m_Air_Temperature_Monthly` | 2-meter Air Temperature, (Monthly, MERRA2) | P1M | 2026-08-01 |
| `MERRA2_2m_Air_Temperature_Assimilated_Monthly` | 2-meter Air Temperature, Assimilated (Monthly, MERRA2) | P1M | 2026-08-01 |
| `GLDAS_Near_Surface_Air_Temperature_Monthly` | Air Temperature (Monthly, Near Surface, Noah LSM,  GLDAS) | P1M | 2026-06-01 |
| `NLDAS_Near_Surface_Air_Temperature_Primary_Monthly` | Air Temperature (Monthly, Near Surface, Primary Forcing Data,  NLDAS) | P1M | 2026-09-01 |
| `AIRS_L3_Surface_Air_Temperature_Daily_Day` | Air Temperature at Surface (L3, Daytime/Ascending, Daily, AIRS, Aqua)  | P1D | 2026-11-01 |
| `AIRS_L3_Surface_Air_Temperature_Monthly_Day` | Air Temperature at Surface (L3, Daytime/Ascending, Monthly, AIRS, Aqua)  | P1M | 2026-09-01 |
| `AIRS_L3_Surface_Air_Temperature_Daily_Night` | Air Temperature at Surface (L3, Nighttime/Descending, Daily, AIRS, Aqua)  | P1D | 2026-11-01 |
| `AIRS_L3_Surface_Air_Temperature_Monthly_Night` | Air Temperature at Surface (L3, Nighttime/Descending, Monthly, AIRS, Aqua)  | P1M | 2026-09-01 |

**Atenção:** nenhuma camada de temperatura do ar no catálogo é de tempo real. A diária do AIRS estava com mais de 9 dias de atraso. A camada `Band13_Clean_Infrared` do GOES é temperatura de brilho (topo de nuvem e superfície), **não** temperatura do ar.

## 2. NASA POWER: dados meteorológicos por ponto (API)

- **O que é:** série diária por latitude/longitude, em JSON, sem chave nos testes.
- **Exemplo testado (Fortaleza, 1 a 8/11/2026):**
  `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MAX,RH2M,ALLSKY_SFC_UV_INDEX&community=RE&longitude=-38.54&latitude=-3.72&start=20261101&end=20261108&format=JSON`
- **Resultado:** temperatura média ~28,2 °C, máxima ~31 °C e umidade 73 a 76% nos dias 6 e 7. O dia 8 veio sem dado (valor -999), então há atraso de cerca de 2 dias. O índice UV veio todo -999 nessas datas.
- **Uso provável:** histórico e clima (média por mês), não o agora. Não verifiquei limites nem termos de uso.

## 3. Outros serviços da NASA (não testados nesta sessão)
- **Worldview** (navegador visual das mesmas camadas do GIBS): https://worldview.earthdata.nasa.gov
- Portal de dados Earthdata (busca de conjuntos de dados): https://www.earthdata.nasa.gov
Não abri esses dois nem confirmei limites ou termos; entram aqui só como ponto de partida.

## 4. Conclusão prática para o painel
- **Nuvens e satélite de base:** GIBS GOES-East GeoColor funciona e encaixa no mapa, com ~1 h de atraso. A NOAA direta (setor `nsa`) é mais nova (~7 min), mas é foto sem georreferência.
- **Temperatura em tempo real:** a NASA não resolve. POWER é histórico; GIBS não tem camada de ar em tempo real.
