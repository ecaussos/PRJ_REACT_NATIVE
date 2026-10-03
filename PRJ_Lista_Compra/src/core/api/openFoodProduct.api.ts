// src/core/api/scrapingProduct.ts
import { ConfigModelInstance } from '../../features/config/config.model'; // Importa a instância do Model de Configuração para leitura do arquivo JSON local
import { getDBConnection } from '../database/sqliteclient'; // Importa a função de conexão com o banco de dados SQLite local

export interface ScrapingProductResult {
  nm_product: string; // Nome/Descrição do produto retornado e formatado
  id_group: number;   // ID do grupo/categoria ao qual o produto pertence
  gtin: string;       // Código de barras (EAN/GTIN) do produto
  tag: string;        // Tag ou marca associada ao produto
}

export interface ScrapingFileConfig {
  url_config: string | null; // URL do serviço ou endpoint customizado configurado no JSON
  vers_config: string | null; // Chave/Token opcional de API configurado no JSON
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
 * e retorna os campos de chave e URL da configuração de Scraping/API Aberta.
 */
async function getScrapingConfigFromFile(): Promise<ScrapingFileConfig | null> {
  try {
    const fileExists = await ConfigModelInstance.checkConfigFileExists(); // Verifica se o arquivo JSON de configuração existe localmente
    if (!fileExists) {
      console.log('[Scraping Config] ⚠️ Arquivo config.json não encontrado localmente.'); // Loga a ausência do arquivo local
      return null; // Retorna nulo pois não há arquivo configurado
    }

    const configFile = await ConfigModelInstance.readConfigFile(); // Realiza a leitura do conteúdo do arquivo JSON local
    if (!configFile) return null; // Retorna nulo caso o arquivo esteja vazio ou inválido

    // Garante o acesso ao array correto, independente de ser o array direto ou envelopado em { configs: [...] }
    const configsList = Array.isArray(configFile) ? configFile : configFile.configFile || configFile.configs; // Obtém o array de configurações

    if (!Array.isArray(configsList)) {
      console.warn('[Scraping Config] ⚠️ Estrutura do arquivo config.json não é um array válido.'); // Alerta formato inesperado
      return null; // Retorna nulo caso não seja um array iterável
    }

    // Procura na lista pelo id_tp_config === 5 ou pela descrição "SCRAPING / OPEN API"
    const scrapingConfig = configsList.find((cfg: any) => 
      cfg.id_tp_config === 5 || 
      cfg.ds_tp_config?.toUpperCase().includes('Api Scraping')
    ); // Localiza a configuração do Scraping/API Aberta

    if (scrapingConfig) {
      console.log('[Scraping Config] ⚙️ Configuração de Scraping localizada no arquivo JSON:', scrapingConfig); // Loga localização da config
      return {
        url_config: scrapingConfig.url_config || null,  // Recupera a URL base ou endpoint configurado
        vers_config: scrapingConfig.vers_config || null, // Recupera versão de acesso
      };
    }
  } catch (error) {
    console.warn('[Scraping Config] ⚠️ Erro ao ler arquivo de configuração local:', error); // Loga exceção ocorrida durante a leitura
  }
  return null; // Retorna nulo em caso de falha na busca da configuração
}

/**
 * Consulta o produto em fontes abertas/gratuitas de GTIN
 */
export async function fetchProductScraping(gtin: string): Promise<ScrapingProductResult | null> {
  const fileConfig = await getScrapingConfigFromFile(); // Lê a configuração salva
  const customUrl = fileConfig?.url_config;             // URL informada na configuração (ex: https://br.openfoodfacts.org/api/v2/product)

  console.log(`\n=================== [SCRAPING API - INÍCIO REQUISIÇÃO] ===================`);
  console.log(`[Scraping API] 🚀 Iniciando busca por Scraping/Open API para o GTIN: "${gtin}"`);

  const startTime = Date.now();

  // 1. TENTATIVA: Open Food Facts (usando apenas a url_config)
  try {
    let offUrl = '';

    if (customUrl) {
      const cleanUrl = customUrl.replace(/\/+$/, ''); // Normaliza removendo barras no final
      
      // Se a URL informada já contiver a rota do produto, concatena direto com o gtin
      if (cleanUrl.endsWith('/product')) {
        offUrl = `${cleanUrl}/${gtin}.json`;
      } else {
        // Caso contrário, adiciona /product/ para garantir a rota correta
        offUrl = `${cleanUrl}/product/${gtin}.json`;
      }
    }

    console.log(`[Scraping API] 🌐 Efetuando consulta em Open Food Facts: ${offUrl}`);

    const response = await fetch(offUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'React-Native-SupermarketApp - Version 1.0',
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();

      if (data && (data.status === 1 || data.status_verbose === 'product found') && data.product) {
        const prod = data.product;
        const productName = prod.product_name_pt || prod.product_name || prod.abbreviated_product_name;
        const brand = prod.brands || prod.brand_owner || '';

        if (productName) {
          const duration = Date.now() - startTime;
          console.log(`[Scraping API] ✅ Produto localizado via Open Food Facts em ${duration}ms!`);

          const ncmCode = prod.categories_tags?.find((c: string) => c.includes('ncm'))?.replace(/\D/g, '');
          const idGroup = await findGroupIdByNcm(ncmCode);

          const result: ScrapingProductResult = {
            nm_product: productName.trim().toUpperCase(),
            id_group: idGroup ?? 10,
            gtin: gtin,
            tag: brand ? brand.split(',')[0].trim() : 'Alimentos',
          };

          console.log(`[Scraping API] 🎯 Objeto final retornado:`, JSON.stringify(result, null, 2));
          console.log(`=================== [SCRAPING API - FIM] ===================\n`);
          return result;
        }
      }
    }
  } catch (error) {
    console.warn(`[Scraping API] ⚠️ Falha na tentativa Open Food Facts:`, error);
  }

  // 2. TENTATIVA (FALLBACK): EAN-Search
  try {
    const fallbackUrl = `https://www.ean-search.org/perl/ean-search.pl?q=${gtin}`;
    console.log(`[Scraping API] 🌐 Executando Fallback no EAN-Search: ${fallbackUrl}`);

    const response = await fetch(fallbackUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      },
    });

    if (response.ok) {
      const htmlText = await response.text();
      const titleMatch = htmlText.match(/<a href="\/ean\/\d+">([^<]+)<\/a>/i);

      if (titleMatch && titleMatch[1]) {
        const extractedName = titleMatch[1].trim();
        const duration = Date.now() - startTime;
        console.log(`[Scraping API] ✅ Produto localizado via EAN-Search em ${duration}ms!`);

        const result: ScrapingProductResult = {
          nm_product: extractedName.toUpperCase(),
          id_group: 10,
          gtin: gtin,
          tag: extractedName.split(' ')[0],
        };

        console.log(`[Scraping API] 🎯 Objeto final retornado:`, JSON.stringify(result, null, 2));
        console.log(`=================== [SCRAPING API - FIM] ===================\n`);
        return result;
      }
    }
  } catch (error) {
    console.warn(`[Scraping API] ⚠️ Falha na tentativa de Fallback EAN-Search:`, error);
  }

  console.log(`[Scraping API] ℹ️ Produto com GTIN ${gtin} não foi encontrado nas bases gratuitas.`);
  console.log(`=================== [SCRAPING API - FIM] ===================\n`);
  return null;
}