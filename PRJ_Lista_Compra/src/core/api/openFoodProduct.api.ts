import { ConfigModelInstance } from '../../features/config/config.model'; // Importa a instância do Model de Configuração para leitura do arquivo JSON local
import { getLocalConnection } from '../database/localClient'; // Importa a função de conexão com o banco de dados SQLite local

// Variaveis dados do produto
export interface ProductResult {
  nm_product: string; // Nome do produto
  id_group: string;   // ID do grupo do produto
  gtin: string;       // Código de barras produto
}

// Variaveis dados de configuração
export interface FileConfig {
  url_config: string | null;  // URL do serviço ou endpoint customizado configurado no JSON
}

// Conexão API - GTIN
export async function fetchProductOpenFood(gtin: string): Promise<ProductResult | null> {
  const fileConfig = await getConfigFromFile(); // Chama a função para buscar arquivo de configuração
  const ConfigUrl = fileConfig?.url_config;     // Obtem a url configurada no arquivo
  // LOG de identificação do processo
  console.log(`\n -> INÍCIO REQUISIÇÃO API OPENFOOD`);                    // Log
  console.log(`  - 🚀 Iniciando busca por GTIN: "${gtin}"`); // Log
  const startTime = Date.now();                              // Obtém a data de inicio com base na data atual

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
    // LOG de identificação do processo/
    console.log(`  - 🌐 Efetuando consulta com a URL: ${offUrl}`);
    // Chamada API
    const response = await fetch(offUrl, {                       // Faz a requisição HTTP para a URL configurada
    method: 'GET',                                               // Define o método da requisição como GET
    headers: {                                                   // Define os cabeçalhos (headers) da requisição
      'User-Agent': 'React-Native-SupermarketApp - Version 1.0', // Identifica a aplicação para o servidor
      'Accept': 'application/json',                              // Solicita a resposta no formato JSON
      },
    });
    // Retorno API
    if (response.ok) {                         // Verifica se a resposta HTTP teve status de sucesso (200-299)
      const data = await response.json();      // Converte o corpo da resposta em um objeto

      // Validação abrangente cobrindo a v3 da OpenFoodFacts
      const isFound = 
        data.status === 'success' || 
        data.status === 1 || 
        data.result?.id === 'product_found' ||
        data.status_verbose === 'product found';

      // Valida status e se o protudo foi encontrado
      if (data && isFound && data.product){
        const prod = data.product;                         // Cria um atalho para o objeto interno do produto
        const productName = prod.product_name_pt           // Prioriza nome em PT
                         || prod.product_name              // Ou pelo nome
        if (productName) {
          // Obtem a data atual e subtrai a data de inicio = Duração
          const duration = Date.now() - startTime;
          // LOG de identificação do processo
          console.log(`  - ✅ Produto localizado em ${duration}ms!`);

          // Recupera categories_tags se presente (ex: ['en:beverages', 'en:sodas'])
          const categoriesTags = prod.categories_tags;
          
          console.log(`  - 🎯 Dados Categories Tags : ${categoriesTags}`);
          
          // Recupera o array de keywords se presente
          const keywords: string[] = prod._keywords || [];

          console.log(`  - 🎯 Dados KeyWords : ${keywords}`);

          // Realiza a busca no DB com os 3 critérios: tag -> keywords -> Nome
          const idGroup = await findGroupId(categoriesTags, keywords, productName);
          // Grava dados obtidos
          const result: ProductResult = {                 // Monta o objeto de resultado final
            nm_product: productName.trim().toUpperCase(), // Normaliza o nome removendo espaços e em caixa alta
            id_group: idGroup ?? "10",                      // Atribui o grupo encontrado ou usa 10 como padrão (Outros)
            gtin: gtin,                                   // Define o código de barras (GTIN) do produto
          };

          // LOG de identificação do processo
          console.log(`  - 🎯 Dados retornado:`, JSON.stringify(result, null, 2));
          console.log(` -> FIM REQUISIÇÃO \n`);
          return result;  // Retorna resultado
        }
      }
    }
  } catch (error) {
    // LOG de identificação do processo
    console.warn(`  - ⚠️ Falha na tentativa Open Food Facts:`, error);
  }
  // LOG de identificação do processo
  console.log(`  - ℹ️ Produto com GTIN ${gtin} não foi encontrado.`);
  console.log(` -> FIM REQUISIÇÃO \n`);
  return null;
}

