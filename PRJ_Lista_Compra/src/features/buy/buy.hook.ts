// src/features/buy/buy.hook.ts
import { useState } from 'react';
import { BuyListModel } from '../buyList/buyList.model';
import { ProductModel } from '../product/product.model';
import { BuyModel } from './buy.model';

//TRATAMENTO DA LISTA DE REGISTRO E ADICIONAÇÃO DE NOVOS CAMPOS
// Função de gerenciamento dos componente na tela
export function useBuyViewModel() {
  // Estado centralizado gerenciando, carregamento e erros
  const [state, setState] = useState({
    items: [] as any[],
    loading: false,
    error: null as string | null,
  });
  // 1. Carrega os registros e adiciona novos campos 
  const loadBuyList = async () => {
    // Atualiza o status para ativar as funções
    setState(prev => ({ ...prev, loading: true, error: null }));
    // Bloco tratamento: Try: Tente | Cach: Capture (Erro)
    try {
      // Carregar os registros da busca
      const listItems = await BuyListModel.fetchItems();
      // Para cada registro cria uma nova lista
      const formattedItems = listItems.map((item: any) => ({
        // Armazena os dados dos registros no objeto
        ...item,
        // Identificar a descrição do grupo do registro
        nm_group: item.nm_group || item.group?.nm_group || 'Categoria Geral',
        // Defino um novo campo com valor em branco
        vl_product: undefined,
      }));
      //Atualiza o estado com a nova lista geradas.
      setState(prev => ({ ...prev, items: formattedItems, loading: false }));
    // Se ocorrer algum erro
    } catch (error) {
      // Atualiza o estado e gera alerta informativo
      setState(prev => ({ ...prev, loading: false, error: 'Erro ao carregar a lista de compras.' }));
    }
  };

  // 2. Adiciona Registros temporariamente por código de barras (Câmera)
  const addTemporaryBarCod = async (barcode: string) => {
    // Bloco tratamento: Try: Tente | Cach: Capture (Erro)
    try {
      // Consulta o registro utilizando a câmera
      const product: any = await ProductModel.checkBarcode(barcode);
      // Verifica se o registro não foi encontrado
      if (!product) {
        // Verdadeiro: Gerar o informativo
        throw new Error('Produto não encontrado.');
      }
      // Chama a função para adicionar o registro na Memória 
      addTemporaryName(product);
    // Se ocorrer algum erro    
    } catch (error) {
      // Repassa o erro para quem realizou a chamada
      throw error;
    }
  };

  // 3. Adiciona Registro temporariamente por nome (busca por nome)
  const addTemporaryName = (product: any) => {
    // Ataualiza o estado
    setState(prev => {
      // Procura na lista em memória se já existe um ID
      const existingIndex = prev.items.findIndex(i => i.id_product === product.id_product);
      // Valida se o o valor da variável é maior igual a 0
      if (existingIndex >= 0) {
        // Retorna o estado atual mantendo os itens, mas definindo a mensagem de erro
        return {
          ...prev,
          loading: false,
          error: 'Já existe o produto na lista de compras.',
        };
      }
      // Falso: registro não existe na memória
      const newItem = {
        // Defini o ID
        id_product: product.id_product,
        // Defini o nome
        nm_product: product.nm_product,
        // Defini o grupo
        nm_group: product.nm_group || product.groupName || 'Categoria Geral',
        // Defini a quantidade
        qt_product: 1,
        // Defini o valor vazio.
        vl_product: undefined,
      };
      // Retorna o novo estado com o novo registro
      return { ...prev, items: [...prev.items, newItem] };
    });
  };

  // 4. Atualiza registros na lista em  memoria utilizando o índice da linha -  Quantidade/Valor
  const updateItemValueAndQtyByIndex = (index: number, quantity: number, value: number) => {
    // Valida se quantidade é vazia ou negativa
    if (isNaN(quantity) || quantity <= 0) {
      // Retorna o estado atual mantendo os itens, mas definindo a mensagem de erro
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Informe uma quantidade válida.' 
      }));
      return false;
    } 
    // Valida se valor é vazio ou negativo 
    if (isNaN(value) || value < 0) {
      // Retorna o estado atual mantendo os itens, mas definindo a mensagem de erro
     setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Informe um valor válido.' 
      }));
      return false;
    }
    // Atualiza o estado, utilizando o anterior
    setState(prev => {
      // Busca na memória os registros como o seu respectivo indice
      const updatedItems = prev.items.map((item, idx) => {
        // Valida se o index do registro autal é igual ao index que será alterado
        if (idx === index) {
          // Verdadeiro: Retorna novo objeto atualizado 
          return { 
            // Objeto
            ...item,
            // Quantidade autalizada 
            qt_product: quantity, 
            // Valor atualizado
            vl_product: value 
          };
        }
        // Falso: Retorna o mesmo objeto
        return item;
      });
      // Retornar o objeto realizando a autalização
      return { ...prev, items: updatedItems };
    });
  };

  // 5. Remove registro da lista em memória utilizando o índice
  const removeItemByIndex = (index: number) => {
    // Atualiza o estado, utilizando o anterior
    setState(prev => ({
      // Objeto
      ...prev,
      // Atualiza a lista em memória ignorando o registro a ser removido
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  // 6. Finaliza: Envia para dados para o BD: adicionar:'hist_buy' e remove:'list_buy'
  const finalizePurchase = async (id_supplier: number) => {
    //Atualiza o estado para iniciar a o processo
    setState(prev => ({ ...prev, loading: true, error: null }));
    // Bloco tratamento: Try: Tente | Cach: Capture (Erro)
    try {
      // Valida a lista na memória pegar apenas registro com valor preenchido
      const validItemsToBuy = state.items.filter(item => item.vl_product !== undefined && item.vl_product >= 0);
      // Pega a data atual e converter em texto
      const currentDate = new Date().toISOString();
      // Pega os registros (loop)
      for (const item of validItemsToBuy) {
        //Executa o inserção na base de dados
        await BuyModel.insertHistBuy({
          id_product: item.id_product,
          id_supplier: id_supplier,
          qt_product: item.qt_product,
          vl_product: item.vl_product,
          dt_hist_buy: currentDate,
        });
        // Valida se o registro existe na Lista de compra
        if (item.id_list_buy) {
          // Verdadeiro: remove o item da lista
          await BuyListModel.delete(item.id_list_buy);
        }
      }
      // Atualiza o estado limpando a lista da memória
      setState(prev => ({ ...prev, items: [], loading: false }));
    // Se ocorrer algum erro   
    } catch (error) {
      // Atualiza o estado e gera alerta informativo
      setState(prev => ({ ...prev, loading: false, error: 'Erro ao finalizar a compra.' }));
      // Repassa o erro para quem realizou a chamada
      throw error;
    }
  };
  // Retornar o objeto contendo todas as funções
  return {
    state,                                  // Estado
    loadBuyList,                            // Leitura lista de compra
    addTemporaryBarCod,                     // Adiciona produto código de barra
    addTemporaryName,                       // Adiciona produto por nome
    updateItemValueAndQtyByIndex,           // Atualiza quantidade e valor
    removeItemByIndex,                      // Remover produto
    finalizePurchase,                       // Finaliza a compra
  };
}