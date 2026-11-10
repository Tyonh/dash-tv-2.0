export const HORA_DA_RECARGA = 6;
export const MINUTO_DA_RECARGA = 30;

/** Milissegundos até a próxima recarga diária (hora local). Se o horário de hoje já passou, vale o de amanhã. */
export function msAteProximaRecarga(
  agora: Date,
  hora: number = HORA_DA_RECARGA,
  minuto: number = MINUTO_DA_RECARGA,
): number {
  const alvo = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), hora, minuto, 0, 0);
  if (alvo.getTime() <= agora.getTime()) alvo.setDate(alvo.getDate() + 1);
  return alvo.getTime() - agora.getTime();
}
