import { IMAGEM_PADRAO, TROFEU_PADRAO } from "./constants";

export const isNomeValido = (nome?: string | null): nome is string => {
  if (!nome) return false;
  const n = nome.trim().toLowerCase();
  return n !== "" && n !== "-" && n !== "a definir" && n !== "a_definir";
};

export const imagemVendedor = (nome?: string | null): string =>
  isNomeValido(nome) ? `/img/${nome.trim()}.png` : IMAGEM_PADRAO;

export const imagemCampeao = (nome?: string | null): string =>
  isNomeValido(nome) ? `/img/${nome.trim()}.png` : TROFEU_PADRAO;

export const formatarNome = (nome?: string | null): string =>
  isNomeValido(nome) ? nome.trim().toUpperCase() : "A DEFINIR";

export const parseNumber = (val?: string | null): number => {
  if (!val) return 0;
  const clean = val.replace(/[^0-9.,]/g, "").replace(",", ".");
  return parseFloat(clean) || 0;
};

export const normalizarCidade = (nome: string): string =>
  nome.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
