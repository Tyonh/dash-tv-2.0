import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Versão do build em execução: a TV compara com a que carregou e recarrega se mudou. */
export function GET() {
  return NextResponse.json(
    { versao: process.env.NEXT_PUBLIC_BUILD_ID ?? "" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
