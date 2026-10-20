const OPENWEATHER_API_KEY = "SUA_API_KEY_AQUI"; // Removido chave secreta por segurança (crie o arquivo config.json localmente para chaves privadas)

const SHEET_URLS = {
  ranking:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3Ov8l0GVetC6ywdnbQnBljOecI21rjuMYrwcjWypC1V1NBUNAWmKIo4Pn698p4Q/pub?gid=1600633914&single=true&output=csv",
  positivacao:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3Ov8l0GVetC6ywdnbQnBljOecI21rjuMYrwcjWypC1V1NBUNAWmKIo4Pn698p4Q/pub?gid=577000856&single=true&output=csv",
  podioMes:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3Ov8l0GVetC6ywdnbQnBljOecI21rjuMYrwcjWypC1V1NBUNAWmKIo4Pn698p4Q/pub?gid=1467795128&single=true&output=csv",
  campeoesSemanas:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3Ov8l0GVetC6ywdnbQnBljOecI21rjuMYrwcjWypC1V1NBUNAWmKIo4Pn698p4Q/pub?gid=1883964368&single=true&output=csv",
};

let mapInstance;

/* --- COMPONENTES DE HIGIENIZAÇÃO DE DADOS E IMAGENS PREMIUM --- */
const IMAGEM_PADRAO =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cccccc'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
const TROFEU_PADRAO =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffaa00'><path d='M18 2H6v2H1v6c0 3.66 2.56 6.75 6 7.74V20H5v2h14v-2h-2v-2.26c3.44-.99 6-4.08 6-7.74V4h-5V2zm-11 8V6h11v4c0 2.76-2.24 5-5 5s-5-2.24-5-5z'/></svg>";

const isNomeValido = (nome) => {
  if (!nome) return false;
  const n = nome.trim().toLowerCase();
  return n !== "" && n !== "-" && n !== "a definir" && n !== "a_definir";
};

const obterImagemVendedor = (nome) => {
  return isNomeValido(nome) ? `img/${nome.trim()}.png` : IMAGEM_PADRAO;
};

const obterImagemCampeao = (nome) => {
  return isNomeValido(nome) ? `img/${nome.trim()}.png` : TROFEU_PADRAO;
};

const formatarNome = (nome) => {
  return isNomeValido(nome) ? nome.trim().toUpperCase() : "A DEFINIR";
};

document.addEventListener("DOMContentLoaded", () => {
  carregarRanking();
  carregarPositivacao();
  carregarPodioCompleto();
  atualizarData();
  iniciarRelogio();
  iniciarMapa();
  iniciarRotacaoSlides();
  atualizarNoticias();
  atualizarInfoNavios();
});

/* --- RODAPÉ DE NOTÍCIAS (IBGE) --- */
async function atualizarNoticias() {
  const API_URL = "https://servicodados.ibge.gov.br/api/v3/noticias/?qtd=7";
  const BASE_IMG_URL = "https://agenciadenoticias.ibge.gov.br/";
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    const container = document.getElementById("news-content");
    if (data.items && data.items.length > 0) {
      container.innerHTML = data.items
        .map((item) => {
          let linkImagem = "";
          try {
            const imagensObj = JSON.parse(item.imagens);
            if (imagensObj.image_intro)
              linkImagem = BASE_IMG_URL + imagensObj.image_intro;
          } catch (e) {}
          const imgTag = linkImagem
            ? `<img src="${linkImagem}" class="ticker-img">`
            : `📰`;
          return `<span>${imgTag} ${item.titulo.toUpperCase()}</span>`;
        })
        .join("");
      container.style.animationDuration = `${data.items.length * 18}s`;
    }
  } catch (error) {
    console.error("Erro IBGE:", error);
  }
}

/* --- CARROSSEL E RE-ANIMAÇÃO --- */
function iniciarRotacaoSlides() {
  const slides = document.querySelectorAll(".slide-page");
  if (slides.length === 0) return;
  let indexAtual = 0;
  const TEMPO_DADOS = 20000;
  const TEMPO_MAPA = 15000; // Aumentado para 15 segundos para visualização rica de rotas e clima

  function agendarProximaTroca(tempoDeEspera) {
    setTimeout(() => {
      slides[indexAtual].classList.remove("active");
      indexAtual = (indexAtual + 1) % slides.length;
      const slideAtivo = slides[indexAtual];
      slideAtivo.classList.add("active");

      // Refaz as animações sempre que o slide de dados aparecer
      if (slideAtivo.id === "slide-dados") {
        carregarRanking();
        carregarPositivacao();
        carregarPodioCompleto();
        atualizarNoticias();
      }

      if (slideAtivo.id === "slide-mapa" && mapInstance) {
        setTimeout(() => mapInstance.invalidateSize(), 300);
      }

      const proximoTempo =
        slideAtivo.id === "slide-mapa" ? TEMPO_MAPA : TEMPO_DADOS;
      agendarProximaTroca(proximoTempo);
    }, tempoDeEspera);
  }
  agendarProximaTroca(TEMPO_DADOS);
}

