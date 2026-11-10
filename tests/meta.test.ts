import { test } from "node:test";
import assert from "node:assert/strict";
import { bateuMetaIndividual, bateuMetaPositivacao, percentualDaMeta } from "../lib/meta.ts";

test("meta individual: 100% já conta como batida", () => {
  assert.equal(bateuMetaIndividual(100), true);
  assert.equal(bateuMetaIndividual(128), true);
});

test("meta individual: 99,9% ainda não bateu", () => {
  assert.equal(bateuMetaIndividual(99.9), false);
  assert.equal(bateuMetaIndividual(0), false);
});

test("positivação: venda igual à meta conta como batida", () => {
  assert.equal(bateuMetaPositivacao(34, 34), true);
  assert.equal(bateuMetaPositivacao(23, 25), true);
});

test("positivação: venda abaixo da meta não bateu", () => {
  assert.equal(bateuMetaPositivacao(29, 9), false);
});

test("positivação: meta zero nunca conta como batida", () => {
  assert.equal(bateuMetaPositivacao(0, 5), false);
  assert.equal(bateuMetaPositivacao(0, 0), false);
});

test("percentualDaMeta calcula a proporção e trata meta zero", () => {
  assert.equal(percentualDaMeta(20, 5), 25);
  assert.equal(percentualDaMeta(10, 15), 150);
  assert.equal(percentualDaMeta(0, 10), 0);
});
