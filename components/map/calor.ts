import L from "leaflet";
import { CIDADES_VISITADAS } from "@/lib/cidades";
import { ORCAMENTOS_REFRESH_MS } from "@/lib/constants";
import { normalizarCidade } from "@/lib/format";
import { buscarOrcamentos } from "@/lib/orcamentos";
import type { OrcamentoCidade } from "@/lib/types";

type Ponto = [number, number, number];

const GRADIENTE: Record<number, string> = { 0.2: "#ffd166", 0.5: "#ff8c00", 0.8: "#e63946", 1.0: "#7b0d1e" };

/** Cruza as cidades dos orçamentos com as coordenadas conhecidas e normaliza a intensidade (0..1). */
function paraPontos(cidades: OrcamentoCidade[]): Ponto[] {
  const porNome = new Map(CIDADES_VISITADAS.map((c) => [normalizarCidade(c.nome), c]));
  const max = Math.max(1, ...cidades.map((c) => c.quantidade));
  return cidades.flatMap((c) => {
    const ref = porNome.get(normalizarCidade(c.cidade));
    if (!ref || c.quantidade <= 0) return [];
    // Raiz quadrada: cidades pequenas continuam visíveis ao lado das grandes
    return [[ref.lat, ref.lng, Math.sqrt(c.quantidade / max)] as Ponto];
  });
}

/** Camada de calor dos orçamentos por cidade (GEDOC). Devolve a função que para as atualizações. */
export function iniciarCalor(mapa: L.Map): () => void {
  let camada: L.Layer | null = null;
  let ativo = true;

  const atualizar = async () => {
    try {
      // leaflet.heat espera o L global
      (window as unknown as { L: typeof L }).L = L;
      await import("leaflet.heat");
      const { cidades } = await buscarOrcamentos();
      if (!ativo) return;
      if (camada) mapa.removeLayer(camada);
      const pontos = paraPontos(cidades);
      camada = pontos.length
        ? L.heatLayer(pontos, { radius: 75, blur: 50, maxZoom: 8, minOpacity: 0.5, gradient: GRADIENTE }).addTo(mapa)
        : null;
    } catch (e) {
      console.warn("Mapa de calor indisponível:", e);
    }
  };

  void atualizar();
  const id = setInterval(() => void atualizar(), ORCAMENTOS_REFRESH_MS);

  return () => {
    ativo = false;
    clearInterval(id);
    if (camada) mapa.removeLayer(camada);
  };
}