// Obtem dados de configuração para conexão (ARQUIVO CONFIG) 
async function getConfigFromFile(): Promise<FileConfig | null> {          // Declara função assíncrona que lê e retorna as configurações do arquivo
  try {                                                                   // Inicia o bloco de captura de exceções
    const fileExists = await ConfigModelInstance.checkConfigFileExists(); // Verifica no sistema de arquivos se o arquivo de configuração existe
    // Valida se o arquivo não existe
    if (!fileExists) {
      // Verdadeiro: 
      console.log('  - ⚠️ Arquivo config não encontrado localmente.');  // LOG de identificação do processo
      return null;                                                      // Retorna nulo
    }
    // Lê o conteúdo bruto do arquivo de configuração
    const configFile = await ConfigModelInstance.readConfigFile();  // Lê o conteúdo bruto do arquivo de configuração
    // Validar se a cofiguração não existe 
    if (!configFile) return null;  // Verdadeiro: Retorna nulo
    // Extrai a lista de configurações tratando diferentes formatos do JSON
    const configsList = Array.isArray(configFile) ? configFile : configFile.configFile || configFile.configs; 
    // Valida se o resultado final obtido não é array válido
    if (!Array.isArray(configsList)) {
      //Verdadeiro:
      console.warn('  - ⚠️ Estrutura do arquivo config não é válido.');  // LOG de identificação do processo
      return null;                                                       // Retorna nulo
    }
    // Busca a configuração específica para a API no array
    const apiConfig = configsList.find((cfg: any) => 
      cfg.id_tp_config === "6" ||                                 // Busca por id do tipo de configuração
      cfg.ds_tp_config?.toUpperCase().includes('API OpenFood')  // Ou Buscar pela descrição do tipo de configuração
    );
    // Verificar se a configuração foi encontrada
    if (apiConfig) {
      // Verdadeiro
      console.log('   - ⚙️ Configuração localizada no arquivo config:', apiConfig); // LOG de identificação do processo
      return { url_config: apiConfig.url_config || null,};                          // Retorna o objeto com os dados extraídos
    }
  } catch (error) {
    // LOG de identificação do processo
    console.warn('  - ⚠️ Erro ao ler arquivo de configuração local:', error);
  }
  return null; // // Retorna nulo caso a configuração não seja encontrada
}

// BUSCA ID GRUPO NA TABELA DE PARA - from_to_group

/**
 * 1. TAG (tag)
 * 2. keywords (coluna keywords)
 * 3. Palavras do Nome do Produto (coluna tag)
 */
