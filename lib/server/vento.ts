import "server-only";

import { parseMessagesFromBuffer } from "@mattnucc/gribberish";
import type { CampoVento, VentoPayload } from "@/lib/types";

const NOMADS = "https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl";
/** Janela do mapa: Nordeste e arredores (graus). */
const JANELA = { oeste: -54, leste: -28, norte: 12, sul: -26 } as const;
const TTL_MS = 20 * 60 * 1000;
const HORAS_DE_CICLO = [18, 12, 6, 0] as const;
const CICLOS_TENTADOS = 6;
const MAX_HORA_PREVISAO = 120;
const TIMEOUT_MS = 25_000;
const USER_AGENT = "dash-tv-internal-dashboard/2.0";

let cache: { em: number; payload: VentoPayload } | null = null;
let emAndamento: Promise<VentoPayload> | null = null;

interface Ciclo {
  inicio: Date;
}

const doisDigitos = (n: number): string => String(n).padStart(2, "0");

/** Ciclos do GFS (00, 06, 12, 18 UTC) do mais novo para o mais antigo. */
function ciclosRecentes(agora: Date): Ciclo[] {
  const base = Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate());
  const candidatos: Ciclo[] = [];
  for (let dia = 0; dia >= -2; dia--) {
    for (const hora of HORAS_DE_CICLO) {
      const inicio = new Date(base + dia * 86_400_000 + hora * 3_600_000);
      if (inicio.getTime() <= agora.getTime()) candidatos.push({ inicio });
    }
  }
  return candidatos.slice(0, CICLOS_TENTADOS);
}

function montarUrl(ciclo: Ciclo, horaPrevisao: number): string {
  const d = ciclo.inicio;
  const data = `${d.getUTCFullYear()}${doisDigitos(d.getUTCMonth() + 1)}${doisDigitos(d.getUTCDate())}`;
  const hh = doisDigitos(d.getUTCHours());
  const params = new URLSearchParams({
    file: `gfs.t${hh}z.pgrb2.0p25.f${String(horaPrevisao).padStart(3, "0")}`,
    lev_10_m_above_ground: "on",
    var_UGRD: "on",
    var_VGRD: "on",
    subregion: "",
    leftlon: String(JANELA.oeste),
    rightlon: String(JANELA.leste),
    toplat: String(JANELA.norte),
    bottomlat: String(JANELA.sul),
    dir: `/gfs.${data}/${hh}/atmos`,
  });
  return `${NOMADS}?${params.toString()}`;
}

async function baixarGrib(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    // Arquivo ausente volta como página HTML: um GRIB sempre começa por "GRIB"
    const ehGrib = bytes.length > 4 && String.fromCharCode(...bytes.subarray(0, 4)) === "GRIB";
    return ehGrib ? bytes : null;
  } catch {
    return null;
  }
}

const arredondar = (v: number): number => (Number.isFinite(v) ? Math.round(v * 100) / 100 : 0);

/** Converte uma mensagem GRIB (linhas do sul para o norte) para o formato da leaflet-velocity (norte primeiro). */
function montarCampo(
  mensagem: ReturnType<typeof parseMessagesFromBuffer>[number],
  numeroParametro: 2 | 3,
  nome: string,
): CampoVento {
  const { latitude, longitude } = mensagem.latlng;
  const linhas = mensagem.gridShape.rows;
  const colunas = mensagem.gridShape.cols;
  const valores = mensagem.data;
  if (valores.length !== linhas * colunas) throw new Error("Grade com tamanho inesperado");

  const dados: number[] = [];
  for (let j = 0; j < linhas; j++) {
    const linhaOrigem = linhas - 1 - j; // inverte: a primeira linha passa a ser a mais ao norte
    for (let i = 0; i < colunas; i++) dados.push(arredondar(valores[linhaOrigem * colunas + i]));
  }

  const lo1 = longitude[0] > 180 ? longitude[0] - 360 : longitude[0];
  const dx = longitude[1] - longitude[0];
  const dy = latitude[1] - latitude[0];
  const referencia = mensagem.referenceDate;
  const horasDePrevisao = Math.round((mensagem.forecastDate.getTime() - referencia.getTime()) / 3_600_000);

  return {
    header: {
      parameterCategory: 2,
      parameterNumber: numeroParametro,
      parameterNumberName: nome,
      parameterUnit: "m.s-1",
      gridDefinitionTemplate: 0,
      nx: colunas,
      ny: linhas,
      lo1,
      la1: latitude[linhas - 1],
      lo2: lo1 + (colunas - 1) * dx,
      la2: latitude[0],
      dx,
      dy,
      refTime: referencia.toISOString(),
      forecastTime: horasDePrevisao,
    },
    data: dados,
  };
}

async function calcular(): Promise<VentoPayload> {
  const agora = new Date();
  for (const ciclo of ciclosRecentes(agora)) {
    const horas = Math.round((agora.getTime() - ciclo.inicio.getTime()) / 3_600_000);
    const horaPrevisao = Math.min(Math.max(horas, 0), MAX_HORA_PREVISAO);
    const bytes = await baixarGrib(montarUrl(ciclo, horaPrevisao));
    if (!bytes) continue;

    const mensagens = parseMessagesFromBuffer(Buffer.from(bytes));
    const u = mensagens.find((m) => m.varAbbrev === "UGRD");
    const v = mensagens.find((m) => m.varAbbrev === "VGRD");
    if (!u || !v) continue;

    return {
      atualizado_em: agora.toISOString(),
      referencia: u.referenceDate.toISOString(),
      valido_para: u.forecastDate.toISOString(),
      campos: [
        montarCampo(u, 2, "U-component_of_wind_height_above_ground"),
        montarCampo(v, 3, "V-component_of_wind_height_above_ground"),
      ],
    };
  }
  throw new Error("Nenhum ciclo recente do GFS disponível no NOMADS");
}

export async function obterVento(): Promise<VentoPayload> {
  if (cache && Date.now() - cache.em < TTL_MS) return cache.payload;
  emAndamento ??= calcular()
    .then((payload) => {
      cache = { em: Date.now(), payload };
      return payload;
    })
    .catch((erro: unknown) => {
      // Se o NOAA falhar, mantém o último dado bom em vez de derrubar a cena
      if (cache) return cache.payload;
      throw erro;
    })
    .finally(() => {
      emAndamento = null;
    });
  return emAndamento;
}
