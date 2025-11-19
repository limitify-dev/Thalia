import React, {useState} from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../constants/colors';
import {useTheme} from '../contexts/ThemeContext';
import CustomButton from './CustomButton';
import {Calendar} from 'react-native-calendars';
import {
  getModalHeight,
  getSpacing,
  getFontSize,
  getBorderRadius,
  getIconSize,
  SPACING,
  getAvatarSize,
  getModalWidth,
  getCardHeight,
  getButtonHeight,
  getScreenHeightPercentage,
} from '../constants/responsive';

const {width, height} = Dimensions.get('window');

const SimpleDatePicker = ({visible, onClose, onSelect, selectedDate}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];
  const [selected, setSelected] = useState(
    selectedDate ? new Date(selectedDate) : null,
  );
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleDayPress = day => {
    const date = new Date(day.dateString);
    setSelected(date);
    onSelect(date);
    onClose();
  };

  const handleDone = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  // Format the selected date for the markedDates prop
  const getMarkedDates = () => {
    if (!selected) return {};

    const dateString = selected.toISOString().split('T')[0];
    return {
      [dateString]: {
        selected: true,
        selectedColor: colors.primary,
      },
    };
  };

  const handleMonthPress = () => {
    setShowMonthPicker(true);
    setShowYearPicker(false);
  };

  const handleYearPress = () => {
    setShowYearPicker(true);
    setShowMonthPicker(false);
  };

  const handleMonthSelect = month => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month);
    setCurrentDate(newDate);
    setShowMonthPicker(false);
  };

  const handleYearSelect = year => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setShowYearPicker(false);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    const startYear = currentYear - 90;
    const endYear = currentYear;

    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }

    return years;
  };

  const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Custom theme for the calendar
  const calendarTheme = {
    backgroundColor: 'transparent',
    calendarBackground: 'transparent',
    textSectionTitleColor: '#FFFFFF',
    selectedDayBackgroundColor: colors.primary,
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: colors.secondary,
    dayTextColor: '#FFFFFF',
    textDisabledColor: 'rgba(255, 255, 255, 0.3)',
    dotColor: colors.primary,
    selectedDotColor: '#FFFFFF',
    arrowColor: '#FFFFFF',
    monthTextColor: '#FFFFFF',
    indicatorColor: '#FFFFFF',
    textDayFontWeight: '500',
    textMonthFontWeight: '600',
    textDayHeaderFontWeight: '500',
    textDayFontSize: 14,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 12,
  };

  const renderMonthPicker = () => {
    return (
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowMonthPicker(false)}>
            <Icon name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.pickerTitle}>Select Month</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.monthGrid}>
          {MONTHS.map((month, index) => (
            <TouchableOpacity
              key={month}
              style={[
                styles.monthItem,
                currentDate.getMonth() === index && styles.selectedMonthItem,
              ]}
              onPress={() => handleMonthSelect(index)}>
              <Text
                style={[
                  styles.monthItemText,
                  currentDate.getMonth() === index &&
                    styles.selectedMonthItemText,
                ]}>
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderYearPicker = () => {
    const years = generateYearOptions();

    return (
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowYearPicker(false)}>
            <Icon name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.pickerTitle}>Select Year</Text>
          <View style={styles.headerRight} />
        </View>
        <FlatList
          data={years}
          keyExtractor={item => item.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.yearItem,
                currentDate.getFullYear() === item && styles.selectedYearItem,
              ]}
              onPress={() => handleYearSelect(item)}>
              <Text
                style={[
                  styles.yearItemText,
                  currentDate.getFullYear() === item &&
                    styles.selectedYearItemText,
                ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.yearList}
        />
      </View>
    );
  };

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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}>
          <LinearGradient
            colors={['rgb(15, 15, 15)', 'rgb(97, 88, 101)']}
            start={{x: 1, y: 1}}
            end={{x: 0, y: 0}}
            style={styles.modalContainer}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              <View style={styles.contentContainer}>
                {showMonthPicker ? (
                  renderMonthPicker()
                ) : showYearPicker ? (
                  renderYearPicker()
                ) : (
                  <>
                    <View style={styles.header}>
                      <TouchableOpacity
                        style={[styles.backButton, {borderColor: '#FFFFFF'}]}
                        onPress={onClose}>
                        <Icon name="chevron-back" size={24} color="#FFFFFF" />
                      </TouchableOpacity>
                      <View style={styles.headerRight} />
                    </View>

                    <View
                      style={[
                        styles.calendar,
                        {backgroundColor: currentColors.skyBlue},
                      ]}>
                      <View style={styles.calendarHeader}>
                        <TouchableOpacity
                          style={styles.dateSelector}
                          onPress={handleMonthPress}>
                          <Text style={styles.calendarHeaderText}>
                            {MONTHS[currentDate.getMonth()]}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.dateSelector}
                          onPress={handleYearPress}>
                          <Text style={styles.calendarHeaderText}>
                            {currentDate.getFullYear()}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Calendar
                        current={currentDate.toISOString().split('T')[0]}
                        onDayPress={handleDayPress}
                        markedDates={getMarkedDates()}
                        theme={calendarTheme}
                        hideExtraDays={true}
                        enableSwipeMonths={true}
                        firstDay={1}
                        hideDayNames={false}
                        showWeekNumbers={false}
                        disableMonthChange={false}
                        hideArrows={false}
                        onMonthChange={month => {
                          setCurrentDate(new Date(month.dateString));
                        }}
                      />
                    </View>
                  </>
                )}
              </View>
            </ScrollView>

            <View style={styles.buttonWrapper}>
              <CustomButton
                title="Done"
                onPress={handleDone}
                variant="primary"
                style={styles.continueButton}
              />
            </View>
          </LinearGradient>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: getModalHeight(),
    minHeight: getScreenHeightPercentage(50),
    width: '100%',
    backgroundColor: 'transparent',
    borderTopLeftRadius: getBorderRadius(25),
    borderTopRightRadius: getBorderRadius(25),
    overflow: 'hidden',
  },

  modalContainer: {
    height: '100%',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingTop: getSpacing(20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getSpacing(20),
    marginBottom: getSpacing(20),
  },
  backButton: {
    width: getIconSize(40),
    height: getIconSize(40),
    borderRadius: getBorderRadius(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  headerRight: {
    width: getIconSize(40),
  },
  calendar: {
    margin: getSpacing(20),
    padding: getSpacing(16),
    borderRadius: getBorderRadius(22),
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(10),
    gap: getSpacing(10),
  },
  dateSelector: {
    padding: getSpacing(8),
    borderRadius: getBorderRadius(8),
  },
  calendarHeaderText: {
    fontSize: getFontSize(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueButton: {
    maxWidth: '90%',
    marginHorizontal: 'auto',
    marginBottom: getSpacing(20),
    alignSelf: 'center',
  },
  pickerContainer: {
    flex: 1,
    margin: getSpacing(20),
    padding: getSpacing(16),
    borderRadius: getBorderRadius(22),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getSpacing(20),
    paddingHorizontal: getSpacing(10),
  },
  pickerTitle: {
    fontSize: getFontSize(18),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthItem: {
    width: '30%',
    height: getButtonHeight(),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(10),
    borderRadius: getBorderRadius(10),
  },
  selectedMonthItem: {
    backgroundColor: colors.primary,
  },
  monthItemText: {
    fontSize: getFontSize(16),
    color: '#FFFFFF',
  },
  selectedMonthItemText: {
    fontWeight: '600',
  },
  yearList: {
    paddingHorizontal: getSpacing(10),
  },
  yearItem: {
    height: getButtonHeight(),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(10),
    borderRadius: getBorderRadius(10),
  },
  selectedYearItem: {
    backgroundColor: colors.primary,
  },
  yearItemText: {
    fontSize: getFontSize(16),
    color: '#FFFFFF',
  },
  selectedYearItemText: {
    fontWeight: '600',
  },
});

export default SimpleDatePicker;
