import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from './CustomButton';
import {LogoutIcon} from '../assets/svg/MenuIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../hooks/useTheme';
import {colors, logoutModal} from '../constants/colors';
import {fetchTranslations} from '../redux/translationSlice';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import '../i18n';

const {width, height} = Dimensions.get('window');

const LogoutModal = ({visible, onClose, onLogout}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const lang = useSelector(state => state.language.lang);
  const {mode} = useTheme();
  const currentColors = colors[mode];

  const modalColors = mode === 'dark' ? logoutModal.dark : logoutModal.light;
  useEffect(() => {
    const textsToTranslate = [
      'Yes, Logout',
      'Logout',
      'Are you sure you want to logout from your account?',
      'Cancel',
    ];

    const uniqueTexts = Array.from(new Set(textsToTranslate));
    dispatch(fetchTranslations(uniqueTexts, lang));
  }, [lang]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}>
          <View style={styles.overlay}>
            <View
              style={[
                styles.modalContent,
                // {paddingBottom: Math.max(insets.bottom, 24)},
              ]}>
              <LinearGradient
                colors={modalColors}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.modalContainer}>
                <View style={styles.contentContainer}>
                  <View style={styles.iconContainer}>
                    <LogoutIcon size={48} color={currentColors.textWhite} />
                  </View>

                  <Text
                    style={[styles.title, {color: currentColors.textWhite}]}>
                    {t('logout_modal.title')}
                  </Text>
                  <Text style={styles.description}>
                    {t('logout_modal.description')}
                  </Text>

                  <View style={styles.buttonContainer}>
                    <CustomButton
                      title={t('logout_modal.yes_logout')}
                      onPress={onLogout}
                      variant="primary"
                      style={styles.logoutButton}
                    />
                    <TouchableOpacity
                      onPress={onClose}
                      style={[
                        styles.cancelButton,
                        {backgroundColor: currentColors.buttonBg},
                      ]}>
                      <Text style={styles.cancelButtonText}>
                        {t('logout_modal.cancel')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContainer: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  contentContainer: {
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    marginBottom: 24,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
  },
  buttonContainer: {
    gap: 12,
  },
  logoutButton: {
    //backgroundColor: '#4A4AFF',
  },
  cancelButton: {
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LogoutModal;
