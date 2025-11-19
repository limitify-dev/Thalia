import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import {
  scale,
  verticalScale,
  moderateScale,
  getSpacing,
  getFontSize,
  getIconSize,
  getCardWidth,
  getAvatarSize,
  getBorderRadius,
} from '../../constants/responsive';
import {useTheme} from '../../hooks/useTheme';
import {colors} from '../../constants/colors';

const NotificationCardSkeleton = () => {
  const {mode} = useTheme();
  const currentColors = colors[mode];

  return (
    <View
      style={[
        styles.cardContainer,
        {backgroundColor: currentColors.skeletonColor},
      ]}>
      <View
        style={[
          styles.iconPlaceholder,
          {backgroundColor: currentColors.skeletonColor},
        ]}
      />

      <View
        style={[
          styles.contentContainer,
          {backgroundColor: currentColors.skeletonColor},
        ]}>
        <View
          style={[
            styles.titlePlaceholder,
            {backgroundColor: currentColors.skeletonColor},
          ]}
        />
        <View
          style={[
            styles.subtitlePlaceholder,
            {backgroundColor: currentColors.skeletonColor},
          ]}
        />
        <View
          style={[
            styles.timestampPlaceholder,
            {backgroundColor: currentColors.skeletonColor},
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: getCardWidth(),
    flexDirection: 'row',
    padding: getSpacing(16),
    backgroundColor: '#695f85',
    borderRadius: getBorderRadius(12),
    marginHorizontal: getSpacing(16),
    marginVertical: getSpacing(8),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  iconPlaceholder: {
    width: getAvatarSize(),
    height: getAvatarSize(),
    borderRadius: getBorderRadius(999),
    backgroundColor: '#3c2e5f',
    marginRight: getSpacing(12),
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titlePlaceholder: {
    width: '80%',
    height: getFontSize(16),
    backgroundColor: '#695f85',
    borderRadius: getBorderRadius(4),
    marginBottom: getSpacing(6),
  },
  subtitlePlaceholder: {
    width: '100%',
    height: getFontSize(14),
    backgroundColor: '#3c2e5f',
    borderRadius: getBorderRadius(4),
    marginBottom: getSpacing(10),
  },
  timestampPlaceholder: {
    width: '30%',
    height: getFontSize(12),
    backgroundColor: '#695f85',
    borderRadius: getBorderRadius(4),
  },
});

export default NotificationCardSkeleton;
