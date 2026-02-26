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
  const TEMPO_DADOS = 2000;
  const TEMPO_MAPA = 20000;

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
    { nome: "Fortaleza", lat: -3.7172, lng: -38.5433 },
    { nome: "Teresina", lat: -5.092, lng: -42.8034 },
    { nome: "Recife", lat: -8.0578, lng: -34.8829 },
    { nome: "Acopiara", lat: -6.09315, lng: -39.45315 },
    { nome: "Alcântaras", lat: -3.58683, lng: -40.54549 },
    { nome: "Caucaia", lat: -3.72814, lng: -38.66192 },
    { nome: "São Luís", lat: -2.53067, lng: -44.29889 },
    { nome: "Sobral", lat: -3.68248, lng: -40.35358 },
    { nome: "Juazeiro do Norte", lat: -7.2242, lng: -39.31301 },
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
    { nome: "Tianguá", lat: -3.73092, lng: -40.99275 },
    { nome: "Ubajara", lat: -3.85321, lng: -40.91959 },
    { nome: "Varjota", lat: -4.19586, lng: -40.47333 },
    { nome: "Natal", lat: -5.78416, lng: -35.19997 },
  ];

  cidadesVisitadas.forEach((cidade) => {
    L.circleMarker([cidade.lat, cidade.lng], {
      radius: 2,
      fillColor: "#ff4444",
      color: "#fff",
      weight: 1,
      fillOpacity: 1,
    })
      .addTo(mapInstance)
      .bindPopup(`<b style="font-size: 25px;">${cidade.nome}</b>`);
  });
  adicionarRadarClima(mapInstance);
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

async function carregarRanking() {
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
    document.getElementById("ranking-list").innerHTML = dados
      .map(
        (v) => `
      <div class="ranking-item">
        <img src="public/${v.nome}.png" class="foto-vendedor" onerror="this.src='https://via.placeholder.com/90'">
        <div class="termometro-bg">
          <div class="termometro-fill" style="width:0%" data-target="${Math.min(v.perc, 100)}"></div>
          <div class="info-vendedor-interna"><span>${v.nome}</span><span>${v.perc}%</span></div>
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
  } catch (e) {
    console.error(e);
  }
}

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
    document.getElementById("campeoes-list").innerHTML = campeoes
      .slice(0, 5)
      .map(
        (c) => `
      <div class="card-campeao-grid">
        <img src="public/${c.nome}.png" class="foto-grid" onerror="this.src='https://via.placeholder.com/90'">
        <span class="label-sem-grid">${c.sem}</span>
        <span class="nome-sem-grid">${c.nome}</span>
        <span class="nome-sem-grid">Pontos ${c.pontos}</span>
      </div>`,
      )
      .join("");
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
  document
    .querySelectorAll(".mes-atual")
    .forEach((el) => (el.innerText = meses[new Date().getMonth()]));
}
/* --- ATUALIZAÇÃO DE NAVIOS E LOGÍSTICA (ALINHAMENTO EM COLUNAS) --- */
function atualizarInfoNavios() {
  const conteineres = [
    {
      id: "1",
      nome: "EBRON PRO",
      saida: "20/02/2026",
      chegada: "05/04/2026",
    },
    {
      id: "2",
      nome: "REFLE/RGB/SOLAR",
      saida: "15/03/2026",
      chegada: "--/--/----",
    },
    {
      id: "3",
      nome: "HOMOLOGADA",
      saida: "15/04/2026",
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

/* --- CAMADA DE CLIMA EM TEMPO REAL (RAINVIEWER) --- */
async function adicionarRadarClima(mapa) {
  try {
    // 1. Pergunta para a API qual é o radar mais atual do momento
    const res = await fetch(
      "https://api.rainviewer.com/public/weather-maps.json",
    );
    const data = await res.json();

    // 2. Pega o "caminho" da imagem mais recente gerada pelos satélites
    const ultimoRadar = data.radar.past[data.radar.past.length - 1].path;

    // 3. Monta a URL mágica do Leaflet
    // O "2" significa a paleta de cores (padrão de TV) e "1_1" é a borda suave
    const urlChuva = `https://tilecache.rainviewer.com${ultimoRadar}/256/{z}/{x}/{y}/2/1_1.png`;

    // 4. Cola o adesivo transparente de chuva por cima do Nordeste
    L.tileLayer(urlChuva, {
      opacity: 0.8, // 50% transparente para podermos ler o nome das cidades embaixo
      //transparent: true,
      zIndex: 10, // Fica entre o mapa base e as bolinhas das cidades
    }).addTo(mapa);

    console.log("Radar de clima ativado com sucesso!");
  } catch (erro) {
    console.log("Erro ao puxar o clima:", erro);
  }
}
