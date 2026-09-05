// src/features/buyList/buyList.screen.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ProductModel } from '../product/product.model';
import { BuyListActions, BuyListForm } from './buyList.form';
import { useBuyListViewModel } from './buyList.hook';
import { styles } from './buyList.styles';

export default function BuyListScreen() {
  const { state, dispatch } = useBuyListViewModel();

  // Estados locais da tela
  const [editingQuantityItem, setEditingQuantityItem] = useState<{ id_list_buy: number; nm_product: string; qt_product: number } | null>(null);
  const [newQuantityText, setNewQuantityText] = useState('');
  const [searchText, setSearchText] = useState('');

  // Estados para o modal de busca por nome
  const [showNameSearchModal, setShowNameSearchModal] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [foundProducts, setFoundProducts] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Estados para o modal de Câmera (Leitor de Código de Barras)
  const [showCameraModal, setShowCameraModal] = useState(false);
  
  // Ações da Câmera - Abre 
  const handleOpenCamera = () => {
    setShowCameraModal(true);
  };
  // Ações da Câmera - Fecha 
  const handleCloseCamera = () => {
    setShowCameraModal(false);
  };

  // Disparado quando o leitor identifica um código de barra com sucesso
  const handleScanSuccess = async (barcode: string) => {
    // Fecha o modal
    setShowCameraModal(false);
    // Bloco tramento: Try: Tente | Cach: Capture (Erro)
    try {
      // Consulta o registro no banco de dados
      const product = await ProductModel.checkBarcode(barcode);
      // Valida se o produto não foi encontrado
      if (!product) {
        // Se for verdadeiro: Gera alerta informativo
        Alert.alert("Aviso", `Nenhum produto cadastrado com o código ${barcode}.`);
        return;
      }
      // Se for falso: Dispara a função CREATE no BD
      await dispatch({
        type: 'CREATE',
        payload: { id_product: product.id_product, qt_product: 1 }
      });
      // Gera alerta informativo
      Alert.alert("Sucesso", `${product.nm_product} adicionado à lista!`);
    // Se ocorrer algum erro
    } catch (error) {
      // Gera alerta informativo
      Alert.alert("Erro", "Não foi possível adicionar o produto pelo código de barras.");
    }
  };

  // Busca de registro por nome
  const handleSearchProductByName = async (query: string) => {
    // Pega as informações digitada na caixa de texto pesquisa
    setProductQuery(query);
    // Valida se o valor recebido está vazio
    if (query.trim().length === 0) {
      // Se for verdadeiro: lista os registros econtrados
      setFoundProducts([]);
      return;
    }
    // Bloco tramento: Try: Tente | Cach: Capture (Erro)
    try {
      // Ativa: Indicador visual de carregamento (Spinner)
      setIsSearching(true);
      // Busca o registro no BD e valida se a função existe
      const results = ProductModel.findByName ? await ProductModel.findByName(query) : [];
      // Armaze o registro para exibir em tela
      setFoundProducts(results);
    // Se ocorrer algum erro
    } catch (error) {
      // Gera alerta informativo
      console.error("Erro ao buscar produtos por nome:", error);
    // Se der erro ou não
    } finally {
      // Desativa: Indicador visual de carregamento (Spinner)
      setIsSearching(false);
    }
  };

  // Selecionar produto buscado por nome
  const handleSelectProductToBuy = async (item: any) => {
    // Se encontrar dispara a função CREATE no BD
    await dispatch({
      type: 'CREATE',
      payload: { id_product: item.id_product, qt_product: 1 }
    });
    // Fecha o modal
    setShowNameSearchModal(false);
    // Gera alerta informativo
    Alert.alert("Sucesso", `${item.nm_product} adicionado à lista!`);
  };

  // Salvar alteração de quantidade
  const handleSaveQuantity = async () => {
    // Converter o que foi digitao para número
    const qty = parseFloat(newQuantityText);
    // Validar se o que foi digitado é numério e não é negativo
    if (isNaN(qty) || qty < 0) {
      // Se for verdadeiro: Gera alerta informativo
      Alert.alert('Erro', 'Informe uma quantidade válida.');
      return;
    }
    // Validar se existe um registro selecionado
    if (editingQuantityItem) {
      // Se for verdadeiro: dispara a função CREATE no BD
      await dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id_list_buy: editingQuantityItem.id_list_buy, qt_product: qty }
      });
    }
    // Fecha o modal
    setEditingQuantityItem(null);
  };

  // Filtra a lista em tempo real com base no texto digitado na pesquisa
  const filteredItems = state.items.filter((item) => {
    const searchLower = searchText.toLowerCase();
    const matchName = item.nm_product.toLowerCase().includes(searchLower);
    const matchGroup = item.nm_group ? item.nm_group.toLowerCase().includes(searchLower) : false;
    return matchName || matchGroup;
  });
  // MONTAGEM DA TELA 
  return (
    <View style={styles.container}>
      {/* Título principal da tela */}
      <Text style={styles.title}>Lista de Compras</Text>
      {/* Indicador visual de carregamento (Spinner) */}
      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {/* Exibição de mensagens de erro, caso ocorram */}
      {state.error && <Text style={styles.error}>{state.error}</Text>}

      {/* Componente do Form para botões */}
      <BuyListActions
        onOpenCamera={handleOpenCamera}
        onOpenNameSearch={() => {
          setProductQuery('');
          setFoundProducts([]);
          setShowNameSearchModal(true);
        }}
      />
      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Produtos Listados</Text>
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
        keyExtractor={(item) => String(item.id_list_buy)}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
              {/* Apresenta a lista com campos*/}
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.ItemList}>{item.nm_product}</Text>
                <Text style={styles.details}>{item.nm_group || 'Categoria Geral'}</Text>
                <Text style={styles.quantity}>Quantidade: {item.qt_product}</Text>
              </View>  
              {/* Container dos botões de ação*/}
              <View style={styles.actionButtonsContainer}>
                {/* Botão de Edição: preenche o formulário com os dados do item selecionado */}
                <TouchableOpacity
                  style={[styles.iconButton, styles.editButton]}
                  onPress={() => {
                    setEditingQuantityItem({ id_list_buy: item.id_list_buy, nm_product: item.nm_product, qt_product: item.qt_product });
                    setNewQuantityText(String(item.qt_product));
                  }}
                >
                  {/* Ícone botão de Edição*/}
                  <MaterialCommunityIcons name="pencil-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                {/* Botão de Exclusão: exibe alerta de confirmação antes de remover o registros */}
                <TouchableOpacity
                  style={[styles.iconButton, styles.deleteButton]}
                  onPress={() => {
                    Alert.alert(
                      // Mensagem
                      'Remover', `Deseja remover "${item.nm_product}" da lista?`,
                      [
                        // Botão cancela
                        { text: 'Cancelar', style: 'cancel' },
                        // Botão Remove
                        { text: 'Remover',
                          style: 'destructive',
                          // Chama a função para excluir
                          onPress: () => dispatch({ type: 'DELETE', payload: { id_list_buy: item.id_list_buy } })
                        }
                      ]
                    );
                  }}
                > 
                  {/* Ícone botão de Exclusão*/}
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        // Mensagem exibida caso a lista filtrada esteja vazia
        ListEmptyComponent={
          !state.loading ? <Text style={styles.emptyText}>Nenhum registro encontrado.</Text> : null
        }
      />
      {/* Rodapé - Limpar Lista */}
      {state.items.length > 0 && (
        <View style={styles.footer}>
          {/* Botão de Exclusão todos os registros: exibe alerta de confirmação antes de remover o registros */}
          <Button
            title="Limpar Lista Completa"
            color="#FF3B30"
            onPress={() => {
              Alert.alert('Limpar Lista', 'Deseja realmente apagar todos os itens?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Limpar', style: 'destructive', onPress: () => dispatch({ type: 'CLEAR' }) }
              ]);
            }}
          />
        </View>
      )}

      {/* Componente que agrupa todos os modais da tela - FORM */}
      <BuyListForm
        // MODAL DA CÂMERA
        showCameraModal={showCameraModal}                             // Mostra a câmera
        onScanSuccess={handleScanSuccess}                             // Sucesso na leitura
        onCloseCameraModal={handleCloseCamera}                        // Fecha a câmera

        // MODAL DE BUSCA POR NOME
        showNameSearchModal={showNameSearchModal}                     // Mostra a busca
        productQuery={productQuery}                                   // Texto da busca
        foundProducts={foundProducts}                                 // Produtos encontrados
        isSearching={isSearching}                                     // Status de carregamento
        onSearchProductQueryChange={handleSearchProductByName}        // Atualiza busca
        onSelectProductToBuy={handleSelectProductToBuy}               // Seleciona o produto
        onCloseNameSearchModal={() => setShowNameSearchModal(false)}  // Fecha a busca

        // MODAL DE ATUALIZAR QUANTIDADE
        editingQuantityItem={editingQuantityItem}                     // Item em edição
        newQuantityText={newQuantityText}                             // Texto da quantidade
        onChangeQuantityText={setNewQuantityText}                     // Atualiza quantidade
        onSaveQuantity={handleSaveQuantity}                           // Salva a alteração
        onCloseQuantityModal={() => setEditingQuantityItem(null)}     // Fecha a edição
      />
    </View>
  );
}