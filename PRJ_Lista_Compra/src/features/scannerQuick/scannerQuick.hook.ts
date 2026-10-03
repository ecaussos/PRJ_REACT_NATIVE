// features/scannerQuick/scannerQuick.hook.tsx
import { router } from 'expo-router'; // Importa o roteador para navegação de telas
import { useCallback, useEffect, useState } from 'react'; // Importa os hooks do React
import { Alert } from 'react-native'; // Importa o componente de alerta nativo

import { CosmoProductResult, fetchProductFromCosmos } from '../../core/api/cosmosProduct.api'; // Importa a API de busca no Cosmos
import { fetchProductInfoByGTIN } from '../../core/api/geminiProduct.api'; // Importa a API de busca no Gemini
import { fetchProductScraping } from '../../core/api/openFoodProduct.api'; // Importa a API de busca via Scraping

// Instâncias de Models
import { BuyListModelInstance } from '../buyList/buyList.model'; // Importa a instância do model da lista de compras
import { ConfigModelInstance } from '../config/config.model'; // Importa a instância do model de configuração local
import { groupProductModelInstance } from '../groupProduct/groupProduct.model'; // Importa a instância do model de grupos
import { ProductModelInstance } from '../product/product.model'; // Importa a instância do model de produtos
import { ProductResult, ScannerQuickIntent, ScannerQuickState } from './scannerQuick.types'; // Importa os tipos da funcionalidade

