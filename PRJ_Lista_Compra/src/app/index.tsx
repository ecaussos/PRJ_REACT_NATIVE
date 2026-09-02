// app/index.tsx
import { Link } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './index.style';

export default function Home() {
  // MONTAGEM DA TELA 
  return (
    <View style={styles.container}>
      {/* Logotipo */}
      <Image 
        source={require('../assets/images/logo_listbuy.jpeg')}
        style={styles.logo}
        resizeMode="contain"
      />       
      {/* Título principal da tela */}
      <Text style={styles.titulo}>Gestão Doméstica</Text>
      {/* Subtítulos de seções */}
      <Text style={styles.subtitulo}>Escolha uma opção abaixo:</Text>
      {/* Botões do Menu */}
      <View style={styles.menuContainer}>
        {/* Adicionar Produto via Leitor Direto */}
        <Link href="/scanner" asChild>
          <TouchableOpacity style={styles.botao}>
            <Text style={styles.textoBotao}>𝄂𝄀𝄁𝄃 Leitor Código</Text>
          </TouchableOpacity>
        </Link>
                
        {/* Botão Lista de Compra */}
        <Link href="/buyList" asChild>
          <TouchableOpacity style={styles.botao}>
            <Text style={styles.textoBotao}>📝 Lista de Compra</Text>
          </TouchableOpacity>
        </Link>

        {/* Botão Realizar Compra */}
        <Link href="/buy" asChild>
          <TouchableOpacity style={styles.botao}>
            <Text style={styles.textoBotao}>🛒 Realizar Compra</Text>
          </TouchableOpacity>
        </Link>

        {/* Botão Grupos */}
        <Link href="/groupProduct" asChild>
          <TouchableOpacity style={styles.botao}>
            <Text style={styles.textoBotao}>🏷️ Grupos</Text>
          </TouchableOpacity>
        </Link>

        {/* Botão Produto */}
        <Link href="/product" asChild>
          <TouchableOpacity style={styles.botao}>
            <Text style={styles.textoBotao}>📦 Produtos</Text>
          </TouchableOpacity>
        </Link>

        {/* Botão Fornecedor */}
        <Link href="/supplier" asChild>
          <TouchableOpacity style={styles.botao}>
            <Text style={styles.textoBotao}>🤝 Fornecedor</Text>
          </TouchableOpacity>
        </Link>

        {/* Correção: Alterado de "/history" para "/buyHist" */}
        <Link href="/buyHist" asChild>
          <TouchableOpacity style={styles.botao}>
            <Text style={styles.textoBotao}>🗂️ Histórico</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}
