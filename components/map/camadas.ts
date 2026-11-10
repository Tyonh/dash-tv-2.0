import L from "leaflet";
import { CIDADES_VISITADAS, ROTAS_BR } from "@/lib/cidades";
import { calcularDistancia, rotaRodoviaCurva } from "@/lib/geo";
import type { Cidade } from "@/lib/types";

const ESTILO_ROTA: L.PolylineOptions = { color: "#ff3333", weight: 2.0, opacity: 0.8 };

const ICONE_HUB = L.divIcon({
  className: "",
  html: `<div class="relative flex h-6 w-6 items-center justify-center">
    <div class="absolute h-full w-full animate-pulse-grow rounded-full border-[3px] border-[#3498db] opacity-0 shadow-[0_0_10px_rgba(52,152,219,0.4)]"></div>
    <div class="absolute z-10 h-2.5 w-2.5 rounded-full border-[1.5px] border-white bg-[#3498db] shadow-[0_0_4px_rgba(0,0,0,0.4)]"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const popupNome = (texto: string) => `<b style="font-size: 20px;">${texto}</b>`;

function adicionarMarcadores(mapa: L.Map): void {
  for (const c of CIDADES_VISITADAS) {
    if (c.tipo === "hub") {
      L.marker([c.lat, c.lng], { icon: ICONE_HUB }).addTo(mapa).bindPopup(popupNome(`${c.nome} (HUB CENTRAL)`));
    } else {
      L.circleMarker([c.lat, c.lng], { radius: 3, fillColor: "#ff4444", color: "#fff", weight: 1, fillOpacity: 0.9 })
        .addTo(mapa)
        .bindPopup(popupNome(c.nome));
    }
  }
}

function desenharLigacao(mapa: L.Map, a: Cidade, b: Cidade, popup: string): void {
  L.polyline(rotaRodoviaCurva([a.lat, a.lng], [b.lat, b.lng]), ESTILO_ROTA).addTo(mapa).bindPopup(popup);
}

function adicionarRotas(mapa: L.Map): void {
  const porNome = new Map(CIDADES_VISITADAS.map((c) => [c.nome, c]));
  const desenhadas = new Set<string>();
  const conectadas = new Set<string>();

  for (const [br, cidades] of Object.entries(ROTAS_BR)) {
    cidades.forEach((n) => conectadas.add(n));
    for (let i = 0; i < cidades.length - 1; i++) {
      const [nomeA, nomeB] = [cidades[i], cidades[i + 1]];
      const [a, b] = [porNome.get(nomeA), porNome.get(nomeB)];
      const chave = [nomeA, nomeB].sort().join("-");
      if (!a || !b || desenhadas.has(chave)) continue;
      desenhadas.add(chave);
      desenharLigacao(mapa, a, b, `<b style="font-size: 18px;">${br}</b><br>Trecho: ${nomeA} ⇄ ${nomeB}`);
    }
  }

  // Fail-safe: cidade fora das rotas liga ao vizinho mais próximo
  for (const a of CIDADES_VISITADAS) {
    if (conectadas.has(a.nome)) continue;
    const vizinha = CIDADES_VISITADAS.filter((b) => b.nome !== a.nome).reduce<Cidade | null>(
      (melhor, b) => (!melhor || calcularDistancia(a, b) < calcularDistancia(a, melhor) ? b : melhor),
      null,
    );
    const chave = vizinha ? [a.nome, vizinha.nome].sort().join("-") : "";
    if (!vizinha || desenhadas.has(chave)) continue;
    desenhadas.add(chave);
    desenharLigacao(mapa, a, vizinha, `<b>Rota de Acesso</b><br>Interligação: ${a.nome} ⇄ ${vizinha.nome}`);
  }
}

export function adicionarCidadesERotas(mapa: L.Map): void {
  adicionarMarcadores(mapa);
  adicionarRotas(mapa);
}
