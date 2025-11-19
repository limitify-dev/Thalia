import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../hooks/useTheme';
import {colors} from '../constants/colors';

const LanguageOption = ({title, isSelected, onPress}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={[styles.title, {color: currentColors.titleColor}]}>
        {title}
      </Text>
      {isSelected && (
        <Icon name="checkmark" size={24} color={currentColors.titleColor} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default LanguageOption;
