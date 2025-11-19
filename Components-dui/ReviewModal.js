import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

import {
  getModalWidth,
  getSpacing,
  getFontSize,
  getBorderRadius,
  moderateScale,
  SPACING,
  scale,
} from '../constants/responsive';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../hooks/useTheme';
import {colors} from '../constants/colors';
import Star from '../assets/svg/star.svg';
import {fetchTranslations} from '../redux/translationSlice';
import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import {useTranslation} from 'react-i18next';
import '../i18n';

const ReviewModal = ({
  visible,
  onClose,
  onSubmit,
  placeholder,
  restaurantName,
}) => {
  const {t} = useTranslation();
  const lang = useSelector(state => state.language.lang);
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const {mode} = useTheme();
  const currentColors = colors[mode];

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

  const handleSubmit = () => {
    if (!review.trim()) {
      Toast.show({
        type: 'info',
        text1: 'Please write a review',
        text2: 'Your feedback is important to us!',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    onSubmit({rating, review});
    setRating(0);
    setReview('');
    onClose();
  };

  const handleClose = () => {
    setRating(0);
    setReview('');
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={e => {
            const {locationX} = e.nativeEvent;
            const starWidth = moderateScale(30); // Approximate star width
            const isHalfStar = locationX < starWidth / 2;
            setRating(isHalfStar ? i - 0.5 : i);
          }}
          style={styles.starContainer}>
          <Ionicons
            name={
              rating >= i
                ? 'star'
                : rating >= i - 0.5
                ? 'star-half'
                : 'star-outline'
            }
            size={moderateScale(30)}
            color={themeColors.starColor}
          />
        </TouchableOpacity>,
      );
    }
    return stars;
  };
  useEffect(() => {
    const textsToTranslate = [
      restaurantName,
      'Your review here',
      'Leave a Review',
      'Later',
      'Write your review',
      'Yes, Submit Review',
      'How was your experience with',
    ];

    const uniqueTexts = Array.from(new Set(textsToTranslate));
    dispatch(fetchTranslations(uniqueTexts, lang));
  }, [lang]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          onClose();
          handleClose();
        }}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback
            onPress={e => {
              e.stopPropagation();
            }}>
            <LinearGradient
              colors={
                mode === 'light'
                  ? ['rgb(117,118,127)', 'rgb(99,101,111)']
                  : ['rgb(88,85,99)', 'rgb(57,51,70)']
              }
              style={[
                styles.modalContainer,
                Platform.OS === 'ios' && {
                  paddingHorizontal: scale(5),
                  paddingTop: scale(20),
                  paddingBottom: scale(10),
                  borderTopLeftRadius: moderateScale(20),
                  borderTopRightRadius: moderateScale(20),
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 0,
                },
              ]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <Text style={[styles.title, {color: themeColors.text}]}>
                {t('review_modal.leave_a_review')}
              </Text>

              <View
                style={[styles.divider, {backgroundColor: themeColors.divider}]}
              />

              <Text style={[styles.question, {color: themeColors.text}]}>
                {t('review_modal.how_was_your_experience')} {t(restaurantName)}?
              </Text>

              <View style={styles.starsContainer}>{renderStars()}</View>

              <View style={styles.contentInput}>
                <Text style={[styles.reviewLabel, {color: themeColors.text}]}>
                  {t('review_modal.write_your_review')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.inputBackground,
                      color: themeColors.text,
                      borderWidth: 1,
                      borderColor:
                        mode === 'light'
                          ? 'rgba(255, 255, 255, 0.5)'
                          : 'rgba(255, 255, 255, 0.3)',
                    },
                  ]}
                  placeholder={t('review_modal.your_review_here')}
                  placeholderTextColor="#9E9E9E"
                  multiline
                  value={review}
                  onChangeText={setReview}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    Keyboard.dismiss();
                  }}
                  blurOnSubmit={true}
                  enablesReturnKeyAutomatically={true}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.laterButton,
                    {
                      backgroundColor: themeColors.laterButton,
                      borderColor:
                        mode === 'light'
                          ? 'rgba(255, 255, 255, 0.5)'
                          : 'rgba(255, 255, 255, 0.3)',
                    },
                  ]}
                  onPress={onClose}>
                  <Text
                    style={[styles.laterButtonText, {color: themeColors.text}]}>
                    {t('review_modal.later')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    {
                      backgroundColor: themeColors.submitButton,
                      borderWidth: 1,
                      borderColor:
                        mode === 'light'
                          ? 'rgb(136, 161, 181)'
                          : 'rgb(123,153,254)',
                    },
                  ]}
                  onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>
                    {t('review_modal.yes_submit_review')}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    borderTopLeftRadius: getBorderRadius(20),
    borderTopRightRadius: getBorderRadius(20),
    paddingHorizontal: getSpacing(20),
    paddingTop: getSpacing(25),
    paddingBottom: getSpacing(30),
    alignItems: 'center',
  },
  title: {
    fontSize: getFontSize(22),
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  question: {
    fontSize: getFontSize(16),
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  starContainer: {
    marginHorizontal: SPACING.xs,
  },
  reviewLabel: {
    fontSize: getFontSize(16),
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  input: {
    width: '100%',
    height: moderateScale(120),
    borderRadius: getBorderRadius(10),
    padding: SPACING.md,
    textAlignVertical: 'top',
    marginBottom: SPACING.xl,
    textAlign: 'left',
  },
  contentInput: {
    width: Platform.OS === 'android' ? '100%' : '92%',
    height: moderateScale(120),
    borderRadius: getBorderRadius(10),
    textAlignVertical: 'top',
    marginBottom: SPACING.xl,
    textAlign: 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Platform.OS === 'android' ? getSpacing(10) : 0,
    marginBottom: Platform.OS === 'android' ? 0 : getSpacing(35),
    padding: Platform.OS === 'android' ? 0 : getSpacing(10),
  },
  laterButton: {
    borderRadius: getBorderRadius(30),
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  laterButtonText: {
    fontSize: getFontSize(16),
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: getBorderRadius(25),
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(16),
    fontWeight: '500',
  },
});

export default ReviewModal;
