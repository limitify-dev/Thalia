import React from 'react';
import {View, StyleSheet} from 'react-native';

import {
  scale,
  verticalScale,
  moderateScale,
  getSpacing,
  getBorderRadius,
} from '../../constants/responsive';

const {width} = require('react-native').Dimensions.get('window');

const PADDING = moderateScale(16);
const COLUMN_GAP = moderateScale(8);
const ROW_GAP = moderateScale(8);
const CONTENT_WIDTH = width - PADDING * 2;

const SkeletonItem = ({width, height, borderRadius = 8}) => {
  return (
    <View
      style={{
        width,
        height,
        borderRadius: getBorderRadius(borderRadius),
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      }}
    />
  );
};

const ArtworkSkeletonLoader = () => {
  return (
    <>
      <View style={styles.row}>
        <SkeletonItem
          width={(CONTENT_WIDTH - COLUMN_GAP) / 2}
          height={verticalScale(180)}
        />
        <SkeletonItem
          width={(CONTENT_WIDTH - COLUMN_GAP) / 2}
          height={verticalScale(180)}
        />
      </View>

      <View style={styles.row}>
        <SkeletonItem
          width={(CONTENT_WIDTH - COLUMN_GAP) * 0.6}
          height={verticalScale(360)}
        />

        <View style={styles.columnStack}>
          <SkeletonItem
            width={(CONTENT_WIDTH - COLUMN_GAP) * 0.4}
            height={verticalScale(176)}
          />
          <SkeletonItem
            width={(CONTENT_WIDTH - COLUMN_GAP) * 0.4}
            height={verticalScale(176)}
            style={{marginTop: ROW_GAP}}
          />
        </View>
      </View>

      <SkeletonItem
        width={CONTENT_WIDTH}
        height={verticalScale(220)}
        style={{marginTop: ROW_GAP}}
      />
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ROW_GAP,
  },
  columnStack: {
    flexDirection: 'column',
  },
});

export default ArtworkSkeletonLoader;
