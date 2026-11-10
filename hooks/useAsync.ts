"use client";

import { useEffect, useState } from "react";

export interface EstadoAsync<T> {
  /** Último dado bom (null até a primeira resposta). */
  dados: T | null;
  /** A última tentativa falhou. Os dados antigos, se houver, continuam disponíveis. */
  falhou: boolean;
}

/** Executa `carregar` ao montar e a cada mudança de `gatilho`. Mantém o último dado bom em caso de erro. */
export function useAsync<T>(carregar: () => Promise<T>, gatilho: number): EstadoAsync<T> {
  const [estado, setEstado] = useState<EstadoAsync<T>>({ dados: null, falhou: false });

  useEffect(() => {
    let cancelado = false;
    carregar()
      .then((dados) => {
        if (!cancelado) setEstado({ dados, falhou: false });
      })
      .catch((e: unknown) => {
        console.error("Falha ao carregar dados:", e);
        if (!cancelado) setEstado((atual) => ({ ...atual, falhou: true }));
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gatilho]);

  return estado;
}
