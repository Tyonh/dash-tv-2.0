import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { OrcamentosPayload } from "@/lib/types";

const PAGINA = 1000;
const TTL_MS = 10 * 60 * 1000;
const MAX_CNPJ_NOVOS_POR_CICLO = 20;
const PAUSA_BRASILAPI_MS = 400;
const DIAS_PADRAO = 90;

export class ConfigAusenteError extends Error {}

type Linha = { valor_total: number | null; cidade: string | null; cnpj: string | null };

let cache: { em: number; payload: OrcamentosPayload } | null = null;
let emAndamento: Promise<OrcamentosPayload> | null = null;
/** CNPJ → município (null = consultado e sem resultado). Vive enquanto o processo viver. */
const municipioPorCnpj = new Map<string, string | null>();

const soDigitos = (v: string | null): string => (v ?? "").replace(/\D/g, "");
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function consultarMunicipio(cnpj: string): Promise<string | null | undefined> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 404) return null;
    if (!res.ok) return undefined; // falha temporária: tenta de novo no próximo ciclo
    const d = (await res.json()) as { municipio?: string };
    return d.municipio?.trim() || null;
  } catch {
    return undefined;
  }
}

async function carregarLinhas(): Promise<Linha[]> {
  const url = process.env.GEDOC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.GEDOC_SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) {
    throw new ConfigAusenteError(
      "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou GEDOC_SUPABASE_URL / GEDOC_SUPABASE_SERVICE_KEY)",
    );
  }

  const dias = Number(process.env.DIAS_JANELA ?? DIAS_PADRAO);
  const desde = new Date(Date.now() - dias * 86_400_000).toISOString();
  const sb = createClient(url, chave, { auth: { persistSession: false } });

  const todas: Linha[] = [];
  for (let de = 0; ; de += PAGINA) {
    const { data, error } = await sb
      .from("documentos")
      .select("valor_total, cidade:dados_completos->>cliente_cidade, cnpj:dados_completos->>cliente_cnpj")
      .eq("tipo_documento", "ORCAMENTO")
      .gte("data_criacao", desde)
      .range(de, de + PAGINA - 1);
    if (error) throw new Error(`documentos: ${error.message}`);
    const lote = (data ?? []) as unknown as Linha[];
    todas.push(...lote);
    if (lote.length < PAGINA) return todas;
  }
}

async function calcular(): Promise<OrcamentosPayload> {
  const linhas = await carregarLinhas();
  const porCidade = new Map<string, { cidade: string; quantidade: number; valor: number }>();
  let consultasNovas = 0;

  for (const l of linhas) {
    let cidade = l.cidade?.trim() || null;
    const cnpj = soDigitos(l.cnpj);

    if (!cidade && cnpj.length === 14) {
      if (!municipioPorCnpj.has(cnpj) && consultasNovas < MAX_CNPJ_NOVOS_POR_CICLO) {
        consultasNovas++;
        const m = await consultarMunicipio(cnpj);
        if (m !== undefined) municipioPorCnpj.set(cnpj, m);
        await dormir(PAUSA_BRASILAPI_MS);
      }
      cidade = municipioPorCnpj.get(cnpj) ?? null;
    }
    if (!cidade) continue;

    const atual = porCidade.get(cidade) ?? { cidade, quantidade: 0, valor: 0 };
    porCidade.set(cidade, {
      ...atual,
      quantidade: atual.quantidade + 1,
      valor: atual.valor + (Number(l.valor_total) || 0),
    });
  }

  return {
    atualizado_em: new Date().toISOString(),
    cidades: [...porCidade.values()].sort((a, b) => b.quantidade - a.quantidade),
  };
}

export async function obterOrcamentosPorCidade(): Promise<OrcamentosPayload> {
  if (cache && Date.now() - cache.em < TTL_MS) return cache.payload;
  emAndamento ??= calcular()
    .then((payload) => {
      cache = { em: Date.now(), payload };
      return payload;
    })
    .finally(() => {
      emAndamento = null;
    });
  return emAndamento;
}
