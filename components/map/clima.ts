import L from "leaflet";

const REFRESH_MS = 600_000;
const LIMITES_NUVENS: L.LatLngBoundsLiteral = [
  [-12.0, -46.0],
  [1.0, -32.0],
];

const SVG_NUVENS = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 800'>
  <defs><filter id='blur-premium'><feGaussianBlur stdDeviation='45' /></filter></defs>
  <g filter='url(#blur-premium)' fill='#ffffff'>
    <ellipse cx='500' cy='300' rx='200' ry='120' opacity='0.78' />
    <ellipse cx='580' cy='270' rx='140' ry='100' opacity='0.82' />
    <ellipse cx='420' cy='320' rx='130' ry='90' opacity='0.72' />
    <ellipse cx='480' cy='550' rx='160' ry='100' opacity='0.75' />
    <ellipse cx='520' cy='580' rx='110' ry='80' opacity='0.78' />
    <ellipse cx='280' cy='260' rx='180' ry='110' opacity='0.74' />
    <ellipse cx='200' cy='290' rx='120' ry='90' opacity='0.68' />
    <ellipse cx='780' cy='380' rx='190' ry='120' opacity='0.70' />
    <ellipse cx='840' cy='400' rx='130' ry='95' opacity='0.76' />
    <ellipse cx='720' cy='360' rx='110' ry='85' opacity='0.66' />
  </g>
</svg>`;

const urlSvg = () => `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(SVG_NUVENS)))}`;

/**
 * Camadas de clima: nuvens reais (OpenWeatherMap, se houver chave) ou simulador em SVG,
 * mais radar de chuva do RainViewer. Devolve a função que para as atualizações.
 */
export function iniciarClima(mapa: L.Map): () => void {
  // A chave fica no servidor: o mapa só pergunta se existe e pede os blocos ao proxy /api/nuvens
  let temChave = false;
  let nuvens: L.TileLayer | null = null;
  let simulador: L.ImageOverlay | null = null;
  let chuva: L.TileLayer | null = null;
  let ativo = true;

  const atualizarNuvens = () => {
    if (!temChave) {
      simulador ??= L.imageOverlay(urlSvg(), LIMITES_NUVENS, {
        opacity: 0.95,
        zIndex: 4,
        className: "animated-clouds",
      }).addTo(mapa);
      return;
    }
    if (simulador) {
      mapa.removeLayer(simulador);
      simulador = null;
    }
    // Muda a cada 10 min: o navegador reaproveita os blocos dentro da janela
    const janela = Math.floor(Date.now() / REFRESH_MS);
    const url = `/api/nuvens/{z}/{x}/{y}?_=${janela}`;
    if (nuvens) nuvens.setUrl(url);
    else nuvens = L.tileLayer(url, { opacity: 1, zIndex: 4, attribution: "&copy; OpenWeatherMap" }).addTo(mapa);
  };

  const atualizarChuva = async () => {
    try {
      const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
      const data = (await res.json()) as { radar?: { past?: { path: string }[] } };
      const passado = data.radar?.past ?? [];
      if (!ativo || passado.length === 0) return;
      const url = `https://tilecache.rainviewer.com${passado[passado.length - 1].path}/256/{z}/{x}/{y}/1/1_1.png`;
      if (chuva) chuva.setUrl(url);
      else chuva = L.tileLayer(url, { opacity: 0.7, zIndex: 5 }).addTo(mapa);
    } catch (e) {
      console.warn("Radar RainViewer indisponível:", e);
    }
  };

  const atualizar = () => {
    atualizarNuvens();
    void atualizarChuva();
  };
  atualizarNuvens(); // simulador já na primeira pintura
  fetch("/api/nuvens/ativo")
    .then((r) => r.json() as Promise<{ ativo?: boolean }>)
    .then((d) => {
      temChave = Boolean(d.ativo);
    })
    .catch(() => undefined)
    .finally(() => {
      if (ativo) atualizar();
    });
  const id = setInterval(atualizar, REFRESH_MS);

  return () => {
    ativo = false;
    clearInterval(id);
  };
}
