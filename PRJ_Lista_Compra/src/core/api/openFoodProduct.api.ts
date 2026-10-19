import { ConfigModelInstance } from '../../features/config/config.model';
import { getLocalConnection } from '../database/clients/localClient';
import { ApiFileConfig, OpenFoodProductResult } from './api.types'; // Importa o DTO unificado das API's


// Chamada API GEMINI utilizando o código GTIN
export async function fetchProductOpenFood(gtin: string): Promise<OpenFoodProductResult | null> {
  const fileConfig = await getConfigFromFile();                   // Chama a função para leitura das configurações no arquivo
  // Campos do arquivo de configuração
  const ConfigUrl = fileConfig?.url_config;                                  // Obtém a URL configurada no arquivo
  console.log(`\n -> INÍCIO REQUISIÇÃO API OPENFOOD`);                       // LOG de identificação do processo
  console.log(`[OpenFood Debug] - 🚀 Iniciando busca por GTIN: "${gtin}"`);   // LOG de identificação do processo
  const startTime = Date.now();                                              // Obtém a data/hora de inicio

  // 1. Acesso a API usando apenas a url_config - OPEN FOOD ORG
  try {
    let offUrl = '';                                     // Inicializa a variável para armazenar a URL final da API
    if (ConfigUrl) {                                     // Verifica se uma URL do arquivo de configuração foi fornecida
      const cleanUrl = ConfigUrl.replace(/\/+$/, '');    // Remove barras no final da URL personalizada
      if (cleanUrl.endsWith('/product')) {               // Checa se a URL já termina com a rota '/product'
        offUrl = `${cleanUrl}/${gtin}.json`;             // Monta a URL anexando apenas o GTIN e o sufixo .json
      } else {                                           // Caso a URL não termine com '/product'
        offUrl = `${cleanUrl}/product/${gtin}.json`;     // Monta a URL adicionando a rota '/product', o GTIN e o sufixo .json
      }
    }
    console.log(`[OpenFood Debug] - 🌐 Efetuando consulta com a URL: ${offUrl}`); // LOG de identificação do processo 
    // Realizar a chamada na API - GET
    const response = await fetch(offUrl, {                       // Faz a requisição HTTP para a URL configurada
    method: 'GET',                                               // Define o método da requisição como GET
    headers: {                                                   // Define os cabeçalhos (headers) da requisição
      'User-Agent': 'React-Native-SupermarketApp - Version 1.0', // Identifica a aplicação para o servidor
      'Accept': 'application/json',                              // Solicita a resposta no formato JSON
      },
    });
    // Obtem os dados de retorno API
    if (response.ok) {                         // Verifica se a resposta HTTP teve status de sucesso
      // Verdadeiro
      const data = await response.json();      // Converte o corpo da resposta em um objeto
      // Validação v3 da OpenFoodFacts
      const isFound = 
        data.status === 'success' || 
        data.status === 1 || 
        data.result?.id === 'product_found' ||
        data.status_verbose === 'product found';
      // Valida status e se o protudo foi encontrado
      if (data && isFound && data.product){
        // Verdadeiro
        const prod = data.product;                // Cria um atalho para o objeto interno do produto
        const productName = prod.product_name_pt  // Prioriza nome em PT
                         || prod.product_name     // Ou pelo nome
        // Verifica se nome do produto foi encontrado
        if (productName) {
          // Verdadeiro
          const duration = Date.now() - startTime;                                         // Calcula a duração da consulta
          console.log(`[OpenFood Debug] - ✅ Produto localizado em ${duration}ms!`);      // LOG de identificação do processo
          const categoriesTags = prod.categories_tags;                                    // Recupera categories_tags (ex: ['en:beverages', 'en:sodas'])
          console.log(`[OpenFood Debug] - 🎯 Dados Categories Tags : ${categoriesTags}`); // LOG de identificação do processo
          const keywords: string[] = prod._keywords || [];                                // Recupera o array de keywords se presente
          console.log(`[OpenFood Debug] - 🎯 Dados KeyWords : ${keywords}`);             // LOG de identificação do processo
          // Realiza a busca do ID_GROUP com os 3 critérios: tag -> keywords -> Nome
          const idGroup = await findGroupId(categoriesTags, keywords, productName);
          // Grava dados obtidos
          const result: OpenFoodProductResult = {         // Monta o objeto de resultado final
            nm_product: productName.trim().toUpperCase(), // Normaliza o nome removendo espaços e em caixa alta
            id_group: idGroup ?? "10",                    // Atribui o grupo encontrado ou usa 10 como padrão (Outros)
            gtin: gtin,                                   // Define o código de barras (GTIN) do produto
          };

          // LOG de identificação do processo
          console.log(`[OpenFood Debug] - 🎯 Dados retornado:`, JSON.stringify(result, null, 2)); // LOG de identificação do processo
          console.log(` -> FIM REQUISIÇÃO \n`);                                                   // LOG de identificação do processo
          return result;                                                                          // Interrompe a execução e retorna nulo
        }
      }
    }
  } catch (error) {                                                                      // Em caso de erro na execução da query
    console.warn(` [OpenFood Debug] - ⚠️ Falha na tentativa Open Food Facts:`, error);  // LOG de identificação do processo
  }
  console.log(`[OpenFood Debug] - ℹ️ Produto com GTIN ${gtin} não foi encontrado.`);   // LOG de identificação do processo
  console.log(` -> FIM REQUISIÇÃO \n`);                                                // LOG de identificação do processo
  return null;
}

