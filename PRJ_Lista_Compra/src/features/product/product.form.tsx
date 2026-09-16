// src/features/product/product.form.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GroupOption } from '../../data/entities/product.entity';
import { styles } from './product.styles';
import { ProductActionsProps, ProductFilterProps } from './product.types';

// Função para apresentar os botões de ação - Criar/Pesquisar/Limpar
export function ProductActions({
  onOpenCreateModal,  // Abre o modal de cadastro
  onOpenSearchModal,  // Abre o modal de busca
  onClearSearch,      // Limpa a busca atual
  hasActiveSearch,    // Indica se há busca ativa (true/false)
}: ProductActionsProps){
  // -------- MONTAGEM DOS BOTÕES NA TELA -------- //
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Ações</Text>
      {/* Botões de ação */}
      <View style={styles.buttonsRow}>
        {/* Botão Cadastrar - Abre modal cadastrar */}
        <TouchableOpacity style={styles.actionButtonAdd} onPress={onOpenCreateModal}>
          {/* texto do botão */}
          <Text style={styles.buttonText}>📂 Cadastrar</Text>
        </TouchableOpacity>
        {/* Botão Pesquisar - Abre modal Busca */}
        <TouchableOpacity style={[styles.actionButtonAdd, { backgroundColor: '#6c757d' }]} onPress={onOpenSearchModal}>
          {/* texto do botão */}
          <Text style={styles.buttonText}>🔍 Filtrar</Text>
        </TouchableOpacity>
        {/* Botão Limpar - Limpa filtro da lista */}
        <TouchableOpacity
          style={[styles.actionButtonAdd, { backgroundColor: hasActiveSearch ? '#FF9500' : '#D1D1D6' }]}
          // Chama a função sao ser precionado
          onPress={onClearSearch}
          // Desabilita o filtro aplicar na pequisa
          disabled={!hasActiveSearch}
        >
          {/* texto do botão */}
          <Text style={styles.buttonText}>🧹 Limpar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Função para apresentar o modal Filtro/Busca
export function ProductSearchModal({
  visible,            // Mostra modal de busca
  searchText,         // texto digitado para a busca    
  onChangeSearchText, // Função para atualizar o texto da pesquisa
  onClose,            // Função para fechar o modal
  onCancel,           // Função para Cancelar o modal
}: ProductFilterProps){
  // -------- MONTAGEM DOS BOTÕES NA TELA -------- //
  return (
    // Identifica e configuração do modal
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Titulo do modal */}
          <Text style={styles.modalTitle}>Buscar Produto</Text>
          {/* Caixa de texto para busca na lista */}
          <TextInput
            style={styles.input}
            placeholder="Digite para filtrar em tempo real..."
            placeholderTextColor="#888"
            // Obtem o texto digitado
            value={searchText}
            // Chama a função ao digitar texto
            onChangeText={onChangeSearchText}
            // Foca automaticamente a caixa de texto 
            autoFocus
          />
          {/* Botões de ação */}
          <View style={styles.modalButtonsRow}>
            {/* Botão aplica a busca na lista dos registros cadastrado */}
            <TouchableOpacity
              style={[styles.modalRowButton, { backgroundColor: '#007AFF' }]}
              // Fecha o modal co clicar no botão
              onPress={onClose}
            >
              {/* texto do botão */}
              <Text style={styles.buttonText}>Aplicar</Text>
            </TouchableOpacity>
            {/* Botão cancelar a ação */}
            <TouchableOpacity
              style={[styles.modalRowButton, { backgroundColor: '#FF3B30' }]}
              // Fecha o modal co clicar no botão
              onPress={onCancel}
            >
             {/* texto do botão */}
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Função para apresentar os item na lista e os botões de ações Editar/Excluir
export function ProductItem({
  name,         // Nome que será exibido
  barcode,      // Código que será exibido
  groupName,    // Grupo que será exibido
  groupId,      // Id do Grupo
  onEdit,       // Função disparada ao clicar no botão de editar
  onDelete,     // Função disparada ao clicar no botão de excluir
}: {
  name: string;                // Nome do produto que será exibido
  barcode?: string | null;     // Código GTIN/barras do produto (opcional)
  groupName?: string;          // Nome do grupo obtido pelo JOIN (opcional)
  groupId?: number | string;   // ID do grupo do produto (opcional)
  onEdit: () => void;          // Função disparada ao clicar no botão de editar
  onDelete: () => void;        // Função disparada ao clicar no botão de excluir
}){
  // -------- MONTAGEM DOS BOTÕES NA TELA -------- //
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        {/* Apresenta a lista com os dados dos registros cadastrados */}
        <View style={styles.textContainer}>
          {/* Campos */}
          <Text style={styles.itemList}>{name}</Text>
          <Text style={styles.details}>GTIN: {barcode || 'Não informado'}</Text>
          <Text style={styles.details}>Grupo: {groupName ? groupName : (groupId ? `ID: ${groupId}` : 'Sem grupo')}</Text>
        </View>
        {/* Botões de ação */}
        <View style={styles.actionButtonsContainer}>
          {/* Botão de Edição: preenche o formulário com os dados do item selecionado */}
          <TouchableOpacity style={[styles.iconButton, styles.editButton]} onPress={onEdit}>
            {/* Ícone botão de Edição */}
            <MaterialCommunityIcons name="pencil-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          {/* Botão de Exclusão: exibe alerta de confirmação antes de remover os registros */}
          <TouchableOpacity style={[styles.iconButton, styles.deleteButton]} onPress={onDelete}>
            {/* Ícone botão de Exclusão */}
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Função padrão do Formulário - Modal de Cadastro/Edição
export default function ProductForm({
  showModal,   // Estado que exibe ou oculta o modal
  name,        // Valor do campo nome
  setName,     // Função para atualizar o nome
  barcode,     // Valor do campo código de barras / GTIN
  setBarcode,  // Função para atualizar o código de barras
  groupId,     // ID do grupo selecionado no formulário
  groups,      // Lista de opções de grupos para seleção
  setGroupId,  // Função para atualizar o grupo selecionado
  isEditing,   // Controla o título do modal (Novo ou Editar)
  onSave,      // Ação de salvar o formulário
  onCancel,    // Ação de cancelar/fechar o formulário
}: {
  showModal: boolean;                 // Controla a exibição visual do modal
  name: string;                       // Texto do campo nome do produto
  setName: (text: string) => void;    // Callback de atualização do nome
  barcode: string;                    // Texto do campo código de barras GTIN
  setBarcode: (text: string) => void; // Callback de atualização do código de barras
  groupId: string;                    // Identificador do grupo em formato texto
  setGroupId: (text: string) => void; // Callback de atualização do grupo selecionado
  groups?: GroupOption[];             // Coleção opcional com a lista de grupos
  isEditing: boolean;                 // Flag indicadora do modo de edição
  onSave: () => void;                 // Executado ao confirmar o salvamento
  onCancel: () => void;               // Executado ao descartar ou fechar
}){
  // -------- MONTAGEM DO FORMULÁRIO NA TELA -------- //
  return (
    <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Título dinâmico conforme a ação */}
          <Text style={styles.modalTitle}>
            {isEditing ? 'Editar' : 'Cadastrar'}
          </Text>

          {/* Campo para preenchimento do Nome do Produto */}
          <TextInput
            style={styles.input}
            placeholder="Nome do Produto *"
            value={name}
            onChangeText={setName}
          />

          {/* Campo para preenchimento do Código de Barras (Opcional) */}
          <TextInput
            style={styles.input}
            placeholder="Código de Barras (GTIN) *"
            value={barcode}
            onChangeText={setBarcode}
            keyboardType="numeric"
          />

          {/* Caixa de Seleção (Dropdown) para vínculo com Grupo de Produtos */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={groupId}
              onValueChange={(itemValue) => setGroupId(itemValue)}
            >
              <Picker.Item label="Selecione o Grupo... *" value="" />
              {groups?.map((group: GroupOption) => (
                <Picker.Item 
                  key={group.id_group} 
                  label={group.nm_group} 
                  value={String(group.id_group)} 
                />
              ))}
            </Picker>
          </View>
          {/* Botões de Salvar e Cancelar */}
          <View style={styles.modalButtonsRow}>
            {/* Botão salva a edição realizada no registro*/}
            <TouchableOpacity
              style={[styles.modalRowButton, { backgroundColor: '#34C759' }]}
              // Salva e fecha o modal co clicar no botão
              onPress={onSave}
            >
              {/* texto do botão */}
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            {/* Botão cancela a edição realizada no registro*/}
            <TouchableOpacity
              style={[styles.modalRowButton, { backgroundColor: '#FF3B30' }]}
              // Cancela e fecha o modal co clicar no botão
              onPress={onCancel}
            >
              {/* texto do botão */} 
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}