// src/core/api/geminiProduct.api.ts
import { GoogleGenAI } from '@google/genai'; // Importa a SDK oficial do Google GenAI
import { ConfigModelInstance } from '../../features/config/config.model'; // Importa a instância do Model de Configuração para leitura do arquivo JSON local

export interface GeminiProductResult {
  nm_product: string; // Nome oficial/comercial do produto formatado
  id_group: number;   // ID do grupo/categoria mapeado na tabela
  gtin: string;       // Código de barras (EAN/GTIN) do produto
  tag: string;        // Nome amigável/popular do produto sem a marca
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Consulta as configurações salvas no arquivo JSON local (`config.json`)
 * e retorna a API Key do Gemini e o modelo desejado (se houver).
 */
async function getGeminiConfigFromFile() {
  try {
    const fileExists = await ConfigModelInstance.checkConfigFileExists(); // Verifica a existência do arquivo JSON local
    if (!fileExists) {
      console.log('[Gemini Config] ⚠️ Arquivo config.json não encontrado localmente.'); // Loga a ausência do arquivo
      return null; // Retorna nulo se o arquivo não existir
    }

    const configFile = await ConfigModelInstance.readConfigFile(); // Realiza a leitura do arquivo JSON local
    if (!configFile) return null; // Retorna nulo caso o arquivo esteja vazio ou inválido

    // Procura na lista de configurações do arquivo por um registro associado ao Gemini
    const geminiConfig = configFile.configs?.find((cfg: any) =>
      cfg.ds_tp_config?.toUpperCase().includes('GEMINI') || cfg.id_tp_config === 2
    );

    if (geminiConfig) {
      console.log('[Gemini Config] ⚙️ Configuração do Gemini localizada no arquivo JSON.'); // Loga a localização do registro
      return {
        apiKey: geminiConfig.key_config || null,   // Recupera a API Key do Gemini do arquivo
        model: geminiConfig.url_config || null,    // Pode usar url_config/outro campo para especificar o modelo customizado, se houver
      };
    }
  } catch (error) {
    console.warn('[Gemini Config] ⚠️ Erro ao ler arquivo de configuração local:', error); // Loga exceções de leitura
  }
  return null; // Retorna nulo se nenhuma configuração for encontrada
}

/**
 * Identifica e categoriza um produto diretamente via Gemini a partir do GTIN,
 * utilizando a API Key e configurações exclusivamente do arquivo JSON local.
 */
export async function fetchProductInfoByGTIN(gtin: string): Promise<GeminiProductResult | null> {
  // Busca as configurações a partir do arquivo JSON local
  const fileConfig = await getGeminiConfigFromFile(); // Lê a chave e modelo configurados localmente

  // Valida se a API Key existe no arquivo local
  if (!fileConfig || !fileConfig.apiKey) {
    console.warn('[Gemini API] ⛔ Falha: Nenhuma API Key do Gemini foi encontrada no arquivo config.json.'); // Exibe aviso de falta de credencial
    return null; // Interrompe a consulta
  }

  // Instancia a SDK do GoogleGenAI com a chave obtida exclusivamente do arquivo
  const ai = new GoogleGenAI({ apiKey: fileConfig.apiKey }); // Inicializa o cliente do Gemini

  // Define o modelo configurado no arquivo ou utiliza o padrão
  const selectedModel = fileConfig.model || 'gemini-2.5-flash'; // Define o modelo de IA a ser utilizado

  console.log(`\n=================== [GEMINI API - INÍCIO] ===================`); // Exibe delimitador no log
  console.log(`[Gemini API] 🚀 Iniciando busca via Gemini para o GTIN: ${gtin}`); // Loga o início da busca
  console.log(`[Gemini API] 🤖 Modelo selecionado: ${selectedModel}`); // Loga o modelo em uso

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

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
      });

      const text = response.text;
      if (!text) break; // Sai da tentativa se não houver texto retornado

      const descMatch = text.match(/Descrição:\s*(.+)/i);
      const groupMatch = text.match(/Grupo:\s*(\d+)/i);
      const tagMatch = text.match(/Tag:\s*(.+)/i);

      if (!descMatch) break; // Interrompe se a descrição não puder ser extraída do texto

      const result: GeminiProductResult = {
        nm_product: descMatch[1].trim().toUpperCase(),
        id_group: groupMatch ? parseInt(groupMatch[1], 10) : 10, // Define fallback para o ID 10 (NÃO CLASSIFICADOS)
        gtin,
        tag: tagMatch ? tagMatch[1].trim() : '',
      };

      console.log(`[Gemini API] ✅ Produto identificado com sucesso: "${result.nm_product}"`); // Loga o produto localizado
      console.log(`[Gemini API] 🎯 Resultado final:`, JSON.stringify(result, null, 2)); // Loga o objeto retornado
      console.log(`=================== [GEMINI API - FIM] ===================\n`); // Exibe encerramento no log
      return result; // Retorna o resultado obtido

    } catch (error: any) {
      if (attempt < 3 && (error?.status === 503 || error?.status === 429)) {
        console.warn(`[Gemini API] ⚠️ Tentativa ${attempt} falhou (${error?.status || 'Erro'}). Aguardando retry...`); // Loga aviso de tentativa e pausa
        await sleep(attempt * 1500); // Aguarda intervalo com backoff antes da próxima tentativa
      } else {
        console.error(`[Gemini API] ❌ Erro ao chamar o modelo ${selectedModel}:`, error); // Registra a falha final
        break; // Interrompe o loop de retentativas
      }
    }
  }

  console.log(`=================== [GEMINI API - FIM] ===================\n`); // Exibe delimitador final em caso de erro
  return null; // Retorna nulo se a identificação falhar
}