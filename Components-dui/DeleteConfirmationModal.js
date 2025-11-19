import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from './CustomButton';
import {useNavigation} from '@react-navigation/native';
import {
  getBorderRadius,
  getButtonHeight,
  getFontSize,
  getModalWidth,
  getSpacing,
} from '../constants/responsive';
import {useTheme} from '../hooks/useTheme';
import {colors, logoutModal} from '../constants/colors';
import {useTranslation} from '../utils/translate';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const DeleteConfirmationModal = ({
  visible,
  onClose,
  onDelete,
  siteName,
  location,
  selectedNotification,
  type,
  selectedSiteItem,
}) => {
  const navigation = useNavigation();
  const {mode} = useTheme();
  const currentColors = colors[mode];

  const modalColors = mode === 'dark' ? logoutModal.dark : logoutModal.light;

  const {t} = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalWrapper}>
              <LinearGradient
                colors={modalColors}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.gradientBackground}>
                <View style={styles.modalContent}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="notifications-outline"
                      size={getSpacing(40)}
                      color="#fff"
                    />
                  </View>

                  <Text style={styles.title}>
                    {t(
                      siteName?.split(' ').slice(0, 3).join(' ') ||
                        'Untitled Site',
                    )}
                  </Text>
                  <Text style={styles.description}>
                    {t(
                      location?.split(' ').slice(0, 3).join(' ') ||
                        'Location not available',
                    )}
                  </Text>
                  <Text style={styles.description}>{t(type)}</Text>

                  <View style={styles.buttonContainer}>
                    <CustomButton
                      title={t('Delete')}
                      onPress={onDelete}
                      variant="primary"
                    />
                    <TouchableOpacity
                      onPress={() => {
                        onClose();
                        navigation.navigate('DetailScreenFeature', {
                          siteId: selectedNotification,
                          notification: true,
                          notificationData: selectedNotification,
                          item: selectedSiteItem,
                        });
                      }}
                      style={[
                        styles.secondaryButton,
                        Platform.OS === 'ios' && styles.iosSecondaryButton,
                        {backgroundColor: 'rgba(255, 255, 255, 0.1)'},
                      ]}>
                      <Text style={styles.secondaryButtonText}>
                        {t('View Details')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalWrapper: {
    width: getModalWidth(),
    maxWidth: 400,
    marginHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  gradientBackground: {
    borderRadius: getBorderRadius(24),
    overflow: 'hidden',
  },
  modalContent: {
    padding: getSpacing(24),
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: getSpacing(20),
  },
  title: {
    fontSize: getFontSize(24),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: getSpacing(12),
    paddingHorizontal: getSpacing(20),
    ...Platform.select({
      ios: {
        fontWeight: '700',
      },
    }),
  },
  description: {
    fontSize: getFontSize(16),
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: getSpacing(32),
    paddingHorizontal: getSpacing(20),
    lineHeight: getSpacing(22),
  },
  buttonContainer: {
    width: '100%',
    gap: Platform.OS === 'ios' ? getSpacing(16) : getSpacing(12),
  },
  secondaryButton: {
    height: getButtonHeight(),
    borderRadius: getBorderRadius(28),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iosSecondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: getSpacing(8),
    marginTop: getSpacing(4),
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(16),
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DeleteConfirmationModal;
