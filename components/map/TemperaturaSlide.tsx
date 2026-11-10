"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CENTRO_NORDESTE, CIDADES_VISITADAS, ZOOM_INICIAL } from "@/lib/cidades";
import { corNaPaleta, desenharGrade, hexParaRgb, janelaDaGrade, valorNaGrade } from "@/lib/campoMapa";
import { buscarTemperatura } from "@/lib/temperatura";
import type { TemperaturaPayload } from "@/lib/types";

type Props = { ativo: boolean };

const REFRESH_MS = 1_800_000;
const LARGURA_CAMPO_PX = 420;
const OPACIDADE_CAMPO = 0.8;
const PANE_CAMPO = "campoTemperatura";
const PANE_CONTORNO = "contornos";

/** Do maior para o menor: o Ceará é desenhado por último e fica por cima. */
const CONTORNOS = [
  { arquivo: "/geo/nordeste.geojson", espessura: 2, opacidade: 0.8 },
  { arquivo: "/geo/ceara.geojson", espessura: 3, opacidade: 0.95 },
] as const;

/** Paleta clássica de meteorologia: azul no frio, verde e amarelo no ameno, laranja e vermelho no calor. */
const TEMPERATURA_MINIMA = 20;
const TEMPERATURA_MAXIMA = 40;
const ESCALA = ["#2b5fd9", "#2fb5c9", "#5ec36b", "#e8d94a", "#f39a2e", "#e0452b", "#8f1d2c"];
const PALETA = ESCALA.map(hexParaRgb);
const MARCAS = [20, 25, 30, 35, 40];

const corDaTemperatura = (graus: number) =>
  corNaPaleta(PALETA, (graus - TEMPERATURA_MINIMA) / (TEMPERATURA_MAXIMA - TEMPERATURA_MINIMA));

/** Cidades principais: hubs e capitais regionais. */
const CIDADES_PRINCIPAIS = CIDADES_VISITADAS.filter((c) => c.tipo);

/** Cidades vizinhas no mapa: afasta o rótulo (em px) para um não cobrir o outro. */
const DESLOCAMENTO_ROTULO: Readonly<Record<string, readonly [number, number]>> = {
  Tianguá: [-75, -8],
  Sobral: [10, -62],
};

const formatarValidade =(iso: string): string =>
  new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Fortaleza",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Rótulo grande com o nome e a temperatura, legível de longe sobre qualquer cor do mapa. */
function iconeDaCidade(nome: string, graus: number): L.DivIcon {
  const [dx, dy] = DESLOCAMENTO_ROTULO[nome] ?? [0, 0];
  return L.divIcon({
    className: "",
    html: `<div style="width:max-content;transform:translate(calc(-50% + ${dx}px),calc(-100% - 12px + ${dy}px));display:flex;flex-direction:column;align-items:center;
        padding:4px 14px 6px;border-radius:14px;background:rgba(8,14,26,0.82);border:2px solid rgba(255,255,255,0.9);
        box-shadow:0 4px 14px rgba(0,0,0,0.55);color:#fff;white-space:nowrap;font-family:var(--font-poppins),sans-serif;">
        <span style="font-size:22px;font-weight:600;line-height:1.1;">${nome}</span>
        <span style="font-size:44px;font-weight:800;line-height:1.05;">${Math.round(graus)}°</span>
      </div>`,
    iconSize: [0, 0],
  });
}

interface Camadas {
  campo: L.ImageOverlay;
  rotulos: L.LayerGroup;
}

function criarCamadas(mapa: L.Map, dados: TemperaturaPayload): Camadas {
  if (!mapa.getPane(PANE_CAMPO)) {
    const pane = mapa.createPane(PANE_CAMPO);
    pane.style.zIndex = "350";
  }
  const j = janelaDaGrade(dados.campo);
  const campo = L.imageOverlay(
    desenharGrade(dados.campo, corDaTemperatura, LARGURA_CAMPO_PX),
    [[j.sul, j.oeste], [j.norte, j.leste]],
    { opacity: OPACIDADE_CAMPO, pane: PANE_CAMPO, interactive: false },
  ).addTo(mapa);
  const rotulos = L.layerGroup(
    CIDADES_PRINCIPAIS.flatMap((c) => [
      // Ponto branco no local exato; o rótulo pode ser afastado quando há cidades coladas
      L.circleMarker([c.lat, c.lng], { radius: 6, color: "#0b1320", weight: 2, fillColor: "#fff", fillOpacity: 1, interactive: false }),
      L.marker([c.lat, c.lng], {
        icon: iconeDaCidade(c.nome, valorNaGrade(dados.campo, c.lat, c.lng)),
        interactive: false,
        zIndexOffset: 1000,
      }),
    ]),
  ).addTo(mapa);
  return { campo, rotulos };
}

export default function TemperaturaSlide({ ativo }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const [validade, setValidade] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelado = false;
    let camadas: Camadas | null = null;
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
    mapa.createPane(PANE_CONTORNO).style.zIndex = "360"; // acima do calor, abaixo dos rótulos
    mapaRef.current = mapa;

    // Contornos (malha do IBGE): o Nordeste mais discreto e o Ceará em destaque
    for (const contorno of CONTORNOS) {
      fetch(contorno.arquivo)
        .then((r) => r.json() as Promise<GeoJSON.GeoJsonObject>)
        .then((geo) => {
          if (cancelado) return;
          const base = { interactive: false, fill: false, pane: PANE_CONTORNO };
          // Borda escura por baixo e linha branca por cima, para aparecer sobre qualquer cor
          L.geoJSON(geo, { ...base, style: { color: "#0b1320", weight: contorno.espessura + 4, opacity: 0.7 } }).addTo(mapa);
          L.geoJSON(geo, { ...base, style: { color: "#ffffff", weight: contorno.espessura, opacity: contorno.opacidade } }).addTo(mapa);
        })
        .catch((e) => console.warn(`Contorno ${contorno.arquivo} indisponível:`, e));
    }

    const carregar = async () => {
      try {
        const dados = await buscarTemperatura();
        if (cancelado) return;
        if (camadas) {
          mapa.removeLayer(camadas.campo);
          mapa.removeLayer(camadas.rotulos);
        }
        camadas = criarCamadas(mapa, dados);
        setValidade(formatarValidade(dados.valido_para));
      } catch (e) {
        console.warn("Temperatura indisponível:", e);
      }
    };

    void carregar();
    const id = setInterval(() => void carregar(), REFRESH_MS);

    return () => {
      cancelado = true;
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
        aria-label="Mapa de calor da temperatura do ar no Nordeste, com a temperatura das cidades principais"
      />
      <div className="pointer-events-none absolute bottom-10 left-10 right-10 z-[1000] text-white">
        <div className="mb-2 flex items-baseline justify-between text-[1.4rem] font-semibold">
          <span>Temperatura do ar · °C</span>
          {validade && <span className="text-[1.1rem] font-light opacity-80">NOAA GFS · previsão para {validade}</span>}
        </div>
        <div
          className="h-4 w-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${ESCALA.join(", ")})` }}
        />
        <div className="mt-1 flex justify-between text-[1.2rem] font-medium">
          {MARCAS.map((m, i) => (
            <span key={m}>
              {i === 0 ? "≤" : ""}
              {m}
              {i === MARCAS.length - 1 ? "+" : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
