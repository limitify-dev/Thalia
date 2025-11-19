import React, {useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../hooks/useTheme';
import {colors} from '../constants/colors';
import {
  getFontSize,
  getSpacing,
  getBorderRadius,
} from '../constants/responsive';
import {useDispatch, useSelector} from 'react-redux';
import {fetchTranslations} from '../redux/translationSlice';
import '../i18n';
import {useTranslation} from 'react-i18next';

const darkGradientColors = ['#2D32C5B2', '#F700CEB2', '#1D0F44'];
const darkGradientStart = {x: 5, y: 0};
const darkGradientEnd = {x: 1.9, y: 1};
const darkGradientLocations = [0, 0.3, 1];

const lightGradientColors = [
  '#B7CFFF',
  '#E0E1F7',
  '#D3DCE2',
  '#ADC6DC',
  '#E3C3D9',
];
const lightGradientStart = {x: 0, y: 0};
const lightGradientEnd = {x: 1, y: 1};
const lightGradientLocations = [0, 0.25, 0.5, 0.75, 1];

const TermsModal = ({visible, onClose}) => {
  const {t} = useTranslation();
  const lang = useSelector(state => state.language.lang);
  const dispatch = useDispatch();
  const {mode} = useTheme();
  const currentColors = colors[mode];

  const getGradientSettings = () => {
    return mode === 'dark'
      ? {
          colors: darkGradientColors,
          start: darkGradientStart,
          end: darkGradientEnd,
          locations: darkGradientLocations,
        }
      : {
          colors: lightGradientColors,
          start: lightGradientStart,
          end: lightGradientEnd,
          locations: lightGradientLocations,
        };
  };

  const gradientSettings = getGradientSettings();

  useEffect(() => {
    const textsToTranslate = [
      'Welcome to Heolia',
      'Terms and Conditions',
      '1. Ticket Booking & Reservations',
      'By creating an account and using our services, you agree to the following terms and conditions for ticket booking and museum/exhibition experiences.',
      'All ticket bookings are subject to availability',
      'Advance booking is recommended for popular exhibitions',
      'Group bookings (10+ people) require 48-hour advance notice',
      'Special exhibitions may have separate pricing and terms',
      '2. Payment & Pricing',
      'All payments are processed securely through our payment partners',
      'Prices are subject to change without prior notice',
      'Additional fees may apply for premium experiences',
      'Student, senior, and group discounts available with valid ID',
      '3. Cancellation & Refund Policy',
      'Free cancellation up to 24 hours before visit date',
      'Refunds processed within 5-7 business days',
      'No-show bookings are non-refundable',
      'Weather-related closures eligible for full refund or rescheduling',
      'Last updated: January 2024',
    ];
    dispatch(fetchTranslations([...new Set(textsToTranslate)], lang));
  }, [lang]);

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor="transparent"
          barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
          translucent={true}
        />
        <View style={styles.modalBackground}>
          <LinearGradient {...gradientSettings} style={styles.modalContainer}>
            <View style={styles.header}>
              <Text
                style={[
                  styles.welcomeTitle,
                  {color: currentColors.titleColor},
                ]}>
                {t('terms_modal.title')}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon
                  name="close"
                  size={28}
                  color={mode === 'dark' ? '#FFFFFF' : '#000000'}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator>
              <Text
                style={[
                  styles.welcomeTitle,
                  {color: currentColors.titleColor, textAlign: 'left'},
                ]}>
                {t('terms_modal.welcome')}
              </Text>

              <Text
                style={[
                  styles.introText,
                  {color: currentColors.titleColor, textAlign: 'left'},
                ]}>
                {t('terms_modal.section1_intro')}
              </Text>

              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {color: currentColors.titleColor},
                  ]}>
                  {t('terms_modal.section1_title')}
                </Text>
                {[
                  'section1_item1',
                  'section1_item2',
                  'section1_item3',
                  'section1_item4',
                ].map((item, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.bulletText,
                      {color: currentColors.titleColor},
                    ]}>
                    • {t(`terms_modal.${item}`)}
                  </Text>
                ))}
              </View>

              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {color: currentColors.titleColor},
                  ]}>
                  {t('terms_modal.section2_title')}
                </Text>
                {[
                  'section2_item1',
                  'section2_item2',
                  'section2_item3',
                  'section2_item4',
                ].map((item, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.bulletText,
                      {color: currentColors.titleColor},
                    ]}>
                    • {t(`terms_modal.${item}`)}
                  </Text>
                ))}
              </View>

              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {color: currentColors.titleColor},
                  ]}>
                  {t('terms_modal.section3_title')}
                </Text>
                {[
                  'section3_item1',
                  'section3_item2',
                  'section3_item3',
                  'section3_item4',
                ].map((item, idx) => (
                  <Text
                    key={idx}
                    style={[
                      styles.bulletText,
                      {color: currentColors.titleColor},
                    ]}>
                    • {t(`terms_modal.${item}`)}
                  </Text>
                ))}
              </View>

              <Text
                style={[styles.lastUpdated, {color: currentColors.titleColor}]}>
                {t('terms_modal.last_updated')}
              </Text>
            </ScrollView>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  welcomeTitle: {
    fontSize: getFontSize(22),
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    padding: getSpacing(5),
    borderRadius: getBorderRadius(20),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollContent: {
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(10),
    paddingBottom: getSpacing(100),
  },
  introText: {
    fontSize: getFontSize(15),
    lineHeight: getFontSize(22),
    marginBottom: getSpacing(25),
  },
  section: {
    marginBottom: getSpacing(20),
  },
  sectionTitle: {
    fontSize: getFontSize(17),
    fontWeight: 'bold',
    marginBottom: getSpacing(10),
    textAlign: 'left',
  },
  bulletText: {
    fontSize: getFontSize(14),
    lineHeight: getFontSize(22),
    textAlign: 'left',
    marginBottom: getSpacing(5),
  },
  lastUpdated: {
    fontSize: getFontSize(12),
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: getSpacing(30),
    marginBottom: getSpacing(10),
  },
});

export default TermsModal;
