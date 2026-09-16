// src/features/supplier/supplier.form.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from './supplier.styles';
import { SupplierActionsProps, SupplierFilterProps } from './supplier.types';

// Função para apresentar os botões de ação - Criar/Pesquisar/Limpar
export function SupplierActions({
  onOpenCreateModal,                                                  // Abre o modal de cadastro
  onOpenSearchModal,                                                  // Abre o modal de busca
  onClearSearch,                                                      // Limpa a busca atual
  hasActiveSearch,                                                    // Indica se há busca ativa (true/false)
}: SupplierActionsProps): React.JSX.Element {
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
export function SupplierSearchModal({
  visible,                                                            // Mostra modal de busca
  searchText,                                                         // texto digitado para a busca    
  onChangeSearchText,                                                 // Função para atualizar o texto da pesquisa
  onClose,                                                            // Função para fechar o modal
  onCancel,                                                           // Função para Cancelar o modal
}: SupplierFilterProps){
  // -------- MONTAGEM DOS BOTÕES NA TELA -------- //
  return (
    // Identifica e configuração do modal
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Titulo do modal */}
          <Text style={styles.modalTitle}>Buscar Fornecedor</Text>
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
export function SupplierItem({
  name,     // Nome que será exibido
  onEdit,   // Função disparada ao clicar no botão de editar
  onDelete, // Função disparada ao clicar no botão de excluir
}: {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
}): React.JSX.Element {
  // -------- MONTAGEM DOS BOTÕES NA TELA -------- //
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        {/* Apresenta a lista com os dados dos registros cadastrados */}
        <View style={styles.textContainer}>
          {/* Campos */}
          <Text style={styles.itemList}>{name}</Text>
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
export default function SupplierForm({
  showModal,  // Estado que exibe ou oculta o modal
  name,       // Valor do campo nome
  setName,    // Função para atualizar o nome
  isEditing,  // Controla o título (Novo ou Editar)
  onSave,     // Ação de salvar o formulário
  onCancel,   // Ação de cancelar/fechar o formulário
}: {
  showModal: boolean;
  name: string;
  setName: (text: string) => void;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
}): React.JSX.Element {
  // -------- MONTAGEM DO FORMULÁRIO NA TELA -------- //
  return (
    <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Título dinâmico conforme a ação */}
          <Text style={styles.modalTitle}>
            {isEditing ? 'Editar' : 'Cadastrar'}
          </Text>

          {/* Campo para digitação do nome */}
          <TextInput
            style={styles.input}
            placeholder="Nome do Fornecedor"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            autoFocus
          />

          {/* Botões de Salvar e Cancelar */}
          <View style={styles.modalButtonsRow}>
            <TouchableOpacity
              style={[styles.modalRowButton, { backgroundColor: '#34C759' }]}
              onPress={onSave}
            >
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalRowButton, { backgroundColor: '#FF3B30' }]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}