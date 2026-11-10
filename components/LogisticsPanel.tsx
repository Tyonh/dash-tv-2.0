import { CircleCheck, Ship } from "lucide-react";
import { CONTEINERES } from "@/lib/constants";

export function LogisticsPanel() {
  const semContaineres = CONTEINERES.length === 0;

  return (
    <div className="absolute left-[30px] right-[30px] top-[30px] z-[2000] flex flex-col rounded-xl border-[3px] border-ouro bg-[rgba(30,30,30,0.9)] shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-[8px]">
      <div className="flex w-full items-center justify-center gap-2.5 bg-ouro py-2.5 text-[1.3rem] font-extrabold uppercase tracking-[2px] text-black">
        <Ship size={26} aria-hidden="true" />
        ATUALIZAÇÃO PORTUÁRIA
      </div>
      <div className="flex flex-col gap-2.5 px-[30px] py-[15px]">
        {semContaineres ? (
          <div className="flex items-center justify-center gap-3 py-3 text-[1.4rem] font-bold text-white">
            <CircleCheck size={30} className="text-ouro" aria-hidden="true" />
            Todos os contêineres chegaram ao destino final
          </div>
        ) : CONTEINERES.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between border-b border-ouro/30 pb-2.5 text-base font-medium text-white last:border-b-0 last:pb-0"
          >
            <div className="flex-1 text-center">
              Conteiner {c.id}: <span className="text-[1.1rem] font-extrabold text-ouro">{c.nome}</span>
            </div>
            <div className="flex-1 text-center">
              Saída do contêiner: <span className="text-[1.1rem] font-extrabold text-ouro">{c.saida}</span>
            </div>
            <div className="flex-1 text-center">
              Chegada: <span className="text-[1.1rem] font-extrabold text-ouro">{c.chegada}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
