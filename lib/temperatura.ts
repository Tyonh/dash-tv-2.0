import type { TemperaturaPayload } from "./types";

export async function buscarTemperatura(): Promise<TemperaturaPayload> {
  const res = await fetch("/api/temperatura", { cache: "no-store" });
  if (!res.ok) throw new Error(`Temperatura indisponível (HTTP ${res.status})`);
  return (await res.json()) as TemperaturaPayload;
}
