import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../contexts/ThemeContext';
import {colors} from '../constants/colors';

const AlertItem = ({iconName, title, timeAgo}) => {
  const {mode} = useTheme();
  const currentColors = colors[mode];

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name={iconName} size={24} color="#FFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, {color: currentColors.white}]}>
          {title}
        </Text>
        <Text style={[styles.timeAgo, {color: 'rgba(255, 255, 255, 0.7)'}]}>
          {timeAgo}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 4,
  },
  timeAgo: {
    fontSize: 12,
  },
});

export default AlertItem;
