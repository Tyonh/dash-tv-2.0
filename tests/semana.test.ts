import { test } from "node:test";
import assert from "node:assert/strict";
import { estaNaPrimeiraSemanaDoMes, inicioDaSemana } from "../lib/semana.ts";

const dia = (ano: number, mes: number, d: number) => new Date(ano, mes - 1, d, 12, 0, 0);

test("inicioDaSemana volta para a segunda-feira da mesma semana", () => {
  const terca = inicioDaSemana(dia(2026, 11, 10));
  assert.equal(terca.getDate(), 9);
  assert.equal(terca.getMonth(), 10);
});

test("inicioDaSemana trata o domingo como último dia da semana", () => {
  const domingo = inicioDaSemana(dia(2026, 11, 8));
  assert.equal(domingo.getDate(), 2);
  assert.equal(domingo.getMonth(), 10);
});

test("1º de novembro de 2026 (domingo) ainda é a primeira semana do mês", () => {
  assert.equal(estaNaPrimeiraSemanaDoMes(dia(2026, 11, 1)), true);
});

test("a segunda-feira seguinte já não é a primeira semana", () => {
  assert.equal(estaNaPrimeiraSemanaDoMes(dia(2026, 11, 2)), false);
});

test("meio do mês não é primeira semana", () => {
  assert.equal(estaNaPrimeiraSemanaDoMes(dia(2026, 11, 10)), false);
});

test("a primeira semana pode começar no mês anterior (dezembro de 2026 começa numa terça)", () => {
  assert.equal(estaNaPrimeiraSemanaDoMes(dia(2026, 12, 4)), true);
  assert.equal(estaNaPrimeiraSemanaDoMes(dia(2026, 12, 7)), false);
});
