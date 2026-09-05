// src/features/buy/buy.form.tsx
import { useState } from 'react';
import { ActivityIndicator, Button, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from './buy.styles';


// COMPONENTE DE BOTÕES DE AÇÃO - Lista/Produto
// Define o formato das propriedades que o formulário recebe da tela - Botões de ação
interface BuyActionsProps {
  // Abre a lista de compra
  onOpenBuyList: () => void;
  // Aciona as opções de  ára adicionar registro
  onToggleAddOptions: () => void;
}
// Componente do formulário para Listar e Adicionar os registros
export function BuyActions({ onOpenBuyList, onToggleAddOptions }: BuyActionsProps) {
  // MONTAGEM DA TELA
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Selecione a opção</Text>
      <View style={styles.buttonsRow}>
        {/* Bõtao para listar registros */}
        <TouchableOpacity style={styles.actionButtonList} onPress={onOpenBuyList}>
          <Text style={styles.buttonText}>📋 Utilizar Lista</Text>
        </TouchableOpacity>
        {/* Bõtao para Adcionar registros */}
        <TouchableOpacity style={styles.actionButtonAdd} onPress={onToggleAddOptions}>
          <Text style={styles.buttonText}>🧺 Adicionar Produto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// COMPONENTE DE BOTÕES DE AÇÃO - Câmera/Nome
// Define o contrato das propriedades do componentes - Botões adicionar registro
interface BuyAddOptionsProps {
  // Armazena função/Não retornar valor - Abre câmera
  onOpenCamera: () => void;
  // Armazena função/Não retornar valor - Abre busca Nome
  onOpenNameSearch: () => void;
}
// Função para mostrar os botões adicionar registro
export function BuyAddActions({ onOpenCamera, onOpenNameSearch }: BuyAddOptionsProps) {
  // MONTAGEM DA TELA
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Adicionar Produto</Text>
      <View style={styles.buttonsRow}>
        {/* Bõtao para Adcionar registros - câmera */}
        <TouchableOpacity style={styles.actionButtonCamera} onPress={onOpenCamera}>
          <Text style={styles.buttonText}>📷 Código</Text>
        </TouchableOpacity>
        {/* Bõtao para Adcionar registros - nome */}
        <TouchableOpacity style={styles.actionButtonName} onPress={onOpenNameSearch}>
          <Text style={styles.buttonText}>🔍 Nome</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// COMPONENTE EDIÇÃO DE REGISTROS - Produto/Quantidade/Valor
// Define o contrato das propriedades dos componentes - Itens da Lista
interface BuyItemModalProps {
  //Defini variáveis e as propriedades
  visible: boolean;
  item: { nm_product: string; qt_product: number } | null;
  quantityText: string;
  valueText: string;
  // Define funções e o parâmetros
  onChangeQuantity: (text: string) => void;                   
  onChangeValue: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
}
// Função para mostrar a edição do registro
export function BuyItemModal({ visible, item, quantityText, valueText, onChangeQuantity, onChangeValue, onSave, onClose }: BuyItemModalProps) {
// MONTAGEM DA TELA
  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Informar Dados do Item</Text>
          {/* Apresenta o registros */}
          <Text style={{ textAlign: 'center', marginBottom: 15, fontWeight: 'bold', color: '#333' }}>
            {item?.nm_product}
          </Text>
          {/* Caixa de texto para alterar o registro */}
          <Text style={styles.label}>Quantidade:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantityText}
            onChangeText={onChangeQuantity}
            placeholder="Quantidade"
          />
           {/* Caixa de texto para alterar o registro */}
          <Text style={styles.label}>Valor Unitário (R$):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={valueText}
            onChangeText={onChangeValue}
            placeholder="0.00"
            autoFocus
          />
          {/* Botões de ação */}
          <View style={styles.modalButtonsContainer}>
            {/* Botão salva registro */}
            <Button title="Salvar" onPress={onSave} />
            {/* Botão cancela operação registro */}
            <Button title="Cancelar" color="#6c757d" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// COMPONENTE DE FINALIZA - Compra/Fornecedor
// Define o contrato das propriedades dos componentes - Finaliza Compra
interface FinishBuyModalProps {
  //Defini variáveis e as propriedades
  visible: boolean;
  suppliers: any[];
  // Define funções e o parâmetros
  onSelectSupplier: (supplier: any) => void;
  onClose: () => void;
}
// Função para mostrar a edição do registro
export function FinishBuyModal({ visible, suppliers, onSelectSupplier, onClose }: FinishBuyModalProps) {
  // MONTAGEM DA TELA
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '70%' }]}>
          <Text style={styles.modalTitle}>Selecione o Fornecedor</Text>
           {/* Container dos registros*/}
          <FlatList
            data={suppliers}
            keyExtractor={(item) => String(item.id_supplier)}
            renderItem={({ item }) => (
              // Defini o item como um botão
              <TouchableOpacity
                style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                onPress={() => onSelectSupplier(item)}
              >
                {/* Apresentar os dados do registro */}
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#222' }}>{item.nm_supplier}</Text>
              </TouchableOpacity>
            )}
            // Apresentar mensagem se não encontrar nenhum registro
            ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>Nenhum fornecedor cadastrado.</Text>}
          />
          {/* Botões de ação */}
          <View style={{ marginTop: 15 }}>
            {/* Botão cancela operação registro */}
            <Button title="Cancelar" color="#FF3B30" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

