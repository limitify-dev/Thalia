import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import React from 'react';
import {useTheme} from '../hooks/useTheme';
import {
  getDeviceDimensions,
  getPlatformValue,
  scale,
  verticalScale,
  moderateScale,
  getStatusBarHeight,
  getModalWidth,
  getModalHeight,
  getScreenPadding,
  getFontSize,
  SPACING,
  getScreenWidthPercentage,
  getScreenHeightPercentage,
} from '../constants/responsive';
import LinearGradient from 'react-native-linear-gradient';
import Swiper from 'react-native-swiper';
import {colors} from '../constants/colors';

const AiModalRes = ({
  showAIModal,
  setShowAIModal,
  response,
  loading,
  modalColors,
}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];

  if (!showAIModal) return null;

  return (
    <View style={styles.modalContainer}>
      <LinearGradient
        colors={modalColors || ['#4A4A6A', '#2A2A3A', '#1A1A2E']}
        style={styles.gradientBackground}>
        <View style={styles.modalContent}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Text
                style={[
                  styles.header,
                  {
                    color:
                      modalColors?.header || currentColors.header || '#FFFFFF',
                  },
                ]}>
                Overview
              </Text>

              <View style={styles.swiperContainer}>
                <Swiper
                  showsPagination={true}
                  dotStyle={styles.dotStyle}
                  activeDotStyle={styles.activeDotStyle}
                  paginationStyle={styles.paginationStyle}
                  style={styles.swiper}>
                  <Image
                    source={{
                      uri: 'https://miro.medium.com/v2/resize:fit:1000/1*2sVZPbHJ41n1k2ZorpuqFg.jpeg',
                    }}
                    style={styles.carouselImage}
                    resizeMode="cover"
                  />
                  <Image
                    source={{
                      uri: 'https://res.cloudinary.com/enchanting/f_auto,q_70,w_900,h_490,c_fill/et-web/2019/06/Enchanting-Travels-Top-10-UNESCO-World-Heritage-sites-in-2019-Machu-Picchu-Panoramic-image-of-Machu-Picchu.jpg',
                    }}
                    style={styles.carouselImage}
                    resizeMode="cover"
                  />
                  <Image
                    source={{
                      uri: 'https://www.holidify.com/images/cmsuploads/compressed/india-148045726738o_20190207000651.jpg',
                    }}
                    style={styles.carouselImage}
                    resizeMode="cover"
                  />
                </Swiper>
              </View>

              <Text
                style={[
                  styles.text,
                  {color: modalColors?.text || currentColors.text || '#D3D3D3'},
                ]}>
                {loading
                  ? 'Loading...'
                  : response ||
                    'Lorem ipsum dolor sit amet consectetur. Elementum semper etiam neque urna mattis enim quam dui. Odio in faucibus sem ornare et. Nulla turpis tellus sagittis integer id commodo cursus armet tempus. Amet eget sed sed vel est et adipiscing. Maecenas fringilla feugiat commodo velit gravida. Faucibus sit nam nunc dui id justo mi. Elit morbi rutrum nibh donec pellentesque dui at. Non ornare urna placerat arcu iaculis sagittis enim. Nisl mauris neque purus sed eu vitae nisl. At quis pellentesque ac duis senectus. Sit bibendum sed faucibus lorem ultrices commodo viverra rhoncus nulla.\n\nMi quam at tincidunt eget dui. Aenean felis sed id sed ut egestas. Mauris aliquam volutpat maecenas enim viverra luctus arcu. Amet malesuada hendrerit amet elit id cras. Massa potenti ullamcorper a est. Amet mattis purus velit lacinia tincidunt suspendisse nullam. Fames tortor volutpat pretium enim et dolor sodales. Sed non blandit faucibus cursus. Cras sollicitudin consectetur sed mauris. Ullamcorper phasellus pellentesque varius pulvinar commodo arcu lorem at. Odio in faucibus sem ornare et. Nulla turpis tellus sagittis integer id commodo cursus armet tempus. Amet eget sed sed vel est et adipiscing. Maecenas fringilla feugiat commodo velit gravida. Faucibus sit nam nunc dui id justo mi. Elit morbi rutrum nibh donec pellentesque dui at. Non ornare urna placerat arcu iaculis sagittis enim.'}
              </Text>

              {/* AI Icon at bottom */}
              <View style={styles.aiIconContainer}>
                <View style={styles.aiIconWrapper}>
                  <Text style={styles.aiIconText}>AI</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={() => setShowAIModal(false)}
            style={styles.closeButton}>
            <Image
              source={require('../assets/images/aiicon.png')}
              style={styles.closeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: getStatusBarHeight(),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  gradientBackground: {
    width: getModalWidth(),
    height: getScreenHeightPercentage(85),
    borderRadius: moderateScale(20),
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 8,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  header: {
    fontSize: getFontSize(24),
    fontWeight: 'bold',
    marginBottom: SPACING.xl,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  swiperContainer: {
    width: '100%',
    height: verticalScale(200),
    marginBottom: SPACING.xl,
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  swiper: {
    height: verticalScale(200),
  },
  carouselImage: {
    width: '100%',
    height: verticalScale(200),
    borderRadius: moderateScale(12),
  },
  paginationStyle: {
    bottom: 15,
  },
  dotStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDotStyle: {
    backgroundColor: '#4A90E2',
    width: 20,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  text: {
    fontSize: getFontSize(14),
    lineHeight: moderateScale(22),
    textAlign: 'left',
    marginBottom: SPACING.xl,
    width: '100%',
  },
  aiIconContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  aiIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiIconText: {
    color: '#FFFFFF',
    fontSize: getFontSize(16),
    fontWeight: 'bold',
  },
});

export default AiModalRes;
