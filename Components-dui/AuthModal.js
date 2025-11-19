import React, {useEffect, useRef} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BookMarkAddIcon from '../assets/svg/book_mark.svg';
import {
  getBorderRadius,
  getFontSize,
  getSpacing,
} from '../constants/responsive';
import {useTheme} from '../hooks/useTheme';
import {colors} from '../constants/colors';
import {useTranslation} from '../utils/translate';
import {fetchTranslations} from '../redux/translationSlice';
import {useDispatch, useSelector} from 'react-redux';
import BGLight from '../assets/images/lightAuth.png';
import BGDark from '../assets/images/darkAuth.png';
import LottieView from 'lottie-react-native';

const AuthModal = ({visible, onClose, message}) => {
  const isMounted = useRef(true);
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const lang = useSelector(state => state.language.lang);

  useEffect(() => {
    isMounted.current = true;

    const timer = setTimeout(() => {
      if (isMounted.current) {
        onClose();
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      isMounted.current = false;
    };
  }, [onClose]);

  const {mode} = useTheme();
  const currentColors = colors[mode];
  useEffect(() => {
    const textsToTranslate = ['Congratulations'];
    const uniqueTexts = Array.from(new Set(textsToTranslate));

    dispatch(fetchTranslations(uniqueTexts, lang));
  }, [lang]);

  const backgroundColor =
    mode === 'dark' ? 'rgb(232,231,233)' : 'rgb(242,243,243)';

  const loaderColor = mode === 'light' ? '#5e7f9a' : '#5266fd';

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, {backgroundColor: backgroundColor}]}>
          <View style={[styles.iconContainer]}>
            <Image
              source={mode === 'light' ? BGLight : BGDark}
              style={styles.backgroundImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, {color: currentColors.forgotText}]}>
            {t('Congratulations')}
          </Text>
          <Text style={[styles.message, {color: currentColors.forgotText}]}>
            {t(message)}
          </Text>
          <LottieView
            source={require('../assets/lottie/authAnimation.json')}
            autoPlay
            loop={true}
            style={{width: 120, height: 120}}
            colorFilters={[
              {
                keypath: 'Shape Layer 1',
                color: loaderColor,
              },
              {
                keypath: 'Shape Layer 2',
                color: loaderColor,
              },
              {
                keypath: 'Shape Layer 3',
                color: loaderColor,
              },
              {
                keypath: 'Shape Layer 4',
                color: loaderColor,
              },
              {
                keypath: 'Shape Layer 5',
                color: loaderColor,
              },
            ]}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '70%',
    height: '40%',
    padding: 20,
    //backgroundColor: 'rgb(232,231,233)',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: getSpacing(80),
    height: getSpacing(80),
    borderRadius: getBorderRadius(40),
    padding: getSpacing(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(20),
  },
  title: {
    fontSize: getFontSize(24),
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  backgroundImage: {
    borderRadius: getBorderRadius(10),
    width: getSpacing(90),
    height: getSpacing(90),
  },
});

export default AuthModal;
