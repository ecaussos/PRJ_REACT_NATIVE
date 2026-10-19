// src/core/api/api.service.ts

import { ConfigModelInstance } from '../../features/config/config.model'; // Importa o model de configuração local
import { UnifiedProductDTO } from './api.types'; // Importa o DTO unificado do produto
import { fetchProductFromCosmos } from './cosmosProduct.api'; // Importa busca na API do Cosmos
import { fetchProductInfoByGTIN } from './geminiProduct.api'; // Importa busca na API do Gemini
import { fetchProductOpenFood } from './openFoodProduct.api'; // Importa busca na API do OpenFood


export async function fetchProductByGTIN(gtin: string): Promise<UnifiedProductDTO | null> {
  try {
    const fileExists = await ConfigModelInstance.checkConfigFileExists();   // Checa se config.json existe localmente
    if (!fileExists) return null;                                           // Retorna nulo se o arquivo não existir

    const configFile = await ConfigModelInstance.readConfigFile();  // Lê o conteúdo do arquivo de configuração
    if (!configFile) return null;                                   // Retorna nulo se o arquivo estiver vazio

    const configs: any[] = Array.isArray(configFile) 
      ? configFile 
      : configFile?.configs || configFile?.data || [];  // Extrai a lista de configurações em array

    if (!configs.length) return null;   // Retorna nulo se não houver configurações

    // 1. Tenta consulta via API do Cosmos (id_tp_config === "4")
    const cosmosConfig = configs.find(
      (cfg) => (cfg.ds_tp_config?.toUpperCase().includes('API COSMOS') || cfg.id_tp_config === "4") && cfg.st_config === 1
    );
    if (cosmosConfig) {                                         // Verifica se há configurações
      const cosmosResult = await fetchProductFromCosmos(gtin);  // Executa requisição na API do Cosmos
      if (cosmosResult) {                                       // Verifica se há dados
        return {                                                // Retorno
          nm_product: cosmosResult.nm_product,                  // Nome do produto formatado
          id_group: cosmosResult.id_group,                      // ID do grupo mapeado no Cosmos
          gtin: cosmosResult.gtin || gtin,                      // Código GTIN retornado ou o consultado
          source: 'cosmos',                                     // Origem da resposta: Cosmos
        };
      }
    }
    // 2. Tenta consulta via API do Gemini (id_tp_config === "5")
    const geminiConfig = configs.find(
      (cfg) => (cfg.ds_tp_config?.toUpperCase().includes('API GEMINI') || cfg.id_tp_config === "5") && cfg.st_config === 1
    );
    if (geminiConfig) {                                         // Verifica se há configurações
      const geminiResult = await fetchProductInfoByGTIN(gtin);  // Executa requisição na API do Gemini
      if (geminiResult) {                                       // Verifica se há dados
        return {                                                // Retorno
          ...geminiResult,                                      // Dados do produto do Gemini
          source: 'gemini',                                     // Origem da resposta: Gemini
        };
      }
    }
    // 3. Tenta consulta via API do OpenFood (id_tp_config === "6")
    const openFoodConfig = configs.find(
      (cfg) => (cfg.ds_tp_config?.toUpperCase().includes('API OPENFOOD') || cfg.id_tp_config === "6") && cfg.st_config === 1
    );
    if (openFoodConfig) {                                       // Verifica se há configurações    
      const openFoodResult = await fetchProductOpenFood(gtin);  // Executa requisição na API do OpenFood
      if (openFoodResult) {                                     // Verifica se há dados
        return {                                                // Retorno
          ...openFoodResult,                                    // Dados do produto do OpenFood
          source: 'openfood',                                   // Origem da resposta: OpenFood
        };
      }
    }
  } catch (error) {
    console.error('[ApiService] ❌ Erro ao orquestrar busca do produto:', error); // Log de exceção na busca unificada
  }
  return null;  // Retorna nulo se não encontrar nas APIs
}