// src/features/groupProduct/groupProduct.screen.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GroupProductForm from './groupProduct.form';
import { useGroupProductViewModel } from './groupProduct.hook';
import { styles } from './groupProduct.styles';

export default function GroupProductScreen() {
  // Obtém o estado atual, estado do formulário e as funções do hook ViewModel
  const { state, form, saveGroupProduct, dispatch } = useGroupProductViewModel();

  // Valida e submete o formulário, disparando uma intenção (CREATE ou UPDATE) para o ViewModel
  const handleSave = async () => {
    try {
      const message = await saveGroupProduct();
      // Gerar alerta informativo  
      Alert.alert('Sucesso', message);
    } catch (error: any) {
      // Captura o erro disparado pela verificação e exibe no popup de aviso
      Alert.alert('Aviso', error.message || 'Erro ao salvar Grupo.');
    }
  };

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
        name={form.name}
        setName={form.setName}
        isEditing={form.isEditing}
        onSave={handleSave}
        onCancel={form.resetForm}
      />
      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Grupos Cadastrados</Text>
      {/* Caixa de texto para pesquisar grupos na lista */}
      <TextInput
        style={styles.input}
        placeholder="Pesquisar Grupo"
        value={form.searchText}
        onChangeText={form.setSearchText}
      />
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        data={state.groups}
        keyExtractor={(item) => String(item.id_group)}
        renderItem={({ item }) => {
          // Trava de segurança: IDs de 1 a 7 são padrões do sistema e não podem ser editados/excluídos
          const isSystemDefault = item.id_group <= 7;
          return (
            <View style={styles.itemCard}>
              <View style={styles.itemInfo}>
                {/* Apresenta a lista com campos */}
                <View style={styles.textContainer}>
                  <Text style={styles.itemList}>{item.nm_group}</Text>
                </View>
                {/* Container dos botões de ação */}
                <View style={styles.actionButtonsContainer}>
                  {/* Verifica se registro é padrão "trava de segurança" */}
                  {isSystemDefault ? (
                    // Se for padrão exibe um ícone de cadeado para os registros "Bloqueado"
                    <View style={styles.iconButton}>
                      <Text style={{ fontSize: 16 }}>🔒</Text>
                    </View>
                  ) : (
                    // Se não for exibe botões interativos de editar e excluir
                    <>
                      {/* Botão de Edição: preenche o formulário com os dados do item selecionado */}
                      <TouchableOpacity 
                        style={[styles.iconButton, styles.editButton]} 
                        onPress={() => form.startEditing(item.id_group, item.nm_group)}
                      >
                        {/* Ícone botão de Edição */}
                        <MaterialCommunityIcons name="pencil-outline" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      {/* Botão de Exclusão: exibe alerta de confirmação antes de remover o registro */}
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
                                onPress: async () => {
                                  try {
                                    await dispatch({ type: 'DELETE', payload: item.id_group });
                                    Alert.alert('Sucesso', 'Grupo excluído com sucesso!');
                                  } catch (error: any) {
                                    Alert.alert('Erro', error.message || 'Erro ao excluir o grupo.');
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