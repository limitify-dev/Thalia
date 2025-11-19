import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';

const {width, height} = Dimensions.get('window');

const DetailScreenSkeleton = () => {
  const {mode} = useTheme();
  const currentColors = colors[mode];
  const gradientBackgroundBoxColors = {
    light: ['#cdd5e2', '#cdd5e2'],
    dark: ['#5f547c', '#372959'],
  };

  return (
    <View style={[styles.container]}>
      <View style={styles.header}>
        <View
          style={[
            styles.skeletonButton,
            {backgroundColor: currentColors.skeletonBackground},
          ]}
        />
        <View style={styles.headerRight}>
          <View
            style={[
              styles.skeletonButton,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
          <View
            style={[
              styles.skeletonButton,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
        </View>
      </View>

      {/* Image Gallery Skeleton */}
      <View
        style={[
          styles.imageGallerySkeleton,
          {backgroundColor: currentColors.skeletonBackground},
        ]}
      />

      {/* Gallery Info Skeleton */}
      <View style={styles.galleryInfoSkeleton}>
        <View
          style={[
            styles.skeletonTextLarge,
            {backgroundColor: currentColors.skeletonBackground},
          ]}
        />
        <View style={styles.ratingContainerSkeleton}>
          <View
            style={[
              styles.skeletonIcon,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
          <View
            style={[
              styles.skeletonTextMedium,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
          <View
            style={[
              styles.skeletonTextSmall,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
        </View>
        <View style={styles.infoRowSkeleton}>
          <View
            style={[
              styles.skeletonIconSmall,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
          <View
            style={[
              styles.skeletonTextMedium,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
        </View>
        <View style={styles.infoRowSkeleton}>
          <View
            style={[
              styles.skeletonIconSmall,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
          <View
            style={[
              styles.skeletonTextMedium,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
        </View>
        <View style={styles.infoRowSkeleton}>
          <View
            style={[
              styles.skeletonIconSmall,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
          <View
            style={[
              styles.skeletonTextMedium,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
        </View>
      </View>

      {/* Overview Skeleton */}
      <View style={styles.overviewSkeleton}>
        <View
          style={[
            styles.divider,
            {backgroundColor: currentColors.skeletonDivider},
          ]}
        />
        <View
          style={[
            styles.skeletonTitle,
            {backgroundColor: currentColors.skeletonBackground},
          ]}
        />
        <View
          style={[
            styles.skeletonTextLine,
            {backgroundColor: currentColors.skeletonBackground},
          ]}
        />
        <View
          style={[
            styles.skeletonTextLine,
            {backgroundColor: currentColors.skeletonBackground},
          ]}
        />
        <View
          style={[
            styles.skeletonTextLineShort,
            {backgroundColor: currentColors.skeletonBackground},
          ]}
        />
        <View
          style={[
            styles.skeletonShowMore,
            {backgroundColor: currentColors.skeletonBackground},
          ]}
        />
      </View>

      {/* Location Skeleton */}
      <View style={styles.locationSkeleton}>
        <View
          style={[
            styles.skeletonTitle,
            {backgroundColor: currentColors.skeletonBackground},
          ]}
        />
        <View style={styles.locationInfoSkeleton}>
          <View
            style={[
              styles.skeletonIconSmall,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
          <View
            style={[
              styles.skeletonTextMedium,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
        </View>
        <View
          style={[
            styles.mapSkeleton,
            {backgroundColor: currentColors.skeletonBackground},
          ]}
        />
      </View>

      {/* Reviews Skeleton */}
      <LinearGradient
        colors={gradientBackgroundBoxColors[mode]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.reviewSkeleton}>
        <View style={styles.reviewHeaderSkeleton}>
          <View
            style={[
              styles.skeletonIcon,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
          <View
            style={[
              styles.skeletonTextMedium,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
          <View
            style={[
              styles.skeletonTextSmall,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
        </View>
        <View style={styles.reviewUserSkeleton}>
          <View
            style={[
              styles.skeletonAvatar,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
          <View
            style={[
              styles.skeletonTextMedium,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
        </View>
        <View
          style={[
            styles.skeletonTextLine,
            {backgroundColor: currentColors.skeletonBackground},
          ]}
        />
        <View
          style={[
            styles.skeletonTextLine,
            {backgroundColor: currentColors.skeletonBackground},
          ]}
        />
        <View
          style={[
            styles.skeletonTextLineShort,
            {backgroundColor: currentColors.skeletonBackground},
          ]}
        />
        <View style={styles.reviewFooterSkeleton}>
          <View
            style={[
              styles.skeletonIconSmall,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
          <View
            style={[
              styles.skeletonTextSmall,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
          <View
            style={[
              styles.skeletonTextSmall,
              {backgroundColor: currentColors.skeletonBackground},
            ]}
          />
        </View>
      </LinearGradient>

      {/* Reservation Button Skeleton */}
      <View
        style={[
          styles.reservationButtonSkeleton,
          {backgroundColor: currentColors.skeletonBackground},
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  skeletonButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  imageGallerySkeleton: {
    width: '100%',
    height: height * 0.45,
  },
  galleryInfoSkeleton: {
    padding: 20,
  },
  skeletonTextLarge: {
    height: 24,
    width: '70%',
    borderRadius: 4,
    marginBottom: 16,
  },
  ratingContainerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  skeletonTextMedium: {
    height: 16,
    width: '30%',
    borderRadius: 4,
    marginLeft: 8,
  },
  skeletonTextSmall: {
    height: 16,
    width: '20%',
    borderRadius: 4,
    marginLeft: 10,
  },
  infoRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonIconSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  overviewSkeleton: {
    padding: 20,
    paddingTop: 0,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  skeletonTitle: {
    height: 20,
    width: '30%',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonTextLine: {
    height: 14,
    width: '100%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonTextLineShort: {
    height: 14,
    width: '70%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonShowMore: {
    height: 14,
    width: '20%',
    borderRadius: 4,
    marginTop: 4,
  },
  locationSkeleton: {
    padding: 20,
  },
  locationInfoSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapSkeleton: {
    borderRadius: 12,
    height: 200,
    width: '100%',
  },
  reviewSkeleton: {
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginTop: 0,
  },
  reviewHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewUserSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewFooterSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  reservationButtonSkeleton: {
    height: 50,
    width: '70%',
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 40,
  },
});

export default DetailScreenSkeleton;