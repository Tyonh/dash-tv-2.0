import { NextResponse } from "next/server";

export type CamadaOwm = "clouds_new";
export type ParamsBloco = { params: Promise<{ z: string; x: string; y: string }> };

const ZOOM_MAXIMO = 12;
const CACHE_SEGUNDOS = 600;
const TEMPO_LIMITE_MS = 10_000;

/** Proxy de blocos do OpenWeather: a chave fica só no servidor e cada bloco é cacheado. */
export async function servirBloco(camada: CamadaOwm, { params }: ParamsBloco): Promise<NextResponse> {
  const chave = process.env.OPENWEATHER_API_KEY?.trim();
  if (!chave) return new NextResponse(null, { status: 503 });

  const { z, x, y } = await params;
  if (![z, x, y].every((n) => /^\d{1,7}$/.test(n)) || Number(z) > ZOOM_MAXIMO) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const res = await fetch(`https://tile.openweathermap.org/map/${camada}/${z}/${x}/${y}.png?appid=${chave}`, {
      next: { revalidate: CACHE_SEGUNDOS },
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
    if (!res.ok) return new NextResponse(null, { status: 502 });
    return new NextResponse(await res.arrayBuffer(), {
      headers: { "Content-Type": "image/png", "Cache-Control": `public, max-age=${CACHE_SEGUNDOS}` },
    });
  } catch (e) {
    console.warn(`Camada ${camada} do OpenWeather indisponível:`, e);
    return new NextResponse(null, { status: 502 });
  }
}
