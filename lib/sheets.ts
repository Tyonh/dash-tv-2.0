import { SHEET_URLS } from "./constants";
import { isNomeValido, parseNumber } from "./format";
import type { CampeaoSemana, PontoPodio, Positivacao, VendedorRanking } from "./types";

async function linhasCsv(url: string): Promise<string[][]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Planilha indisponível (HTTP ${res.status})`);
  const texto = await res.text();
  return texto
    .trim()
    .split("\n")
    .slice(1)
    .map((l) => l.split(","));
}

export async function buscarRanking(): Promise<VendedorRanking[]> {
  const linhas = await linhasCsv(SHEET_URLS.ranking);
  return linhas
    .map((c) => ({
      nome: (c[0] ?? "").trim(),
      perc: parseFloat((c[1] ?? "").replace("%", "").replace(",", ".")),
    }))
    .sort((a, b) => b.perc - a.perc);
}

export async function buscarPositivacao(): Promise<Positivacao[]> {
  const linhas = await linhasCsv(SHEET_URLS.positivacao);
  return linhas
    .filter((c) => c.length >= 3)
    .map((c) => ({
      nome: (c[0] ?? "").trim(),
      meta: parseNumber(c[1]),
      venda: parseNumber(c[2]),
    }));
}

export async function buscarPodio(): Promise<PontoPodio[]> {
  const linhas = await linhasCsv(SHEET_URLS.podioMes);
  return linhas
    .map((c) => ({ nome: (c[0] ?? "").trim(), pts: parseInt(c[1] ?? "", 10) }))
    .filter((d) => isNomeValido(d.nome) && Number.isFinite(d.pts))
    .sort((a, b) => b.pts - a.pts);
}

export async function buscarCampeoes(): Promise<CampeaoSemana[]> {
  const linhas = await linhasCsv(SHEET_URLS.campeoesSemanas);
  return linhas.map((c) => ({
    sem: (c[0] ?? "").trim(),
    nome: (c[1] ?? "").trim(),
    pontos: parseInt(c[2] ?? "", 10),
  }));
}
