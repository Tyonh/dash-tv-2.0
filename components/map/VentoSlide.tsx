"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CENTRO_NORDESTE, ZOOM_INICIAL } from "@/lib/cidades";
import { VENTO_REFRESH_MS } from "@/lib/constants";
import { buscarVento } from "@/lib/vento";
import type { CampoVento, VentoPayload } from "@/lib/types";

type Props = { ativo: boolean };

/** Cor do mapa pela velocidade: azul/verde nas fracas, amarelo e rosa nas fortes, roxo nas mais fortes. */
const ESCALA_VENTO = [
  "#3f6fb5", "#4a8fc2", "#4fb0b8", "#5fc59a", "#8fd679", "#c7e06a",
  "#f2dc62", "#f4b45c", "#ee8a73", "#d6679f", "#a14fb8",
];
const VELOCIDADE_MAXIMA = 15;
const LARGURA_CAMPO_PX = 420;
const OPACIDADE_CAMPO = 0.8;
const PANE_CAMPO = "campoVento";

/** Partículas brancas: o fluxo fica branco e quem leva a cor é o mapa. */
const OPCOES_PARTICULAS: L.VelocityLayerOptions = {
  displayValues: false,
  minVelocity: 0,
  maxVelocity: VELOCIDADE_MAXIMA,
  velocityScale: 0.008,
  colorScale: ["#ffffff"],
  opacity: 0.9,
  lineWidth: 2,
  particleMultiplier: 1 / 150,
  particleAge: 90,
  frameRate: 20,
  paneName: "overlayPane",
};

type Rgb = [number, number, number];

const hexParaRgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];
const PALETA: Rgb[] = ESCALA_VENTO.map(hexParaRgb);

