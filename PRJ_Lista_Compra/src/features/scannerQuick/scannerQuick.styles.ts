// src/features/scannerBarcode/scannerBarcode.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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