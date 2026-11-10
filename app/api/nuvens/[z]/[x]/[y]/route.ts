import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ z: string; x: string; y: string }> };

/** Proxy dos blocos de nuvens do OpenWeather: a chave fica só no servidor e o bloco é cacheado. */
export async function GET(_req: Request, { params }: Params) {
  const chave = process.env.OPENWEATHER_API_KEY?.trim();
  if (!chave) return new NextResponse(null, { status: 503 });

  const { z, x, y } = await params;
  if (![z, x, y].every((n) => /^\d{1,7}$/.test(n)) || Number(z) > 12) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://tile.openweathermap.org/map/clouds_new/${z}/${x}/${y}.png?appid=${chave}`,
      { next: { revalidate: 600 }, signal: AbortSignal.timeout(10_000) },
    );
    if (!res.ok) return new NextResponse(null, { status: 502 });
    return new NextResponse(await res.arrayBuffer(), {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=600" },
    });
  } catch (e) {
    console.warn("Nuvens OpenWeather indisponíveis:", e);
    return new NextResponse(null, { status: 502 });
  }
}
