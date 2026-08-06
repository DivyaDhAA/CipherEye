import { useMutation } from '@tanstack/react-query';
import { scanWebsiteUrl, scanSmsMessage, scanQrCode, scanEmailContext } from '../services/api';

export const useWebsiteScan = () => {
  return useMutation({
    mutationFn: (url: string) => scanWebsiteUrl(url),
  });
};

export const useSmsScan = () => {
  return useMutation({
    mutationFn: (text: string) => scanSmsMessage(text),
  });
};

export const useQrScan = () => {
  return useMutation({
    mutationFn: (code: string) => scanQrCode(code),
  });
};

export const useEmailScan = () => {
  return useMutation({
    mutationFn: (content: string) => scanEmailContext(content),
  });
};
