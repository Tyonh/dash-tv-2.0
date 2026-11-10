export const LARGURA_BASE = 1080;
export const ALTURA_BASE = 1920;

/** Escala que faz o palco 1080x1920 caber inteiro na tela, sem cortar e sem distorcer. */
export const calcularEscala = (larguraTela: number, alturaTela: number): number =>
  Math.min(larguraTela / LARGURA_BASE, alturaTela / ALTURA_BASE);
