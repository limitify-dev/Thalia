import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../constants/colors';
import {useTheme} from '../hooks/useTheme';
import {
  getButtonHeight,
  getFontSize,
  getSpacing,
  getBorderRadius,
  verticalScale,
} from '../constants/responsive';

const CustomButton = ({
  title,
  onPress,
  variant = 'primary',
  leftIcon,
  rightIcon,
  style,
  textStyle,
  borderRadius = 30,
  fullWidth = true,
  size = 'medium',
  isLoading = false,
  backgroundColor,
  ...props
}) => {
  const {mode} = useTheme();
  const themeColors = colors[mode];

  let isGradient;
  if (mode === 'dark') {
    isGradient =
      variant === 'gradient' ||
      title === 'Sign In' ||
      title === 'Sign Up' ||
      title === 'Reservation' ||
      title === 'Yes, Logout' ||
      title === 'Confirmer' ||
      title === 'Continue' ||
      title === 'Add' ||
      title === 'Save' ||
      title === 'Verify' ||
      title === 'Update Plan' ||
      title === 'continue' ||
      title === 'confirm' ||
      title === 'Reserve';
  } else {
    isGradient = '';
  }

  const buttonConfig = {
    small: {
      height: getButtonHeight() * 0.8,
      paddingVertical: verticalScale(8),
      fontSize: getFontSize(14),
    },
    medium: {
      height: getButtonHeight(),
      paddingVertical: verticalScale(12),
      fontSize: getFontSize(16),
    },
    large: {
      height: getButtonHeight() * 1.2,
      paddingVertical: verticalScale(16),
      fontSize: getFontSize(18),
    },
  };
  const {height, paddingVertical, fontSize} = buttonConfig[size];
  const buttonColors = {
    primary: {
      background:
        mode === 'dark'
          ? themeColors.buttonBackground
          : themeColors.buttonBackground,
      text: themeColors.buttonText,
      border: 'transparent',
    },
    outline: {
      background: 'transparent',
      text: mode === 'dark' ? themeColors.primary : '#5E7F9A',
      border: mode === 'dark' ? themeColors.white : '#5E7F9A',
    },
    text: {
      background: 'transparent',
      text: mode === 'dark' ? themeColors.buttonText : '#5E7F9A',
      border: 'transparent',
    },
    gradient: {
      text: themeColors.white,
    },
  };
  const containerStyles = [
    styles.container,
    fullWidth && styles.fullWidth,
    style,
  ];
  const buttonStyles = [
    styles.button,
    {
      height,
      paddingVertical,
      borderRadius: getBorderRadius(borderRadius),
    },
    !isGradient && {
      backgroundColor: buttonColors[variant].background,
      borderColor: buttonColors[variant].border,
      borderWidth: variant === 'outline' ? 1 : 0,
    },
  ];
  const textStyles = [
    styles.text,
    {
      fontSize,
      color: isGradient ? themeColors.white : buttonColors[variant].text,
    },
    textStyle,
  ];

  const renderContent = () => (
    <>
      {leftIcon && <View style={styles.leftIconAbsolute}>{leftIcon}</View>}
      <View style={styles.textWrapper}>
        {isLoading ? (
          <ActivityIndicator color={themeColors.loaderColor} />
        ) : (
          <Text style={textStyles}>{title}</Text>
        )}
      </View>
      {rightIcon && <View style={styles.rightIconAbsolute}>{rightIcon}</View>}
    </>
  );

  if (isGradient) {
    return (
      <TouchableOpacity
        style={containerStyles}
        onPress={onPress}
        activeOpacity={0.8}
        {...props}>
        <View
          style={[
            styles.gradientContainer,
            {borderRadius: getBorderRadius(borderRadius)},
          ]}>
          <LinearGradient
            colors={['rgb(123,153,254)', 'rgb(82,102,253)', 'rgb(123,153,254)']}
            start={{x: 0.2, y: 0}}
            end={{x: 1, y: 1}}
            style={[
              styles.absoluteFill,
              {borderRadius: getBorderRadius(borderRadius)},
            ]}
          />

          <View
            style={[
              styles.innerButton,
              {
                height: height - 4,
                marginTop: 2,
                marginBottom: 2,
                marginLeft: 2,
                marginRight: 2,
                borderRadius: getBorderRadius(borderRadius - 2),
                backgroundColor: 'rgb(82,102,253)',
                paddingHorizontal: getSpacing(24),
              },
            ]}>
            {renderContent()}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[containerStyles, buttonStyles]}
      onPress={onPress}
      {...props}>
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: getSpacing(8),
  },
  fullWidth: {
    width: '100%',
  },
  button: {
    paddingHorizontal: getSpacing(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  leftIconAbsolute: {
    position: 'absolute',
    left: getSpacing(16),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  rightIconAbsolute: {
    position: 'absolute',
    right: getSpacing(16),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  textWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  gradientContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  innerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
});

export default CustomButton;
