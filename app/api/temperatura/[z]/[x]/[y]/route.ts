import { servirBloco } from "@/lib/server/owm";
import type { ParamsBloco } from "@/lib/server/owm";

export const dynamic = "force-dynamic";

export const GET = (_req: Request, ctx: ParamsBloco) => servirBloco("temp_new", ctx);
