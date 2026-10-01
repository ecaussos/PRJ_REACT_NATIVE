// src/core/api/geminiProduct.api.ts

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '' });

export interface GeminiProductResult {
  nm_product: string;
  id_group: number;
  gtin: string;
  tag: string;
}

const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Identifica e categoriza um produto diretamente via Gemini a partir do GTIN
 */
export async function fetchProductInfoByGTIN(gtin: string): Promise<GeminiProductResult | null> {
  console.log(`[Gemini API] 🚀 Iniciando busca via Gemini para o GTIN: ${gtin}`);

  const prompt = `
    Atuar como um buscador, identificador e categorizador de produtos de supermercado. 
    A partir do GTIN ${gtin}, identifique o produto correspondente.

    Tabela de Grupos:
    ID 1: MERCEARIA
    ID 2: BEBIDAS
    ID 3: FRIOS E LATICÍNIOS
    ID 4: AÇOUGUE E PEIXARIA
    ID 5: HORTIFRÚTI
    ID 6: PADARIA E CONFEITARIA
    ID 7: CONGELATOS
    ID 8: HIGIENE E PERFUMARIA
    ID 9: LIMPEZA
    ID 10: NÃO CLASSIFICADOS

    Instruções:
    1. Identifique o nome oficial/comercial do produto.
    2. Classifique-o estritamente em um dos IDs da tabela acima.
    3. Crie uma Tag amigável (apenas o nome comum/tipo do produto sem a marca).

    Formato de Saída:
    Descrição: [Nome completo em MAIÚSCULAS]
    Grupo: [Apenas o número do ID]
    Código GTIN: ${gtin}
    Tag: [Nome popular sem marca]
  `;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        const text = response.text;
        if (!text) break;

        const descMatch = text.match(/Descrição:\s*(.+)/i);
        const groupMatch = text.match(/Grupo:\s*(\d+)/i);
        const tagMatch = text.match(/Tag:\s*(.+)/i);

        if (!descMatch) break;

        console.log(`[Gemini API] ✅ Produto identificado: "${descMatch[1].trim().toUpperCase()}"`);

        return {
          nm_product: descMatch[1].trim().toUpperCase(),
          id_group: groupMatch ? parseInt(groupMatch[1], 10) : 7,
          gtin,
          tag: tagMatch ? tagMatch[1].trim() : '',
        };

      } catch (error: any) {
        if (attempt < 3 && error?.status === 503) {
          console.warn(`[Gemini API] ⚠️ Tentativa ${attempt} falhou (503). Agendando retry...`);
          await sleep(attempt * 1500);
        } else {
          console.error(`[Gemini API] ❌ Erro na chamada do modelo ${model}:`, error);
          break;
        }
      }
    }
  }

  return null;
}