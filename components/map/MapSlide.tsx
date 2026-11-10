"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CENTRO_NORDESTE, ZOOM_INICIAL } from "@/lib/cidades";
import { adicionarCidadesERotas } from "./camadas";
import { iniciarCalor } from "./calor";
import { iniciarClima } from "./clima";

type Props = { ativo: boolean };

export default function MapSlide({ ativo }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const mapa = L.map(containerRef.current, {
      zoomControl: false,
      dragging: true,
      scrollWheelZoom: false,
      zoomSnap: 0.1,
      zoomDelta: 0.1,
    }).setView(CENTRO_NORDESTE, ZOOM_INICIAL);

    L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      noWrap: true,
      detectRetina: true,
    }).addTo(mapa);

    adicionarCidadesERotas(mapa);
    const pararClima = iniciarClima(mapa);
    const pararCalor = iniciarCalor(mapa);
    mapaRef.current = mapa;

    return () => {
      pararClima();
      pararCalor();
      mapa.remove();
      mapaRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ativo) return;
    const id = setTimeout(() => mapaRef.current?.invalidateSize(), 300);
    return () => clearTimeout(id);
  }, [ativo]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-[#e5e3df]"
      role="img"
      aria-label="Mapa do Nordeste com rotas, clima e mapa de calor de orçamentos"
    />
  );
}
