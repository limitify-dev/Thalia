import React from 'react';
import {StyleSheet, TouchableOpacity, useColorScheme, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {getBorderRadius, getSpacing} from '../constants/responsive';
import {colors} from '../constants/colors';

const GradientItem = ({onPress, children, style}) => {
  const scheme = useColorScheme();

  const themeColors = colors[scheme || 'light'];

  return onPress ? (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
        colors={
          scheme === 'dark'
            ? ['#d9dae0', '#d9dee5']
            : ['rgba(255, 255, 255, 0.34)', 'rgba(255, 255, 255, 0.09)']
        }
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.container, style]}>
        {children}
      </LinearGradient>
    </TouchableOpacity>
  ) : (
    <LinearGradient
      colors={
        scheme === 'dark'
          ? ['#d9dae0', '#d9dee5']
          : ['rgba(255, 255, 255, 0.34)', 'rgba(255, 255, 255, 0.09)']
      }
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[styles.container, style]}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getSpacing(16),
    borderRadius: getBorderRadius(12),
    marginBottom: getSpacing(8),
  },
});

export default GradientItem;