//COMPONENTE BUSCA REGISTRO POR NOME
// Define o contrato das propriedades dos componentes - Busca registro por nome
interface BuyNameSearchModalProps {
  //Defini variáveis e as propriedades
  visible: boolean;
    // Define funções e o parâmetros
  onSelectProduct: (product: any) => void;
  onClose: () => void;
  onSearchProducts: (query: string) => Promise<any[]>;
}
// Função para mostrar a busca do registro
export function BuyNameSearchModal({ visible, onSelectProduct, onClose, onSearchProducts }: BuyNameSearchModalProps) {
  const [query, setQuery] = useState('');                       // Cria variável de estado
  const [results, setResults] = useState<any[]>([]);            // Cria variável de resultado para guardar registros
  const [loading, setLoading] = useState(false);                // Cria variável de carregamento de tela
  // Função assicrona para receber texto digitado
  const handleSearch = async (text: string) => {
    // Atualiza com o texto digitado
    setQuery(text);                                             
    // Se texto digitado menor que 2
    if (text.trim().length < 2) {
      // Limpa a tela de resultado
      setResults([]);                                           
      return;
    }
    // Ativa: Indicador visual de carregamento (Spinner)
    setLoading(true);                                           
    // Bloco tratamento: Try: Tente | Cach: Capture (Erro)
    try {
      const data = await onSearchProducts(text);
      setResults(data);
    // Se ocorrer algum erro
    } catch (error) {
      // Gera alerta informativo
      console.error('Erro na busca de produtos:', error);
    // Se der erro ou não
    } finally {
      // Desativa: Indicador visual de carregamento (Spinner)
      setLoading(false);
    }
  };
  // Função para limpar dos dodos recebidos e limpar e fehcar a tela
  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };
  // MONTAGEM DA TELA
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <Text style={styles.modalTitle}>Buscar Produto por Nome</Text>
          {/* Caixa de texto para localizar o registro */}
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do produto..."
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {/* Indicador visual de carregamento (Spinner) */}
          {loading && <ActivityIndicator color="#007AFF" style={{ marginVertical: 10 }} />}
          {/* Lista com os resultados encontrados no banco */}
          <FlatList
            data={results}
            keyExtractor={(item, index) => String(item.id_product || index)}
            renderItem={({ item }) => (
              // Defini o item como um botão
              <TouchableOpacity
                style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                onPress={() => {
                  onSelectProduct(item);
                  handleClose();
                }}
              >
                {/* Apresentar os dados do registro */}
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#222' }}>{item.nm_product}</Text>
                {item.nm_group && <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{item.nm_group}</Text>}
              </TouchableOpacity>
            )}
            // Apresentar mensagem se não encontrar nenhum registro
            ListEmptyComponent={
              query.length >= 2 && !loading ? (
                <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
                  Nenhum produto encontrado.
                </Text>
              ) : null
            }
          />
          {/* Botão cancela operação */}
          <View style={{ marginTop: 15 }}>
            <Button title="Cancelar" color="#FF3B30" onPress={handleClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}