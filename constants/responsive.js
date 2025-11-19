import {Dimensions, Platform, StatusBar} from 'react-native';

const {width, height} = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const getDeviceDimensions = () => {
  return {
    width,
    height,
  };
};

export const getPlatformValue = (iosValue, androidValue) => {
  return Platform.OS === 'ios' ? iosValue : androidValue;
};

export const scale = size => (width / guidelineBaseWidth) * size;

export const verticalScale = size => (height / guidelineBaseHeight) * size;

export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const platformSpecific = (iosValue, androidValue) => {
  return Platform.OS === 'ios' ? iosValue : androidValue;
};

export const getStatusBarHeight = () => {
  return Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
};

export const getBottomTabHeight = () => {
  return platformSpecific(83, 60);
};

export const getHeaderHeight = () => {
  return platformSpecific(80, 70);
};

export const getHeaderPaddingTop = () => {
  return platformSpecific(60, 20);
};

export const getHeaderMarginTop = () => {
  return platformSpecific(40, 20);
};

export const getHeaderTitleTop = () => {
  return platformSpecific(50, 20);
};

export const getSafeAreaPadding = () => {
  return {
    top: platformSpecific(44, 0),
    bottom: platformSpecific(34, 0),
  };
};

export const getFontSize = size => {
  return moderateScale(size);
};

export const getSpacing = size => {
  return moderateScale(size);
};

export const getBorderRadius = size => {
  return moderateScale(size);
};

export const getIconSize = size => {
  return moderateScale(size);
};

export const getButtonHeight = () => {
  return moderateScale(50);
};

export const getInputHeight = () => {
  return moderateScale(50);
};

export const getCardWidth = () => {
  return width - getSpacing(32);
};

export const getCardHeight = () => {
  return moderateScale(200);
};

export const getAvatarSize = () => {
  return moderateScale(50);
};

export const getThumbnailSize = () => {
  return moderateScale(80);
};

export const getModalWidth = () => {
  return width - getSpacing(40);
};

export const getModalHeight = () => {
  return height * 0.7;
};

export const getScreenPadding = () => {
  return {
    horizontal: getSpacing(16),
    vertical: getSpacing(16),
  };
};

export const getScreenMargin = () => {
  return {
    horizontal: getSpacing(16),
    vertical: getSpacing(16),
  };
};

export const getScreenWidthPercentage = percentage => {
  return (width * percentage) / 100;
};

export const getScreenHeightPercentage = percentage => {
  return (height * percentage) / 100;
};

export const SPACING = {
  xs: getSpacing(4),
  sm: getSpacing(8),
  md: getSpacing(16),
  lg: getSpacing(24),
  xl: getSpacing(32),
};

export const fonts = {
  poppins: {
    regular: 'Poppins-Regular',
    bold: 'Poppins-Bold',
    italic: 'Poppins-Italic',
    boldItalic: 'Poppins-BoldItalic',
  },
};
