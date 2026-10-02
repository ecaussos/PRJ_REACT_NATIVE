// src/core/api/cosmosProduct.api.ts
import { ConfigModelInstance } from '../../features/config/config.model'; // Importa a instância do Model de Configuração para leitura do arquivo JSON local
import { getDBConnection } from '../database/sqliteclient'; // Importa a função de conexão com o banco de dados SQLite local

export interface CosmoProductResult {
  nm_product: string; // Nome/Descrição do produto retornado e formatado
  id_group: number;   // ID do grupo/categoria ao qual o produto pertence
  gtin: string;       // Código de barras (EAN/GTIN) do produto
  tag: string;        // Tag ou marca associada ao produto
}

export interface CosmosApiResponse {
  description: string; // Descrição do produto retornada pela API externa
  gtin: string;        // Código GTIN retornado pela API
  ncm?: {
    code: string;        // Código NCM (Nomenclatura Comum do Mercosul)
    description: string; // Descrição oficial da categoria NCM
  };
  brand?: {
    name: string; // Nome da marca retornado pela API
  };
}

/**
 * Consulta a tabela local `from_to_group` pelo NCM (ou prefixos do NCM)
 * Testa do código mais específico (8 dígitos) até o capítulo (2 dígitos)
 */
async function findGroupIdByNcm(ncmCode?: string): Promise<number | null> {
  if (!ncmCode) return null; // Retorna nulo se o código NCM não for informado

  const cleanNcm = ncmCode.replace(/\D/g, ''); // Remove caracteres não numéricos do NCM
  if (!cleanNcm) return null; // Retorna nulo se não restarem dígitos numéricos

  // Testa o NCM Completo (8 dígitos), Posição (4 dígitos) e Capítulo (2 dígitos)
  const prefixesToTry = Array.from(
    new Set([
      cleanNcm,                 // Ex: 28289011 (NCM completo de 8 dígitos)
      cleanNcm.substring(0, 4), // Ex: 2828 (Subposição/Posição de 4 dígitos)
      cleanNcm.substring(0, 2), // Ex: 28 (Capítulo de 2 dígitos)
    ])
  ); // Cria um array sem duplicações com os prefixos de NCM a serem testados

  try {
    const db = await getDBConnection(); // Obtém a instância de conexão com o banco SQLite

    for (const code of prefixesToTry) { // Percorre a lista de prefixos NCM em ordem de especificidade
      const startTime = Date.now(); // Marca o tempo inicial da consulta para auditoria
      console.log(`[DB] 🔍 Consultando de-para NCM (id_external): "${code}"`); // Exibe log do prefixo consultado

      const row = await db.getFirstAsync<{ id_group: number }>(
        `SELECT id_group FROM from_to_group WHERE id_external = ?;`,
        [code]
      ); // Consulta a tabela de mapeamento buscando o grupo associado ao código NCM/prefixo

      const duration = Date.now() - startTime; // Calcula a duração da consulta em milissegundos
      if (row) {
        console.log(`[DB] ✅ Mapeamento encontrado: NCM "${code}" -> Grupo ID: ${row.id_group} (${duration}ms)`); // Exibe log do mapeamento encontrado
        return row.id_group; // Retorna o ID do grupo encontrado no banco de dados local
      }
    }

    console.log(`[DB] ℹ️ Nenhum mapeamento local encontrado para o NCM: ${cleanNcm}`); // Informa que nenhum de-para foi localizado
    return null; // Retorna nulo quando não encontra mapeamento para nenhum prefixo
  } catch (error) {
    console.warn(`[DB] ⚠️ Erro ao consultar NCM na tabela from_to_group:`, error); // Exibe aviso de exceção na consulta
    return null; // Retorna nulo em caso de erro na execução da query
  }
}

/**
 * Consulta as configurações salvas no arquivo JSON local (`config.json`)
 * e retorna o token do Cosmos e o host configurado.
 */
async function getCosmosConfigFromFile() {
  try {
    const fileExists = await ConfigModelInstance.checkConfigFileExists(); // Verifica se o arquivo JSON de configuração existe localmente
    if (!fileExists) {
      console.log('[Cosmos Config] ⚠️ Arquivo config.json não encontrado localmente.'); // Loga a ausência do arquivo local
      return null; // Retorna nulo pois não há arquivo configurado
    }

    const configFile = await ConfigModelInstance.readConfigFile(); // Realiza a leitura do conteúdo do arquivo JSON local
    if (!configFile) return null; // Retorna nulo caso o arquivo esteja vazio ou inválido

    // Procura na lista de configurações do arquivo por um registro correspondente ao Cosmos
    const cosmosConfig = configFile.configs?.find((cfg: any) => 
      cfg.ds_tp_config?.toUpperCase().includes('COSMOS') || cfg.id_tp_config === 1
    );

    if (cosmosConfig) {
      console.log('[Cosmos Config] ⚙️ Configuração do Cosmos localizada no arquivo JSON.'); // Loga localização da config
      return {
        token: cosmosConfig.key_config || null,  // Recupera a chave/token de acesso do Cosmos
        url: cosmosConfig.url_config || null,    // Recupera a URL/Host obrigatoriamente do arquivo
      };
    }
  } catch (error) {
    console.warn('[Cosmos Config] ⚠️ Erro ao ler arquivo de configuração local:', error); // Loga exceção ocorrida durante a leitura
  }
  return null; // Retorna nulo em caso de falha na busca da configuração
}

