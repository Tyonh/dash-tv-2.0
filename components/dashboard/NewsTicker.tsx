"use client";

import { Newspaper } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import type { Noticia } from "@/lib/types";

const API_URL = "https://servicodados.ibge.gov.br/api/v3/noticias/?qtd=7";
const BASE_IMG_URL = "https://agenciadenoticias.ibge.gov.br/";
const SEGUNDOS_POR_NOTICIA = 18;

type ItemIbge = { titulo: string; imagens?: string };

const extrairImagem = (imagens?: string): string | null => {
  if (!imagens) return null;
  try {
    const obj = JSON.parse(imagens) as { image_intro?: string };
    return obj.image_intro ? BASE_IMG_URL + obj.image_intro : null;
  } catch {
    return null;
  }
};

const buscarNoticias = async (): Promise<Noticia[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`IBGE indisponível (HTTP ${res.status})`);
  const json = (await res.json()) as { items?: ItemIbge[] };
  return (json.items ?? []).map((i) => ({ titulo: i.titulo, imagem: extrairImagem(i.imagens) }));
};

type Props = { gatilho: number };

export function NewsTicker({ gatilho }: Props) {
  const { dados: noticias, falhou } = useAsync(buscarNoticias, gatilho);
  const duracao = Math.max(1, noticias?.length ?? 1) * SEGUNDOS_POR_NOTICIA;

  return (
    <div className="flex h-[120px] shrink-0 items-center overflow-hidden border-t-[3px] border-vermelho bg-cinza-escuro">
      <div className="z-10 flex h-full shrink-0 items-center whitespace-nowrap bg-vermelho px-5 text-[1.1rem] font-extrabold text-white">
        ÚLTIMAS NOTÍCIAS
      </div>
      <div className="relative h-full flex-1 overflow-hidden">
        <div
          className="flex h-full w-max animate-scroll-news items-center will-change-transform"
          style={{ animationDuration: `${duracao}s` }}
        >
          {noticias === null || noticias.length === 0 ? (
            <span className="mr-[50px] whitespace-nowrap text-[1.2rem] text-cinza-claro">
              {falhou ? "Notícias indisponíveis no momento" : "Carregando notícias em tempo real..."}
            </span>
          ) : (
            noticias.map((n) => (
              <span key={n.titulo} className="mr-[50px] flex items-center gap-[15px] whitespace-nowrap text-[1.2rem] text-cinza-claro">
                {n.imagem ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.imagem} alt="" className="h-[110px] w-[200px] shrink-0 rounded-md border border-cinza-claro object-cover" />
                ) : (
                  <Newspaper size={28} aria-hidden="true" />
                )}{" "}
                {n.titulo.toUpperCase()}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
