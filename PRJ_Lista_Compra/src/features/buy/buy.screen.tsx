// src/features/buy/buy.screen.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BuyListCameraModal } from '../buyList/buyList.form';
import { ProductModel } from '../product/product.model';
import { SupplierModel } from '../supplier/supplier.model';
import { BuyActions, BuyAddActions, BuyItemModal, BuyNameSearchModal, FinishBuyModal } from './buy.form';
import { useBuyViewModel } from './buy.hook';
import { styles } from './buy.styles';

// Componentes funcionais da tela
export default function BuyScreen() {
  // Estado atual da funções
  const { 
    state,                                  // Estado
    loadBuyList,                            // Leitura lista de compra
    addTemporaryBarCod,                     // Adiciona produto código de barra
    addTemporaryName,                       // Adiciona produto por nome
    updateItemValueAndQtyByIndex,           // Atualiza quantidade e valor
    removeItemByIndex,                      // Remover produto
    finalizePurchase,                       // Finaliza a compra
  } = useBuyViewModel();                    // Hook

  // Estado do botões Add registro (Câmera/Nome) - Ocultos
  const [showAddOptions, setShowAddOptions] = useState(false);
  
  // Armazena texto digitado na caixa de texto pesquisa
  const [searchText, setSearchText] = useState('');
  
  // Modal Edição - Quantidad/Valor
  const [editingItem, setEditingItem] = useState<any | null>(null); 
  const [qtyText, setQtyText] = useState('');
  const [valueText, setValueText] = useState('');

  // Controla Modal - Câmera/Nome/Fonecedor - Oculto
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showNameSearchModal, setShowNameSearchModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [suppliersList, setSuppliersList] = useState<any[]>([]);          // Armazena a lista de fornecedores

  // Chamada função: Lista de compra 
  const handleOpenBuyList = async () => {
    // Realiza a leitura da lista
    await loadBuyList();
    // Botões adicionar registro - Oculto
    setShowAddOptions(false);
  };

  // Chamada função: Recebimento do código scaneado
  const handleScanSuccess = async (barcode: string) => {
    // Fechar o modal da câmera
    setShowCameraModal(false);
    // Bloco tratamento: Try: Tente | Cach: Capture (Erro)
    try {
      // Espera a até função para adicionar registro seja concluida
      await addTemporaryBarCod(barcode);
      // Botões adicionar registro - Oculto
      setShowAddOptions(false);
    // Se ocorrer algum erro
    } catch (error) {
      // Gera alerta informativo
      Alert.alert('Aviso', 'Produto não encontrado pelo código de barras.');
    }
  };

  // Chamada função: Edição Quantidade/Valor
  const handleSaveItemData = () => {
    // Converte texto digitado em número
    const qty = parseFloat(qtyText);
    const val = parseFloat(valueText.replace(',', '.'));
    // Valida se item está sendo editado, se a index não é 'undefined' ou Null
    if (editingItem && editingItem.index !== undefined && editingItem.index !== null) {
      const success = updateItemValueAndQtyByIndex(editingItem.index, qty, val);
      // Valida se falhou
      if (!success) {
        // Verdadeiro: Gera alerta informativo
        Alert.alert('Erro', state.error || 'Dados inválidos.');
        return;
      }
    }
    //Fechar o modal de edição
    setEditingItem(null);
  };

  // Realizar o calculo do total da compra
  const totalPurchaseValue = state.items.reduce((sum, item) => {
    const val = item.vl_product || 0;           // operador lógico || = ou (or)
    const qty = item.qt_product || 0;
    return sum + (val * qty);
  }, 0);

  // Realizar validações para selecionar o Fornecedor
  const handleOpenFinishModal = async () => {
    // Verifica se não existe lista de compra na memória
    if (!state.items || state.items.length === 0) {
      // Verdadeiro: Gerar alerta informativo
      Alert.alert('Aviso', 'Adicione produtos à lista antes de finalizar a compra.');
      return;
    }
    // Buscar registros na lista de item na memoria que possui valores preenchido
    const itemsWithPrice = state.items.filter(item => item.vl_product !== undefined && item.vl_product >= 0);
    // Verificar se a busca não retornou registro
    if (itemsWithPrice.length === 0) {
      // Verdadeiro: Gerar alerta informativo
      Alert.alert('Aviso', 'Informe o valor de pelo menos um produto para finalizar a compra.');
      return;
    }
    // Bloco tratamento: Try: Tente | Cach: Capture (Erro)
    try {
      // Busca os registros no BD
      const suppliers = await SupplierModel.fetchAll();
      // Verificar se a busca não retornou registro
      if (!suppliers || suppliers.length === 0) {
        // Verdadeiro: Gerar alerta informativo
        Alert.alert('Atenção', 'Cadastre pelo menos um fornecedor/mercado antes de finalizar a compra.');
        return;
      }
      // Armazena a lista de fornecedores
      setSuppliersList(suppliers);
      // Exibi o modal para selecionar o fornecedor
      setShowSupplierModal(true);
    // Se ocorrer algum erro
    } catch (error) {
      // Gerar alerta informativo
      Alert.alert('Erro', 'Não foi possível carregar a lista de fornecedores.');
    }
  };

  // Realiza a finalização da compra
  const handleConfirmFinalize = async (supplier: any) => {
    // Fecha o modal de seleção de fornecedor
    setShowSupplierModal(false);
    // Bloco tratamento: Try: Tente | Cach: Capture (Erro)
    try {
      // Guarda a finalização da chama para finalizar a compra
      await finalizePurchase(supplier.id_supplier);
      // Gerar alerta informativo
      Alert.alert('Sucesso', 'Compra finalizada e registrada no histórico!');
    // Se ocorrer algum erro
    } catch (error) {
      // Gerar alerta informativo
      Alert.alert('Erro', 'Não foi possível finalizar a compra.');
    }
  };
  // Filtra a lista em tempo real com base no texto digitado na pesquisa
  const filteredItems = state.items.filter((item: any) => {
    const searchLower = searchText.toLowerCase();
    const matchName = item.nm_product.toLowerCase().includes(searchLower);
    const matchGroup = item.nm_group ? item.nm_group.toLowerCase().includes(searchLower) : false;
    return matchName || matchGroup;
  });

  // MONTAGEM DA TELA 
  return (
    <View style={styles.container}>
      {/* Título principal da tela */}
      <Text style={styles.title}>Realizar Compra</Text>
      {/* Indicador visual de carregamento (Spinner) */}
      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {/* Exibição de mensagens de erro, caso ocorram */}
      {state.error && <Text style={styles.error}>{state.error}</Text>}
      {/* Componente do Form para botões de ação */}
      <BuyActions 
        onOpenBuyList={handleOpenBuyList} 
        onToggleAddOptions={() => setShowAddOptions(!showAddOptions)} 
      />
      {/* Componente do Form para botões adicionar produto */}
      {showAddOptions && (
        <BuyAddActions 
          onOpenCamera={() => setShowCameraModal(true)}
          onOpenNameSearch={() => setShowNameSearchModal(true)}
        />
      )}
      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Produtos da Compra</Text>
      {/* Caixa de texto para pesquisar grupos na lista */}
      <TextInput
        style={styles.input}
        placeholder="Pesquisar Produto"
        value={searchText}
        onChangeText={setSearchText}
      />
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => String(item.id_list_buy || item.id_product || index)}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, { flexDirection: 'row', alignItems: 'center' }]}>
            {/* Botão de Edição: preenche o formulário com os dados do item selecionado */}
            <TouchableOpacity 
              style={{ flex: 1 }}
              onPress={() => {
                // Identifica o index do registro clicado
                const realIndex = state.items.findIndex(i => i === item);
                // Defini o item é o index
                setEditingItem({ ...item, index: realIndex });
                // Defini a quantidade
                setQtyText(String(item.qt_product || 1));
                // Defini o valor
                setValueText(item.vl_product !== undefined ? String(item.vl_product) : '');
              }}
            >
            {/* Apresenta a lista com campos*/}
              <View style={styles.itemInfo}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ItemList}>{item.nm_product}</Text>
                  <Text style={styles.details}>{item.nm_group || 'Categoria Geral'}</Text>
                  <Text style={styles.quantity}>Qtd: {item.qt_product}</Text>
                  <Text style={[styles.quantity, { color: item.vl_product !== undefined ? '#28a745' : '#dc3545' }]}>
                    Valor: {item.vl_product !== undefined ? `R$ ${item.vl_product.toFixed(2)}` : 'Não informado'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            
            {/* Botão de Exclusão: exibe alerta de confirmação antes de remover o registros */}
            <TouchableOpacity 
              style={{ padding: 8, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => {
                // Identifica o index do registro clicado
                const realIndex = state.items.findIndex(i => i === item);
                // Validar se o index é negativo - index inicia com 0
                if (realIndex === -1) return;
                // Verdadeiro: Gera alerta informativo
                Alert.alert(
                  'Remover Item',
                  // Mensagem
                  `Deseja remover "${item.nm_product}" desta compra?`,
                  [
                    //* Botão cancela
                    { text: 'Cancelar', style: 'cancel' },
                    // Botão remove
                    { text: 'Remover', 
                      style: 'destructive',
                      // Chama a função para remover registro
                      onPress: () => removeItemByIndex(realIndex) 
                    }
                  ]
                );
              }}
            >
              {/* Ícone botão de Exclusão*/}
              <MaterialCommunityIcons name="trash-can-outline" size={22} color="#dc3545" />
            </TouchableOpacity>
          </View>
        )}
        // Mensagem exibida caso a lista filtrada esteja vazia
        ListEmptyComponent={
          !state.loading ? (
            <Text style={styles.emptyText}>Nenhum produto selecionado para a compra.</Text>
          ) : null
        }
      />
      {/* Reinderização condicional - Botão finaliza do rodapé */}
      {state.items.length > 0 && (              // Só apareça se houver pelo menos um produto na lista da memória
        <View style={styles.footer}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'right' }}>
            Total: R$ {totalPurchaseValue.toFixed(2)}
          </Text>
          {/* Botão para finalizar a compra*/}
          <Button
            title="Finalizar Compra"
            color="#28a745"
            // Chama a função para finalizar
            onPress={handleOpenFinishModal}
          />
        </View>
      )}
 {/* Modal Câmera */}
      <BuyListCameraModal
        visible={showCameraModal}                             // Mostra o modal da câmera
        onScanSuccess={handleScanSuccess}                     // Ação executada ao ler o código com sucesso
        onClose={() => {                                      // Ação ao fechar o modal
          setShowCameraModal(false);                          // Fecha o modal da câmera
          setShowAddOptions(false);                           // Fecha os botões de adição
        }}
      />

      {/* Modal Busca por Nome */}
      <BuyNameSearchModal
        visible={showNameSearchModal}                         // Mostra o modal de busca por nome
        onClose={() => {                                      // Ação ao fechar o modal
          setShowNameSearchModal(false);                      // Fecha o modal de busca
          setShowAddOptions(false);                           // Fecha os botões de adição
        }}
        onSearchProducts={async (query) => {                  // Função de busca de produtos
          return await ProductModel.findByName(query);        // Retorna a lista de produtos encontrados
        }}
        onSelectProduct={(product) => {                       // Ação ao selecionar um produto
          addTemporaryName(product);                          // Adiciona o produto à memória
          setShowAddOptions(false);                           // Fecha os botões de adição
        }}
      />
      {/* Modal Edição de Item */}
      <BuyItemModal
        visible={editingItem !== null}                        // Mostra o modal se houver item em edição
        item={editingItem}                                    // Passa o item selecionado para o modal
        quantityText={qtyText}                                // Passa o texto da quantidade atual
        valueText={valueText}                                 // Passa o texto do valor atual
        onChangeQuantity={setQtyText}                         // Atualiza o texto da quantidade
        onChangeValue={setValueText}                          // Atualiza o texto do valor
        onSave={handleSaveItemData}                           // Salva as alterações do item
        onClose={() => setEditingItem(null)}                  // Fecha o modal e limpa a edição
      />
      {/* Modal Finalização / Fornecedor */}
      <FinishBuyModal
        visible={showSupplierModal}                           // Mostra o modal de seleção de fornecedor
        suppliers={suppliersList}                             // Passa a lista de fornecedores disponíveis
        onSelectSupplier={handleConfirmFinalize}              // Ação ao selecionar um fornecedor
        onClose={() => setShowSupplierModal(false)}           // Fecha o modal de fornecedores
      />
    </View>
  );
}