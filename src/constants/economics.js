export const UF_VALUE = 39841.72;
export const REND_ADHESIVO_M2_SACO = 3.83;   // Bekron A·C: 1.6kg/m²×4mm=6.4kg/m² -> saco 24.5kg/6.4
export const REND_FRAGUE_M2_SACO = 11.1;     // Bekron Fragüe: 0.45kg/m² -> saco 5kg/0.45
export const REND_ESPACIADOR_M2_BOLSA = 5;   // ~1 bolsa cada 5m²
export const REND_ESQUINERO_ML_TIRA = 2.5;   // Tira 2.5m
export const REND_PASTA_M2_SACO = 25;        // 1kg/m² -> saco 25kg
export const REND_LATEX_M2_TINETA = 100;     // Conservador sobre YC nuevo (ficha: 130, terreno ~100)
export const REND_ESMALTE_M2_TINETA = 105;
export const MO_COSTO_MENSUAL = 14840000;  // Costo empresa equipo operarios/mes
export const MO_PODS_SEMANA = 10;           // Capacidad producción semanal
export const MO_SEMANAS_MES = 52/12;        // 4.333 semanas/mes
export const MO_COST_POD = Math.round(MO_COSTO_MENSUAL / (MO_PODS_SEMANA * MO_SEMANAS_MES)); // $342.644/POD   // Conservador sobre YC nuevo (ficha: 135, terreno ~105)
export const REND_CUARZ_M2_TINETA = 23.5;  // FT TX-Cuarz PRO: consumo 425g/m²/capa × 2 capas = 0.85kg/m² -> tineta 20kg / 0.85
export const REND_MORTERO_M2_SACO = 1.55;  // FT Mortero Autoniv.: rend. saco ~15.5L, espesor 10mm -> 15.5L / 10L/m² = 1.55 m²/saco
export const EST_REF_AREA_NETA = 16.74;
export const EST_REF_KG = 104.6;
export const EST_MERMA = 0.05;
export const BASE_REF_AREA_PISO = 3.52;
