// src/core/sync/syncAuto.ts

import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { SyncService } from './syncService';

export function syncAuto() {
  useEffect(() => {
    // 1. Executa na inicialização do app
    SyncService.runAutoSync();

    // 2. Executa ao reconectar a internet
    const unsubscribeNet = NetInfo.addEventListener((netState) => {
      if (netState.isConnected && netState.isInternetReachable) {
        SyncService.runAutoSync();
      }
    });

    // 3. Executa ao voltar para o app
    const appStateListener = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        SyncService.runAutoSync();
      }
    });

    return () => {
      unsubscribeNet();
      appStateListener.remove();
    };
  }, []);

  return { triggerSync: () => SyncService.runAutoSync() };
}