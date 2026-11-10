import { NextResponse } from "next/server";
import { obterTemperatura } from "@/lib/server/temperatura";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await obterTemperatura());
  } catch (e) {
    console.error("Falha ao obter a temperatura da NOAA:", e);
    return NextResponse.json({ erro: "Temperatura indisponível no momento" }, { status: 502 });
  }
}
