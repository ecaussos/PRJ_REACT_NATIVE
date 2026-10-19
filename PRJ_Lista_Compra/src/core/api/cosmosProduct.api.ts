// src/core/api/cosmosProduct.api.ts
import { ConfigModelInstance } from '../../features/config/config.model'; // Importa a instância do Model de Configuração para leitura do arquivo JSON local
import { getLocalConnection } from '../database/clients/localClient'; // Importa a função de conexão com o banco de dados SQLite local
import { ApiFileConfig, CosmoProductResult, CosmosApiResponse } from './api.types'; // Importa o DTO unificado das API's

// Chamada API COSMOS utilizando o código GTIN
export async function fetchProductFromCosmos(gtin: string): Promise<CosmoProductResult | null> {  // Função para a chama utilizando o GTI
  const fileConfig = await getCosmosConfigFromFile();                                             // Chama a função para leitura das configurações no arquivo

  // Campos do arquivo de configuração
  const cosmosUrl = fileConfig?.url_config;                                           // Obtém a URL configurada no arquivo
  const cosmosToken = fileConfig?.key_config || process.env.EXPO_PUBLIC_COSMOS_TOKEN; // Obtém o token/chave com fallback para ENV

  // Logs detalhados de depuração para inspeção da montagem da URL
  console.log(`\n=================== [COSMOS API - MONTAGEM DA URL] ===================`);   // LOG de identificação do processo
  console.log(`[Cosmos Debug] 📄 URL bruta vinda do arquivo (url_config): "${cosmosUrl}"`); // LOG de identificação do processo
  console.log(`[Cosmos Debug] 📦 GTIN fornecido para a busca: "${gtin}"`);                  // Loga o parâmetro GTIN recebido

  // Valida se a URL de configuração do arquivo não existe
  if (!cosmosUrl) {
    // Verdadeiro:
    console.warn('[Cosmos API] ⛔ Falha: Nenhuma URL de configuração foi encontrada no arquivo config.json.');  // LOG de identificação do processo
    console.log(`=================== [COSMOS API - FIM] ===================\n`);                                // LOG de identificação do processo
    return null;                                                                                                // Interrompe a execução e retorna nulo
  }

  //Constroi URL com código GTIN
  const baseUrl = cosmosUrl.replace(/\/+$/, ''); // Remove barras no final da URL
  const url = `${baseUrl}/${gtin}`;              // Monta a URL com o GTIN para a consulta

  console.log(`[Cosmos Debug] 🧼 Base URL tratada (sem barra final): "${baseUrl}"`);        // LOG de identificação do processo
  console.log(`[Cosmos Debug] 🎯 URL Final Montada: "${url}"`);                             // LOG de identificação do processo
  console.log(`======================================================================\n`);  // LOG de identificação do processo

  const startTime = Date.now(); // Pega a data/hora de inicio

  console.log(`\n=================== [COSMOS API - INÍCIO REQUISIÇÃO] ===================`);         // LOG de identificação do processo
  console.log(`[Cosmos API] 🚀 Solicitando consulta para o GTIN: ${gtin}`);                         // LOG de identificação do processo
  console.log(`[Cosmos API] 🌐 Endpoint configurado: ${url}`);                                      // LOG de identificação do processo
  console.log(`[Cosmos API] 🔑 Token utilizado: ${cosmosToken ? '*** (Configurado)' : 'Nenhum'}`);  // LOG de identificação do processo

  try {                                       // Inicia o bloco de captura de exceções
    const headers: Record<string, string> = { // Definição do cabeçalho da chamada API
      'Content-Type': 'application/json',     // Define o tipo de conteúdo da requisição como JSON
      'User-Agent': 'Cosmos-API-Request',     // Define o User-Agent exigido pela API do Cosmos
    };
    // Verifica se o existe
    if (cosmosToken) {
      // Verdadeiro
      headers['X-Cosmos-Token'] = cosmosToken; // Adiciona o token de autenticação no cabeçalho
    }
    // Realizar a chamada na API - GET
    const response = await fetch(url, { method: 'GET', headers }); // Chama função fetch para a requisição GET para a URL
    const duration = Date.now() - startTime;                       // Calcula o tempo de resposta da API
    // Verifica se a resposta não foi OK
    if (!response.ok) {
      // Veradeiro
      if (response.status === 404) {                                                               // Validar se o status é 404 - Not Found
        console.log(`[Cosmos API] ℹ️ Produto não localizado no Cosmos (404 Not Found).`);          // Verdadeiro: Exibe log console
      } else if (response.status === 429) {                                                        // Valida se o status é 429 - Too Many Requests
        console.warn(`[Cosmos API] ⛔ Limite de requisições / Rate limit atingido (HTTP 429).`);  // Verdadeiro: Exibe log console
      } else {                                                                                     // Em caso de outro erros
        console.warn(`[Cosmos API] ⚠️ Resposta com status: ${response.status}`);                  // Verdadeiro: Exibe log console
      }
      console.log(`=================== [COSMOS API - FIM] ===================\n`);                // LOG de identificação do processo
      return null;                                                                                // Interrompe a execução e retorna nulo
    }
    // Obtem os dados de retorno API
    const data: CosmosApiResponse = await response.json();  // Converte a resposta recebida para o objeto TypeScript CosmosApiResponse
    // Verifica se DATA e Description contém dados
    if (data && data.description) { 
      console.log(`[Cosmos API] ✅ Produto: "${data.description}" | NCM: ${data.ncm?.code || 'N/A'}`); // Verdadeiro: Exibe log console
      // Consulta Identifica o Grupo de produtos - from_to_group
      const idGroup = await findGroupIdByNcm(data.ncm?.code);   // Chama a função para o id_group utilizando o ncm retornado
      // Trata o retorno da consulta id _group      
      const finalGroupId = idGroup ?? "10"; // Retorna ID se não encontra retorna ID = 10 (Padrão)
      // Tratar dados retornados
      const result: CosmoProductResult = {
        nm_product: data.description.toUpperCase(), // Converte o nome do produto para letras maiúsculas
        id_group: finalGroupId,                     // Atribui o ID do grupo determinado (mapeado ou padrão)
        gtin: gtin,                                 // Atribui o código GTIN pesquisado
      };
      console.log(`[Cosmos API] 🎯 Objeto final retornado:`, JSON.stringify(result, null, 2));  // LOG de identificação do processo
      console.log(`=================== [COSMOS API - FIM] ===================\n`);              // LOG de identificação do processo
      return result;                                                                            // Interrompe a execução e retorna nulo
    }
  } catch (error) {                                                               // Em caso de erro na execução
    const duration = Date.now() - startTime;                                      // Calcula a duração
    console.error(`[Cosmos API] ❌ Erro na requisição (${duration}ms):`, error);  // LOG de identificação do processo
  }
  console.log(`=================== [COSMOS API - FIM] ===================\n`); // LOG de identificação do processo
  return null;                                                                 // Interrompe a execução e retorna nulo
}

