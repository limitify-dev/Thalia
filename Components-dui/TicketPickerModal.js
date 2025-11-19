import React, {useState} from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../constants/colors';
import {useTheme} from '../hooks/useTheme';
import CustomButton from './CustomButton';
import {
  getScreenHeightPercentage,
  getSpacing,
  moderateScale,
  scale,
} from '../constants/responsive';

import {useTranslation} from 'react-i18next';
import '../i18n';

const {width, height} = Dimensions.get('window');

const PRIMARY_BLUE = '#4B6CFA';

const NumberSelector = ({value, setValue, min, max}) => {
  const {mode} = useTheme();
  const pan = new Animated.ValueXY();
  const [currentValue, setCurrentValue] = useState(value);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      if (Math.abs(gesture.dy) > 10) {
        const newValue =
          gesture.dy > 0 ? Math.max(min, currentValue - 1) : currentValue + 1;
        if (newValue !== currentValue) {
          setCurrentValue(newValue);
          setValue(newValue);
        }
      }
    },
    onPanResponderRelease: () => {
      Animated.spring(pan, {
        toValue: {x: 0, y: 0},
        useNativeDriver: false,
      }).start();
    },
  });

  return (
    <View style={styles.numberSelectorContainer}>
      <Text style={styles.numberOptionFaded}>
        {currentValue - 1 >= min ? currentValue - 1 : ''}
      </Text>

      <View style={styles.numberLineContainer}>
        <View style={styles.gestureWrapper}>
          <View
            {...panResponder.panHandlers}
            style={styles.invisibleGestureArea}
          />
          <Animated.View style={styles.selectedNumberContainer}>
            <Text style={styles.selectedNumber}>{currentValue}</Text>
            <View style={styles.blueUnderline} />
          </Animated.View>
        </View>
      </View>

      <Text style={styles.numberOptionFaded}>{currentValue + 1}</Text>
    </View>
  );
};

const TicketPickerModal = ({
  visible,
  onClose,
  onSelect,
  selectedTickets,
  title,
  adult,
  kid,
  confirm,
}) => {
  const {mode} = useTheme();
  const {t} = useTranslation();
  const [adults, setAdults] = useState(selectedTickets?.adults || 1);
  const [kids, setKids] = useState(selectedTickets?.kids || 0);

  const handleContinue = () => {
    onSelect({adults, kids});
    onClose();
  };

  const gradientBackgroundBoxColors = {
    light: ['rgb(123,124,133)', 'rgb(125,125,134)'],
    dark: ['rgb(86,83,98)', 'rgb(86,83,98)'],
  };
  const currentColors = colors[mode];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={gradientBackgroundBoxColors[mode]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={[
                styles.gradientBg,

                Platform.OS === 'ios' && {
                  paddingHorizontal: scale(5),
                  paddingTop: scale(20),
                  paddingBottom: scale(10),
                  borderTopLeftRadius: moderateScale(20),
                  borderTopRightRadius: moderateScale(20),
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 0,
                  height: getScreenHeightPercentage(60),
                },
              ]}>
              <Text style={styles.title}>
                {t('ticket_picker_screen.title')}{' '}
              </Text>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t('ticket_picker_screen.adult')}
                </Text>
                <NumberSelector
                  value={adults}
                  setValue={setAdults}
                  min={1}
                  max={Infinity}
                />
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t('ticket_picker_screen.kid')}
                </Text>
                <NumberSelector
                  value={kids}
                  setValue={setKids}
                  min={0}
                  max={Infinity}
                />
              </View>

              {/* <TouchableOpacity
                style={[
                  styles.button,
                  {backgroundColor: currentColors.calanderCurrentDate},
                ]}
                onPress={handleContinue}
                activeOpacity={0.8}>
                <Text style={styles.buttonText}>{t(confirm)}</Text>
              </TouchableOpacity> */}
              <View style={styles.button}>
                <CustomButton
                  title={t('ticket_picker_screen.confirm')}
                  onPress={handleContinue}
                  variant="primary"
                />
              </View>
            </LinearGradient>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 'auto',
  },
  gradientBg: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  numberSelectorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    width: 80,
  },
  numberOptionFaded: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginVertical: 2,
  },
  numberLineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  gestureWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  invisibleGestureArea: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    left: -40,
    right: -40,
    zIndex: 1,
  },
  selectedNumberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedNumber: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },
  blueUnderline: {
    width: 40,
    height: 2,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 1,
    marginTop: 2,
  },
  button: {
    width: '78%',
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    width: '78%',
    paddingVertical: 12,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    bottom: Platform.OS === 'ios' ? 20 : 0,
  },
});

export default TicketPickerModal;
