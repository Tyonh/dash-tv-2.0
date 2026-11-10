import type { OrcamentosPayload } from "./types";

export async function buscarOrcamentos(): Promise<OrcamentosPayload> {
  const res = await fetch("/api/orcamentos", { cache: "no-store" });
  if (!res.ok) throw new Error(`Orçamentos indisponíveis (HTTP ${res.status})`);
  return (await res.json()) as OrcamentosPayload;
}
