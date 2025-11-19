import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from './CustomButton';
import PaymentSuccessIcon from '../assets/dark_icons/payment_successfully.svg';
import {useNavigation} from '@react-navigation/native';
import {
  getBorderRadius,
  getButtonHeight,
  getFontSize,
  getModalWidth,
  getSpacing,
} from '../constants/responsive';
import {useTheme} from '../hooks/useTheme';
import {colors, modalSuccessPay} from '../constants/colors';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const SuccessModal = ({
  visible,
  onClose,
  title = '',
  description = '',
  primaryButtonText = '',
  secondaryButtonText = '',
  onPrimaryButtonPress,
  onSecondaryButtonPress,
  secondaryButtonNavigationTarget = null,
}) => {
  const navigation = useNavigation();

  const handleSecondaryPress = () => {
    if (secondaryButtonNavigationTarget) {
      navigation.navigate(secondaryButtonNavigationTarget);
      onClose();
    } else if (onSecondaryButtonPress) {
      onSecondaryButtonPress();
    } else {
      onClose();
    }
  };

  const {mode} = useTheme();
  const currentColors = colors[mode];

  const modalColors =
    mode === 'dark' ? modalSuccessPay.dark : modalSuccessPay.light;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalWrapper}>
          <LinearGradient
            colors={modalColors}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradientBackground}>
            <View style={styles.modalContent}>
              <View style={styles.iconContainer}>
                <PaymentSuccessIcon width={80} height={80} />
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>

              <View style={styles.buttonContainer}>
                <CustomButton
                  title={primaryButtonText}
                  onPress={onPrimaryButtonPress}
                  variant="primary"
                />
                <TouchableOpacity
                  onPress={handleSecondaryPress}
                  style={[
                    styles.secondaryButton,
                    {backgroundColor: currentColors.buttonBg},
                  ]}>
                  <Text style={styles.secondaryButtonText}>
                    {secondaryButtonText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
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
  primaryButton: {
    height: getButtonHeight(),
    borderRadius: getBorderRadius(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? getSpacing(8) : getSpacing(12),
  },
  secondaryButton: {
    height: getButtonHeight(),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: getBorderRadius(28),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    ...Platform.select({
      ios: {
        marginTop: getSpacing(4),
      },
    }),
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(16),
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SuccessModal;
