import { Sparkles, Target, Trophy } from "lucide-react";
import { ValorAnimado } from "./ValorAnimado";
import { formatarNome, imagemCampeao } from "@/lib/format";
import { Foto } from "./Foto";

type Variante = "primeira-semana" | "lista";

type Tamanho = {
  card: string;
  foto: string;
  label: string;
  nome: string;
  pts: string;
};

const TAMANHOS_PRIMEIRA_SEMANA: Record<number, Tamanho> = {
  1: { card: "max-w-[340px] px-[30px] py-[25px] border-b-[6px]", foto: "h-[140px] w-[140px] mb-3", label: "text-[1.15rem] mb-1.5", nome: "text-[1.7rem]", pts: "text-[1.6rem] mt-2" },
  2: { card: "max-w-[280px] p-5 border-b-[6px]", foto: "h-[110px] w-[110px] mb-2.5", label: "text-[1.2rem]", nome: "text-[1.4rem]", pts: "text-[1.45rem] mt-2" },
  3: { card: "max-w-[250px] p-[18px] border-b-[5px]", foto: "h-[95px] w-[95px] mb-2.5", label: "text-[1.2rem]", nome: "text-[1.3rem]", pts: "text-[1.35rem] mt-2" },
  4: { card: "max-w-[230px] px-3 py-4 border-b-[5px]", foto: "h-[85px] w-[85px] mb-2.5", label: "text-[1.2rem]", nome: "text-[1.2rem]", pts: "text-[1.3rem] mt-2" },
};

const TAMANHO_LISTA: Tamanho = {
  card: "max-w-[235px] min-w-[180px] px-2.5 py-3 border-b-[5px]",
  foto: "h-[70px] w-[70px] mb-1.5",
  label: "text-[0.8rem] mb-[3px] tracking-[0.5px]",
  nome: "text-[1.15rem]",
  pts: "text-[1.35rem] mt-1",
};

const TAMANHO_LISTA_UNICO: Tamanho = {
  ...TAMANHO_LISTA,
  card: "max-w-[290px] min-w-[180px] px-5 py-4 border-b-[5px]",
  foto: "h-[90px] w-[90px] mb-1.5",
};

type Props = {
  nome: string;
  perc: number;
  qtd: number;
  variante: Variante;
};

function escolherTamanho(variante: Variante, qtd: number): Tamanho {
  if (variante === "primeira-semana") return TAMANHOS_PRIMEIRA_SEMANA[Math.min(qtd, 4)];
  return qtd === 1 ? TAMANHO_LISTA_UNICO : TAMANHO_LISTA;
}

export function CardMeta({ nome, perc, qtd, variante }: Props) {
  const t = escolherTamanho(variante, qtd);
  const rotulo = variante === "primeira-semana" ? "META 100% BATIDA" : "META BATIDA";

  return (
    <div
      className={`relative flex flex-1 basis-0 animate-pulse-gold flex-col items-center justify-center rounded-xl border-ouro bg-white text-center shadow-[0_8px_20px_rgba(0,0,0,0.15)] ${t.card}`}
    >
      <Sparkles size={22} aria-hidden="true" className="faisca absolute -left-2 -top-3 text-ouro" />
      <Sparkles
        size={18}
        aria-hidden="true"
        className="faisca absolute -right-2 top-6 text-ouro"
        style={{ animationDelay: "0.9s" }}
      />
      <Sparkles
        size={20}
        aria-hidden="true"
        className="faisca absolute -bottom-3 right-8 text-ouro"
        style={{ animationDelay: "1.7s" }}
      />
      <Foto src={imagemCampeao(nome)} nome={formatarNome(nome)} className={`border-[3px] border-ouro ${t.foto}`} />
      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap font-extrabold uppercase tracking-[1px] text-ouro ${t.label}`}>
        <Trophy size={18} aria-hidden="true" />
        {rotulo}
        <Trophy size={18} aria-hidden="true" />
      </span>
      <span className={`font-extrabold leading-[1.2] text-cinza-escuro ${t.nome}`}>{formatarNome(nome)}</span>
      <span className={`font-extrabold text-vermelho ${t.pts}`}>
        <ValorAnimado alvo={perc} sufixo="%" />
      </span>
    </div>
  );
}

export function CardSemMetaPrimeiraSemana() {
  return (
    <div className="flex max-w-[320px] flex-1 basis-0 flex-col items-center justify-center rounded-2xl border-b-[5px] border-cinza-escuro bg-white p-[30px] text-center shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <span className="mb-1 inline-flex items-center gap-1.5 text-[1.2rem] font-extrabold uppercase tracking-[1px] text-ouro">
        <Target size={20} aria-hidden="true" />
        META DO MÊS
        <Target size={20} aria-hidden="true" />
      </span>
      <span className="text-[1.8rem] font-extrabold leading-[1.2] text-cinza-escuro">EM BUSCA DOS 100%</span>
      <span className="mt-2 text-[1.4rem] font-bold text-vermelho">PRIMEIRA SEMANA</span>
    </div>
  );
}
