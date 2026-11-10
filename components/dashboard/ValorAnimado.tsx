"use client";

import { useCountUp } from "@/hooks/useCountUp";

type Props = {
  alvo: number;
  ativo?: boolean;
  atrasoMs?: number;
  sufixo?: string;
};

/** Número que sobe de 0 até o valor final. Casas decimais seguem o valor original. */
export function ValorAnimado({ alvo, ativo = true, atrasoMs = 0, sufixo = "" }: Props) {
  const valor = useCountUp(alvo, ativo, 1500, atrasoMs);
  const decimais = Number.isInteger(alvo) ? 0 : 1;
  return (
    <>
      {valor.toFixed(decimais)}
      {sufixo}
    </>
  );
}
