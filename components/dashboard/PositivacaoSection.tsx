"use client";

import { Trophy } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { useGrow } from "@/hooks/useGrow";
import { MESES } from "@/lib/constants";
import { bateuMetaPositivacao, percentualDaMeta } from "@/lib/meta";
import { buscarPositivacao } from "@/lib/sheets";
import { EstadoVazio } from "./EstadoVazio";
import { SectionHeader } from "./SectionHeader";
import { ValorAnimado } from "./ValorAnimado";

type Props = { gatilho: number };

const ATRASO_ENTRE_BARRAS_MS = 150;

export function PositivacaoSection({ gatilho }: Props) {
  const { dados, falhou } = useAsync(buscarPositivacao, gatilho);
  const pronto = useGrow(`${gatilho}-${dados?.length ?? 0}`);
  const teto = Math.max(1, ...(dados ?? []).map((d) => Math.max(d.meta, d.venda)));

  return (
    <section className="flex flex-1 flex-col overflow-hidden border-b-4 border-cinza-claro px-10 py-5">
      <SectionHeader titulo="POSITIVAÇÃO" subtitulo="META x REALIZADO" badge={MESES[new Date().getMonth()]} />
      <div className="flex grow items-end justify-center pb-5">
        <div className="flex h-[420px] w-full items-end justify-around border-b-[5px] border-cinza-escuro pt-[50px]">
          {dados === null && <EstadoVazio carregando="Carregando Gráfico..." falhou={falhou} />}
          {(dados ?? []).map((v, i) => {
            const percVenda = percentualDaMeta(v.meta, v.venda);
            const bateuMeta = bateuMetaPositivacao(v.meta, v.venda);
            const atraso = i * ATRASO_ENTRE_BARRAS_MS;
            return (
              <div key={v.nome} className="flex h-full w-[120px] flex-col items-center justify-end">
                <div className="mb-[5px] text-base font-bold text-[#999]">META {v.meta}</div>
                <div
                  className="relative flex min-h-[2px] w-[70px] items-end rounded-t-[5px] bg-cinza-escuro"
                  style={{ height: `${(v.meta / teto) * 85}%` }}
                >
                  <div
                    className={`barra-brilho-vertical relative min-h-[2px] w-full rounded-t-[5px] shadow-[0_-2px_5px_rgba(0,0,0,0.2)] transition-[height] duration-[1500ms] ease-out ${
                      bateuMeta ? "fundo-ouro-vertical brilho-ouro" : "bg-vermelho"
                    }`}
                    style={{ height: pronto ? `${Math.min(percVenda, 100)}%` : "0%", transitionDelay: `${atraso}ms` }}
                  >
                    <div
                      className={`absolute -top-[38px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap text-[1.6rem] font-extrabold [text-shadow:2px_2px_0_#fff] ${
                        bateuMeta ? "text-[#b07400]" : "text-vermelho"
                      }`}
                    >
                      {bateuMeta && <Trophy size={24} aria-hidden="true" />}
                      <ValorAnimado alvo={v.venda} ativo={pronto} atrasoMs={atraso} />
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 text-center text-[1.2rem] font-bold uppercase text-vermelho">{v.nome}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
