"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ALTURA_BASE, LARGURA_BASE, calcularEscala } from "@/lib/escala";

type Props = { children: ReactNode };

/**
 * Palco de 1080x1920 que se ajusta a qualquer tela: 1080p, 4K ou outra proporção.
 * Mede a janela e escala o conjunto inteiro, mantendo a proporção e centralizando.
 */
export function PalcoEscalado({ children }: Props) {
  const [escala, setEscala] = useState(0);

  useEffect(() => {
    const ajustar = () => setEscala(calcularEscala(window.innerWidth, window.innerHeight));
    ajustar();
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, []);

  return (
    <div
      className="absolute left-1/2 top-1/2 overflow-hidden bg-branco"
      style={{
        width: LARGURA_BASE,
        height: ALTURA_BASE,
        transform: `translate(-50%, -50%) scale(${escala})`,
        visibility: escala ? "visible" : "hidden",
      }}
    >
      {children}
    </div>
  );
}
