// features/scannerQuick/scannerQuick.form.tsx
import { Picker } from '@react-native-picker/picker';
import { Button, Modal, Text, TextInput, View } from 'react-native';
import { styles } from './scannerQuick.styles';
import { ProductResult, ScannerQuickIntent } from './scannerQuick.types';

interface ScannerQuickFormProps {                         // Interface de propriedades do formulário do leitor rápido
  visible: boolean;                                       // Controla a visibilidade do modal de confirmação
  scannedProduct: ProductResult | null;                   // Dados do produto obtidos da leitura
  selectedGroupId: string;                                // ID do grupo atualmente selecionado
  groups: Array<{ id_group: string; nm_group: string }>;  // Lista de grupos disponíveis para seleção
  loading?: boolean;                                      // Indicador visual de estado de carregamento
  onSave: () => void;                                     // Função callback executada ao salvar o produto
  dispatch: (intent: ScannerQuickIntent) => void;         // Função para despachar intenções do usuário
}

export function ScannerQuickForm({                                      // Declaração do componente funcional do formulário
  visible,                                                              // Propriedade de visibilidade do modal
  scannedProduct,                                                       // Propriedade com dados do produto lido
  selectedGroupId,                                                      // Propriedade com o grupo selecionado
  groups,                                                               // Propriedade com a lista de grupos
  loading = false,                                                      // Propriedade de carregamento com valor padrão falso
  onSave,                                                               // Propriedade com a função de salvar
  dispatch,                                                             // Propriedade com a função de dispatch
}: ScannerQuickFormProps) {
  // -------- MONTAGEM DOS BOTÕES NA TELA -------- //
  return (                                                              // Inicia o retorno do JSX do componente
    <Modal                                                              // Componente Modal do React Native
      visible={visible}                                                 // Define se o modal está visível
      transparent                                                       // Torna o fundo do modal transparente
      animationType="slide"                                             // Define o tipo de animação ao abrir
      onRequestClose={() => dispatch({ type: 'CLOSE_CONFIRM_MODAL' })}  // Trata a ação de fechar no Android
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
           {/* Título principal do modal */}
          <Text style={styles.title}>Confirmar Produto</Text>
           {/* Campo Nome do Produto */}
          <Text style={styles.label}>Nome do Produto:</Text>
          <TextInput                                  // Campo de entrada de texto do nome do produto
            style={styles.input}                      // Aplica os estilos de input
            value={scannedProduct?.nm_product || ''}  // Define o valor do texto com fallback para vazio
            onChangeText={text =>                     // Trata a alteração do texto digitado
              dispatch({                              // Despacha intenção de atualização do produto
                type: 'UPDATE_SCANNED_PRODUCT',       // Tipo da intenção
                payload: { nm_product: text },        // Novo valor do nome do produto
              })
            }
          />
          {/* Campo GTIN/Código de barras */}
          <Text style={styles.label}>GTIN:</Text>
          <TextInput                            // Campo de entrada de texto para o código GTIN
            style={styles.input}                // Aplica os estilos de input
            value={scannedProduct?.gtin || ''}  // Define o valor do código GTIN
            onChangeText={text =>               // Trata a alteração do texto digitado
              dispatch({                        // Despacha intenção de atualização do produto
                type: 'UPDATE_SCANNED_PRODUCT', // Tipo da intenção
                payload: { gtin: text },        // Novo valor do GTIN
              })
            }
          />
          {/* Campo de seleção de grupo */}
          <Text style={styles.label}>Grupo:</Text>
          <Picker                                                             // Componente de seleção em dropdown
            selectedValue={selectedGroupId}                                   // Define o valor atualmente selecionado
            onValueChange={itemValue =>                                       // Trata a mudança do item selecionado
              dispatch({ type: 'SET_GROUP_ID', payload: String(itemValue) })  // Despacha intenção com o novo ID do grupo
            }
          >
            {/* Opção padrão e opcional do seletor */}
            <Picker.Item label="Selecione um grupo" value="" />
            {groups.map(group => (              // Mapeia a lista de grupos para os itens do Picker
              <Picker.Item                      // Item individual do Picker
                key={group.id_group}            // Chave única do item mapeado
                label={group.nm_group}          // Nome exibido do grupo
                value={String(group.id_group)}  // Valor retornado do ID do grupo
              />
            ))}
          </Picker>
          {/* Botões */}
          <View style={styles.buttonRow}>
            <Button                                                     // Botão de cancelar a ação
              title="Cancelar"                                          // Texto exibido no botão
              color="#888"                                            // Cor cinza para ação secundária
              disabled={loading}                                        // Desabilita o botão em estado de carregamento
              onPress={() => dispatch({ type: 'CLOSE_CONFIRM_MODAL' })} // Despacha intenção para fechar o modal
            />
            <Button // Botão de salvar o produto
              title={loading ? 'Salvando...' : 'Salvar e Adicionar'}  // Alterna o texto do botão conforme o estado de carregamento
              disabled={loading}                                      // Desabilita o botão enquanto estiver salvando
              onPress={onSave}                                        // Executa a função de salvamento
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}