/**
 * Consulta o produto na API do Cosmos pelo GTIN utilizando exclusivamente a URL configurada no arquivo
 */
export async function fetchProductFromCosmos(gtin: string): Promise<CosmoProductResult | null> {
  // Busca as configurações a partir do arquivo JSON local
  const fileConfig = await getCosmosConfigFromFile(); // Executa a leitura assíncrona das configurações no arquivo

  // Valida se a URL de configuração do arquivo existe
  if (!fileConfig || !fileConfig.url) {
    console.warn('[Cosmos API] ⛔ Falha: Nenhuma URL de configuração foi encontrada no arquivo config.json.'); // Informa que a URL é obrigatória
    return null; // Interrompe a execução pois a URL configurada é obrigatória
  }

  // Utiliza o token do arquivo JSON ou faz fallback para a variável de ambiente EXPO_PUBLIC_COSMOS_TOKEN
  const cosmosToken = fileConfig.token || process.env.EXPO_PUBLIC_COSMOS_TOKEN; // Define o token de acesso
  
  // Utiliza exclusivamente a URL definida no arquivo de configuração
  const baseUrl = fileConfig.url.replace(/\/+$/, ''); // Remove barras no final da URL para padronização
  const url = `${baseUrl}/gtins/${gtin}.json`;        // Monta a URL completa de consulta pelo GTIN
  
  const startTime = Date.now(); // Marca o tempo de início da requisição HTTP

  console.log(`\n=================== [COSMOS API - INÍCIO] ===================`); // Exibe delimitador de início de log no console
  console.log(`[Cosmos API] 🚀 Solicitando consulta para o GTIN: ${gtin}`); // Loga o código GTIN que está sendo consultado
  console.log(`[Cosmos API] 🌐 Endpoint configurado: ${url}`); // Loga o endpoint vindo do arquivo de configuração
  console.log(`[Cosmos API] 🔑 Token utilizado: ${cosmosToken ? '*** (Configurado)' : 'Nenhum'}`); // Loga a presença do token sem expor a chave

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json', // Define o tipo de conteúdo da requisição como JSON
      'User-Agent': 'Cosmos-API-Request',   // Define o User-Agent exigido pela API do Cosmos
    };

    if (cosmosToken) {
      headers['X-Cosmos-Token'] = cosmosToken; // Adiciona o token de autenticação nos cabeçalhos se estiver configurado
    }

    const response = await fetch(url, { method: 'GET', headers }); // Realiza a requisição GET para a URL configurada
    const duration = Date.now() - startTime; // Calcula o tempo de resposta da API

    if (!response.ok) { // Verifica se a resposta HTTP indica falha (status diferente de 2xx)
      if (response.status === 404) {
        console.log(`[Cosmos API] ℹ️ Produto não localizado no Cosmos (404 Not Found).`); // Loga caso o produto não seja encontrado na base externa
      } else {
        console.warn(`[Cosmos API] ⚠️ Resposta com status: ${response.status}`); // Loga status HTTP de erro inesperado
      }
      console.log(`=================== [COSMOS API - FIM] ===================\n`); // Exibe delimitador de fim do log
      return null; // Retorna nulo se a requisição falhar ou o produto não existir
    }

    const data: CosmosApiResponse = await response.json(); // Converte a resposta recebida para o objeto TypeScript CosmosApiResponse

    if (data && data.description) { // Verifica se o retorno contém dados válidos e a descrição do produto
      console.log(`[Cosmos API] ✅ Produto: "${data.description}" | NCM: ${data.ncm?.code || 'N/A'}`); // Loga a descrição e o NCM obtidos

      // Consulta de-para direto pelo NCM no banco local
      const idGroup = await findGroupIdByNcm(data.ncm?.code); // Tenta obter o id_group correspondente ao NCM retornado

      // Se não encontrar no de-para local, usa o grupo padrão (10)
      const finalGroupId = idGroup ?? 10; // Utiliza o id_group mapeado ou 10 como valor de fallback padrão

      const result: CosmoProductResult = {
        nm_product: data.description.toUpperCase(), // Converte o nome do produto para letras maiúsculas
        id_group: finalGroupId,                     // Atribui o ID do grupo determinado (mapeado ou padrão)
        gtin: gtin,                                 // Atribui o código GTIN pesquisado
        tag: data.brand?.name || '',               // Atribui o nome da marca ou string vazia caso não exista
      };

      console.log(`[Cosmos API] 🎯 Objeto final retornado:`, JSON.stringify(result, null, 2)); // Exibe no console o objeto formatado final
      console.log(`=================== [COSMOS API - FIM] ===================\n`); // Exibe delimitador de encerramento do log
      return result; // Retorna o objeto formatado com sucesso
    }
  } catch (error) {
    const duration = Date.now() - startTime; // Calcula a duração da tentativa até o momento da exceção
    console.error(`[Cosmos API] ❌ Erro na requisição (${duration}ms):`, error); // Registra a falha/exceção ocorrida na chamada da API
  }

  console.log(`=================== [COSMOS API - FIM] ===================\n`); // Exibe delimitador de fim do log em caso de erro
  return null; // Retorna nulo em caso de captura de exceção
}