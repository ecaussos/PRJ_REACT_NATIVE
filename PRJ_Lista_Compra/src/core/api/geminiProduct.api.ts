// src/core/api/geminiProduct.api.ts
import { GoogleGenAI } from '@google/genai';
import { ConfigModelInstance } from '../../features/config/config.model';

export interface GeminiProductResult {
  nm_product: string; // Nome oficial/comercial do produto formatado
  id_group: string;   // ID do grupo/categoria mapeado na tabela
  gtin: string;       // Código de barras (EAN/GTIN) do produto
  tag: string;        // Nome amigável/popular do produto sem a marca
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Consulta as configurações salvas no arquivo JSON local (`config.json`)
 * e recupera dinamicamente a API Key e o modelo configurado em `vers_config`.
 */
async function getGeminiConfigFromFile() {
  try {
    const fileExists = await ConfigModelInstance.checkConfigFileExists();
    if (!fileExists) {
      console.log('[Gemini Config] ⚠️ Arquivo config.json não encontrado localmente.');
      return null;
    }

    const configFile = await ConfigModelInstance.readConfigFile();
    if (!configFile) return null;

    const configsList = Array.isArray(configFile) ? configFile : configFile.configs;

    if (!Array.isArray(configsList)) {
      console.warn('[Gemini Config] ⚠️ Estrutura do arquivo config.json não é um array válido.');
      return null;
    }

    // Busca a configuração com id_tp_config === 4 ou descrição "API Gemini"
    const geminiConfig = configsList.find((cfg: any) =>
      cfg.id_tp_config === "5" ||
      cfg.ds_tp_config?.toUpperCase().includes('API GEMINI')
    );

    if (geminiConfig) {
      console.log('[Gemini Config] ⚙️ Configuração do Gemini localizada no arquivo JSON:', geminiConfig);
      return {
        apiKey: geminiConfig.key_config || null,
        // Respeita dinamicamente o valor cadastrado no campo vers_config (com fallback secundário para url_config)
        model: geminiConfig.vers_config || geminiConfig.url_config || null,
      };
    }
  } catch (error) {
    console.warn('[Gemini Config] ⚠️ Erro ao ler arquivo de configuração local:', error);
  }
  return null;
}

/**
 * Classifica e formatar um produto via Gemini a partir da Descrição Bruta e GTIN.
 * Esta abordagem utiliza o modelo dinâmico (vers_config) como motor de IA
 * sem depender do Google Search, eliminando o estouro de cotas (Erro 429) e alucinações.
 */
export async function fetchProductInfoByGTIN(
  gtin: string,

): Promise<GeminiProductResult | null> {
  const fileConfig = await getGeminiConfigFromFile();

  if (!fileConfig || !fileConfig.apiKey) {
    console.warn('[Gemini API] ⛔ Falha: Nenhuma API Key do Gemini foi encontrada no arquivo config.json.');
    return null;
  }

  // Utiliza estritamente o modelo definido em vers_config no arquivo de configuração
  const selectedModel = fileConfig.model ? fileConfig.model.trim() : null;

  if (!selectedModel) {
    console.warn('[Gemini API] ⛔ Falha: Nenhum modelo (vers_config) foi definido no arquivo de configuração.');
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: fileConfig.apiKey });

  console.log(`\n=================== [GEMINI API - INÍCIO] ===================`);
  console.log(`[Gemini API] 🚀 Processando produto com Gemini para GTIN: ${gtin}`);
  console.log(`[Gemini API] 🤖 Modelo selecionado (vers_config): ${selectedModel}`);

  const prompt = `
    Atuar como um buscador de produtos na internet e identicar o produto através do código de barra GTIN.

    Dados de Entrada:
    - Código GTIN: ${gtin}

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
    1. Padronize a Descrição Comercial do produto em MAIÚSCULAS mantendo o peso/volume.
    2. Classifique o produto estritamente em um dos IDs da tabela acima.
    3. Crie uma Tag amigável (apenas o tipo do produto, sem a marca. Exemplo: "Chocolate em Barra").

    Formato de Saída Obrigatório:
    Descrição: [Nome completo em MAIÚSCULAS]
    Grupo: [Apenas o número do ID]
    Código GTIN: ${gtin}
    Tag: [Nome popular sem marca]
  `;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: selectedModel, // Nome do modelo 100% dinâmico vindo do vers_config
        contents: prompt,
        // config: {tools: [{ googleSearch: {} }],}, // Grounding com Google Search para buscar o GTIN real na web
      });

      const text = response.text;
      if (!text) break;

      const descMatch = text.match(/Descrição:\s*(.+)/i);
      const groupMatch = text.match(/Grupo:\s*(\d+)/i);
      const tagMatch = text.match(/Tag:\s*(.+)/i);

      // Valor de contingência caso a IA não retorne o nome da descrição
      const fallbackName = `PRODUTO GTIN ${gtin}`;

      const result: GeminiProductResult = {
        nm_product: descMatch ? descMatch[1].trim().toUpperCase(): fallbackName,
        id_group: groupMatch ? groupMatch[1]: "10",
        gtin,
        tag: tagMatch ? tagMatch[1].trim() : '',
      };

      console.log(`[Gemini API] ✅ Produto processado com sucesso: "${result.nm_product}"`);
      console.log(`[Gemini API] 🎯 Resultado final:`, JSON.stringify(result, null, 2));
      console.log(`=================== [GEMINI API - FIM] ===================\n`);
      return result;

    } catch (error: any) {
      if (attempt < 3 && (error?.status === 503 || error?.status === 429)) {
        console.warn(`[Gemini API] ⚠️ Tentativa ${attempt} falhou (${error?.status || 'Erro'}). Aguardando retry...`);
        await sleep(attempt * 1500);
      } else {
        console.error(`[Gemini API] ❌ Erro ao chamar o modelo ${selectedModel}:`, error);
        break;
      }
    }
  }

  console.log(`=================== [GEMINI API - FIM] ===================\n`);
  return null;
}