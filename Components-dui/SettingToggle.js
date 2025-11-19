import React from 'react';
import {View, Text, StyleSheet, Switch, Platform} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import {colors} from '../constants/colors';

const SettingToggle = ({title, subtitle, value, onValueChange}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, {color: currentColors.titleColor}]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, {color: currentColors.container}]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: mode === 'dark' ? 'rgb(217, 217, 217)' : 'rgb(194, 194, 194)', // Off state colors
          true: mode === 'dark' ? 'rgb(37, 124, 254)' : 'rgb(52, 69, 111)', // On state colors
        }}
        thumbColor="#FFFFFF" // Consistent white thumb
        ios_backgroundColor={
          mode === 'dark' ? 'rgb(217, 217, 217)' : 'rgb(194, 194, 194)'
        }
        style={styles.switch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  switch: {
    transform: Platform.OS === 'ios' ? [{scaleX: 0.9}, {scaleY: 0.9}] : [],
  },
});

export default SettingToggle;
