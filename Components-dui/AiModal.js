import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../constants/colors';
import {useTheme} from '../hooks/useTheme';
import Swiper from 'react-native-swiper';
import {
  getFontSize,
  getSpacing,
  moderateScale,
  scale,
} from '../constants/responsive';

const {width, height} = Dimensions.get('window');

const AiModal = ({
  showAIModal,
  setShowAIModal,
  response,
  loading,
  modalColors,
  photo,
  onModalClose,
  userSpeech,
}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];

  if (!showAIModal) return null;

  const handleOutsidePress = () => {
    Keyboard.dismiss();
    if (onModalClose) onModalClose();
    setShowAIModal(false);
  };

  const staticImages = [
    'https://miro.medium.com/v2/resize:fit:1000/1*2sVZPbHJ41n1k2ZorpuqFg.jpeg',
    'https://res.cloudinary.com/enchanting/f_auto,q_70,w_900,h_490,c_fill/et-web/2019/06/Enchanting-Travels-Top-10-UNESCO-World-Heritage-sites-in-2019-Machu-Picchu-Panoramic-image-of-Machu-Picchu.jpg',
    'https://www.holidify.com/images/cmsuploads/compressed/india-148045726738o_20190207000651.jpg',
  ];

  const carouselImages =
    photo && photo.uri ? [photo.uri, ...staticImages] : staticImages;
  return (
    <>
      <Pressable
        onPress={handleOutsidePress}
        style={{
          ...StyleSheet.absoluteFillObject,
          flex: 1,
        }}
      />
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContent}>
          <LinearGradient
            colors={modalColors}
            style={[
              styles.modalContainer,
              Platform.OS === 'ios' && {
                paddingHorizontal: scale(2),
                paddingTop: scale(20),
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Overview</Text>
              <View style={styles.carouselContainer}>
                <Swiper
                  showsPagination
                  dotStyle={styles.dotStyle}
                  activeDotStyle={styles.activeDotStyle}>
                  {/* <Image
                    source={{
                      uri: 'https://miro.medium.com/v2/resize:fit:1000/1*2sVZPbHJ41n1k2ZorpuqFg.jpeg',
                    }}
                    style={styles.carouselImage}
                  />
                  <Image
                    source={{
                      uri: 'https://res.cloudinary.com/enchanting/f_auto,q_70,w_900,h_490,c_fill/et-web/2019/06/Enchanting-Travels-Top-10-UNESCO-World-Heritage-sites-in-2019-Machu-Picchu-Panoramic-image-of-Machu-Picchu.jpg',
                    }}
                    style={styles.carouselImage}
                  />
                  <Image
                    source={{
                      uri: 'https://www.holidify.com/images/cmsuploads/compressed/india-148045726738o_20190207000651.jpg',
                    }}
                    style={styles.carouselImage}
                  /> */}
                  {carouselImages.map((uri, index) => (
                    <Image
                      key={index}
                      source={{uri}}
                      style={styles.carouselImage}
                      resizeMode="cover"
                    />
                  ))}
                </Swiper>
              </View>
            </View>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator
              scrollEventThrottle={16}
              decelerationRate="fast"
              bounces={true}>
              <View style={styles.responseBox}>
                {userSpeech ? (
                  <Text
                    style={[
                      styles.responseText,
                      {fontWeight: 'bold', marginBottom: 10, color: '#FFD700'},
                    ]}>
                    You said: {userSpeech}
                  </Text>
                ) : null}
                <Text style={styles.responseText}>
                  {loading ? 'Loading...' : response}
                </Text>
              </View>
            </ScrollView>
            <TouchableOpacity
              onPress={() => {
                if (onModalClose) onModalClose(); // Call the callback before closing
                setShowAIModal(false);
              }}
              style={styles.closeButton}>
              <Image
                source={require('../assets/images/aiicon.png')}
                style={{width: 40, height: 40}}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </LinearGradient>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlayWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    height: height * 0.85,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    marginBottom: 10,
  },
  modalTitle: {
    color: '#fff',
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: Platform.OS === 'ios' ? getSpacing(10) : getSpacing(0),
  },
  carouselContainer: {
    height: height * 0.25,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  dotStyle: {
    backgroundColor: '#fff4',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDotStyle: {
    backgroundColor: '#5266FD',
    width: 20,
    height: 8,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
    //backgroundColor: 'red',
  },
  modalScroll: {
    paddingBottom: 40,
  },
  responseBox: {
    padding: 10,
    borderRadius: 10,
  },
  responseText: {
    color: '#fff',
    fontSize: getFontSize(14),
    lineHeight: 22,
  },
  closeButton: {
    paddingVertical: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default AiModal;
