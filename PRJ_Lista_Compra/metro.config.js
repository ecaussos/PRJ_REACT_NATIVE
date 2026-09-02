// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adiciona suporte a arquivos .wasm necessários para o expo-sqlite
config.resolver.assetExts.push('wasm');

module.exports = config;