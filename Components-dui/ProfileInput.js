import React from 'react';
import {StyleSheet, Text, View, TextInput, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../contexts/ThemeContext';
import {colors} from '../constants/colors';
import {
  getSpacing,
  getFontSize,
  getBorderRadius,
  getInputHeight,
  platformSpecific,
} from '../constants/responsive';

const ProfileInput = ({
  label,
  iconName: IconComponent,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  editable = true,

  // Custom Colors
  inputTextColor,
  placeholderTextColor,
  labelColor,
  iconColor,
  backgroundColorStart,
  backgroundColorEnd,

  ...props
}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];

  const finalIconColor = iconColor || currentColors.text;
  const finalLabelColor = labelColor || currentColors.text;
  const finalPlaceholderColor =
    placeholderTextColor || currentColors.placeholder;
  const finalInputTextColor = inputTextColor || currentColors.text;

  const gradientStart =
    backgroundColorStart ||
    (mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.7)');
  const gradientEnd =
    backgroundColorEnd ||
    (mode === 'dark'
      ? 'rgba(255, 255, 255, 0.07)'
      : 'rgba(255, 255, 255, 0.4)');

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, {color: finalLabelColor}]}>{label}</Text>
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.inputContainer}>
        <TextInput
          style={[styles.input, {color: finalInputTextColor}]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={finalPlaceholderColor}
          keyboardType={keyboardType || 'default'}
          editable={editable}
          {...props}
        />
        {IconComponent && (
          <View style={styles.iconWrapper}>
            <IconComponent width={22} height={22} fill={iconColor} />
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: getSpacing(14),
  },
  inputLabel: {
    fontSize: getFontSize(14),
    marginBottom: getSpacing(8),
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: getBorderRadius(16),
    paddingHorizontal: platformSpecific(getSpacing(0), getSpacing(10)),
    paddingVertical: platformSpecific(getSpacing(0), getSpacing(8)),
    height: getInputHeight(),
  },
  input: {
    flex: 1,
    fontSize: getFontSize(16),
    paddingVertical: platformSpecific(getSpacing(5), getSpacing(8)),
    paddingRight: getSpacing(10),
    paddingLeft: platformSpecific(getSpacing(25), getSpacing(10)),
    height: '100%',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: getSpacing(10),
    marginRight: platformSpecific(getSpacing(16), 0),
  },
});

export default ProfileInput;
