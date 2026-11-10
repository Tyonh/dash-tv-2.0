const PLANILHA =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3Ov8l0GVetC6ywdnbQnBljOecI21rjuMYrwcjWypC1V1NBUNAWmKIo4Pn698p4Q/pub";

const csv = (gid: number) => `${PLANILHA}?gid=${gid}&single=true&output=csv`;

export const SHEET_URLS = {
  ranking: csv(1600633914),
  positivacao: csv(577000856),
  podioMes: csv(1467795128),
  campeoesSemanas: csv(1883964368),
} as const;

export const TEMPO_DADOS_MS = 20_000;
export const TEMPO_MAPA_MS = 15_000;
export const TEMPO_TEMPERATURA_MS = 10_000;
export const TEMPO_VENTO_MS = 10_000;
export const VENTO_REFRESH_MS = 1_800_000;
export const TEMPO_SATELITE_MS = 10_000;
export const SATELITE_REFRESH_MS = 600_000;
export const ORCAMENTOS_REFRESH_MS = 300_000;
export const MESES = [
  "JANEIRO",
  "FEVEREIRO",
  "MARÇO",
  "ABRIL",
  "MAIO",
  "JUNHO",
  "JULHO",
  "AGOSTO",
  "SETEMBRO",
  "OUTUBRO",
  "NOVEMBRO",
  "DEZEMBRO",
] as const;

export const IMAGEM_PADRAO =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cccccc'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
export const TROFEU_PADRAO =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffaa00'><path d='M18 2H6v2H1v6c0 3.66 2.56 6.75 6 7.74V20H5v2h14v-2h-2v-2.26c3.44-.99 6-4.08 6-7.74V4h-5V2zm-11 8V6h11v4c0 2.76-2.24 5-5 5s-5-2.24-5-5z'/></svg>";

export const CONTEINERES: readonly import("./types").Conteiner[] = [
  // { id: "00", nome: "NATALINO 1", saida: "01/07/2026", chegada: "--/--/----" },
];
