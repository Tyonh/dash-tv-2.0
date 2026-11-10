import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

type Props = {
  /** Largura do preenchimento, de 0 a 100. */
  largura: number;
  /** Fica true depois de montar, para disparar a transição de largura. */
  crescer: boolean;
  atrasoMs: number;
  /** Altura do trilho, como classe Tailwind (ex.: "h-[45px]"). */
  altura: string;
  /** Tratamento dourado: meta batida ou líder. */
  ouro?: boolean;
  children: ReactNode;
};

const FAISCAS = [
  { posicao: "right-4 -top-3", atraso: "0s" },
  { posicao: "right-24 -bottom-3", atraso: "0.8s" },
  { posicao: "right-44 -top-3", atraso: "1.6s" },
] as const;

/** Barra com preenchimento animado e brilho em movimento. Em dourado ganha pulso e faíscas. */
export function BarraProgresso({ largura, crescer, atrasoMs, altura, ouro = false, children }: Props) {
  return (
    <div className={`relative grow ${altura}`}>
      <div className="relative h-full w-full overflow-hidden rounded-[25px] bg-cinza-escuro">
        <div
          className={`barra-brilho relative h-full overflow-hidden rounded-l-[25px] transition-[width] duration-[1500ms] ease-out ${
            ouro ? "fundo-ouro brilho-ouro" : "bg-vermelho"
          }`}
          style={{ width: crescer ? `${largura}%` : "0%", transitionDelay: `${atrasoMs}ms` }}
        />
        <div
          className={`absolute inset-0 flex items-center justify-between px-5 font-bold ${
            ouro ? "text-[#2b1b00]" : "text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)]"
          }`}
        >
          {children}
        </div>
      </div>
      {ouro &&
        FAISCAS.map((f) => (
          <Sparkles
            key={f.posicao}
            size={22}
            aria-hidden="true"
            className={`faisca pointer-events-none absolute text-ouro ${f.posicao}`}
            style={{ animationDelay: f.atraso }}
          />
        ))}
    </div>
  );
}
