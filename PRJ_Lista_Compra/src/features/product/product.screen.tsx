// src/features/product/product.screen.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ProductForm from './product.form';
import { useProductViewModel } from './product.hook';
import { styles } from './product.styles';

export default function ProductScreen() {
  // Obtém o estado atual (lista de grupos, carregamento, erros) e a função dispatch do hook ViewModel
  const { state, dispatch } = useProductViewModel();  
  // Estados locais para controlar os inputs do formulário, o texto de pesquisa e o ID em modo de edição
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [groupId, setGroupId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  // Reseta os campos do formulário e limpa o ID de edição, 
  const resetForm = () => {
    setName('');
    setBarcode('');
    setGroupId('');
    setEditingId(null);
  };
  // Valida e submete o formulário, disparando uma intenção (CREATE ou UPDATE) para o ViewModel
  const handleSave = () => {
    if (!name.trim() || !groupId) {
      Alert.alert('Atenção', 'Preencha o nome e selecione um grupo!');
      return;
    }
    // Se houver um ID em edição, despacha a ação de atualização
    if (editingId !== null) {
      dispatch({
        type: 'UPDATE',
        payload: {
          id_product: editingId,
          nm_product: name,
          id_group: Number(groupId),
          cd_product_gtin: barcode.trim(),
        },
      });
      Alert.alert('Sucesso', 'Produto atualizado com sucesso!');
    // Caso contrário, despacha a ação de criação de um novo registro
    } else {
      dispatch({
        type: 'CREATE',
        payload: {
          nm_product: name,
          id_group: Number(groupId),
          cd_product_gtin: barcode.trim(),
        },
      });
      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
    }
    resetForm();
  };
  // Filtra a lista em tempo real com base no texto digitado na pesquisa
  const filteredProducts = state.products.filter(item => 
    item.nm_product.toLowerCase().includes(searchText.toLowerCase()) ||
    (item.cd_product_gtin && item.cd_product_gtin.includes(searchText))
  );
  // MONTAGEM DA TELA
  return (
    <View style={styles.container}>
      {/* Título principal da tela */}
      <Text style={styles.title}>Gerenciar Produtos</Text>
      {/* Indicador visual de carregamento (Spinner) */}
      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {/* Exibição de mensagens de erro, caso ocorram */}
      {state.error && <Text style={styles.error}>{state.error}</Text>}
      {/* Componente isolado do formulário de cadastro e edição */}
        <ProductForm
        name={name}
        setName={setName}
        barcode={barcode}
        setBarcode={setBarcode}
        groupId={groupId}
        setGroupId={setGroupId}
        editingId={editingId}
        groups={state.groups}
        onSave={handleSave}
        onCancel={resetForm}
      />
      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Produtos Cadastrados</Text>
      {/* Caixa de texto para pesquisar na lista */}
      <TextInput
        style={styles.input}
        placeholder="Pesquisar Produto"
        value={searchText}
        onChangeText={setSearchText}
      />
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => String(item.id_product)}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
              {/* Apresenta a lista com campos*/}
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.ItemList}>{item.nm_product}</Text>
                <Text style={styles.details}>GTIN: {item.cd_product_gtin || 'Não informado'}</Text>
                <Text style={styles.details}>Grupo: {item.nm_group || `ID: ${item.id_group}`}</Text>
              </View>
              {/* Container dos botões de ação*/}
              <View style={styles.actionButtonsContainer}>
                {/* Botão de Edição: preenche o formulário com os dados do item selecionado */}
                <TouchableOpacity 
                  style={[styles.iconButton, styles.editButton]} 
                  onPress={() => {
                    setEditingId(Number(item.id_product));
                    setName(item.nm_product);
                    setBarcode(item.cd_product_gtin || '');
                    setGroupId(String(item.id_group));
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
                      'Excluir',
                      `Deseja realmente excluir o produto "${item.nm_product}"?`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Excluir', 
                          style: 'destructive',
                          onPress: () => dispatch({ type: 'DELETE', payload: Number(item.id_product) }) 
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
    </View>
  );
}