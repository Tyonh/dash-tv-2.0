"use client";

import { Crown, Trophy } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { useGrow } from "@/hooks/useGrow";
import { formatarNome, imagemVendedor, isNomeValido } from "@/lib/format";
import { bateuMetaIndividual } from "@/lib/meta";
import { estaNaPrimeiraSemanaDoMes } from "@/lib/semana";
import { buscarRanking } from "@/lib/sheets";
import { BarraProgresso } from "./BarraProgresso";
import { CardMeta, CardSemMetaPrimeiraSemana } from "./CardMeta";
import { Clock } from "./Clock";
import { EstadoVazio } from "./EstadoVazio";
import { Foto } from "./Foto";
import { SectionHeader } from "./SectionHeader";
import { ValorAnimado } from "./ValorAnimado";

type Props = { gatilho: number };

const ATRASO_ENTRE_LINHAS_MS = 150;

export function RankingSection({ gatilho }: Props) {
  const { dados, falhou } = useAsync(buscarRanking, gatilho);
  const pronto = useGrow(`${gatilho}-${dados?.length ?? 0}`);

  const primeiraSemana = estaNaPrimeiraSemanaDoMes();
  const bateramMeta = (dados ?? []).filter((v) => isNomeValido(v.nome) && bateuMetaIndividual(v.perc));
  const comCards = !primeiraSemana && bateramMeta.length > 0;

  return (
    <section className="flex flex-1 flex-col overflow-hidden border-b-4 border-cinza-claro px-10 py-5">
      <SectionHeader titulo="RANKING" subtitulo="META INDIVIDUAL" badge={<Clock />} />
      <div className="flex grow flex-col justify-center">
        {primeiraSemana && (
          <div className="flex h-full w-full items-center justify-center gap-6">
            {bateramMeta.length > 0 ? (
              bateramMeta.map((v) => (
                <CardMeta key={v.nome} nome={v.nome} perc={v.perc} qtd={bateramMeta.length} variante="primeira-semana" />
              ))
            ) : (
              <CardSemMetaPrimeiraSemana />
            )}
          </div>
        )}

        {comCards && (
          <div className="mb-5 flex w-full items-center justify-center gap-4">
            {bateramMeta.map((v) => (
              <CardMeta key={v.nome} nome={v.nome} perc={v.perc} qtd={bateramMeta.length} variante="lista" />
            ))}
          </div>
        )}

        {!primeiraSemana && (
          <div className={`flex flex-col ${comCards ? "gap-3" : "gap-[18px]"}`}>
            {dados === null && <EstadoVazio carregando="Carregando Ranking..." falhou={falhou} />}
            {(dados ?? []).map((v, i) => {
              const bateuMeta = isNomeValido(v.nome) && bateuMetaIndividual(v.perc);
              const atraso = i * ATRASO_ENTRE_LINHAS_MS;
              return (
                <div key={v.nome} className="flex items-center gap-[15px]">
                  <div className="relative shrink-0">
                    {i === 0 && (
                      <Crown
                        size={28}
                        aria-hidden="true"
                        className="absolute -top-5 left-1/2 z-10 -translate-x-1/2 text-ouro drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]"
                      />
                    )}
                    <Foto
                      src={imagemVendedor(v.nome)}
                      nome={formatarNome(v.nome)}
                      fallback="vendedor"
                      className={`border-[3px] bg-[#ccc] shadow-[2px_2px_5px_rgba(0,0,0,0.15)] ${
                        bateuMeta ? "border-ouro brilho-ouro" : "border-vermelho"
                      } ${comCards ? "h-12 w-12" : "h-[65px] w-[65px]"}`}
                    />
                  </div>
                  <BarraProgresso
                    largura={Math.min(v.perc, 100)}
                    crescer={pronto}
                    atrasoMs={atraso}
                    altura={comCards ? "h-[38px]" : "h-[45px]"}
                    ouro={bateuMeta}
                  >
                    <span className={`flex items-center gap-2 ${comCards ? "text-[1.15rem]" : "text-[1.4rem]"}`}>
                      {formatarNome(v.nome)}
                      {bateuMeta && <Trophy size={comCards ? 20 : 24} aria-hidden="true" />}
                    </span>
                    <span className={comCards ? "text-[1.15rem]" : "text-[1.4rem]"}>
                      <ValorAnimado alvo={v.perc} ativo={pronto} atrasoMs={atraso} sufixo="%" />
                    </span>
                  </BarraProgresso>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
