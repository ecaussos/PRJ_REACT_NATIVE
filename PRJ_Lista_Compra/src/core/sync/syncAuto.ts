// src/core/sync/syncAuto.ts

import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { SyncService } from './syncService';

// Função de sincronização banco de dados LOCAL/CLOUD
export function syncAuto() {
  useEffect(() => {                                                 // Efeito para registrar listeners
    // 1. Executa na inicialização do app
    SyncService.runAutoSync();                                      // Roda sincronização ao montar componente
    // 2. Executa ao reconectar a internet
    const unsubscribeNet = NetInfo.addEventListener((netState) => { // Listener de estado de rede
      if (netState.isConnected && netState.isInternetReachable) {   // Valida se há internet
        SyncService.runAutoSync();                                  // Roda sincronização se conectado
      }
    });
    // 3. Executa ao voltar para o app
    const appStateListener = AppState.addEventListener('change', (nextState) => { // Listener do estado do app
      if (nextState === 'active') {                                               // Valida se app ficou ativo
        SyncService.runAutoSync();                                                // Roda sincronização ao reabrir app
      }
    });
    // 4. Executa limpeza dos listener (Escutas)
    return () => {                
      unsubscribeNet();           // Remove listener de rede
      appStateListener.remove();  // Remove listener do app  
    };
  }, []);                         // Executa apenas na montagem

  return { triggerSync: () => SyncService.runAutoSync() };  // Retorna função para disparo manual
}