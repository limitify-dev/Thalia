'use client';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {LinearGradient} from 'react-native-linear-gradient';
import {colors} from '../constants/colors';
import {useNavigation} from '@react-navigation/native';
import RatingIcon from '../assets/svg/rating.svg';
import ClockIcon from '../assets/svg/clock.svg';
import LocationIcon from '../assets/svg/location.svg';
import BookmarkIcon from '../assets/svg/bookmark.svg';
import LightBookmarkIcon from '../assets/light_icon/book.svg';
import LightClockIcon from '../assets/light_icon/clock.svg';
import LightLocationIcon from '../assets/light_icon/loction.svg';
import LightTempIcon from '../assets/light_icon/tempIcon.svg';
import TempIcon from '../assets/svg/temp.svg';
import {useTheme} from '../hooks/useTheme';
import {useTranslation} from '../utils/translate';

const ExhibitionCardSearch = ({
  title,
  location,
  item,
  time,
  type,
  rating,
  image,
  startTime,
  endTime,
  onPress,
  isFirstItem = false,
  showBookmarkIcon = true,
  opening,
  closing,
  categories,
}) => {
  const {t} = useTranslation();
  const {mode} = useTheme();
  const navigation = useNavigation();
  const {width, height} = useWindowDimensions();

  const currentColors = colors[mode];

  const formatTime = isoString => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);
  const borderColor = '#5E4B8B';
  const gradientBackgroundBoxColors = {
    light: ['#cdd5e2', '#cdd5e2'],
    dark: ['#695f85', '#3c2e5f'],
  };

  const currentGradientColors = gradientBackgroundBoxColors[mode];

  const formatTimeRange = (opening, closing) => {
    try {
      if (opening && closing) {
        const formatTime = time => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours, 10);
          const period = hour >= 12 ? 'PM' : 'AM';
          const formattedHour = hour % 12 || 12;
          return `${formattedHour}:${minutes} ${period}`;
        };
        return `${formatTime(opening)} to ${formatTime(closing)}`;
      }
      return 'Time not specified';
    } catch (e) {
      return 'Time not available';
    }
  };
  const translatedLocation = t(location);
  const shortLocation = translatedLocation.split(' ').slice(0, 3).join(' ');
  return (
    <TouchableOpacity
      style={[
        styles.exhibitionCardBox,
        isFirstItem ? styles.firstExhibitionCard : styles.smallExhibitionCard,
        {width: width * 0.9, height: height * 0.13, alignSelf: 'center'},
        {
          borderWidth: mode === 'light' ? 1 : 1.3,
          borderColor: mode === 'light' ? '#fff' : borderColor,
        },
      ]}
      onPress={() =>
        navigation.navigate('DetailScreenFeature', {
          item: item,
          screenName: 'SearchScreen',
        })
      }>
      <LinearGradient
        colors={currentGradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[
          styles.gradientBackgroundBox,
          isFirstItem ? {} : styles.smallGradientBox,
        ]}>
        {isFirstItem ? (
          <>
            <Image source={image} style={styles.cardImage} />
            <View style={styles.bannerContainer}>
              <Text style={styles.bannerText}>
                {t('Exhibition at the')} {t(title)}
              </Text>
            </View>
            <View style={styles.firstCardContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.firstCardTitle}>{t(title)}</Text>

                <View style={styles.ratingContainer}>
                  <RatingIcon />
                  <Text style={styles.ratingText}>{rating || 0}</Text>
                </View>
              </View>

              <View style={styles.detailsGroup}>
                <View style={styles.detailRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Modern Art</Text>
                  </View>
                  <View style={styles.timeContainer}>
                    <ClockIcon />
                    <Text style={styles.timeText}>
                      {`${formattedStartTime} To ${formattedEndTime}`}
                    </Text>
                  </View>
                </View>
                <View style={[styles.detailRow, {marginTop: 8}]}>
                  <View style={styles.locationContainer}>
                    <LocationIcon />
                    <Text style={styles.locationText}>{location}</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            <Image source={image} style={styles.smallCardImage} />
            <View style={styles.smallCardContent}>
              <View style={styles.smallCardHeader}>
                <Text
                  style={[
                    styles.smallCardTitle,
                    {color: currentColors.titleColor},
                  ]}>
                  {t(title)}
                </Text>
                <TouchableOpacity style={styles.smallBookmarkButton}>
                  {showBookmarkIcon &&
                    (mode === 'dark' ? (
                      <BookmarkIcon />
                    ) : (
                      <LightBookmarkIcon />
                    ))}
                </TouchableOpacity>
              </View>

              <View style={{justifyContent: 'center', bottom: 4, paddingh: 5}}>
                <View style={styles.smallLocationContainer}>
                  {mode === 'dark' ? (
                    <LocationIcon color="#E0E0E0" width={12} />
                  ) : (
                    <LightLocationIcon color="rgb(70,73,79)" width={12} />
                  )}
                  <Text
                    style={[
                      styles.smallLocationText,
                      {color: currentColors.cardTextExb},
                    ]}
                    numberOfLines={1}>
                    {shortLocation}
                  </Text>
                </View>

                <View style={styles.smallDetailsRow}>
                  {mode === 'dark' ? (
                    <TempIcon color="#E0E0E0" width={12} />
                  ) : (
                    <LightTempIcon color="rgb(70,73,79)" width={12} />
                  )}
                  <Text
                    style={[
                      styles.smallDetailText,
                      {color: currentColors.cardTextExb},
                    ]}>
                    {t('Temporary Exhibition' + '')}
                    <Text
                      style={[
                        styles.smallDetailText,
                        {color: currentColors.cardTextExb},
                      ]}>
                      {t(
                        categories && categories.length > 0
                          ? categories[0]
                          : 'No Category',
                      )}
                    </Text>
                  </Text>
                </View>

                <View style={styles.smallTimeContainer}>
                  {mode === 'dark' ? (
                    <ClockIcon color="#E0E0E0" width={12} />
                  ) : (
                    <LightClockIcon color="rgb(70,73,79)" width={12} />
                  )}
                  <Text
                    style={[
                      styles.smallTimeText,
                      {color: currentColors.cardTextExb},
                    ]}>
                    {formatTimeRange(opening, closing)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  exhibitionCardBox: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  firstExhibitionCard: {
    height: 360,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallExhibitionCard: {
    height: 100,
  },
  gradientBackgroundBox: {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  smallGradientBox: {
    flexDirection: 'row',
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  bannerContainer: {
    backgroundColor: '#4169E1',
    padding: 10,
    width: '100%',
  },
  bannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  firstCardContent: {
    // paddingHorizontal: 20,
    // paddingVertical: 20,
    padding: 10,
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  firstCardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  detailsGroup: {
    flexDirection: 'column',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagContainer: {
    // Styles removed as structure changed
  },
  tag: {
    borderColor: 'rgba(82, 101, 255, 1)',
    borderWidth: 0.82,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 200,
    marginRight: 12,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#E0E0E0',
    fontSize: 14,
    marginLeft: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    color: '#E0E0E0',
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },
  smallCardImage: {
    width: 100,
    height: '100%',
    resizeMode: 'cover',
  },
  smallCardContent: {
    flex: 1,
    padding: 6,
    justifyContent: 'space-between',
  },
  smallCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  smallCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    textAlign: 'left',
  },
  smallLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 2,
  },
  smallLocationText: {
    fontSize: 12,
    flex: 1,
    marginLeft: 10,
    textAlign: 'left',
  },
  smallDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  smallDetailText: {
    fontSize: 12,
    marginLeft: 10,
  },
  smallTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  smallTimeText: {
    fontSize: 12,
    marginLeft: 10,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallBookmarkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExhibitionCardSearch;
