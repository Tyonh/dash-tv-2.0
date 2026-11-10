import "server-only";

import { parseMessagesFromBuffer } from "@mattnucc/gribberish";
import type { TemperaturaPayload } from "@/lib/types";
import { baixarGrib, ciclosRecentes, horaDePrevisao } from "./gfs";

const TTL_MS = 30 * 60 * 1000;
const KELVIN = 273.15;

let cache: { em: number; payload: TemperaturaPayload } | null = null;
let emAndamento: Promise<TemperaturaPayload> | null = null;

const umaCasa = (v: number): number => (Number.isFinite(v) ? Math.round(v * 10) / 10 : 0);

/** Grade em °C, com a primeira linha na latitude mais ao norte (a GFS entrega do sul para o norte). */
function montarCampo(mensagem: ReturnType<typeof parseMessagesFromBuffer>[number]): TemperaturaPayload["campo"] {
  const { latitude, longitude } = mensagem.latlng;
  const linhas = mensagem.gridShape.rows;
  const colunas = mensagem.gridShape.cols;
  if (mensagem.data.length !== linhas * colunas) throw new Error("Grade com tamanho inesperado");

  const data: number[] = [];
  for (let j = 0; j < linhas; j++) {
    const linhaOrigem = linhas - 1 - j;
    for (let i = 0; i < colunas; i++) data.push(umaCasa(mensagem.data[linhaOrigem * colunas + i] - KELVIN));
  }
  const lo1 = longitude[0] > 180 ? longitude[0] - 360 : longitude[0];
  return {
    nx: colunas,
    ny: linhas,
    lo1,
    la1: latitude[linhas - 1],
    dx: longitude[1] - longitude[0],
    dy: latitude[1] - latitude[0],
    data,
  };
}

async function calcular(): Promise<TemperaturaPayload> {
  const agora = new Date();
  for (const ciclo of ciclosRecentes(agora)) {
    const bytes = await baixarGrib(ciclo, horaDePrevisao(agora, ciclo), {
      nivel: "lev_2_m_above_ground",
      variaveis: ["TMP"],
    });
    if (!bytes) continue;

    const t = parseMessagesFromBuffer(Buffer.from(bytes)).find((m) => m.varAbbrev === "TMP");
    if (!t) continue;

    return {
      atualizado_em: agora.toISOString(),
      referencia: t.referenceDate.toISOString(),
      valido_para: t.forecastDate.toISOString(),
      campo: montarCampo(t),
    };
  }
  throw new Error("Nenhum ciclo recente do GFS disponível no NOMADS");
}

export async function obterTemperatura(): Promise<TemperaturaPayload> {
  if (cache && Date.now() - cache.em < TTL_MS) return cache.payload;
  emAndamento ??= calcular()
    .then((payload) => {
      cache = { em: Date.now(), payload };
      return payload;
    })
    .catch((erro: unknown) => {
      // Se a NOAA falhar, mantém o último dado bom em vez de derrubar a cena
      if (cache) return cache.payload;
      throw erro;
    })
    .finally(() => {
      emAndamento = null;
    });
  return emAndamento;
}
