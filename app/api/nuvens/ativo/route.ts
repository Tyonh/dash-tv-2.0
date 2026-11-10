import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Diz ao mapa se há chave do OpenWeather no servidor (sem revelar a chave). */
export function GET() {
  return NextResponse.json({ ativo: Boolean(process.env.OPENWEATHER_API_KEY?.trim()) });
}
