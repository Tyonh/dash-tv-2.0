"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { useRecargaDiaria } from "@/hooks/useRecargaDiaria";
import { TEMPO_DADOS_MS, TEMPO_MAPA_MS, TEMPO_SATELITE_MS, TEMPO_VENTO_MS } from "@/lib/constants";
import { LogisticsPanel } from "./LogisticsPanel";
import { PalcoEscalado } from "./PalcoEscalado";
import { DataSlide } from "./dashboard/DataSlide";

const MapSlide = dynamic(() => import("./map/MapSlide"), { ssr: false });
const VentoSlide = dynamic(() => import("./map/VentoSlide"), { ssr: false });
const SateliteSlide = dynamic(() => import("./map/SateliteSlide"), { ssr: false });

const SLIDE_DADOS = 0;
const SLIDE_MAPA = 1;
const SLIDE_VENTO = 2;
const SLIDE_SATELITE = 3;
const DURACOES_MS = [TEMPO_DADOS_MS, TEMPO_MAPA_MS, TEMPO_VENTO_MS, TEMPO_SATELITE_MS] as const;
const TOTAL_SLIDES = DURACOES_MS.length;

type SlideProps = { ativo: boolean; children: ReactNode };

function Slide({ ativo, children }: SlideProps) {
  return (
    <div
      className={`absolute left-0 h-full w-full transition-opacity duration-1000 ease-in-out ${ativo ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      {children}
    </div>
  );
}

export function Dashboard() {
  const [slide, setSlide] = useState(SLIDE_DADOS);
  const [gatilhoDados, setGatilhoDados] = useState(0);
  useRecargaDiaria();

  useEffect(() => {
    const espera = DURACOES_MS[slide];
    const id = setTimeout(() => {
      const proximo = (slide + 1) % TOTAL_SLIDES;
      setSlide(proximo);
      // Refaz dados e animações sempre que o slide de dados reaparece
      if (proximo === SLIDE_DADOS) setGatilhoDados((g) => g + 1);
    }, espera);
    return () => clearTimeout(id);
  }, [slide]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Palco 1080x1920 para TV na vertical, ajustado sozinho a qualquer tela (1080p, 4K...) */}
      <PalcoEscalado>
        <Slide ativo={slide === SLIDE_DADOS}>
          <DataSlide gatilho={gatilhoDados} />
        </Slide>
        <Slide ativo={slide === SLIDE_MAPA}>
          <MapSlide ativo={slide === SLIDE_MAPA} />
          <LogisticsPanel />
        </Slide>
        <Slide ativo={slide === SLIDE_VENTO}>
          <VentoSlide ativo={slide === SLIDE_VENTO} />
          <LogisticsPanel />
        </Slide>
        <Slide ativo={slide === SLIDE_SATELITE}>
          <SateliteSlide />
          <LogisticsPanel />
        </Slide>
      </PalcoEscalado>
    </main>
  );
}
