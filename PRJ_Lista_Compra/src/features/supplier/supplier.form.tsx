// src/features/supplier/SupplierForm.tsx
import { Button, Text, TextInput, View } from 'react-native';
import { styles } from './supplier.styles';

// Define o formato das propriedades que o formulário recebe da tela
interface SupplierFormProps {
  name: string;
  setName: (text: string) => void;
  editingId: number | null;
  onSave: () => void;
  onCancel: () => void;
}
// Componente do formulário para cadastro e edição dos registros
export default function SupplierForm({
  name,
  setName,
  editingId,
  onSave,
  onCancel,
}: SupplierFormProps) {
  return (
    // Card que agrupa os elementos visuais do formulário
    <View style={styles.formCard}>

      {/* Título dinâmico: muda dependendo da operação realizada */}
      <Text style={styles.subtitle}>
        {editingId !== null ? 'Editar' : 'Cadastrar'}
      </Text>

      {/* Campo de texto para o Nome do Fonercedor */}
      <TextInput
        style={styles.input}
        placeholder="Nome do Mercado"
        value={name}
        onChangeText={setName}
      />

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