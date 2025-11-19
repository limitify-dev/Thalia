import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {colors} from '../constants/colors';
import {useTheme} from '../contexts/ThemeContext';

const CustomCheckbox = ({checked, onPress}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View
        style={[
          styles.checkbox,
          {borderColor: currentColors.checkboxBorder},
          checked && styles.checked,
        ]}>
        {checked && (
          <View
            style={[styles.checkmark, {borderColor: currentColors.white}]}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: 'transparent',
  },
  checkmark: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{rotate: '-45deg'}],
    marginTop: -2,
  },
});

export default CustomCheckbox;
