import type { SatelitePayload } from "./types";

export async function buscarSatelite(): Promise<SatelitePayload> {
  const res = await fetch("/api/satelite", { cache: "no-store" });
  if (!res.ok) throw new Error(`Satélite indisponível (HTTP ${res.status})`);
  return (await res.json()) as SatelitePayload;
}
