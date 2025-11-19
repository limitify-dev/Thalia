import React, {useState} from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import {colors} from '../constants/colors';
import {useTheme} from '../hooks/useTheme';
import {useTranslation} from 'react-i18next';

const FilterButton = ({label, active, onPress, themeColors}) => {
  const {t} = useTranslation();
  const borderColor = '#fff';
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterButton,
        {
          backgroundColor: active
            ? themeColors.seeNowBtn
            : 'rgba(255, 255, 255, 0.4)',
          borderWidth: active ? 0 : 1, // Use 1 for consistent rendering
          borderColor: active ? '' : borderColor,
        },
      ]}>
      <Text style={[styles.filterButtonText, {color: themeColors.primary}]}>
        {t(label)}
      </Text>
    </TouchableOpacity>
  );
};

const FilterModal = ({
  showFilterModal,
  setShowFilterModal,
  sites,
  setFilteredSites,
  priceRange,
  setPriceRange,
  activeSort,
  setActiveSort,
  selectedDate,
  setSelectedDate,
  parseUserDate,
  onClearAllFilters, // new prop
}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];
  const gradientBackgroundBoxColors = {
    light: ['#727278', '#6a6870', '#5d5a63'],
    dark: ['#2f293e', '#4b4657', '#5c5863'],
  };
  const fallbackBackgroundColor = mode === 'light' ? '#6a6870' : '#4b4657';
  const {t, i18n} = useTranslation();
  const [localPriceRange, setLocalPriceRange] = useState({min: 0, max: 1000});
  const [localSelectedDate, setLocalSelectedDate] = useState(selectedDate);
  const [localActiveSort, setLocalActiveSort] = useState(activeSort);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(null);
  const [localStartDate, setLocalStartDate] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] =
    useState(false);
  const [priceError, setPriceError] = useState('');

  const handleStartDateConfirm = date => {
    const formattedDate = `${
      date.getMonth() + 1
    }/${date.getDate()}/${date.getFullYear()}`;
    setTempStartDate(formattedDate);
    setStartDatePickerVisibility(false);
    setLocalStartDate(formattedDate);
    if (localSelectedDate) {
      const startDateObj = parseUserDate(formattedDate);
      const endDateObj = parseUserDate(localSelectedDate);
      if (startDateObj && endDateObj && endDateObj < startDateObj) {
        setLocalSelectedDate(null);
        setTempSelectedDate(null);
        // Toast.show({
        //   type: 'error',
        //   text1: 'Invalid End Date',
        //   text2: 'End date has been reset as it was before the new start date.',
        // });
      }
    }
  };

  const handleDateConfirm = date => {
    const formattedDate = `${
      date.getMonth() + 1
    }/${date.getDate()}/${date.getFullYear()}`;
    setTempSelectedDate(formattedDate);
    setDatePickerVisibility(false);
    setLocalSelectedDate(formattedDate);
  };

  const applyFilters = () => {
    if (localPriceRange.min > localPriceRange.max) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Price Range',
        text2: 'Minimum price cannot be greater than maximum.',
      });
      return;
    }
    const startDateObj = localStartDate ? parseUserDate(localStartDate) : null;
    const endDateObj = localSelectedDate
      ? parseUserDate(localSelectedDate)
      : null;

    let filtered = [...sites];
    filtered = filtered.filter(site => {
      const ticketPrice = site.adultTicketPrice || 0;
      return (
        ticketPrice >= localPriceRange.min && ticketPrice <= localPriceRange.max
      );
    });

    if (localStartDate) {
      const parsedStartDate = parseUserDate(localStartDate);
      if (parsedStartDate) {
        const isoStartDate = parsedStartDate.toISOString().split('T')[0];
        filtered = filtered.filter(site => {
          const siteStartDate = new Date(site.startDate)
            .toISOString()
            .split('T')[0];
          return siteStartDate >= isoStartDate;
        });
      }
    }

    if (localSelectedDate) {
      const parsedEndDate = parseUserDate(localSelectedDate);
      if (parsedEndDate) {
        const isoEndDate = parsedEndDate.toISOString().split('T')[0];
        filtered = filtered.filter(site => {
          const siteEndDate = new Date(site.endDate)
            .toISOString()
            .split('T')[0];
          return siteEndDate <= isoEndDate;
        });
      }
    }

    if (localActiveSort === 'Best Rating') {
      filtered.sort((a, b) => {
        const ratingA = a.reviewStats?.averageRating || 0;
        const ratingB = b.reviewStats?.averageRating || 0;
        const totalReviewsA = a.reviewStats?.totalReviews || 0;
        const totalReviewsB = b.reviewStats?.totalReviews || 0;
        if (ratingA === ratingB) return totalReviewsB - totalReviewsA;
        return ratingB - ratingA;
      });
    } else if (localActiveSort === 'Relevance') {
      filtered.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }

    setFilteredSites(filtered);
    setPriceRange(localPriceRange);
    setActiveSort(localActiveSort);
    setSelectedDate(localSelectedDate);
    setShowFilterModal(false);
  };

  return (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => {
        setShowFilterModal(false);
        setLocalPriceRange({min: 0, max: 1000});
        setLocalActiveSort('Relevance');
        setLocalSelectedDate(null);
        setLocalStartDate(null);
        setTempSelectedDate(null);
        setTempStartDate(null);
        setPriceError('');
        if (onClearAllFilters) onClearAllFilters();
      }}
      hardwareAccelerated={true}>
      <SafeAreaView style={styles.modalContainer}>
        <TouchableWithoutFeedback
          onPress={() => {
            setShowFilterModal(false);
            setLocalPriceRange({min: 0, max: 1000});
            setLocalActiveSort('Relevance');
            setLocalSelectedDate(null);
            setLocalStartDate(null);
            setTempSelectedDate(null);
            setTempStartDate(null);
            setPriceError('');
            if (onClearAllFilters) onClearAllFilters();
          }}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalWrapper}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: fallbackBackgroundColor},
            ]}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text
                  style={[styles.modalTitle, {color: currentColors.primary}]}>
                  {t('filter_modal.sort')}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setLocalPriceRange({min: 0, max: 1000});
                    setLocalActiveSort('Relevance');
                    setLocalSelectedDate(null);
                    setLocalStartDate(null);
                    setTempSelectedDate(null);
                    setTempStartDate(null);
                    setPriceError('');
                    if (onClearAllFilters) onClearAllFilters();
                  }}>
                  <Text
                    style={[styles.clearText, {color: currentColors.primary}]}>
                    {t('filter_modal.clear')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sortContainer}>
                <FilterButton
                  label={t('filter_modal.relevance')}
                  active={localActiveSort === 'Relevance'}
                  onPress={() => setLocalActiveSort('Relevance')}
                  themeColors={currentColors}
                />
                <FilterButton
                  label={t('filter_modal.relevance')}
                  active={localActiveSort === 'Best Rating'}
                  onPress={() => setLocalActiveSort('Best Rating')}
                  themeColors={currentColors}
                />
                <FilterButton
                  label={t('filter_modal.near')}
                  active={localActiveSort === 'Near to Me'}
                  onPress={() => setLocalActiveSort('Near to Me')}
                  themeColors={currentColors}
                />
              </View>

              <View style={styles.section}>
                <Text
                  style={[styles.sectionTitle, {color: currentColors.primary}]}>
                  {t('filter_modal.range')}
                </Text>
                <View style={styles.buildingSizeContainer}>
                  <Text
                    style={[
                      styles.buildingSizeTextIn,
                      {color: currentColors.primary},
                    ]}>
                    {t('filter_modal.min')}
                  </Text>
                  <View
                    style={[
                      styles.borderContainer,
                      {borderColor: currentColors.primary},
                    ]}>
                    <View style={[styles.buildingSizeValue, {borderWidth: 0}]}>
                      <TextInput
                        style={[
                          styles.buildingSizeText,
                          {
                            color: currentColors.primary,
                            width: 40,
                          },
                        ]}
                        value={
                          localPriceRange.min === '' ||
                          localPriceRange.min === undefined
                            ? ''
                            : `$${localPriceRange.min}`
                        }
                        numberOfLines={1}
                        onChangeText={text => {
                          const cleaned = text
                            .replace(/[^0-9]/g, '')
                            .slice(0, 3);
                          if (cleaned === '') {
                            setLocalPriceRange(prev => ({...prev, min: 0}));
                            return;
                          }
                          const newMin = parseInt(cleaned, 10);
                          const currentMax = localPriceRange.max;
                          setLocalPriceRange(prev => ({...prev, min: newMin}));
                          if (newMin > currentMax) {
                            setPriceError('filter_modal.error');
                          } else {
                            setPriceError('');
                          }
                        }}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={currentColors.primary + '80'}
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.buildingSizeTextIn,
                      {color: currentColors.primary},
                    ]}>
                    {t('filter_modal.max')}
                  </Text>
                  <View
                    style={[
                      styles.priceBorderContainer,
                      {borderColor: currentColors.primary},
                    ]}>
                    <View style={[styles.buildingSizeValue, {borderWidth: 0}]}>
                      <TextInput
                        style={[
                          styles.buildingSizeText,
                          {color: currentColors.primary, width: 47},
                        ]}
                        numberOfLines={1}
                        value={`$${String(localPriceRange.max)}`}
                        onChangeText={text => {
                          const cleaned = text
                            .replace(/[^0-9]/g, '')
                            .slice(0, 4);
                          const newMax =
                            cleaned === '' ? 1000 : parseInt(cleaned);
                          setLocalPriceRange(prev => ({...prev, max: newMax}));
                          if (localPriceRange.min > newMax) {
                            setPriceError('filter_modal.maxerror');
                          } else {
                            setPriceError('');
                          }
                        }}
                        keyboardType="numeric"
                        placeholder="1000"
                        placeholderTextColor={currentColors.primary + '80'}
                      />
                    </View>
                  </View>
                </View>
                {priceError ? (
                  <Text style={{color: 'red', marginTop: 8, marginLeft: 8}}>
                    {t(priceError)}
                  </Text>
                ) : null}
              </View>

              <View style={styles.borderContainer}>
                <View style={[styles.dateButton, {borderWidth: 0}]}>
                  <TouchableOpacity
                    onPress={() => setStartDatePickerVisibility(true)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                    <Icon
                      name="calendar-outline"
                      size={24}
                      color={currentColors.primary}
                    />
                    <Text
                      style={[
                        styles.dateButtonText,
                        {color: currentColors.primary, flex: 1},
                      ]}>
                      {tempStartDate ||
                        localStartDate ||
                        t('filter_modal.startdate')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.borderContainer}>
                <View style={[styles.dateButton, {borderWidth: 0}]}>
                  <TouchableOpacity
                    onPress={() => setDatePickerVisibility(true)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                    <Icon
                      name="calendar-outline"
                      size={24}
                      color={currentColors.primary}
                    />
                    <Text
                      style={[
                        styles.dateButtonText,
                        {color: currentColors.primary, flex: 1},
                      ]}>
                      {tempSelectedDate ||
                        localSelectedDate ||
                        t('filter_modal.enddate')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.applyButton,
                  {backgroundColor: currentColors.seeNowBtn},
                ]}
                onPress={() => {
                  if (localPriceRange.min > localPriceRange.max) {
                    Toast.show({
                      type: 'error',
                      text1: 'Invalid Price Range',
                      text2: 'Minimum price cannot be greater than maximum.',
                    });
                    return;
                  }
                  const startDateObj = localStartDate
                    ? parseUserDate(localStartDate)
                    : null;
                  const endDateObj = localSelectedDate
                    ? parseUserDate(localSelectedDate)
                    : null;
                  // if (startDateObj && endDateObj && endDateObj <= startDateObj)
                  // {
                  //   Toast.show({
                  //     type: 'error',
                  //     text1: 'Invalid End Date',
                  //     text2: `End date must be after the start date (${localStartDate}).`,
                  //   });
                  //   return;
                  // }

                  applyFilters();
                }}>
                <Text
                  style={[
                    styles.applyButtonText,
                    {color: currentColors.primary},
                  ]}>
                  {t('filter_modal.filter')}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <DateTimePickerModal
              isVisible={isStartDatePickerVisible}
              mode="date"
              onConfirm={handleStartDateConfirm}
              onCancel={() => setStartDatePickerVisibility(false)}
            />
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={() => setDatePickerVisibility(false)}
              minimumDate={
                localStartDate
                  ? new Date(parseUserDate(localStartDate).getTime())
                  : undefined
              }
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  modalOverlay: {
    flex: 1,
  },
  modalWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    ...Platform.select({
      ios: {lineHeight: 24},
    }),
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
    ...Platform.select({
      ios: {lineHeight: 18},
    }),
  },
  sortContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'center',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    ...Platform.select({
      ios: {lineHeight: 18},
    }),
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    ...Platform.select({
      ios: {lineHeight: 20},
    }),
  },
  buildingSizeContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    // gap:  12,
    // backgroundColor: 'red',
  },
  buildingSizeLabel: {
    fontSize: 14,
    ...Platform.select({
      ios: {lineHeight: 20},
    }),
  },
  borderContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    overflow: 'hidden',
    marginBottom: 16,
  },
  priceBorderContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    overflow: 'hidden',
    marginBottom: 16,
    // backgroundColor: 'blue',
  },
  buildingSizeValue: {
    paddingVertical: Platform.OS === 'ios' ? 10 : 5,
    paddingHorizontal: Platform.OS === 'ios' ? 30 : 30,
    backgroundColor: '#6a6870',
  },
  buildingSizeText: {
    fontSize: 14,
    fontWeight: '500',
    ...Platform.select({
      ios: {paddingVertical: 4},
    }),
  },
  buildingSizeTextIn: {
    fontSize: 14,
    marginBottom: 15,
    fontWeight: '500',
    ...Platform.select({
      ios: {paddingVertical: 4},
    }),
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    backgroundColor: '#6a6870',
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    ...Platform.select({
      ios: {lineHeight: 20},
    }),
    textAlign: 'left',
  },
  applyButton: {
    width: '70%',
    alignSelf: 'center',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    ...Platform.select({
      ios: {lineHeight: 20},
    }),
  },
});

export default FilterModal;