/* --- MAPA E CIDADES --- */
function iniciarMapa() {
  const centroNordeste = [-7.0, -41.0];
  mapInstance = L.map("map", {
    zoomControl: false,
    dragging: true,
    scrollWheelZoom: false,
    zoomSnap: 0.1,
    zoomDelta: 0.1,
  }).setView(centroNordeste, 6.5);

  L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    noWrap: true,
    detectRetina: true,
  }).addTo(mapInstance);

  const cidadesVisitadas = [
    { nome: "Fortaleza", lat: -3.7172, lng: -38.5433, tipo: "hub" },
    { nome: "Teresina", lat: -5.092, lng: -42.8034, tipo: "capital" },
    { nome: "Recife", lat: -8.0578, lng: -34.8829, tipo: "capital" },
    { nome: "Acopiara", lat: -6.09315, lng: -39.45315 },
    { nome: "Alcântaras", lat: -3.58683, lng: -40.54549 },
    { nome: "Caucaia", lat: -3.72814, lng: -38.66192 },
    { nome: "São Luís", lat: -2.53067, lng: -44.29889, tipo: "capital" },
    { nome: "Sobral", lat: -3.68248, lng: -40.35358, tipo: "capital" },
    {
      nome: "Juazeiro do Norte",
      lat: -7.2242,
      lng: -39.31301,
      tipo: "capital",
    },
    { nome: "Maracanaú", lat: -3.86828, lng: -38.62645 },
    { nome: "Amontada", lat: -3.3618, lng: -39.83085 },
    { nome: "Apuiarés", lat: -3.94654, lng: -39.43049 },
    { nome: "Aracoiaba", lat: -4.37198, lng: -38.81045 },
    { nome: "Aratuba", lat: -4.41948, lng: -39.04639 },
    { nome: "Banabuiú", lat: -5.30635, lng: -38.92031 },
    { nome: "Barreira", lat: -4.28834, lng: -38.64125 },
    { nome: "Barroquinha", lat: -3.01998, lng: -41.13445 },
    { nome: "Baturité", lat: -4.33132, lng: -38.87895 },
    { nome: "Boa Viagem", lat: -5.12597, lng: -39.73094 },
    { nome: "Camocim", lat: -2.90084, lng: -40.84209 },
    { nome: "Canindé", lat: -4.35804, lng: -39.31373 },
    { nome: "Capistrano", lat: -4.46661, lng: -38.90024 },
    { nome: "Caridade", lat: -4.23349, lng: -39.1921 },
    { nome: "Cariré", lat: -3.9496, lng: -40.47405 },
    { nome: "Carnaubal", lat: -4.16254, lng: -40.94147 },
    { nome: "Catunda", lat: -4.64902, lng: -40.19992 },
    { nome: "Chaval", lat: -3.03528, lng: -41.24338 },
    { nome: "Choró", lat: -4.8459, lng: -39.13712 },
    { nome: "Croatá", lat: -4.4164, lng: -40.90726 },
    { nome: "Cruz", lat: -2.922, lng: -40.1758 },
    { nome: "Irauçuba", lat: -3.74757, lng: -39.7827 },
    { nome: "Itapipoca", lat: -3.49471, lng: -39.58038 },
    { nome: "Itapiúna", lat: -4.56154, lng: -38.9206 },
    { nome: "Itarema", lat: -2.92423, lng: -39.91292 },
    { nome: "Vila de Jericoacoara", lat: -2.79738, lng: -40.5124 },
    { nome: "Quixadá", lat: -4.96843, lng: -39.01612 },
    { nome: "Quixeramobim", lat: -5.19829, lng: -39.29553 },
    { nome: "Redenção", lat: -4.22388, lng: -38.73022 },
    { nome: "Tianguá", lat: -3.73092, lng: -40.99275, tipo: "capital" },
    { nome: "Ubajara", lat: -3.85321, lng: -40.91959 },
    { nome: "Varjota", lat: -4.19586, lng: -40.47333 },
    { nome: "Natal", lat: -5.78416, lng: -35.19997, tipo: "capital" },
  ];

  // Adiciona os marcadores customizados
  cidadesVisitadas.forEach((cidade) => {
    if (cidade.tipo === "hub") {
      const iconeAzul = L.divIcon({
        className: "custom-pulse-marker blue",
        html: `<div class="pulse-ring blue"></div><div class="pulse-dot blue"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([cidade.lat, cidade.lng], { icon: iconeAzul })
        .addTo(mapInstance)
        .bindPopup(
          `<b style="font-size: 20px;">${cidade.nome} (HUB CENTRAL)</b>`,
        );
    } else {
      // Todos os outros pontos (incluindo as capitais laranjas antigas) agora são pequenos pontos vermelhos idênticos e discretos
      L.circleMarker([cidade.lat, cidade.lng], {
        radius: 3,
        fillColor: "#ff4444",
        color: "#fff",
        weight: 1,
        fillOpacity: 0.9,
      })
        .addTo(mapInstance)
        .bindPopup(`<b style="font-size: 20px;">${cidade.nome}</b>`);
    }
  });

  // Função para calcular a distância geodésica simples entre dois pontos (Haversine)
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Função para gerar uma rota curva simulando uma rodovia sinuosa (BR)
  const obterRotaRodoviaCurva = (p0, p2) => {
    const pontos = [];
    const lat0 = p0[0],
      lng0 = p0[1];
    const lat2 = p2[0],
      lng2 = p2[1];

    const midLat = (lat0 + lat2) / 2;
    const midLng = (lng0 + lng2) / 2;

    const dLat = lat2 - lat0;
    const dLng = lng2 - lng0;

    // Determina a direção da curva com base em um hash simples para alternar o lado das curvas de forma orgânica
    const hash = Math.abs(lat0 + lng0 + lat2 + lng2) * 1000;
    const direcao = Math.floor(hash) % 2 === 0 ? 1 : -1;

    const fatorCurva = 0.12 * direcao;
    const perpLat = -dLng * fatorCurva;
    const perpLng = dLat * fatorCurva;

    const cLat = midLat + perpLat;
    const cLng = midLng + perpLng;

    const numSegmentos = 16;
    for (let i = 0; i <= numSegmentos; i++) {
      const t = i / numSegmentos;
      const u = 1 - t;

      // Fórmula de Bézier Quadrática
      let lat = u * u * lat0 + 2 * u * t * cLat + t * t * lat2;
      let lng = u * u * lng0 + 2 * u * t * cLng + t * t * lng2;

      // Adiciona uma leve ondulação senoidal para imitar o traçado sinuoso real de uma rodovia (BR)
      const ondulacao =
        Math.sin(t * Math.PI) * 0.015 * Math.sin(t * Math.PI * 4);
      lat += ondulacao;
      lng += ondulacao;

      pontos.push([lat, lng]);
    }

    return pontos;
  };

  // Mapeamento sequencial de rotas imitando as Rodovias Federais (BRs)
  const dicionarioCidades = {};
  cidadesVisitadas.forEach((c) => {
    dicionarioCidades[c.nome] = c;
  });

  const rotasBR = {
    "BR-116": [
      "Fortaleza",
      "Maracanaú",
      "Barreira",
      "Redenção",
      "Aracoiaba",
      "Baturité",
      "Capistrano",
      "Itapiúna",
      "Quixadá",
      "Choró",
      "Banabuiú",
      "Quixeramobim",
      "Acopiara",
      "Juazeiro do Norte",
    ],
    "BR-222": [
      "Fortaleza",
      "Caucaia",
      "Apuiarés",
      "Irauçuba",
      "Sobral",
      "Cariré",
      "Varjota",
      "Alcântaras",
      "Ubajara",
      "Tianguá",
      "Carnaubal",
      "Croatá",
    ],
    "BR-020": [
      "Fortaleza",
      "Caucaia",
      "Caridade",
      "Canindé",
      "Aratuba",
      "Boa Viagem",
      "Catunda",
      "Teresina",
      "São Luís",
    ],
    "BR-402": [
      "Fortaleza",
      "Caucaia",
      "Itapipoca",
      "Amontada",
      "Itarema",
      "Cruz",
      "Vila de Jericoacoara",
      "Camocim",
      "Barroquinha",
      "Chaval",
    ],
    "BR-101": ["Fortaleza", "Natal", "Recife"],
  };

  const conexoesDesenhadas = new Set();

  Object.entries(rotasBR).forEach(([nomeBR, rotaCidades]) => {
    for (let i = 0; i < rotaCidades.length - 1; i++) {
      const nomeA = rotaCidades[i];
      const nomeB = rotaCidades[i + 1];

      const cidadeA = dicionarioCidades[nomeA];
      const cidadeB = dicionarioCidades[nomeB];

      if (cidadeA && cidadeB) {
        const chave = [nomeA, nomeB].sort().join("-");
        if (!conexoesDesenhadas.has(chave)) {
          conexoesDesenhadas.add(chave);

          const rotaCurva = obterRotaRodoviaCurva(
            [cidadeA.lat, cidadeA.lng],
            [cidadeB.lat, cidadeB.lng],
          );

          L.polyline(rotaCurva, {
            color: "#ff3333", // Vermelho das BRs
            weight: 2.0, // Espessura ideal para visualização na TV
            opacity: 0.8, // Translúcido brilhante
          })
            .addTo(mapInstance)
            .bindPopup(
              `<b style="font-size: 18px;">${nomeBR}</b><br>Trecho: ${nomeA} ⇄ ${nomeB}`,
            );
        }
      }
    }
  });

  // Garantia de Conectividade (Fail-safe): Se alguma cidade ficar de fora de rotasBR por erro ortográfico, conecta ao vizinho mais próximo
  const cidadesConectadas = new Set();
  Object.values(rotasBR).forEach((rota) => {
    rota.forEach((c) => cidadesConectadas.add(c));
  });

  cidadesVisitadas.forEach((cidadeA) => {
    if (!cidadesConectadas.has(cidadeA.nome)) {
      let cidadeMaisProxima = null;
      let menorDistancia = Infinity;
      cidadesVisitadas.forEach((cidadeB) => {
        if (cidadeA.nome !== cidadeB.nome) {
          const dist = calcularDistancia(
            cidadeA.lat,
            cidadeA.lng,
            cidadeB.lat,
            cidadeB.lng,
          );
          if (dist < menorDistancia) {
            menorDistancia = dist;
            cidadeMaisProxima = cidadeB;
          }
        }
      });

      if (cidadeMaisProxima) {
        const chave = [cidadeA.nome, cidadeMaisProxima.nome].sort().join("-");
        if (!conexoesDesenhadas.has(chave)) {
          conexoesDesenhadas.add(chave);
          const rotaCurva = obterRotaRodoviaCurva(
            [cidadeA.lat, cidadeA.lng],
            [cidadeMaisProxima.lat, cidadeMaisProxima.lng],
          );
          L.polyline(rotaCurva, {
            color: "#ff3333",
            weight: 2.0,
            opacity: 0.8,
          })
            .addTo(mapInstance)
            .bindPopup(
              `<b>Rota de Acesso</b><br>Interligação: ${cidadeA.nome} ⇄ ${cidadeMaisProxima.nome}`,
            );
        }
      }
    }
  });

  adicionarRadarClima(mapInstance);
  // Atualiza a cobertura de nuvens e radar a cada 10 minutos para manter os dados climáticos reais atualizados na TV
  setInterval(() => {
    adicionarRadarClima(mapInstance);
  }, 600000);
}

function parseNumber(val) {
  if (!val) return 0;
  let clean = val
    .toString()
    .replace(/[^0-9.,]/g, "")
    .replace(",", ".");
  return parseFloat(clean) || 0;
}

function iniciarRelogio() {
  setInterval(() => {
    const now = new Date();
    document.getElementById("relogio-data").innerText =
      now.toLocaleDateString("pt-BR");
    document.getElementById("relogio-hora").innerText =
      now.toLocaleTimeString("pt-BR");
  }, 1000);
}

/**
 * Retorna a segunda-feira (00:00) da semana em que a data cai.
 * Base para definir a "1ª semana do mês" por calendário real.
 * @param {Date} data
 * @returns {Date}
 */
const inicioDaSemana = (data) => {
  const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const diaSemana = d.getDay();
  const deslocamento = diaSemana === 0 ? -6 : 1 - diaSemana;
  d.setDate(d.getDate() + deslocamento);
  return d;
};

/**
 * Verdadeiro apenas enquanto hoje estiver na MESMA semana em que caiu o dia 1º.
 * @param {Date} [data=new Date()]
 * @returns {boolean}
 */
const estaNaPrimeiraSemanaDoMes = (data = new Date()) => {
  const primeiroDoMes = new Date(data.getFullYear(), data.getMonth(), 1);
  return (
    inicioDaSemana(data).getTime() === inicioDaSemana(primeiroDoMes).getTime()
  );
};

/**
 * @typedef {Object} VendedorRanking
 * @property {string} nome
 * @property {number} perc
 */

/**
 * Renderiza os cards de destaque estilo campeão para quem atingiu 100% ou mais da meta.
 * Na 1ª semana do mês, ocupa o espaço central de forma exclusiva (sem as barras).
 * @param {VendedorRanking[]} bateramMeta
 * @param {boolean} isPrimeiraSemana
 */
const renderizarCardsMetaBatida = (bateramMeta, isPrimeiraSemana) => {
  const containerCardsWrapper = document.getElementById("cards-meta-batida-wrapper");
  const containerCards = document.getElementById("cards-meta-batida");
  const sectionRanking = document.getElementById("section-ranking");

  if (!containerCards || !containerCardsWrapper || !sectionRanking) return;

  if (isPrimeiraSemana) {
    sectionRanking.classList.add("modo-primeira-semana");
    sectionRanking.classList.remove("has-meta-batida");
    containerCardsWrapper.style.display = "flex";

    if (bateramMeta.length > 0) {
      containerCards.className = `cards-meta-batida qtd-${bateramMeta.length} destaque-primeira-semana`;
      containerCards.innerHTML = bateramMeta
        .map(
          (v) => `
        <div class="card-campeao-mes card-meta-individual card-primeira-semana">
          <img src="${obterImagemCampeao(v.nome)}" class="foto-grid" onerror="this.onerror=null; this.src='${TROFEU_PADRAO}';">
          <span class="label-campeao">🏆 META 100% BATIDA 🏆</span>
          <span class="nome-sem-grid">${formatarNome(v.nome)}</span>
          <span class="pts-campeao">${v.perc}%</span>
        </div>`,
        )
        .join("");
    } else {
      containerCards.className = "cards-meta-batida qtd-0 destaque-primeira-semana";
      containerCards.innerHTML = `
        <div class="card-campeao-mes card-meta-individual card-primeira-semana sem-meta">
          <span class="label-campeao">🎯 META DO MÊS 🎯</span>
          <span class="nome-sem-grid">EM BUSCA DOS 100%</span>
          <span class="pts-campeao">PRIMEIRA SEMANA</span>
        </div>`;
    }
  } else {
    sectionRanking.classList.remove("modo-primeira-semana");
    if (bateramMeta.length > 0) {
      containerCardsWrapper.style.display = "block";
      sectionRanking.classList.add("has-meta-batida");
      containerCards.className = `cards-meta-batida qtd-${bateramMeta.length}`;

      containerCards.innerHTML = bateramMeta
        .map(
          (v) => `
        <div class="card-campeao-mes card-meta-individual">
          <img src="${obterImagemCampeao(v.nome)}" class="foto-grid" onerror="this.onerror=null; this.src='${TROFEU_PADRAO}';">
          <span class="label-campeao">🏆 META BATIDA 🏆</span>
          <span class="nome-sem-grid">${formatarNome(v.nome)}</span>
          <span class="pts-campeao">${v.perc}%</span>
        </div>`,
        )
        .join("");
    } else {
      containerCardsWrapper.style.display = "none";
      sectionRanking.classList.remove("has-meta-batida");
      containerCards.innerHTML = "";
    }
  }
};

/**
 * Renderiza a lista de barras/termômetros do ranking de todos os consultores.
 * Na 1ª semana do mês, a lista permanece completamente oculta conforme solicitado.
 * @param {VendedorRanking[]} dados
 * @param {boolean} isPrimeiraSemana
 */
const renderizarTermometrosRanking = (dados, isPrimeiraSemana) => {
  const rankingList = document.getElementById("ranking-list");
  if (!rankingList) return;

  if (isPrimeiraSemana) {
    rankingList.style.display = "none";
    rankingList.innerHTML = "";
    return;
  }

  rankingList.style.display = "flex";
  rankingList.innerHTML = dados
    .map(
      (v) => `
    <div class="ranking-item">
      <img src="${obterImagemVendedor(v.nome)}" class="foto-vendedor" onerror="this.onerror=null; this.src='${IMAGEM_PADRAO}';">
      <div class="termometro-bg">
        <div class="termometro-fill" style="width:0%" data-target="${Math.min(v.perc, 100)}"></div>
        <div class="info-vendedor-interna"><span>${formatarNome(v.nome)}</span><span>${v.perc}%</span></div>
      </div>
    </div>`,
    )
    .join("");

  setTimeout(
    () =>
      document
        .querySelectorAll("#ranking-list .termometro-fill")
        .forEach((b) => (b.style.width = b.dataset.target + "%")),
    100,
  );
};

/**
 * Busca dados da planilha e atualiza ranking individual e cards de meta batida
 */
const carregarRanking = async () => {
  try {
    const res = await fetch(SHEET_URLS.ranking);
    const text = await res.text();
    const dados = text
      .trim()
      .split("\n")
      .slice(1)
      .map((l) => {
        const c = l.split(",");
        return {
          nome: c[0].trim(),
          perc: parseFloat(c[1].replace("%", "").replace(",", ".")),
        };
      })
      .sort((a, b) => b.perc - a.perc);

    const isPrimeiraSemana = estaNaPrimeiraSemanaDoMes();
    const bateramMeta = dados.filter((v) => isNomeValido(v.nome) && v.perc >= 100);

    renderizarCardsMetaBatida(bateramMeta, isPrimeiraSemana);
    renderizarTermometrosRanking(dados, isPrimeiraSemana);
  } catch (e) {
    console.error("Erro ao carregar ranking individual:", e);
  }
};

async function carregarPositivacao() {
  try {
    const res = await fetch(SHEET_URLS.positivacao);
    const text = await res.text();
    const dados = text
      .trim()
      .split("\n")
      .slice(1)
      .map((l) => {
        const c = l.split(",");
        if (c.length < 3) return null;
        return {
          nome: c[0].trim(),
          meta: parseNumber(c[1]),
          venda: parseNumber(c[2]),
        };
      })
      .filter((item) => item !== null);
    const teto = Math.max(...dados.map((d) => Math.max(d.meta, d.venda))) || 1;
    document.getElementById("positivacao-chart").innerHTML = dados
      .map((v) => {
        const altMeta = (v.meta / teto) * 85;
        const percVenda = v.meta > 0 ? (v.venda / v.meta) * 100 : 0;
        return `
        <div class="bar-wrapper">
          <div class="meta-label">META ${v.meta}</div>
          <div class="bar-goal" style="height:${altMeta}%">
            <div class="bar-fill-vertical" style="height:0%" data-target="${percVenda}">
              <div class="floating-value">${v.venda}</div>
            </div>
          </div>
          <div class="bar-label-name">${v.nome}</div>
        </div>`;
      })
      .join("");
    setTimeout(
      () =>
        document
          .querySelectorAll(".bar-fill-vertical")
          .forEach((b) => (b.style.height = b.dataset.target + "%")),
      100,
    );
  } catch (e) {
    console.error(e);
  }
}



async function carregarPodioCompleto() {
  document
    .querySelectorAll("#podio-mes-chart .termometro-fill")
    .forEach((b) => (b.style.width = "0%"));
  try {
    const [resP, resC] = await Promise.all([
      fetch(SHEET_URLS.podioMes),
      fetch(SHEET_URLS.campeoesSemanas),
    ]);
    const pontos = (await resP.text())
      .trim()
      .split("\n")
      .slice(1)
      .map((l) => {
        const c = l.split(",");
        return { nome: c[0].trim(), pts: parseInt(c[1]) };
      })
      .sort((a, b) => b.pts - a.pts);

    const max = Math.max(...pontos.map((d) => d.pts)) || 1;

    document.getElementById("podio-mes-chart").innerHTML = pontos
      .map(
        (v) => `
      <div class="ranking-item">
        <div class="termometro-bg" style="height: 45px;">
          <div class="termometro-fill" style="width:0%" data-target="${(v.pts / max) * 100}"></div>
          <div class="info-vendedor-interna" style="font-size: 1.2rem;">
            <span>${v.nome}</span><span>${v.pts} pts</span>
          </div>
        </div>
      </div>`,
      )
      .join("");

    const campeoes = (await resC.text())
      .trim()
      .split("\n")
      .slice(1)
      .map((l) => {
        const c = l.split(",");
        return { sem: c[0].trim(), nome: c[1].trim(), pontos: parseInt(c[2]) };
      });

    /* --- LÓGICA DE EXIBIÇÃO: 1ª SEMANA VS RESTO DO MÊS --- */
    // Usa a semana de calendário real (não "dia <= 7"): o campeão do mês
    // anterior só aparece enquanto hoje estiver na 1ª semana do mês.
    const isPrimeiraSemana = estaNaPrimeiraSemanaDoMes();

    // Captura o título e o container da direita para podermos manipulá-los
    const tituloDireita = document.querySelector(
      ".podio-lado-direito .titulo-sessao",
    );
    const containerCampeoes = document.getElementById("campeoes-list");

    const meses = [
      "JANEIRO",
      "FEVEREIRO",
      "MARÇO",
      "ABRIL",
      "MAIO",
      "JUNHO",
      "JULHO",
      "AGOSTO",
      "SETEMBRO",
      "OUTUBRO",
      "NOVEMBRO",
      "DEZEMBRO",
    ];
    const mesAtualIndex = new Date().getMonth();
    const mesAnteriorIndex = (mesAtualIndex - 1 + 12) % 12;
    const nomeMesAnterior = meses[mesAnteriorIndex];

    // Verifica se é a primeira semana E se existem dados no ranking principal
    if (isPrimeiraSemana && pontos.length > 0) {
      // Altera o título dinamicamente para o mês anterior (mês que ele ganhou)
      if (tituloDireita)
        tituloDireita.innerText = `CAMPEÃO DE ${nomeMesAnterior}`;

      // Troca a classe para remover a grelha 2x2 e permitir o alinhamento central
      containerCampeoes.className = "campeao-mes-unico";

      // Pega o líder do pódio
      const campeaoMes = pontos[0];

      containerCampeoes.innerHTML = `
        <div class="card-campeao-mes">
          <img src="${obterImagemCampeao(campeaoMes.nome)}" class="foto-grid" onerror="this.onerror=null; this.src='${TROFEU_PADRAO}';">
          <span class="label-campeao">🏆 CAMPEÃO DE ${nomeMesAnterior} 🏆</span>
          <span class="nome-sem-grid">${formatarNome(campeaoMes.nome)}</span>
          <span class="pts-campeao">${campeaoMes.pts} pts</span>
        </div>
      `;
    } else {
      // Se já passou do dia 7, restaura o formato padrão semanal
      if (tituloDireita) tituloDireita.innerText = "CAMPEÕES DAS SEMANAS";
      containerCampeoes.className = "campeoes-grid-2x2";

      containerCampeoes.innerHTML = campeoes
        .slice(0, 5)
        .map((c) => {
          if (!isNomeValido(c.nome)) {
            return `<div class="card-campeao-grid-vazio"></div>`;
          }
          return `
            <div class="card-campeao-grid">
              <img src="${obterImagemCampeao(c.nome)}" class="foto-grid" onerror="this.onerror=null; this.src='${TROFEU_PADRAO}';">
              <span class="label-sem-grid">${c.sem}</span>
              <span class="nome-sem-grid">${formatarNome(c.nome)}</span>
              <span class="nome-sem-grid">Pontos ${c.pontos}</span>
            </div>`;
        })
        .join("");
    }

    setTimeout(
      () =>
        document
          .querySelectorAll("#podio-mes-chart .termometro-fill")
          .forEach((b) => (b.style.width = b.dataset.target + "%")),
      100,
    );
  } catch (e) {
    console.error(e);
  }
}

function atualizarData() {
  const meses = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO",
  ];

  const dataAtual = new Date();
  const mesAtualIndex = dataAtual.getMonth();

  // Positivação/Target sempre mostra o mês comercial atual
  document
    .querySelectorAll("#section-positivacao .mes-atual")
    .forEach((el) => (el.innerText = meses[mesAtualIndex]));

  // O Pódio do Mês mostra o mês encerrado (anterior) só durante a 1ª semana
  // de calendário do mês posterior (mesma regra do card de campeão).
  const mesPodioIndex = estaNaPrimeiraSemanaDoMes(dataAtual)
    ? (mesAtualIndex - 1 + 12) % 12
    : mesAtualIndex;
  document
    .querySelectorAll("#section-podio .mes-atual")
    .forEach((el) => (el.innerText = meses[mesPodioIndex]));
}
/* --- ATUALIZAÇÃO DE NAVIOS E LOGÍSTICA (ALINHAMENTO EM COLUNAS) --- */
function atualizarInfoNavios() {
  const conteineres = [
    {
      id: "4",
      nome: "NATALINO 1",
      saida: "01/07/2026",
      chegada: "--/--/----",
    },
    {
      id: "5",
      nome: "NATALINO 2",
      saida: "01/07/2026",
      chegada: "--/--/----",
    },
    {
      id: "6",
      nome: "NATALINO 3",
      saida: "01/07/2026",
      chegada: "--/--/----",
    },
    {
      id: "7",
      nome: "REFLE,SOLAR,EBRON ",
      saida: "01/09/2026",
      chegada: "--/--/----",
    },
    {
      id: "8",
      nome: "EBRON PRO,UFO,RGB,REFLE",
      saida: "01/09/2026",
      chegada: "--/--/----",
    },
    {
      id: "9",
      nome: "EBRON PRO,REFLE,SOLAR,RGB ",
      saida: "01/09/2026",
      chegada: "--/--/----",
    },
  ];

  const container = document.getElementById("navios-content");
  if (container) {
    container.innerHTML = conteineres
      .map(
        (c) => `
      <div class="logistics-item">
        <div class="info-block">Conteiner ${c.id}: <span>${c.nome}</span></div>
        <div class="info-block">Saída do contêiner: <span>${c.saida}</span></div>
        <div class="info-block">Chegada: <span>${c.chegada}</span></div>
      </div>
    `,
      )
      .join("");
  }
}

let cloudLayer = null;
let rainLayer = null;
let cloudOverlay = null;

/* --- CAMADA DE CLIMA EM TEMPO REAL (SIMULADOR DE NUVENS PREMIUM + RADAR DE CHUVA DA TV) --- */
const adicionarRadarClima = async (mapa) => {
  // 1. Tentar carregar a chave de config.json local para evitar vazamentos de segredos no Git
  let chaveAtiva =
    typeof OPENWEATHER_API_KEY !== "undefined"
      ? OPENWEATHER_API_KEY
      : "SUA_API_KEY_AQUI";

  if (chaveAtiva === "SUA_API_KEY_AQUI") {
    try {
      const resConfig = await fetch("config.json");
      if (resConfig.ok) {
        const config = await resConfig.json();
        if (config && config.OPENWEATHER_API_KEY) {
          chaveAtiva = config.OPENWEATHER_API_KEY;
        }
      }
    } catch (e) {
      // Ignora silenciosamente se o arquivo config.json não existir localmente
    }
  }

  // Verificar se a chave ativa final é válida
  const temChaveValida =
    chaveAtiva && chaveAtiva !== "SUA_API_KEY_AQUI" && chaveAtiva.trim() !== "";

  if (temChaveValida) {
    // Se o simulador estiver ativo no mapa, remove ele
    if (cloudOverlay) {
      mapa.removeLayer(cloudOverlay);
      cloudOverlay = null;
    }

    // Calcula um timestamp que muda a cada 10 minutos (600.000 ms)
    // Isso garante que o navegador faça cache das imagens dos blocos (tiles) dentro desse intervalo
    // e só busque novos blocos no servidor da API quando os 10 minutos passarem.
    const timestampCache = Math.floor(Date.now() / 600000);
    const urlNuvensReais = `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${chaveAtiva.trim()}&_=${timestampCache}`;

    if (cloudLayer) {
      cloudLayer.setUrl(urlNuvensReais);
      console.log("Camada de nuvens reais (OpenWeatherMap) atualizada!");
    } else {
      cloudLayer = L.tileLayer(urlNuvensReais, {
        opacity: 1.0, // Opacidade total (100%) idêntica à do site oficial da API
        zIndex: 4,
        attribution: "&copy; OpenWeatherMap",
      }).addTo(mapa);
      console.log(
        "Camada de nuvens reais (OpenWeatherMap) ativada com opacidade de 100%!",
      );
    }
  } else {
    // Se o simulador de nuvens em SVG estático/animado ainda não foi criado, cria e adiciona uma única vez
    if (!cloudOverlay) {
      // Criar e adicionar o simulador de nuvens dinâmicas sobre o Ceará e Nordeste
      // Este simulador garante que o mapa NUNCA fique vazio/sem nuvens se não houver uma API Key configurada
      const svgNuvens = `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 800'>
        <defs>
          <filter id='blur-premium'>
            <feGaussianBlur stdDeviation='45' />
          </filter>
        </defs>
        <g filter='url(#blur-premium)' fill='#ffffff'>
          <!-- Bloco de Nuvem Principal - Fortaleza e Litoral Norte do Ceará (Opacidades aumentadas para maior visibilidade) -->
          <ellipse cx='500' cy='300' rx='200' ry='120' opacity='0.78' />
          <ellipse cx='580' cy='270' rx='140' ry='100' opacity='0.82' />
          <ellipse cx='420' cy='320' rx='130' ry='90' opacity='0.72' />
          
          <!-- Bloco de Nuvem Região Sul - Cariri e Juazeiro do Norte -->
          <ellipse cx='480' cy='550' rx='160' ry='100' opacity='0.75' />
          <ellipse cx='520' cy='580' rx='110' ry='80' opacity='0.78' />
          
          <!-- Bloco de Nuvem Oeste - Sobral, Tianguá e Piauí -->
          <ellipse cx='280' cy='260' rx='180' ry='110' opacity='0.74' />
          <ellipse cx='200' cy='290' rx='120' ry='90' opacity='0.68' />
          
          <!-- Bloco de Nuvem Leste - Natal, João Pessoa e Recife -->
          <ellipse cx='780' cy='380' rx='190' ry='120' opacity='0.70' />
          <ellipse cx='840' cy='400' rx='130' ry='95' opacity='0.76' />
          <ellipse cx='720' cy='360' rx='110' ry='85' opacity='0.66' />
        </g>
      </svg>
      `;

      // Converter para URL base64 segura para Leaflet
      const cloudDataUrl =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgNuvens)));

      // Bounding box geográfica para cobrir perfeitamente o Ceará e Nordeste
      const limitesNuvens = [
        [-12.0, -46.0],
        [1.0, -32.0],
      ];

      // Adiciona a cobertura de nuvens dinâmicas ao mapa
      cloudOverlay = L.imageOverlay(cloudDataUrl, limitesNuvens, {
        opacity: 0.95, // Aumentado de 0.85 para 0.95 para maior contraste e visualização
        zIndex: 4,
        className: "animated-clouds",
      }).addTo(mapa);
      console.log(
        "Simulador de nuvens dinâmicas premium ativado com opacidade reforçada!",
      );
    }
  }

  // 2. Tenta carregar/atualizar a camada de chuva real do radar meteorológico do RainViewer (sempre gratuito)
  try {
    const res = await fetch(
      "https://api.rainviewer.com/public/weather-maps.json",
    );
    const data = await res.json();

    if (data.radar && data.radar.past && data.radar.past.length > 0) {
      const ultimoRadar = data.radar.past[data.radar.past.length - 1].path;
      // zIndex 5 = Acima das nuvens e relevo, garantindo a perfeita visualização dos temporais da TV
      const urlChuva = `https://tilecache.rainviewer.com${ultimoRadar}/256/{z}/{x}/{y}/1/1_1.png`;

      if (rainLayer) {
        rainLayer.setUrl(urlChuva);
        console.log(
          "Camada de radar de chuva em tempo real atualizada com sucesso!",
        );
      } else {
        rainLayer = L.tileLayer(urlChuva, {
          opacity: 0.7,
          zIndex: 5,
        }).addTo(mapa);
        console.log(
          "Camada de radar de chuva em tempo real inicializada com sucesso!",
        );
      }
    }
  } catch (erro) {
    console.warn("Erro ao buscar dados reais do radar RainViewer:", erro);
  }
};
