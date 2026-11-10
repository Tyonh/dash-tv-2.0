"use client";

import { useEffect, useState } from "react";

/** Vira true ~100ms após montar/mudar a chave, para disparar transições de largura/altura. */
export function useGrow(chave: unknown): boolean {
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    setPronto(false);
    const id = setTimeout(() => setPronto(true), 100);
    return () => clearTimeout(id);
  }, [chave]);
  return pronto;
}
