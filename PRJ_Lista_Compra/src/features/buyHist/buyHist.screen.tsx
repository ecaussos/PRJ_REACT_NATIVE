// src/features/buyHist/buyHist.screen.tsx
import { ActivityIndicator, FlatList, Text, TextInput, View } from 'react-native';
import { useBuyHistViewModel } from './buyHist.hook';
import { styles } from './buyHist.styles';

export default function BuyHistScreen() {
  const { state } = useBuyHistViewModel();
  // MONTAGEM DA TELA
  return (
    <View style={styles.container}>
      {/* Título principal da tela */}
      <Text style={styles.title}>Histórico de Compras</Text>
      {/* Indicador visual de carregamento (Spinner) */}
      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {/* Exibição de mensagens de erro, caso ocorram */}
      {state.error && <Text style={styles.error}>{state.error}</Text>}
      
      {/* Caixa de texto para pesquisar produtos na lista */}
      <Text style={styles.subtitle}>Produtos Listados</Text>
      {/* Caixa de texto para pesquisar produtos na lista */}
      <TextInput
        style={styles.input}
        placeholder="Pesquisar Produto"
        placeholderTextColor="#888"
        value={''}
        //onChangeText={''} ??????
      />
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        data={state.history}
        keyExtractor={(item) => item.id_hist_buy.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
              {/* Apresenta a lista com campos */}
              <View style={styles.textContainer}>
                <Text style={styles.itemList}>{item.nm_product}</Text>
                <Text style={styles.details}>R$ {item.vl_product.toFixed(2)}</Text>
                <Text style={styles.details}>Fornecedor: {item.nm_supplier || 'Não informado'}</Text>
                <Text style={styles.details}>Quantidade: {item.qt_product}</Text>
                <Text style={styles.details}>Data: {new Date(item.dt_hist_buy).toLocaleDateString()}</Text>
              </View>
              {/* Container dos botões de ação */}
              <View style={styles.actionButtonsContainer}></View>
            </View>
          </View>
        )}
        // Mensagem exibida caso a lista filtrada esteja vazia
        ListEmptyComponent={
          !state.loading ? (
            <Text style={styles.emptyText}>Nenhuma compra registrada no histórico.</Text>
          ) : null
        }
      />
    </View>
  );
}