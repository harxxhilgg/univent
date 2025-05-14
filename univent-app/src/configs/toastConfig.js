import React from 'react';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#00e600',
        borderLeftWidth: 6,
        backgroundColor: '#001a00',
        borderRadius: 8,
        paddingHorizontal: 8
      }}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      text1Style={{
        fontSize: 14,
        fontWeight: "bold",
        color: '#e6ffe6'
      }}
      text2Style={{
        fontSize: 12,
        color: '#e6ffe6'
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#e60000',
        borderLeftWidth: 4,
        backgroundColor: '#1a0000',
        borderRadius: 8,
        paddingHorizontal: 8
      }}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      text1Style={{
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffe6e6'
      }}
      text2Style={{
        fontSize: 12,
        color: '#ffe6e6'
      }}
    />
  ),

  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#0000e6',
        borderLeftWidth: 4,
        backgroundColor: '#00001a',
        borderRadius: 8,
        paddingHorizontal: 8
      }}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      text1Style={{
        fontSize: 14,
        fontWeight: 'bold',
        color: '#e6e6ff'
      }}
      text2Style={{
        fontSize: 12,
        color: '#e6e6ff'
      }}
    />
  ),
};
