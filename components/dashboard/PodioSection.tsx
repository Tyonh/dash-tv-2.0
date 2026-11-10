"use client";

import type { ReactNode } from "react";
import { Crown, Trophy } from "lucide-react";
import { useAsync } from "@/hooks/useAsync";
import { useGrow } from "@/hooks/useGrow";
import { MESES } from "@/lib/constants";
import { formatarNome, imagemCampeao, isNomeValido } from "@/lib/format";
import { estaNaPrimeiraSemanaDoMes } from "@/lib/semana";
import { buscarCampeoes, buscarPodio } from "@/lib/sheets";
import { BarraProgresso } from "./BarraProgresso";
import { Foto } from "./Foto";
import { SectionHeader } from "./SectionHeader";
import { ValorAnimado } from "./ValorAnimado";

type Props = { gatilho: number };

const ATRASO_ENTRE_LINHAS_MS = 150;

const buscarPodioCompleto = async () => {
  const [pontos, campeoes] = await Promise.all([buscarPodio(), buscarCampeoes()]);
  return { pontos, campeoes };
};

function TituloSessao({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-[15px] border-l-[5px] border-vermelho pl-2.5 text-base uppercase tracking-[1px] text-cinza-escuro">
      {children}
    </h3>
  );
}

export function PodioSection({ gatilho }: Props) {
  const { dados } = useAsync(buscarPodioCompleto, gatilho);
  const pronto = useGrow(`${gatilho}-${dados?.pontos.length ?? 0}`);

  const agora = new Date();
  const primeiraSemana = estaNaPrimeiraSemanaDoMes(agora);
  const mesAtual = agora.getMonth();
  const mesAnterior = (mesAtual - 1 + 12) % 12;
  const mesExibido = MESES[primeiraSemana ? mesAnterior : mesAtual];

  const pontos = dados?.pontos ?? [];
  const max = Math.max(1, ...pontos.map((d) => d.pts));
  const mostraCampeaoDoMes = primeiraSemana && pontos.length > 0;
  const campeaoMes = pontos[0];

  return (
    <section className="flex flex-1 flex-col overflow-hidden border-b-4 border-cinza-claro px-10 py-5">
      <SectionHeader titulo="PÓDIO DO MÊS" subtitulo="RESULTADOS CONSOLIDADOS" badge={mesExibido} />
      <div className="mt-[15px] flex grow flex-row items-start gap-5">
        <div className="flex max-w-[50%] flex-1 flex-col">
          <TituloSessao>PONTUAÇÃO ACUMULADA</TituloSessao>
          <div className="flex flex-col gap-[15px]">
            {pontos.map((v, i) => {
              const lider = i === 0 && v.pts > 0;
              const atraso = i * ATRASO_ENTRE_LINHAS_MS;
              return (
                <div key={v.nome} className="flex items-center gap-2.5">
                  <BarraProgresso
                    largura={(v.pts / max) * 100}
                    crescer={pronto}
                    atrasoMs={atraso}
                    altura="h-[35px]"
                    ouro={lider}
                  >
                    <span className="flex items-center gap-2 text-[1.1rem]">
                      {lider && <Crown size={22} aria-hidden="true" />}
                      {v.nome}
                    </span>
                    <span className="text-[1.1rem]">
                      <ValorAnimado alvo={v.pts} ativo={pronto} atrasoMs={atraso} sufixo=" pts" />
                    </span>
                  </BarraProgresso>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex max-w-[50%] flex-1 flex-col">
          <TituloSessao>{mostraCampeaoDoMes ? `CAMPEÃO DE ${MESES[mesAnterior]}` : "CAMPEÕES DAS SEMANAS"}</TituloSessao>
          {mostraCampeaoDoMes && campeaoMes ? (
            <div className="flex h-full w-full items-center justify-center pt-5">
              <div className="flex w-[280px] animate-pulse-gold flex-col items-center justify-center rounded-[15px] border-b-[6px] border-ouro bg-white p-[25px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
                <Foto
                  src={imagemCampeao(campeaoMes.nome)}
                  nome={formatarNome(campeaoMes.nome)}
                  className="mb-[15px] h-[150px] w-[150px] border-4 border-ouro"
                />
                <span className="mb-[5px] inline-flex items-center gap-1.5 text-[1.2rem] font-extrabold uppercase tracking-[1px] text-ouro">
                  <Trophy size={20} aria-hidden="true" />
                  CAMPEÃO DE {MESES[mesAnterior]}
                  <Trophy size={20} aria-hidden="true" />
                </span>
                <span className="text-[1.8rem] font-extrabold leading-[1.2] text-cinza-escuro">
                  {formatarNome(campeaoMes.nome)}
                </span>
                <span className="mt-2 text-[1.4rem] font-bold text-vermelho">{campeaoMes.pts} pts</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(2,max-content)] content-start justify-center gap-2">
              {(dados?.campeoes ?? []).slice(0, 5).map((c, i) => {
                const ultimo = i === 4 ? "col-span-full justify-self-center -mt-[5px]" : "";
                if (!isNomeValido(c.nome)) {
                  return <div key={`${c.sem}-${i}`} className={`h-[130px] w-[160px] ${ultimo}`} />;
                }
                return (
                  <div
                    key={`${c.sem}-${i}`}
                    className={`flex h-[130px] w-[160px] flex-col items-center justify-center rounded-[10px] border-b-4 border-vermelho bg-white p-[5px] shadow-[0_4px_10px_rgba(0,0,0,0.1)] ${ultimo}`}
                  >
                    <Foto
                      src={imagemCampeao(c.nome)}
                      nome={formatarNome(c.nome)}
                      className="mb-0.5 h-20 w-20 border-[3px] border-vermelho"
                    />
                    <span className="text-[0.7rem] font-extrabold text-vermelho">{c.sem}</span>
                    <span className="text-[0.9rem] font-semibold leading-none text-cinza-escuro">{formatarNome(c.nome)}</span>
                    <span className="text-[0.9rem] font-semibold leading-none text-cinza-escuro">Pontos {c.pontos}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
