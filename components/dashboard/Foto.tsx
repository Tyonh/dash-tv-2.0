"use client";

import { IMAGEM_PADRAO, TROFEU_PADRAO } from "@/lib/constants";

interface FotoProps {
  src: string;
  nome: string;
  fallback?: "vendedor" | "trofeu";
  className?: string;
}

/** Foto redonda com fallback automático quando a imagem do vendedor não existe. */
export function Foto({ src, nome, fallback = "trofeu", className = "" }: FotoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Foto de ${nome}`}
      className={`rounded-full object-cover ${className}`}
      onError={(e) => {
        const img = e.currentTarget;
        img.onerror = null;
        img.src = fallback === "vendedor" ? IMAGEM_PADRAO : TROFEU_PADRAO;
      }}
    />
  );
}
