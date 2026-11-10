export interface VendedorRanking {
  nome: string;
  perc: number;
}

export interface Positivacao {
  nome: string;
  meta: number;
  venda: number;
}

export interface PontoPodio {
  nome: string;
  pts: number;
}

export interface CampeaoSemana {
  sem: string;
  nome: string;
  pontos: number;
}

export type TipoCidade = "hub" | "capital";

export interface Cidade {
  nome: string;
  lat: number;
  lng: number;
  tipo?: TipoCidade;
}

export interface OrcamentoCidade {
  cidade: string;
  quantidade: number;
  valor?: number;
}

export interface OrcamentosPayload {
  atualizado_em: string;
  cidades: OrcamentoCidade[];
}

export interface Conteiner {
  id: string;
  nome: string;
  saida: string;
  chegada: string;
}

export interface Noticia {
  titulo: string;
  imagem: string | null;
}

export interface CabecalhoVento {
  parameterCategory: number;
  parameterNumber: number;
  parameterNumberName: string;
  parameterUnit: string;
  gridDefinitionTemplate: number;
  nx: number;
  ny: number;
  lo1: number;
  la1: number;
  lo2: number;
  la2: number;
  dx: number;
  dy: number;
  refTime: string;
  forecastTime: number;
}

export interface CampoVento {
  header: CabecalhoVento;
  data: number[];
}

export interface VentoPayload {
  atualizado_em: string;
  referencia: string;
  valido_para: string;
  campos: [CampoVento, CampoVento];
}

export interface TemperaturaPayload {
  atualizado_em: string;
  referencia: string;
  valido_para: string;
  /** Temperatura do ar a 2 m em °C, em grade regular com a primeira linha ao norte. */
  campo: {
    nx: number;
    ny: number;
    lo1: number;
    la1: number;
    dx: number;
    dy: number;
    data: number[];
  };
}

export interface SatelitePayload {
  arquivo: string;
  url: string;
  quadro: string;
  atualizado_em: string;
}
