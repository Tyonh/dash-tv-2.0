import type { Cidade } from "./types";

/** Distância geodésica simples (Haversine), em km. */
export const calcularDistancia = (a: Cidade, b: Cidade): number => {
  const R = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

/** Rota curva (Bézier quadrática + ondulação) simulando uma rodovia sinuosa. */
export const rotaRodoviaCurva = (p0: [number, number], p2: [number, number]): [number, number][] => {
  const [lat0, lng0] = p0;
  const [lat2, lng2] = p2;
  const dLat = lat2 - lat0;
  const dLng = lng2 - lng0;
  const hash = Math.abs(lat0 + lng0 + lat2 + lng2) * 1000;
  const direcao = Math.floor(hash) % 2 === 0 ? 1 : -1;
  const fator = 0.12 * direcao;
  const cLat = (lat0 + lat2) / 2 - dLng * fator;
  const cLng = (lng0 + lng2) / 2 + dLat * fator;

  const segmentos = 16;
  const pontos: [number, number][] = [];
  for (let i = 0; i <= segmentos; i++) {
    const t = i / segmentos;
    const u = 1 - t;
    const ond = Math.sin(t * Math.PI) * 0.015 * Math.sin(t * Math.PI * 4);
    pontos.push([
      u * u * lat0 + 2 * u * t * cLat + t * t * lat2 + ond,
      u * u * lng0 + 2 * u * t * cLng + t * t * lng2 + ond,
    ]);
  }
  return pontos;
};
