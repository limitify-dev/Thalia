import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../constants/colors';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import RatingIcon from '../assets/svg/rating.svg';
import ClockIcon from '../assets/svg/clock.svg';
import LocationIcon from '../assets/svg/location.svg';
import TempIcon from '../assets/svg/temp.svg';
import LightClockIcon from '../assets/light_icon/clock.svg';
import LightLocationIcon from '../assets/light_icon/loction.svg';
import LightTempIcon from '../assets/light_icon/tempIcon.svg';
import BookMarkAddIcon from '../assets/svg/book_mark.svg';
import BookMarkRemoveIcon from '../assets/svg/bookmark_remove.svg';
import {useTheme} from '../hooks/useTheme';
import {
  getBorderRadius,
  getIconSize,
  getSpacing,
  moderateScale,
} from '../constants/responsive';
import {useDispatch, useSelector} from 'react-redux';
import {
  getAllBookMarkAction,
  getAllSitesAction,
  siteBookMarkedAction,
} from '../redux/actions/sitesActions';
import {useTranslation} from '../utils/translate';
import {getFormattedTodayHours} from '../utils/siteHelpers';
import Geolocation from '@react-native-community/geolocation';
import {getNearbySites} from '../redux/actions/nearbyAction';
// import {getFormattedTodayHours} from '../utils/siteHelpers';

