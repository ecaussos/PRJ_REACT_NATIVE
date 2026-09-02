// src/features/supplier/supplier.screen.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SupplierForm from './supplier.form';
import { useSupplierViewModel } from './supplier.hook';
import { styles } from './supplier.styles';

export default function SupplierScreen() {
  // Obtém o estado atual (lista de grupos, carregamento, erros) e a função dispatch do hook ViewModel
  const { state, dispatch } = useSupplierViewModel();  
  // Estados locais para controlar os inputs do formulário, o texto de pesquisa e o ID em modo de edição
  const [name, setName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  // Reseta os campos do formulário e limpa o ID de edição, 
  const resetForm = () => {
    setEditingId(null);
    setName('');
  };
  // Valida e submete o formulário, disparando uma intenção (CREATE ou UPDATE) para o ViewModel
  const handleSave = () => {
    // Validação para garantir que o nome do grupo não está vazio
    if (!name.trim()) {
      Alert.alert('Atenção', 'Preencha o nome do fornecedor!');
      return;
    }
    // Se houver um ID em edição, despacha a ação de atualização
    if (editingId !== null) {
      dispatch({
        type: 'UPDATE',
        payload: {
          id_supplier: editingId,
          nm_supplier: name.trim(),
        },
      });
      Alert.alert('Sucesso', 'Fornecedor atualizado com sucesso!');
    // Caso contrário, despacha a ação de criação de um novo registro
    } else {
      dispatch({
        type: 'CREATE',
        payload: {
          nm_supplier: name.trim(),
        },
      });
      Alert.alert('Sucesso', 'Fornecedor cadastrado com sucesso!');
    }
    resetForm();
  };
  // Filtra a lista de grupos em tempo real com base no texto digitado na pesquisa
  const filteredSuppliers = state.suppliers.filter(item => 
    item.nm_supplier.toLowerCase().includes(searchText.toLowerCase())
  );
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
        name={name}
        setName={setName}
        editingId={editingId}
        onSave={handleSave}
        onCancel={resetForm}
      />
      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Fornecedores Cadastrados</Text>
      {/* Caixa de texto para pesquisar grupos na lista */}      
      <TextInput
        style={styles.input}
        placeholder="Pesquisar Fornecedor"
        value={searchText}
        onChangeText={setSearchText}
      />
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        data={filteredSuppliers}
        keyExtractor={(item) => String(item.id_supplier)}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
              {/* Apresenta a lista com campos*/}
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.ItemList}>{item.nm_supplier}</Text>
              </View>
              {/* Container dos botões de ação */}
              <View style={styles.actionButtonsContainer}>
                {/* Botão de Edição: preenche o formulário com os dados do item selecionado */}
                <TouchableOpacity 
                  style={[styles.iconButton, styles.editButton]} 
                  onPress={() => {
                    setEditingId(item.id_supplier);
                    setName(item.nm_supplier);
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
                      `Deseja realmente excluir o fornecedor "${item.nm_supplier}"?`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { 
                          text: 'Excluir', 
                          style: 'destructive',
                          onPress: () => dispatch({ type: 'DELETE', payload: item.id_supplier }) 
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
          !state.loading ? <Text style={styles.emptyText}>Nenhum fornecedor cadastrado.</Text> : null
        }
      />
    </View>
  );
}