import { WifiOff } from "lucide-react";

type Props = {
  /** Texto enquanto carrega, ex.: "Carregando Ranking...". */
  carregando: string;
  /** A busca falhou e ainda não há nenhum dado para mostrar. */
  falhou: boolean;
};

/** Mensagem no lugar de uma seção sem dados: carregando, ou aviso claro se a planilha não respondeu. */
export function EstadoVazio({ carregando, falhou }: Props) {
  if (falhou) {
    return (
      <div className="mt-[30px] flex items-center justify-center gap-3 text-center text-2xl text-vermelho" role="status">
        <WifiOff size={30} aria-hidden="true" />
        Sem conexão com a planilha. Tentando de novo em instantes
      </div>
    );
  }
  return (
    <div className="mt-[30px] text-center text-2xl text-[#999]" role="status">
      {carregando}
    </div>
  );
}
