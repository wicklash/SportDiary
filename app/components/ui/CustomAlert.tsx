import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../theme/theme";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
  onClose: () => void;
}

export default function CustomAlert({ 
  visible, 
  title, 
  message, 
  buttons = [{ text: "Tamam" }], 
  onClose 
}: CustomAlertProps) {
  const handleButtonPress = (button: typeof buttons[0]) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return [styles.button, styles.destructiveButton];
      case 'cancel':
        return [styles.button, styles.cancelButton];
      default:
        return [styles.button, styles.defaultButton];
    }
  };

  const getButtonTextStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return [styles.buttonText, styles.destructiveButtonText];
      case 'cancel':
        return [styles.buttonText, styles.cancelButtonText];
      default:
        return [styles.buttonText, styles.defaultButtonText];
    }
  };

  const getIcon = () => {
    if (title.toLowerCase().includes('hata') || title.toLowerCase().includes('error')) {
      return <Ionicons name="alert-circle" size={48} color={theme.colors.danger} />;
    }
    if (title.toLowerCase().includes('başarılı') || title.toLowerCase().includes('tamamlandı')) {
      return <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />;
    }
    return <Ionicons name="information-circle" size={48} color={theme.colors.primary} />;
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>
          
          <Text style={styles.title}>{title}</Text>
          
          {message && (
            <Text style={styles.message}>{message}</Text>
          )}
          
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={getButtonStyle(button.style)}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.8}
              >
                <Text style={getButtonTextStyle(button.style)}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    color: theme.colors.subtext,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  defaultButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  destructiveButton: {
    backgroundColor: theme.colors.danger,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  defaultButtonText: {
    color: theme.colors.primaryOn,
  },
  cancelButtonText: {
    color: theme.colors.subtext,
  },
  destructiveButtonText: {
    color: theme.colors.primaryOn,
  },
});
