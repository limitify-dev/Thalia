import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../hooks/useTheme';
import {colors} from '../constants/colors';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const ConfirmationModal = ({
  visible,
  onCancel,
  onConfirm,
  title = 'Clear All History',
  message = 'Are you sure you want to clear all history?',
  cancelText = 'Cancel',
  confirmText = 'Yes, Clear All History',
}) => {
  const {mode} = useTheme();
  const themeColors = {
    modalBackground: mode === 'light' ? 'rgb(102,97,110)' : '#4A4458',
    submitButton: mode === 'light' ? 'rgb(94,127,154)' : '#6979F8',
    text: mode === 'light' ? '#FFFFFF' : '#FFFFFF',
    divider: mode === 'light' ? 'rgba(255, 255, 255, 0.3)' : '#5F5A6F',
    inputBackground:
      mode === 'light'
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(255, 255, 255, 0.1)',
    laterButton:
      mode === 'light'
        ? 'rgba(255, 255, 255, 0.25)'
        : 'rgba(255, 255, 255, 0.2)',
    starColor: mode === 'light' ? 'rgb(79, 117, 148)' : '#6979F8',
  };

  const gradientBackgroundBoxColors = {
    light: ['rgb(117,117,129)', 'rgb(101,98,111)', 'rgb(86,84,95)'],
    dark: ['rgb(85,79,97)', 'rgb(60,54,74)', 'rgb(37,30,52)'],
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onCancel}>
        <View style={styles.modalBackground}>
          <LinearGradient
            colors={gradientBackgroundBoxColors[mode]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradientOverlay}>
            <TouchableOpacity
              style={styles.modalContainer}
              activeOpacity={1}
              onPress={() => {}}>
              <View style={styles.contentContainer}>
                <Text style={[styles.title, {color: themeColors.text}]}>
                  {title}
                </Text>
                <Text style={[styles.message, {color: themeColors.text}]}>
                  {message}
                </Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.cancelButton,
                      {
                        backgroundColor: themeColors.laterButton,
                        borderWidth: 1,
                        borderColor:
                          mode === 'light'
                            ? 'rgba(255, 255, 255, 0.5)'
                            : 'rgba(255, 255, 255, 0.3)',
                      },
                    ]}
                    onPress={onCancel}>
                    <Text
                      style={[
                        styles.buttonText,
                        styles.cancelButtonText,
                        {color: themeColors.text},
                      ]}>
                      {cancelText}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.confirmButton,
                      {
                        backgroundColor: themeColors.submitButton,
                        borderWidth: 1,
                        borderColor:
                          mode === 'light'
                            ? 'rgb(136, 161, 181)'
                            : 'rgb(123,153,254)',
                      },
                    ]}
                    onPress={onConfirm}>
                    <Text
                      style={[
                        styles.buttonText,
                        styles.confirmButtonText,
                        {color: themeColors.text},
                      ]}>
                      {confirmText}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradientOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    overflow: 'hidden',
  },
  contentContainer: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {},
  confirmButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {},
  confirmButtonText: {},
});

export default ConfirmationModal;