// OBTEM OS DADOS DE CONEXÃO NO AQUIVO DE CONFIGURAÇÃO
async function getCosmosConfigFromFile(): Promise<ApiFileConfig | null> {               // Função para obter dados de configuração API 
  try {                                                                                 // Inicia o bloco de captura de exceções
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
    const cosmosConfig = configsList.find((cfg: any) =>       //Função para encontra registro
      cfg.id_tp_config === "4" ||                             // Busca por id do tipo de configuração
      cfg.ds_tp_config?.toUpperCase().includes('API COSMOS')  // Descrição do tipo de configuração
    );
    // Verifica se a configuração existe
    if (cosmosConfig) {
      // Verdadeiro
      console.log('[Cosmos Config] ⚙️ Configuração localizada no arquivo', cosmosConfig); // LOG de identificação do processo
      return {                                                                            // Retornar os dados de configuração
        url_config: cosmosConfig.url_config || null,                                      // Recupera a URL/Host 
        key_config: cosmosConfig.key_config || null,                                      // Recupera a Key
      };
    }
  } catch (error) {                                                                       // Em caso de erro na execução
    console.warn('[Cosmos Config] ⚠️ Erro ao ler arquivo de configuração local:', error); // LOG de identificação do processo
  }
  return null;                                                                            // Interrompe a execução e retorna nulo
}

// IDENTIFICAÇÃO DO GRUPO PRODUTO PELO "NCM" - "from_to_group";
async function findGroupIdByNcm(ncmCode?: string): Promise<string | null> {    // Função para obter grupo pelo código NCM
  // Valida se o código não está preenchido
  if (!ncmCode) return null;                                                   // Verdadeiro: Retorna nulo
  const cleanNcm = ncmCode.replace(/\D/g, '');                                 // Remove caracteres não numéricos do NCM
  // Valida se é nulo após a limpeza
  if (!cleanNcm) return null;                                                  // Retorna nulo se não restarem dígitos numéricos

  // Obtem o código se o (8 dígitos), Posição (4 dígitos) e Capítulo (2 dígitos)
  const prefixesToTry = Array.from( //Criar array com os códigos ncm dados 
    new Set([
      cleanNcm,                 // Ex: 28289011 (NCM completo de 8 dígitos)
      cleanNcm.substring(0, 4), // Ex: 2828 (Subposição/Posição de 4 dígitos)
      cleanNcm.substring(0, 2), // Ex: 28 (Capítulo de 2 dígitos)
    ])
  );
  try {                                    // Inicia o bloco de captura de exceções
    const db = await getLocalConnection(); // Obtém a instância de conexão com o banco SQLite

    for (const code of prefixesToTry) {                                          // Percorre o array ncm
      const startTime = Date.now();                                              // Pega a data/hora de inicio
      console.log(`[DB] 🔍 Consultando de-para NCM (id_external): "${code}"`);  // LOG de identificação do processo
      const row = await db.getFirstAsync<{ id_group: string }>(                 // Executa query para obter o ID
        `SELECT id_group FROM from_to_group WHERE id_external = ?;`,            // Query
        [code]                                                                  // Código NCM para realizar a consulta
      );
      const duration = Date.now() - startTime;                                  // Calcula a duração da consulta
      // Verifia se exite registro
      if (row) {
        // Verdaeiro
        console.log(`[DB] ✅ Mapeamento encontrado: NCM "${code}" -> Grupo ID: ${row.id_group} (${duration}ms)`); // LOG de identificação do processo
        return row.id_group;                                                                                      // Retorna o ID do grupo
      }
    }
    console.log(`[DB] ℹ️ Nenhum mapeamento local encontrado para o NCM: ${cleanNcm}`); // LOG de identificação do processo
    return null;                                                                        // Retorna nulo para resulta da consulta
  } catch (error) {                                                                     // Em caso de erro na execução da query 
    console.warn(`[DB] ⚠️ Erro ao consultar NCM na tabela from_to_group:`, error);     // Exibe aviso de exceção na consulta
    return null;                                                                       // Interrompe a execução e retorna nulo
  }
}