// Hook principal de ViewModel do leitor rápido
export function useScannerQuickViewModel() {
  // Define o estado inicial da tela do leitor
  const [state, setState] = useState<ScannerQuickState>({
    visible: true,              // Define que o leitor está visível
    loading: false,             // Define o estado de carregamento como falso
    isConfirmModalOpen: false,  // Define o modal de confirmação como fechado
    scannedProduct: null,       // Inicializa o produto lido como nulo
    selectedGroupId: '',        // Inicializa o ID do grupo selecionado como vazio
  });

  // Lista local de grupos para popular o Picker/Select do modal
  const [groups, setGroups] = useState<Array<{ id_group: number; nm_group: string }>>([]); // Estado local com os grupos de produtos

  // Carrega os grupos locais ao iniciar a tela
  useEffect(() => {                                                           // Executa efeito ao carregar o componente
    async function loadGroups() {                                             // Função assíncrona para buscar os grupos
      try {                                                                   // Inicia bloco de tratamento de erros
        const localGroups = await groupProductModelInstance.fetchAll();       // Busca todos os grupos no banco local
        setGroups(localGroups || []);                                         // Atualiza o estado com a lista de grupos encontrados
      } catch (err) {                                                         // Captura eventuais erros
        console.error('[ScannerQuick] Erro ao carregar grupos locais:', err); // Exibe mensagem de erro no console
      }
    }
    // Executa a função de carga
    loadGroups();
  }, []);

  // Fecha a tela do scanner e retorna na navegação
  const handleClose = useCallback(() => {                                       // Função para fechar o leitor
    setState(prev => ({ ...prev, visible: false, isConfirmModalOpen: false })); // Oculta a tela e o modal
    router.back();                                                              // Volta para a tela anterior
  }, []);                                                                       // Mantém referência estável da função

  // Fecha o modal de confirmação mantendo o scanner ativo
  const handleCloseModal = useCallback(() => {  // Função para fechar apenas o modal de confirmação
    setState(prev => ({                         // Atualiza o estado do modal
      ...prev,                                  // Preserva as propriedades existentes
      isConfirmModalOpen: false,                // Define modal como fechado
      scannedProduct: null,                     // Limpa o produto lido
      selectedGroupId: '',                      // Limpa o grupo selecionado
    }));                                      
  }, []);                                       // Mantém referência estável da função

  // Grava o produto no banco local e adiciona à lista de compras
  const saveProductAndAddToBuyList = useCallback(async () => {                          // Função para salvar o produto e adicionar na lista
    // Valida se existe produto scaneado
    if (!state.scannedProduct) return;                                                  // Cancela a execução se não houver produto lido
    setState(prev => ({ ...prev, loading: true }));                                     // Ativa indicador de carregamento
    try {                                                                               // Inicia bloco de tratamento de erros
      // Converter o tipo do campo
      const groupIdNumber = state.selectedGroupId ? Number(state.selectedGroupId) : 0;  // Converte o ID do grupo selecionado para número

      console.log('[SaveProduct] 🚀 Tentando cadastrar produto:', {                    // Log de auditoria dos dados enviados
        nm_product: state.scannedProduct.nm_product,                                   // Nome do produto
        gtin: state.scannedProduct.gtin,                                               // GTIN/Código de barras
        id_group: groupIdNumber,                                                       // ID do grupo tratado
      });
      
      // Chama a função para cadastrar
      const createdProduct = await ProductModelInstance.create(                         // Cadastra o novo produto no banco de dados local
        state.scannedProduct.nm_product,                                                // Nome do produto lido
        state.scannedProduct.gtin,                                                      // Código de barras/GTIN
        groupIdNumber                                                                   // ID do grupo vinculado
      );
      // Valida se o produto foi criado
      if (createdProduct && createdProduct.id_product) {                                // Se o produto foi criado com sucesso

        console.log(`[SaveProduct] ✅ Produto cadastrado com ID: ${createdProduct.id_product}`); // Log de sucesso do cadastro do produto
        
        await BuyListModelInstance.create(createdProduct.id_product, 1);               // Adiciona o produto na lista de compras com quantidade 1
        handleCloseModal();                                                            // Fecha o modal de confirmação
        Alert.alert('Sucesso', `${createdProduct.nm_product} adicionado à lista!`, [   // Exibe alerta de confirmação ao usuário
          { text: 'OK', onPress: handleClose },                                        // Fecha a tela ao clicar no botão OK
        ]);                                                                            // Finaliza a exibição do alerta
      } else {                                                                         // Se falhar na criação do produto

        console.warn('[SaveProduct] ⚠️ Retorno nulo do ProductModelInstance.create');  // Log de aviso se o retorno for inválido

        Alert.alert('Erro', 'Não foi possível cadastrar o produto.');                  // Exibe alerta de erro
      }                                                                                // Finaliza validação de criação
    } catch (error) {                                                                  // Captura falhas inesperadas
      
      console.error('[SaveProduct] ❌ Exceção ao salvar produto:', error);

      Alert.alert('Erro', 'Ocorreu um erro ao salvar o produto.');                      // Exibe alerta de erro
    } finally {                                                                         // Executa sempre ao término
      setState(prev => ({ ...prev, loading: false }));                                  // Desativa indicador de carregamento
    }                                                                                   // Finaliza bloco de tentativa
  }, [state.scannedProduct, state.selectedGroupId, handleCloseModal, handleClose]);     // Re-cria a função se as dependências mudarem

  // Prepara o modal de confirmação com os dados retornados da API
  const confirmProductRegistration = useCallback((productData: ProductResult) => {        // Prepara os dados para confirmação
    // Tenta casar o ID do grupo vindo da API com um grupo local existente
    const matchingGroup = groups.find(g => g.id_group === Number(productData.id_group));  // Procura grupo correspondente no banco
    const initialGroupId = matchingGroup ? String(matchingGroup.id_group) : '';           // Seleciona o ID encontrado ou texto vazio

    setState(prev => ({                  // Atualiza o estado da tela
      ...prev,                          // Preserva o estado anterior
      isConfirmModalOpen: true,         // Abre o modal de confirmação
      scannedProduct: {
        ...productData,               // Define os dados do produto lido
      selectedGroupId: initialGroupId,  // Define o ID do grupo pré-selecionado
    }}));                                // Finaliza atualização do estado
  }, [groups]);                         // Re-cria a função se a lista de grupos mudar

  /**
   * Consulta as APIs externas com base nas configurações ativas no arquivo config.json local.
   * Tenta primeiramente o Cosmos, faz fallback para o Gemini e posteriormente Scraping se necessário.
   */
  const fetchProductByConfiguredApi = async (gtin: string): Promise<ProductResult | null> => {  // Busca produto nas APIs configuradas
    try {                                                                                       // Inicia bloco de tratamento de erro
      // 1. Verifica se o arquivo config.json existe localmente
      const fileExists = await ConfigModelInstance.checkConfigFileExists();                     // Checa existência do arquivo local de configuração
      if (!fileExists) {                                                                        // Se o arquivo não existir
        console.warn('[ScannerQuick] ⚠️ Arquivo config.json não encontrado localmente.');      // Emite alerta no console
        return null;                                                                            // Retorna nulo
      }

      // 2. Lê o conteúdo das configurações
      const configFile = await ConfigModelInstance.readConfigFile();                                // Lê o arquivo de configuração local
  
      // LOG DE CONFIGURAÇÕES: Exibe o conteúdo completo do arquivo no console
      console.log('[ScannerQuick] 📄 Conteúdo bruto de config.json:', JSON.stringify(configFile, null, 2));
   
     // Extrai o array de configurações aceitando objeto com chave .configs ou array direto
      const configs: any[] = Array.isArray(configFile) 
        ? configFile 
        : configFile?.configs || configFile?.data || [];

      console.log('[ScannerQuick] 📋 Lista de configurações processada:', configs); // Exibe o array extraído no console

      if (!configs || configs.length === 0) {                                                         // Se não houver configurações ativas
          console.warn('[ScannerQuick] ⚠️ Nenhuma configuração encontrada no arquivo config.json.');  // Emite alerta no console
          return null;                                                                                // Retorna nulo
        }
      // API COSMOS
      // Verifica se a API do Cosmos está cadastrada e ativa (st_config === 1 e id_tp_config === 3)
      const cosmosConfig = configs.find(                                                                                    // Procura pela configuração do Cosmos
        (cfg: any) => (cfg.ds_tp_config?.toUpperCase().includes('COSMOS') || cfg.id_tp_config === 3) && cfg.st_config === 1 // Filtra por tipo e status ativo
      );                                                                                                                    // Guarda a configuração encontrada

      // 3. Tenta buscar via Cosmos API se estiver ativa
      if (cosmosConfig) {                                                                   // Se houver configuração ativa do Cosmos
        console.log('[ScannerQuick] 🔍 Tentando buscar produto via API do Cosmos...');      // Registra log no console
        const cosmosResult: CosmoProductResult | null = await fetchProductFromCosmos(gtin); // Executa busca na API do Cosmos
        if (cosmosResult) {                                                                 // Se encontrar produto no Cosmos
          return {                                                                          // Retorna os dados formatados do produto
            nm_product: cosmosResult.nm_product,                                            // Nome do produto
            id_group: cosmosResult.id_group,                                                // ID do grupo retornado
            gtin: cosmosResult.gtin || gtin,                                                // Código GTIN do produto
            tag: cosmosResult.tag,                                                          // Tag/Categoria do produto
          }; 
        } 
      }
      // API GEMINI
      // Verifica se a API do Gemini está cadastrada e ativa (st_config === 1 e id_tp_config === 4)
      const geminiConfig = configs.find(                                                                                    // Procura pela configuração do Gemini
        (cfg: any) => (cfg.ds_tp_config?.toUpperCase().includes('GEMINI') || cfg.id_tp_config === 4) && cfg.st_config === 1 // Filtra por tipo e status ativo
      );                                                                                                                    // Guarda a configuração encontrada

      // 4. Fallback: Tenta buscar via Gemini API caso o Cosmos falhe ou esteja inativo
      if (geminiConfig) {                                                               // Se houver configuração ativa do Gemini
        console.log('[ScannerQuick] 🔍 Tentando buscar produto via API do Gemini...');  // Registra log no console
        const geminiResult = await fetchProductInfoByGTIN(gtin);                        // Executa busca na API do Gemini
        if (geminiResult) {                                                             // Se encontrar produto no Gemini
          return geminiResult;                                                          // Retorna o produto encontrado
        }
      }

      // SCRAPING
      // Verifica se a consulta via Scraping está cadastrada e ativa (st_config === 1 e id_tp_config === 5)
      const scrapingConfig = configs.find(                                                                                    // Procura pela configuração do Scraping
        (cfg: any) => (cfg.ds_tp_config?.toUpperCase().includes('SCRAPING') || cfg.id_tp_config === 5) && cfg.st_config === 1 // Filtra por tipo e status ativo
      );                                                                                                                      // Guarda a configuração encontrada

      // 5. Fallback: Tenta buscar via Web Scraping caso Cosmos e Gemini falhem ou estejam inativos
      if (scrapingConfig) {                                                              // Se houver configuração ativa de Scraping
        console.log('[ScannerQuick] 🔍 Tentando buscar produto via Scraping...');        // Registra log no console
        const scrapingResult = await fetchProductScraping(gtin);                       // Executa busca via Scraping
        if (scrapingResult) {                                                            // Se encontrar produto via Scraping
          return scrapingResult;                                                         // Retorna o produto encontrado
        }
      }

    } catch (error) {                                                                                     // Captura erros no processo de busca
      console.error('[ScannerQuick] ❌ Erro ao ler configurações do arquivo ou consultar APIs:', error);  // Registra mensagem de erro
    }

    return null; // Retorna nulo se não encontrar em nenhuma API
  };

  // Processa o código de barras lido pela câmera
  const handleScanSuccess = useCallback(async (barcode: string) => {  // Executa após leitura do código de barras
    const cleanBarcode = barcode.trim();                              // Remove espaços do código de barras
    if (!cleanBarcode) return;                                        // Cancela se o código estiver vazio
    setState(prev => ({ ...prev, loading: true }));                   // Ativa indicador de carregamento

    try {                                                             // Inicia bloco de tratamento de erro
      // 1. Verifica no banco SQLite local se o produto já está cadastrado
      const existingProduct = await ProductModelInstance.checkBarcode(cleanBarcode);  // Busca produto por código no banco local
      // Valida se o produto existe
      if (existingProduct) {                                                          // Se o produto já existir no banco local
        await BuyListModelInstance.create(existingProduct.id_product, 1);             // Adiciona direto na lista de compras
        Alert.alert('Sucesso', `${existingProduct.nm_product} adicionado à lista!`, [ // Exibe alerta de sucesso
          { text: 'OK', onPress: handleClose },                                       // Fecha a tela de leitura ao clicar em OK
        ]);
        return;                                                                       // Encerra a leitura com sucesso
      }
      // 2. Consulta a API externa ativada nas configurações
      const apiResult = await fetchProductByConfiguredApi(cleanBarcode);  // Busca o produto nas APIs externas ativas
      // Valida se o protudofoi encontrado
      if (apiResult) {                                                    // Se o produto for localizado na API
        confirmProductRegistration(apiResult);                            // Abre modal para confirmar/cadastrar o produto
        return;                                                           // Encerra fluxo de consulta
      }
      // 3. Produto não localizado nas APIs nem no banco local
      Alert.alert('Produto Não Encontrado', `GTIN: ${cleanBarcode}`, [          // Exibe alerta informando que o produto não foi localizado
        { text: 'OK', onPress: handleClose },                                   // Fecha a tela de leitura ao clicar em OK
      ]);
    } catch (error) {                                                           // Captura falhas de leitura
      console.error('[ScannerQuick] Erro no processamento da leitura:', error); // Exibe mensagem de erro no console
    } finally {                                                                 // Executa sempre ao término
      setState(prev => ({ ...prev, loading: false }));                          // Desativa indicador de carregamento
    }
  }, [confirmProductRegistration, handleClose]);                                // Re-cria a função se as dependências mudarem

  // Redireciona as ações/intenções da interface
  const dispatch = useCallback((intent: ScannerQuickIntent) => {          // Processa intenções despachadas pela UI
    switch (intent.type) {                                                // Avalia o tipo de intenção recebida
      case 'CLOSE':                                                       // Caso seja intenção de fechar a tela
        handleClose();                                                    // Executa o fechamento da tela
        break;                                                            // Interrompe o switch
      case 'SCAN_BARCODE':                                                // Caso seja intenção de leitura de código
        handleScanSuccess(intent.payload);                                // Executa o processamento do código lido
        break;                                                            // Interrompe o switch
      case 'CLOSE_CONFIRM_MODAL':                                         // Caso seja intenção de fechar o modal
        handleCloseModal();                                               // Executa o fechamento do modal
        break;                                                            // Interrompe o switch
      case 'UPDATE_SCANNED_PRODUCT':                                      // Caso seja intenção de atualizar os dados do produto lido
        setState(prev => ({                                               // Atualiza o estado
          ...prev,                                                        // Preserva o estado anterior
          scannedProduct: prev.scannedProduct                             // Atualiza os dados do produto se existir
            ? { ...prev.scannedProduct, ...intent.payload }               // Mescla os novos dados do produto
            : null,                                                       // Mantém nulo se não existir
        }));
        break;                                                            // Interrompe o switch
      case 'SET_GROUP_ID':                                                // Caso seja intenção de alterar o grupo selecionado
        setState(prev => ({ ...prev, selectedGroupId: intent.payload })); // Atualiza o ID do grupo selecionado
        break;                                                            // Interrompe o switch
    }
  }, [handleClose, handleScanSuccess, handleCloseModal]);                 // Re-cria a função se as dependências mudarem

  return {                                                                // Retorna os dados e ações para o componente da tela
    state,                                                                // Estado do scanner
    groups,                                                               // Lista de grupos de produtos
    saveProductAndAddToBuyList,                                           // Função para salvar e adicionar à lista
    dispatch,                                                             // Função para despachar intenções
  };
}