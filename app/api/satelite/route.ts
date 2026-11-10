import { NextResponse } from "next/server";
import { obterSatelite } from "@/lib/server/satelite";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await obterSatelite());
  } catch (e) {
    console.error("Falha ao localizar o quadro do satélite:", e);
    return NextResponse.json({ erro: "Satélite indisponível no momento" }, { status: 502 });
  }
}
