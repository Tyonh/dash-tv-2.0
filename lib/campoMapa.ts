/** Pinta uma grade regular (lat/lon) como imagem para o Leaflet esticar sobre o mapa. */

export type Rgb = [number, number, number];

export interface GradeRegular {
  nx: number;
  ny: number;
  lo1: number;
  /** Latitude da primeira linha (a mais ao norte). */
  la1: number;
  dx: number;
  dy: number;
  /** Valores por linha, do norte para o sul. */
  data: number[];
}

export interface Janela {
  norte: number;
  sul: number;
  oeste: number;
  leste: number;
}

const radianos = (g: number): number => (g * Math.PI) / 180;
const graus = (rad: number): number => (rad * 180) / Math.PI;
const mercatorY = (lat: number): number => Math.log(Math.tan(Math.PI / 4 + radianos(lat) / 2));
const latDeMercator = (y: number): number => graus(2 * Math.atan(Math.exp(y)) - Math.PI / 2);

export function janelaDaGrade(g: GradeRegular): Janela {
  return { norte: g.la1, sul: g.la1 - (g.ny - 1) * g.dy, oeste: g.lo1, leste: g.lo1 + (g.nx - 1) * g.dx };
}

export const hexParaRgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

/** Cor numa paleta de cores igualmente espaçadas, com mistura linear entre elas. `t` vai de 0 a 1. */
export function corNaPaleta(paleta: Rgb[], t: number): Rgb {
  const posicao = Math.min(Math.max(t, 0), 1) * (paleta.length - 1);
  const i = Math.floor(posicao);
  const f = posicao - i;
  const de = paleta[i];
  const ate = paleta[Math.min(i + 1, paleta.length - 1)];
  return [de[0] + (ate[0] - de[0]) * f, de[1] + (ate[1] - de[1]) * f, de[2] + (ate[2] - de[2]) * f];
}

/** Valor da grade num ponto, por interpolação bilinear. Fora da grade usa a borda mais próxima. */
export function valorNaGrade(grade: GradeRegular, lat: number, lon: number): number {
  const j = janelaDaGrade(grade);
  const fj = Math.min(Math.max((j.norte - lat) / grade.dy, 0), grade.ny - 1);
  const fi = Math.min(Math.max((lon - j.oeste) / grade.dx, 0), grade.nx - 1);
  const j0 = Math.floor(fj);
  const j1 = Math.min(j0 + 1, grade.ny - 1);
  const i0 = Math.floor(fi);
  const i1 = Math.min(i0 + 1, grade.nx - 1);
  const ti = fi - i0;
  const tj = fj - j0;
  const topo = grade.data[j0 * grade.nx + i0] * (1 - ti) + grade.data[j0 * grade.nx + i1] * ti;
  const base = grade.data[j1 * grade.nx + i0] * (1 - ti) + grade.data[j1 * grade.nx + i1] * ti;
  return topo * (1 - tj) + base * tj;
}

/**
 * Desenha a grade em PNG (data URL). O Leaflet estica a imagem de forma linear em Web Mercator,
 * então cada linha é amostrada na latitude certa (e não linear em graus).
 */
export function desenharGrade(grade: GradeRegular, corDoValor: (valor: number) => Rgb, largura: number): string {
  const j = janelaDaGrade(grade);
  const yNorte = mercatorY(j.norte);
  const ySul = mercatorY(j.sul);
  const altura = Math.round((largura * (yNorte - ySul)) / radianos(j.leste - j.oeste));
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const imagem = ctx.createImageData(largura, altura);

  for (let py = 0; py < altura; py++) {
    const lat = latDeMercator(yNorte - (py / (altura - 1)) * (yNorte - ySul));
    const fj = Math.min(Math.max((j.norte - lat) / grade.dy, 0), grade.ny - 1);
    const j0 = Math.floor(fj);
    const j1 = Math.min(j0 + 1, grade.ny - 1);
    const tj = fj - j0;
    for (let px = 0; px < largura; px++) {
      const lon = j.oeste + (px / (largura - 1)) * (j.leste - j.oeste);
      const fi = Math.min(Math.max((lon - j.oeste) / grade.dx, 0), grade.nx - 1);
      const i0 = Math.floor(fi);
      const i1 = Math.min(i0 + 1, grade.nx - 1);
      const ti = fi - i0;
      const topo = grade.data[j0 * grade.nx + i0] * (1 - ti) + grade.data[j0 * grade.nx + i1] * ti;
      const base = grade.data[j1 * grade.nx + i0] * (1 - ti) + grade.data[j1 * grade.nx + i1] * ti;
      const [r, g, b] = corDoValor(topo * (1 - tj) + base * tj);
      const k = (py * largura + px) * 4;
      imagem.data[k] = r;
      imagem.data[k + 1] = g;
      imagem.data[k + 2] = b;
      imagem.data[k + 3] = 255;
    }
  }
  ctx.putImageData(imagem, 0, 0);
  return canvas.toDataURL("image/png");
}
