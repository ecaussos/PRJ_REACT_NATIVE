// src/features/buy/buy.form.tsx
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SupplierOption } from '../../data/entities/buyHist.entity';
import { styles } from './buyHist.styles';
import { BuyHistActionsProps, BuyHistFilterProps } from './buyHist.types';

// Função para apresentar os botões de ação - Criar/Pesquisar/Limpar
export function BuyHistActions({
  onOpenDeleteModal,  // Abre o modal de cadastro
  onOpenFilterModal,  // Abre o modal de filtro
  onClearSearch,      // Limpa a busca atual
  hasActiveSearch,    // Indica se há busca ativa (true/false)
}: BuyHistActionsProps){
  // -------- MONTAGEM DOS BOTÕES NA TELA -------- //
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Ações da Compra</Text>
      {/* Botões de ação */}
      <View style={styles.buttonsRow}>
        {/* Botão Adicionar - Abre modal com as opções para adicionar produto */}
        <TouchableOpacity style={styles.actionButton} onPress={onOpenDeleteModal}>
          {/* texto do botão */}
          <Text style={styles.buttonText}>🗑 Excluir </Text>
        </TouchableOpacity>
        {/* Botão Pesquisar - Abre modal Busca */}
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#6c757d' }]} onPress={onOpenFilterModal}>
          {/* texto do botão */}
          <Text style={styles.buttonText}>🔍 Filtrar</Text>
        </TouchableOpacity>
        {/* Botão Limpar - Limpa filtro da lista */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: hasActiveSearch ? '#FF9500' : '#D1D1D6' }]}
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
export function BuyHistFilterModal({
  visible,                  // Estado que controla a visibilidade do modal
  // Filtrar por nome
  searchText,               // Texto atual exibido no campo de entrada de busca
  onChangeSearchText,       // Função chamada ao digitar um texto na caixa de pesquisa
   // Filtrar por Grupo
  selectedGroup,            // Nome do grupo atualmente selecionado para filtragem
  onChangeSelectedGroup,    // Função para atualizar o grupo selecionado
  availableGroups,          // Lista com os nomes dos grupos disponíveis para seleção
  // Filtrar por fornecedor
  selectedSupplier,         //
  onChangeSelectedSupplier, //
  availableSupplier,        //
  // Filtro por data
  selectedDate,             //
  onChangeSelectedDate,     //
  availableDates,           //
  // Ações
  onClose,                  // Ação para fehcar o modal
  onCancel,                 // Ação de limpar e fechar o modal
}: BuyHistFilterProps){
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
            placeholder="Digite o nome do produto"
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
          {/* FILTRA POR FORNECEDOR - Listbox com os fornecedores */}
          <View style={styles.pickerContainer}>
            <Picker
              // Define o fornecedor selecionado no componente
              selectedValue={selectedSupplier}
              // Atualiza o fornecedor selecionado ao alterar o item
              onValueChange={(itemValue: string) => onChangeSelectedSupplier(itemValue)}
            >
              {/* Opção padrão para exibir todos os fornecedores */}
              <Picker.Item label="Busca por Fornecedor" value="" />
              {/* Percorre a lista de fornecedores disponíveis */}
              {availableSupplier.map((supplier) => (
                // Apresenta cada fornecedor como opção da seleção
                <Picker.Item key={supplier} label={supplier} value={supplier} />
              ))}
            </Picker>
          </View>
          {/* FILTRAR POR DATA - Listbox com a data*/}
          <View style={styles.pickerContainer}>
            <Picker
              // Define a data selecionado no componente
              selectedValue={selectedDate}
              // Atualiza a data selecionado ao alterar o item
              onValueChange={(itemValue) => onChangeSelectedDate(itemValue)}
            >
              {/* Opção padrão para exibir todas as datas */}
              <Picker.Item label="Busca por Datas" value="" />
              {/* Percorre a lista de fornecedores disponíveis */}
              {availableDates.map((date) => (
                // Apresenta cada data como opção da seleção
                <Picker.Item key={date} label={date} value={date} 
                />
              ))}
            </Picker>
          </View>
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
export function BuyHistItemModal({ 
  name,         // Nome que será exibido
  groupName,    // Nome do grupo do produto
  groupId,      // ID do Grupo do produto
  quantity,     // Quantidade
  price,        // Preço
  supplierName, // Nome do fornecedor
  supplierId,   // ID do fornecedor
  dateBuy,      // Data da compra
  onEdit,       // Função disparada ao clicar no botão de editar
  onDelete,     // Função disparada ao clicar no botão de excluir
}: {
  name?: string;                // Nome do produto que será exibido
  groupName?: string;           // Nome do grupo obtido pelo JOIN (opcional)
  groupId?: number | string;    // ID do grupo do produto (opcional)
  quantity: number;             // Quantidade de produto que será exibido
  price?: number | null;        // Valor do produto que será exibido
  supplierName?: string;        // Nome do grupo obtido pelo JOIN (opcional)
  supplierId?: number | string; // ID do grupo do produto (opcional)
  dateBuy?: string              // Data da compra
  onEdit: () => void;           // Função disparada ao clicar no botão de editar
  onDelete: () => void;         // Função disparada ao clicar no botão de excluir
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
          <Text style={styles.details}>Fornecedor: {supplierName ? supplierName : (supplierId ? `ID: ${supplierId}` : 'Sem fornecedor')}</Text>
          <Text style={styles.details}>Data: {dateBuy ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(dateBuy)) : ''}</Text>
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
export function BuyHistEditModal({
  showModal,      // Estado que exibe ou oculta o modal
  name,           // Valor do campo nome
  quantity,       // Valor do campo quantidade
  setQuantity,    // Função parar atualizar a quantidade
  price,          // Valor do preço
  setPrice,       // Função para atualizar o preço
  supplierId,     // Valor do campo fornecedor 
  setSupplierId,  // Função para atualizar o fornecedor
  suppliers = [], // Lista os fornecedores cadastrados
  onSave,         // Ação de salvar o formulário
  onCancel,       // Ação de cancelar/fechar o formulário
}: {
  showModal: boolean;                     // Controla a exibição visual do modal
  name: string;                           // Texto do campo nome do produto
  quantity: string;                       // Texto do campo quantidade
  setQuantity: (text: string) => void;    // Callback de atualização do nome
  price: string;                          // Texto do campo preço
  setPrice: (text: string) => void;       // Callback de atualização do preço
  supplierId: string;                     // Valor do campo fornecedor 
  setSupplierId: (text: string) => void;  // Função para atualizar o fornecedor
  suppliers?: SupplierOption[];           // Coleção opcional com a lista de grupos
  isEditing?: boolean;                    // Flag indicadora do modo de edição
  onSave: () => void;                     // Executado ao confirmar o salvamento
  onCancel: () => void;                   // Executado ao descartar ou fechar
  
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
            style={styles.editModalInput}
            placeholder="Quantidade"    // Texto de dica quando vazio
            value={quantity}            // Valor exibido no campo
            onChangeText={setQuantity}  // Atualiza o estado ao digitar
            keyboardType="numeric"      // Exibe o teclado numérico
            selectTextOnFocus           // Seleciona todo o texto ao focar
            autoFocus                   // Foca no campo ao abrir o modal
          />
          {/* Caixa de texto para editar o valor */}
          <Text style={styles.inputLabel}>Valor unitário R$: </Text>
          <TextInput
            style={styles.editModalInput}
            placeholder="0.00"          // Texto de dica com formato padrão
            value={price}               // Valor exibido no campo
            onChangeText={setPrice}     // Atualiza o estado ao digitar
            keyboardType="decimal-pad"  // Exibe o teclado numérico com ponto/vírgula
            selectTextOnFocus           // Seleciona todo o texto ao focar
          />
          {/* Caixa de Seleção (Dropdown) para vínculo com Grupo de Produtos */}
          <Text style={styles.inputLabel}>Fornecedor:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={String(supplierId ?? '')}                           // Define a opção selecionada convertida em texto
              onValueChange={(itemValue) => setSupplierId(String(itemValue))}    // Atualiza o estado ao selecionar uma opção
            >
              {/*Opção padrão quando nenhum fornecedor está selecionado*/}
              <Picker.Item label="Selecione o Fornecedor... *" value="" />
              {suppliers?.map((supplier: SupplierOption) => (                    // Mapeia a lista de fornecedores para criar as opções
                <Picker.Item
                  key={supplier.id_supplier}                                     // Chave única de identificação do item na lista
                  label={supplier.nm_supplier}                                   // Nome do fornecedor exibido na interface
                  value={String(supplier.id_supplier)}                           // Valor associado convertido em texto para correspondência
                />
              ))}
            </Picker>
          </View>
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

// Apresenta o valor total dos registros na lista - Verifica se a lista tem registro
export function BuyHistFooterTotal({
  totalItem,                // Quantidade total de itens
  totalValue,             // Valor total da compra
}: {
  totalItem: number;      // Tipo numérico para os itens
  totalValue: number;     // Tipo numérico para o valor
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
    </View>
  );
}