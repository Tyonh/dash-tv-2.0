import type { VentoPayload } from "./types";

export async function buscarVento(): Promise<VentoPayload> {
  const res = await fetch("/api/vento", { cache: "no-store" });
  if (!res.ok) throw new Error(`Vento indisponível (HTTP ${res.status})`);
  return (await res.json()) as VentoPayload;
}
