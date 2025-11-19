import React from 'react';
import {View, StyleSheet} from 'react-native';
import withGradientBackground from '../GradientHOC';
import {
  getSpacing,
  getBorderRadius,
  getThumbnailSize,
} from '../../constants/responsive';
import {useTheme} from '../../hooks/useTheme';
import {colors} from '../../constants/colors';

const GalleryCardSkeleton = () => {
  const {mode} = useTheme();
  const currentColors = colors[mode];
  return (
    <View style={[styles.card, {backgroundColor: currentColors.container}]}>
      <View
        style={[styles.image, {backgroundColor: currentColors.skeletonColor}]}
      />
      <View style={[styles.info, {backgroundColor: currentColors.container}]}>
        <View
          style={[styles.title, {backgroundColor: currentColors.skeletonColor}]}
        />
        <View
          style={[styles.line, {backgroundColor: currentColors.skeletonColor}]}
        />
        <View
          style={[styles.line, {backgroundColor: currentColors.skeletonColor}]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: getSpacing(12),
    borderRadius: getBorderRadius(12),
    backgroundColor: '#3c2e5f',
    marginBottom: getSpacing(16),
  },
  image: {
    width: getThumbnailSize(),
    height: getThumbnailSize(),
    borderRadius: getBorderRadius(8),
    backgroundColor: '#695f85',
    marginRight: getSpacing(12),
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    width: '70%',
    height: getSpacing(16),
    backgroundColor: '#3c2e5f',
    borderRadius: getBorderRadius(4),
    marginBottom: getSpacing(8),
  },
  line: {
    width: '50%',
    height: getSpacing(14),
    backgroundColor: '#695f85',
    borderRadius: getBorderRadius(4),
    marginBottom: getSpacing(6),
  },
});

export default withGradientBackground(GalleryCardSkeleton);
