import React, { useState } from "react";
import { CustomAlert } from "../components";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertOptions & { visible: boolean }>({
    visible: false,
    title: "",
    message: "",
    buttons: []
  });

  const showAlert = (options: AlertOptions) => {
    setAlertConfig({
      ...options,
      visible: true,
      buttons: options.buttons || [{ text: "Tamam" }]
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const AlertComponent = () => (
    <CustomAlert
      visible={alertConfig.visible}
      title={alertConfig.title}
      message={alertConfig.message}
      buttons={alertConfig.buttons}
      onClose={hideAlert}
    />
  );

  return {
    showAlert,
    hideAlert,
    AlertComponent
  };
};

// Utility functions for common alert types
export const showSuccessAlert = (showAlert: (options: AlertOptions) => void, message: string) => {
  showAlert({
    title: "Başarılı",
    message,
    buttons: [{ text: "Tamam" }]
  });
};

export const showErrorAlert = (showAlert: (options: AlertOptions) => void, message: string) => {
  showAlert({
    title: "Hata",
    message,
    buttons: [{ text: "Tamam" }]
  });
};

export const showConfirmAlert = (
  showAlert: (options: AlertOptions) => void, 
  title: string, 
  message: string, 
  onConfirm: () => void,
  confirmButtonText: string = "Sil",
  confirmButtonStyle: 'default' | 'cancel' | 'destructive' = 'destructive'
) => {
  showAlert({
    title,
    message,
    buttons: [
      { text: "İptal", style: "cancel" },
      { text: confirmButtonText, style: confirmButtonStyle, onPress: onConfirm }
    ]
  });
};