const ExhibitionCardBox = ({
  title,
  location,
  item,
  rating,
  image,
  startTime,
  endTime,
  isFirstItem = false,
  opening,
  closing,
  userId,
  categories,
}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  // console.log('ExhibitionCardBox item', item);

  const auth = useSelector(state => state.auth);
  const currentUserId = auth.user._id || '';
  const {width} = useWindowDimensions();
  // console.log('item====>itemitem', item);
  const formatTime = isoString => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);

  const handlePress = () => {
    
    navigation.navigate('DetailScreenFeature', {item, Search: 'Search'});
  };

  const {mode} = useTheme();
  const borderColor = '#5E4B8B';

  const gradientBackgroundBoxColors = {
    light: ['#cdd5e2', '#cdd5e2'],
    dark: ['#695f85', '#3c2e5f'],
  };

  const currentGradientColors = gradientBackgroundBoxColors[mode];
  const translatedLocation = t(location);
  const shortLocation = translatedLocation.split(' ').slice(0, 3).join(' ');
  return (
    <TouchableOpacity
      style={[
        styles.exhibitionCardBox,
        isFirstItem ? styles.firstExhibitionCard : styles.smallExhibitionCard,
        isFirstItem
          ? {width: width * 0.83, alignSelf: 'center'}
          : {width: width * 0.9},
        {
          borderWidth: mode === 'light' ? 1 : 1.3,
          borderColor: mode === 'light' ? '#fff' : borderColor,
        },
      ]}
      onPress={handlePress}>
      <LinearGradient
        colors={currentGradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[
          styles.gradientBackgroundBox,
          !isFirstItem && styles.smallGradientBox,
        ]}>
        <Image
          source={image}
          style={isFirstItem ? styles.cardImage : styles.smallCardImage}
        />
        {isFirstItem ? (
          <FirstCardContent
            title={t(title)}
            location={t(location)}
            rating={rating}
            startTime={formattedStartTime}
            endTime={formattedEndTime}
            opening={opening}
            closing={closing}
            categories={t(categories)}
          />
        ) : (
          <SmallCardContent
            title={t(title)}
            location={shortLocation}
            startTime={formattedStartTime}
            endTime={formattedEndTime}
            site={item}
            userId={userId}
            currentUserId={currentUserId}
            opening={opening}
            closing={closing}
            categories={t(categories)}
          />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const FirstCardContent = ({
  title,
  location,
  rating,
  startTime,
  endTime,
  opening,
  closing,
  item,
  categories,
}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];
  const {t} = useTranslation();
  const formatTimeRange = (opening, closing) => {
    try {
      if (opening && closing) {
        const formatTime = time => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours, 10);
          // const period = 12;
          const formattedHour = hour % 12 || 12;
          return `${formattedHour}:${minutes} `;
        };
        return `${formatTime(opening)} to ${formatTime(closing)}`;
      }
      return 'Time not specified';
    } catch (e) {
      return 'Time not available';
    }
  };
  const formatCloseOpenTimeRange = (opening, closing) => {
    const isValidTime = time => /^\d{2}:\d{2}$/.test(time);

    if (isValidTime(opening) && isValidTime(closing)) {
      const formatTime = time => {
        const [hourStr, minute] = time.split(':');
        const hour = parseInt(hourStr, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        return `${hour % 12 || 12}:${minute} ${period}`;
      };

      return `${formatTime(opening)} to ${formatTime(closing)}`;
    }

    return 'Closed';
  };

  const translatedLocation = t(location);
  const shortLocation = translatedLocation.split(' ').slice(0, 3).join(' ');

  return (
    <>
      <View
        style={[
          styles.bannerContainer,
          {backgroundColor: currentColors.searchCardTagBg},
        ]}>
        <Text
          style={[styles.bannerText, {color: currentColors.textWhite}]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {t('Exhibition at the ')}
          {t(title)}
        </Text>
      </View>

      <View style={[styles.firstCardContent, {padding: 16}]}>
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.firstCardTitle,
              {
                fontSize: 22,
                fontWeight: '600',
                color: currentColors.titleColor,
                fontFamily: 'Poppins-SemiBold',
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {t(title)}
          </Text>
          <View style={styles.ratingContainer}>
            <RatingIcon color="#FFCA28" />
            <Text style={[styles.ratingText, {marginLeft: 4}]}>
              {rating || 0}
            </Text>
          </View>
        </View>

        <View style={[styles.detailsGroup]}>
          <View style={styles.detailOneRow}>
            <View
              style={[
                styles.tag,
                {
                  borderColor: currentColors.container,

                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginRight: 12,
                },
              ]}>
              <Text
                style={[styles.tagText, {color: currentColors.textWhite}]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {t(
                  categories && categories.length > 0 && categories[0]
                    ? categories[0].split(' ').slice(0, 4).join(' ')
                    : 'No Category',
                )}
              </Text>
            </View>
          </View>

          <View style={[styles.detailRow, {marginTop: 8}]}>
            <View style={styles.locationContainer}>
              {mode === 'dark' ? (
                <LocationIcon color="#E0E0E0" size={16} />
              ) : (
                <LightLocationIcon color="rgb(70,73,79)" size={16} />
              )}
              <Text
                style={[
                  styles.locationText,
                  {color: currentColors.cardTextExb},
                ]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {t(location.split(' ').slice(0, 2).join(' ')) ||
                  'Location not available'}
              </Text>
            </View>
            <View style={styles.timeContainer}>
              {mode === 'dark' ? (
                <ClockIcon color="#E0E0E0" size={16} />
              ) : (
                <LightClockIcon color="rgb(70,73,79)" size={16} />
              )}
              <Text
                style={[
                  styles.timeText,
                  {marginLeft: 6, color: currentColors.cardTextExb},
                ]}>
                {getFormattedTodayHours(item)}
              </Text>
              {/* <Text
                style={[
                  styles.timeText,
                  {marginLeft: 6, color: currentColors.cardTextExb},
                ]}>
                {formatCloseOpenTimeRange(opening, closing)}
              </Text> */}
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const SmallCardContent = ({
  opening,
  closing,
  categories,
  title,
  location,
  startTime,
  endTime,
  item,
  userId,
  site,
  currentUserId,
}) => {
  const {t} = useTranslation();
  // const userId = site?.bookmarkBy?.[0]?.user?._id || null;
  console.log('userId===>', userId);
  const site_id = site?._id;
  // const userBookMarks = nearbySites.bookmarkBy?.map(bookmark => bookmark.user);
  const {data: nearbySites} = useSelector(state => state.nearbySites);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const dispatch = useDispatch();
  const fetchUserLocation = useCallback(() => {
    setIsLocationLoading(true);
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setUserLocation({latitude, longitude});
        setIsLocationLoading(false);
        setLocationError(null);
      },
      error => {
        console.warn('Location fetch error:', error);
        setLocationError(
          'Unable to fetch location. Please enable location services.',
        );
        setIsLocationLoading(false);
        Alert.alert(
          'Location Error',
          'Unable to fetch location. Please enable location services or try again.',
          // [
          //   {text: 'Retry', onPress: fetchUserLocation},
          //   {text: 'OK', style: 'cancel'},
          // ],
        );
      },
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 10000},
    );
  }, []);
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to your location to show nearby sites.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        setLocationError('Failed to request location permission.');
        return false;
      }
    }
    return true;
  };
  // Initialize location fetching and watch position
  useEffect(() => {
    let watchId;
    const setupLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        fetchUserLocation();
        watchId = Geolocation.watchPosition(
          position => {
            const {latitude, longitude} = position.coords;
            setUserLocation({latitude, longitude});
          },
          error => {
            console.warn('Watch position error:', error);
            setLocationError('Unable to update location.');
          },
          {enableHighAccuracy: true, distanceFilter: 100},
        );
      } else {
        setIsLocationLoading(false);
        setLocationError('Location permission denied.');
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show nearby sites. Please enable it in settings.',
          // [
          //   {text: 'Retry', onPress: setupLocation},
          //   {text: 'OK', style: 'cancel'},
          // ],
        );
      }
    };

    setupLocation();

    return () => {
      if (watchId) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [fetchUserLocation, dispatch]);

  const bookmarkedSite = nearbySites?.find(site => site._id === site._id);

  const [isBookmarked, setIsBookmarked] = useState(
    bookmarkedSite?.bookmarkBy?.some(bookmark => bookmark.user === userId) ||
      false,
  );

  useEffect(() => {
    const site = nearbySites?.find(site => site._id === site_id);
    setIsBookmarked(site?.bookmarkBy?.some(b => b.user === userId) || false);
  }, [nearbySites, site_id, userId]);

  useEffect(() => {
    // dispatch(getAllBookMarkAction());
  }, [dispatch]);
  // console.log('userBookMarks====>', userBookMarks);
  const {mode} = useTheme();
  const currentColors = colors[mode];

  // const [localBookmarked, setLocalBookmarked] = useState(() =>
  //   site.bookmarkBy?.some(bookmark => bookmark.user === currentUserId),
  // );

  // useFocusEffect(
  //   useCallback(() => {
  //     // console.log('Site:', site);
  //     // console.log('Current User ID:', currentUserId);
  //     // console.log('BookmarkBy::', site.bookmarkBy);

  //     const bookmarked = site.bookmarkBy?.some(
  //       bookmark => bookmark.user === currentUserId,
  //     );

  //     setLocalBookmarked(bookmarked);
  //   }, [site, currentUserId]),
  // );
  const handleToggleBookMarked = () => {
    const site = nearbySites?.find(site => site._id === site_id);

    console.log('item===new', site_id, site, userId);
    const updatedBookmark = !isBookmarked;
    setIsBookmarked(updatedBookmark);

    dispatch(
      siteBookMarkedAction({
        id: site_id,
        callback: res => {
          if (res) {
            if (userLocation && !isLocationLoading) {
              dispatch(
                getNearbySites({
                  lat: userLocation.latitude,
                  lng: userLocation.longitude,
                  radius: 50,
                }),
              );
            }
            dispatch(getAllBookMarkAction({callback: () => {}}));
          }
        },
      }),
    );
  };
  // const handleToggleBookMarked = item => {
  //   setLocalBookmarked(!localBookmarked);

  //   // dispatch(
  //   //   siteBookMarkedAction({
  //   //     id: item?._id,
  //   //     callback: res => {
  //   //       if (res) {
  //   //         dispatch(
  //   //           getAllSitesAction({
  //   //             callback: () => {},
  //   //             meta: {showLoading: false},
  //   //           }),
  //   //         );
  //   //         dispatch(getAllBookMarkAction({callback: () => {}}));
  //   //       } else {
  //   //         setLocalBookmarked(localBookmarked);
  //   //       }
  //   //     },
  //   //   }),
  //   // );
  // };

  useEffect(() => {}, [userId, site]);

  const formatTimeRange = (opening, closing) => {
    try {
      if (opening && closing) {
        const formatTime = time => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours, 10);
          // const period = 12;
          const formattedHour = hour % 12 || 12;
          return `${formattedHour}:${minutes} `;
        };
        return `${formatTime(opening)} to ${formatTime(closing)}`;
      }
      return 'Time not specified';
    } catch (e) {
      return 'Time not available';
    }
  };

  return (
    <View style={styles.smallCardContent}>
      <View style={styles.smallCardHeader}>
        <Text
          style={[styles.smallCardTitle, {color: currentColors.titleColor}]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {t(title)}
        </Text>
        <TouchableOpacity
          onPress={() => handleToggleBookMarked(site)}
          style={[
            styles.smallBookmarkButton,
            {backgroundColor: currentColors.bookmarkedbackground},
          ]}>
          {isBookmarked ? (
            <BookMarkRemoveIcon
              width={getIconSize(13)}
              height={getIconSize(13)}
            />
          ) : (
            <BookMarkAddIcon width={getIconSize(13)} height={getIconSize(13)} />
          )}
        </TouchableOpacity>
      </View>

      <View style={{justifyContent: 'center', bottom: 0}}>
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
            numberOfLines={1}
            ellipsizeMode="tail">
            {t(location) || 'Location not available'}
          </Text>
        </View>

        <View style={styles.smallDetailsRow}>
          {mode === 'dark' ? (
            <TempIcon color="#E0E0E0" width={12} />
          ) : (
            <LightTempIcon color="rgb(70,73,79)" width={12} />
          )}
          <Text
            style={[styles.smallDetailText, {color: currentColors.cardTextExb}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {/* {t('Temporary Exhibition') + ' '} */}
            <Text
              style={[styles.modernArtText, {color: currentColors.cardTextExb}]}
              numberOfLines={1}
              ellipsizeMode="tail">
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
            style={[styles.smallTimeText, {color: currentColors.cardTextExb}]}>
            {getFormattedTodayHours(item)}
          </Text>
        </View>
      </View>
    </View>
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
    padding: 20,
    width: '100%',
  },
  bannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  firstCardContent: {
    padding: 10,
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  firstCardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    marginRight: 8,
    textAlign: 'left',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
    marginLeft: 4,
  },
  detailsGroup: {
    flexDirection: 'column',
  },
  detailOneRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    // backgroundColor: 'red',
  },
  tag: {
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
    fontFamily: 'Poppins-Medium',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#E0E0E0',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
  },
  smallCardImage: {
    width: 100,
    height: '100%',
    resizeMode: 'cover',
  },
  smallCardContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    // backgroundColor:"red"
  },
  smallCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  smallCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    marginRight: 8,
    textAlign: 'left',
    fontFamily: 'Poppins-SemiBold',
  },
  smallLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallLocationText: {
    fontSize: 12,
    flex: 1,
    marginLeft: 10,
    textAlign: 'left',
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
  },
  smallDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  smallDetailText: {
    color: '#B0B0B0',
    fontSize: 12,
    marginLeft: 10,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
  },
  modernArtText: {
    color: '#B0B0B0',
    fontSize: 12,
    fontStyle: 'italic',
  },
  smallTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  smallTimeText: {
    color: '#B0B0B0',
    fontSize: 12,
    marginLeft: 10,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
  },
  smallBookmarkButton: {
    position: 'absolute',
    top: getSpacing(-3),
    right: getSpacing(-10),
    width: moderateScale(25),
    height: moderateScale(25),
    borderRadius: getBorderRadius(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExhibitionCardBox;
