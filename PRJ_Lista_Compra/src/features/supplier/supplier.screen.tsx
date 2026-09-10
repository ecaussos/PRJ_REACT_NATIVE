// src/features/supplier/supplier.screen.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SupplierForm from './supplier.form';
import { useSupplierViewModel } from './supplier.hook';
import { styles } from './supplier.styles';

export default function SupplierScreen() {
  // Obtém o estado atual, estado do formulário e as funções de ação do ViewModel
  const { state, form, saveSupplier, dispatch } = useSupplierViewModel();  

  // Valida e submete o formulário, disparando uma intenção (CREATE ou UPDATE) para o ViewModel
  const handleSave = async () => {
    try {
      const message = await saveSupplier();
      // Gerar alerta informativo  
      Alert.alert('Sucesso', message);
    } catch (error: any) {
      // Captura o erro disparado pela verificação e exibe no popup de aviso
      Alert.alert('Aviso', error.message || 'Erro ao salvar o fornecedor.');
    }
  };

  // MONTAGEM DA TELA
  return (
    <View style={styles.container}>
      {/* Título principal da tela */}
      <Text style={styles.title}>Gerenciar Fornecedores</Text>
      {/* Indicador visual de carregamento (Spinner) */}
      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {/* Exibição de mensagens de erro, caso ocorram */}
      {state.error && <Text style={styles.error}>{state.error}</Text>}

      {/* Componente isolado do formulário de cadastro e edição */}
      <SupplierForm
        name={form.name}
        setName={form.setName}
        isEditing={form.isEditing}
        onSave={handleSave}
        onCancel={form.resetForm}
      />
      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Fornecedores Cadastrados</Text>
      {/* Caixa de texto para pesquisar grupos na lista */}
      <TextInput
        style={styles.input}
        placeholder="Pesquisar Fornecedor"
        value={form.searchText}
        onChangeText={form.setSearchText}
      />
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        data={state.suppliers}
        keyExtractor={(item) => String(item.id_supplier)}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
              {/* Apresenta a lista com campos */}
              <View style={styles.textContainer}>
                <Text style={styles.itemList}>{item.nm_supplier}</Text>
              </View>
              {/* Container dos botões de ação */}
              <View style={styles.actionButtonsContainer}>
                {/* Botão de Edição: preenche o formulário com os dados do item selecionado */}
                <TouchableOpacity 
                  style={[styles.iconButton, styles.editButton]} 
                  onPress={() => form.startEditing(item.id_supplier, item.nm_supplier)}
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
                      `Deseja realmente excluir o fornecedor "${item.nm_supplier}"?`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { 
                          text: 'Excluir', 
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await dispatch({ type: 'DELETE', payload: item.id_supplier });
                              Alert.alert('Sucesso', 'Fornecedor excluído com sucesso!');
                            } catch (error: any) {
                              Alert.alert('Erro', error.message || 'Erro ao excluir o fornecedor.');
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
          !state.loading ? <Text style={styles.emptyText}>Nenhum fornecedor cadastrado.</Text> : null
        }
      />
    </View>
  );
}