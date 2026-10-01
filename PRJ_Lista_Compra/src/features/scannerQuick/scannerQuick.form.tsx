// features/scannerQuick/scannerQuick.form.tsx
import { Picker } from '@react-native-picker/picker';
import { Button, Modal, StyleSheet, Text, TextInput, View } from 'react-native';

import { GeminiProductResult } from '../../core/api/geminiProduct.api';
import { ScannerQuickIntent } from './scannerQuick.types';

interface ScannerQuickFormProps {
  visible: boolean;
  scannedProduct: GeminiProductResult | null;
  selectedGroupId: string;
  groups: Array<{ id_group: number; nm_group: string }>;
  loading?: boolean;
  onSave: () => void;
  dispatch: (intent: ScannerQuickIntent) => void;
}

export function ScannerQuickForm({
  visible,
  scannedProduct,
  selectedGroupId,
  groups,
  loading = false,
  onSave,
  dispatch,
}: ScannerQuickFormProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => dispatch({ type: 'CLOSE_CONFIRM_MODAL' })}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Confirmar Produto</Text>

          {/* Campo Nome */}
          <Text style={styles.label}>Nome do Produto:</Text>
          <TextInput
            style={styles.input}
            value={scannedProduct?.nm_product || ''}
            onChangeText={text =>
              dispatch({
                type: 'UPDATE_SCANNED_PRODUCT',
                payload: { nm_product: text },
              })
            }
          />

          {/* Campo GTIN / Código de Barras */}
          <Text style={styles.label}>GTIN:</Text>
          <TextInput
            style={styles.input}
            value={scannedProduct?.gtin || ''}
            onChangeText={text =>
              dispatch({
                type: 'UPDATE_SCANNED_PRODUCT',
                payload: { gtin: text },
              })
            }
          />

          {/* Seleção do Grupo Local */}
          <Text style={styles.label}>Grupo:</Text>
          <Picker
            selectedValue={selectedGroupId}
            onValueChange={itemValue =>
              dispatch({ type: 'SET_GROUP_ID', payload: String(itemValue) })
            }
          >
            <Picker.Item label="Selecione um grupo (opcional)" value="" />
            {groups.map(group => (
              <Picker.Item
                key={group.id_group}
                label={group.nm_group}
                value={String(group.id_group)}
              />
            ))}
          </Picker>

          {/* Botões */}
          <View style={styles.buttonRow}>
            <Button
              title="Cancelar"
              color="#888"
              disabled={loading}
              onPress={() => dispatch({ type: 'CLOSE_CONFIRM_MODAL' })}
            />
            <Button
              title={loading ? 'Salvando...' : 'Salvar e Adicionar'}
              disabled={loading}
              onPress={onSave}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  label: { fontSize: 14, color: '#333', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});