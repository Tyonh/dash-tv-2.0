/** Versão do build que este navegador carregou (definida em next.config.ts a cada build). */
export const VERSAO_LOCAL = process.env.NEXT_PUBLIC_BUILD_ID ?? "";

/**
 * A página só recarrega quando o servidor informa uma versão diferente da carregada.
 * Versão vazia (resposta inválida ou build sem identificador) nunca força recarga.
 */
export function deveRecarregar(versaoLocal: string, versaoRemota: unknown): boolean {
  return typeof versaoRemota === "string" && versaoRemota !== "" && versaoLocal !== "" && versaoRemota !== versaoLocal;
}
