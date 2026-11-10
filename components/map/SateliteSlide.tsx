"use client";

import { useEffect, useState } from "react";
import { SATELITE_REFRESH_MS } from "@/lib/constants";
import { buscarSatelite } from "@/lib/satelite";

/** Recorte vertical do Nordeste dentro do quadro de 7200x4320 (frações da imagem inteira). */
const RECORTE = {
  x: 4000 / 7200,
  y: 1250 / 4320,
  largura: 1520 / 7200,
  altura: 2700 / 4320,
} as const;

interface Quadro {
  url: string;
  hora: string;
}

const formatarHora = (iso: string): string =>
  new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Fortaleza",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function SateliteSlide() {
  const [quadro, setQuadro] = useState<Quadro | null>(null);

  useEffect(() => {
    let cancelado = false;

    const carregar = async () => {
      try {
        const dados = await buscarSatelite();
        if (cancelado) return;
        // Baixa em segundo plano e só troca quando terminar: a TV nunca mostra imagem pela metade
        const preCarga = new Image();
        preCarga.onload = () => {
          if (!cancelado) setQuadro({ url: dados.url, hora: formatarHora(dados.quadro) });
        };
        preCarga.src = dados.url;
      } catch (e) {
        console.warn("Satélite indisponível:", e);
      }
    };

    void carregar();
    const id = setInterval(() => void carregar(), SATELITE_REFRESH_MS);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050b14]">
      {quadro ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={quadro.url}
          alt="Imagem de satélite GOES-19 do Nordeste do Brasil, em cores reais"
          className="absolute max-w-none"
          style={{
            width: `${100 / RECORTE.largura}%`,
            left: `${-(RECORTE.x / RECORTE.largura) * 100}%`,
            top: `${-(RECORTE.y / RECORTE.altura) * 100}%`,
          }}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-[1.6rem] text-white/70">
          Carregando imagem do satélite...
        </div>
      )}
      {quadro && (
        <div className="pointer-events-none absolute bottom-10 left-10 right-10 flex items-baseline justify-between text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.8)]">
          <span className="text-[1.4rem] font-semibold">Satélite GOES-19 · cores reais</span>
          <span className="text-[1.1rem] font-light opacity-90">NOAA/NESDIS · imagem das {quadro.hora}</span>
        </div>
      )}
    </div>
  );
}
