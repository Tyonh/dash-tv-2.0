/** Segunda-feira (00:00) da semana em que a data cai. */
export const inicioDaSemana = (data: Date): Date => {
  const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const diaSemana = d.getDay();
  d.setDate(d.getDate() + (diaSemana === 0 ? -6 : 1 - diaSemana));
  return d;
};

/** Verdadeiro apenas enquanto hoje estiver na mesma semana em que caiu o dia 1º. */
export const estaNaPrimeiraSemanaDoMes = (data: Date = new Date()): boolean => {
  const primeiroDoMes = new Date(data.getFullYear(), data.getMonth(), 1);
  return inicioDaSemana(data).getTime() === inicioDaSemana(primeiroDoMes).getTime();
};
