// Gera site/data/orcamentos-por-cidade.json a partir dos orçamentos do GEDOC.
// Roda no servidor (agendado). NUNCA expõe a service role no navegador.
//
// Variáveis de ambiente:
//   GEDOC_SUPABASE_URL           URL do Supabase do GEDOC
//   GEDOC_SUPABASE_SERVICE_KEY   service role (somente no servidor)
//   DIAS_JANELA                  janela em dias (padrão 90)
//
// Cidade do cliente, por prioridade:
//   1) dados_completos.cliente_cidade (se o GEDOC passar a gravar)
//   2) município do CNPJ via BrasilAPI (cache em scripts/.cache-cnpj.json)
import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const URL_SB = process.env.GEDOC_SUPABASE_URL;
const KEY_SB = process.env.GEDOC_SUPABASE_SERVICE_KEY;
const DIAS = Number(process.env.DIAS_JANELA ?? 90);
const SAIDA = new URL("../site/data/orcamentos-por-cidade.json", import.meta.url);
const CACHE = new URL("./.cache-cnpj.json", import.meta.url);
const PAGINA = 1000;

if (!URL_SB || !KEY_SB) {
  console.error("Defina GEDOC_SUPABASE_URL e GEDOC_SUPABASE_SERVICE_KEY.");
  process.exit(1);
}

const sb = createClient(URL_SB, KEY_SB);
const soDigitos = (v) => String(v ?? "").replace(/\D/g, "");

async function lerCache() {
  try {
    return JSON.parse(await readFile(CACHE, "utf-8"));
  } catch {
    return {};
  }
}

async function municipioPorCnpj(cnpj) {
  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
  if (!res.ok) return null;
  const d = await res.json();
  return d.municipio ? String(d.municipio).trim() : null;
}

async function carregarOrcamentos() {
  const desde = new Date(Date.now() - DIAS * 86400000).toISOString();
  const todos = [];
  for (let de = 0; ; de += PAGINA) {
    const { data, error } = await sb
      .from("documentos")
      .select("valor_total, cidade:dados_completos->>cliente_cidade, cnpj:dados_completos->>cliente_cnpj")
      .eq("tipo_documento", "ORCAMENTO")
      .gte("data_criacao", desde)
      .range(de, de + PAGINA - 1);
    if (error) throw new Error(`documentos: ${error.message}`);
    todos.push(...data);
    if (data.length < PAGINA) return todos;
  }
}

const orcamentos = await carregarOrcamentos();
const cache = await lerCache();
const porCidade = new Map();
let semCidade = 0;

for (const o of orcamentos) {
  let cidade = o.cidade?.trim() || null;
  const cnpj = soDigitos(o.cnpj);
  if (!cidade && cnpj.length === 14) {
    if (!(cnpj in cache)) {
      try {
        cache[cnpj] = await municipioPorCnpj(cnpj);
      } catch {
        cache[cnpj] = null;
      }
      await new Promise((r) => setTimeout(r, 400)); // respeita limite da BrasilAPI
    }
    cidade = cache[cnpj];
  }
  if (!cidade) {
    semCidade++;
    continue;
  }
  const atual = porCidade.get(cidade) ?? { cidade, quantidade: 0, valor: 0 };
  atual.quantidade += 1;
  atual.valor += Number(o.valor_total) || 0;
  porCidade.set(cidade, atual);
}

await writeFile(CACHE, JSON.stringify(cache));
const saida = {
  atualizado_em: new Date().toISOString(),
  janela_dias: DIAS,
  total_orcamentos: orcamentos.length,
  sem_cidade: semCidade,
  cidades: [...porCidade.values()].sort((a, b) => b.quantidade - a.quantidade),
};
await writeFile(SAIDA, JSON.stringify(saida, null, 2));
console.log(`OK: ${orcamentos.length} orçamentos, ${porCidade.size} cidades, ${semCidade} sem cidade.`);
