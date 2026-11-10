"use client";

import { useEffect, useState } from "react";

const reduzMovimento = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Conta de 0 até `alvo` com desaceleração suave. Sem animação se o sistema pedir menos movimento. */
export function useCountUp(alvo: number, ativo: boolean, duracaoMs: number, atrasoMs = 0): number {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (!ativo) {
      setValor(0);
      return;
    }
    if (reduzMovimento()) {
      setValor(alvo);
      return;
    }
    let quadro = 0;
    let inicio = 0;
    const passo = (agora: number) => {
      if (!inicio) inicio = agora;
      const progresso = Math.min((agora - inicio) / duracaoMs, 1);
      setValor(alvo * (1 - Math.pow(1 - progresso, 3)));
      if (progresso < 1) quadro = requestAnimationFrame(passo);
    };
    const timer = setTimeout(() => {
      quadro = requestAnimationFrame(passo);
    }, atrasoMs);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(quadro);
    };
  }, [alvo, ativo, duracaoMs, atrasoMs]);

  return valor;
}
