import { useEffect } from "react";
import { VERIFICAR_VERSAO_MS } from "@/lib/constants";
import { VERSAO_LOCAL, deveRecarregar } from "@/lib/versao";

/**
 * Faz a TV pegar versão nova sozinha: pergunta ao servidor qual é a versão em execução e
 * recarrega a página quando ela muda (por exemplo, depois de um deploy na VPS).
 * Se o servidor não responder, mantém a tela atual e tenta de novo no próximo ciclo.
 */
export function useAtualizacaoAutomatica(): void {
  useEffect(() => {
    let ativo = true;
    const verificar = async () => {
      try {
        const res = await fetch("/api/versao", { cache: "no-store" });
        if (!res.ok) return;
        const { versao } = (await res.json()) as { versao?: unknown };
        if (ativo && deveRecarregar(VERSAO_LOCAL, versao)) window.location.reload();
      } catch {
        // Sem rede ou servidor reiniciando: tenta no próximo ciclo
      }
    };
    const id = setInterval(() => void verificar(), VERIFICAR_VERSAO_MS);
    return () => {
      ativo = false;
      clearInterval(id);
    };
  }, []);
}
