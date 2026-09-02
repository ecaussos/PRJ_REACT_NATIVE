// src/features/buyHist/buyHist.screen.tsx
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useBuyHistViewModel } from './buyHist.hook';

export default function BuyHistScreen() {
  const { state } = useBuyHistViewModel();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Compras</Text>

      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {state.error && <Text style={styles.error}>{state.error}</Text>}

      <FlatList
        data={state.history}
        keyExtractor={(item) => item.id_hist_buy.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.productName}>{item.nm_product}</Text>
              <Text style={styles.price}>R$ {item.vl_product.toFixed(2)}</Text>
            </View>
            <Text style={styles.details}>Fornecedor: {item.nm_supplier || 'Não informado'}</Text>
            <Text style={styles.details}>Quantidade: {item.qt_product}</Text>
            <Text style={styles.date}>Data: {new Date(item.dt_hist_buy).toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={
          !state.loading ? (
            <Text style={styles.emptyText}>Nenhuma compra registrada no histórico.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa', paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#333' },
  loader: { marginVertical: 20 },
  error: { color: '#FF3B30', marginBottom: 12, textAlign: 'center', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#222', flex: 1 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#34C759' },
  details: { fontSize: 13, color: '#555', marginTop: 2 },
  date: { fontSize: 11, color: '#888', marginTop: 6, textAlign: 'right' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
});