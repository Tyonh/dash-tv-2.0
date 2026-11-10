import { test } from "node:test";
import assert from "node:assert/strict";
import { msAteProximaRecarga } from "../lib/recarga.ts";

const HORA_EM_MS = 3_600_000;

test("às 5h faltam 1h30 para a recarga das 6h30", () => {
  const agora = new Date(2026, 10, 10, 5, 0, 0);
  assert.equal(msAteProximaRecarga(agora), 1.5 * HORA_EM_MS);
});

test("às 18h a próxima recarga é na manhã seguinte, 12h30 depois", () => {
  const agora = new Date(2026, 10, 10, 18, 0, 0);
  assert.equal(msAteProximaRecarga(agora), 12.5 * HORA_EM_MS);
});

test("exatamente às 6h30 a próxima recarga é a de amanhã, não a de agora", () => {
  const agora = new Date(2026, 10, 10, 6, 30, 0, 0);
  const amanha = new Date(2026, 10, 11, 6, 30, 0, 0);
  assert.equal(msAteProximaRecarga(agora), amanha.getTime() - agora.getTime());
});

test("aceita outro horário", () => {
  const agora = new Date(2026, 10, 10, 8, 0, 0);
  assert.equal(msAteProximaRecarga(agora, 9, 0), HORA_EM_MS);
});

test("virada de mês: 31/10 às 20h recarrega em 1/11 às 6h30", () => {
  const agora = new Date(2026, 9, 31, 20, 0, 0);
  assert.equal(msAteProximaRecarga(agora), 10.5 * HORA_EM_MS);
});