async function findGroupId(       // Função assincrono para busca Grupo produto
  categoriesTags?: string[] | null, // Parâmetro opcional (?) para buscar por Tag (Categoria)
  keywords?: string[] | null,     // Parâmetro opcional (?) para buscar por keywords (Palavra Chave)
  productName?: string | null     // Parâmetro opcional (?) para buscar por Nome do produto
): Promise<string | null> {
  try {
    const db = await getLocalConnection(); // Obtém a instÂncia de conexão com o banco de dados

    // 1. Busca por TAG na coluna `categoriesTags`
    if (categoriesTags && categoriesTags.length > 0) {  // Verifica se existem tags na lista para processar
        for (const Tag of categoriesTags) {             // Percorre cada tag presente na lista
        const cleanTag = Tag.trim().toLowerCase();      // Remove espaços em branco antes e depois
        if (!cleanTag) continue;                        // Pula a iteração se a tag for nula ou vazia 
        // LOG de identificação do processo
        console.log(`  - 🔍 Consultando Categories Tags (Tag): "${cleanTag}"`);
        const row = await db.getFirstAsync<{ id_group: string }>( // Executa a query de busca no BD e obtem o ID Grupo
          `SELECT id_group FROM from_to_group 
           WHERE LOWER(tag) LIKE '%' || ? || '%' LIMIT 1;`,       // Query
          [cleanTag]                                              // Fornece o parâmetro binding da query
        );
        // Validar se um registro foi retornado
        if (row) {
          // LOG de identificação do processo          
          console.log(`  - ✅ Mapeamento encontrado por TAG (${cleanTag}) -> Grupo ID: ${row.id_group}`);
          return row.id_group;   // Retorna o ID do grupo localizado no banco de dados
        }
      }
    }
    // 2. Busca pelas Palavras chave na coluna `keywords`
    // Verifica se foi fornecida uma KeyWord
    if (keywords && keywords.length > 0) {
      //Verdadeiro
      const ignoreKeywords = ['and', 'or', 'with', 'com', 'sem', 'de', 'do', 'da']; // ignora palavras
      const keyWords = [...keywords].reverse(); // Cria uma cópia da lista e inverte para priorizar as mais específicas
      for (const reg of keyWords) {             // Percorre cada keyWord presente na lista 
        const cleanKeyWords = reg.trim();       // Remove espaços em branco antes e depois
        // Verifica se não sem valor 
        if (!cleanKeyWords || cleanKeyWords.length <= 2 || ignoreKeywords.includes(cleanKeyWords)) {
          continue;                             // Verdadeiro: Pula a interação se não existir valor
        } 
        // LOG de identificação do processo
        console.log(`  - 🔍 Consultando em keywords: "${cleanKeyWords}"`);
        const row = await db.getFirstAsync<{ id_group: string }>(         // Executa a query de busca no BD e obtem o ID Grupo
          `SELECT id_group FROM from_to_group 
            WHERE LOWER(keywords) LIKE '%' || LOWER(?) || '%' LIMIT 1;`,  // Query
          [cleanKeyWords]                                                 // Fornece o parâmetro binding da query
        );
        // Validar se um registro foi retornado
        if (row) {
          // Verdadeiro
          // LOG de identificação do processo
          console.log(`  - ✅ Mapeamento encontrado por keywords (${cleanKeyWords}) -> Grupo ID: ${row.id_group}`);
          return row.id_group; // Retorna o ID do grupo localizado no banco de dados
        }
      }
    }
    // 3. Busca pelo Nome do Produto na `Tag e keywords`
    // Verifica se foi fornecida um nome de produto
    if (productName && productName.trim().length > 0) {   // Valida se o nome do produto foi fornecido e não está em branco
      const cleanName = productName.trim().toUpperCase(); // Remove espaços sobressalentes e converte o nome para miuscula
      // LOG de identificação do processo
      console.log(`  - 🔍 Consultando Nome do Produto em keywords: "${cleanName}"`);
      //
      const row = await db.getFirstAsync<{ id_group: string }>( // Executa a query de busca no BD e obtem o ID Grupo
        `SELECT id_group FROM from_to_group 
          WHERE ? LIKE '%' || UPPER(tag) || '%'
            OR UPPER(keywords) LIKE '%' || ? || '%' LIMIT 1;`,  // Query
        [cleanName, cleanName]                                  // Fornece o nome duas vezes como parâmetro binding da query
      );
      // Validar se um registro foi retornado
      if (row) {
      // LOG de identificação do processo
        console.log(` - ✅ Mapeamento encontrado por Nome do Produto (${cleanName}) -> Grupo ID: ${row.id_group}`);
        return row.id_group;  // Retorna o ID do grupo localizado no banco de dados
      }
    }
    // LOG de identificação do processo
    console.log(`  - ℹ️ Nenhum mapeamento localizado na tabela from_to_group.`);
    return null;  // Retorna nulo em caso de falha de execução
  } catch (error) {
    // LOG de identificação do processo
    console.warn(`  - ⚠️ Erro ao consultar a tabela from_to_group:`, error);
    return null;  // Retorna nulo em caso de falha de execução
  }
}