function corDaVelocidade(velocidade: number): Rgb {
  const t = Math.min(Math.max(velocidade / VELOCIDADE_MAXIMA, 0), 1) * (PALETA.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  const de = PALETA[i];
  const ate = PALETA[Math.min(i + 1, PALETA.length - 1)];
  return [de[0] + (ate[0] - de[0]) * f, de[1] + (ate[1] - de[1]) * f, de[2] + (ate[2] - de[2]) * f];
}

const graus = (rad: number): number => (rad * 180) / Math.PI;
const radianos = (g: number): number => (g * Math.PI) / 180;
const mercatorY = (lat: number): number => Math.log(Math.tan(Math.PI / 4 + radianos(lat) / 2));
const latDeMercator = (y: number): number => graus(2 * Math.atan(Math.exp(y)) - Math.PI / 2);

interface Janela {
  norte: number;
  sul: number;
  oeste: number;
  leste: number;
}

function janelaDoCampo(campo: CampoVento): Janela {
  const h = campo.header;
  return { norte: h.la1, sul: h.la1 - (h.ny - 1) * h.dy, oeste: h.lo1, leste: h.lo1 + (h.nx - 1) * h.dx };
}

/**
 * Pinta a velocidade do vento como imagem. O Leaflet estica a imagem de forma linear em
 * Web Mercator, então cada linha é amostrada na latitude certa (e não linear em graus).
 */
function desenharVelocidade(campos: [CampoVento, CampoVento]): string {
  const [u, v] = campos;
  const h = u.header;
  const j = janelaDoCampo(u);
  const velocidade = u.data.map((x, i) => Math.hypot(x, v.data[i]));

  const yNorte = mercatorY(j.norte);
  const ySul = mercatorY(j.sul);
  const largura = LARGURA_CAMPO_PX;
  const altura = Math.round((largura * (yNorte - ySul)) / radianos(j.leste - j.oeste));
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const imagem = ctx.createImageData(largura, altura);

  for (let py = 0; py < altura; py++) {
    const lat = latDeMercator(yNorte - (py / (altura - 1)) * (yNorte - ySul));
    const fj = Math.min(Math.max((j.norte - lat) / h.dy, 0), h.ny - 1);
    const j0 = Math.floor(fj);
    const j1 = Math.min(j0 + 1, h.ny - 1);
    const tj = fj - j0;
    for (let px = 0; px < largura; px++) {
      const lon = j.oeste + (px / (largura - 1)) * (j.leste - j.oeste);
      const fi = Math.min(Math.max((lon - j.oeste) / h.dx, 0), h.nx - 1);
      const i0 = Math.floor(fi);
      const i1 = Math.min(i0 + 1, h.nx - 1);
      const ti = fi - i0;
      const topo = velocidade[j0 * h.nx + i0] * (1 - ti) + velocidade[j0 * h.nx + i1] * ti;
      const base = velocidade[j1 * h.nx + i0] * (1 - ti) + velocidade[j1 * h.nx + i1] * ti;
      const [r, g, b] = corDaVelocidade(topo * (1 - tj) + base * tj);
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

const formatarValidade = (iso: string): string =>
  new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Fortaleza",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

interface Camadas {
  campo: L.ImageOverlay;
  particulas: L.VelocityLayer;
}

/**
 * A leaflet-velocity pede um quadro de animação ao ser adicionada. Se a camada for removida
 * antes de o quadro disparar, o redesenho acha `_map` nulo e lança erro. Ignora esse redesenho tardio.
 */
function protegerRedesenho(camada: L.VelocityLayer): void {
  const interna = camada as unknown as { _map: L.Map | null; drawLayer: () => void };
  const original = interna.drawLayer;
  interna.drawLayer = function (this: typeof interna) {
    if (!this._map) return;
    original.call(this);
  };
}

function criarCamadas(mapa: L.Map, dados: VentoPayload): Camadas {
  if (!mapa.getPane(PANE_CAMPO)) {
    const pane = mapa.createPane(PANE_CAMPO);
    pane.style.zIndex = "350"; // abaixo das partículas (overlayPane = 400)
  }
  const j = janelaDoCampo(dados.campos[0]);
  const campo = L.imageOverlay(
    desenharVelocidade(dados.campos),
    [[j.sul, j.oeste], [j.norte, j.leste]],
    { opacity: OPACIDADE_CAMPO, pane: PANE_CAMPO, interactive: false },
  ).addTo(mapa);
  const particulas = L.velocityLayer({ ...OPCOES_PARTICULAS, data: dados.campos });
  protegerRedesenho(particulas);
  particulas.addTo(mapa);
  return { campo, particulas };
}

/** Cria as camadas quando a cena está ativa e remove quando sai, para a animação não gastar CPU escondida. */
function sincronizarCamadas(
  mapa: L.Map,
  atuais: Camadas | null,
  dados: VentoPayload | null,
  ativo: boolean,
): Camadas | null {
  if (!ativo || !dados) {
    if (atuais) {
      mapa.removeLayer(atuais.particulas);
      mapa.removeLayer(atuais.campo);
    }
    return null;
  }
  return atuais ?? criarCamadas(mapa, dados);
}

export default function VentoSlide({ ativo }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const camadasRef = useRef<Camadas | null>(null);
  const dadosRef = useRef<VentoPayload | null>(null);
  const ativoRef = useRef(ativo);
  const [validade, setValidade] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelado = false;
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
    mapaRef.current = mapa;

    const carregar = async () => {
      try {
        // leaflet-velocity espera o L global
        (window as unknown as { L: typeof L }).L = L;
        await import("leaflet-velocity");
        const dados = await buscarVento();
        if (cancelado) return;
        dadosRef.current = dados;
        setValidade(formatarValidade(dados.valido_para));
        const atuais = camadasRef.current;
        if (atuais && ativoRef.current) {
          atuais.particulas.setData(dados.campos);
          atuais.campo.setUrl(desenharVelocidade(dados.campos));
        } else {
          camadasRef.current = sincronizarCamadas(mapa, atuais, dados, ativoRef.current);
        }
      } catch (e) {
        console.warn("Vento indisponível:", e);
      }
    };

    void carregar();
    const id = setInterval(() => void carregar(), VENTO_REFRESH_MS);

    return () => {
      cancelado = true;
      clearInterval(id);
      mapa.remove();
      mapaRef.current = null;
      camadasRef.current = null;
    };
  }, []);

  useEffect(() => {
    ativoRef.current = ativo;
    const mapa = mapaRef.current;
    if (!mapa) return;
    if (ativo) mapa.invalidateSize();
    camadasRef.current = sincronizarCamadas(mapa, camadasRef.current, dadosRef.current, ativo);
  }, [ativo]);

  return (
    <div className="relative h-full w-full bg-[#0b1320]">
      <div
        ref={containerRef}
        className="h-full w-full bg-[#0b1320]"
        role="img"
        aria-label="Velocidade do vento a 10 metros sobre o Nordeste, em cores, com o fluxo em movimento"
      />
      <div className="pointer-events-none absolute bottom-10 left-10 right-10 z-[1000] text-white">
        <div className="mb-2 flex items-baseline justify-between text-[1.4rem] font-semibold">
          <span>Vento a 10 m · m/s</span>
          {validade && <span className="text-[1.1rem] font-light opacity-80">NOAA GFS · previsão para {validade}</span>}
        </div>
        <div
          className="h-4 w-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${ESCALA_VENTO.join(", ")})` }}
        />
        <div className="mt-1 flex justify-between text-[1.2rem] font-medium">
          <span>0</span>
          <span>{VELOCIDADE_MAXIMA / 3}</span>
          <span>{(VELOCIDADE_MAXIMA * 2) / 3}</span>
          <span>{VELOCIDADE_MAXIMA}+</span>
        </div>
      </div>
    </div>
  );
}
