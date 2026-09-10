// src/features/product/product.screen.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ProductForm from './product.form';
import { useProductViewModel } from './product.hook';
import { styles } from './product.styles';

export default function ProductScreen() {
  // Obtém o estado atual, estado do formulário e as funções de ação do ViewModel
  const { state, form, saveProduct, dispatch } = useProductViewModel(); 

  // Dispacha a intenção adequada dependendo do modo (Criação ou Edição)
  const handleSave = async () => {
    try {
      const message = await saveProduct();
      // Gerar alerta informativo  
      Alert.alert('Sucesso', message);
    } catch (error: any) {
      // Captura o erro disparado pela verificação e exibe no popup de aviso
      Alert.alert('Aviso', error.message || 'Erro ao salvar o produto.');
    }
  };

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
        name={form.name}
        setName={form.setName}
        barcode={form.barcode}
        setBarcode={form.setBarcode}
        groupId={form.groupId}
        setGroupId={form.setGroupId}
        editingId={form.editingId}
        groups={state.groups}
        onSave={handleSave}
        onCancel={form.resetForm}
      />
      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Produtos Cadastrados</Text>
      {/* Caixa de texto para pesquisar grupos na lista */}      
      <TextInput
        style={styles.input}
        placeholder="Pesquisar Produto ou Código GTIN"
        value={form.searchText}
        onChangeText={form.setSearchText}
      />
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        data={state.products}
        keyExtractor={(item) => String(item.id_product)}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
              {/* Apresenta a lista com campos */}
              <View style={styles.textContainer}>
                <Text style={styles.itemList}>{item.nm_product}</Text>
                <Text style={styles.details}>GTIN: {item.cd_product_gtin || 'Não informado'}</Text>
                <Text style={styles.details}>Grupo: {item.nm_group || `ID: ${item.id_group}`}</Text>
              </View>
              {/* Container dos botões de ação */}
              <View style={styles.actionButtonsContainer}>
                {/* Botão de Edição: preenche o formulário com os dados do item selecionado */}
                <TouchableOpacity 
                  style={[styles.iconButton, styles.editButton]} 
                  onPress={() => form.startEditing(
                      Number(item.id_product),
                      item.nm_product,
                      item.cd_product_gtin || '',
                      String(item.id_group)
                    )}
                >
                  {/* Ícone botão de Edição */}
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
                        { 
                          text: 'Excluir', 
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await dispatch({ type: 'DELETE', payload: Number(item.id_product) });
                              Alert.alert('Sucesso', 'Produto excluído com sucesso!');
                            } catch (error: any) {
                              Alert.alert('Erro', error.message || 'Erro ao excluir o produto.');
                            }
                          } 
                        }
                      ]
                    );
                  }}
                >
                  {/* Ícone botão de Exclusão */}
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