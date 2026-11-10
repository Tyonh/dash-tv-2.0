import { test } from "node:test";
import assert from "node:assert/strict";
import { deveRecarregar } from "../lib/versao.ts";

test("versão igual: não recarrega", () => {
  assert.equal(deveRecarregar("100", "100"), false);
});

test("versão diferente: recarrega", () => {
  assert.equal(deveRecarregar("100", "101"), true);
});

test("servidor sem versão: não recarrega", () => {
  assert.equal(deveRecarregar("100", ""), false);
});

test("resposta inválida: não recarrega", () => {
  assert.equal(deveRecarregar("100", undefined), false);
  assert.equal(deveRecarregar("100", 101), false);
});

test("navegador sem versão conhecida: não recarrega", () => {
  assert.equal(deveRecarregar("", "101"), false);
});
