import React from 'react';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#198754',
        borderLeftWidth: 6,
        backgroundColor: '#3f3f46',
        borderRadius: 8,
        paddingHorizontal: 8
      }}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      text1Style={{
        fontSize: 14,
        fontWeight: '600',
        color: '#F5F5F5'
      }}
      text2Style={{
        fontSize: 12,
        color: '#F5F5F5'
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#ef4444',
        borderLeftWidth: 6,
        backgroundColor: '#3f3f46',
        borderRadius: 8,
        paddingHorizontal: 8
      }}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      text1Style={{
        fontSize: 14,
        fontWeight: '600',
        color: '#F5F5F5'
      }}
      text2Style={{
        fontSize: 12,
        color: '#F5F5F5'
      }}
    />
  ),

  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#0056b3',
        borderLeftWidth: 6,
        backgroundColor: '#3f3f46',
        borderRadius: 8,
        paddingHorizontal: 8
      }}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      text1Style={{
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F5F5F5'
      }}
      text2Style={{
        fontSize: 12,
        color: '#F5F5F5'
      }}
    />
  ),
};
