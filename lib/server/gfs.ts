import "server-only";

/** Acesso ao GFS 0,25° da NOAA (NOMADS), compartilhado pelas cenas de vento e temperatura. */

const NOMADS = "https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl";
/** Janela do mapa: Nordeste e arredores (graus). */
const JANELA = { oeste: -54, leste: -28, norte: 12, sul: -26 } as const;
const HORAS_DE_CICLO = [18, 12, 6, 0] as const;
const CICLOS_TENTADOS = 6;
const MAX_HORA_PREVISAO = 120;
const TIMEOUT_MS = 25_000;
const USER_AGENT = "dash-tv-internal-dashboard/2.0";

export interface Ciclo {
  inicio: Date;
}

const doisDigitos = (n: number): string => String(n).padStart(2, "0");

/** Ciclos do GFS (00, 06, 12, 18 UTC) do mais novo para o mais antigo. */
export function ciclosRecentes(agora: Date): Ciclo[] {
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

/** Hora de previsão que corresponde a "agora" dentro do ciclo. */
export function horaDePrevisao(agora: Date, ciclo: Ciclo): number {
  const horas = Math.round((agora.getTime() - ciclo.inicio.getTime()) / 3_600_000);
  return Math.min(Math.max(horas, 0), MAX_HORA_PREVISAO);
}

export interface PedidoGfs {
  /** Nível, por exemplo "lev_10_m_above_ground". */
  nivel: string;
  /** Variáveis, por exemplo ["UGRD", "VGRD"]. */
  variaveis: string[];
}

function montarUrl(ciclo: Ciclo, horaPrevisao: number, pedido: PedidoGfs): string {
  const d = ciclo.inicio;
  const data = `${d.getUTCFullYear()}${doisDigitos(d.getUTCMonth() + 1)}${doisDigitos(d.getUTCDate())}`;
  const hh = doisDigitos(d.getUTCHours());
  const params = new URLSearchParams({
    file: `gfs.t${hh}z.pgrb2.0p25.f${String(horaPrevisao).padStart(3, "0")}`,
    [pedido.nivel]: "on",
    subregion: "",
    leftlon: String(JANELA.oeste),
    rightlon: String(JANELA.leste),
    toplat: String(JANELA.norte),
    bottomlat: String(JANELA.sul),
    dir: `/gfs.${data}/${hh}/atmos`,
  });
  for (const v of pedido.variaveis) params.set(`var_${v}`, "on");
  return `${NOMADS}?${params.toString()}`;
}

/** Baixa o GRIB do ciclo, ou devolve null se o arquivo ainda não existir ou a NOAA falhar. */
export async function baixarGrib(ciclo: Ciclo, horaPrevisao: number, pedido: PedidoGfs): Promise<Uint8Array | null> {
  try {
    const res = await fetch(montarUrl(ciclo, horaPrevisao, pedido), {
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
