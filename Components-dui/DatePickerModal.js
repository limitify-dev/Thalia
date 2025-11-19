import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

// Import Calendar from react-native-calendars
import {Calendar} from 'react-native-calendars';
import {useTheme} from '../hooks/useTheme';
import {colors} from '../constants/colors';
import {
  getModalWidth,
  getScreenHeightPercentage,
  getSpacing,
  moderateScale,
  scale,
} from '../constants/responsive';
import CustomButton from './CustomButton';
import {useTranslation} from 'react-i18next';
import '../i18n';

const {width} = Dimensions.get('window');

const PRIMARY_BLUE = '#4B6CFA';

const DatePickerModal = ({
  visible,
  onClose,
  onSelect,
  selectedDate,
  chooseDate,
  confirm,
}) => {
  const [selected, setSelected] = useState(selectedDate || '');
  // const dispatch = useDispatch();
  const {t} = useTranslation();

  // useEffect(() => {
  //   dispatch(
  //     fetchTranslations(['Choose The Date', 'Continue', 'Test Key'], lang),
  //   );
  // }, [lang]);

  const handleDayPress = day => {
    setSelected(day.dateString);
  };

  const handleContinue = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  const {mode} = useTheme();
  const currentColors = colors[mode];
  const gradientBackgroundBoxColors = {
    light: ['rgb(123,124,133)', 'rgb(125,125,134)'],
    dark: ['rgb(86,81,97)', 'rgb(77,72,89)'],
  };

  const calendarWidth = getModalWidth();
  const calendarHeight = moderateScale(300);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={gradientBackgroundBoxColors[mode]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[
              styles.modalContainer,
              Platform.OS === 'ios' && {
                paddingHorizontal: scale(3),
                paddingTop: scale(10),
                paddingBottom: scale(10),
                borderTopLeftRadius: moderateScale(20),
                borderTopRightRadius: moderateScale(20),
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 0,
              },
            ]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollView}>
              <Text style={styles.title}>
                {t('reservation_screen.chooseDate')}{' '}
              </Text>

              <View style={styles.calendarBox}>
                <Calendar
                  onDayPress={handleDayPress}
                  markedDates={
                    selected
                      ? {
                          [selected]: {
                            selected: true,
                            selectedColor:
                              currentColors.calanderCurrentDate[mode],
                          },
                        }
                      : {}
                  }
                  theme={{
                    backgroundColor: 'transparent',
                    calendarBackground: 'rgb(138,136,165)',
                    textSectionTitleColor: '#fff',
                    selectedDayBackgroundColor: currentColors.seeNowBtn,
                    todayTextColor: PRIMARY_BLUE,
                    dayTextColor: 'rgb(14,37,82)',
                    textDisabledColor: 'rgb(77, 102, 151)',
                    arrowColor: '#AAB2D5',
                    monthTextColor: '#fff',
                    indicatorColor: 'white',
                    textDayFontWeight: '600',
                    textMonthFontWeight: '600',
                    textDayHeaderFontWeight: '600',
                  }}
                  style={{
                    borderRadius: 30,
                    width: width * 0.85,
                    alignSelf: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    shadowColor: '#fff',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.15,
                    shadowRadius: 10,
                    elevation: 1,
                    padding: 10,
                    marginRight: Platform.OS === 'ios ' ? 40 : 0,
                  }}
                  minDate={new Date().toISOString().split('T')[0]}
                />
              </View>

              {/* <TouchableOpacity
                style={[
                  styles.button,
                  !selected && {opacity: 0.5},
                  {backgroundColor: currentColors.calanderCurrentDate},
                ]}
                onPress={handleContinue}
                disabled={!selected}
                activeOpacity={0.8}>
                <Text style={styles.buttonText}>{t(confirm)}</Text>
              </TouchableOpacity> */}

              <CustomButton
                title={t('reservation_screen.continue')}
                onPress={handleContinue}
                variant="primary"
                disabled={!selected}
              />
            </ScrollView>
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
  modalContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    height:
      Platform.OS === 'ios'
        ? getScreenHeightPercentage(62)
        : getScreenHeightPercentage(63),
  },
  title: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 32,
  },
  calendarBox: {
    marginBottom: 32,
  },
  button: {
    width: '83%',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
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
  scrollView: {
    flexGrow: 1,
  },
});

export default DatePickerModal;
