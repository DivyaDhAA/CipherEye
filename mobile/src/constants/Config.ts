import { Platform } from 'react-native';

const getInitialApiBase = () => {
  if (Platform.OS === 'android') {
    return 'http://10.25.230.65:5001/api/v1';
  }
  return 'http://10.25.230.65:5001/api/v1';
};

export const Config = {
  apiBase: getInitialApiBase(),
};

