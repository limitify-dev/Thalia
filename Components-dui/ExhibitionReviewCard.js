import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TitleIcon from '../assets/svg/title.svg';
import TitleIconTwo from '../assets/svg/title2.svg';
import LocationIcon from '../assets/dark_icons/location.svg';
import ClockIcon from '../assets/dark_icons/clock.svg';
import BookMarkIcon from '../assets/dark_icons/book_mark_dark.svg';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../constants/colors';
import {useNavigation} from '@react-navigation/native';

import DeleteSwaper from '../assets/svg/deleteSwaper.svg';
import BookMarkAddIcon from '../assets/svg/book_mark.svg';
import BookMarkRemoveIcon from '../assets/svg/bookmark_remove.svg';
import {
  getBorderRadius,
  getIconSize,
  getSpacing,
} from '../constants/responsive';
import {useTheme} from '../hooks/useTheme';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import {getFormattedTodayHours} from '../utils/siteHelpers';
import {Swipeable} from 'react-native-gesture-handler';
import {useTranslation} from '../utils/translate';
import {fetchTranslations} from '../redux/translationSlice';
import {useDispatch, useSelector} from 'react-redux';

const {width, height} = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const scale = size => (width / guidelineBaseWidth) * size;
export const verticalScale = size => (height / guidelineBaseHeight) * size;
export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const ExhibitionsReviewCard = ({
  title,
  location,
  distance,
  time,
  type,
  category,
  image,
  startDate,
  endDate,
  item,
  userId,
  onPress,
  disableNavigation = false,
  isBookedMark = false,
  onReviewPress,
  hasReviews,
  averageRating,
}) => {
  const {t} = useTranslation();
  const lang = useSelector(state => state.language.lang);
  const dispatch = useDispatch();

  // const todayHours = getFormattedTodayHours(item);
  const navigation = useNavigation();
  const isBookmarked = item?.bookmarkBy?.some(
    bookmark => bookmark.user === userId,
  );
  const {mode} = useTheme();
  const currentColors = colors[mode];
  const gradientBackgroundBoxColors = {
    light: ['#cdd5e2', '#cdd5e2'],
    dark: ['#695f85', '#3c2e5f'],
  };
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);
  const swipeableRef = useRef(null);

  const renderRightActions = () => (
    <View
      style={[
        styles.swaper,
        {
          backgroundColor: currentColors.buttonBackground,
          shadowColor: currentColors.buttonBackground,
        },
      ]}>
      <TouchableOpacity onPress={onPress}>
        <DeleteSwaper width={35} height={35} color={'white'} />
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    const textsToTranslate = [
      shortTitle,
      shortLocation,
      category,
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
  const titletranslate = title;
  // .split(' ').slice(0, 3).join(' ')
  const shortTitle = titletranslate?.split(' ')?.slice(0, 3)?.join(' ');
  const locationtranslate = location;
  const shortLocation = locationtranslate?.split(' ')?.slice(0, 3)?.join(' ');
  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => setIsSwipedOpen(true)}
      onSwipeableClose={() => setIsSwipedOpen(false)}>
      <TouchableOpacity
        style={[
          styles.exhibitionCard,
          {
            width: isSwipedOpen ? '100%' : '92%',
            borderTopRightRadius: isSwipedOpen ? 0 : getBorderRadius(10),
            borderBottomRightRadius: isSwipedOpen ? 0 : getBorderRadius(10),
          },
        ]}
        onPress={() => {
          if (!disableNavigation) {
            navigation.navigate('DetailScreenFeature', {item: item});
          }
        }}>
        <LinearGradient
          colors={gradientBackgroundBoxColors[mode]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientBackground}>
          <Image source={image} style={styles.exhibitionImage} />

          <View style={styles.exhibitionContent}>
            <View style={styles.titleAndDetailsContainer}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.exhibitionTitle,
                    {color: currentColors.sectionTitle},
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail">
                  {t(shortTitle)}
                </Text>

                <TouchableOpacity
                  onPress={onReviewPress}
                  activeOpacity={0.7}
                  style={[
                    styles.reviewButton,
                    {backgroundColor: currentColors.seeNowBtn},
                  ]}>
                  <Text
                    style={[
                      styles.reviewButtonText,
                      {color: currentColors.buttonText},
                    ]}>
                    {t('Add Review')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View>
                <View style={styles.detailRow}>
                  <Icon
                    name="location-outline"
                    size={width * 0.035}
                    color={mode === 'dark' ? '#C4C4C4' : 'rgb(70,73,79)'}
                  />
                  <Text
                    style={[
                      styles.detailText,
                      {color: currentColors.cardTextExb},
                    ]}>
                    {t(shortLocation)}{' '}
                    <Text style={styles.subText}>{distance}</Text>
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  {mode === 'light' ? (
                    <TitleIconTwo width={16} height={16} />
                  ) : (
                    <TitleIcon width={16} height={16} />
                  )}
                  <Text
                    style={[
                      styles.detailText,
                      {color: currentColors.exhibitionTempText},
                    ]}>
                    {type} <Text style={styles.subText}>{t(category)}</Text>
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon
                    name="time-outline"
                    size={width * 0.035}
                    color={mode === 'dark' ? '#fff' : '#5E7F9A'}
                  />
                  <Text
                    style={[
                      styles.detailText,
                      {color: currentColors.exhibitionCardText},
                    ]}>
                    {/* {todayHours} */}
                  </Text>
                </View>
              </View>
            </View>
            {!isBookedMark && (
              <TouchableOpacity
                style={[
                  styles.bookmarkButton,
                  {backgroundColor: currentColors.seeNowBtn},
                ]}
                onPress={onPress}>
                {isBookmarked ? (
                  <BookMarkRemoveIcon
                    width={getIconSize(15)}
                    height={getIconSize(17)}
                  />
                ) : (
                  <BookMarkAddIcon
                    width={getIconSize(15)}
                    height={getIconSize(17)}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  swaper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    borderBottomRightRadius: getBorderRadius(10),
    borderTopRightRadius: getBorderRadius(10),
    marginVertical: verticalScale(10),
    // 💡 Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // 💡 Shadow for Android
    elevation: 8,
  },
  exhibitionCard: {
    flexDirection: 'row',
    borderRadius: moderateScale(10),
    // backgroundColor: 'rgba(255,255,255,0.05)',
    width: '92%',
    // minHeight: verticalScale(140),
    alignSelf: 'center',
    marginVertical: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: verticalScale(2)},
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    elevation: 3,
    overflow: 'hidden',
  },
  gradientBackground: {
    flexDirection: 'row',
    flex: 1,
  },
  exhibitionImage: {
    width: scale(110),
    // height: '100%',
    borderTopLeftRadius: moderateScale(10),
    borderBottomLeftRadius: moderateScale(10),
    resizeMode: 'cover',
  },
  exhibitionContent: {
    flex: 1,
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(14),
    justifyContent: 'space-between',
  },
  titleAndDetailsContainer: {
    marginBottom: verticalScale(10),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(2),
  },
  exhibitionTitle: {
    fontSize: moderateScale(15),
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    flexWrap: 'wrap',
    marginRight: scale(5),
    maxWidth: '60%',
    // backgroundColor:'red'
  },
  reviewButton: {
    paddingVertical: verticalScale(6),
    paddingHorizontal: Platform.OS == 'ios' ? scale(9) : scale(12),
    borderRadius: moderateScale(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: getSpacing(40),
  },
  ratingText: {
    fontSize: moderateScale(12),
    marginLeft: scale(2),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(6),
  },
  detailText: {
    fontSize: moderateScale(13),
    marginLeft: scale(6),
    flexShrink: 1,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
  },
  subText: {
    fontSize: moderateScale(12),
    color: 'rgba(255,255,255,0.6)',
  },
  bookmarkButton: {
    position: 'absolute',
    top: verticalScale(10),
    right: scale(10),
    width: scale(32),
    height: scale(32),
    borderRadius: moderateScale(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExhibitionsReviewCard;