// OBTEM OS DADOS DE CONEXÃO NO AQUIVO DE CONFIGURAÇÃO
async function getConfigFromFile(): Promise<ApiFileConfig | null> {       // Função para obter dados de configuração API
  try {                                                                   // Inicia o bloco de captura de exceções
    const fileExists = await ConfigModelInstance.checkConfigFileExists(); // Chama a função de Verificação do arquivo de configuração
    // Valida se o arquivo não existe
    if (!fileExists) {
      // Verdadeiro: 
      console.log(`[OpenFood Debug] - ⚠️ Arquivo config não encontrado localmente.`); // LOG de identificação do processo
      return null;                                                                    // Interrompe a execução e retorna nulo
    }
    // Se o arquivo existir
    const configFile = await ConfigModelInstance.readConfigFile();  // Realiza a leitura do conteúdo do arquivo
    // Validar se a cofiguração não existe 
    if (!configFile) return null;  // Verdadeiro: Interrompe a execução e retorna nulo
    // Extrai a lista de configurações tratando diferentes formatos
    const configsList = Array.isArray(configFile) ? configFile : configFile.configFile || configFile.configs; 
    // Valida se o resultado final obtido não é array válido
    if (!Array.isArray(configsList)) {
      //Verdadeiro:
      console.warn(`[OpenFood Debug] - ⚠️ Estrutura do arquivo config não é válido.`);  // LOG de identificação do processo
      return null;                                                                      // Interrompe a execução e retorna nulo
    }
    // Localiza a configuração
    const apiConfig = configsList.find((cfg: any) =>            //Função para encontra registro
      cfg.id_tp_config === "6" ||                               // Busca por id do tipo de configuração
      cfg.ds_tp_config?.toUpperCase().includes('API OpenFood')  // Ou Buscar pela descrição do tipo de configuração
    );
    // Verificar se a configuração foi encontrada
    if (apiConfig) {
      // Verdadeiro
      console.log(`[OpenFood Debug]    - ⚙️ Configuração localizada no arquivo config:`, apiConfig); // LOG de identificação do processo
      return { url_config: apiConfig.url_config || null,};                                           // Retorna o objeto com os dados extraídos
    }
  } catch (error) {                                                                           // Em caso de erro na execução
    console.warn(`[OpenFood Debug] - ⚠️ Erro ao ler arquivo de configuração local:`, error); // LOG de identificação do processo
  }
  return null; // Interrompe a execução e retorna nulo
}

