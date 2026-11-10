import type { Cidade } from "./types";

export const CIDADES_VISITADAS: readonly Cidade[] = [
  { nome: "Fortaleza", lat: -3.7172, lng: -38.5433, tipo: "hub" },
  { nome: "Teresina", lat: -5.092, lng: -42.8034, tipo: "capital" },
  { nome: "Recife", lat: -8.0578, lng: -34.8829, tipo: "capital" },
  { nome: "Acopiara", lat: -6.09315, lng: -39.45315 },
  { nome: "Alcântaras", lat: -3.58683, lng: -40.54549 },
  { nome: "Caucaia", lat: -3.72814, lng: -38.66192 },
  { nome: "São Luís", lat: -2.53067, lng: -44.29889, tipo: "capital" },
  { nome: "Sobral", lat: -3.68248, lng: -40.35358, tipo: "capital" },
  { nome: "Maracanaú", lat: -3.86828, lng: -38.62645 },
  { nome: "Amontada", lat: -3.3618, lng: -39.83085 },
  { nome: "Apuiarés", lat: -3.94654, lng: -39.43049 },
  { nome: "Aracoiaba", lat: -4.37198, lng: -38.81045 },
  { nome: "Aratuba", lat: -4.41948, lng: -39.04639 },
  { nome: "Banabuiú", lat: -5.30635, lng: -38.92031 },
  { nome: "Barreira", lat: -4.28834, lng: -38.64125 },
  { nome: "Barroquinha", lat: -3.01998, lng: -41.13445 },
  { nome: "Baturité", lat: -4.33132, lng: -38.87895 },
  { nome: "Boa Viagem", lat: -5.12597, lng: -39.73094 },
  { nome: "Camocim", lat: -2.90084, lng: -40.84209 },
  { nome: "Canindé", lat: -4.35804, lng: -39.31373 },
  { nome: "Capistrano", lat: -4.46661, lng: -38.90024 },
  { nome: "Caridade", lat: -4.23349, lng: -39.1921 },
  { nome: "Cariré", lat: -3.9496, lng: -40.47405 },
  { nome: "Carnaubal", lat: -4.16254, lng: -40.94147 },
  { nome: "Catunda", lat: -4.64902, lng: -40.19992 },
  { nome: "Chaval", lat: -3.03528, lng: -41.24338 },
  { nome: "Choró", lat: -4.8459, lng: -39.13712 },
  { nome: "Croatá", lat: -4.4164, lng: -40.90726 },
  { nome: "Cruz", lat: -2.922, lng: -40.1758 },
  { nome: "Irauçuba", lat: -3.74757, lng: -39.7827 },
  { nome: "Itapipoca", lat: -3.49471, lng: -39.58038 },
  { nome: "Itapiúna", lat: -4.56154, lng: -38.9206 },
  { nome: "Itarema", lat: -2.92423, lng: -39.91292 },
  { nome: "Vila de Jericoacoara", lat: -2.79738, lng: -40.5124 },
  { nome: "Quixadá", lat: -4.96843, lng: -39.01612 },
  { nome: "Quixeramobim", lat: -5.19829, lng: -39.29553 },
  { nome: "Redenção", lat: -4.22388, lng: -38.73022 },
  { nome: "Tianguá", lat: -3.73092, lng: -40.99275, tipo: "capital" },
  { nome: "Ubajara", lat: -3.85321, lng: -40.91959 },
  { nome: "Varjota", lat: -4.19586, lng: -40.47333 },
  { nome: "Natal", lat: -5.78416, lng: -35.19997, tipo: "capital" },
];

/** Rotas sequenciais imitando as rodovias federais. */
export const ROTAS_BR: Readonly<Record<string, readonly string[]>> = {
  "BR-116": ["Fortaleza", "Maracanaú", "Barreira", "Redenção", "Aracoiaba", "Baturité", "Capistrano", "Itapiúna", "Quixadá", "Choró", "Banabuiú", "Quixeramobim", "Acopiara", "Juazeiro do Norte"],
  "BR-222": ["Fortaleza", "Caucaia", "Apuiarés", "Irauçuba", "Sobral", "Cariré", "Varjota", "Alcântaras", "Ubajara", "Tianguá", "Carnaubal", "Croatá"],
  "BR-020": ["Fortaleza", "Caucaia", "Caridade", "Canindé", "Aratuba", "Boa Viagem", "Catunda", "Teresina", "São Luís"],
  "BR-402": ["Fortaleza", "Caucaia", "Itapipoca", "Amontada", "Itarema", "Cruz", "Vila de Jericoacoara", "Camocim", "Barroquinha", "Chaval"],
  "BR-101": ["Fortaleza", "Natal", "Recife"],
};

export const CENTRO_NORDESTE: [number, number] = [-7.0, -41.0];
export const ZOOM_INICIAL = 6.5;
