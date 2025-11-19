import React, {useState, useEffect} from 'react';
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
import Toast from 'react-native-toast-message';
import {colors} from '../constants/colors';
import {useTheme} from '../hooks/useTheme';
import {convertTo24Hour, formatTime} from '../utils/siteHelpers';
import {getSpacing, moderateScale, scale} from '../constants/responsive';
import CustomButton from './CustomButton';
import {useTranslation} from 'react-i18next';
import '../i18n';

const {width, height} = Dimensions.get('window');

const TimePickerModal = ({
  visible,
  onClose,
  onSelect,
  selectedTime,
  openingHours,
  selectedDate,
}) => {
  const {t} = useTranslation();
  const {mode} = useTheme();
  const currentColors = colors[mode];

  // Initialize state based on selectedTime or default to 12:00:00 AM
  const [hours, setHours] = useState(
    selectedTime ? parseInt(selectedTime.split(':')[0]) : 12,
  );
  const [minutes, setMinutes] = useState(
    selectedTime ? parseInt(selectedTime.split(':')[1]) : 0,
  );
  const [seconds, setSeconds] = useState(
    selectedTime ? parseInt(selectedTime.split(':')[2]) : 0,
  );
  const [period, setPeriod] = useState(
    selectedTime
      ? parseInt(selectedTime.split(':')[0]) >= 12 &&
        selectedTime.includes('PM')
        ? 'PM'
        : 'AM'
      : 'AM',
  );

  // State to store valid time range for the selected day
  const [validTimeRange, setValidTimeRange] = useState({
    opening: null,
    closing: null,
  });

  // Determine the day of the week from selectedDate and get opening/closing times
  useEffect(() => {
    if (selectedDate && openingHours) {
      const date = new Date(selectedDate);
      const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const dayName = days[date.getDay()];
      const daySchedule = openingHours.find(
        schedule => schedule.day.toLowerCase() === dayName.toLowerCase(),
      );

      if (daySchedule) {
        setValidTimeRange({
          opening: daySchedule.opening,
          closing: daySchedule.closing,
        });
      } else {
        setValidTimeRange({opening: null, closing: null});
      }
    }
  }, [selectedDate, openingHours]);

  // Generate numbers for hours (1-12), minutes (00-59), and seconds (00-59)
  const generateTimeNumbers = type => {
    const numbers = [];
    let max = type === 'hours' ? 12 : 60; // Hours from 1 to 12, others from 0 to 59
    let start = type === 'hours' ? 1 : 0;
    for (let i = start; i <= max; i++) {
      if (type === 'hours' && i === 0) continue; // Skip 0 for hours
      numbers.push(i.toString().padStart(2, '0'));
    }
    return numbers;
  };

  // Validate selected time against opening and closing hours
  const isTimeValid = () => {
    if (!validTimeRange.opening || !validTimeRange.closing) {
      return false; // Gallery is closed on this day
    }

    const selectedTime24 = convertTo24Hour(
      `${hours}:${minutes}:${seconds} ${period}`,
    );
    const [selectedHour, selectedMinute] = selectedTime24
      .split(':')
      .map(Number);
    const selectedTimeMinutes = selectedHour * 60 + selectedMinute;

    const [openHour, openMinute] = validTimeRange.opening
      .split(':')
      .map(Number);
    const [closeHour, closeMinute] = validTimeRange.closing
      .split(':')
      .map(Number);

    const openTimeMinutes = openHour * 60 + openMinute;
    const closeTimeMinutes = closeHour * 60 + closeMinute;

    return (
      selectedTimeMinutes >= openTimeMinutes &&
      selectedTimeMinutes <= closeTimeMinutes
    );
  };

  const handleContinue = () => {
    if (!selectedDate) {
      Toast.show({
        type: 'error',
        text1: t('Date'),
        text1: t('time_picker_screen.errorMessages.noDateSelected'),
      });
      return;
    }

    if (!validTimeRange.opening) {
      Toast.show({
        type: 'error',
        text1: t('Time'),
        text1: t('time_picker_screen.errorMessages.galleryClosed'),
      });
      return;
    }

    if (!isTimeValid()) {
      const openTimeFormatted = formatTime(validTimeRange.opening);
      const closeTimeFormatted = formatTime(validTimeRange.closing);
      Toast.show({
        type: 'error',
        text1: t('Time'),
        text2: t('time_picker_screen.errorMessages.invalidTime', {
          openTime: openTimeFormatted,
          closeTime: closeTimeFormatted,
        }),
      });
      return;
    }

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
    onSelect(formattedTime);
    onClose();
  };

  const gradientBackgroundBoxColors = {
    light: ['rgb(123,124,133)', 'rgb(125,125,134)'],
    dark: ['rgb(86,81,97)', 'rgb(77,72,89)'],
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={gradientBackgroundBoxColors[mode]}
            start={{x: 1, y: 1}}
            end={{x: 0, y: 0}}
            style={[
              styles.modalContainer,
              Platform.OS === 'ios' && {
                paddingTop: scale(10),
                paddingBottom: scale(10),
                borderTopLeftRadius: moderateScale(20),
                borderTopRightRadius: moderateScale(20),
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 0,
              },
            ]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.scrollContent}>
              <View style={styles.header}>
                <View style={styles.headerRight} />
              </View>
              <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollView}>
                <Text style={[styles.title, {color: '#fff'}]}>
                  {t('time_picker_screen.chooseTime')}
                </Text>
                <View style={[styles.timePicker]}>
                  <View style={styles.timePickerContent}>
                    {/* Hours */}
                    <ScrollView
                      style={styles.timeColumn}
                      showsVerticalScrollIndicator={false}>
                      {generateTimeNumbers('hours').map(hour => (
                        <TouchableOpacity
                          key={hour}
                          style={[
                            styles.timeOption,
                            hours === parseInt(hour) && {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                          ]}
                          onPress={() => setHours(parseInt(hour))}>
                          <Text
                            style={[
                              styles.timeText,
                              {color: '#52587b'},
                              hours === parseInt(hour) && {
                                color: '#FFFFFF',
                                fontWeight: '600',
                              },
                            ]}>
                            {hour}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <Text style={[styles.timeSeparator, {color: '#FFFFFF'}]}>
                      :
                    </Text>

                    {/* Minutes */}
                    <ScrollView
                      style={styles.timeColumn}
                      showsVerticalScrollIndicator={false}>
                      {generateTimeNumbers('minutes').map(minute => (
                        <TouchableOpacity
                          key={minute}
                          style={[
                            styles.timeOption,
                            minutes === parseInt(minute) && {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                          ]}
                          onPress={() => setMinutes(parseInt(minute))}>
                          <Text
                            style={[
                              styles.timeText,
                              {color: '#52587b'},
                              minutes === parseInt(minute) && {
                                color: '#FFFFFF',
                                fontWeight: '600',
                              },
                            ]}>
                            {minute}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <Text style={[styles.timeSeparator, {color: '#FFFFFF'}]}>
                      :
                    </Text>

                    {/* Seconds */}
                    <ScrollView
                      style={styles.timeColumn}
                      showsVerticalScrollIndicator={false}>
                      {generateTimeNumbers('seconds').map(second => (
                        <TouchableOpacity
                          key={second}
                          style={[
                            styles.timeOption,
                            seconds === parseInt(second) && {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                          ]}
                          onPress={() => setSeconds(parseInt(second))}>
                          <Text
                            style={[
                              styles.timeText,
                              {color: '#52587b'},
                              seconds === parseInt(second) && {
                                color: '#FFFFFF',
                                fontWeight: '600',
                              },
                            ]}>
                            {second}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {/* AM/PM */}
                    <View style={styles.periodColumn}>
                      <TouchableOpacity
                        style={[
                          styles.periodOption,
                          period === 'AM' && {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        ]}
                        onPress={() => setPeriod('AM')}>
                        <Text
                          style={[
                            styles.periodText,
                            {color: 'rgba(255, 255, 255, 0.5)'},
                            period === 'AM' && {
                              color: '#FFFFFF',
                              fontWeight: '600',
                            },
                          ]}>
                          AM
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.periodOption,
                          period === 'PM' && {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        ]}
                        onPress={() => setPeriod('PM')}>
                        <Text
                          style={[
                            styles.periodText,
                            {color: 'rgba(255, 255, 255, 0.5)'},
                            period === 'PM' && {
                              color: '#FFFFFF',
                              fontWeight: '600',
                            },
                          ]}>
                          PM
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.button}>
                  <CustomButton
                    title={t('time_picker_screen.continue')}
                    onPress={handleContinue}
                    variant="primary"
                  />
                </View>
              </ScrollView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: height * 0.5,
    width: '100%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  modalContainer: {
    height: '100%',
    width: '100%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 0,
  },
  timePicker: {
    width: '85%',
    alignSelf: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 22,
  },
  timePickerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    padding: 25,
    borderRadius: 30,
    backgroundColor: '#8b88a5',
    shadowColor: '#fff',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgb(196,195,210)',
  },
  timeColumn: {
    width: 60,
    height: '100%',
  },
  timeOption: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  timeText: {
    fontSize: 20,
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  periodColumn: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  periodOption: {
    height: 40,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 4,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    width: '78%',
    paddingVertical: 12,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: getSpacing(-8),
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default TimePickerModal;
