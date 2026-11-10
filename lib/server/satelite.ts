import "server-only";

import type { SatelitePayload } from "@/lib/types";

const BASE = "https://cdn.star.nesdis.noaa.gov/GOES19/ABI/SECTOR/nsa/GEOCOLOR";
const TAMANHO = "7200x4320";
const TTL_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 20_000;
const USER_AGENT = "dash-tv-internal-dashboard/2.0";

let cache: { em: number; payload: SatelitePayload } | null = null;
let emAndamento: Promise<SatelitePayload> | null = null;

/** Nome do arquivo: AAAADDDHHMM_GOES19-ABI-nsa-GEOCOLOR-7200x4320.jpg (ano, dia do ano, hora e minuto em UTC). */
function quadroDoNome(nome: string): Date | null {
  const m = /^(\d{4})(\d{3})(\d{2})(\d{2})_/.exec(nome);
  if (!m) return null;
  const [, ano, dia, hora, minuto] = m;
  const inicioDoAno = Date.UTC(Number(ano), 0, 1, Number(hora), Number(minuto));
  return new Date(inicioDoAno + (Number(dia) - 1) * 86_400_000);
}

async function calcular(): Promise<SatelitePayload> {
  const res = await fetch(`${BASE}/`, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`NOAA indisponível (HTTP ${res.status})`);

  const html = await res.text();
  const padrao = new RegExp(`\\d{11}_GOES19-ABI-nsa-GEOCOLOR-${TAMANHO}\\.jpg`, "g");
  const nomes = [...new Set(html.match(padrao) ?? [])].sort();
  const ultimo = nomes.at(-1);
  if (!ultimo) throw new Error("Nenhum quadro do GOES-19 encontrado");

  const quadro = quadroDoNome(ultimo);
  if (!quadro) throw new Error(`Nome de arquivo inesperado: ${ultimo}`);

  return {
    arquivo: ultimo,
    url: `${BASE}/${ultimo}`,
    quadro: quadro.toISOString(),
    atualizado_em: new Date().toISOString(),
  };
}

export async function obterSatelite(): Promise<SatelitePayload> {
  if (cache && Date.now() - cache.em < TTL_MS) return cache.payload;
  emAndamento ??= calcular()
    .then((payload) => {
      cache = { em: Date.now(), payload };
      return payload;
    })
    .catch((erro: unknown) => {
      // Se a NOAA falhar, mantém o último quadro conhecido
      if (cache) return cache.payload;
      throw erro;
    })
    .finally(() => {
      emAndamento = null;
    });
  return emAndamento;
}
