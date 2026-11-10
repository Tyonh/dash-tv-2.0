"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { useAtualizacaoAutomatica } from "@/hooks/useAtualizacaoAutomatica";
import { useRecargaDiaria } from "@/hooks/useRecargaDiaria";
import {
  TEMPO_DADOS_MS,
  TEMPO_MAPA_MS,
  TEMPO_SATELITE_MS,
  TEMPO_TEMPERATURA_MS,
  TEMPO_VENTO_MS,
} from "@/lib/constants";
import { LogisticsPanel } from "./LogisticsPanel";
import { PalcoEscalado } from "./PalcoEscalado";
import { DataSlide } from "./dashboard/DataSlide";

const MapSlide = dynamic(() => import("./map/MapSlide"), { ssr: false });
const TemperaturaSlide = dynamic(() => import("./map/TemperaturaSlide"), { ssr: false });
const VentoSlide = dynamic(() => import("./map/VentoSlide"), { ssr: false });
const SateliteSlide = dynamic(() => import("./map/SateliteSlide"), { ssr: false });

type Cena = "dados" | "mapa" | "temperatura" | "vento" | "satelite";

const DURACAO_MS: Record<Cena, number> = {
  dados: TEMPO_DADOS_MS,
  mapa: TEMPO_MAPA_MS,
  temperatura: TEMPO_TEMPERATURA_MS,
  vento: TEMPO_VENTO_MS,
  satelite: TEMPO_SATELITE_MS,
};

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

const ORDEM: readonly Cena[] = ["dados", "mapa", "temperatura", "vento", "satelite"];

export function Dashboard() {
  const [indice, setIndice] = useState(0);
  const [gatilhoDados, setGatilhoDados] = useState(0);
  useRecargaDiaria();
  useAtualizacaoAutomatica();

  const ordem = ORDEM;
  const cena = ordem[indice % ordem.length];

  useEffect(() => {
    const id = setTimeout(() => {
      const proximo = (indice + 1) % ordem.length;
      setIndice(proximo);
      // Refaz dados e animações sempre que o slide de dados reaparece
      if (ordem[proximo] === "dados") setGatilhoDados((g) => g + 1);
    }, DURACAO_MS[cena]);
    return () => clearTimeout(id);
  }, [indice, cena, ordem]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Palco 1080x1920 para TV na vertical, ajustado sozinho a qualquer tela (1080p, 4K...) */}
      <PalcoEscalado>
        <Slide ativo={cena === "dados"}>
          <DataSlide gatilho={gatilhoDados} />
        </Slide>
        <Slide ativo={cena === "mapa"}>
          <MapSlide ativo={cena === "mapa"} />
          <LogisticsPanel />
        </Slide>
        <Slide ativo={cena === "temperatura"}>
          <TemperaturaSlide ativo={cena === "temperatura"} />
          <LogisticsPanel />
        </Slide>
        <Slide ativo={cena === "vento"}>
          <VentoSlide ativo={cena === "vento"} />
          <LogisticsPanel />
        </Slide>
        <Slide ativo={cena === "satelite"}>
          <SateliteSlide />
          <LogisticsPanel />
        </Slide>
      </PalcoEscalado>
    </main>
  );
}
