/** Meta individual do ranking: bateu quando chega a 100% ou mais. */
export const bateuMetaIndividual = (perc: number): boolean => perc >= 100;

/** Meta da positivação: bateu quando a venda alcança a meta (e a meta existe). */
export const bateuMetaPositivacao = (meta: number, venda: number): boolean => meta > 0 && venda >= meta;

/** Quanto da meta foi vendido, em %. Sem meta, é 0. */
export const percentualDaMeta = (meta: number, venda: number): number => (meta > 0 ? (venda / meta) * 100 : 0);
