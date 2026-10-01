import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConfigEntity, DEFAULT_CONFIG } from '../../data/entities/config.entity';

const CONFIG_KEY = '@app_config_v1';

export const configStorageApi = {
  async fetchConfig(): Promise<ConfigEntity> {
    try {
      const jsonValue = await AsyncStorage.getItem(CONFIG_KEY);
      if (jsonValue != null) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(jsonValue) };
      }
    } catch (error) {
      console.error('Erro ao ler do AsyncStorage:', error);
    }
    return DEFAULT_CONFIG;
  },

  async persistConfig(config: ConfigEntity): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(config);
      await AsyncStorage.setItem(CONFIG_KEY, jsonValue);
      return true;
    } catch (error) {
      console.error('Erro ao salvar no AsyncStorage:', error);
      return false;
    }
  },
};