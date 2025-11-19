import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {gredientColors} from '../constants/colors';
import {useNavigation} from '@react-navigation/native';
import BookMarkAddIcon from '../assets/svg/book_mark.svg';
import BookMarkRemoveIcon from '../assets/svg/bookmark_remove.svg';
import {
  getBorderRadius,
  getFontSize,
  getIconSize,
  getScreenHeightPercentage,
  getScreenWidthPercentage,
  getSpacing,
} from '../constants/responsive';
import {moderateScale} from './ExhibitionsCard';
import {useTheme} from '../hooks/useTheme';
import {colors} from '../constants/colors';
import {useTranslation} from '../utils/translate';
// import {getFormattedTodayHours} from '../utils/siteHelpers';
import {useDispatch, useSelector} from 'react-redux';
import {
  getAllBookMarkAction,
  getAllSitesAction,
  siteBookMarkedAction,
} from '../redux/actions/sitesActions';

const {width, height} = Dimensions.get('window');

const ExhibitionCardFeatured = ({
  title,
  location,
  time,
  type,
  rating,
  image,
  startDate,
  endDate,
  distance,
  item,
  userId,
  onPress,
}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {displayedSites, isLoading, recentlyVisited, setIsLoading} =
    useSelector(state => state.sites);
  // Find the site in displayedSites that matches item.id
  const bookmarkedSite = displayedSites?.data?.sites?.find(
    site => site.siteId === item.id,
  );
  const [isBookmarked, setIsBookmarked] = useState(
    bookmarkedSite?.bookmarkBy?.some(bookmark => bookmark.user === userId) ||
      false,
  );
  // console.log('item====wiki', item);
  useEffect(() => {
    // Update bookmark status when displayedSites or userId changes
    const site = displayedSites?.data?.sites?.find(
      site => site.siteId === item.id,
    );
    setIsBookmarked(site?.bookmarkBy?.some(b => b.user === userId) || false);
  }, [displayedSites, item.id, userId]);

  useEffect(() => {
    dispatch(getAllBookMarkAction());
  }, [dispatch]);

  const handleBookmarkPress = () => {
    const updatedBookmark = !isBookmarked;
    setIsBookmarked(updatedBookmark);

    const itemWithBookmark = {
      ...item,
      isBookmark: updatedBookmark,
    };
    dispatch(
      siteBookMarkedAction({
        item: itemWithBookmark,
        callback: res => {
          if (res) {
            dispatch(getAllBookMarkAction({callback: () => {}}));
            dispatch(getAllSitesAction({callback: () => {}}));
          }
        },
      }),
    );
  };

  // const timeRange = getFormattedTodayHours(item);
  const navigation = useNavigation();
  const {mode} = useTheme();
  const currentColors = colors[mode];
  const gradientBackgroundBoxColors = {
    light: ['#cdd5e2', '#cdd5e2'],
    dark: ['#695f85', '#3c2e5f'],
  };
  const borderColors = {
    light: 'rgba(255, 255, 255, 0.3)',
    dark: '#5E4B8B',
  };

  return (
    <TouchableOpacity
      style={[
        styles.exhibitionCardBox,
        {
          backgroundColor: gradientBackgroundBoxColors[mode],
          borderWidth: 2,
          borderColor: borderColors[mode],
        },
      ]}
      onPress={() => navigation.navigate('DetailScreenFeature', {item: item})}>
      <View
        style={[
          styles.borderWrapper,
          {
            borderColor: borderColors[mode],
          },
        ]}>
        <LinearGradient
          colors={gradientBackgroundBoxColors[mode]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientBackgroundBox}>
          <Image source={image} style={styles.exhibitionCardImage} />

          <View style={styles.exhibitionCardContent}>
            <View style={styles.exhibitionCardTitleRow}>
              <Text
                style={[
                  styles.exhibitionCardTitle,
                  {color: currentColors.titleColor},
                ]}
                numberOfLines={1}>
                {t(title?.split(' ').slice(0, 4).join(' '))}
                {t(title?.split(' ').length > 3 ? '...' : '')}
              </Text>
              <View style={styles.exhibitionCardRatingRow}>
                <Icon name="star" size={width * 0.035} color="#FFD700" />
                <Text
                  style={[
                    styles.exhibitionCardRating,
                    {color: currentColors.titleColor},
                  ]}>
                  {rating?.toFixed(1) ?? '4.9'}
                </Text>
              </View>
            </View>

            <View style={styles.exhibitionCardInfoRow}>
              {type && (
                <View
                  style={[
                    styles.exhibitionCardCategoryChip,
                    mode === 'light' && {
                      backgroundColor: currentColors.seeNowBtn,
                    },
                    mode === 'dark' && {
                      borderWidth: 0.5,
                      borderColor: '#5265FF',
                    },
                  ]}>
                  <Text
                    style={styles.exhibitionCardCategoryText}
                    numberOfLines={1}>
                    {t(
                      type
                        ? Array.isArray(type)
                          ? type[0]?.split(' ').slice(0, 1).join(' ') ||
                            'Default'
                          : type.split(' ').slice(0, 1).join(' ') || 'Default'
                        : 'Default',
                    )}
                  </Text>
                </View>
              )}
              <View style={styles.exhibitionCardTimeRow}>
                <Icon
                  name="time-outline"
                  size={width * 0.04}
                  color={mode === 'dark' ? '#fff' : '#5E7F9A'}
                />
                <Text
                  style={[
                    styles.exhibitionCardTimeText,
                    {color: currentColors.titleColor},
                  ]}>
                  {/* {timeRange} */}
                </Text>
              </View>
            </View>
            {location && (
              <View style={styles.exhibitionCardLocationRow}>
                <Icon
                  name="location-outline"
                  size={width * 0.04}
                  color={mode === 'dark' ? '#fff' : 'rgb(70,73,79)'}
                />
                <Text
                  style={[
                    styles.exhibitionCardLocationText,
                    {color: currentColors.cardTextExb},
                  ]}
                  numberOfLines={1}>
                  {t(
                    location === 'Address not available'
                      ? 'Location not specified'
                      : location,
                  )}
                </Text>
                {distance && (
                  <Text style={styles.exhibitionCardDistanceText}>
                    {t(distance)} away
                  </Text>
                )}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.bookmarkButton,
              {backgroundColor: currentColors.bookmarkedbackground},
            ]}
            onPress={handleBookmarkPress}>
            {isBookmarked ? (
              <BookMarkRemoveIcon
                width={getIconSize(16)}
                height={getIconSize(16)}
              />
            ) : (
              <BookMarkAddIcon
                width={getIconSize(14)}
                height={getIconSize(14)}
              />
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  featuredHorizontalContainer: {
    paddingLeft: getSpacing(6),
    marginTop: getSpacing(12),
    flexDirection: 'row',
    justifyContent: 'center', // Center the card when only one is present
  },
  exhibitionCardBox: {
    width: getScreenWidthPercentage(70),
    borderRadius: getBorderRadius(18),
    marginRight: getSpacing(8),
  },
  borderWrapper: {
    borderRadius: getBorderRadius(14),
    borderWidth: 1,
    overflow: 'hidden',
  },
  gradientBackgroundBox: {
    width: '100%',
  },
  exhibitionCardImage: {
    width: '100%',
    height: getScreenHeightPercentage(22),
    borderTopLeftRadius: getBorderRadius(18),
    borderTopRightRadius: getBorderRadius(18),
    resizeMode: 'cover',
  },
  exhibitionCardContent: {
    padding: getSpacing(18),
    paddingBottom: getSpacing(12),
  },
  exhibitionCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getSpacing(8),
    width: '110%',
    alignSelf: 'center',
  },
  exhibitionCardTitle: {
    fontSize: getFontSize(14),
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: getSpacing(6),
    textAlign: 'left',
    fontFamily: 'Poppins-SemiBold',
  },
  exhibitionCardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: getSpacing(2),
  },
  exhibitionCardRating: {
    color: '#fff',
    fontSize: getFontSize(11),
    fontWeight: '400',
    marginLeft: getSpacing(2),
    fontFamily: 'Poppins-Regular',
  },
  exhibitionCardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(8),
    left: -7,
  },
  exhibitionCardCategoryChip: {
    borderRadius: getBorderRadius(10),
    paddingHorizontal: getSpacing(18),
    paddingVertical: getSpacing(4),
    marginRight: getSpacing(8),
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  exhibitionCardCategoryText: {
    color: '#fff',
    fontSize: getFontSize(10),
    fontWeight: '500',
  },
  exhibitionCardTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exhibitionCardTimeText: {
    color: '#fff',
    fontSize: getFontSize(10),
    fontWeight: '500',
    marginLeft: getSpacing(4),
    fontWeight: '400',
  },
  exhibitionCardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getSpacing(6),
    left: -7,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
  },
  exhibitionCardLocationText: {
    color: '#fff',
    fontSize: getFontSize(10),
    fontWeight: '500',
    flex: 1,
    marginLeft: getSpacing(4),
  },
  exhibitionCardDistanceText: {
    color: '#B0B3C7',
    fontSize: getFontSize(9),
    fontWeight: '400',
    marginLeft: getSpacing(6),
  },
  bookmarkButton: {
    position: 'absolute',
    top: getSpacing(12),
    right: getSpacing(12),
    width: getSpacing(30),
    height: getSpacing(30),
    borderRadius: getBorderRadius(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExhibitionCardFeatured;
