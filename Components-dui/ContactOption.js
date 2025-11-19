import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../hooks/useTheme';
import {colors} from '../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import {
  getBorderRadius,
  getInputHeight,
  getSpacing,
} from '../constants/responsive';

const getIconComponent = type => {
  switch (type) {
    case 'FontAwesome':
      return FontAwesome;
    case 'MaterialCommunityIcons':
      return MaterialCommunityIcons;
    case 'Ionicons':
    default:
      return Icon;
  }
};

const ContactOption = ({
  label,
  iconName,
  iconType = 'Ionicons',
  iconColor,
  onPress,
  svgIcon: SvgIcon,
  imageIcon,
}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];
  const IconComponent = getIconComponent(iconType);
  const gradientBackgroundBoxColors = {
    light: ['#cdd5e2', '#cdd5e2'],
    dark: ['rgb(86, 78, 110)', 'rgb(61,47,96)'],
  };

  return (
    <LinearGradient
      colors={gradientBackgroundBoxColors[mode]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[
        styles.input,
        {
          borderWidth: 1,
          borderColor:
            mode === 'dark'
              ? 'rgba(255, 255, 255, 0.4)'
              : 'rgba(255, 255, 255, 0.4)',
          borderRadius: 16,
        },
      ]}>
      <TouchableOpacity
        style={[styles.container]}
        onPress={onPress}
        activeOpacity={0.7}>
        <View style={styles.iconContainer}>
          {imageIcon ? (
            <Image
              source={imageIcon}
              style={styles.imageIcon}
              resizeMode="contain"
            />
          ) : SvgIcon ? (
            <SvgIcon width={24} height={24} />
          ) : (
            <IconComponent
              name={iconName}
              size={24}
              color={iconColor || '#FFF'}
            />
          )}
        </View>
        <Text style={[styles.label, {color: currentColors.titleColor}]}>
          {label}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginBottom: 0,
  },
  input: {
    borderRadius: getBorderRadius(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  imageIcon: {
    width: 24,
    height: 24,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'left',
  },
});

export default ContactOption;
