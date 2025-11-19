import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, gredientColors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';

const {width, height} = Dimensions.get('window');

const SkeletonBox = ({style}) => <View style={[styles.skeletonBox, style]} />;

const SkeletonExhibitionsCard = () => {
   const {mode} = useTheme();
    const currentColors = colors[mode];
  return (
    <View style={styles.exhibitionCard}>
      <LinearGradient
        colors={gredientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradientBackground}>
        <View style={[styles.exhibitionImage,{backgroundColor:currentColors.aiImageBg2}]} />

        <View style={styles.exhibitionContent}>
          <View style={styles.exhibitionHeader}>
            <SkeletonBox style={styles.titleSkeleton} />
            <SkeletonBox style={styles.iconSkeleton} />
          </View>

          <View style={styles.detailRow}>
            <SkeletonBox style={styles.iconSkeleton} />
            <SkeletonBox style={styles.textSkeleton} />
          </View>

          <View style={styles.detailRow}>
            <SkeletonBox style={styles.iconSkeleton} />
            <SkeletonBox style={styles.textSkeleton} />
          </View>

          <View style={styles.detailRow}>
            <SkeletonBox style={styles.iconSkeleton} />
            <SkeletonBox style={styles.textSkeleton} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  exhibitionCard: {
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    width: width * 0.92,
    height: height * 0.17,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  gradientBackground: {
    flexDirection: 'row',
    width: '100%',
  },
  exhibitionImage: {
    width: 110,
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  exhibitionContent: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  exhibitionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width * 0.03,
  },
  skeletonBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  titleSkeleton: {
    height: 14,
    width: '60%',
    borderRadius: 6,
  },
  iconSkeleton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  textSkeleton: {
    height: 13,
    width: '50%',
    marginLeft: 8,
    borderRadius: 4,
  },
});

export default SkeletonExhibitionsCard;
