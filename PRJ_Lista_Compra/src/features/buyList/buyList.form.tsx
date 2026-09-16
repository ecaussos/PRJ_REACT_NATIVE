// src/features/buyList/buyList.form.tsx
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BarcodeScannerScreen from '../scannerBarcode/scannerBarcode.screen';
import { styles } from './buyList.styles';
import { BuylistActionsProps, BuyListFilterProps, ProductSearchResult } from './buyList.types';

// -------- INTERFACES DOS COMPONENTES DA TELA -------- //

// Função para apresentar os botões de ação - Criar/Pesquisar/Limpar
export function BuyListActions({
  onOpenCreateModal,  // Abre o modal de cadastro
  onOpenFilterModal,  // Abre o modal de filtro
  onClearSearch,      // Limpa a busca atual
  hasActiveSearch,    // Indica se há busca ativa (true/false)
}: BuylistActionsProps){
  // -------- MONTAGEM DOS BOTÕES NA TELA -------- //
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Ações Lista de Compra</Text>
      {/* Botões de ação */}
      <View style={styles.buttonsRow}>
        {/* Botão Adicionar - Abre modal com as opções para adicionar produto */}
        <TouchableOpacity style={styles.actionButtonAdd} onPress={onOpenCreateModal}>
          {/* texto do botão */}
          <Text style={styles.buttonText}>📂 Adicionar</Text>
        </TouchableOpacity>
        {/* Botão Pesquisar - Abre modal Busca */}
        <TouchableOpacity style={[styles.actionButtonAdd, { backgroundColor: '#6c757d' }]} onPress={onOpenFilterModal}>
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
export function BuyListFilterModal({
  visible,                  // Estado que controla a visibilidade do modal
  searchText,               // Texto atual exibido no campo de entrada de busca
  onChangeSearchText,       // Função chamada ao digitar um texto na caixa de pesquisa
  onClose,                  // Ação para fehcar o modal
  onCancel,                 // Ação de limpar e fechar o modal
}: BuyListFilterProps){
  // -------- MONTAGEM DA TELA -------- //
  return (
    // Identifica e configuração do modal
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Titulo do modal */}
          <Text style={styles.modalTitle}>Filtrar Lista de Compras</Text>
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
              // Fecha o modal ao clicar no botão
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
export function BuyListItemModal({ 
  name,         // Nome que será exibido
  groupName,    // Grupo que será exibido
  groupId,      // Id do Grupo
  quantity,     // Quantidade
  onEdit,       // Função disparada ao clicar no botão de editar
  onDelete,     // Função disparada ao clicar no botão de excluir
}: {
  name?: string;              // Nome do produto que será exibido
  groupName?: string;         // Nome do grupo obtido pelo JOIN (opcional)
  groupId?: number | string;  // ID do grupo do produto (opcional)
  quantity: number;           // Quantidade de produto que será exibido
  onEdit: () => void;         // Função disparada ao clicar no botão de editar
  onDelete: () => void;       // Função disparada ao clicar no botão de excluir
}){
    // -------- MONTAGEM DOS BOTÕES NA TELA -------- //
    return (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        {/* Apresenta a lista com os dados dos registros cadastrados */}
        <View style={styles.textContainer}>
          {/* Campos */}
          <Text style={styles.itemList}>{name}</Text>
          <Text style={styles.details}>Grupo: {groupName ? groupName : (groupId ? `ID: ${groupId}` : 'Sem grupo')}</Text>
          <Text style={styles.details}>Quantidade: {quantity ?? 'Não informado'}</Text>
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

// Função para apresentar o modal para a edição - Quantidade
export function BuyListEditModal({
  showModal,   // Estado que exibe ou oculta o modal
  name,        // Valor do campo nome
  quantity,    // Valor da Quantidade
  setQuantity, // Função parar atualizar a quantidade
  onSave,      // Ação de salvar o formulário
  onCancel,    // Ação de cancelar/fechar o formulário
}: {
  showModal: boolean;                  // Controla a exibição visual do modal
  name: string;                        // Texto do campo nome do produto
  quantity: string;                    // Texto do campo quantidade
  setQuantity: (text: string) => void; // Callback de atualização do nome
  isEditing: boolean;                  // Flag indicadora do modo de edição
  onSave: () => void;                  // Executado ao confirmar o salvamento
  onCancel: () => void;                // Executado ao descartar ou fechar
}) {
  // -------- MONTAGEM DO FORMULÁRIO NA TELA -------- //
  return (
    // Identifica e configuração do modal
    <Modal visible={showModal} animationType="fade" transparent={true} onRequestClose={onCancel}>
      {/* Camada semitransparente externa (fundo da tela inteira) */}
      <View style={styles.modalOverlay}>
        {/* Card branco interno centralizado */}
        <View style={styles.modalContent}>
          {/* Titulo do modal */}
          <Text style={styles.modalTitle}>Editar Quantidade</Text>
          <Text style={styles.editModalProductName}>
            {name}
          </Text>
          {/* Caixa de texto para editar a quantidade*/}
          <TextInput
            style={styles.editModalInput}
            placeholder="Nova quantidade"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            selectTextOnFocus
            autoFocus
          />
          {/* Botões de ação */}
          <View style={styles.modalButtonsRow}>
            {/* Botão salva a edição realizada no registro*/}
            <TouchableOpacity
              style={[styles.modalRowButton, styles.saveButtonColor]}
              // Salva e fecha o modal co clicar no botão
              onPress={onSave}
            >
              {/* texto do botão */}
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            {/* Botão cancela a edição realizada no registro*/}
            <TouchableOpacity
              style={[styles.modalRowButton, styles.cancelButtonColor]}
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

// -------- MODAL SELEÇÃO INICIAL (CÂMERA OU NOME) -------- //
export function BuyListAddItemModal({
  showModal,                // Estado que exibe ou oculta o modal
  onOpenCamera,             // Função abre modal adicionar produto código de barra
  onOpenSearch,             // Função abre modal adicionar produto por nome
  onClose,                  // Função executada ao fechar o modal
}: {
  showModal: boolean;       // Controla a exibição do modal
  onOpenCamera: () => void; // controla a exibição do modal código de barra
  onOpenSearch: () => void; // controla a exibição do modal por nome
  onClose: () => void;      // Controla a exibição do modal
}) {
  // -------- MONTAGEM DA TELA -------- //
  return (
    <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Titulo do modal */}
          <Text style={styles.modalTitle}>Adicionar Produto</Text>
          {/* Botões de ações */}
          <View style={styles.buttonsRow}>
            {/* Botão para adicionar produto Código de Barra */}
            <TouchableOpacity style={styles.actionButtonCamera} onPress={onOpenCamera}>
              {/* texto do botão */}
              <Text style={styles.buttonText}>📷 Código</Text>
            </TouchableOpacity>
            {/* Botão para adicionar produto por Nome */}
            <TouchableOpacity style={styles.actionButtonName} onPress={onOpenSearch}>
              {/* texto do botão */}
              <Text style={styles.buttonText}>🔍 Nome</Text>
            </TouchableOpacity>
          </View>
          {/* Botão para cancelar/fechar modal */}
          <TouchableOpacity style={styles.fullWidthCancelButton} onPress={onClose}>
            {/* texto do botão */}
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// -------- MODAL DE CÂMERA / SCANNER -------- //
export function BuyListCameraModal({
  showModal,                                // Estado que exibe ou oculta o modal
  onScanSuccess,                            // Função para adicionar produto por código de barra
  onClose,                                  // Função executada ao fechar o modal
}: {
  showModal: boolean;                       // Controla a exibição visual do modal
  onScanSuccess: (barcode: string) => void; // Chama a função que recebe o código de barras lido
  onClose: () => void;                      // Controla a exibição do modal
}) {
  // -------- MONTAGEM DA TELA -------- //
  return (
    <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { height: '60%', padding: 0, overflow: 'hidden' }]}>
          {/* Chama o screen código de barra (Câmera) e excuta as funções*/}
          <BarcodeScannerScreen onScanSuccess={onScanSuccess} onClose={onClose} />
        </View>
      </View>
    </Modal>
  );
}

// -------- MODAL DE PESQUISA POR NOME -------- //
export function BuyListSearchModal({
  showModal,                                                // Estado que exibe ou oculta o modal
  searchText,                                               // Texto atual exibido no campo de entrada de busca
  searchResults,                                            // Lista contendo os resultados encontrados na pesquisa 
  onChangeSearchText,                                       // Função ao digitar um texto na caixa de pesquisa
  onSelectProduct,                                          // Função ao selecionar um produto do resultado
  onBack,                                                   // Função executada ao clicar no botão voltar
  onCancel,                                                 // Ação para limpar os campos e fechar o modal
}: {
  showModal: boolean;                                       // Controla a exibição visual do modal
  searchText: string;                                       // Tipo do termo utilizado na caixa de pesquisa
  searchResults: ProductSearchResult[];                     // Coleção obtida ao realizar a consulta dos registros
  onChangeSearchText: (text: string) => void;               // Função ao alterar o o texto na caixa de pesquisa 
  onSelectProduct: (product: ProductSearchResult) => void;  // Função ao selecionar um item na coleção 
  onBack: () => void;                                       // Função para limpar o formulário e retorna ao modal de opções
  onCancel: () => void;                                     // Função para limpar e fechar os modais Por Nome/Opções  
}) {
  // -------- MONTAGEM DA TELA -------- //
  return (
    <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
          {/* Titulo do modal */}
          <Text style={styles.modalTitle}>Buscar Produto por Nome</Text>
          {/* Caixa de texto para pesquisar o produto*/}
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do produto..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={onChangeSearchText}
            autoFocus
          />
          {/* Lista (FlatList) dos registros pesquisados */}
          <FlatList
            // Fonte de dados que será obtida para montar a lista
            data={searchResults}
            // Define ID para identificar registros na lista
            keyExtractor={(item) => String(item.id_product)}
            // Define o stilo 
            style={{ width: '100%', marginVertical: 10 }}
            // Monta os itens na tela
            renderItem={({ item }) => (
              // Apresenta dados dos registros como botões de seleção
              <TouchableOpacity
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#EEE',
                }}
                // Chama a função a selecionar um registro
                onPress={() => onSelectProduct(item)}
              >

                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                  {/* Pega a descrição no nome */}
                  {item.nm_product}
                </Text>
                  {/* Pega a descrição do gtupo */}
                <Text style={{ fontSize: 12, color: '#666' }}>
                  Grupo: {item.nm_group || 'Sem grupo'}
                </Text>
              </TouchableOpacity>
            )}
            // Mensagem exibida caso a lista filtrada esteja vazia
            ListEmptyComponent={
              // Limpa o campo de pesquisa e valida se é maior que 0 (Tem informação digitada)
              searchText.trim().length > 0 ? (
                // Verdadeiro: Gera mensagem informativa
                <Text style={{ textAlign: 'center', color: '#888', marginVertical: 15 }}>
                  Nenhum produto encontrado.
                </Text>
              ) : (
                // Falso: Gera mensagem informativa
                <Text style={{ textAlign: 'center', color: '#888', marginVertical: 15 }}>
                  Digite algo para buscar...
                </Text>
              )
            }
          />
          {/* Botões de ação */}
          <View style={styles.modalButtonsRow}>
            {/* Botão para voltar ao modal de opções*/}
            <TouchableOpacity
              style={[styles.modalRowButton, { backgroundColor: '#8E8E93' }]}
              // Chama a função ao precionar o botão
              onPress={onBack}
            >
              {/* Texto do botão */}
              <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
            {/* Botão para cancelar a operação - limpa e fecha os modais */}
            <TouchableOpacity
              style={[styles.modalRowButton, { backgroundColor: '#FF3B30' }]}
              // Chama a função ao precionar o botão
              onPress={onCancel}
            >
              {/* Texto do botão */}
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}