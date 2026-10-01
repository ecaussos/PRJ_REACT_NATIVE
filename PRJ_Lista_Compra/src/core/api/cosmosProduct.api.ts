// src/core/api/cosmosProduct.api.ts

import { getDBConnection } from '../database/sqliteclient';

export interface CosmoProductResult {
  nm_product: string;
  id_group: number;
  gtin: string;
  tag: string;
}

export interface CosmosApiResponse {
  description: string;
  gtin: string;
  ncm?: {
    code: string;
    description: string;
  };
  brand?: {
    name: string;
  };
}

/**
 * Consulta a tabela local `from_to_group` pelo NCM (ou prefixos do NCM)
 * Testa do código mais específico (8 dígitos) até o capítulo (2 dígitos)
 */
async function findGroupIdByNcm(ncmCode?: string): Promise<number | null> {
  if (!ncmCode) return null;

  const cleanNcm = ncmCode.replace(/\D/g, '');
  if (!cleanNcm) return null;

  // Testa o NCM Completo (8 dígitos), Posição (4 dígitos) e Capítulo (2 dígitos)
  const prefixesToTry = Array.from(
    new Set([
      cleanNcm,                 // Ex: 28289011
      cleanNcm.substring(0, 4), // Ex: 2828
      cleanNcm.substring(0, 2), // Ex: 28
    ])
  );

  try {
    const db = await getDBConnection();

    for (const code of prefixesToTry) {
      const startTime = Date.now();
      console.log(`[DB] 🔍 Consultando de-para NCM (id_external): "${code}"`);

      const row = await db.getFirstAsync<{ id_group: number }>(
        `SELECT id_group FROM from_to_group WHERE id_external = ?;`,
        [code]
      );

      const duration = Date.now() - startTime;
      if (row) {
        console.log(`[DB] ✅ Mapeamento encontrado: NCM "${code}" -> Grupo ID: ${row.id_group} (${duration}ms)`);
        return row.id_group;
      }
    }

    console.log(`[DB] ℹ️ Nenhum mapeamento local encontrado para o NCM: ${cleanNcm}`);
    return null;
  } catch (error) {
    console.warn(`[DB] ⚠️ Erro ao consultar NCM na tabela from_to_group:`, error);
    return null;
  }
}

/**
 * Consulta o produto na API do Cosmos pelo GTIN
 */
export async function fetchProductFromCosmos(gtin: string): Promise<CosmoProductResult | null> {
  const cosmosToken = process.env.EXPO_PUBLIC_COSMOS_TOKEN;
  const url = `https://cosmos.bluesoft.com.br/api/gtins/${gtin}.json`;
  const startTime = Date.now();

  console.log(`\n=================== [COSMOS API - INÍCIO] ===================`);
  console.log(`[Cosmos API] 🚀 Solicitando consulta para o GTIN: ${gtin}`);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Cosmos-API-Request',
    };

    if (cosmosToken) {
      headers['X-Cosmos-Token'] = cosmosToken;
    }

    const response = await fetch(url, { method: 'GET', headers });
    const duration = Date.now() - startTime;

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[Cosmos API] ℹ️ Produto não localizado no Cosmos (404 Not Found).`);
      } else {
        console.warn(`[Cosmos API] ⚠️ Resposta com status: ${response.status}`);
      }
      console.log(`=================== [COSMOS API - FIM] ===================\n`);
      return null;
    }

    const data: CosmosApiResponse = await response.json();

    if (data && data.description) {
      console.log(`[Cosmos API] ✅ Produto: "${data.description}" | NCM: ${data.ncm?.code || 'N/A'}`);

      // Consulta de-para direto pelo NCM no banco local
      const idGroup = await findGroupIdByNcm(data.ncm?.code);

      // Se não encontrar no de-para local, usa o grupo padrão (7)
      const finalGroupId = idGroup ?? 10;

      const result: CosmoProductResult = {
        nm_product: data.description.toUpperCase(),
        id_group: finalGroupId,
        gtin: gtin,
        tag: data.brand?.name || '',
      };

      console.log(`[Cosmos API] 🎯 Objeto final retornado:`, JSON.stringify(result, null, 2));
      console.log(`=================== [COSMOS API - FIM] ===================\n`);
      return result;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Cosmos API] ❌ Erro na requisição (${duration}ms):`, error);
  }

  console.log(`=================== [COSMOS API - FIM] ===================\n`);
  return null;
}