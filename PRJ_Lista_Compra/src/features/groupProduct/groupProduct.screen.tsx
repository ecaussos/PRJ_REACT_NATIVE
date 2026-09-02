// src/features/groupProduct/groupProduct.screen.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GroupProductForm from './groupProduct.form';
import { useGroupProductViewModel } from './groupProduct.hook';
import { styles } from './groupProduct.styles';

export default function GroupProductScreen() {
  // Obtém o estado atual (lista de grupos, carregamento, erros) e a função dispatch do hook ViewModel
  const { state, dispatch } = useGroupProductViewModel();
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
      Alert.alert('Atenção', 'Preencha o nome do grupo!');
      return;
    }
    // Se houver um ID em edição, despacha a ação de atualização
    if (editingId !== null) {
      dispatch({
        type: 'UPDATE',
        payload: {
          id_group: editingId,
          nm_group: name.trim(),
        },
      });
      Alert.alert('Sucesso', 'Grupo atualizado com sucesso!');
    // Caso contrário, despacha a ação de criação de um novo registro
    } else {
      dispatch({
        type: 'CREATE',
        payload: {
          nm_group: name.trim(),
        },
      });
      Alert.alert('Sucesso', 'Grupo cadastrado com sucesso!');
    }
    resetForm();
  };
  // Filtra a lista de grupos em tempo real com base no texto digitado na pesquisa
  const filteredGroups = state.groups.filter(item => 
    item.nm_group.toLowerCase().includes(searchText.toLowerCase())
  );
  // MONTAGEM DA TELA 
  return (
    <View style={styles.container}>
      {/* Título principal da tela */}
      <Text style={styles.title}>Gerenciar Grupos</Text>
      {/* Indicador visual de carregamento (Spinner) */}
      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {/* Exibição de mensagens de erro, caso ocorram */}
      {state.error && <Text style={styles.error}>{state.error}</Text>}
      {/* Componente do Form para cadastro e edição */}
      <GroupProductForm
        name={name}
        setName={setName}
        editingId={editingId}
        onSave={handleSave}
        onCancel={resetForm}
      />
      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Grupos Cadastrados</Text>
      {/* Caixa de texto para pesquisar grupos na lista */}
      <TextInput
        style={styles.input}
        placeholder="Pesquisar Grupo"
        value={searchText}
        onChangeText={setSearchText}
      />
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => String(item.id_group)}
        renderItem={({ item }) => {
          // Trava de segurança: IDs de 1 a 7 são padrões do sistema e não podem ser editados/excluídos
          const isSystemDefault = item.id_group <= 7;
          return (
            <View style={styles.itemCard}>
              <View style={styles.itemInfo}>
                {/* Apresenta a lista com campos*/}
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.ItemList}>{item.nm_group}</Text>
                </View>
                {/* Container dos botões de ação*/}
                <View style={styles.actionButtonsContainer}>
                  {/* Verifica se registro é padrão "trava de segurança"*/}
                  {isSystemDefault ? (
                    // Se for padrão exibe um ícone de cadeado para os registros "Bloqueado"
                    <View style={[styles.iconButton]}>
                      <Text style={{ fontSize: 16 }}>🔒</Text>
                    </View>
                  ) : (
                    // Se não for exibe botões interativos de editar e excluir
                    <>
                      {/* Botão de Edição: preenche o formulário com os dados do item selecionado */}
                      <TouchableOpacity 
                        style={[styles.iconButton, styles.editButton]} 
                        onPress={() => {
                          setEditingId(Number(item.id_group));
                          setName(item.nm_group);
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
                            `Deseja realmente excluir o grupo "${item.nm_group}"?`,
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              { 
                                text: 'Excluir', 
                                style: 'destructive',
                                onPress: () => dispatch({ type: 'DELETE', payload: Number(item.id_group) }) 
                              }
                            ]
                          );
                        }}
                      >
                        {/* Ícone botão de Exclusão*/}
                        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>
          );
        }}
        // Mensagem exibida caso a lista filtrada esteja vazia
        ListEmptyComponent={
          !state.loading ? <Text style={styles.emptyText}>Nenhum grupo cadastrado.</Text> : null
        }
      />
    </View>
  );
}