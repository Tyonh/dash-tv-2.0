import { NextResponse } from "next/server";
import { ConfigAusenteError, obterOrcamentosPorCidade } from "@/lib/server/orcamentos";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await obterOrcamentosPorCidade());
  } catch (e) {
    if (e instanceof ConfigAusenteError) {
      return NextResponse.json({ erro: "GEDOC não configurado" }, { status: 503 });
    }
    console.error("Falha ao obter orçamentos do GEDOC:", e);
    return NextResponse.json({ erro: "Falha ao consultar o GEDOC" }, { status: 502 });
  }
}
