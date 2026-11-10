import { NextResponse } from "next/server";
import { obterVento } from "@/lib/server/vento";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await obterVento());
  } catch (e) {
    console.error("Falha ao obter o vento da NOAA:", e);
    return NextResponse.json({ erro: "Vento indisponível no momento" }, { status: 502 });
  }
}
