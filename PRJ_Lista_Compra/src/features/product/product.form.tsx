// src/features/product/ProductForm.tsx
import { Picker } from '@react-native-picker/picker';
import { Button, Text, TextInput, View } from 'react-native';
import { styles } from './product.styles';
import { GroupOption } from './product.types';

// Define o formato das propriedades que o formulário recebe da tela
interface ProductFormProps {
  name: string;
  setName: (text: string) => void;
  barcode: string;
  setBarcode: (text: string) => void;
  groupId: string;
  setGroupId: (text: string) => void;
  editingId: number | null;
  groups: GroupOption[];
  onSave: () => void;
  onCancel: () => void;
}

// Componente do formulário para cadastro e edição dos registros
export default function ProductForm({
  name,
  setName,
  barcode,
  setBarcode,
  groupId,
  setGroupId,
  editingId,
  groups,
  onSave,
  onCancel,
}: ProductFormProps) {
// MONTAGEM DA TELA
  return (
    // Card que agrupa os elementos visuais do formulário
    <View style={styles.formCard}>
      {/* Título dinâmico: muda dependendo da operação realizada */}
      <Text style={styles.subtitle}>
        {editingId !== null ? 'Editar' : 'Cadastrar'}
      </Text>
      
      {/* Campo de texto para o Nome do Produto */}
      <TextInput
        style={styles.input}
        placeholder="Nome do Produto"
        value={name}
        onChangeText={setName}
      />

      {/* Campo de texto para o Código de Barras (GTIN) */}
      <TextInput
        style={styles.input}
        placeholder="Código de Barras (GTIN)"
        value={barcode}
        onChangeText={setBarcode}
        keyboardType="numeric"
      />

      {/* Componente Picker (Listbox) para selecionar dinamicamente o grupo do produto */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={groupId}
          onValueChange={(itemValue) => setGroupId(itemValue)}
        >
          <Picker.Item label="Selecione o Grupo..." value="" />
          {groups && groups.map((group: GroupOption) => (
            <Picker.Item 
              key={group.id_group} 
              label={group.nm_group} 
              value={String(group.id_group)} 
            />
          ))}
        </Picker>
      </View>

      {/* Botão Salvar/Cadastar: Salva o novo cadastro ou atualiza*/}
      <Button 
        title={editingId !== null ? "Salvar" : "Cadastrar"} 
        onPress={onSave} 
        color={editingId !== null ? "#0051FF" : undefined}
      />

      {/* Botão cancelar: visível apenas quando estiver editando */}
      {editingId !== null && (
        <View style={{ marginTop: 8 }}>
          <Button 
            title="Cancelar" 
            color="#6c757d" 
            onPress={onCancel} 
          />
        </View>
      )}
    </View>
  );
}