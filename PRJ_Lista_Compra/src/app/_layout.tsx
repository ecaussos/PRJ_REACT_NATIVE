// app/_layout.tsx
import { Stack } from 'expo-router';
import 'react-native-get-random-values';
export default function RootLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#f5f5f5' },
        headerTintColor: '#333',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* Tela Inicial (Index) - Sem cabeçalho para exibir o seu design personalizado */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      {/* Telas internas do aplicativo */}
      {/* Leitor do código de barra */}
      <Stack.Screen 
        name="scanner" 
        options={{ 
          title: 'Leitor de Código',
          headerShown: false,
          presentation: 'transparentModal',
          animation: 'slide_from_bottom'
        }} 
      />
      {/* Lista de compra */}
      <Stack.Screen 
        name="buyList" 
        options={{ title: 'Lista de Compras' }} 
      />
      {/* Realizar Compra */}
      <Stack.Screen 
        name="buy" 
        options={{ title: 'Realizar Compra' }} 
      />
      {/* Produto */}
      <Stack.Screen 
        name="product" 
        options={{ title: 'Gerenciar Produtos' }} 
      />
      {/* Grupo Produto */}
      <Stack.Screen 
        name="groupProduct" 
        options={{ title: 'Categorias de Produtos' }} 
      />
      {/* Fornecedor */}
      <Stack.Screen 
        name="supplier" 
        options={{ title: 'Mercados e Fornecedores' }} 
      />
      {/* Histórico de compra */}
      <Stack.Screen 
        name="buyHist" 
        options={{ title: 'Histórico de Compras' }} 
      />
    </Stack>
  )
}