// IDENTIFICAÇÃO DO GRUPO PRODUTO PELO "NCM" - "from_to_group";
async function findGroupId(         // Função assincrono para busca Grupo produto
  categoriesTags?: string[] | null, // Parâmetro opcional (?) para buscar por Tag (Categoria)
  keywords?: string[] | null,       // Parâmetro opcional (?) para buscar por keywords (Palavra Chave)
  productName?: string | null       // Parâmetro opcional (?) para buscar por Nome do produto
): Promise<string | null> {
  try {                                    // Inicia o bloco de captura de exceções
    const db = await getLocalConnection(); // Obtém a instÂncia de conexão com o banco de dados
    // 1. Busca por TAG na coluna `categoriesTags`
    if (categoriesTags && categoriesTags.length > 0) {                                   // Verifica se existem tags na lista para processar
        for (const Tag of categoriesTags) {                                              // Percorre cada tag presente na lista
        const cleanTag = Tag.trim().toLowerCase();                                       // Remove espaços em branco antes e depois
        if (!cleanTag) continue;                                                         // Pula a iteração se a tag for nula ou vazia 
        console.log(`  - 🔍 Consultando Categories Tags (Tag): "${cleanTag}"`);         // LOG de identificação do processo
        const row = await db.getFirstAsync<{ id_group: string }>(                       // Executa a query de busca no BD e obtem o ID Grupo
          `SELECT id_group FROM from_to_group 
           WHERE LOWER(tag) LIKE '%' || ? || '%' LIMIT 1;`,                             // Query
          [cleanTag]                                                                    // Fornece o parâmetro binding da query
        );
        // Validar se um registro foi retornado
        if (row) {
          console.log(`[OpenFood Debug] - ✅ Mapeamento encontrado por TAG (${cleanTag}) -> Grupo ID: ${row.id_group}`);  // LOG de identificação do processo
          return row.id_group;                                                                                            // Retorna o ID do grupo localizado no banco de dados
        }
      }
    }
    // 2. Busca pelas Palavras chave na coluna `keywords`
    // Verifica se foi fornecida uma KeyWord
    if (keywords && keywords.length > 0) {
      //Verdadeiro
      const ignoreKeywords = ['and', 'or', 'with', 'com', 'sem', 'de', 'do', 'da']; // Ignora palavras
      const keyWords = [...keywords].reverse();                                     // Cria uma cópia da lista e inverte para priorizar as mais específicas
      for (const reg of keyWords) {                                                 // Percorre cada keyWord presente na lista 
        const cleanKeyWords = reg.trim();                                           // Remove espaços em branco antes e depois
        // Verifica se não sem valor 
        if (!cleanKeyWords || cleanKeyWords.length <= 2 || ignoreKeywords.includes(cleanKeyWords)) {
          continue; // Verdadeiro: Pula a interação se não existir valor
        } 
        console.log(`[OpenFood Debug] - 🔍 Consultando em keywords: "${cleanKeyWords}"`); // LOG de identificação do processo
        const row = await db.getFirstAsync<{ id_group: string }>(                         // Executa a query de busca no BD e obtem o ID Grupo
          `SELECT id_group FROM from_to_group 
            WHERE LOWER(keywords) LIKE '%' || LOWER(?) || '%' LIMIT 1;`,                  // Query
          [cleanKeyWords]                                                                 // Fornece o parâmetro binding da query
        );
        // Validar se um registro foi retornado
        if (row) {
          // Verdadeiro
          console.log(`[OpenFood Debug] - ✅ Mapeamento encontrado por keywords (${cleanKeyWords}) -> Grupo ID: ${row.id_group}`);  // LOG de identificação do processo
          return row.id_group;                                                                                                      // Retorna o ID do grupo localizado no banco de dados
        }
      }
    }
    // 3. Busca pelo Nome do Produto na `Tag e keywords`
    // Verifica se foi fornecida um nome de produto
    if (productName && productName.trim().length > 0) {                                              // Valida se o nome do produto foi fornecido e não está em branco
      const cleanName = productName.trim().toUpperCase();                                            // Remove espaços sobressalentes e converte o nome para miuscula
      console.log(`[OpenFood Debug] - 🔍 Consultando Nome do Produto em keywords: "${cleanName}"`); // LOG de identificação do processo
      const row = await db.getFirstAsync<{ id_group: string }>(                                     // Executa a query de busca no BD e obtem o ID Grupo
        `SELECT id_group FROM from_to_group 
          WHERE ? LIKE '%' || UPPER(tag) || '%'
            OR UPPER(keywords) LIKE '%' || ? || '%' LIMIT 1;`,                                      // Query
        [cleanName, cleanName]                                                                      // Fornece o nome duas vezes como parâmetro binding da query
      );
      // Validar se um registro foi retornado
      if (row) {
        // Verdadeiro
        console.log(`[OpenFood Debug] - ✅ Mapeamento encontrado por Nome do Produto (${cleanName}) -> Grupo ID: ${row.id_group}`); // LOG de identificação do processo
        return row.id_group;                                                                                                        // Retorna o ID do grupo localizado no banco de dados
      }
    }
    console.log(`[OpenFood Debug] - ℹ️ Nenhum mapeamento localizado na tabela from_to_group.`);  // LOG de identificação do processo
    return null;                                                                                 // Retorna nulo em caso de falha de execução
  } catch (error) {                                                                              // Em caso de erro na execução
    console.warn(`[OpenFood Debug] - ⚠️Erro ao consultar a tabela from_to_group:`, error);      // LOG de identificação do processo
    return null;                                                                                 // Interrompe a execução e retorna nulo
  }
}