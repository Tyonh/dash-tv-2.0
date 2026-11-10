import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularEscala } from "../lib/escala.ts";

test("TV vertical em 1080p: escala 1", () => {
  assert.equal(calcularEscala(1080, 1920), 1);
});

test("TV vertical em 4K: escala 2", () => {
  assert.equal(calcularEscala(2160, 3840), 2);
});

test("metade do tamanho: escala 0,5", () => {
  assert.equal(calcularEscala(540, 960), 0.5);
});

test("tela deitada: a altura manda e o palco cabe inteiro", () => {
  assert.equal(calcularEscala(1920, 1080), 1080 / 1920);
});

test("tela mais larga que 9:16: a altura decide e sobram faixas nas laterais", () => {
  assert.equal(calcularEscala(1500, 1920), 1);
});
