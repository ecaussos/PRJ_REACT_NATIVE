// src/features/product/product.form.tsx
import { Picker } from '@react-native-picker/picker';
import { Button, Text, TextInput, View } from 'react-native';
import { ProductModel } from './product.model';
import { styles } from './product.styles';
import { ProductFormProps } from './product.types';

// Componente do formulário para cadastro e edição dos registros
export default function ProductForm({
  name,                       // Nome do produto
  setName,                    // Atualiza o nome
  barcode,                    // Código de barras (GTIN)
  setBarcode,                 // Atualiza o código de barras
  groupId,                    // ID do grupo selecionado
  setGroupId,                 // Atualiza o grupo selecionado
  editingId,                  // ID do produto em edição ou null
  groups,                     // Lista de grupos para o Picker
  onSave,                     // Função para salvar/cadastrar
  onCancel,                   // Função para cancelar a edição
}: ProductFormProps) {
  
  // Define o modo do formulário: Edição (true) ou Cadastro (false)
  const isEditing = editingId !== null;

  // Regra de Validação: Campos devem tem informações digitas - habilita botão
  const isFormValid = ProductModel.isValid(name,barcode, groupId);
  
  // MONTAGEM DA TELA - renderização
  return (
    // Card que agrupa os elementos visuais do formulário
    <View style={styles.formCard}>
      {/* Título dinâmico baseado na ação (Editar / Cadastrar) */}
      <Text style={styles.subtitle}>
        {isEditing ? 'Editar Produto' : 'Cadastrar Produto'}
      </Text>
      
      {/* Campo para preenchimento do Nome do Produto */}
      <TextInput
        style={styles.input}
        placeholder="Nome do Produto *"
        value={name}
        onChangeText={setName}
      />

      {/* Campo para preenchimento do Código de Barras (Opcional) */}
      <TextInput
        style={styles.input}
        placeholder="Código de Barras (GTIN) *"
        value={barcode}
        onChangeText={setBarcode}
        keyboardType="numeric"
      />

      {/* Caixa de Seleção (Dropdown) para vínculo com Grupo de Produtos */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={groupId}
          onValueChange={(itemValue) => setGroupId(itemValue)}
        >
          {/* Opção Padrão / Placeholder */}
          <Picker.Item label="Selecione o Grupo... *" value="" />
          {/* Mapeamento dinâmico da lista de grupos cadastrados */}
          {groups?.map((group) => (
            <Picker.Item 
              key={group.id_group} 
              label={group.nm_group} 
              value={String(group.id_group)} 
            />
          ))}
        </Picker>
      </View>

      {/* Botão Salvar/Cadastrar: Salva o novo cadastro ou atualiza */}
      <Button 
        title={isEditing ? 'Salvar Alterações' : 'Cadastrar'} 
        onPress={onSave} 
        disabled={!isFormValid}
        color={isEditing ? '#0051FF' : undefined}
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