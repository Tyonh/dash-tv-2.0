"use client";

import { useEffect } from "react";
import { msAteProximaRecarga } from "@/lib/recarga";

/**
 * Recarrega a página uma vez por dia, antes do expediente. Libera a memória que o navegador
 * acumula com as imagens de satélite e traz a versão nova depois de uma atualização do painel.
 */
export function useRecargaDiaria(): void {
  useEffect(() => {
    const id = setTimeout(() => window.location.reload(), msAteProximaRecarga(new Date()));
    return () => clearTimeout(id);
  }, []);
}
