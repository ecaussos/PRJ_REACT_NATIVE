// src/features/config/config.form.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from './config.styles';
import { ConfigActionsProps, ConfigFilterProps, ConfigTypeOption } from './config.types';

// Função para apresentar os botões de ação - Criar/Pesquisar/Limpar
export function ConfigActions({
  onOpenCreateModal,  // Abre o modal de cadastro
  onOpenSearchModal,  // Abre o modal de busca
  onClearSearch,      // Limpa a busca atual
  hasActiveSearch,    // Indica se há busca ativa (true/false)
}: ConfigActionsProps){
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
          // Chama a função ao ser pressionado
          onPress={onClearSearch}
          // Desabilita o filtro aplicado na pesquisa
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
export function ConfigSearchModal({
  visible,            // Mostra modal de busca
  searchText,         // texto digitado para a busca    
  onChangeSearchText, // Função para atualizar o texto da pesquisa
  onClose,            // Função para fechar o modal
  onCancel,           // Função para Cancelar o modal
}: ConfigFilterProps){
  // -------- MONTAGEM DOS BOTÕES NA TELA -------- //
  return (
    // Identificação e configuração do modal
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Título do modal */}
          <Text style={styles.modalTitle}>Buscar Configuração</Text>
          {/* Caixa de texto para busca na lista */}
          <TextInput
            style={styles.input}
            placeholder="Digite para filtrar em tempo real..."
            placeholderTextColor="#888"
            // Obtém o texto digitado
            value={searchText}
            // Chama a função ao digitar texto
            onChangeText={onChangeSearchText}
            // Foca automaticamente a caixa de texto 
            autoFocus
          />
          {/* Botões de ação */}
          <View style={styles.modalButtonsRow}>
            {/* Botão aplica a busca na lista dos registros cadastrados */}
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
              // Fecha o modal e limpa a pesquisa ao clicar no botão
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

// Função para apresentar o item na lista e os botões de ações Editar/Excluir
export function ConfigItem({
  configTypeLabel, // Descrição do tipo (JOIN)
  tpConfig,        // ID do Tipo
  urlConfig,       // URL/Host
  portConfig,      // Porta
  userConfig,      // Usuário
  stSsl,           // Status SSL (1/0)
  stConfig,        // Status Ativo/Inativo (1/0)
  onEdit,          // Função disparada ao clicar no botão de editar
  onDelete,        // Função disparada ao clicar no botão de excluir
}: {
  configTypeLabel?: string;     // Descrição do tipo obtido pelo JOIN (opcional)
  tpConfig: number;             // ID do Tipo de Configuração
  urlConfig?: string | null;    // URL ou Host da configuração
  portConfig?: number | null;   // Porta de conexão
  userConfig?: string | null;   // Usuário de autenticação
  stSsl: number;                // Status do SSL (1 = Ativo, 0 = Inativo)
  stConfig: number;             // Status da Configuração (1 = Ativo, 0 = Inativo)
  onEdit: () => void;           // Função disparada ao clicar no botão de editar
  onDelete: () => void;         // Função disparada ao clicar no botão de excluir
}){
  // -------- MONTAGEM DOS BOTÕES NA TELA -------- //
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        {/* Apresenta a lista com os dados dos registros cadastrados */}
        <View style={styles.textContainer}>
          {/* Campos */}
          <Text style={styles.itemList}>{configTypeLabel ? configTypeLabel : `Tipo ID: ${tpConfig}`}</Text>
          <Text style={styles.details}>URL: {urlConfig || 'Não informada'}</Text>
          <Text style={styles.details}>Porta: {portConfig ? portConfig : 'Padrão'} | Usuário: {userConfig || 'N/A'}</Text>
          <Text style={styles.details}>SSL: {stSsl === 1 ? 'Ativo' : 'Inativo'} | Status: {stConfig === 1 ? 'Ativo' : 'Inativo'}</Text>
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

// Função padrão do Formulário - Modal de Cadastro/Edição com Regras Dinâmicas
export default function ConfigForm({
  showModal,     // Estado que exibe ou oculta o modal
  tpConfig,      // ID do tipo selecionado
  setTpConfig,   // Função para atualizar o tipo
  urlConfig,     // Valor do campo URL
  setUrlConfig,  // Função para atualizar a URL
  portConfig,    // Valor do campo Porta
  setPortConfig, // Função para atualizar a Porta
  userConfig,    // Valor do campo Usuário
  setUserConfig, // Função para atualizar o Usuário
  keyConfig,     // Valor do campo Chave/Senha
  setKeyConfig,  // Função para atualizar a Chave/Senha
  stSsl,         // Status do SSL (1/0)
  setStSsl,      // Função para atualizar o status do SSL
  stConfig,      // Status da Configuração (1/0)
  setStConfig,   // Função para atualizar o status da Configuração
  configTypes,   // Lista de opções de tipos para seleção
  isEditing,     // Controla o título do modal (Novo ou Editar)
  onSave,        // Ação de salvar o formulário
  onCancel,      // Ação de cancelar/fechar o formulário
}: {
  showModal: boolean;                     // Controla a exibição visual do modal
  tpConfig: string;                       // Identificador do tipo em formato texto
  setTpConfig: (text: string) => void;    // Callback de atualização do tipo selecionado
  urlConfig: string;                      // Texto do campo URL/Host
  setUrlConfig: (text: string) => void;   // Callback de atualização da URL
  portConfig: string;                     // Texto do campo Porta
  setPortConfig: (text: string) => void;  // Callback de atualização da Porta
  userConfig: string;                     // Texto do campo Usuário
  setUserConfig: (text: string) => void;  // Callback de atualização do Usuário
  keyConfig: string;                      // Texto do campo Chave/Senha
  setKeyConfig: (text: string) => void;   // Callback de atualização da Chave/Senha
  stSsl: number;                          // Status do SSL
  setStSsl: (val: number) => void;        // Callback de atualização do SSL
  stConfig: number;                       // Status da Configuração
  setStConfig: (val: number) => void;     // Callback de atualização do Status
  configTypes?: ConfigTypeOption[];       // Coleção opcional com a lista de tipos
  isEditing: boolean;                     // Flag indicadora do modo de edição
  onSave: () => void;                     // Executado ao confirmar o salvamento
  onCancel: () => void;                   // Executado ao descartar ou fechar
}){
  // Estado local para controlar a visibilidade do texto da Chave/Senha
  const [showKeyText, setShowKeyText] = useState(false);
  // Converte o tipo selecionado para número para validar nas regras de exibição
  const selectedType = Number(tpConfig);
  /* -------- REGRAS DE VISIBILIDADE DOS CAMPOS --------
     Supondo os IDs no banco (tb_tp_config):
     1 = BD Local
     2 = BD Cloud
     3 = API Cosmos
     4 = API Gemini
  ---------------------------------------------------- */
  const isTypeSelected = selectedType > 0;
  // Regra BD Local (1): Apenas Status da Configuração
  const isBdLocal = selectedType === 1;
  // Regra BD Cloud (2): Exibe todos os campos
  const isBdCloud = selectedType === 2;
  // Regra API Cosmos (3): Exibe URL/Host e Chave de Acesso
  const isApiCosmos = selectedType === 3;
  // Regra API Gemini (4): Exibe apenas Chave de Acesso
  const isApiGemini = selectedType === 4;
// Mapeamento dinâmico de permissão por campo
  const showUrl = isBdCloud || isApiCosmos;                 // Exibe o campo de URL para BD Cloud e API Cosmos
  const showPort = isBdCloud;                               // Exibe o campo de Porta apenas para BD Cloud
  const showUser = isBdCloud;                               // Exibe o campo de Usuário apenas para BD Cloud
  const showKey = isBdCloud || isApiCosmos || isApiGemini;  // Exibe a Chave para BD Cloud, Cosmos e Gemini
  const showSsl = isBdCloud;                                // Exibe a opção de SSL apenas para BD Cloud
  const showStConfig = isTypeSelected;                      // O status da configuração aparece para qualquer tipo selecionado

  // -------- MONTAGEM DO FORMULÁRIO NA TELA -------- //
  return (
    <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Título dinâmico conforme a ação */}
          <Text style={styles.modalTitle}>
            {isEditing ? 'Editar Configuração' : 'Cadastrar Configuração'}
          </Text>
          {/* Seletor de Tipo de Configuração (Sempre visível) */}
          <View style={styles.pickerContainer}> 
            <Picker
              selectedValue={tpConfig}                              // Valor do tipo atualmente selecionado
              onValueChange={(itemValue) => setTpConfig(itemValue)} // Atualiza o estado ao selecionar um novo tipo
            >
              <Picker.Item label="Selecione o Tipo... *" value="" />
              {configTypes?.map((type: ConfigTypeOption) => ( // Mapeia e renderiza a lista de tipos de configuração
                <Picker.Item 
                  key={type.id_tp_config}                     // Chave única do elemento na lista
                  label={type.ds_tp_config}                   // Rótulo amigável exibido no seletor
                  value={String(type.id_tp_config)}           // Valor numérico convertido para string
                />
              ))}
            </Picker>
          </View>
          {/* Campo para preenchimento da URL / Host (BD Cloud e API Cosmos) */}
          {showUrl && (                   // Renderiza condicionalmente se showUrl for verdadeiro
            <TextInput
              style={styles.input}        // Estilização padrão do campo de texto
              placeholder="URL / Host *"  // Texto de instrução/placeholder
              value={urlConfig}           // Valor do estado associado à URL
              onChangeText={setUrlConfig} // Função de atualização do estado da URL
              autoCapitalize="none"       // Desabilita a capitalização automática de letras
            />
          )}
          {/* Campo para preenchimento da Porta (Apenas BD Cloud) */}
          {showPort && (                      // Renderiza condicionalmente se showPort for verdadeiro
            <TextInput
              style={styles.input}            // Estilização padrão do campo de texto
              placeholder="Porta (ex: 8080)"  // Texto de instrução/placeholder
              value={portConfig}              // Valor do estado associado à porta
              onChangeText={setPortConfig}    // Função de atualização do estado da porta
              keyboardType="numeric"          // Exibe teclado numérico para o usuário
            />
          )}
          {/* Campo para preenchimento do Usuário (Apenas BD Cloud) */}
          {showUser && (                    // Renderiza condicionalmente se showUser for verdadeiro
            <TextInput
              style={styles.input}          // Estilização padrão do campo de texto
              placeholder="Usuário"         // Texto de instrução/placeholder
              value={userConfig}            // Valor do estado associado ao usuário
              onChangeText={setUserConfig}  // Função de atualização do estado do usuário
              autoCapitalize="none"         // Desabilita a capitalização automática
            />
          )}
          {/* Campo para preenchimento da Chave / Senha (BD Cloud, API Cosmos e API Gemini) */}
          {showKey && (                                               // Renderiza condicionalmente se showKey for verdadeiro
            <View style={styles.passwordContainer}>                 
              <TextInput
                style={[styles.input, { flex: 1, paddingRight: 45 }]} // Campo flexível com espaço à direita para o ícone
                placeholder="Chave de Acesso / Senha *"               // Texto de instrução/placeholder
                value={keyConfig}                                     // Valor do estado associado à chave
                onChangeText={setKeyConfig}                           // Função de atualização do estado da chave
                secureTextEntry={!showKeyText}                        // Oculta/exibe os caracteres com base no estado da visibilidade
                autoCapitalize="none"                                 // Desabilita a capitalização automática
              />
              <TouchableOpacity
                style={styles.eyeIcon}                          // Posiciona o botão do ícone de visualização
                onPress={() => setShowKeyText((prev) => !prev)} // Alterna o estado de exibição do texto da senha
                activeOpacity={0.7}                             // Nível de opacidade ao clicar no botão
              >
                <MaterialCommunityIcons
                  name={showKeyText ? 'eye-off-outline' : 'eye-outline'}  // Define o ícone conforme visibilidade da senha
                  size={22}                                               // Tamanho do ícone em pixels
                  color="#666"                                          // Cor do ícone
                />
              </TouchableOpacity>
            </View>
          )}
          {/* Caixa de Seleção para Status do SSL (Apenas BD Cloud) */}
          {showSsl && (                                             // Renderiza condicionalmente se showSsl for verdadeiro
             // Container estilizado do seletor
            <View style={styles.pickerContainer}>                  
              <Picker
                selectedValue={stSsl}                                       // Valor atual do status do SSL (0 ou 1)
                onValueChange={(itemValue) => setStSsl(Number(itemValue))}  // Atualiza o estado convertendo para número
              >
                {/* Opções para o SSL - 0 desativado - 1 ativado */}              
                <Picker.Item label="SSL Inativo" value={0} />
                <Picker.Item label="SSL Ativo" value={1} />
              </Picker>
            </View>
          )}
          {/* Caixa de Seleção para Status da Configuração (Exibido se algum tipo for selecionado) */}
          {showStConfig && (                                        // Renderiza condicionalmente se showStConfig for verdadeiro
            // Container estilizado do seletor
            <View style={styles.pickerContainer}>                   
              <Picker
                selectedValue={stConfig}                                      // Valor atual do status da configuração (0 ou 1)
                onValueChange={(itemValue) => setStConfig(Number(itemValue))} // Atualiza o estado convertendo para número
              >
                {/* Opções para o SSL - 0 desativado - 1 ativado */}   
                <Picker.Item label="Configuração Ativa" value={1} />
                <Picker.Item label="Configuração Inativa" value={0} />
              </Picker>
            </View>
          )}
          {/* Botões de Salvar e Cancelar */}
          <View style={styles.modalButtonsRow}>
            {/* Botão salva a edição realizada no registro */}
            <TouchableOpacity
              style={[styles.modalRowButton, { backgroundColor: '#34C759' }]}
             // Dispara a função de gravação/salvamento 
              onPress={onSave}
            >
              {/* Título do botão */}
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>

            {/* Botão cancela a edição realizada no registro */}
            <TouchableOpacity
              style={[styles.modalRowButton, { backgroundColor: '#FF3B30' }]}
              // Dispara a função de cancelamento/fechamento
              onPress={onCancel}
            >
              {/* Título do botão */}
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}