// src/features/buy/buy.form.tsx
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BarcodeScannerScreen from '../scannerBarcode/scannerBarcode.screen';
import { styles } from './buy.styles';
import { BuyActionsProps, BuyFilterProps, ProductSearchResult, SupplierEntity } from './buy.types';

// Função para apresentar os botões de ação - Criar/Pesquisar/Limpar
export function BuyActions({
  onOpenCreateModal,  // Abre o modal de cadastro
  onOpenFilterModal,  // Abre o modal de filtro
  onClearSearch,      // Limpa a busca atual
  hasActiveSearch,    // Indica se há busca ativa (true/false)
}: BuyActionsProps){
  // -------- MONTAGEM DOS BOTÕES NA TELA -------- //
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Ações da Compra</Text>
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
export function BuyFilterModal({
  visible,                  // Estado que controla a visibilidade do modal
  // Filtrar por nome
  searchText,               // Texto atual exibido no campo de entrada de busca
  onChangeSearchText,       // Função chamada ao digitar um texto na caixa de pesquisa
  // Filtrar sem preço
  onlyWithoutPrice,         // Estado do filtro para itens sem valor/zero
  onToggleOnlyWithoutPrice, // Função para alternar o estado do filtro de preço
  // Filtrar por Grupo
  selectedGroup,            // Nome do grupo atualmente selecionado para filtragem
  onChangeSelectedGroup,    // Função para atualizar o grupo selecionado
  availableGroups,          // Lista com os nomes dos grupos disponíveis para seleção
  // Ações
  onClose,                  // Ação para fechar o modal
  onCancel,                 // Ação de limpar e fechar o modal
}: BuyFilterProps){
  // -------- MONTAGEM DA TELA -------- //
  return (
    // Identifica e configuração do modal
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Titulo do modal */}
          <Text style={styles.modalTitle}>Filtrar Lista de Compras</Text>

          {/* FILTRA PRODUTO POR NOME - Caixa de texto para busca na lista */}
          <TextInput
            style={styles.input}
            placeholder="Buscar por nome..."
            placeholderTextColor="#888"
            // Obtem o texto digitado
            value={searchText}
            // Chama a função ao digitar texto
            onChangeText={onChangeSearchText}
            // Foca automaticamente a caixa de texto 
            autoFocus
          />
          {/* FILTRA PRODUTO POR GRUPO - Listbox com os grupos dos produtor  */}
          <View style={styles.pickerContainer}>
            <Picker
              // Define o grupo selecionado no componente
              selectedValue={selectedGroup}
              // Atualiza o grupo selecionado ao alterar o item
              onValueChange={(itemValue: string) => onChangeSelectedGroup(itemValue)}
            >
              {/* Opção padrão para exibir todos os grupos */}
              <Picker.Item label="Busca por Grupo" value="" />
              {/* Percorre a lista de grupos disponíveis */}
              {availableGroups.map((group) => (
                // Apresenta cada grupo como opção da seleção
                <Picker.Item key={group} label={group} value={group} />
              ))}
            </Picker>
          </View>
          {/* FILTRA PRODUTO SEM VALOR - Checkbox para ativar o filtro preço = 0 */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            activeOpacity={0.7}                 // Define a opacidade do botão ao ser pressionado 
            onPress={onToggleOnlyWithoutPrice}  // Ação disparada ao clicar para alternar o filtro
          >
            {/* Renderiza a caixa com estilo selecionado condicional */}
            <View style={[styles.checkbox, onlyWithoutPrice && styles.checkboxSelected]}>
              {/* Exibe o o check de verificação se o filtro estiver ativo */} 
              {onlyWithoutPrice && <Text style={styles.checkmark}>✓</Text>}
            </View>
            {/* Exibe o texto identificação da função */}
            <Text style={styles.checkboxLabel}>Exibir produtos sem valor</Text>
          </TouchableOpacity>
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
export function BuyItemModal({ 
  name,         // Nome que será exibido
  groupName,    // Grupo que será exibido
  groupId,      // Id do Grupo
  quantity,     // Quantidade
  price,        // Preço
  onEdit,       // Função disparada ao clicar no botão de editar
  onDelete,     // Função disparada ao clicar no botão de excluir
}: {
  name?: string;              // Nome do produto que será exibido
  groupName?: string;         // Nome do grupo obtido pelo JOIN (opcional)
  groupId?: number | string;  // ID do grupo do produto (opcional)
  quantity: number;           // Quantidade de produto que será exibido
  price?: number | null;      // Valor do produto que será exibido
  onEdit: () => void;         // Função disparada ao clicar no botão de editar
  onDelete: () => void;       // Função disparada ao clicar no botão de excluir
}){
    const formattedPrice =
      price !== undefined && price !== null
        ? `R$ ${Number(price).toFixed(2)}`
        : 'Não informado';

    // -------- MONTAGEM DOS BOTÕES NA TELA -------- //
    return (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        {/* Apresenta a lista com os dados dos registros cadastrados */}
        <View style={styles.textContainer}>
          {/* Campos */}
          <Text style={styles.itemList}>{name || 'Produto sem nome'}</Text>
          <Text style={styles.details}>Grupo: {groupName ? groupName : (groupId ? `ID: ${groupId}` : 'Sem grupo')}</Text>
          <Text style={styles.details}>Quantidade: {quantity ?? 'Não informado'}</Text>
          <Text style={styles.details}>Valor: {formattedPrice}</Text>
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
export function BuyEditModal({
  showModal,   // Estado que exibe ou oculta o modal
  name,        // Valor do campo nome
  quantity,    // Valor da Quantidade
  setQuantity, // Função parar atualizar a quantidade
  price,       // Valor do preço
  setPrice,    // Função para atualizar o preço
  onSave,      // Ação de salvar o formulário
  onCancel,    // Ação de cancelar/fechar o formulário
}: {
  showModal: boolean;                  // Controla a exibição visual do modal
  name: string;                        // Texto do campo nome do produto
  quantity: string;                    // Texto do campo quantidade
  setQuantity: (text: string) => void; // Callback de atualização do nome
  price: string;                       // Texto do campo preço
  setPrice: (text: string) => void;    // Callback de atualização do preço
  isEditing?: boolean;                 // Flag indicadora do modo de edição
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
          <Text style={styles.modalTitle}>Editar Produto</Text>
          <Text style={styles.editModalProductName}>
            {name}
          </Text>
            {/* Caixa de texto para editar a quantidade */}
            <Text style={styles.inputLabel}>Quantidade:</Text>
            <TextInput
              style={styles.editModalInput} // Aplica a estilização visual do campo de entrada
              placeholder="Quantidade"      // Exibe o texto de dica caso o campo esteja vazio
              value={quantity}              // Associa o valor atual da quantidade ao estado
              onChangeText={setQuantity}    // Atualiza o estado da quantidade ao digitar
              keyboardType="numeric"        // Exibe o teclado numérico para facilitar a digitação
              selectTextOnFocus             // Seleciona todo o texto do campo ao receber o foco
              autoFocus                     // Foca o campo e abre o teclado automaticamente
            />
          {/* Caixa de texto para editar o valor */}
          <Text style={styles.inputLabel}>Valor unitário R$: </Text>
          <TextInput
            style={styles.editModalInput} // Aplica a estilização visual do campo de entrada
            placeholder="0.00"            // Exibe o formato padrão de valor caso o campo esteja vazio
            value={price}                 // Associa o valor atual do preço ao estado
            onChangeText={setPrice}       // Atualiza o estado do preço ao digitar
            keyboardType="decimal-pad"    // Exibe o teclado numérico com ponto/vírgula decimal
            selectTextOnFocus             // Seleciona todo o texto do campo ao receber o foco
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
export function BuyAddItemModal({
  showModal,                // Estado que exibe ou oculta o modal
  onOpenBuyList,            // Função abre modal da lista de compra
  onOpenCamera,             // Função abre modal adicionar produto código de barra
  onOpenSearch,             // Função abre modal adicionar produto por nome
  onClose,                  // Função executada ao fechar o modal
}: {
  showModal: boolean;       // Controla a exibição do modal
  onOpenBuyList?: () => void; // Controla a exibição da lista de compras
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
            {/* Botão para adicionar produto da lista de compra */}            
            {onOpenBuyList && (
              <TouchableOpacity style={styles.actionButtonCamera} onPress={onOpenBuyList}>
                {/* texto do botão */}
                <Text style={styles.buttonText}>📋 Lista</Text>
              </TouchableOpacity>
            )}
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
export function BuyCameraModal({
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
export function BuySearchModal({
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
            style={styles.input}                      // Aplica a estilização visual do campo de busca
            placeholder="Digite o nome do produto..." // Exibe a mensagem de instrução quando o campo está vazio
            placeholderTextColor="#888"             // Define a cor cinza para o texto de instrução
            value={searchText}                        // Vincula o termo de busca atual ao estado
            onChangeText={onChangeSearchText}         // Atualiza o estado da busca ao digitar o texto
            autoFocus                                 // Foca o campo e abre o teclado automaticamente
          />
          {/* Lista (FlatList) dos registros pesquisados */}
          <FlatList
            // Fonte de dados que será obtida para montar a lista
            data={searchResults}
            // Define ID para identificar registros na lista
            keyExtractor={(item) => String(item.id_product)}
            // Permite o clique imediato mesmo com o teclado ativo
            keyboardShouldPersistTaps="handled"
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

// Apresenta o valor total dos registros na lista - Verifica se a lista tem registro
export function BuyFooterTotal({
totalItem,                // Quantidade total de itens
  totalValue,             // Valor total da compra
  onClearBuy,             // Função para limpar a compra
  onFinalize,             // Função para finalizar a compra
}: {
  totalItem: number;      // Tipo numérico para os itens
  totalValue: number;     // Tipo numérico para o valor
  onClearBuy: () => void; // Tipo função sem retorno
  onFinalize: () => void; // Tipo função sem retorno
}) {
  // -------- MONTAGEM DA TELA -------- //
  return (
    <View style={styles.footer}>
      {/* Contentor dos Textos lado a lado */}
      <View style={styles.textRow}>
        {/* Texto quantidade total de itens */}
        <Text style={styles.totalfooter}>Quantidade Total: {totalItem}</Text>
        {/* Texto valor total da compra */}
        <Text style={styles.totalfooter}>Valor Total: R$ {totalValue.toFixed(2)}</Text>
      </View>

      {/* Contentor dos Botões lado a lado */}
      <View style={styles.buttonsFooter}>
       {/* Botão de Finalizar (Direita) */}
        <TouchableOpacity 
          style={styles.actionButtonFooter} 
          onPress={onFinalize}
        >
          {/* Texto do botão */}
          <Text style={styles.buttonText}>Finalizar Compra</Text>
        </TouchableOpacity>
        {/* Botão de Excluir (Esquerda) */}
        <TouchableOpacity 
          style={styles.buttonFooterClear} 
          onPress={onClearBuy}
        >
          {/* Texto do botão */}
          <Text style={styles.buttonText}>Excluir Compra</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// -------- MODAL FINALIZA A COMPRA - SELEÇÃO FORNCEDOR -------- //
export function FinishBuyModal({
  visible,                                                     // Controla a visibilidade do modal na tela
  suppliers,                                                   // Lista de fornecedores/mercados cadastrados
  onSelectSupplier,                                            // Callback disparado ao selecionar um item
  onClose,                                                     // Callback para fechar/cancelar o modal
}: {
  visible: boolean;                                            // Flag booleana de exibição do modal
  suppliers: SupplierEntity[];                                 // Array com a entidade dos fornecedores
  onSelectSupplier: (supplier: SupplierEntity) => void;        // Tipagem da função de seleção do fornecedor
  onClose: () => void;                                         // Tipagem da função de encerramento do modal
}) {
// -------- MONTAGEM DA TELA -------- //
  return (
    // Componente nativo de janela sobreposta (Modal)
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Camada semitransparente externa de fundo */}
      <View style={styles.modalOverlay}>
        {/* Container principal (Card branco) */}
        <View style={styles.modalContent}>
          {/* Título do modal */}
          <Text style={styles.modalTitle}>Selecione o Mercado</Text>
          {/* Wrapper para conter a FlatList com limite de altura */}
            <FlatList
              data={suppliers}                                 // Fonte de dados para a renderização
              keyExtractor={item => String(item.id_supplier)}  // Chave única para cada item da lista
              keyboardShouldPersistTaps="handled"              // Permite o clique imediato mesmo com o teclado ativo
              renderItem={({ item }) => (                      // Função de renderização de cada linha
                <TouchableOpacity
                  style={styles.modalOptionButton}             // Estilo da opção clicável
                  onPress={() => onSelectSupplier(item)}       // Seleciona o fornecedor e executa a ação
                >
                  {/* Nome do fornecedor */}
                  <Text style={styles.modalOptionText}>{item.nm_supplier}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={ // Exibido quando a lista de fornecedores estiver vazia
                <Text style={styles.emptyText}>Nenhum fornecedor encontrado.</Text>
              }
            />
          {/* Botão de cancelamento e fechamento */}
          <TouchableOpacity style={styles.actionButtonList} onPress={onClose}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}