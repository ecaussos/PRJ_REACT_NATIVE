// app/scanner.tsx
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { BuyListCameraModal } from '../features/buyList/buyList.form';
import { BuyListModel } from '../features/buyList/buyList.model';
import { ProductModel } from '../features/product/product.model';

// Atalho tela principal para realizar a leitura do código de barra e adicionar o produto a lista de compra

export default function QuickScanner () {
  // Variáveis de estado
  const [visible, setVisible] = useState(true);
  // Função de fechamento scanner
  const handleClose = () => {
    setVisible(false);        // Fecha a camera
    router.back();            // Retornar a últma tela acessada
  };
  // Processamento do código de barra
  const handleScanSuccess = async (barcode: string) => {  //função assincrona (async) recebe o código de barra (barcode)
    // Bloco tratamento: Try: Tente | Cach: Capture (Erro)
    try {
      // 1. Valida se o produto existe no banco
      const product = await ProductModel.checkBarcode(barcode);
      // Valida se o produto não foi encontrado
      if (!product) {
        // De for verdadeiro: Gera alerta informativo
        Alert.alert('Aviso', `Nenhum produto cadastrado com o código ${barcode}.`);
        return;
      }
      // 2. Insere/Soma na lista de compras via Model
      await BuyListModel.create(product.id_product, 1);
      // Gera alerta informativo
      Alert.alert('Sucesso', `${product.nm_product} adicionado à lista!`, [
        // Botão OK para fechar e concluir a operação
        { text: 'OK', onPress: handleClose }
      ]);
    // Se ocorrer algum erro
    } catch (error) {
      // Gera alerta informativo
      Alert.alert('Erro', 'Não foi possível adicionar o produto pelo código de barras.');
    }
  };
  // MONTAGEM DA TELA  - renderização
  return (
    // Busca o modal na buyList.form
    <BuyListCameraModal
      visible={visible}
      onScanSuccess={handleScanSuccess}
      onClose={handleClose}
    />
  );
}