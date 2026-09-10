// src/features/groupProduct/groupProduct.form.tsx
import { Button, Text, TextInput, View } from 'react-native';
import { GroupProductModel } from './groupProduct.model';
import { styles } from './groupProduct.styles';
import { GroupProductFormProps } from './groupProduct.types';

// Componente do formulário para cadastro e edição dos registros
export default function GroupProductForm({
  name,
  setName,
  isEditing,
  onSave,
  onCancel,
}: GroupProductFormProps) {

  // Regra de Validação: Campos devem tem informações - habilita botão
  const isFormValid = GroupProductModel.isValid(name);
  
  // MONTAGEM DA TELA - renderização
  return (
    // Card que agrupa os elementos visuais do formulário
    <View style={styles.formCard}>
      {/* Título dinâmico: muda dependendo da operação realizada */}
      <Text style={styles.subtitle}>
        {isEditing ? 'Editar Grupo' : 'Cadastrar Grupo'}
      </Text>

      {/* Campo de texto para o Nome do Grupo */}
      <TextInput
        style={styles.input}
        placeholder="Nome do Grupo"
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