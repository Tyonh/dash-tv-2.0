"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CENTRO_NORDESTE, ZOOM_INICIAL } from "@/lib/cidades";

type Props = { ativo: boolean };

const REFRESH_MS = 600_000;
const OPACIDADE_TEMPERATURA = 0.85;

/** Cores aproximadas da escala do OpenWeather (camada temp_new), só para orientar a leitura. */
const ESCALA = [
  { graus: 0, cor: "#c2ff28" },
  { graus: 10, cor: "#fff028" },
  { graus: 20, cor: "#ffc228" },
  { graus: 30, cor: "#fc8014" },
];

export default function TemperaturaSlide({ ativo }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const mapa = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      zoomSnap: 0.1,
      zoomDelta: 0.1,
    }).setView(CENTRO_NORDESTE, ZOOM_INICIAL);

    L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      noWrap: true,
      className: "mapa-escuro",
    }).addTo(mapa);

    // O parâmetro muda a cada 10 min: o navegador reaproveita os blocos dentro da janela
    const url = () => `/api/temperatura/{z}/{x}/{y}?_=${Math.floor(Date.now() / REFRESH_MS)}`;
    const camada = L.tileLayer(url(), { opacity: OPACIDADE_TEMPERATURA, zIndex: 4 }).addTo(mapa);
    const id = setInterval(() => camada.setUrl(url()), REFRESH_MS);
    mapaRef.current = mapa;

    return () => {
      clearInterval(id);
      mapa.remove();
      mapaRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (ativo) mapaRef.current?.invalidateSize();
  }, [ativo]);

  return (
    <div className="relative h-full w-full bg-[#0b1320]">
      <div
        ref={containerRef}
        className="h-full w-full bg-[#0b1320]"
        role="img"
        aria-label="Mapa de calor da temperatura do ar sobre o Nordeste"
      />
      <div className="pointer-events-none absolute bottom-10 left-10 right-10 z-[1000] text-white">
        <div className="mb-2 flex items-baseline justify-between text-[1.4rem] font-semibold">
          <span>Temperatura do ar · °C</span>
          <span className="text-[1.1rem] font-light opacity-80">OpenWeather · atualizado a cada 10 min</span>
        </div>
        <div
          className="h-4 w-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${ESCALA.map((e) => e.cor).join(", ")})` }}
        />
        <div className="mt-1 flex justify-between text-[1.2rem] font-medium">
          {ESCALA.map((e, i) => (
            <span key={e.graus}>
              {e.graus}
              {i === ESCALA.length - 1 ? "+" : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
