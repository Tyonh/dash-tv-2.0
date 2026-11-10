import "server-only";

import { parseMessagesFromBuffer } from "@mattnucc/gribberish";
import type { CampoVento, VentoPayload } from "@/lib/types";
import { baixarGrib, ciclosRecentes, horaDePrevisao } from "./gfs";

const TTL_MS = 20 * 60 * 1000;

let cache: { em: number; payload: VentoPayload } | null = null;
let emAndamento: Promise<VentoPayload> | null = null;

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
    const bytes = await baixarGrib(ciclo, horaDePrevisao(agora, ciclo), {
      nivel: "lev_10_m_above_ground",
      variaveis: ["UGRD", "VGRD"],
    });
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
