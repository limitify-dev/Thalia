import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../hooks/useTheme';
import {
  colors,
  customBorderColor,
  gradientColorsInput,
} from '../constants/colors';
import {
  getFontSize,
  getSpacing,
  getInputHeight,
  getBorderRadius,
  getIconSize,
} from '../constants/responsive';
import {useTranslation} from '../utils/translate';

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  variant = 'gradient',
  error,
  iconName,
  iconSize = 20,
  iconColor,
  iconComponent,
  labelColor,
  inputTextColor,
  placeholderTextColor,
  showPasswordIcon,
  hidePasswordIcon,
  inputBackground,
  borderRadius = 20,
  borderWidth = 0,
  borderColor = '',
  ...props
}) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setPasswordVisible(prev => !prev);
  const {t} = useTranslation();
  const {mode} = useTheme();

  const currentColors = colors[mode];

  const themePlaceholderColor =
    placeholderTextColor ||
    (mode === 'dark' ? 'rgb(175,175,175)' : 'rgb(78,78,78)');

  const themeInputTextColor =
    inputTextColor || (mode === 'dark' ? 'white' : 'rgba(0, 0, 0, 0.9)');

  const themeBorderColor =
    borderColor || currentColors.searchBorder || 'transparent';

  const themeIconColor =
    iconColor || (mode === 'dark' ? 'rgb(175,175,175)' : 'rgb(78,78,78)');

  const renderInput = () => {
    const inputElement = (
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor:
              inputBackground || currentColors.gradientColorsInput,
            borderWidth: borderWidth,
            borderColor:
              borderColor ||
              (mode === 'light'
                ? customBorderColor.light
                : customBorderColor.dark),

            borderRadius: getBorderRadius(borderRadius),
          },
        ]}>
        {iconName && !iconComponent && (
          <Icon
            name={iconName}
            size={iconSize}
            color={themeIconColor}
            style={styles.leftIcon}
          />
        )}
        {iconComponent && (
          <View style={styles.leftIcon}>
            {React.cloneElement(iconComponent, {
              width: iconSize,
              height: iconSize,
              color: themeIconColor,
            })}
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            {
              color: themeInputTextColor,
              backgroundColor: 'transparent',
            },
            variant === 'outline' && styles.outlineInput,
            error && styles.inputError,
            (iconName || iconComponent) && styles.inputWithIcon,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={t(placeholder)}
          placeholderTextColor={themePlaceholderColor}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          textContentType={props.textContentType || 'none'}
          autoComplete={props.autoComplete || 'off'}
          importantForAutofill={props.importantForAutofill || 'no'}
          {...props}
        />
        {secureTextEntry && (showPasswordIcon || hidePasswordIcon) && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}>
            {isPasswordVisible
              ? React.cloneElement(showPasswordIcon, {
                  width: iconSize,
                  height: iconSize,
                  color: themeIconColor,
                })
              : React.cloneElement(hidePasswordIcon, {
                  width: iconSize,
                  height: iconSize,
                  color: themeIconColor,
                })}
          </TouchableOpacity>
        )}
      </View>
    );

    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={gradientColorsInput[mode]}
          start={{x: 0.2, y: 0}}
          end={{x: 1, y: 1}}
          style={[
            styles.gradientBorder,
            {borderRadius: getBorderRadius(borderRadius)},
          ]}>
          <LinearGradient
            colors={gradientColorsInput[mode]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[
              styles.innerContainer,
              {borderRadius: getBorderRadius(borderRadius)},
              {
                borderWidth: borderWidth,
                borderColor:
                  borderColor ||
                  (mode === 'light'
                    ? customBorderColor.light
                    : customBorderColor.dark),
              },
              error && styles.gradientError,
            ]}>
            {inputElement}
          </LinearGradient>
        </LinearGradient>
      );
    }

    return (
      <View
        style={[
          styles.outlineContainer,
          {
            borderRadius: getBorderRadius(borderRadius),
            borderWidth: borderWidth,
            borderColor:
              borderColor ||
              (mode === 'light'
                ? customBorderColor.light
                : customBorderColor.dark),
          },
          error && styles.outlineError,
        ]}>
        {inputElement}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text
        style={[styles.label, {color: labelColor}, error && styles.labelError]}>
        {t(label)}
      </Text>
      {renderInput()}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: getSpacing(8),
  },
  label: {
    fontSize: getFontSize(14),
    marginBottom: getSpacing(12),
    fontWeight: '400',
    left: getSpacing(5),
    fontFamily: 'Poppins-Regular',
  },
  labelError: {
    color: '#FF4D4F',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing(14),
    height: getInputHeight(56),
    // borderRadius: 40,
    backgroundColor: gradientColorsInput,
  },
  input: {
    flex: 1,
    fontSize: getFontSize(16),
    color: 'white',
    backgroundColor: 'transparent',
    paddingLeft: getSpacing(10),
    textAlign: 'left',
  },
  outlineContainer: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  gradientError: {
    borderWidth: 1,
    borderColor: '#FF4D4F',
  },
  outlineError: {
    borderColor: '#FF4D4F',
  },
  errorText: {
    color: '#FF4D4F',
    fontSize: getFontSize(12),
    marginTop: getSpacing(4),
    marginLeft: getSpacing(4),
  },
  gradientBorder: {
    // padding: 2,
    borderRadius: 40,
    overflow: 'hidden',
  },
  innerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 40,
    overflow: 'hidden',
  },
});
