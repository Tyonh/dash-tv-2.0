import type { ReactNode } from "react";

type Props = {
  titulo: string;
  subtitulo: string;
  badge: ReactNode;
};

export function SectionHeader({ titulo, subtitulo, badge }: Props) {
  return (
    <div className="mb-[15px] flex h-[70px] shrink-0 items-end justify-between">
      <div>
        <h1 className="text-[2.8rem] font-extrabold leading-none text-cinza-escuro">{titulo}</h1>
        <h2 className="text-[1.4rem] font-light uppercase tracking-[2px] text-vermelho">{subtitulo}</h2>
      </div>
      <div className="rounded-lg bg-vermelho px-[25px] py-2 text-[1.2rem] font-bold uppercase text-white">
        {badge}
      </div>
    </div>
  );
}
