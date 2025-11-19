import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {colors} from '../constants/colors';
import {useTheme} from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const {mode, toggleMode} = useTheme();
  const currentColors = colors[mode];

  return (
    <TouchableOpacity
      style={[styles.button, {backgroundColor: currentColors.primary}]}
      onPress={toggleMode}>
      <Text style={[styles.text, {color: currentColors.text}]}>
        {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  text: {
    fontSize: 16,
  },
});

export default ThemeToggle;
