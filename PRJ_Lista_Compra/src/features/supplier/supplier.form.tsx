// src/features/supplier/SupplierForm.tsx
import { Button, Text, TextInput, View } from 'react-native';
import { SupplierModel } from './supplier.model';
import { styles } from './supplier.styles';
import { SupplierFormProps } from './supplier.types';

// Componente do formulário para cadastro e edição dos registros
export default function SupplierForm({
  name,                       // Nome do fornecedor
  setName,                    // Atualiza o nome
  isEditing,                  // Indica se está em modo de edição
  onSave,                     // Função para salvar/cadastrar
  onCancel,                   // Função para cancelar a edição
}: SupplierFormProps) {

  // Regra de Validação: Campos devem tem informações - habilita botão
  const isFormValid = SupplierModel.isValid(name);

  // MONTAGEM DA TELA - renderização
  return (
    // Card que agrupa os elementos visuais do formulário
    <View style={styles.formCard}>
      {/* Título dinâmico baseado na ação (Editar / Cadastrar) */}
      <Text style={styles.subtitle}>
        {isEditing ? 'Editar Fornecedor' : 'Cadastrar Fornecedor'}
      </Text>

      {/* Campo para preenchimento do Nome do Fornecedor */}
      <TextInput
        style={styles.input}
        placeholder="Nome do Mercado / Fornecedor *"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      {/* Botão Salvar/Cadastrar: Salva o novo cadastro ou atualiza */}
      <Button 
        title={isEditing ? "Salvar Alterações" : "Cadastrar"} 
        onPress={onSave} 
        disabled={!isFormValid}
        color={isEditing ? "#0051FF" : undefined}
      />

      {/* Botão cancelar: visível apenas quando estiver editando */}
      {isEditing && (
        <View style={styles.cancelButtonContainer}>
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