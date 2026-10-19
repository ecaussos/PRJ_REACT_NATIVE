// src/core/api/geminiProduct.api.ts

import { GoogleGenAI } from '@google/genai'; // Importa a SDK oficial do Google GenAI
import { ConfigModelInstance } from '../../features/config/config.model'; // Importa o model para leitura das configurações
import { GeminiProductResult } from './api.types'; // Importa o tipo da resposta do Gemini

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));  // Função utilitária para pausas assíncronas

// Chamada API GEMINI utilizando o código GTIN
export async function fetchProductInfoByGTIN(         // Função para a chama utilizando o GTI
  gtin: string                                        // Dinifição da variável e tipo
): Promise<GeminiProductResult | null> {              // Definição das variavéis obtidas na API
  const fileConfig = await getGeminiConfigFromFile(); // Chama a função para leitura das configurações no arquivo
  // Valida se o arquivo e configuração Key não existe
  if (!fileConfig || !fileConfig.key_config) {
    // Verdadeiro
    console.warn('[Gemini API] ⛔ Falha: Nenhuma API Key do Gemini foi encontrada no arquivo config.json.');  // LOG de identificação do processo
    return null;                                                                                              // Interrompe a execução e retorna nulo
  }
  // Obtem a versão no arquivo de configuração
  const selectedVers = fileConfig.vers_config ? fileConfig.vers_config.trim() : null;   // Limpa espaços no nome do modelo
  // Verfiica se a versão não existe
  if (!selectedVers) {
    // Verdadeiro
    console.warn('[Gemini API] ⛔ Falha: Nenhum versão foi definido no arquivo de configuração.');  // LOG de identificação do processo
    return null;                                                                                    // Interrompe a execução e retorna nulo
  }
  // inicia a chama do GEMINI AI
  const ai = new GoogleGenAI({ apiKey: fileConfig.key_config });                    // Inicializa o cliente Com a key obtida
  console.log(`\n=================== [GEMINI API - INÍCIO] ===================`);   // LOG de identificação do processo
  console.log(`[Gemini API] 🚀 Processando produto com Gemini para GTIN: ${gtin}`); // LOG de identificação do processo
  console.log(`[Gemini API] 🤖 Modelo selecionado (vers_config): ${selectedVers}`); // LOG de identificação do processo
  // Prompt para a chamada AI
  const prompt = `
    Atuar como um buscador de produtos na internet e identificar o produto através do código de barras GTIN.

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
  `; 
  // Tentativa de consulta
  for (let attempt = 1; attempt <= 3; attempt++) {                            // Tenta até 3 vezes em caso de erro temporário
    try {
      const response = await ai.models.generateContent({                      // Chamada da função
        model: selectedVers,                                                  // Nome da versão
        contents: prompt,                                                     // Envia o prompt
      });
      const text = response.text;                                             // Extrai o texto da resposta do modelo
      if (!text) break;                                                       // Interrompe se a resposta for vazia
      const descMatch = text.match(/Descrição:\s*(.+)/i);                     // Extrai a linha de Descrição do retorno
      const groupMatch = text.match(/Grupo:\s*(\d+)/i);                       // Extrai o ID do Grupo do retorno
      const tagMatch = text.match(/Tag:\s*(.+)/i);                            // Extrai a Tag amigável do retorno

      // Tratamento caso não retorne os dados do produto
      const fallbackName = `PRODUTO GTIN ${gtin}`;                            // Nome padrão caso falhe o regex da descrição
      // Tratar dados retornados
      const result: GeminiProductResult = {
        nm_product: descMatch ? descMatch[1].trim().toUpperCase() : fallbackName, // Formata nome em caixa alta
        id_group: groupMatch ? groupMatch[1] : "10",                              // Atribui o ID do grupo ou 10 (Outros) como padrão
        gtin,                                                                     // Define o código GTIN pesquisado
      };
      console.log(`[Gemini API] ✅ Produto processado com sucesso: "${result.nm_product}"`);  // LOG de identificação do processo
      console.log(`[Gemini API] 🎯 Resultado final:`, JSON.stringify(result, null, 2));       // LOG de identificação do processo
      console.log(`=================== [GEMINI API - FIM] ===================\n`);            // LOG de identificação do processo
      return result;                                                                          // Interrompe a execução e retorna nulo
    } catch (error: any) {                                                                                             // Em caso de erro na execução
      if (attempt < 3 && (error?.status === 503 || error?.status === 429)) {                                           // Verifica se o erro permite nova tentativa
        console.warn(`[Gemini API] ⚠️ Tentativa ${attempt} falhou (${error?.status || 'Erro'}). Aguardando retry...`); // Log do retry
        await sleep(attempt * 1500);                                                                                   // Aguarda intervalo exponencial antes de tentar novamente
      } else {
        console.error(`[Gemini API] ❌ Erro ao chamar o modelo ${selectedVers}:`, error);                               // LOG de identificação do processo
        break;                                                                                                          // Aborta o loop de tentativas em caso de erro fatal
      }
    }
  }
  console.log(`=================== [GEMINI API - FIM] ===================\n`); // LOG de identificação do processo
  return null;                                                                // Interrompe a execução e retorna nulo
}

// OBTEM OS DADOS DE CONEXÃO NO AQUIVO DE CONFIGURAÇÃO
async function getGeminiConfigFromFile() {                                   // Função para obter dados de configuração API 
  try {
    const fileExists = await ConfigModelInstance.checkConfigFileExists();               // Chama a função de Verificação do arquivo de configuração
    if (!fileExists) {                                                                  // Valida se o arquivo não exite
      // Verdadeiro
      console.log('[Cosmos Config] ⚠️ Arquivo config.json não encontrado localmente.'); // LOG de identificação do processo
      return null;                                                                      // Retorna nulo
    }
    // Se o arquivo existir
    const configFile = await ConfigModelInstance.readConfigFile();                      // Realiza a leitura do conteúdo do arquivo
    // Verifica se não existe a configuração API
    if (!configFile) return null;                                                       // Verdadeiro: Retorna nulo
    const configsList = Array.isArray(configFile) ? configFile : configFile.configs;    // Obtém o array de configurações
    // Verfica se não existe dados de configuração
    if (!Array.isArray(configsList)) {
      // Verdadeiro
      console.warn('[Cosmos Config] ⚠️ Estrutura do arquivo config.json não é um array válido.'); // LOG de identificação do processo
      return null;                                                                                // Interrompe a execução e retorna nulo
    }
    // Localiza a configuração
    const geminiConfig = configsList.find((cfg: any) =>       // Função para encontra registro
      cfg.id_tp_config === "5" ||                             // Busca por id do tipo de configuração
      cfg.ds_tp_config?.toUpperCase().includes('API GEMINI')  // Descrição do tipo de configuração
    );
    // Verifica se a configuração existe
    if (geminiConfig) {
      // Verdadeiro
      console.log('[Gemini Config] ⚙️ Configuração localizada no arquivo:', geminiConfig);  // LOG de identificação do processo
      return {                                                                              // Retornar os dados de configuração
        key_config: geminiConfig.key_config || null,                                        // Recupera Key
        vers_config: geminiConfig.vers_config || null,                                      // Obtém o nome/versão do modelo
      };
    }
  } catch (error) {                                                                        // Em caso de erro na execução 
    console.warn('[Gemini Config] ⚠️ Erro ao ler arquivo de configuração local:', error); // Log de exceção na leitura
  }
  return null;                                                                            // Interrompe a execução e retorna nulo
}